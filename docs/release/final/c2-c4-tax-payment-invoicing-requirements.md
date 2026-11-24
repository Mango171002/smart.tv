# C2–C4 — Technical requirements: market tax, recorded payments, invoices

Status: **requirements and schema proposal only.** No migration was written into `supabase/migrations/`, none was
applied, no price, tax, payment or licensing flag changed. Every legal or tax rule below is an **input the owner
obtains from the tax adviser** (owner approval C2, C3, C4; legal-blocker register L-02, L-08, L-09). Nothing here is
tax advice.

## 1. Where things stand (code facts)

| Topic | Today | File |
|---|---|---|
| Tax rules | `siteConfig.taxRules = null` → launch blocker `tax_rules_missing` | `src/config/site.ts`, `src/config/launch-gate.ts` |
| Quote | Server price from the table; `taxes: { calculated: false, reason: 'tax_rules_not_configured' }`, `taxMinor: null`, `chargeable: false` | `src/app/api/quote/route.ts`, `src/lib/pricing.ts` |
| Prices | USD list prices (US market), status `illustrative` in the static table | `src/config/price-tables.json`, `src/lib/price-source.ts` |
| Online payment | `/api/checkout` always 403 while blockers remain; then 501 (no provider) | `src/app/api/checkout/route.ts` |
| `orders` table (unused) | `currency`, `subtotal_minor`, `tax_minor` (default 0), `total_minor`, `payment_provider`, `payment_reference`, `terms_version` | `supabase/migrations/20261108134827_customers_orders.sql` |
| Assisted flow « Converti » | Gives an order number `SYG-YYYY-NNNN` (`contact_requests.invoice_number`), e-mails the **list price** labelled « Plan price » — the amount actually received is not recorded (L-09) | `supabase/migrations/20261115110000_orders_repeat_invoices.sql`, `src/lib/telegram/ops.ts` |
| E-mails | Never state a tax amount; trader identity and legal links in every e-mail (B7) | `src/lib/email/templates.ts` |

## 2. C2 — Market-specific tax calculation

### Inputs needed from the owner / tax adviser (written)

For each market where sales are planned (EU member states via OSS, Norway VOEC, United Kingdom, Switzerland, Canada
and provinces, United States per state — the list in owner approval C2):

1. Is the seller registered / required to register, and from which date? Registration number(s) (to fill
   `siteConfig.vatId` — never invented).
2. Tax treatment of the service (electronically supplied service or other), rate(s) and the rule for the place of
   supply (customer country evidence: billing address, IP country, payment-instrument country — how many and which).
3. Whether consumer prices must be shown **tax-inclusive** in the local currency (owner approval C2 option 1) or may
   stay USD with a wording approved by the adviser.
4. Business customers (B2B): reverse charge? VAT-number validation required?
5. Rounding rules (per line / per invoice) and the currency of the tax amount.
6. Thresholds below which no registration is needed, if the adviser relies on any.
7. Review of past assisted sales (owner approval C2, last line) — read-only export, approved separately.

### Engineering requirements once the inputs exist

- A versioned **tax rule table** (`tax_rules`: market or country, region, rate in basis points, inclusive/exclusive,
  valid_from, valid_to, source document reference, approved_by, approved_at). Never a hard-coded rate in the code.
- Quote = server-side only: `subtotal_minor`, `tax_minor`, `total_minor`, `tax_rule_id`, `tax_country`, and the
  evidence used (form country, `cf-ipcountry`, later the payment country). The client never sends a tax amount.
- `taxMinor` stays `null` and `taxes.calculated` `false` for any market without an approved rule; the order window
  keeps the B2 wording until then.
- `siteConfig.taxRules` and the launch gate stay the switch: `tax_rules_missing` disappears only when every market in
  `licensedTerritories` has an approved rule (test: a licensed market without a rule keeps the blocker).
- Unit tests per market with the adviser's examples (inclusive and exclusive), rounding cases, and a test that an
  unknown country is refused, not taxed at 0.

## 3. C3 — Recording the payment actually received

Owner approval C3 option 1 (recommended): record amount, currency, method and date at « Converti » and show that
amount in the e-mail. Requirements:

- Recorded **at payment time** by a team member (bot) or a provider webhook — never derived from the price table.
- Fields: amount (minor units, integer), currency (ISO 4217), method (from an allowed list the owner approves, e.g. the
  methods listed in owner approval B4), provider (nullable), provider / transaction reference (bank or provider ID),
  received_at, recorded_by (Telegram ID or `webhook:<provider>`), note.
- Idempotent: one payment per provider reference (unique `(provider, provider_reference)`); a second identical click
  or webhook does not create a duplicate.
- Corrections by a new row (`kind = 'refund'` / `'correction'`), never by editing a recorded amount.
- The « subscription active » e-mail shows « Amount paid » **only** from this record; without a record it keeps the
  list price labelled « Plan price » (current behaviour).
- Reconciliation of past conversions against payment records: a read-only query, approved separately (C3).

### Schema proposal (NOT applied — for review only)

```sql
-- PROPOSAL ONLY. Not in supabase/migrations/, not applied. Requires owner approval (C3) and review.
create table public.payments (
  id                 uuid primary key default gen_random_uuid(),
  request_id         uuid references public.contact_requests (id) on delete restrict,  -- assisted flow
  order_id           uuid references public.orders (id) on delete restrict,            -- online flow (later)
  kind               text not null default 'payment' check (kind in ('payment', 'refund', 'correction')),
  amount_minor       integer not null check (amount_minor > 0),
  currency           char(3) not null check (currency ~ '^[A-Z]{3}$'),
  method             text not null check (char_length(method) between 1 and 40),         -- owner-approved list
  provider           text check (char_length(provider) <= 40),
  provider_reference text check (char_length(provider_reference) <= 200),
  received_at        timestamptz not null,
  recorded_by        text not null check (char_length(recorded_by) between 1 and 80),
  note               text check (char_length(note) <= 500),
  created_at         timestamptz not null default now(),
  constraint payments_one_target check ((request_id is null) <> (order_id is null)),
  constraint payments_provider_ref unique (provider, provider_reference)
);
alter table public.payments enable row level security;          -- no policy: server (service_role) only
revoke all on public.payments from anon, authenticated;
-- Writes through a security-definer RPC (e.g. ops_record_payment) callable by service_role only,
-- with the same actor checks as ops_apply; « Converti » would require a recorded payment first.
```

Open questions for the owner: which methods are accepted (B4), whether « Converti » must be refused without a
recorded payment, and who may record one (admin only, or sellers too).

## 4. C4 — Invoices

Owner approval C4: issue invoices with the required content, **or** the adviser's written answer that none is
required. If invoices are required, the adviser lists the mandatory content per market; typical fields to confirm:

| Field | Source in the system | Status |
|---|---|---|
| Sequential, unique invoice number | `contact_requests.invoice_number` (`SYG-YYYY-NNNN` from the sequence `private.invoice_seq`; a PostgreSQL sequence can leave gaps after a failed transaction — ask the adviser whether gap-free numbering is required) — today an order number | exists |
| Issue date | `invoice_issued_at` | exists |
| Seller legal name and address | `siteConfig.legalEntity`, `legalAddress` | exists |
| Seller tax / VAT registration number(s) | `siteConfig.vatId` (null) | **owner/adviser input** |
| Company registration number, state | `siteConfig.registrationNumber`, `stateOfRegistration` (null) | **owner/counsel input** |
| Customer name, e-mail, country (and address / VAT number for B2B if required) | contact request; address not collected today | **adviser decides**; collecting more data needs a privacy-policy update |
| Description: plan, duration, devices, period start / end | request plan fields; activation date from « Converti » | period end to add |
| Net amount, tax rate, tax amount, total, currency | from C2 (tax) and C3 (payment record) | **blocked by C2/C3** |
| Payment method and date | C3 record | **blocked by C3** |
| Mentions required by law (e.g. reverse charge, OSS) | adviser | **adviser input** |
| Credit notes for refunds | C3 `refund` rows + a credit-note number sequence | to design |

Engineering requirements: invoices are immutable once issued (corrections by credit note), rendered from stored
values only (never recomputed from today's price or rate), archived for the retention period the adviser gives, and
sent as an attachment or a link the customer can keep. Until C2–C4 are resolved, the e-mails keep saying « Order
Number » and « Plan price », never « Invoice » or a tax amount.

## 5. Order of work (proposed)

1. Owner obtains the adviser's written answers (§ 2 inputs, § 4 field list) and decides C3 (methods, who records).
2. Engineering prepares migrations (payments, tax rules) on an isolated database with tests; owner approves; owner
   applies with the backup / verify / rollback runbook format of `db-locale-migration.md` § 7.
3. Quote and e-mails read the approved rules; tests per market; launch-gate blocker `tax_rules_missing` lifted only
   then.
