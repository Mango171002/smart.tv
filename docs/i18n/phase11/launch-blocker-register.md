# Phase 11 — Compliance-readiness launch-blocker register

**Date:** 23 November 2026 · **Branch:** `claude/p11-compliance` · **Audited commit:** `5305a38` (Phase 11 order summary)
**Scope:** audit only. No code, legal page, e-mail, price, tax or licensing setting was changed. This file is the
only change on the branch.

Operator as configured in the code: **Sygma TV LLC**, registered in New Mexico, United States
(`src/config/site.ts:40-44`: legal entity, registered address, country and EIN are read from there and are not
repeated or altered here). Brand: SYGMA TV+. Sales model: assisted sale (order form on the website → team contacts
the customer on WhatsApp → access activated → customer pays by a method arranged manually → confirmation e-mail).
Nothing is charged on the website; the automated checkout is locked (`src/app/api/checkout/route.ts:11-23`).

---

## What this document is not

- **It is not legal or tax advice**, and it draws no legal conclusion. Every statement about a law, a scheme or an
  obligation is written as « may apply » and must be verified by a qualified tax adviser or lawyer in the
  jurisdiction concerned.
- **It invents no threshold, rate, deadline or registration status.** Where a registration threshold is known to
  exist, the text says so and states that the current figure must be verified; no figure is given.
- **It does not describe WhatsApp conversations, payment-provider receipts or anything outside this repository.**
  Those are not auditable from the code; where they matter, the register says so.
- **It is not a decision.** The « options » are choices for the owner and specialists, not recommendations that any
  option is compliant.

---

## Summary table

| ID | Issue | Severity (public launch) | One-line justification | Decision owner / specialist |
|---|---|---|---|---|
| **A** | Tax display and market-specific tax obligations | **BLOCKER** | Prices are shown « before taxes » to consumers in markets where all-inclusive price display may be required, the checkout shows a hard-coded « Taxes $0.00 USD » that the server itself says is not calculated, and possible foreign-seller VAT/GST registrations (EU, UK, NO, CH, CA) and US state taxes are unassessed. | Owner + tax adviser per jurisdiction |
| **B** | Trader identification in transactional confirmations | **MAJOR** | The order and « subscription now active » e-mails identify only the brand « SYGMA TV+ » (no legal name, no geographic address, no link to Terms/Refunds/withdrawal information), and the durable confirmation arrives only after payment, i.e. after the service has started. Low effort to fix once the content is approved. | Owner + consumer lawyer (EU/UK) |
| **C** | Content distribution / broadcasting rights by territory | **BLOCKER** | No territory is licensed (`licensedTerritories: []`, every market `licensed: false`), yet the assisted order flow accepts orders from any country and is not covered by the launch gate; sports genre imagery and « International » labels are still shown. | Owner + media/IP lawyer per territory |
| **D** | Consumer withdrawal rights (EU/EEA incl. Norway, Switzerland, UK) | **MAJOR** | The site promises a 7-day money-back and a 14-day withdrawal right for « EU and UK » only (Norway/EEA and Switzerland not addressed), with no withdrawal-form information and no express-request / acknowledgement step before the service starts during the withdrawal period. May become BLOCKER on counsel's advice. | Owner + consumer lawyer (EU, NO, CH, UK) |
| **E** | Native-speaker validation of the 7 translations | **MAJOR** | fr/de/es/it/nl/sv/nb were reviewed by AI only; 65 wordings touching refunds, consent, licensing and contract formation are pending owner/legal approval; translated legal-adjacent promises would be published unvalidated. | Owner + native reviewers (priority de, nl, sv, nb) |

Severity scale used: **BLOCKER** = a public launch or paid campaign in the affected markets should not proceed until
a documented decision exists; **MAJOR** = should be resolved before scaling or before campaigns in the affected
language/market, a documented risk acceptance is the minimum; **MINOR** = quality issue, can follow launch.

---

## Minimum safe scope for a first campaign — options for the owner

These are **conditions under which a limited campaign could be considered**, framed as options. None of them is a
statement that the resulting campaign is legally compliant; each still depends on the specialist checks listed in
the sections below.

1. **Market scope option — restrict to markets where rights and tax position are documented.** Run a campaign only
   in a territory for which (a) written distribution rights exist (issue C) and (b) a tax adviser has confirmed the
   tax position and price-display rule (issue A). Until then, avoid targeting: the EU member states (FR, DE, ES, IT,
   LU, NL, SE, IE), GB, NO and CH, where foreign-seller VAT registration and VAT-inclusive consumer price display may
   apply from the first sale, and CA, where non-resident digital-vendor GST/HST and provincial rules may apply.
   A single-market campaign reduces the number of specialist opinions needed before starting.
2. **Claims option — campaign creative limited to claims already cleared in Phase 5C.** No sports, no « international
   channels », no channel/VOD counts, no replay, no « IPTV », no superlatives (`docs/seo/phase5c/claims-decisions.md`
   A1–A7, C1). Do not reuse the « Highlights » carousel sports images (`src/i18n/dictionaries/en.ts:103-117`) in ads.
3. **Price-message option — no « before taxes » or tax figure in ads.** Until issue A is decided, ad copy could
   avoid quoting prices, or quote them only where the tax adviser has confirmed the display rule for that market.
   The « Taxes $0.00 USD » checkout line should be decided (issue A, option A-1) before any traffic is paid for.
4. **Language option — English-only landing pages for paid traffic.** Until native-speaker validation (issue E),
   paid campaigns could point to the English site, which is the source text for the legal pages and the e-mails.
   If a translated landing page is used, the owner could limit it to fr (7 pending items, already the most reviewed)
   and keep de/nl/sv/nb out of paid campaigns.
5. **Confirmation option — fix e-mail trader identification first (issue B).** It is the lowest-effort item and
   gives every customer a durable record with the operator's identity; it could be done before any campaign.
6. **Withdrawal option — keep the generous 7-day + 14-day promises, but obtain counsel's view on the Norway/EEA and
   Switzerland wording and the start-of-service acknowledgement (issue D)** before campaigns in NO, CH or the EU.
7. **Record option — written risk acceptance.** For any item the owner decides to accept rather than fix, record the
   decision (date, scope, markets) in `docs/DECISIONS.md`, as done for D34/D65.

---

## A. Tax display and market-specific tax obligations

### Current implementation

**Configuration and launch gate**
- `src/config/site.ts:51` — `taxRules: null`. No tax rule of any kind is configured.
- `src/config/launch-gate.ts:17` and `:45` — `tax_rules_missing` is a launch blocker while `taxRules` is null. This
  gate only protects the automated checkout (`src/app/api/checkout/route.ts:13-14`); it does **not** apply to the
  assisted order flow (`src/app/api/contact/route.ts`, no launch-gate call).
- `src/lib/pricing.ts:51-52` and `:93` — every quote carries `taxMinor: null` (« Taxes are never computed before
  launch »).
- `src/app/api/quote/route.ts:32` — the server-side quote returns `taxes: { calculated: false, reason:
  'tax_rules_not_configured' }` and `chargeable: false` (`:33`).
- Prices exist in USD only: `src/lib/price-source.ts:21`, `:26` (rows whose currency is not USD are ignored);
  `src/config/price-tables.json` `_comment`: « planned prices (USD, before taxes), not yet approved for sale ».

**What the customer sees**
- Checkout review step (`src/components/CheckoutDialog.tsx:400-401`): a « Price » line with the server-confirmed
  amount, then a « Taxes » line whose value is the **hard-coded dictionary string** `checkout.taxesValue`
  (`src/i18n/dictionaries/en.ts:469-470`: `'$0.00 USD'`). The value does not come from the quote: the server says
  taxes are *not calculated*, while the screen says they are *zero*. The same hard-coded zero exists in all 8
  dictionaries (`de.ts:489`, `es.ts:489`, `fr.ts:489`, `it.ts:490`, `nb.ts:488`, `nl.ts:489`, `sv.ts:489`) and is
  pinned by tests (`tests/unit/translations.test.ts:135`, `tests/unit/release-flag.test.ts:106`).
- Plan simulator (`src/components/PlanConfigurator.tsx:316-324`): « Your price » / total with no tax qualifier.
- FAQ « How much does it cost? » (`en.ts:342-343`, rendered by `src/components/Sections.tsx` and published in the
  FAQPage JSON-LD, `src/components/StructuredData.tsx:64-78`): « … per year (USD, before taxes) … Taxes and the final
  price are always displayed before any purchase. »
- Help › Ordering & payment › « Prices and taxes » (`src/content/en/info.ts:272`): « Prices are shown in US dollars
  (USD) before taxes, and the price of your plan is shown before you send your order. »
- Terms › « Plans, prices and payment » (`src/content/terms.ts:49`): « Prices are shown in USD before taxes; the
  final price, taxes included, is always displayed before payment. Payment is arranged with our team… ». Payment
  happens on WhatsApp after activation (`src/content/en/info.ts:70-77`), outside the website, so the site cannot
  itself display a « final price, taxes included » before payment.
- Dictionary strings defined but **not found referenced by any component** (search of `src/components` and
  `src/app`; to be confirmed on the rendered page): `plans.footnote` (`en.ts:125`, « Prices in US dollars (USD),
  before taxes »), `plans.matrixCaption` (`en.ts:232`), `plans.details[1]` (`en.ts:238`, « Any applicable tax is
  shown before you confirm your order »). Translated equivalents exist, e.g. `de.ts:144` « zzgl. Steuern »,
  `fr.ts:144` « hors taxes », `nb.ts:143` « eksklusive avgifter ».
- E-mails: trial follow-up note « Prices per year in USD » (`src/lib/email/templates.ts:283`), no tax mention;
  « subscription now active » e-mail shows « Amount Paid » with no tax line (`templates.ts:314`).
- Phase 5C item **E1** (`docs/seo/phase5c/claims-decisions.md:30`): « Prices in USD, before taxes » ↔ « Taxes $0.00
  USD » — status « to clarify with the tax adviser », not blocked. Still open. The nb review flags the same point for
  Norway (`docs/i18n/phase10/review-nb.md`, « Needs owner/legal approval » item 3).

### Identified risk

1. **Internal inconsistency.** « Before taxes » + « Taxes $0.00 USD » + « final price, taxes included, is always
   displayed » cannot all be true at once, and the server explicitly reports taxes as not calculated. If tax is due,
   « $0.00 » understates the price; if no tax is due, « before taxes » is misleading.
2. **Consumer price display.** For consumers, the EU Price Indication Directive (98/6/EC, as amended by Directive
   (EU) 2019/2161) and the Consumer Rights Directive (2011/83/EU, art. 6(1)(e)) **may require** the total price
   inclusive of taxes. Comparable national rules **may apply** in the UK (consumer-protection rules on price
   information, incl. the Digital Markets, Competition and Consumers Act 2024), Norway (prisopplysningsforskriften /
   markedsføringsloven), Switzerland (Price Indication Ordinance — which may also require prices in CHF) and Canadian
   provinces (e.g. Québec's consumer-protection rules). US practice generally shows prices before sales tax, but this
   must also be verified per state.
3. **Foreign-seller indirect-tax registration (B2C electronically supplied / broadcasting services).** Any of the
   following **may apply** to a US LLC selling streaming subscriptions to consumers, possibly from the first sale:
   - **EU** (FR, DE, ES, IT, LU, NL, SE, IE): VAT at the customer's member-state rate; the **non-Union OSS scheme**
     may be the registration route. The EU-wide micro-business threshold is generally understood to apply only to
     EU-established sellers — verify. Rules on evidence of customer location (Implementing Regulation (EU)
     No 282/2011) may require keeping location evidence (e.g. declared country, phone country code, payment country).
   - **UK** (GB): VAT registration as a non-established taxable person for digital services to UK consumers —
     verify whether any threshold applies.
   - **Norway** (NO): **VOEC** simplified VAT scheme for e-services; a registration threshold exists — verify the
     current amount.
   - **Switzerland** (CH): VAT liability for foreign providers of electronic services; a threshold based on
     worldwide turnover exists — verify the current amount.
   - **Canada** (CA): federal GST/HST simplified registration for non-resident digital vendors (a threshold exists —
     verify), plus Québec QST and possibly provincial sales taxes on digital services (e.g. BC, Saskatchewan,
     Manitoba) — verify.
   - **United States**: state (and in some places local) sales or amusement taxes on streaming/digital services vary
     by state; economic-nexus rules (after *South Dakota v. Wayfair*, 2018) may create obligations once state
     thresholds are reached — verify per state. New Mexico gross receipts tax may apply to the operator's own
     receipts — verify.
4. **Records and invoices.** The « subscription now active » e-mail is explicitly not an invoice
   (`src/content/en/info.ts:23-29`); some schemes may require specific invoice or record-keeping content — verify.
5. **Price amount in the confirmation.** The « Amount Paid » in the conversion e-mail is recomputed from the current
   price table (`src/lib/telegram/ops.ts:417-423`), not taken from the amount actually received; if a manual payment
   differs (fees, currency conversion, tax added), the durable record may be wrong (see also issue B).

### Proposed correction or decision options

- **A-1 (immediate, wording/UI, after owner approval):** stop showing a figure the system has not computed. Options:
  (a) replace « $0.00 USD » with a neutral statement (e.g. « Calculated by our team before payment ») until tax
  rules exist; (b) remove the « Taxes » line; (c) feed the line from `quote.taxes` so it can only show a value the
  server computed. Wording to be approved by the owner and checked by the tax adviser.
- **A-2 (per-market tax assessment):** a tax adviser assesses, for each PRIORITY_MARKET (`src/i18n/locales.ts:41`),
  whether registration may be required, from when, under which scheme, and what records/evidence must be kept.
  Output: a written per-market table that can populate `siteConfig.taxRules`.
- **A-3 (price display decision per market):** once A-2 exists, decide for each market whether prices are shown
  tax-inclusive (consumer markets where this may be required) or tax-exclusive (e.g. US), and in which currency
  (CHF/EUR/GBP/NOK/CAD vs USD). This affects the price table design (USD only today).
- **A-4 (align texts):** align the FAQ (`en.ts:343`), Help (`info.ts:272`), Terms (`terms.ts:49`) and the e-mails
  with the decision, then propagate to the 7 translations (issue E).
- **A-5 (risk-limiting interim option):** limit campaigns to markets where A-2 is complete (see « Minimum safe
  scope »).

### Files potentially affected

`src/config/site.ts` (`taxRules`), `src/config/launch-gate.ts`, `src/lib/pricing.ts`, `src/lib/price-source.ts`,
`src/config/price-tables.json`, `scripts/generate-prices.mjs`, `src/app/api/quote/route.ts`,
`src/components/CheckoutDialog.tsx`, `src/components/PlanConfigurator.tsx`, `src/i18n/dictionaries/*.ts`
(`checkout.taxes`, `checkout.taxesValue`, `plans.footnote`, `plans.matrixCaption`, `plans.details`, `faq.items`),
`src/content/*/info.ts` (`prices` section), `src/content/terms.ts`, `src/lib/email/templates.ts`,
`src/lib/telegram/ops.ts`, `tests/unit/translations.test.ts`, `tests/unit/release-flag.test.ts`,
`tests/unit/api.test.ts`, `tests/unit/pricing.test.ts`, Supabase price/market tables.

### Required approval or specialist verification

Owner (price-display and market decisions); qualified tax adviser(s) for EU VAT/OSS, UK VAT, Norway VOEC, Swiss VAT,
Canadian GST/HST/QST/PST and US state sales tax incl. New Mexico; consumer lawyer for price-display rules in each
consumer market.

### Suggested acceptance criteria (testable)

1. No rendered page or dialog shows a tax amount that is not produced by the server quote: a unit test asserts that
   the checkout « Taxes » value is derived from `/api/quote` (or that the line is absent) and never from a constant.
2. For every PRIORITY_MARKET there is a written, dated tax-adviser entry (registration needed yes/no/when, scheme,
   display rule, currency), referenced from `docs/DECISIONS.md`.
3. `siteConfig.taxRules` is non-null only when (2) exists; `getLaunchBlockers()` still returns `tax_rules_missing`
   otherwise (existing test kept).
4. FAQ, Help, Terms and e-mails state the same tax rule in all 8 languages (grep test on the agreed wording).
5. In markets where tax-inclusive display is decided, the price shown in the simulator, checkout and e-mails equals
   the total payable (automated test per market).

### Severity: **BLOCKER**

Contradictory tax statements are shown today and the tax position of consumer sales in 12 non-US markets (and US
states) is unassessed; obligations may arise from the first sale.

---

## B. Trader identification in transactional confirmations

### Current implementation

- Operator identity is published on the website: Legal notice (`src/content/legal.ts:175-190`, facts from
  `siteConfig.legalEntity / legalAddress / legalCountry / companyNumber / supportEmail / supportPhone`), About page
  (`src/content/en/info.ts:95-109`). Privacy policy names the operator (`legal.ts:42`).
- E-mails are sent through Brevo from sender name **« SYGMA TV+ »**, `support@sygmatv.com`
  (`src/lib/email/send.ts:10`, `:25-27`). Templates are English only (`src/lib/email/templates.ts:1-2`,
  `<html lang="en">` at `:195`) whatever the site language.
- Common footer of every e-mail (`templates.ts:204`, plain text `:209`): « Questions? … support@sygmatv.com », « You
  receive this e-mail because you sent a request on sygmatv.com », link to the Privacy policy, « © SYGMA TV+ ».
  **No legal entity name, no geographic address, no registration/EIN, no link to Terms, Refunds or Legal notice.**
- Help block (`templates.ts:166-172`): WhatsApp number, e-mail, website.
- **Order received** e-mail, `preregistration_received` (`templates.ts:239-251`, sent by
  `src/app/api/contact/route.ts:81`): « Your order has been received! », plan label only; no price, no order
  reference, no trader identity, no Terms/withdrawal information.
- **« Your SYGMA TV+ Subscription Is Now Active! »**, `request_confirmed` (`templates.ts:306-332`, sent by
  `src/lib/telegram/ops.ts:411-429` when the team marks the order « Converti », i.e. after payment): Order Number,
  Plan, Duration, Devices, « Amount Paid » (`:314`, only if the price lookup succeeds — `ops.ts:424-425` sends it
  without the amount otherwise), « Payment Status: Paid », « Subscription Status: Active ». The amount is recomputed
  from the current price table (`ops.ts:417-423`), not the amount received. No tax line, no trader identity, no
  start/end date of the subscription, no Terms/Refunds/withdrawal information or link.
- Timeline (`src/content/en/info.ts:70-77`; `src/content/terms.ts:33`): contract « starts when we confirm your
  order » (on WhatsApp), access is activated, the customer pays, and only then the durable e-mail confirmation is
  sent. WhatsApp messages are not in the repository and cannot be audited here.

### Identified risk

- For distance contracts with consumers, the EU Consumer Rights Directive (2011/83/EU, art. 6(1)(b)-(c) and art. 8(7))
  **may require** the trader's identity and geographic address in the pre-contractual information and a
  **confirmation on a durable medium** within a reasonable time and at the latest before performance begins,
  including the pre-contractual information and, where relevant, the consumer's consent/acknowledgement for early
  performance (see issue D). Comparable rules **may apply** in the UK (Consumer Contracts (Information, Cancellation
  and Additional Charges) Regulations 2013), Norway (angrerettloven) and other markets. E-commerce information
  duties (e.g. Directive 2000/31/EC art. 5) may also be relevant.
- In the current flow, the durable confirmation is sent **after** activation and payment, and contains only the
  brand. A customer who never pays (or pays late) receives no durable confirmation with trader identity at all.
- The « Amount Paid » may not match what was actually paid (manual methods, fees, currency).
- English-only e-mails for customers who ordered on a translated page (see issue E).

### Proposed correction or decision options

- **B-1 (content, low effort):** add a fixed trader block to the common e-mail footer, sourced from
  `siteConfig` (legal name, geographic address, country of registration, contact e-mail/phone) plus links to Terms,
  Refunds & cancellations and Legal notice. Never hard-code the values; read them from `src/config/site.ts`.
- **B-2 (timing):** decide whether a durable confirmation with the key contract terms (plan, duration, devices,
  price incl. or excl. tax as decided in A, start date, withdrawal information) should be sent at order confirmation /
  before activation rather than only after payment — e.g. enrich the « order received » e-mail or add an
  « order confirmed » e-mail triggered when the team confirms on WhatsApp. Lawyer to confirm what is required when.
- **B-3 (amount):** record the amount actually received (and currency/method) when the team marks « Converti » and
  show that in the e-mail, instead of recomputing from the price table.
- **B-4 (language):** decide whether transactional e-mails follow the order language (requires the language to be
  stored with the request) or stay English with a translated header line.

### Files potentially affected

`src/lib/email/templates.ts`, `src/lib/email/send.ts`, `src/lib/telegram/ops.ts` (conversion flow and sample data
`:177-178`), `src/app/api/contact/route.ts`, `src/config/site.ts` (read only), Supabase `ops_invoice` RPC / request
tables (if the amount received is stored), e-mail tests under `tests/unit/`.

### Required approval or specialist verification

Owner (content and timing of e-mails); consumer lawyer (EU/EEA, UK) for the mandatory content and timing of the
durable-medium confirmation in an assisted WhatsApp sale; payment/ops owner for B-3.

### Suggested acceptance criteria (testable)

1. A unit test renders every `EmailKind` and asserts that HTML and plain text contain `siteConfig.legalEntity`,
   `siteConfig.legalAddress` and links to `/legal/terms`, `/legal/refunds`, `/legal/imprint`.
2. The test fails if any of those values is hard-coded in `templates.ts` rather than read from `siteConfig`.
3. The confirmation sent before or at the start of performance contains plan, duration, devices, price (with the tax
   treatment decided in A), start date and withdrawal information — content list signed off by the lawyer.
4. The « Amount Paid » shown equals the amount recorded by the team for that order (test with a recorded amount that
   differs from the price table).

### Severity: **MAJOR**

Identity is on the website but missing from every durable confirmation, and the confirmation comes after
performance starts; the fix is small once the content is approved, but it should precede scaled campaigns.

---

## C. Content distribution and broadcasting rights by target territory

### Current implementation

- `src/config/site.ts:45-46` — `licensedTerritories: []` (« ISO market codes with VERIFIED written redistribution
  rights. None yet. »); `:47-48` — `contentCatalog: null` (« categories shown are illustrative »).
- `src/config/markets.ts:14-21` — every market `licensed: false` (the type even fixes it to `false`). Note: this
  legacy file only knows `US`, `CA`, `EU` and durations `[1, 3, 6, 12]` (`:1-4`), which no longer match the 13
  PRIORITY_MARKETS (`src/i18n/locales.ts:41`, incl. non-EU GB, CH, NO) or the 12/24/36-month terms
  (`src/lib/pricing.ts:8`).
- Launch gate: `no_licensed_territory` (`src/config/launch-gate.ts:39`) blocks only the automated checkout
  (`src/app/api/checkout/route.ts:13-14`). The DB-side rule (`markets.licensed` / `sales_enabled`, `launch-gate.ts:5-6`)
  also concerns the automated order path.
- **The assisted order flow is not gated by licensing:** `src/app/api/contact/route.ts:18-81` stores the order and
  sends the « order received » e-mail without checking any market or licence; the country field accepts any ISO
  code (`src/lib/validation.ts:22-23`) and the picker lists 245 countries (`src/config/countries.json`).
  `docs/DECISIONS.md` D65 records that broadcasting rights per country are still unconfirmed and are the owner's
  responsibility.
- What the site states:
  - Terms › The Service (`src/content/terms.ts:41`): « Content depends on the licences available in each country
    and may change. »
  - FAQ « Which countries are available? » (`en.ts:334-335`): « Our team confirms availability for your country
    before you order. » Nothing in the code enforces this.
  - `footer.compliance2` (`en.ts:549`): « Each country opens only once broadcasting authorisations are in place. »
    and `coverage.notLicensed: 'Available'` (`en.ts:497`, i.e. the label for an unlicensed market reads
    « Available »). Neither string was found referenced by any component (to be confirmed on the rendered page); the
    second would be misleading if reused.
  - Content categories: « Sports — Depending on the channels available in your country » (`en.ts:252`), « Live TV —
    Channels organised by region, depending on your country » (`en.ts:254`).
  - « Highlights » carousel (`en.ts:103-117`, rendered by `src/components/Featured.tsx`): six **SPORTS** tiles
    (Football night, Basketball, American football, Ice hockey, Motorsport, Tennis), all labelled region
    « International ».
  - Trial follow-up e-mail: « We hope you enjoyed your favourite sports, movies, series and live TV »
    (`src/lib/email/templates.ts:280`).
- Removed or neutralised in Phase 5C / 6A: channel and VOD counts hidden (`src/config/catalogue.ts:10-17`, D34);
  footer tagline now « Movies • Series • Live TV » and footer text without « live sports / international channels »
  (`en.ts:536-539`). Phase 5C decisions A1–A7 and C1 (`docs/seo/phase5c/claims-decisions.md:15-22`) remain the
  reference; `docs/seo/phase5c/finalisation.md` §2 lists A4 (sports) and A5 (international channels) as « blocked —
  decision required ».

### Identified risk

- Selling access to live TV, sports, films and series in a territory without the corresponding distribution /
  retransmission rights **may** expose the operator to copyright and related-rights claims, broadcasting or media
  regulation, and consumer-protection or advertising complaints in that territory. This register cannot assess the
  rights position: no rights documentation is in the repository.
- The launch gate gives a false sense of protection: it blocks the unused automated checkout while the assisted flow
  — the one actually used — takes orders from every country.
- Sports imagery and « International » region labels may be read as a promise of sports and international channels,
  which Phase 5C classed as requiring proof of rights (A4, A5).
- The statement « Each country opens only once broadcasting authorisations are in place » (if displayed anywhere,
  incl. translations) would be contradicted by the actual practice.

### Proposed correction or decision options

- **C-1 (rights evidence):** obtain written distribution rights per territory from the content provider(s); record
  the territories in `siteConfig.licensedTerritories` only once a media/IP lawyer has reviewed the documents.
- **C-2 (gate the assisted flow — owner decision):** options: (a) accept orders only from countries in
  `licensedTerritories` (server-side check in `/api/contact` for order requests); (b) keep accepting all countries
  but flag non-licensed countries to the team in the ops card and require a written check before activation;
  (c) documented risk acceptance by the owner. Option (a) makes the FAQ promise enforceable.
- **C-3 (claims):** decide A4/A5 (`finalisation.md` §2): remove or replace the sports tiles and « International »
  labels, or keep them with rights evidence; align the trial follow-up e-mail wording.
- **C-4 (cleanup):** retire or update `src/config/markets.ts` so the licence flags cover the 13 PRIORITY_MARKETS; fix
  or delete the unused `coverage.notLicensed: 'Available'` string so it cannot be reused as-is.

### Files potentially affected

`src/config/site.ts` (`licensedTerritories`, `contentCatalog`), `src/config/markets.ts`, `src/config/launch-gate.ts`,
`src/app/api/contact/route.ts`, `src/lib/validation.ts`, `src/lib/telegram/ops.ts`, `src/components/Featured.tsx`,
`src/i18n/dictionaries/*.ts` (`featured.items`, `content.categories`, `footer.compliance2`, `coverage`, `faq.items`),
`src/lib/email/templates.ts`, `src/content/terms.ts`, Supabase `markets` table, `docs/DECISIONS.md`.

### Required approval or specialist verification

Owner (market scope, claims, risk acceptance); media / IP lawyer in each target territory (and in the US for the
operator); content provider (written territorial rights).

### Suggested acceptance criteria (testable)

1. `siteConfig.licensedTerritories` lists only territories with a dated, lawyer-reviewed rights record referenced in
   `docs/DECISIONS.md`.
2. If option C-2(a) is chosen: an API test posts an order request with a country outside `licensedTerritories` and
   expects a refusal (or the agreed flag), and one inside and expects success.
3. A content test asserts that no rendered page or e-mail contains the A1–A7/C1 claims or sports tiles unless the
   corresponding decision is recorded as « keep with proof ».
4. No dictionary key maps an unlicensed market to « Available » (unit test on `coverage`).

### Severity: **BLOCKER**

No territory has documented rights while orders are accepted from all countries; this is the core legal exposure of
the business model and cannot be mitigated by wording alone.

---

## D. Consumer withdrawal rights (EU / EEA incl. Norway, Switzerland, UK)

### Current implementation

- Refunds & cancellations page (`src/content/legal.ts:132-173`, English only for every language —
  `src/app/[locale]/legal/[doc]/page.tsx:13-14`):
  - Free trial (`:138`, duration from `siteConfig.trialDuration`, `site.ts:24`).
  - « Satisfied or refunded — 7 days »: « Ask within 7 days of activation and we refund 100%, no questions asked. One
    refund per customer; not available for accounts suspended for sharing or reselling access. » (`:146`)
  - **« EU and UK customers »**: « You also have 14 days to withdraw. After the first 7 days, we refund the unused part
    of your subscription. » (`:152-154`)
  - « You are refunded within 14 days, to the payment method you used. » (`:162`)
  - « Subscriptions are not refundable after these periods, unless the law requires it. They never renew
    automatically. » (`:170`)
- Terms › Renewal, cancellation and refunds (`src/content/terms.ts:57`): « EU and UK consumers also have a 14-day
  right of withdrawal … your statutory consumer rights always apply. » Governing law New Mexico with mandatory
  consumer-protection rules of the country of residence preserved (`terms.ts:81`).
- Same promises repeated in: FAQ « Can I cancel? » (`en.ts:346-348`: « EU and UK customers also keep their 14-day
  withdrawal right »), plan details (`en.ts:240`: « Statutory withdrawal rights always apply » — not found rendered),
  About › commitments (`src/content/en/info.ts:127`), Help › Refunds (`info.ts:319-329`), refunds meta description
  (`en.ts:526`), and the 7-day money-back badges (`en.ts:40`, `:153`, `:215`, `:299`, `:307`, `:441`, `:449`,
  `:548`). `site.ts:54-55`: `refundPolicy: 'satisfied-or-refunded-7-days'`.
- **Not present anywhere** in `src/content` or the English dictionary (search for EEA, Norway, Switzerland, waive,
  acknowledg, withdrawal form): no mention of EEA/Norway or Switzerland, no model withdrawal form or instructions,
  no step where the customer expressly requests that the service start during the withdrawal period and
  acknowledges the consequence. Access is activated on WhatsApp before payment and before any durable confirmation
  (issue B).
- Payment methods include cryptocurrency, Western Union and MoneyGram (`src/content/en/info.ts:39`), against the
  promise of refund « to the payment method you used ».
- The nb review flags that « EU og Storbritannia » excludes Norway on a Norway-market page
  (`docs/i18n/phase10/review-nb.md`, « Needs owner/legal approval » item 1); the fr review asks legal to confirm that
  « always applies » holds once a digital service has started (`review-fr.md`, item 7).

### Identified risk

- **Norway / EEA:** Norway is in the EEA, not the EU; Norwegian consumers **may** have a statutory 14-day right under
  angrerettloven. Limiting the statement to « EU and UK customers » may misinform Norwegian (and Icelandic /
  Liechtenstein) consumers.
- **Switzerland:** Swiss law is understood to differ from the EU regime (a statutory cooling-off right in the Code
  of Obligations is generally associated with doorstep and telephone sales). Whether an assisted WhatsApp sale falls
  within any Swiss rule, and how the voluntary 7-day guarantee should be described to Swiss consumers, must be
  verified with a Swiss lawyer.
- **Start of performance during the withdrawal period:** under the EU Consumer Rights Directive (arts. 7(3), 8(8),
  14(3), 16(a)/(m)) and the UK 2013 Regulations, the treatment of a service or digital content that starts within the
  14 days **may depend** on an express request / acknowledgement obtained before performance and confirmed on a
  durable medium. Without it, the consumer may be entitled to withdraw without paying for the period used. The
  « refund the unused part after day 7 » rule may or may not match what the law allows once those steps are in place.
  Classification of the subscription (service vs digital content/digital service under Directive (EU) 2019/770) must
  be confirmed by counsel.
- **Information duties:** if the withdrawal information (conditions, time limit, procedure, model form) is not
  provided as required, the withdrawal period **may be extended** (CRD art. 10) — verify.
- **Restrictions on the voluntary guarantee:** « One refund per customer » and the suspension exclusion apply to the
  commercial 7-day guarantee; counsel should confirm they cannot be read as restricting the statutory right.
- **Operational:** refunds « to the payment method you used » within 14 days may be hard to execute for Western
  Union, MoneyGram or crypto payments.

### Proposed correction or decision options

- **D-1 (territorial wording):** with counsel, choose a formulation such as « customers in the EU/EEA (including
  Norway) and the UK » and decide what is said to Swiss and other customers (e.g. the voluntary 7-day guarantee only,
  or a voluntary 14-day right for everyone). Then update the English source and all 7 translations together (issue E).
- **D-2 (withdrawal information):** add the statutory withdrawal information and a model withdrawal form (or link)
  to the Refunds page and to the durable confirmation (issue B-2), as counsel specifies.
- **D-3 (express request before activation):** decide how the customer expressly requests early start and
  acknowledges the consequence before access is activated (e.g. a checkbox on the order form with stored consent
  version, as done for contact consent — `site.ts:59-60`; or a written confirmation on WhatsApp mirrored in the
  e-mail). Counsel to confirm what is sufficient.
- **D-4 (refund mechanics):** document how refunds are executed for each payment method; adjust the « to the payment
  method you used » wording if needed.

### Files potentially affected

`src/content/legal.ts` (REFUNDS), `src/content/terms.ts`, `src/content/*/info.ts` (refunds topic, commitments),
`src/i18n/dictionaries/*.ts` (`faq.items`, `plans.details`, `legal.docs.refunds`, checkout consent strings),
`src/components/CheckoutDialog.tsx` (if a consent checkbox is added), `src/lib/validation.ts`,
`src/app/api/contact/route.ts`, `src/lib/email/templates.ts`, `src/config/site.ts` (`consentTextVersion`),
Supabase `contact_requests` (stored acknowledgement).

### Required approval or specialist verification

Owner (generosity of the policy, wording, operational refund process); consumer lawyers for the EU (at least one
member state of sale), Norway, Switzerland and the UK; payment/ops owner for D-4.

### Suggested acceptance criteria (testable)

1. A grep test asserts that no page in any language restricts the 14-day right to « EU and UK » if counsel's decision
   includes the EEA (wording fixed by the decision record).
2. The Refunds page contains the counsel-approved withdrawal information and a model form or link (content test).
3. If D-3 is chosen: the order request cannot be submitted without the early-start acknowledgement; the stored record
   includes the consent text version (API test), and the durable confirmation repeats it (e-mail test).
4. A dated decision in `docs/DECISIONS.md` covers Switzerland and non-EEA markets explicitly.

### Severity: **MAJOR**

The site is generous rather than restrictive, but Norway/EEA and Switzerland are not addressed and the early-start
acknowledgement is missing; counsel may raise this to BLOCKER for EU/EEA/UK campaigns.

---

## E. Native-speaker validation of the 7 translated languages

### Current implementation

- Languages: en (source) + fr, de, es, it, nl, sv, nb (`src/i18n/locales.ts:65-72`). The 7 translations have status
  `preview` and are enabled only when released by configuration (`locales.ts:66-72`, `:90`).
- Review status (`docs/i18n/phase10/README.md:3-4`): « automated (AI) review, not native-speaker validation ». Items
  awaiting owner/legal approval per language (`README.md` table): fr 7, de 13, es 8, it 5, nl 14, sv 12, nb 6 —
  **65 in total**. Next step stated: « native-speaker review per language (priority de, nl, sv, nb), then the owner's
  decisions on the "Needs owner/legal approval" sections ».
- Themes of the 65 pending items (from the « Needs owner/legal approval » sections of `review-<lang>.md`):
  - refund / money-back / withdrawal wording (all 7 languages; e.g. es items 1-4, it 1-2, nl 3-4 and 11, sv 5-10,
    de 3-5, nb 1 and 4, fr 3-4 and 7);
  - licensing statement `footer.compliance2` (fr 1, de 11, es 5, it 3, nl 9, sv 11) — sv notes that
    « sändningstillstånd » is a specific regulatory term that may imply more than intended;
  - consent / cookie / data-retention wording (de 6 and 12, es 6, it 4, nl 1-2, sv 1-4, nb 5-6);
  - contract formation « the contract starts when… » (fr 5, de 9, nl 12) — de notes « kommt zustande » (formation) is
    legally different from « beginnt » (start);
  - « Lifetime » term label (de 8, nl 14), payment-method wording (nl 10), « 6 languages » support and absence of
    Norwegian support (nb 2), « before taxes » shown to Norwegian consumers (nb 3, cross-reference issue A);
  - one item already corrected after review: German « Verlängert sich nicht » → « Endet automatisch »
    (`README.md`, commit 8946645).
- Support languages declared (`src/content/en/info.ts:37`): English, French, Arabic, German, Spanish, Italian — not
  Dutch, Swedish or Norwegian. Owner decision: human support in English for nl/sv/nb customers. The nl/sv/nb pages
  state « 6 languages » (e.g. `nl.ts:25`, `:113`, `:173`; `nb.ts:24`, `:112`, `:172`) and list those languages
  (`src/content/nl/info.ts:26`, `:101`), but do not say explicitly that support for their customers is in English
  (nb review item 2 proposes a sentence).
- Legal pages are English only for every language and translated pages mark links « (in English) »
  (`src/app/[locale]/legal/[doc]/page.tsx:13-14`; e.g. `src/content/nl/info.ts:120-122`, `:322-325`).
  Transactional e-mails are English only (`src/lib/email/templates.ts:1-2`).

### Identified risk

- Commercial and legal-adjacent promises (refund conditions, withdrawal right, contract formation, licensing
  statement, consent texts) are published in 7 languages without native validation; a mistranslation may create a
  promise that differs from the English source (the German « cannot be renewed » case shows this happens).
- Consent texts in an unvalidated translation may weaken the evidence value of the consent.
- Customers on nl/sv/nb pages may expect support in their language; « 6 languages » without an explicit
  « support in English » note may be read as misleading.
- Some consumer-protection rules **may** require pre-contractual information or terms to be available in a specific
  language in certain markets (verify per market with counsel); today legal pages are English only.

### Proposed correction or decision options

- **E-1:** commission native-speaker review in the stated order de → nl → sv → nb, then fr, es, it; each reviewer
  works from the corresponding `review-<lang>.md` and signs off the « Unverified » list.
- **E-2:** owner decides each of the 65 « Needs owner/legal approval » items (apply proposal / keep / other), legal
  sign-off for refund, withdrawal, consent, contract and licensing items; decisions logged per item.
- **E-3:** decide the English-support statement for nl/sv/nb (e.g. nb proposal: « Vi har foreløpig ikke kundestøtte
  på norsk – skriv gjerne til oss på engelsk », with nl/sv equivalents) — wording to be validated by native
  reviewers.
- **E-4:** with counsel, decide whether translated legal pages or translated key terms are needed for any market.
- **E-5 (interim):** keep the translated languages in `preview` for paid traffic until E-1/E-2 are done for that
  language (see « Minimum safe scope »).

### Files potentially affected

`src/i18n/dictionaries/{fr,de,es,it,nl,sv,nb}.ts`, `src/content/{fr,de,es,it,nl,sv,nb}/info.ts`,
`src/i18n/locales.ts` (release status), `tests/unit/translations.test.ts`, `tests/unit/i18n-allow/*.json`,
`docs/i18n/phase10/review-*.md` (sign-off), possibly new translated legal pages and e-mail templates.

### Required approval or specialist verification

Native-speaker reviewers (professional, ideally with consumer-law vocabulary) for each language; owner for the 65
items and the support-language statement; consumer lawyer for refund/withdrawal/consent/contract wording and for
language requirements per market.

### Suggested acceptance criteria (testable)

1. Each `review-<lang>.md` carries a native reviewer's name/role and date, and every « Unverified » point is marked
   resolved or accepted.
2. All 65 « Needs owner/legal approval » items have a recorded decision; the applied ones pass
   `tests/unit/translations.test.ts`.
3. nl, sv and nb pages contain the approved « support in English » statement (grep test per language).
4. A language is switched from `preview` to `enabled` for campaigns only after (1)-(2) are done for it.

### Severity: **MAJOR**

Legal-adjacent wording in 7 languages is unvalidated and at least one material mistranslation has already been
found; it limits campaigns in those languages rather than the English launch.

---

## Sources read for this register

`src/config/site.ts`, `src/config/launch-gate.ts`, `src/config/markets.ts`, `src/config/catalogue.ts`,
`src/config/price-tables.json`, `src/i18n/locales.ts`, `src/i18n/dictionaries/en.ts` (and tax strings of the 7
translations), `src/content/legal.ts`, `src/content/terms.ts`, `src/content/en/info.ts`, `src/content/nl/info.ts`,
`src/lib/email/templates.ts`, `src/lib/email/send.ts`, `src/lib/telegram/ops.ts`, `src/lib/pricing.ts`,
`src/lib/price-source.ts`, `src/lib/validation.ts`, `src/app/api/checkout/route.ts`, `src/app/api/quote/route.ts`,
`src/app/api/contact/route.ts`, `src/app/[locale]/legal/[doc]/page.tsx`, `src/components/CheckoutDialog.tsx`,
`src/components/PlanConfigurator.tsx`, `src/components/Sections.tsx`, `src/components/StructuredData.tsx`,
`src/components/Featured.tsx`, `docs/DECISIONS.md`, `docs/seo/phase5c/claims-decisions.md`,
`docs/seo/phase5c/finalisation.md`, `docs/i18n/phase10/README.md`, `docs/i18n/phase10/review-*.md`.
Line numbers refer to commit `5305a38`.
