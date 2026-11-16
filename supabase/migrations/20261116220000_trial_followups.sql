-- Trial e-mails (owner approval 16/11/2026): « Essai envoyé » in Telegram sends the « trial started »
-- e-mail; 24 h later a follow-up presents the three plans. Additive only: one nullable column and two
-- service_role-only functions. The time the trial was given is the « contact » event of the card.
alter table public.contact_requests
  add column if not exists trial_followup_sent_at timestamptz;
comment on column public.contact_requests.trial_followup_sent_at is 'When the 24 h trial follow-up e-mail was sent (once per trial request).';
-- No privilege for anon/authenticated on this column (server only).

-- Claims (marks as sent) the trial requests whose trial was given at least p_after ago (latest not-undone
-- « contact » event, less than 7 days old), still in « contacted » (not converted, not lost), not yet followed up.
create or replace function public.ops_trial_followup_claim_due(p_after interval default interval '24 hours', p_limit integer default 25)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v jsonb;
begin
  with due as (
    select r.id
      from public.contact_requests r
      join private.ops_cards c on c.request_id = r.id
     where r.kind = 'trial_request'
       and c.status = 'contacted'
       and r.trial_followup_sent_at is null
       and exists (
         select 1 from private.ops_events e
          where e.request_id = r.id and e.action = 'contact'
            and e.created_at <= now() - p_after
            and e.created_at > now() - interval '7 days'
            and not exists (select 1 from private.ops_events u where u.undoes = e.id))
     order by r.created_at
     limit greatest(1, least(p_limit, 100))
     for update of r skip locked
  ), claimed as (
    update public.contact_requests r set trial_followup_sent_at = now()
      from due where r.id = due.id
    returning r.id, r.email, r.name
  )
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'email', email, 'name', name)), '[]'::jsonb) into v from claimed;
  return v;
end;
$$;

-- Gives a request back to the queue when its e-mail could not be sent (retried at the next run).
create or replace function public.ops_trial_followup_release(p_request uuid) returns void
language sql security definer set search_path = '' as $$
  update public.contact_requests set trial_followup_sent_at = null where id = p_request
$$;

revoke all on function public.ops_trial_followup_claim_due(interval, integer), public.ops_trial_followup_release(uuid) from public, anon, authenticated;
grant execute on function public.ops_trial_followup_claim_due(interval, integer), public.ops_trial_followup_release(uuid) to service_role;
