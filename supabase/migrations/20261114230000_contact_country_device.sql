-- Exact country and precise device of a request (owner approval 14/11/2026).
-- Non-destructive: two nullable columns; existing rows and columns are untouched
-- (market_code and preferred_device keep their meaning: market zone and device category).
alter table public.contact_requests
  add column if not exists country_code text
    check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  add column if not exists device_detail text
    check (device_detail is null or device_detail in (
      'smart_tv', 'android_tv', 'fire_tv', 'apple_tv', 'tv_box', 'android_mobile', 'ios_mobile', 'computer', 'browser'));

comment on column public.contact_requests.country_code is 'Country chosen by the visitor (ISO 3166-1 alpha-2).';
comment on column public.contact_requests.device_detail is 'Precise device chosen at pre-registration (preferred_device holds its category).';

-- Explicit, column-level privilege (no automatic exposure, insert only, no read).
grant insert (country_code, device_detail) on public.contact_requests to anon, authenticated;

-- Operations bot: include both fields in the card data.
create or replace function private.ops_card_json(p_request uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'request', jsonb_build_object(
      'id', r.id, 'kind', r.kind, 'name', r.name, 'email', r.email, 'phone', r.phone,
      'market', r.market_code, 'country', r.country_code, 'subject', r.subject, 'message', r.message,
      'tier', r.interest_tier, 'term', r.interest_term, 'streams', r.interest_streams,
      'device', r.preferred_device, 'device_detail', r.device_detail,
      'marketing', r.marketing_opt_in, 'created_at', r.created_at),
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

revoke all on function private.ops_card_json(uuid) from public, anon, authenticated;
