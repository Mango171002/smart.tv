# Database language compatibility (8 languages) — PROPOSAL, NOT APPLIED

Status: **prepared and tested on an isolated local PostgreSQL 16 only. Not applied to any Supabase database.**
It needs the owner's approval, and the owner applies it (see "Activation").

## 1. Problem

The site's language registry (`src/i18n/locales.ts:73-82`) has 8 languages: `en fr de es it nl sv nb`. The contact,
trial and pre-registration forms send the page language. The database still accepts only `en` and `fr`. A request
sent from a `/de`, `/es`, `/it`, `/nl`, `/sv` or `/nb` page (preview builds today) is rejected with error 23514, and
the API answers **HTTP 502 `storage_failed`**.

## 2. Audit: everything that limits a language

| Where | Current behaviour | Impact | Action |
|---|---|---|---|
| `supabase/migrations/20261108134848_contact_requests.sql:15` `contact_requests.locale check (locale in ('en','fr'))` | Rejects `de es it nl sv nb` (23514) | **Blocks** requests from 6 languages | Widened to 8 |
| `supabase/migrations/20261108134733_catalog.sql:13` `markets.default_locale check (... in ('en','fr'))` | Catalogue only. The app never writes it. Seed values are `en` | Latent | Widened to 8 |
| `supabase/migrations/20261108134827_customers_orders.sql:17` `customers.preferred_locale check (... in ('en','fr'))` | Profile column. `authenticated` may update it (`…api_privileges_rls.sql:63`). Not used by the app yet | Latent | Widened to 8 |
| `supabase/migrations/20261108134854_api_privileges_rls.sql:52` | `anon` may INSERT `locale` (column grant) | OK | none |
| `src/lib/validation.ts:20` `locale: z.enum(LOCALES)` | `LOCALES` = languages **built** by this build (`src/i18n/config.ts:11`). Production builds English only. Preview builds all 8 | Correct: a language is accepted only where its pages exist | none (tested) |
| `src/app/api/contact/route.ts:46` | Stores `input.locale` as-is. The DB error at `:62-72` becomes HTTP 502 | This is where the failure showed | none |
| `src/components/RequestDialog.tsx:138-139`, `src/components/CheckoutDialog.tsx:133` | Send the page `locale` | OK | none |
| `src/lib/email/templates.ts:335` `renderEmail(kind, d)`, `:195` `<html lang="en">`. `src/lib/email/send.ts:16` | Every customer e-mail is English. The template is not chosen by locale, so every language already falls back to English | No failure mode | none (translation later = product decision) |
| `src/lib/telegram/{ops,cards,api}.ts`, `private.ops_card_json` (`…20261114230000_contact_country_device.sql:18-22`) | The bot never reads `locale`. Topic names (`commandes`, `support`…) are internal keys, not locales | OK | Optional: show the language on the card (not done) |
| `ops_review_claim_due` (`…20261115130000_review_invites.sql`), `ops_trial_followup_claim_due` (`…20261116220000_trial_followups.sql`) | No locale filter. The e-mails are English | OK | none |
| `private.ops_settings`, `ops_admins`, `ops_cards`, `ops_events` (`…20261114200000_ops_bot.sql`) | No locale column or check | OK | none |
| `src/lib/supabase/database.types.ts:29,47,70` | `locale: string` (no union) | OK | none |
| `src/app/[locale]/not-found.tsx:15-20` | Page texts for 8 languages, falls back to `en` | Not DB | none |

App-side changes: **none were needed.** The only blocker was the database. The e-mail fallback to English is
already built in, because there are no per-language templates.

## 3. Migration

`supabase/migrations/20261124120000_locales_8_languages.sql`
- For each of the 3 columns, it runs `drop constraint if exists <name>`, then `add constraint <name> check (<col> in ('en','fr','de','es','it','nl','sv','nb')) not valid`, then `validate constraint <name>`.
- It only widens the rule. No row is written. Prices, payments, taxes and licensing flags are not touched.
- It is idempotent: re-running it leaves exactly one locale check per column.
- At the end, an assertion fails the migration (and rolls it back) if any column still has another locale
  check, for example one under a different name in the live database.
- Locks: the drop/add takes a short ACCESS EXCLUSIVE lock on each of three small tables. Note that `NOT VALID` +
  `VALIDATE` in the same transaction does not shorten that lock. It only documents that existing rows are checked
  by a read-only scan.

## 4. Rollback

- `supabase/rollback/20261124120000_locales_8_languages.rollback.sql` (strict). It restores `('en','fr')`. **It
  works only if no row uses a new locale.** Otherwise it stops with
  `rollback refused: rows use a new locale (contact_requests N, markets N, customers N)` and changes nothing.
- `supabase/rollback/20261124120000_locales_8_languages.rollback_map_to_en.sql` (safe variant). It first sets those
  rows to `'en'`, then restores `('en','fr')`. This is **irreversible for those rows**: export them first
  (`select id, locale from public.contact_requests where locale not in ('en','fr')`).
- After a rollback, requests from the 6 new languages fail again (HTTP 502).

## 5. Test evidence

Isolated DB: local PostgreSQL 16.15. It listens on a UNIX socket only (`listen_addresses=''`), has no network and
uses synthetic data. Stubs come from the repo's `supabase/tests/local-supabase-shim.sql`: roles `anon`,
`authenticated`, `service_role`; `auth.users`; `auth.uid()`; Supabase default grants. No pg_cron or extension is
needed. Scripts: `/tmp/claude-0/-home-user-smart-tv/2a60658e-988d-573d-8028-78b6e580122b/scratchpad/final/db/`
(`README.txt`, `run-all.sh`; transcript `run-all.log`).

| Check | Result |
|---|---|
| All 24 migrations from scratch + seed + repo suite `supabase/tests/rls_and_privileges.test.sql` | `PASSED: 114 assertions` |
| Both new migrations re-applied twice, then the repo suite again | ok, `PASSED: 114 assertions` |
| en/fr rows (support, trial, pre-registration) + an `fr` customer written **before** the migration, compared by md5 after it | `PASSED: 5 assertions`: rows, markets (incl. `licensed`/`sales_enabled`) and customers are unchanged |
| 8 locales × 3 kinds inserted as `anon` with the route's column list (RLS + column grants + throttle). Invalid `pt`, `EN`, `de-DE`, `no`, `''` → 23514, `null` → 23502. Default `en`. `markets`/`customers` accept `de`/`nb` and reject `pt`/`xx`. Bot opens a card for an `sv` trial | `PASSED: 17 assertions` |
| Strict rollback on a DB without new-locale rows → `de` rejected, `fr` accepted. Migration re-applied | `PASSED: 3 assertions`, re-apply ok |
| Strict rollback with one `de` row | refused, constraint still has 8 values |
| Map-to-en rollback with one `de` row | row becomes `en`, `PASSED: 3 assertions` |
| `npm run db:test` (repo script, pointed at the local socket) | `PASSED: 114 assertions` |
| Unit test without a database: `tests/unit/db-locales.test.ts`. It parses every migration in order and checks that the effective check of each locale column equals `ALL_LANGUAGE_CODES`. It also checks the rollbacks, and that the contact schema accepts the 8 languages in preview and only `en` in production | 7 tests pass |

Rerun:

```
bash /tmp/claude-0/-home-user-smart-tv/2a60658e-988d-573d-8028-78b6e580122b/scratchpad/final/db/run-all.sh
npx vitest run tests/unit/db-locales.test.ts
```

## 6. Activation (owner)

1. Owner approves this proposal.
2. Back up the database (Supabase dashboard → Database → Backups, or `pg_dump` by the owner).
3. The owner applies `20261124120000_locales_8_languages.sql` through the normal migration path (Supabase CLI
   `db push` from an approved checkout, or the SQL editor in a single transaction).
4. Check:
   `select conname, pg_get_constraintdef(oid) from pg_constraint where conname like '%locale_check';`
   This should show 3 rows with 8 values each.
5. No flag is needed. The production site keeps accepting `en` only until a language is released (registry +
   `NEXT_PUBLIC_RELEASED_LANGUAGES`, owner decision).

## 7. Backup, execution and verification runbook (B10 — owner runs it)

Nothing below has been run against Supabase by engineering. The owner (or a person the owner designates) runs each
step, in order, and keeps the outputs. Files referenced here live on branch `claude/f14-db` until it is merged:
`supabase/migrations/20261124120000_locales_8_languages.sql` and the two rollback scripts in `supabase/rollback/`.
Use only the file content from the approved commit; do not retype the SQL.

### 7.1 Before you start

- Pick a quiet time: online requests are closed today (`FEATURE_CONTACT_FORM=false`), so no form writes to
  `contact_requests` during the change.
- Have the Supabase project open (dashboard → the production project) with an owner/admin account.
- Write down the date, time and the approved commit hash of the migration file.

### 7.2 Backup / export

1. **Platform backup.** Dashboard → *Database* → *Backups*: confirm the latest daily backup is recent (or, if the plan
   offers it, note the point-in-time-recovery window). Screenshot it.
2. **Logical export of the three tables touched** (read-only). Either:
   - CLI from the owner's own computer: `pg_dump "<connection string from Dashboard → Connect>" --data-only
     --table=public.contact_requests --table=public.markets --table=public.customers > backup-b10-YYYYMMDD.sql`
     (add `--schema-only` in a second file to keep the definitions), or
   - Dashboard → *Table editor* → each table → *Export* → CSV.
   Store the files outside the repository (they contain personal data).
3. **Snapshot of the current rules and counts** — SQL editor, run and keep the output:

```sql
select conrelid::regclass as tbl, conname, pg_get_constraintdef(oid) as def
  from pg_constraint
 where contype = 'c' and conname in ('contact_requests_locale_check', 'markets_default_locale_check', 'customers_preferred_locale_check')
 order by 1;
select 'contact_requests' as tbl, locale as value, count(*) from public.contact_requests group by locale
union all select 'markets', default_locale, count(*) from public.markets group by default_locale
union all select 'customers', preferred_locale, count(*) from public.customers group by preferred_locale
order by 1, 2;
```

   Expected today: three rows with `CHECK ((locale = ANY (ARRAY['en'::text, 'fr'::text])))` (or the equivalent
   `IN`); values only `en` / `fr`. If a constraint has another name or another definition, **stop** and send the
   output to engineering (the migration's final assertion would refuse it anyway).

### 7.3 Apply

Option A — **SQL editor** (recommended, single transaction):
1. Dashboard → *SQL editor* → *New query*.
2. Type `begin;` on the first line, paste the full content of `20261124120000_locales_8_languages.sql`, then
   `commit;` on the last line.
3. Run once. Success = « Success. No rows returned ». Any error (for example
   `expected exactly one check constraint …`) rolls everything back: nothing changed; send the error to engineering.

Option B — **Supabase CLI** from an approved checkout on the owner's computer:
1. `supabase link --project-ref <project ref>` (owner login).
2. `supabase migration list` — check that the remote history matches the repository up to
   `20261116220000_trial_followups` and that `20261124120000` is the only pending local migration you intend to push
   (if other pending files appear, e.g. `20261124130000_retention_purge.sql`, do **not** push: move them aside or use
   Option A).
3. `supabase db push` (it asks for confirmation and lists the files).

### 7.4 Verify

```sql
-- 1. Exactly one locale check per column, each with the 8 languages.
select conrelid::regclass as tbl, conname, convalidated, pg_get_constraintdef(oid) as def
  from pg_constraint
 where contype = 'c' and conname like '%locale_check'
 order by 1;
-- Expected: 3 rows, convalidated = true, each listing en, fr, de, es, it, nl, sv, nb.

-- 2. No row changed (compare with the counts kept in 7.2 step 3).
select 'contact_requests' as tbl, locale as value, count(*) from public.contact_requests group by locale
union all select 'markets', default_locale, count(*) from public.markets group by default_locale
union all select 'customers', preferred_locale, count(*) from public.customers group by preferred_locale
order by 1, 2;

-- 3a. A new language is accepted — run alone; nothing is kept (rollback).
begin;
  insert into public.contact_requests (kind, email, locale, consent_given, consent_text_version)
  values ('launch_waitlist', 'b10-check@example.invalid', 'de', true, 'b10-check');
rollback;
-- Expected: success (then rolled back).

-- 3b. An unknown language is still refused — run alone in a NEW query.
begin;
  insert into public.contact_requests (kind, email, locale, consent_given, consent_text_version)
  values ('launch_waitlist', 'b10-check@example.invalid', 'pt', true, 'b10-check');
rollback;
-- Expected: ERROR 23514 « violates check constraint "contact_requests_locale_check" » (nothing written).

-- 3c. Confirm the probes left nothing behind.
select count(*) from public.contact_requests where email = 'b10-check@example.invalid';  -- expected 0
```

If check 3a fails on another rule first (for example the database throttle, PT429), the inserts are only a probe: rely on checks 1 and 2 and tell engineering. Also verify that the production site still answers
(`https://sygmatv.com/api/health` → `"status":"ok"`); the site does not need a deploy for this change.

### 7.5 Rollback (only if needed)

1. Check whether any row already uses a new language:
   `select count(*) from public.contact_requests where locale not in ('en','fr');` (same for `markets.default_locale`
   and `customers.preferred_locale`).
2. If all counts are 0: run `supabase/rollback/20261124120000_locales_8_languages.rollback.sql` in the SQL editor (it
   has its own `begin; … commit;`). Then re-run the verification query 1: three rows with `en`, `fr` only.
3. If some rows use a new language: export them first
   (`select id, locale from public.contact_requests where locale not in ('en','fr');`), then either keep the
   migration or run `…rollback_map_to_en.sql` (irreversible for those rows: their language becomes `en`).
4. Last resort: restore the platform backup of 7.2 step 1 (this also discards every write made after it).

### 7.6 Related B10 item — offered terms

The application now refuses `lifetime` and any term other than `12m`, `24m`, `36m` (and device counts other than 1–4)
in `/api/quote`, `/api/contact` and `/api/checkout` (`src/lib/validation.ts` `OFFERED_TERMS`). The database rule on
`contact_requests.interest_term` (`20261110230034_plan_tiers.sql:44`) still allows `lifetime`; narrowing it is
optional (the API is the only writer) and is **not** proposed as a migration here. If the owner wants it, engineering
prepares a separate, tested migration with the same backup / verify / rollback steps.

### 7.7 Record

Add a line to `docs/release/phase13/owner-approval.md` (B10): date, who ran it, Option A or B, the outputs of 7.2
step 3 and 7.4 checks 1–2.
