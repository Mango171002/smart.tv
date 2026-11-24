-- =============================================================================
-- Database language compatibility: the 8 site languages (PROPOSAL 24/11/2026 — NOT APPLIED).
-- Apply only after the owner's approval (docs/release/final/db-locale-migration.md).
--
-- The site registry (src/i18n/locales.ts) declares 8 languages: en, fr, de, es, it, nl, sv, nb. The contact
-- form already sends the page language (RequestDialog / CheckoutDialog → /api/contact → contact_requests.locale),
-- and the preview site builds all 8, but three CHECK constraints still accept only ('en', 'fr'):
--   public.contact_requests.locale     (20261108134848_contact_requests.sql:15)  ← written by /api/contact
--   public.markets.default_locale      (20261108134733_catalog.sql:13)           ← catalogue, not written by the app
--   public.customers.preferred_locale  (20261108134827_customers_orders.sql:17)  ← customer profile (unused today)
-- A /de, /es, /it, /nl, /sv or /nb request is therefore rejected by the database (23514 → HTTP 502 storage_failed).
--
-- Widening only: every existing row ('en' or 'fr') stays valid, no row is modified. Each constraint is dropped
-- and re-added NOT VALID, then VALIDATEd (the validation scan only reads the rows). The drop/add takes a brief
-- ACCESS EXCLUSIVE lock on each table (small tables: milliseconds).
-- Idempotent: running the file twice leaves exactly one locale check per column (asserted at the end).
-- No privilege, price, payment, tax or licensing flag is touched.
--
-- Keep the list below equal to the registry (checked by tests/unit/db-locales.test.ts).
--
-- ROLLBACK (only works while no row uses de/es/it/nl/sv/nb):
--   supabase/rollback/20261124120000_locales_8_languages.rollback.sql
-- Safe variant (maps those rows to 'en' first, irreversible for those rows):
--   supabase/rollback/20261124120000_locales_8_languages.rollback_map_to_en.sql
-- =============================================================================

-- contact_requests.locale -------------------------------------------------------
alter table public.contact_requests drop constraint if exists contact_requests_locale_check;
alter table public.contact_requests add constraint contact_requests_locale_check
  check (locale in ('en', 'fr', 'de', 'es', 'it', 'nl', 'sv', 'nb')) not valid;
alter table public.contact_requests validate constraint contact_requests_locale_check;

-- markets.default_locale --------------------------------------------------------
alter table public.markets drop constraint if exists markets_default_locale_check;
alter table public.markets add constraint markets_default_locale_check
  check (default_locale in ('en', 'fr', 'de', 'es', 'it', 'nl', 'sv', 'nb')) not valid;
alter table public.markets validate constraint markets_default_locale_check;

-- customers.preferred_locale ----------------------------------------------------
alter table public.customers drop constraint if exists customers_preferred_locale_check;
alter table public.customers add constraint customers_preferred_locale_check
  check (preferred_locale in ('en', 'fr', 'de', 'es', 'it', 'nl', 'sv', 'nb')) not valid;
alter table public.customers validate constraint customers_preferred_locale_check;

comment on column public.contact_requests.locale is
  'Site language of the request (ISO 639-1): en, fr, de, es, it, nl, sv, nb — the registry in src/i18n/locales.ts.';

-- Safety net: if the live database ever had a locale check under another name, the old ('en', 'fr') rule would
-- still apply next to the new one. Fail (and roll the migration back) instead of leaving it half-done.
do $$
declare
  v record;
  n integer;
begin
  for v in select * from (values
      ('contact_requests', 'locale'), ('markets', 'default_locale'), ('customers', 'preferred_locale')) t (tbl, col)
  loop
    select count(*) into n
      from pg_constraint con
      join pg_attribute a on a.attrelid = con.conrelid and a.attnum = any (con.conkey)
     where con.conrelid = format('public.%I', v.tbl)::regclass
       and con.contype = 'c'
       and a.attname = v.col;
    if n <> 1 then
      raise exception 'expected exactly one check constraint on public.%.%, found %', v.tbl, v.col, n;
    end if;
  end loop;
end $$;
