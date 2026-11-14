-- /stats: actions that were undone no longer count as contacted / converted.
create or replace function public.ops_stats(p_since timestamptz) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'waitlist', (select count(*) from public.contact_requests where kind = 'launch_waitlist' and created_at >= p_since),
    'trials', (select count(*) from public.contact_requests where kind = 'trial_request' and created_at >= p_since),
    'support', (select count(*) from public.contact_requests where kind = 'support' and created_at >= p_since),
    'contacted', (select count(*) from private.ops_events e where e.action = 'contact' and e.created_at >= p_since
                    and not exists (select 1 from private.ops_events u where u.undoes = e.id)),
    'converted', (select count(*) from private.ops_events e where e.action = 'convert' and e.created_at >= p_since
                    and not exists (select 1 from private.ops_events u where u.undoes = e.id)),
    'pending', (select count(*) from private.ops_cards where status in ('new', 'contacted', 'open'))
  )
$$;
revoke all on function public.ops_stats(timestamptz) from public, anon, authenticated;
grant execute on function public.ops_stats(timestamptz) to service_role;
