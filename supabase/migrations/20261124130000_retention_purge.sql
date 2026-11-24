-- =============================================================================
-- Automatic personal-data retention (PROPOSAL 24/11/2026 — NOT APPLIED).
-- Apply only after the owner's AND counsel's approval (docs/release/final/data-retention.md).
--
-- Published policy (src/content/legal.ts, privacy « How long we keep it »; forms: « Data deleted within 12 months »):
--   requests that do not lead to a subscription: 12 months at most; customers: during the subscription, then
--   12 months; invoices: as long as the law requires.
--
-- What this migration adds (additive; nothing runs by itself, no cron job, no data is changed by applying it):
--   1. contact_requests.anonymised_at + contact_requests.retention_hold (legal hold, e.g. dispute; server only);
--   2. the two « support has a message » / « trial has name + phone » checks also accept anonymised rows, and a
--      new check guarantees an anonymised row holds no name, e-mail, phone, subject or message;
--   3. private.ops_events_append_only(): the bot journal stays append-only, with ONE exception — inside the purge
--      transaction only, the free-text `reason` of an event may be blanked (nothing else, never a delete);
--   4. private.retention_runs: one log row per run, counts only (no personal data);
--   5. private.purge_expired_personal_data(p_dry_run default TRUE, p_max_rows default 500, p_retention 12 months)
--      and the service_role-only wrapper public.retention_purge(p_dry_run, p_max_rows) used by /api/cron/retention.
--
-- What a REAL run does (p_dry_run = false), for rows older than the cutoff (now() - 12 months), at most
-- p_max_rows rows per table per run:
--   * public.contact_requests (age = created_at), not an exception → ANONYMISED (row kept for statistics and for
--     the bot's journal): name, phone, subject, message → null; email → 'erased@example.invalid';
--     marketing_opt_in → false; anonymised_at → now(). Kept: kind, locale, market/country, device, plan interest,
--     consent text version, dates, invoice/review/follow-up timestamps (no personal data).
--     Its still-open lead card (new / contacted) is closed as « lost » by actor 'retention'; the free-text
--     reasons of its journal events are blanked.
--   * public.orders (age = updated_at) in draft / cancelled, never sent to a payment provider (no payment
--     reference, no webhook event) → DELETED (their order_events follow by cascade).
-- EXCEPTIONS — never touched, only counted (owner / counsel decision required, see the doc):
--   contact_requests with retention_hold, with an invoice number, whose card is « converted » (customer),
--   with marketing_opt_in (proof of consent while marketing continues), or an open / answered support ticket;
--   orders that were paid, refunded, pending, failed or linked to a payment; payment_webhook_events;
--   customers (Supabase Auth accounts: subscription + 12 months, not computable from the database today).
--
-- Safeguards: dry-run by default; refuses a cutoff more recent than 12 months; batch limit (1–5000); one run
-- at a time (advisory lock, a concurrent run returns « busy »); idempotent (anonymised rows are skipped, deleted
-- rows are gone); SELECT … FOR UPDATE SKIP LOCKED on the real path; returns and logs counts only.
--
-- ROLLBACK: supabase/rollback/20261124130000_retention_purge.rollback.sql
-- Deleted or anonymised data CANNOT be restored by any rollback: take a backup/export before the first real run.
-- =============================================================================

-- 1. Columns (server only: no privilege for anon / authenticated) -----------------
alter table public.contact_requests
  add column if not exists anonymised_at timestamptz,
  add column if not exists retention_hold boolean not null default false;
comment on column public.contact_requests.anonymised_at is
  'Set by the retention purge when the personal data of the request was erased (row kept for statistics).';
comment on column public.contact_requests.retention_hold is
  'Legal / operational hold (dispute, claim, authority request): the retention purge never touches the row.';
comment on table public.contact_requests is
  'Personal data. Retention: 12 months (private.purge_expired_personal_data), exceptions documented in docs/release/final/data-retention.md.';

-- 2. Checks that also accept anonymised rows -----------------------------------
alter table public.contact_requests drop constraint if exists contact_requests_support_has_message;
alter table public.contact_requests add constraint contact_requests_support_has_message
  check (kind <> 'support' or anonymised_at is not null
         or (message is not null and char_length(message) >= 10 and subject is not null)) not valid;
alter table public.contact_requests validate constraint contact_requests_support_has_message;

alter table public.contact_requests drop constraint if exists contact_requests_trial_has_contact;
alter table public.contact_requests add constraint contact_requests_trial_has_contact
  check (kind <> 'trial_request' or anonymised_at is not null or (name is not null and phone is not null)) not valid;
alter table public.contact_requests validate constraint contact_requests_trial_has_contact;

alter table public.contact_requests drop constraint if exists contact_requests_anonymised_is_empty;
alter table public.contact_requests add constraint contact_requests_anonymised_is_empty
  check (anonymised_at is null or (name is null and phone is null and subject is null and message is null
         and email = 'erased@example.invalid' and not marketing_opt_in)) not valid;
alter table public.contact_requests validate constraint contact_requests_anonymised_is_empty;

create index if not exists contact_requests_retention_idx
  on public.contact_requests (created_at) where anonymised_at is null;

-- 3. Journal: append-only, except blanking `reason` inside the purge transaction --
create or replace function private.ops_events_append_only() returns trigger
language plpgsql set search_path = '' as $$
begin
  -- Only private.purge_expired_personal_data() sets this transaction-local flag. It allows an UPDATE that blanks
  -- the free-text reason and changes nothing else. Deletes are never allowed.
  if tg_op = 'UPDATE'
     and current_setting('sygma.retention_purge', true) = 'on'
     and new.reason is null
     and (new.id, new.request_id, new.action, new.from_status, new.to_status, new.actor_id, new.actor_name,
          new.undoes, new.created_at)
         is not distinct from
         (old.id, old.request_id, old.action, old.from_status, old.to_status, old.actor_id, old.actor_name,
          old.undoes, old.created_at)
  then
    return new;
  end if;
  raise exception 'ops_events is append-only' using errcode = '42501';
end $$;
revoke all on function private.ops_events_append_only() from public, anon, authenticated;

-- 4. Run log (counts only) -------------------------------------------------------
create table if not exists private.retention_runs (
  id        bigint generated always as identity primary key,
  ran_at    timestamptz not null default now(),
  dry_run   boolean not null,
  cutoff    timestamptz not null,
  max_rows  integer not null,
  counts    jsonb not null,
  actor     text check (char_length(actor) <= 64)
);
comment on table private.retention_runs is
  'One row per retention purge run (dry or real). Counts only: never ids, e-mails or any personal data.';
alter table private.retention_runs enable row level security;
revoke all on private.retention_runs from public, anon, authenticated, service_role;

-- 5. The purge ------------------------------------------------------------------
create or replace function private.purge_expired_personal_data(
  p_dry_run boolean default true,
  p_max_rows integer default 500,
  p_retention interval default interval '12 months'
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_dry boolean := coalesce(p_dry_run, true);
  v_cutoff timestamptz;
  v_ids uuid[];
  v_order_ids uuid[];
  v_eligible integer;
  v_orders_eligible integer;
  v_reasons integer := 0;
  v_cards integer := 0;
  v_anon integer := 0;
  v_orders integer := 0;
  v_order_events integer := 0;
  v_kept jsonb;
  v_counts jsonb;
  v_run bigint;
begin
  if p_retention is null or p_max_rows is null then
    raise exception 'retention purge: parameters must not be null' using errcode = '22023';
  end if;
  v_cutoff := now() - p_retention;
  -- Calendar arithmetic: '12 months' is the minimum; '360 days' or '11 months' are refused.
  if v_cutoff > now() - interval '12 months' then
    raise exception 'retention purge refused: cutoff % is less than 12 months ago', v_cutoff using errcode = '22023';
  end if;
  if p_max_rows < 1 or p_max_rows > 5000 then
    raise exception 'retention purge refused: p_max_rows must be between 1 and 5000' using errcode = '22023';
  end if;
  -- One run at a time (released at the end of the transaction).
  if not pg_try_advisory_xact_lock(72592001) then
    return jsonb_build_object('ok', false, 'code', 'busy');
  end if;

  -- Expired contact requests that are exceptions (kept): counted per reason (a row may have several reasons).
  select jsonb_build_object(
           'retention_hold',     count(*) filter (where r.retention_hold),
           'invoice',            count(*) filter (where r.invoice_number is not null),
           'converted_customer', count(*) filter (where c.status = 'converted'),
           'marketing_consent',  count(*) filter (where r.marketing_opt_in),
           'open_support',       count(*) filter (where c.flow = 'support' and c.status in ('open', 'answered'))),
         count(*) filter (where not (r.retention_hold or r.invoice_number is not null or r.marketing_opt_in
                                     or coalesce(c.status = 'converted', false)
                                     or coalesce(c.flow = 'support' and c.status in ('open', 'answered'), false)))
    into v_kept, v_eligible
    from public.contact_requests r
    left join private.ops_cards c on c.request_id = r.id
   where r.created_at < v_cutoff and r.anonymised_at is null;

  select count(*) into v_orders_eligible
    from public.orders o
   where o.status in ('draft', 'cancelled') and o.updated_at < v_cutoff
     and o.payment_reference is null and o.payment_provider is null
     and not exists (select 1 from public.payment_webhook_events w where w.order_id = o.id);

  v_kept := v_kept || jsonb_build_object(
    'orders_accounting', (select count(*) from public.orders o where o.updated_at < v_cutoff) - v_orders_eligible,
    'payment_webhook_events', (select count(*) from public.payment_webhook_events w where w.received_at < v_cutoff),
    'customers_manual_review', (select count(*) from public.customers cu where cu.created_at < v_cutoff));

  if v_dry then
    -- Read-only: what a real run would do now (same predicates, same batch limit, no locks).
    select array_agg(id) into v_ids from (
      select r.id from public.contact_requests r
       where r.created_at < v_cutoff and r.anonymised_at is null
         and not r.retention_hold and r.invoice_number is null and not r.marketing_opt_in
         and not exists (select 1 from private.ops_cards c where c.request_id = r.id
                          and (c.status = 'converted' or (c.flow = 'support' and c.status in ('open', 'answered'))))
       order by r.created_at, r.id limit p_max_rows) s;
    select array_agg(id) into v_order_ids from (
      select o.id from public.orders o
       where o.status in ('draft', 'cancelled') and o.updated_at < v_cutoff
         and o.payment_reference is null and o.payment_provider is null
         and not exists (select 1 from public.payment_webhook_events w where w.order_id = o.id)
       order by o.updated_at, o.id limit p_max_rows) s;
  else
    select array_agg(id) into v_ids from (
      select r.id from public.contact_requests r
       where r.created_at < v_cutoff and r.anonymised_at is null
         and not r.retention_hold and r.invoice_number is null and not r.marketing_opt_in
         and not exists (select 1 from private.ops_cards c where c.request_id = r.id
                          and (c.status = 'converted' or (c.flow = 'support' and c.status in ('open', 'answered'))))
       order by r.created_at, r.id limit p_max_rows
       for update of r skip locked) s;
    select array_agg(id) into v_order_ids from (
      select o.id from public.orders o
       where o.status in ('draft', 'cancelled') and o.updated_at < v_cutoff
         and o.payment_reference is null and o.payment_provider is null
         and not exists (select 1 from public.payment_webhook_events w where w.order_id = o.id)
       order by o.updated_at, o.id limit p_max_rows
       for update of o skip locked) s;
  end if;
  v_ids := coalesce(v_ids, '{}');
  v_order_ids := coalesce(v_order_ids, '{}');

  if v_dry then
    v_anon := cardinality(v_ids);
    select count(*) into v_reasons from private.ops_events e where e.request_id = any (v_ids) and e.reason is not null;
    select count(*) into v_cards from private.ops_cards c
     where c.request_id = any (v_ids) and c.flow = 'lead' and c.status in ('new', 'contacted');
    v_orders := cardinality(v_order_ids);
    select count(*) into v_order_events from public.order_events oe where oe.order_id = any (v_order_ids);
  else
    perform set_config('sygma.retention_purge', 'on', true);
    update private.ops_events e set reason = null where e.request_id = any (v_ids) and e.reason is not null;
    get diagnostics v_reasons = row_count;
    perform set_config('sygma.retention_purge', '', true);

    -- Close the still-open lead cards (journal entry by « retention », no reason text). The cards are locked
    -- first, so a concurrent bot action waits and then sees the new version (its button becomes « stale »).
    perform 1 from private.ops_cards c where c.request_id = any (v_ids) for update;
    insert into private.ops_events (request_id, action, from_status, to_status, actor_name)
    select c.request_id, 'lose', c.status, 'lost', 'retention'
      from private.ops_cards c
     where c.request_id = any (v_ids) and c.flow = 'lead' and c.status in ('new', 'contacted');
    get diagnostics v_cards = row_count;
    update private.ops_cards c set status = 'lost', version = c.version + 1, updated_at = now()
     where c.request_id = any (v_ids) and c.flow = 'lead' and c.status in ('new', 'contacted');

    update public.contact_requests r
       set name = null, phone = null, subject = null, message = null,
           email = 'erased@example.invalid', marketing_opt_in = false, anonymised_at = now()
     where r.id = any (v_ids);
    get diagnostics v_anon = row_count;

    select count(*) into v_order_events from public.order_events oe where oe.order_id = any (v_order_ids);
    delete from public.orders o where o.id = any (v_order_ids);
    get diagnostics v_orders = row_count;
  end if;

  v_counts := jsonb_build_object(
    'contact_requests_eligible', v_eligible,
    'contact_requests_anonymised', v_anon,
    'ops_cards_closed', v_cards,
    'ops_events_reason_cleared', v_reasons,
    'orders_eligible', v_orders_eligible,
    'orders_deleted', v_orders,
    'order_events_deleted', v_order_events,
    'kept', v_kept);

  insert into private.retention_runs (dry_run, cutoff, max_rows, counts, actor)
  values (v_dry, v_cutoff, p_max_rows, v_counts, left(private.current_actor(), 64))
  returning id into v_run;

  return jsonb_build_object('ok', true, 'dry_run', v_dry, 'cutoff', v_cutoff, 'max_rows', p_max_rows,
                            'run_id', v_run, 'counts', v_counts);
end;
$$;
revoke all on function private.purge_expired_personal_data(boolean, integer, interval) from public, anon, authenticated, service_role;

-- Data API entry point for /api/cron/retention: service_role only, retention fixed at 12 months.
create or replace function public.retention_purge(p_dry_run boolean default true, p_max_rows integer default 500)
returns jsonb language sql security definer set search_path = '' as $$
  select private.purge_expired_personal_data(coalesce(p_dry_run, true), p_max_rows, interval '12 months')
$$;
revoke all on function public.retention_purge(boolean, integer) from public, anon, authenticated;
grant execute on function public.retention_purge(boolean, integer) to service_role;
