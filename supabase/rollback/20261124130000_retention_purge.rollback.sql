-- =============================================================================
-- ROLLBACK of 20261124130000_retention_purge.sql — removes the retention mechanism.
-- Run as the database owner, in ONE transaction (the begin/commit below). Disable the job first: unset
-- RETENTION_PURGE_ENABLED (and remove any scheduler that calls /api/cron/retention).
--
-- IMPORTANT: this does NOT restore any data. Rows anonymised or deleted by a real run are gone for good; only a
-- backup/export taken BEFORE that run can bring them back. Anonymised rows stay anonymised: their kind-specific
-- checks are restored with an exemption so they remain valid (see below).
-- The run log private.retention_runs is dropped: export it first if it is needed as evidence of compliance,
--   copy (select * from private.retention_runs order by id) to stdout with csv header;
-- =============================================================================
begin;

drop function if exists public.retention_purge(boolean, integer);
drop function if exists private.purge_expired_personal_data(boolean, integer, interval);
drop table if exists private.retention_runs;

-- Journal back to strictly append-only (the function of 20261114200000 + 20261115150000).
create or replace function private.ops_events_append_only() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'ops_events is append-only' using errcode = '42501';
end $$;
revoke all on function private.ops_events_append_only() from public, anon, authenticated;

drop index if exists public.contact_requests_retention_idx;
alter table public.contact_requests drop constraint if exists contact_requests_anonymised_is_empty;

-- If no row was ever anonymised, restore the original checks and drop the two columns completely.
-- Otherwise keep `anonymised_at` (and the exemption) so anonymised rows stay valid; drop only retention_hold.
do $$
begin
  if not exists (select 1 from public.contact_requests where anonymised_at is not null) then
    alter table public.contact_requests drop constraint if exists contact_requests_support_has_message;
    alter table public.contact_requests add constraint contact_requests_support_has_message
      check (kind <> 'support' or (message is not null and char_length(message) >= 10 and subject is not null));
    alter table public.contact_requests drop constraint if exists contact_requests_trial_has_contact;
    alter table public.contact_requests add constraint contact_requests_trial_has_contact
      check (kind <> 'trial_request' or (name is not null and phone is not null));
    alter table public.contact_requests drop column if exists anonymised_at;
  else
    raise notice 'anonymised rows exist: anonymised_at and the check exemptions are kept';
  end if;
  alter table public.contact_requests drop column if exists retention_hold;
end $$;

comment on table public.contact_requests is
  'Personal data. Retention policy to be confirmed by counsel (proposed: 12 months).';

commit;
