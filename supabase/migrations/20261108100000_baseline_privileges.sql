-- =============================================================================
-- Baseline privileges: no automatic Data API exposure of new objects.
--
-- Supabase grants ALL on new tables/sequences/functions in `public` to anon,
-- authenticated and service_role by default. We revoke those default
-- privileges so that every object created afterwards is invisible to the
-- Data API until it is granted explicitly (least privilege). Each later
-- migration grants exactly what each role needs, table by table.
-- =============================================================================

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated, service_role, public;

-- Functions are executable by PUBLIC by default in PostgreSQL; disable that too.
alter default privileges for role postgres
  revoke execute on functions from public;

-- Private schema for internal helpers (trigger functions, security definer
-- helpers). It is NOT exposed through the Data API and no API role may use it.
create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon, authenticated, service_role;

comment on schema private is
  'Internal helpers. Never add to the Data API exposed schemas.';

-- Generic updated_at maintenance.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public;
