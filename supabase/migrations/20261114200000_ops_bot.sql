-- SYGMA Operations Bot (Telegram) — step 1: pre-registrations, trial requests and support tickets.
-- Additive only: new tables in the non-exposed `private` schema, new RPC functions in `public`
-- that ONLY the service_role may execute. anon / authenticated get no access at all.
-- The database is the source of truth; Telegram is a remote control.

-- ---------------------------------------------------------------- tables
create table private.ops_settings (
  key        text primary key check (key ~ '^[a-z_]{2,40}$'),
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table private.ops_admins (
  telegram_id bigint primary key,
  name        text not null check (char_length(name) between 1 and 80),
  role        text not null check (role in ('admin', 'seller')),
  active      boolean not null default true,
  added_by    bigint,
  added_at    timestamptz not null default now()
);

-- One live card per request (pre-registration, trial request or support ticket).
create table private.ops_cards (
  request_id  uuid primary key references public.contact_requests (id) on delete cascade,
  flow        text not null check (flow in ('lead', 'support')),
  status      text not null,
  version     integer not null default 1,
  chat_id     bigint,
  thread_id   integer,
  message_id  integer,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint ops_cards_status_valid check (
    (flow = 'lead' and status in ('new', 'contacted', 'converted', 'lost'))
    or (flow = 'support' and status in ('open', 'answered', 'closed'))
  )
);
create index ops_cards_status_idx on private.ops_cards (flow, status);

-- Append-only journal: who did what, when, from which state to which state.
create table private.ops_events (
  id          bigint generated always as identity primary key,
  request_id  uuid not null references private.ops_cards (request_id) on delete cascade,
  action      text not null check (action in ('create', 'contact', 'convert', 'lose', 'reopen', 'answer', 'close', 'undo')),
  from_status text,
  to_status   text not null,
  actor_id    bigint,
  actor_name  text,
  reason      text check (char_length(reason) <= 300),
  undoes      bigint references private.ops_events (id),
  created_at  timestamptz not null default now()
);
create index ops_events_request_idx on private.ops_events (request_id, id desc);
create unique index ops_events_undo_once on private.ops_events (undoes) where undoes is not null;

create or replace function private.ops_events_append_only() returns trigger language plpgsql as $$
begin
  raise exception 'ops_events is append-only' using errcode = '42501';
end $$;
create trigger ops_events_no_update before update or delete on private.ops_events
  for each row execute function private.ops_events_append_only();

alter table private.ops_settings enable row level security;
alter table private.ops_admins   enable row level security;
alter table private.ops_cards    enable row level security;
alter table private.ops_events   enable row level security;
revoke all on private.ops_settings, private.ops_admins, private.ops_cards, private.ops_events from public, anon, authenticated;

-- ---------------------------------------------------------------- helpers
create or replace function private.ops_role(p_actor bigint) returns text
language sql stable security definer set search_path = '' as $$
  select role from private.ops_admins where telegram_id = p_actor and active
$$;

create or replace function private.ops_card_json(p_request uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'request', jsonb_build_object(
      'id', r.id, 'kind', r.kind, 'name', r.name, 'email', r.email, 'phone', r.phone,
      'market', r.market_code, 'subject', r.subject, 'message', r.message,
      'tier', r.interest_tier, 'term', r.interest_term, 'streams', r.interest_streams,
      'device', r.preferred_device, 'marketing', r.marketing_opt_in, 'created_at', r.created_at),
    'card', jsonb_build_object(
      'flow', c.flow, 'status', c.status, 'version', c.version,
      'chat_id', c.chat_id, 'thread_id', c.thread_id, 'message_id', c.message_id),
    'events', coalesce((
      select jsonb_agg(e order by e.id) from (
        select ev.id, ev.action, ev.from_status, ev.to_status, ev.actor_name, ev.reason, ev.undoes, ev.created_at,
               exists (select 1 from private.ops_events u where u.undoes = ev.id) as undone
          from private.ops_events ev where ev.request_id = r.id order by ev.id desc limit 8
      ) e), '[]'::jsonb)
  )
  from public.contact_requests r join private.ops_cards c on c.request_id = r.id
  where r.id = p_request
$$;

-- ---------------------------------------------------------------- RPC (service_role only)
-- Settings (group chat id, topic thread ids, timezone).
create or replace function public.ops_get_settings() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) from private.ops_settings
$$;

create or replace function public.ops_set_topic(p_actor bigint, p_topic text, p_chat bigint, p_thread integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if private.ops_role(p_actor) is distinct from 'admin' then return jsonb_build_object('ok', false, 'code', 'forbidden'); end if;
  if p_topic not in ('commandes', 'paiements', 'livraisons', 'support', 'alertes') then
    return jsonb_build_object('ok', false, 'code', 'unknown_topic');
  end if;
  insert into private.ops_settings (key, value) values ('chat_id', to_jsonb(p_chat))
    on conflict (key) do update set value = excluded.value, updated_at = now();
  insert into private.ops_settings (key, value) values ('thread_' || p_topic, to_jsonb(p_thread))
    on conflict (key) do update set value = excluded.value, updated_at = now();
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.ops_actor_role(p_actor bigint) returns text
language sql stable security definer set search_path = '' as $$ select private.ops_role(p_actor) $$;

create or replace function public.ops_add_admin(p_actor bigint, p_id bigint, p_role text, p_name text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if private.ops_role(p_actor) is distinct from 'admin' then return jsonb_build_object('ok', false, 'code', 'forbidden'); end if;
  if p_role not in ('admin', 'seller') then return jsonb_build_object('ok', false, 'code', 'bad_role'); end if;
  insert into private.ops_admins (telegram_id, name, role, added_by) values (p_id, left(p_name, 80), p_role, p_actor)
    on conflict (telegram_id) do update set name = excluded.name, role = excluded.role, active = true;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.ops_remove_admin(p_actor bigint, p_id bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if private.ops_role(p_actor) is distinct from 'admin' then return jsonb_build_object('ok', false, 'code', 'forbidden'); end if;
  if p_id = p_actor then return jsonb_build_object('ok', false, 'code', 'cannot_remove_self'); end if;
  update private.ops_admins set active = false where telegram_id = p_id;
  return jsonb_build_object('ok', true);
end $$;

-- Most recent request for an email + kind (the website cannot read requests back).
create or replace function public.ops_find_request(p_kind text, p_email text) returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.contact_requests
   where kind::text = p_kind and lower(email) = lower(p_email) and created_at > now() - interval '10 minutes'
   order by created_at desc limit 1
$$;

-- Creates the card row (idempotent) and returns the data to render it.
create or replace function public.ops_card_open(p_request uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_kind text;
begin
  select kind::text into v_kind from public.contact_requests where id = p_request;
  if v_kind is null then return null; end if;
  insert into private.ops_cards (request_id, flow, status)
  values (p_request, case when v_kind = 'support' then 'support' else 'lead' end,
          case when v_kind = 'support' then 'open' else 'new' end)
  on conflict (request_id) do nothing;
  if found then
    insert into private.ops_events (request_id, action, from_status, to_status, actor_name)
    select p_request, 'create', null, status, 'site' from private.ops_cards where request_id = p_request;
  end if;
  return private.ops_card_json(p_request);
end $$;

create or replace function public.ops_card_attach(p_request uuid, p_chat bigint, p_thread integer, p_message integer) returns void
language sql security definer set search_path = '' as $$
  update private.ops_cards set chat_id = p_chat, thread_id = p_thread, message_id = p_message, updated_at = now()
   where request_id = p_request
$$;

create or replace function public.ops_card_get(p_request uuid) returns jsonb
language sql stable security definer set search_path = '' as $$ select private.ops_card_json(p_request) $$;

-- The state machine. Optimistic lock on `version`: a stale button (double click, two admins)
-- changes nothing and returns the current card. Undo within 10 minutes for everyone,
-- later for admins only (the bot asks for confirmation).
create or replace function public.ops_apply(
  p_request uuid, p_version integer, p_action text, p_actor bigint, p_actor_name text, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_role text := private.ops_role(p_actor);
  c private.ops_cards%rowtype;
  v_to text;
  v_last private.ops_events%rowtype;
  v_undoes bigint;
begin
  if v_role is null then return jsonb_build_object('ok', false, 'code', 'forbidden'); end if;
  select * into c from private.ops_cards where request_id = p_request for update;
  if not found then return jsonb_build_object('ok', false, 'code', 'not_found'); end if;
  if c.version <> p_version then
    return jsonb_build_object('ok', false, 'code', 'stale', 'card', private.ops_card_json(p_request));
  end if;

  if p_action = 'undo' then
    select e.* into v_last from private.ops_events e
     where e.request_id = p_request and e.action not in ('create', 'undo')
       and not exists (select 1 from private.ops_events u where u.undoes = e.id)
     order by e.id desc limit 1;
    if not found or v_last.to_status <> c.status then
      return jsonb_build_object('ok', false, 'code', 'nothing_to_undo', 'card', private.ops_card_json(p_request));
    end if;
    if v_last.created_at < now() - interval '10 minutes' and v_role <> 'admin' then
      return jsonb_build_object('ok', false, 'code', 'admin_only');
    end if;
    v_to := v_last.from_status; v_undoes := v_last.id;
  else
    v_to := case
      when c.flow = 'lead' and p_action = 'contact' and c.status = 'new' then 'contacted'
      when c.flow = 'lead' and p_action = 'convert' and c.status in ('new', 'contacted') then 'converted'
      when c.flow = 'lead' and p_action = 'lose' and c.status in ('new', 'contacted') then 'lost'
      when c.flow = 'lead' and p_action = 'reopen' and c.status = 'lost' then 'new'
      when c.flow = 'lead' and p_action = 'reopen' and c.status = 'converted' and v_role = 'admin' then 'contacted'
      when c.flow = 'support' and p_action = 'answer' and c.status = 'open' then 'answered'
      when c.flow = 'support' and p_action = 'close' and c.status in ('open', 'answered') then 'closed'
      when c.flow = 'support' and p_action = 'reopen' and c.status = 'closed' then 'open'
      else null end;
    if v_to is null then
      return jsonb_build_object('ok', false, 'code', 'not_allowed', 'card', private.ops_card_json(p_request));
    end if;
  end if;

  update private.ops_cards set status = v_to, version = version + 1, updated_at = now() where request_id = p_request;
  insert into private.ops_events (request_id, action, from_status, to_status, actor_id, actor_name, reason, undoes)
  values (p_request, p_action, c.status, v_to, p_actor, left(coalesce(p_actor_name, '?'), 80), left(p_reason, 300), v_undoes);
  return jsonb_build_object('ok', true, 'card', private.ops_card_json(p_request));
end $$;

-- /attente — open items, oldest first.
create or replace function public.ops_pending(p_limit integer default 20) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select r.id, r.kind, r.name, r.email, c.status, c.created_at, c.chat_id, c.message_id
      from private.ops_cards c join public.contact_requests r on r.id = c.request_id
     where c.status in ('new', 'contacted', 'open')
     order by c.created_at limit greatest(1, least(p_limit, 50))
  ) x
$$;

-- /stats — counts since a given instant.
create or replace function public.ops_stats(p_since timestamptz) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'waitlist', (select count(*) from public.contact_requests where kind = 'launch_waitlist' and created_at >= p_since),
    'trials', (select count(*) from public.contact_requests where kind = 'trial_request' and created_at >= p_since),
    'support', (select count(*) from public.contact_requests where kind = 'support' and created_at >= p_since),
    'contacted', (select count(*) from private.ops_events where action = 'contact' and created_at >= p_since),
    'converted', (select count(*) from private.ops_events where action = 'convert' and created_at >= p_since),
    'pending', (select count(*) from private.ops_cards where status in ('new', 'contacted', 'open'))
  )
$$;

-- Least privilege: only the server (service_role) may call these functions.
do $$
declare f text;
begin
  foreach f in array array[
    'public.ops_get_settings()', 'public.ops_set_topic(bigint, text, bigint, integer)', 'public.ops_actor_role(bigint)',
    'public.ops_add_admin(bigint, bigint, text, text)', 'public.ops_remove_admin(bigint, bigint)',
    'public.ops_find_request(text, text)', 'public.ops_card_open(uuid)', 'public.ops_card_attach(uuid, bigint, integer, integer)',
    'public.ops_card_get(uuid)', 'public.ops_apply(uuid, integer, text, bigint, text, text)',
    'public.ops_pending(integer)', 'public.ops_stats(timestamptz)']
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
revoke all on function private.ops_role(bigint), private.ops_card_json(uuid) from public, anon, authenticated;
