# Automatic personal-data retention — PROPOSAL, NOT APPLIED, NOT ENABLED

Status: **prepared and tested on an isolated local PostgreSQL 16 only.** It has not been applied to Supabase. No
flag is set and no cron trigger is set. Before any real run, the owner **and counsel** must approve it.

## 1. Published policy (exact wording)

- `src/content/legal.ts:84` (Privacy, « How long we keep it »): *"Requests that do not lead to a subscription: 12 months at most. Customers: during the subscription, then 12 months. Invoices: as long as the law requires."*
- `src/i18n/dictionaries/en.ts:464`: *"I agree to be contacted about this request. Data deleted within 12 months."*. `:492`: *"Data deleted within 12 months."*. `:505`: *"… Data deleted within 12 months if I do not subscribe."*. The French equivalents are at `fr.ts:476,504,517` (« Données supprimées sous 12 mois »).
- `supabase/migrations/20261108134848_contact_requests.sql:29`: table comment *"Retention policy to be confirmed by counsel (proposed: 12 months)."*

Today nothing enforces this policy. No job deletes anything.

## 2. Inventory of personal data

| Table | Personal data | Age column | Proposed treatment |
|---|---|---|---|
| `public.contact_requests` (pre-registrations, trial requests, support) | name, email, phone, subject, message, marketing opt-in, country; invoice number once « Converti » | `created_at` | **Anonymise** expired non-exception rows. The row stays for statistics (`ops_stats`) and for the bot journal |
| `private.ops_cards` | none directly. Telegram `chat_id`/`message_id` point to card messages that **contain** name/email/phone | `created_at` | Kept. Open lead cards of anonymised requests are closed as `lost` by actor `retention` |
| `private.ops_events` (append-only journal) | `reason` free text (may quote the customer). `actor_id`/`actor_name` = staff | `created_at` | `reason` blanked for anonymised requests. Never deleted |
| `private.ops_admins` | staff Telegram id + name | `added_at` | Not automated (staff data, while active) |
| `public.orders` / `public.order_events` | email, customer link, terms acceptance, payment reference | `updated_at` | **Delete** only `draft`/`cancelled` orders never sent to a payment provider (events cascade). Checkout does not write orders today |
| `public.payment_webhook_events` | `payload` jsonb (may hold buyer data) | `received_at` | Not touched (payment evidence) |
| `public.customers` (+ `auth.users`, Supabase Auth) | email, full name, country, locale, marketing consent | `created_at` | Not touched. Rule is subscription + 12 months, which the DB cannot compute today |
| `private.retention_runs` (new) | none (counts only) | `ran_at` | Kept as compliance evidence |
| Outside the DB | Telegram group (cards), Brevo (`src/lib/email/send.ts`) send logs, Cloudflare logs | — | **Not covered by this job.** Owner action needed |

## 3. Exceptions that need owner/counsel approval (not decided here)

The function keeps these rows untouched. It only counts them (`counts.kept.*`):

1. **Invoices**: `contact_requests.invoice_number` is set (`invoice`). Keep for the legal invoice period. Counsel must say how long and which fields.
2. **Customers**: the card is `converted` (`converted_customer`). Policy is "subscription + 12 months". The subscription end is not stored, so a rule is needed.
3. **Marketing consent proof**: `marketing_opt_in = true` (`marketing_consent`). Keep while marketing continues? Is the Brevo list the system of record?
4. **Open cases / disputes**: support card `open`/`answered` (`open_support`), and the new `retention_hold = true` flag (`retention_hold`) for claims, refunds or authority requests. Who sets it, and how it is lifted, must be agreed.
5. **Orders linked to payment**: paid, refunded, failed or pending orders, or any order with a payment reference or webhook (`orders_accounting`). The same goes for `payment_webhook_events` (`payment_webhook_events`). These are accounting and chargeback evidence.
6. **Customer accounts**: (`customers_manual_review`). Deleting them means deleting Supabase Auth users. This is a manual or separate process.
7. **Anonymise vs delete** for `contact_requests` is itself a proposal. Anonymisation keeps kind, locale, market/country, device, plan interest, consent-text version and dates. Counsel must confirm that this meets "Data deleted within 12 months".
8. **Boundary**: a row qualifies when `created_at` is strictly older than `now() - 12 months` (calendar months). The forms say "within 12 months", so a daily run means data lives at most 12 months plus 1 day.
9. **Telegram history / Brevo logs**: cards older than 48 h generally cannot be deleted by a bot (Bot API limit). Use the group's auto-delete setting, or delete them manually.

## 4. Mechanism

Migration `supabase/migrations/20261124130000_retention_purge.sql` is additive. Applying it changes no data.

- `contact_requests.anonymised_at`, `contact_requests.retention_hold` (server only, no `anon` grant). The two kind checks accept anonymised rows. A new check `contact_requests_anonymised_is_empty` guarantees that an anonymised row has no name, e-mail, phone, subject or message.
- `private.ops_events_append_only()` stays append-only. The single exception: inside the purge transaction (local flag `sygma.retention_purge`), an UPDATE may set `reason` to null and change nothing else. Deletes are never allowed.
- `private.retention_runs`: one row per run (dry or real). It stores the cutoff, the batch and the counts. It never stores ids or e-mails. No API role can read it.
- `private.purge_expired_personal_data(p_dry_run boolean default true, p_max_rows int default 500, p_retention interval default '12 months') → jsonb` (security definer, `search_path=''`).
  - Safeguards: it is **dry-run by default**. It **refuses a cutoff more recent than 12 months** (`11 months`, `360 days` and `12 months − 1 s` are all refused). The batch must be between 1 and 5000, **per table, per run**. A concurrent run gets `{"ok":false,"code":"busy"}` (advisory lock). It is idempotent: anonymised rows are skipped. The real path uses `FOR UPDATE SKIP LOCKED`, oldest rows first.
- `public.retention_purge(p_dry_run, p_max_rows)` is the Data API wrapper. The retention is fixed at 12 months. Only `service_role` can execute it.
- Route `src/app/api/cron/retention/route.ts` (helpers in `src/lib/retention.ts`). It uses the same auth as the other cron routes: `x-cron-secret` derived from `SUPABASE_SECRET_KEY`, with 503 when not configured and 401 when wrong. It calls the wrapper with `p_dry_run = !(RETENTION_PURGE_ENABLED === 'true')` and a batch of 500. It answers and logs **numeric counts only**. On a DB error it logs only the SQLSTATE code, because Postgres messages can quote row values.
  - `RETENTION_PURGE_ENABLED` is in no `wrangler.jsonc`, `.env*` file or workflow. `worker.ts` and the cron triggers are unchanged. Both points are asserted by `tests/unit/retention.test.ts`.

Sample route answer (dry run on the test fixtures):

```json
{"ok":true,"dryRun":true,"counts":{"contact_requests_eligible":4,"contact_requests_anonymised":4,"ops_cards_closed":1,
 "ops_events_reason_cleared":1,"orders_eligible":1,"orders_deleted":1,"order_events_deleted":1,
 "kept":{"invoice":1,"open_support":1,"retention_hold":1,"marketing_consent":1,"converted_customer":2,
 "orders_accounting":1,"payment_webhook_events":1,"customers_manual_review":1}}}
```

In a dry run, the `*_anonymised`, `*_deleted`, `*_closed` and `*_cleared` counters mean "would be".

## 5. Test evidence

The isolated DB is the same as in `db-locale-migration.md`: local PG 16, UNIX socket only, synthetic data, repo
shim. Scripts are in `/tmp/claude-0/-home-user-smart-tv/2a60658e-988d-573d-8028-78b6e580122b/scratchpad/final/db/`
(`run-all.sh`, `retention_test.sql`, `run-all.log`).

Fixtures: 11 requests aged 11 months, exactly 12 months, 12 months + 1 day and 13 months. They include a new lead
card, a lost trial whose reason quotes a phone number, a closed and an open support ticket, an invoiced/converted
trial, a converted lead, a marketing opt-in and a legal hold. Orders: a 13-month abandoned draft, a 13-month
cancelled order linked to a payment, and an 11-month draft. Also a 13-month webhook event and a 13-month customer.

| Check | Result |
|---|---|
| `anon`/`authenticated` cannot execute the wrapper. `service_role` can, but cannot call the private function or read the log | pass |
| Cutoffs 11 months, 360 days, 12 months − 1 s refused. Batches 0, 5001 and null refused. Nothing logged | pass |
| Dry run (default): reports 4 eligible, 1 card, 1 reason, 1 order, and the kept exceptions. md5 snapshots of requests, journal, cards and orders are unchanged. 1 log row | pass |
| Real run with batch 2: anonymises 2 of 4 (oldest first). Second run: 2. Third run: 0 (idempotent) | pass |
| Exactly `m12_plus1d`, `m13_new_card`, `m13_support_closed` and `m13_trial_lost_reason` are anonymised. Every other row is byte-identical. Nothing younger than 12 months is touched (11 months and exactly 12 months are kept) | pass |
| Anonymised rows hold no PII. kind and locale are kept. Open lead card → `lost` with a `retention` journal entry. Reason blanked. Journal: nothing deleted | pass |
| 13-month abandoned draft deleted with its events. Payment-linked order, recent order, webhook event and customer are kept | pass |
| Journal still append-only outside the purge. With the flag set, only `reason` may change and delete is still refused. An anonymised row cannot get an e-mail back | pass |
| Log: 4 rows (1 dry + 3 real), no `@`, no UUID. Function results contain no e-mail or id | pass |
| Concurrent run while the lock is held | `{"ok": false, "code": "busy"}` |
| Rollback on a fresh DB: function, log table and columns gone. Repo suite passes. Migration re-applies | `PASSED: 114 assertions` |
| Rollback after a real run: the anonymised row stays valid (exemption kept) | pass, `PASSED: 114 assertions` |
| Total | `PASSED: 52 assertions (retention)`, `ALL DATABASE CHECKS PASSED` |
| Unit `tests/unit/retention.test.ts` (no DB): auth 503/401 with no RPC call, dry run by default, only exactly `'true'` enables (`'1'`, `'TRUE'`, `' true'`, `'yes'`… do not), output and logs free of e-mail, phone, id, secret and DB message, flag and route absent from config, workflows and `worker.ts`, SQL safeguards present | 8 tests pass |

## 6. Rollback

`supabase/rollback/20261124130000_retention_purge.rollback.sql` (one transaction):
- It drops the wrapper, the function and `private.retention_runs`. Export the log first if it is needed as evidence.
- It restores the strictly append-only journal trigger.
- It removes `retention_hold`. It also removes `anonymised_at` and restores the original checks, **but only if no row was ever anonymised**. Otherwise it keeps them so the anonymised rows stay valid.
- **Deleted or anonymised data cannot be restored by any rollback.** Take a backup/export before the first real run.

## 7. Activation procedure (owner)

1. Owner and counsel decide the exceptions in §3 and approve anonymise-vs-delete.
2. **Backup**: a Supabase backup or PITR point, plus an export of `contact_requests`, `orders`, `order_events`, `ops_events` and `ops_cards`, stored securely and with its own retention.
3. The owner applies `20261124130000_retention_purge.sql` (CLI from an approved checkout, or the SQL editor). It changes no data.
4. Dry run: `POST /api/cron/retention` with the cron secret (or `select public.retention_purge();` as service_role). Review the counts and `private.retention_runs`.
5. Enable: set the Worker secret/var `RETENTION_PURGE_ENABLED=true` (owner, Cloudflare dashboard), then call the route again. Repeat until `contact_requests_eligible` is 0, which takes several runs if the backlog is above 500.
6. Optional scheduling, as a later owner decision: daily call from `worker.ts` or a workflow. **Not added here.**
7. Disable: unset `RETENTION_PURGE_ENABLED`. The route then goes back to dry run.
