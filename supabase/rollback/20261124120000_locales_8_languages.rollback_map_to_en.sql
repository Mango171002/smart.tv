-- =============================================================================
-- SAFE ROLLBACK VARIANT of 20261124120000_locales_8_languages.sql.
-- Rewrites every row that uses a new locale (de, es, it, nl, sv, nb) to 'en' (the site's default and fallback
-- language), then restores the former ('en', 'fr') rule. IRREVERSIBLE for those rows: their original language
-- is lost. Export them first if needed, e.g.
--   select id, locale from public.contact_requests where locale not in ('en', 'fr');
-- Run as the database owner, in ONE transaction (the begin/commit below).
-- =============================================================================
begin;

update public.contact_requests set locale = 'en' where locale not in ('en', 'fr');
update public.markets set default_locale = 'en' where default_locale not in ('en', 'fr');
update public.customers set preferred_locale = 'en' where preferred_locale not in ('en', 'fr');

alter table public.contact_requests drop constraint if exists contact_requests_locale_check;
alter table public.contact_requests add constraint contact_requests_locale_check check (locale in ('en', 'fr'));

alter table public.markets drop constraint if exists markets_default_locale_check;
alter table public.markets add constraint markets_default_locale_check check (default_locale in ('en', 'fr'));

alter table public.customers drop constraint if exists customers_preferred_locale_check;
alter table public.customers add constraint customers_preferred_locale_check check (preferred_locale in ('en', 'fr'));

comment on column public.contact_requests.locale is null;

commit;
