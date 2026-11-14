-- Repeated pre-registration (same e-mail): the website keeps one row per e-mail, so the bot
-- looks the existing request up without the 10-minute window.
create or replace function public.ops_find_request_any(p_kind text, p_email text) returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.contact_requests
   where kind::text = p_kind and lower(email) = lower(p_email)
   order by created_at desc limit 1
$$;
revoke all on function public.ops_find_request_any(text, text) from public, anon, authenticated;
grant execute on function public.ops_find_request_any(text, text) to service_role;
