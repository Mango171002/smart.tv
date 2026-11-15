-- Security hardening (owner approval 15/11/2026, Supabase advisor « function_search_path_mutable »):
-- the append-only trigger function of the bot journal gets a fixed, empty search_path.
-- Behaviour unchanged (it only raises an error); no data touched.
alter function private.ops_events_append_only() set search_path = '';
revoke all on function private.ops_events_append_only() from public, anon, authenticated;
