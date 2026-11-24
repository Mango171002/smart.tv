-- =============================================================================
-- ROLLBACK of 20261124120000_locales_8_languages.sql — restores the former ('en', 'fr') rule.
-- Run as the database owner (Supabase SQL editor or psql), in ONE transaction (the begin/commit below).
--
-- Works ONLY while no row uses a new locale (de, es, it, nl, sv, nb). If such rows exist, this script stops with
-- an explicit error and changes nothing. In that case either keep the migration, or use the safe variant
-- 20261124120000_locales_8_languages.rollback_map_to_en.sql, which first rewrites those rows to 'en'
-- (the original language of those rows is then lost: export them first if it matters).
-- Note: after a rollback, requests from the /de, /es, /it, /nl, /sv and /nb pages fail again (HTTP 502).
-- =============================================================================
begin;

do $$
declare
  n_contact integer;
  n_markets integer;
  n_customers integer;
begin
  select count(*) into n_contact from public.contact_requests where locale not in ('en', 'fr');
  select count(*) into n_markets from public.markets where default_locale not in ('en', 'fr');
  select count(*) into n_customers from public.customers where preferred_locale not in ('en', 'fr');
  if n_contact + n_markets + n_customers > 0 then
    raise exception 'rollback refused: rows use a new locale (contact_requests %, markets %, customers %). Use the map_to_en variant.',
      n_contact, n_markets, n_customers using errcode = 'check_violation';
  end if;
end $$;

alter table public.contact_requests drop constraint if exists contact_requests_locale_check;
alter table public.contact_requests add constraint contact_requests_locale_check check (locale in ('en', 'fr'));

alter table public.markets drop constraint if exists markets_default_locale_check;
alter table public.markets add constraint markets_default_locale_check check (default_locale in ('en', 'fr'));

alter table public.customers drop constraint if exists customers_preferred_locale_check;
alter table public.customers add constraint customers_preferred_locale_check check (preferred_locale in ('en', 'fr'));

comment on column public.contact_requests.locale is null;

commit;
