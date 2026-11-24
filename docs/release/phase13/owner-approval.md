# SYGMA TV+ — Owner decision document (single sheet)

**Updated:** 24 November 2026 · **Base:** release candidate `7a6577f` (branch `claude/phase13-release`) · **Prepared
by:** Claude Code (documentation only; no source, configuration, database or deployment change)

This is the **one** owner decision document. It replaces the 23/11 checklist and keeps its item IDs (A0–A7, B1–B10,
C1–C8, design items D-1…D-6); new IDs were added only where an item had to be split (A8–A13, B11, B12, C9).
`reg. Dn` = an entry of `decision-register.md` (D1–D16); `L-nn` = `legal-blocker-register.md`; `fr 4`, `de 7`… =
rows of `docs/i18n/phase11/sensitive-wording-register.md`. The design items D-1…D-6 are **not** the register IDs.

**How to use.** For each item, tick one box, add date and initials, attach the evidence asked for. The first option is
the recommended (most cautious) one; it is not a legal opinion. Items in parts 2–4 need the named specialist's
written answer before the box is ticked.

**Not legal or tax advice.** Nothing here states a legal conclusion, assumes that a right, licence, tax registration
or approval exists, or claims legal clearance or native-speaker validation. All wording proposals quoted in the
wording annex are **proposals for counsel review — not legal advice**.

---

## 0. Facts recorded on 24/11/2026

Owner decisions and statements (recorded as stated by the owner) and verified repository / deployment facts:

1. **A0 done.** Emergency hotfix `8797d7c` deployed to production on 24/11/2026 (owner-authorized; deploy run
   45295930207; Worker code version `b58996db-87c2-4f3a-adb2-c6293a061310`): order, trial and support forms closed
   (`FEATURE_CONTACT_FORM=false`), English only. Production otherwise still shows the pre-Phase-10 English content,
   including per-plan figures « +12,000 / +25,000 / +35,000 » and « +100,000 / +150,000 / +200,000 » and the banner
   « … from multiple countries » (`git show 8797d7c:src/i18n/dictionaries/en.ts`, lines 137–138 and 313).
2. **Private staging runs the release candidate `7a6577f`** (deployed 24/11/2026, Worker version
   `a48c4903-5e4f-4670-8f30-d28d8528fffd`), protected by Cloudflare Access, noindex.
3. **D1 / A1 decided by the owner: all 8 languages simultaneously** (not English first). The production configuration
   is **prepared, not activated**: branch `claude/release-8lang-config`, commit `8dbb442` (descendant of `7a6577f`):
   `.env.production` adds `NEXT_PUBLIC_RELEASED_LANGUAGES=fr,de,es,it,nl,sv,nb` and `NEXT_PUBLIC_CONTENT_PAGES=live`
   (`FEATURE_CONTACT_FORM=false`, `SALES_ENABLED=false` unchanged); `LEGACY_REDIRECT_LANGUAGES` = all 7 releasable
   languages (`src/i18n/locales.ts`) for rollback safety. Validated: 680 unit tests, production-build crawl 85
   indexable URLs, 0 issues. **Activation still needs an explicit deployment approval and the prelaunch-blocking items
   below.**
4. **Supplier-confirmed overall catalogue specifications** (owner statement): **35,000+ TV channels; 200,000+ movies
   and series; 4K HDR on compatible content and devices.** These are overall catalogue figures, **not per-plan
   guarantees and not broadcasting rights**. The written supplier confirmation is not in the repository. Presentation
   proposal ready (commit `5edf71a`): **see supplier-specs proposal** (`docs/release/final/supplier-specs-proposal.md`, branch
   `claude/f14-specs`).
5. **Proposals prepared in parallel** (referenced, not summarised here): DB language migration
   `docs/release/final/db-locale-migration.md` (B10); data retention `docs/release/final/data-retention.md` (C6);
   cookie / analytics reconciliation `docs/release/final/cookie-analytics-reconciliation.md` (A4); native-review
   workbooks `docs/i18n/review-workbooks/` (A5).

---

## Status summary

Prelaunch = public 8-language prelaunch (activation of `8dbb442`, orders closed). Sales = reopening orders/trials
(`FEATURE_CONTACT_FORM=true`) or taking payment by any channel. « Rec. » = recommended to decide first.

| Item | Topic | Part | Blocks prelaunch | Blocks sales | Status |
|---|---|---|---|---|---|
| A0 | Close live forms; Step A deployment | 1 Technical | No | No | Forms closed: **done**; Step A open |
| A1 | Release scope (reg. D1) | 1 Technical | **Yes** | No | **Decided** (8 languages); activation open |
| A3 | Support wording, WhatsApp (reg. D8) | 1 Technical | **Yes** | Rec. | Implemented, awaiting approval |
| A6 | Team procedure during prelaunch (reg. D14) | 1 Technical | **Yes** | No | Open |
| A8 | IndexNow at activation | 1 Technical | **Yes** (decide before push) | No | Open |
| A9 | Publish `llms.txt` | 1 Technical | No | No | Open (optional) |
| A10 | « Last reviewed » dates | 1 Technical | **Yes** (release commit) | No | Open |
| A11 | `domain` config value | 1 Technical | No | **Yes** (checkout gate) | Open |
| A12 | Monitoring log output (D13-010) | 1 Technical | No | No | Open |
| A13 | CI / secrets hardening (D13-003/004/005, 012) | 1 Technical | Rec. | Rec. | Open |
| B1 | Reopening rule (reg. D16) | 1 Technical | No | **Yes** | Open |
| B10 | DB language migration (`contact_requests.locale`) | 1 Technical | No | **Yes** | Proposal ready (`1c8c794`), not applied |
| B11 | Engineering checks before reopening | 1 Technical | No | **Yes** | Open |
| C7 | Payment and activation providers | 1 Technical | No | **Yes** | Open |
| D-1…D-6 | Design choices (reg. D13) | 1 Technical | No | No | Open (optional) |
| A4 | Cookie policy and banner (reg. D9) | 2 Legal | **Yes** (rec.) | **Yes** | Reconciliation + exact texts ready, not published |
| A7 | Prelaunch wording touching legal topics | 2 Legal | Rec. | **Yes** | Open |
| B3 | Withdrawal right (reg. D3, L-03) | 2 Legal | Rec. (nb page) | **Yes** | Counsel to draft |
| B4 | Refunds (reg. D4, L-04) | 2 Legal | No | **Yes** | Counsel to draft |
| B5 | Terms and order sequence (reg. D5, L-05) | 2 Legal | Rec. | **Yes** | Counsel to draft |
| B6 | « +30 days free », « Regular price » (reg. D7) | 2 Legal | No | **Yes** | Open |
| B7 | Confirmation e-mails (L-08) | 2 Legal | No | **Yes** | Open |
| B8 | Legal-page languages; 36 sensitive wordings (reg. D10, D11) | 2 Legal | Rec. | **Yes** | Open |
| B12 | Auto-renewal and guarantee labels (reg. D12) | 2 Legal | No | **Yes** | Open |
| C5 | Seller identity (L-07) | 2 Legal | Rec. | **Yes** | Open |
| C6 | Data retention (L-06) | 2 Legal | No | **Yes** | Proposal ready (`71a9583`), not applied |
| C9 | EU/UK representative, processors (L-06) | 2 Legal | No | **Yes** | Open |
| B2 | Tax line and tax wording (reg. D2, L-02) | 3 Tax | Rec. (via A7) | **Yes** | Open |
| C2 | Tax registrations and price display (L-02) | 3 Tax | No | **Yes** | Open |
| C3 | Amount actually received; past conversions (L-09) | 3 Tax | No | **Yes** | Open |
| C4 | Invoices (L-08) | 3 Tax | No | **Yes** | Open |
| A2 | Content and device wording, Terms « sports » (reg. D6) | 4 Rights | **Yes** | **Yes** | Implemented in part, awaiting approval |
| A2b | Supplier-confirmed catalogue figures (reg. D6) | 4 Rights | No | No | Proposal ready (`5edf71a`), not merged |
| B9 | Country gate for orders (L-01) | 4 Rights | No | **Yes** | Open |
| C1 | Distribution rights per territory (L-01) | 4 Rights | Rec. | **Yes** | Open |
| C8 | Trademark and platform names (L-13) | 4 Rights | Rec. | **Yes** | Open |
| A5 | Native-speaker sign-off fr, de, es, it, nl, sv, nb (reg. D15) | 5 Native | **Yes** (each language) | **Yes** (legal-adjacent text) | Workbooks ready (`docs/i18n/review-workbooks/`); 0 of 7 signed |

**Before activating the 8-language prelaunch (`8dbb442`):** A1 activation approval, A2, A3, A4, A5 (all seven
languages, because all are released together), A6, A8, A10 — and, recommended, A7, B3 (nb page), B5, B8, C1, C5, C8.
**Before reopening orders or taking payment:** every item marked **Yes** in « Blocks sales ».

---

## Part 1 — Technical decisions (owner decides alone)

### A0 — Live forms closed; production Step A
- **Question:** The live forms are closed (done). Deploy the release candidate `7a6577f` to production now as
  Step A (English prelaunch with the Phase 10–13 content), or wait and deploy only with the 8-language activation?
- **Current implementation:** production `8797d7c` (Fact 1) shows per-plan channel/VOD figures and « from multiple
  countries »; `7a6577f` removes them (`src/config/catalogue.ts:14-16` all `null`; no such banner text in
  `src/i18n/dictionaries/en.ts`). `7a6577f` runs on private staging (Fact 2). `8dbb442` contains `7a6577f`.
- **Recommended option:** Step A now, after the staging checks: record the active production Worker version ID
  first; keep `FEATURE_CONTACT_FORM=false` in any rollback target (pattern `cfc744e`); never `wrangler rollback`
  without a version ID (`security-report.md` §4).
- **Alternatives:** (b) no Step A — go straight to the 8-language activation (A1).
- **Consequences:** (a) production stops showing per-plan figures not covered by the supplier confirmation and the
  « from multiple countries » banner; one extra deployment. (b) these texts stay live until activation, whose date
  depends on A5.
- **Blocks public prelaunch?** No (activation includes it). **Blocks commercial sales?** No.
- **Owner answer:** ☒ forms closed by `8797d7c` (24/11/2026) · ☐ (a) deploy Step A · ☐ (b) wait for A1 activation ·
  Date ____ Initials ____

### A1 — Release scope (reg. D1) — DECIDED 24/11/2026
- **Question:** Approve the activation of the prepared configuration `8dbb442` (staging first, then production), and
  on which date?
- **Current implementation:** Fact 3. Production and `7a6577f`: `.env.production` has no `NEXT_PUBLIC_RELEASED_LANGUAGES`
  / `NEXT_PUBLIC_CONTENT_PAGES`; `src/i18n/locales.ts:150` `LEGACY_REDIRECT_LANGUAGES = ['fr']`. Post-deploy commands:
  `d1-release-config.md` §7.
- **Recommended option:** activate only when the prelaunch-blocking items (summary above) are ticked; staging first,
  then production; record the active Worker version ID before deploying.
- **Alternatives:** (b) activate now, before A2–A6 are closed (written risk acceptance in `docs/DECISIONS.md`).
- **Consequences:** (a) release date = date of the last prelaunch-blocking approval (in practice the slowest native
  reviewer, A5). (b) 85 indexable URLs published in 8 languages with AI-only translations and pending legal-adjacent
  wording; a later correction means re-indexing.
- **Blocks public prelaunch?** Yes (it is the publication). **Blocks commercial sales?** No.
- **Owner answer:** ☒ scope: all 8 languages simultaneously, content pages live (owner, 24/11/2026) · ☒ rollback
  redirects for all releasable languages (in `8dbb442`) · Activation: ☐ (a) when the blocking items are ticked
  ☐ (b) now, with risk acceptance · Approved deployment date ____ Initials ____

### A3 — Support wording and WhatsApp during prelaunch (reg. D8, L-10)
- **Question:** Approve the merged Phase 13 support wording and the « e-mail only while closed » contact rule?
- **Current implementation:** implemented in `aad188e` (merged `eed9824`): « 24/7 assistant, human help when needed »;
  WhatsApp not offered as a contact on marketing/help pages while closed; Legal notice keeps Phone/WhatsApp
  (`src/content/legal.ts:187`). Exact texts: wording annex W3.
- **Recommended option:** approve as merged.
- **Alternatives:** (b) approve the wording but keep WhatsApp visible with the prelaunch note; (c) return to « 24/7
  support in 6 languages ».
- **Consequences:** (a) no change. (b) a visible number invites order requests the prelaunch notice says cannot be
  made. (c) re-creates the « human 24/7 in my language » reading (nl/sv/nb get human help in English).
- **Blocks public prelaunch?** Yes (recommended). **Blocks commercial sales?** Recommended (claims must stay accurate).
- **Owner answer:** ☐ (a) ☐ (b) ☐ (c) · Date ____ Initials ____

### A6 — Team procedure during prelaunch (reg. D14)
- **Question:** Issue a written team rule for the period while orders are closed?
- **Current implementation:** staff « Converti » / « Essai envoyé » send e-mails without checking
  `FEATURE_CONTACT_FORM` (`src/lib/telegram/ops.ts:373-380`); the hourly cron (`wrangler.jsonc:7`) sends trial
  follow-ups « Ready to keep watching? » (`src/app/api/cron/review-invites/route.ts:40-53`,
  `src/lib/email/templates.ts:281`); social posts are outside the repository.
- **Recommended option:** no « Essai envoyé » / « Converti » actions and no social posts offering orders or trials
  while closed; optionally a code guard (B11).
- **Alternatives:** (b) team continues trials/sales on WhatsApp — then parts 2–4 apply now, not at reopening.
- **Consequences:** (a) consistent « opening soon » message. (b) sales take place before the tax, rights and legal
  items are answered.
- **Blocks public prelaunch?** Yes (procedure in place). **Blocks commercial sales?** No.
- **Owner answer:** ☐ (a) issued to the team on ____ ☐ (b) · Initials ____

### A8 — IndexNow at activation (new ID; was part of A6)
- **Question:** Send the changed URLs (≈ 85) to IndexNow when `8dbb442` is deployed?
- **Current implementation:** dry run unless the repository variable `INDEXNOW_ENABLED=true`
  (`.github/workflows/deploy-cloudflare.yml:136-142`); reaches Bing, Yandex and others, not Google
  (`d1-release-config.md` §4). A rollback with IndexNow on also submits the removed URLs.
- **Recommended option:** on at activation.
- **Alternatives:** (b) dry run (URLs listed in the job summary only).
- **Consequences:** (a) faster discovery by IndexNow engines. (b) discovery through the sitemap only.
- **Blocks public prelaunch?** Yes — the variable must be set before the push, either way. **Blocks sales?** No.
- **Owner answer:** ☐ (a) on ☐ (b) dry run · Date ____ Initials ____

### A9 — `llms.txt` (new ID)
- **Question:** Publish `/llms.txt` from the draft `docs/release/phase13/llms-draft.txt`?
- **Current implementation:** draft only; no `public/llms.txt` in `7a6577f`.
- **Recommended option:** publish with the activation, after checking it against the final approved wording (A2–A4).
- **Alternatives:** (b) do not publish.
- **Consequences:** (a) one more file to keep in line with the site text. (b) none.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** No.
- **Owner answer:** ☐ (a) ☐ (b) · Date ____ Initials ____

### A10 — « Last reviewed » dates (new ID)
- **Question:** Set the « last reviewed » dates to the real final review date in the release commit?
- **Current implementation:** `20 November 2026` and translations in `src/content/en/info.ts:13`, `fr/info.ts:14`,
  `nl/info.ts:13`, `de/info.ts:388`, `es/info.ts:383`, `it/info.ts:384`, `sv/info.ts:385`, `nb/info.ts:383`; tests
  `tests/unit/translations.test.ts` must match. `8dbb442` leaves them to release day. Legal pages keep their own
  dates (`src/content/legal.ts:32`, `src/content/terms.ts:8`) — change only if the legal text changes.
- **Recommended option:** yes, date of the last native/owner review.
- **Alternatives:** (b) keep 20 November 2026.
- **Consequences:** (a) sitemap `lastmod` of 72 content URLs and visible dates are accurate. (b) dates older than the
  content actually published.
- **Blocks public prelaunch?** Yes (part of the release commit). **Blocks commercial sales?** No.
- **Owner answer:** ☐ (a) date: ____ ☐ (b) · Initials ____

### A11 — `domain` configuration value (new ID; was part of A6)
- **Question:** Confirm `domain: 'sygmatv.com'` in `src/config/site.ts`?
- **Current implementation:** `domain: null` (`src/config/site.ts:20`) keeps the `domain_not_decided` launch blocker
  (`src/config/launch-gate.ts:38`), which protects the automated checkout only.
- **Recommended option:** confirm, applied together with the other sales gates (not before part 2–4 items).
- **Alternatives:** (b) keep `null`.
- **Consequences:** (a) one gate fewer before `SALES_ENABLED`; no visible change. (b) automated checkout stays locked.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** Yes (automated checkout gate only).
- **Owner answer:** ☐ (a) ☐ (b) · Date ____ Initials ____

### A12 — Monitoring log output (D13-010, new ID)
- **Question:** Reduce what the hourly monitor prints in the public Actions log?
- **Current implementation:** `.github/workflows/monitor.yml:59` prints the full `/api/cron/monitor` JSON (check
  names, Brevo credit count, blocked e-mails, Telegram webhook error); no secret, no personal data.
- **Recommended option:** print only `healthy` and the names of failing checks.
- **Alternatives:** (b) keep as is.
- **Consequences:** (a) less operational detail in a public log; details stay in the Telegram alert. (b) none new.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** No.
- **Owner answer:** ☐ (a) ☐ (b) · Date ____ Initials ____

### A13 — CI / secrets hardening (D13-003, D13-004, D13-005, D13-012; new ID)
- **Question:** Approve each hardening step from `security-report.md` §1?
- **Current implementation:** public repository with repository-level secrets, no GitHub Environment, staging uses the
  production-capable Cloudflare token (D13-003); token written to `$GITHUB_ENV` before `npm ci`
  (`.github/workflows/deploy-cloudflare.yml:48`, `:53`), actions pinned by tag `@v4` (D13-004); production deploy
  runs only `npm test` and does not wait for `ci.yml` (D13-005); no Cross-Origin-Opener-Policy (D13-012).
- **Recommended option:** 003 — Environments `production` / `staging` with deployment branches, secrets moved there,
  separate staging token; 004 — token passed only to the deploy/secret steps, actions pinned by SHA; 005 — require CI
  success before the production deploy; 012 — test `same-origin-allow-popups` with Tag Assistant first.
- **Alternatives:** (b) postpone, with the manual release checklist (`release-readiness.md` §6) in place.
- **Consequences:** (a) a pushed branch can no longer read production secrets; deploys wait for CI. (b) current
  exposure stays (Medium in the security report).
- **Blocks public prelaunch?** Recommended (before activation). **Blocks commercial sales?** Recommended.
- **Owner answer:** D13-003 ☐ yes ☐ later · D13-004 ☐ yes ☐ later · D13-005 ☐ yes ☐ later · D13-012 ☐ test
  ☐ no · Date ____ Initials ____

### B1 — Reopening rule (reg. D16)
- **Question:** Which conditions must be met, in writing, before `FEATURE_CONTACT_FORM=true`?
- **Current implementation:** the flag alone controls `/api/contact` (`src/lib/features.ts:4`); no launch-gate call,
  no market or licence check. `getLaunchBlockers()` (`src/config/launch-gate.ts:20-48`) protects `/api/checkout` only.
- **Recommended option:** reopen only when B2–B12 and C1 are ticked and documented; add an automated test that
  refuses the flag while `no_licensed_territory` or `tax_rules_missing` remain.
- **Alternatives:** (b) reopen in selected markets only, same conditions for those markets; (c) reopen without these
  conditions (written risk acceptance in `docs/DECISIONS.md`).
- **Consequences:** (a) no order is taken before tax, rights and consumer texts are answered. (b) needs B9 (country
  gate). (c) sales path reopens in all released languages with Phase 11 blockers A, C, D open.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (a) ☐ (b) markets: ____ ☐ (c) · Date ____ Initials ____

### B10 — DB language migration (`contact_requests.locale`)
- **Question:** Approve the migration that lets the database store order and support requests from all 8 page
  languages (and, if proposed there, related locale columns)?
- **Current implementation:** `supabase/migrations/20261108134848_contact_requests.sql:15`
  `check (locale in ('en', 'fr'))`, not widened by a later migration; same pattern in
  `20261108134733_catalog.sql:13` and `20261108134827_customers_orders.sql:17`. The order window sends the page
  locale; inserts from de/es/it/nl/sv/nb pages may be refused once forms reopen. The live constraint was not queried.
- **Recommended option:** apply migration `20261124120000_locales_8_languages.sql` (branch `claude/f14-db`, commit
  `1c8c794`) **before** forms reopen with the 8 languages released: it widens the three en/fr checks to the 8 site
  languages (NOT VALID + VALIDATE, idempotent, writes no row). Steps: backup → owner applies via Supabase dashboard/CLI
  → verify. Tested on an isolated PostgreSQL 16 with synthetic data: all 24 migrations, en/fr rows byte-identical,
  inserts in 8 languages through the API's insert path, invalid locales rejected (`docs/release/final/db-locale-migration.md`).
- **Alternatives:** (a) apply it now, while forms are closed (no effect on visitors; earliest safety); (b) keep en/fr
  and reopen forms in English/French only.
- **Consequences:** recommended/(a): requests from de/es/it/nl/sv/nb pages are stored once forms reopen; rollback
  scripts exist (strict, or map new-language rows to `en` — irreversible for those rows). (b): those requests fail
  with HTTP 502 `storage_failed`.
- **Blocks public prelaunch?** No (forms closed). **Blocks commercial sales?** Yes (before reopening forms).
- **Owner answer:** ☐ approve the option recommended in the file ☐ other: ____ · Date ____ Initials ____

### B11 — Engineering checks before reopening (new ID; was part of B10)
- **Question:** Approve these changes, to be made before forms reopen?
- **Current implementation:** order `term` accepts `lifetime` (`src/lib/validation.ts:56`) though not offered;
  rate limiting is per isolate (`src/lib/rate-limit.ts`, D13-009); staff e-mails and the follow-up cron ignore
  `FEATURE_CONTACT_FORM` (A6).
- **Recommended option:** (1) restrict `term` to offered terms; (2) Cloudflare WAF rate-limit rule on
  `POST /api/contact` and `/api/quote`; (3) staff e-mails and cron follow-ups respect `FEATURE_CONTACT_FORM`.
- **Alternatives:** (b) any subset (list).
- **Consequences:** (a) no « Lifetime » confirmation can be crafted; global request limits; no trial/plan e-mail while
  closed. (b) the omitted risks stay.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (1) ☐ (2) ☐ (3) · Date ____ Initials ____

### C7 — Payment and activation providers
- **Question:** Which payment provider and which activation provider are contracted?
- **Current implementation:** `paymentMethods: []` (`src/config/site.ts:52`); both providers are launch-gate blockers
  (`src/config/launch-gate.ts`). Help pages list card, PayPal, USDT via Binance, bank transfer, Western Union, MoneyGram
  (`src/content/en/info.ts:39`) for the assisted flow.
- **Recommended option:** choose and contract both before `SALES_ENABLED=true`; keep in the listed methods only those
  for which a refund procedure exists (B4).
- **Alternatives:** (b) assisted sales only, no automated checkout.
- **Consequences:** (a) gate can close. (b) `SALES_ENABLED` stays `false`; B4/C3 still apply to assisted payments.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** Yes.
- **Owner answer:** payment ☐ ____ activation ☐ ____ · ☐ (b) · Date ____ Initials ____

### D-1 … D-6 — Design choices (reg. D13; Phase 12 UI audit IDs)
None blocks prelaunch or sales. Current implementation: `src/components/PrelaunchBanner.tsx`, `PrelaunchNotice.tsx`;
`.tier-grid { align-items: center }` at ≥ 901 px; legal pages English only; `NAV_COLLAPSE` in
`src/components/LanguageSwitcher.tsx`; font stack starts with `Inter` (`src/app/globals.css:31`), no `@font-face`.

| ID | Question | Recommended | Alternative | Consequence | Owner answer |
|---|---|---|---|---|---|
| D-1 (U-002) | Page-wide prelaunch strip under the header? | Yes | No | Yes: closed state visible before any button; one more banner | ☐ yes ☐ no |
| D-2 (U-002) | « Follow the launch » + indicative opening period in the windows? | No date until B1 is met | Show a period | A date shown is a commitment to keep | ☐ no date ☐ period: ____ |
| D-3 (U-012) | Align plan-card prices and buttons (stretch cards)? | Owner preference | Keep centred cards | Yes: aligned rows, Plus card less prominent | ☐ yes ☐ no |
| D-4 (U-016) | « Back to your language » link on English legal pages? | Yes | No | Yes: visitors return to their language | ☐ yes ☐ no |
| D-5 (U-018) | Keep a CTA visible in the collapsed fr/de/nl/nb header (901–1359 px)? | Owner preference | Keep menu only | Yes: visible CTA in 4 languages | ☐ yes ☐ no |
| D-6 (U-019) | Self-host the Inter font? | Owner preference | System fonts | Yes: ≈ 100 KB woff2, consistent label widths | ☐ yes ☐ no |

Date ____ Initials ____

---

## Part 2 — Legal approvals (counsel; privacy counsel where stated)

### A4 — Cookie policy and consent banner (reg. D9, L-06) — *privacy counsel*
- **Question:** Which cookie policy and banner texts are published, and is remarketing kept at launch?
- **Current implementation:** policy says « No advertising cookie is used at the moment. » (`src/content/legal.ts:119`)
  and lists only `sygma_consent`, `_ga, _ga_*`, `_clck, _clsk` (`:114-116`); banner names « Google Ads, Meta, TikTok »
  (`src/i18n/dictionaries/en.ts:32`); GTM `GTM-MGCLXP5L`, `gtmEnabled: true` (`src/config/analytics.ts:10-12`).
  Measured (Phase 13): consent gating works (nothing before a choice, nothing after « Decline all »); with Marketing
  consent, Google Ads conversion **and remarketing** run; no Meta/TikTok tag; Cloudflare Web Analytics request for
  every visitor (cookie-less) not mentioned (`d9-cookie-policy-draft.md` §1). Exact texts: wording annex W4.
- **Recommended option** (`docs/release/final/cookie-analytics-reconciliation.md`, measured on `7a6577f`): consent
  gating is correct (nothing before a choice, after « Decline all » or after withdrawal). (1) **Now, no deploy:** switch
  Google Ads **remarketing off** (GTM: `allow_ad_personalization_signals=false` on AW-18577285546; Google Ads: audience
  collection off), keep conversion measurement; (2) then publish **policy + banner version A** in one deploy (no
  re-consent needed: narrower scope); (3) remove Meta and TikTok from the banner (not in the container); disclose
  Clarity session recording and Cloudflare Web Analytics (cookie-less, every visitor). Exact texts (policy in English,
  banner in 8 languages, AI drafts) are in the reconciliation file.
- **Alternatives:** (b) keep remarketing → publish version B and raise `consentVersion` to 3 (everyone asked again);
  (c) no advertising until orders open → pause the Ads tags in GTM.
- **Consequences:** (1)–(3): texts match reality; minimal ad loss (no audience lists). (b): full disclosure needed and
  a new consent prompt for all visitors. (c): no conversion data until orders open. In all options: if counsel says
  Cloudflare Web Analytics needs consent, switch it off in the Cloudflare dashboard (no deploy).
- **Blocks public prelaunch?** Yes (recommended: the mismatch is visible to every visitor). **Blocks sales?** Yes.
- **Owner answer:** ☐ approve the option recommended in the file after privacy counsel's review ☐ other: ____ ·
  GTM tag list attached ☐ · Counsel sign-off ☐ · Date ____ Initials ____

### A7 — Prelaunch wording that touches legal topics — *counsel*
- **Question:** Change, before activation, three public texts that state legal facts in the present tense?
- **Current implementation:** (1) FAQ « Taxes and the final price are always displayed before any purchase »
  (`en.ts:343`, also FAQPage JSON-LD) — no tax is computed (`src/config/site.ts:51` `taxRules: null`); (2) Terms
  ordering text in the present tense (`src/content/terms.ts:25`, `:33`); (3) nb « Kunder i EU og Storbritannia » on the
  Norway-targeted page (register nb 1). Exact texts: W5, W6, W8.
- **Recommended option:** (1) remove or reword the FAQ sentence now (wording: counsel / tax adviser); (2) ask counsel
  to align the Terms before activation; (3) ask counsel before releasing nb.
- **Alternatives:** (1) keep until B2; (2) align before orders reopen; (3) decide with B3.
- **Consequences:** recommended: three counsel answers before the activation date. Alternatives: the texts are
  published in 8 languages until then.
- **Blocks public prelaunch?** Recommended. **Blocks commercial sales?** Yes (through B2, B3, B5).
- **Owner answer:** (1) ☐ now ☐ with B2 · (2) ☐ before activation ☐ before orders · (3) ☐ counsel before nb
  ☐ with B3 · Date ____ Initials ____

### B3 — Withdrawal right (reg. D3, L-03) — *consumer counsel (EU/EEA incl. Norway, UK, Switzerland)*
- **Question:** What withdrawal information, model form and early-start acknowledgement apply, per territory?
- **Current implementation:** « EU and UK » only (`src/content/legal.ts:152-154`, `src/content/terms.ts:57`,
  `en.ts:347`, `en.ts:571`, `src/content/en/info.ts:150`, `:369`, `:371`, `:376`); no EEA/Norway or Switzerland text,
  no model form, no early-start step; access is activated before payment (`info.ts:139`). Exact texts: W6.
- **Recommended option:** counsel's wording + model form + early-start acknowledgement (with a stored consent version,
  pattern `consentTextVersion`, `src/config/site.ts:60`) before orders reopen; English and 7 languages changed
  together.
- **Alternatives:** (b) a voluntary 14-day right for every customer, wording by counsel.
- **Consequences:** (a) a checkbox step in the order flow and text changes in 8 languages. (b) simpler text; refunds
  in more cases.
- **Blocks public prelaunch?** Recommended (nb page only). **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (a) ☐ (b) · Counsel text attached ☐ · Date ____ Initials ____

### B4 — Refunds (reg. D4, L-04) — *counsel, payment operations*
- **Question:** How is a refund executed for each payment method, and which refund wording is published?
- **Current implementation:** « Ask within 7 days of activation and we refund 100%, no questions asked. … »
  (`src/content/legal.ts:146`, `info.ts:375`); « … to the payment method you used » (`legal.ts:162`, `info.ts:377`);
  methods include USDT via Binance, Western Union, MoneyGram (`info.ts:39`); 16 refund rows pending. Exact texts: W7.
- **Recommended option:** owner writes the refund procedure per method (card, PayPal, USDT, bank transfer, Western
  Union, MoneyGram); counsel approves one English wording; translations follow.
- **Alternatives:** (b) reduce the accepted methods to those that can be refunded as promised.
- **Consequences:** (a) wording matches what operations can do. (b) fewer payment options.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (a) procedure attached ☐ (b) methods kept: ____ · Counsel sign-off ☐ · Date ____ Initials ____

### B5 — Terms and order sequence (reg. D5, L-05) — *counsel*
- **Question:** What is the actual sequence, and will counsel redraft the Terms to it?
- **Current implementation:** Terms « confirm your order and payment, then activates your access. The contract starts
  when we confirm your order. » (`terms.ts:33`); site « We activate your subscription first: you pay only once your
  access is active. » (`info.ts:139`, `:185`) and « you pay after activation » (`info.ts:291`, `en.ts:331`); acceptance
  « By using the website or submitting a form, you accept them » (`terms.ts:25`). Exact texts: W8.
- **Recommended option:** owner states the sequence in writing; counsel redrafts `terms.ts` (ordering, acceptance).
- **Alternatives:** none (a redraft is required either way); sequence choice below.
- **Consequences:** the sequence also determines B3 (withdrawal) and B7 (confirmation timing).
- **Blocks public prelaunch?** Recommended (Terms are public). **Blocks commercial sales?** Yes.
- **Owner answer:** actual sequence ☐ confirm → activate → pay ☐ confirm → pay → activate ☐ other: ____ ·
  ☐ counsel redrafts · Date ____ Initials ____

### B6 — « +30 days free » and struck « Regular price » (reg. D7) — *counsel*
- **Question:** Under which conditions is the badge shown, and may the computed « Regular price » be struck through?
- **Current implementation:** badge `bonus: '+30 days free'` (`en.ts:127`, row `:142`, rendered
  `src/components/PlanConfigurator.tsx:202`); Terms « under the conditions shown at purchase » (`terms.ts:49`) — no
  conditions shown; « Regular price » (`en.ts:227`, `PlanConfigurator.tsx:323`) = 2 or 3 × the 12-month price
  (`src/lib/pricing.ts:81`), never charged. Exact texts: W9.
- **Recommended option:** owner defines the promotion conditions (eligible terms, start/end); replace the struck
  « Regular price » by a plain comparison label (« vs 2 × / 3 × 12-month plans »), unless counsel approves it.
- **Alternatives:** (b) remove the badge and the struck price.
- **Consequences:** (a) text/CSS change, no price change. (b) less promotional display.
- **Blocks public prelaunch?** No (recommended before any paid campaign). **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (a) conditions: ____ ☐ (b) · Counsel sign-off ☐ · Date ____ Initials ____

### B7 — Confirmation e-mails (L-08) — *consumer counsel*
- **Question:** What must the order and activation e-mails contain, and when must a confirmation be sent?
- **Current implementation:** English only; « Order received » has plan only (`src/lib/email/templates.ts:239-251`);
  « Subscription active » shows « Amount Paid » (`:314`), « Payment Status: Paid »; no legal entity, address,
  start/end date or Terms/Refunds/withdrawal links.
- **Recommended option:** trader block (entity, address, country from `siteConfig`) and links to Terms, Refunds,
  Legal notice in every e-mail; a confirmation with the key terms before activation (content per counsel).
- **Alternatives:** (b) trader block only.
- **Consequences:** (a) template changes in all e-mails. (b) timing and content questions stay open.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (a) ☐ (b) · Counsel list attached ☐ · Date ____ Initials ____

### B8 — Legal-page languages and the 36 sensitive wordings (reg. D10, D11) — *counsel, native reviewers*
- **Question:** Which documents must exist in which language per market, and what is the decision for each of the 36
  register rows?
- **Current implementation:** legal pages generated in English only (`src/app/[locale]/legal/[doc]/page.tsx:13-14`);
  36 register rows « REQUIRES OWNER/LEGAL APPROVAL », 25 rendered in prelaunch, 0 resolved. Exact texts and proposals:
  wording annex (W4, W5, W6, W7, W8, W10, by topic).
- **Recommended option:** counsel states per market which documents must be translated; owner decides each row
  (apply proposal / keep / counsel wording) after the English source is decided (B3, B4, B5, A4).
- **Alternatives:** (b) keep legal pages in English; accept orders only from English pages.
- **Consequences:** (a) legal translation cost before orders. (b) translated pages cannot take orders.
- **Blocks public prelaunch?** Recommended (25 rows are rendered). **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (a) ☐ (b) · per-row boxes in the annex · Counsel answer attached ☐ · Date ____ Initials ____

### B12 — Auto-renewal and guarantee labels (reg. D12; new ID, was part of B4) — *counsel, native reviewers*
- **Question:** Which short labels are used for « no automatic renewal » and the 7-day guarantee?
- **Current implementation:** en « No automatic renewal » (`en.ts:170`, `:185`, `:200`), « Satisfied or refunded —
  7 days » (`legal.ts:144`); fr « Sans reconduction », sv « Ingen autoförnyelse », nb « Ingen autofornyelse »,
  nb « Pengene tilbake ». Exact texts: W11.
- **Recommended option:** factual labels, decided with B4: per-label choice in W11.
- **Alternatives:** (b) keep the current labels.
- **Consequences:** (a) some proposals exceed the 22-character card guide (layout check). (b) labels may read as a
  broader or narrower promise than the policy (native reviewers and counsel to say).
- **Blocks public prelaunch?** No. **Blocks commercial sales?** Yes.
- **Owner answer:** per-label boxes in W11 · Date ____ Initials ____

### C5 — Seller identity (L-07) — *counsel*
- **Question:** Which identity elements must the Legal notice show for each target market?
- **Current implementation:** entity, address, « Registered in: United States (New Mexico) », EIN, e-mail,
  phone/WhatsApp (`src/content/legal.ts:175-190`); not shown: state filing number, VAT/GST numbers, representative,
  hosting provider, EU/UK representative.
- **Recommended option:** add the elements counsel lists.
- **Alternatives:** (b) none required (counsel's written answer attached).
- **Consequences:** (a) owner supplies the facts (e.g. filing number). (b) no change.
- **Blocks public prelaunch?** Recommended (de/fr/it pages target DE, CH, LU, FR, IT). **Blocks sales?** Yes.
- **Owner answer:** ☐ (a) ☐ (b) · Date ____ Initials ____

### C6 — Data retention (L-06) — *privacy counsel*
- **Question:** Is the published retention promise kept as written and implemented by an automated purge, or changed?
- **Current implementation:** privacy policy « Requests that do not lead to a subscription: 12 months at most.
  Customers: during the subscription, then 12 months. Invoices: as long as the law requires. »
  (`src/content/legal.ts:84`); forms « Data deleted within 12 months » (`en.ts:464`, `:492`); no purge job in
  `supabase/migrations` or `src/`; table comment « Retention policy to be confirmed by counsel »
  (`supabase/migrations/20261108134848_contact_requests.sql:28-29`).
- **Recommended option** (`docs/release/final/data-retention.md`, branch `claude/f14-db`, commit `71a9583`): apply
  migration `20261124130000_retention_purge.sql` and the route `/api/cron/retention`, dry-run by default
  (`RETENTION_PURGE_ENABLED` absent everywhere, no cron trigger). A real run **anonymises** contact requests older
  than 12 months (name, phone, subject, message cleared; e-mail replaced), closes their open lead cards, deletes
  never-paid draft/cancelled orders; logs counts only; at most 500 rows/table/run; refuses a cutoff under 12 months.
  Activation: counsel approval → backup → owner applies migration → dry run, review counts → set the flag.
- **Exceptions needing a decision (the purge only counts these rows):** invoices; converted customers (subscription
  end not stored); marketing-consent proofs; open support cases and `retention_hold`; payment records and webhook
  events; `customers` and Auth users; anonymise vs delete (« Data deleted within 12 months »); Telegram cards and
  Brevo/Cloudflare logs (outside the database; Telegram messages older than 48 h cannot be deleted by a bot);
  boundary « strictly older than 12 months ».
- **Alternatives:** (b) delete instead of anonymise; (c) manual yearly export-and-delete procedure.
- **Consequences:** recommended: policy enforced with statistics kept; deleted/anonymised data cannot be restored.
  (b): simpler, loses statistics. (c): error-prone, no log.
- **Blocks public prelaunch?** No (no data is collected while forms are closed). **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ approve the option recommended in the file after privacy counsel's review ☐ other: ____ ·
  Date ____ Initials ____

### C9 — EU/UK representative and processor disclosure (L-06; new ID, was part of C6) — *privacy counsel*
- **Question:** Is an EU/UK representative (GDPR art. 27) required, and must processors be named individually?
- **Current implementation:** policy names recipients by category only (owner request, `src/content/legal.ts:4-5`);
  « transfers are protected by appropriate safeguards » (`:76`); DECISIONS D64 « à étudier », D55.
- **Recommended option:** follow counsel's written answer on both questions; owner holds DPAs for Supabase,
  Cloudflare, Brevo, Telegram, Google, Microsoft Clarity.
- **Alternatives:** none without counsel.
- **Consequences:** possibly a contract with a representative; a processor list in the policy.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** Yes.
- **Owner answer:** representative ☐ appoint ☐ not required (written answer) · processors ☐ named ☐ by category
  (written answer) · Date ____ Initials ____

---

## Part 3 — Tax approvals (tax adviser)

### B2 — Tax line in the order window and tax wording (reg. D2, L-02)
- **Question:** What does the order window show for taxes, and which tax statements stay on the site?
- **Current implementation:** order window « Taxes » = constant `taxesValue: '$0.00 USD'` (`en.ts:515`, rendered
  `src/components/CheckoutDialog.tsx:415`, forms only); quotes never contain tax (`src/lib/pricing.ts`, `taxMinor:
  null`); FAQ and Terms state « before taxes » and « always displayed » (`en.ts:343`, `terms.ts:49`). Exact texts: W5.
- **Recommended option:** replace « $0.00 USD » by « Calculated by our team before payment » until tax rules exist;
  FAQ/Terms per A7 and the adviser.
- **Alternatives:** (b) remove the « Taxes » line; (c) feed it from the server quote (needs `taxRules`).
- **Consequences:** (a)/(b) no figure the server did not compute. (c) requires C2 first.
- **Blocks public prelaunch?** Recommended (FAQ sentence, via A7). **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (a) ☐ (b) ☐ (c) · Adviser sign-off ☐ · Date ____ Initials ____

### C2 — Tax registrations and price display per market (L-02)
- **Question:** For EU (OSS), Norway (VOEC), UK, Switzerland, Canada and US states: which obligations arise from the
  first sale, and how must prices be shown (tax-inclusive, currency)?
- **Current implementation:** `taxRules: null` (`src/config/site.ts:51`); prices in USD, market US only
  (`src/config/price-tables.json`, `src/lib/price-source.ts`); questions per jurisdiction in `legal-blocker-register.md`
  L-02.
- **Recommended option:** written, dated position per jurisdiction; then tax-inclusive local-currency prices where the
  adviser says so.
- **Alternatives:** (b) USD only, wording per adviser.
- **Consequences:** (a) price tables per market. (b) one price table; display rules per adviser.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (a) ☐ (b) · Adviser also reviews any past assisted sales ☐ · Date ____ Initials ____

### C3 — Amount actually received; past conversions (L-09)
- **Question:** Record the amount actually received at « Converti », and do past confirmation e-mails need correction?
- **Current implementation:** `contact_requests` stores no amount, currency or method; the e-mailed « Amount Paid » is
  recomputed from the current price table (`src/lib/telegram/ops.ts:417-423`, `templates.ts:314`).
- **Recommended option:** record amount, currency, method and date at « Converti » and show them in the e-mail;
  reconcile past conversions against payment records (read-only query, approved separately); adviser decides on
  corrections.
- **Alternatives:** (b) keep list-price amounts, labelled « Plan price » instead of « Amount Paid ».
- **Consequences:** (a) schema and e-mail change. (b) e-mail no longer states a payment amount.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (a) ☐ (b) · Reconciliation query approved ☐ · Date ____ Initials ____

### C4 — Invoices (L-08)
- **Question:** Must an invoice be issued, and with which content?
- **Current implementation:** « Order Number » stored as `invoice_number` (`SYG-YYYY-NNNN`); the code says the e-mail
  is not an invoice (`src/content/en/info.ts:28-29`); the privacy policy mentions invoices (`legal.ts:52`, `:64`).
- **Recommended option:** issue invoices with the content the adviser lists.
- **Alternatives:** (b) not required (adviser's written answer attached).
- **Consequences:** (a) invoice template and numbering rules. (b) none.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (a) ☐ (b) · Date ____ Initials ____

---

## Part 4 — Licensing and content rights (rights holder + media/IP counsel)

### A2 — Content and device wording; Terms « sports » (reg. D6, L-01, L-12, L-13)
- **Question:** Approve the merged Phase 13 claims wording, and neutralise « sports » in the Terms and in the trial
  follow-up e-mail?
- **Current implementation:** merged (`aad188e`): sports tiles region « Where available » (`en.ts:103-115`), category
  « Sports channels where available in your country » (`en.ts:252`), device bar by category (`en.ts:149`). Not changed:
  Terms « Live TV channels, sports, movies and series… » (`terms.ts:41`), e-mail « favourite sports »
  (`templates.ts:280`), closed-form device list with brand names (`en.ts:504`). `licensedTerritories: []`
  (`site.ts:46`). Exact texts: W1.
- **Recommended option:** approve the merged wording, and have counsel redraft `terms.ts:41` and the e-mail line.
- **Alternatives:** (b) approve the merged wording only; (c) keep sports claims — requires written rights per
  territory (C1).
- **Consequences:** (a) no named content category the rights do not document. (b) Terms keep « sports ». (c) depends
  on C1 evidence.
- **Blocks public prelaunch?** Yes (recommended minimum: merged wording approved). **Blocks sales?** Yes.
- **Owner answer:** ☐ (a) ☐ (b) ☐ (c) · Date ____ Initials ____

### A2b — Supplier-confirmed catalogue figures (reg. D6, owner update 24/11/2026)
- **Question:** Show the supplier-confirmed overall figures (35,000+ channels, 200,000+ movies and series, 4K HDR on
  compatible content and devices), and how?
- **Current implementation:** hidden in `7a6577f` (`src/config/catalogue.ts:14-16` all `null`); production `8797d7c`
  shows per-plan figures and « from multiple countries » (Fact 1). The figures are not per-plan guarantees and not
  broadcasting rights (Fact 4). Exact texts: W2.
- **Recommended option** (`docs/release/final/supplier-specs-proposal.md`, branch `claude/f14-specs`, commit `5edf71a`):
  one footnote under the « Compare the plans » table, after « 4K/HDR where available. Catalogue may vary by country. »:
  EN « Supplier catalogue: 35,000+ TV channels and 200,000+ movies & series, in up to 4K HDR on compatible content and
  devices. What you can watch depends on your country and device. » (8 languages, AI drafts). Not in any plan card,
  not tied to a plan, not in title/meta/JSON-LD; `src/config/catalogue.ts` stays null; never with « international »
  or sports/broadcaster names. Tested (739 unit, 802 E2E, no overflow at 320 px, axe).
- **Alternatives:** (b) closing banner sentence (rejected: globe image and « from {price}/month » would imply the
  totals for every plan/country); (c) keep hidden until rights are documented.
- **Consequences:** recommended: figures visible with qualifiers; must be native-reviewed (adds 1 string per
  language). (c): no figures; production still shows the old per-plan figures until Step A. Keep the written supplier confirmation with the rights documentation (C1).
- **Blocks public prelaunch?** No (figures hidden in the candidate). **Blocks commercial sales?** No.
- **Owner answer:** ☐ approve the option recommended in the proposal ☐ keep hidden ☐ other: ____ · Supplier
  confirmation filed ☐ · Date ____ Initials ____

### B9 — Country gate for orders (L-01)
- **Question:** Accept order requests only from licensed countries?
- **Current implementation:** `/api/contact` accepts any ISO country (245 in `src/config/countries.json`); no licence
  check; `licensedTerritories: []`.
- **Recommended option:** accept order requests only from countries in `licensedTerritories` (filled after C1).
- **Alternatives:** (b) accept all countries; team checks rights before activation (written procedure).
- **Consequences:** (a) code change in `/api/contact`; orders impossible until C1. (b) relies on a manual check.
- **Blocks public prelaunch?** No. **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (a) ☐ (b) procedure attached · Date ____ Initials ____

### C1 — Distribution rights per territory (L-01)
- **Question:** For which territories and content types (live channels, sports, VOD, replay) do written rights exist,
  reviewed by counsel?
- **Current implementation:** no licence document in the repository; `licensedTerritories: []` (`site.ts:46`);
  supplier figures are not rights (Fact 4). Counsel to say also whether advertising before rights exist is acceptable
  per market.
- **Recommended option:** licences per territory attached; engineering fills `licensedTerritories` only after
  counsel's review.
- **Alternatives:** none (no sales in a territory without this evidence under B1 (a)).
- **Consequences:** sales scope = documented territories.
- **Blocks public prelaunch?** Recommended (counsel's view on advertising before rights). **Blocks sales?** Yes.
- **Owner answer:** territories documented: ____ · Counsel review attached ☐ · Date ____ Initials ____

### C8 — Trademark and platform names (L-13)
- **Question:** Is « SYGMA TV+ » cleared/filed, and which platform names may be used?
- **Current implementation:** trademark search/filing open (`src/config/site.ts:9`, `docs/DECISIONS.md` pending list);
  device bar uses categories (`en.ts:149`); closed forms list Fire TV, Apple TV, iPhone / iPad (`en.ts:504`); Trustpilot
  assets in the review e-mail (`templates.ts:154-160`).
- **Recommended option:** clearance/filing before campaigns; name a platform only after the app is verified on it;
  check Trustpilot's brand-asset terms.
- **Alternatives:** (b) postpone clearance until after launch (risk accepted in writing).
- **Consequences:** (a) search report and filing cost. (b) rebranding risk if a conflict appears.
- **Blocks public prelaunch?** Recommended. **Blocks commercial sales?** Yes.
- **Owner answer:** ☐ (a) ☐ (b) · Date ____ Initials ____

---

## Part 5 — Native-speaker approvals (per language)

### A5 — Native-speaker sign-off (reg. D15)
- **Question:** Because all 8 languages are released together (A1), must each of the 7 reviewers sign priorities 1–3
  before activation?
- **Current implementation:** all 7 translations are AI translations, « pending native review »
  (`docs/i18n/phase13/README.md`); 14 safe fixes applied (`b7772bd`); `src/i18n/locales.ts:66-72` status `preview`.
  No row is native-reviewed.
- **Recommended option:** send each reviewer `docs/i18n/review-workbooks/review-<lang>.xlsx` (or the CSV): sheet
  « Strings » (English reference, current translation, page/location, max length, flags, AI note, reviewer decision,
  proposed text, comment, name, date) and sheet « Sign-off ». Require **P1–P3 signed before activation** (prelaunch
  block, FAQ, plans/simulator/summary/buttons/metadata, consent and legal-adjacent labels — the latter also need
  counsel); P4–P6 within the first weeks after release. Import returned files with `import-review.mjs` (prints the
  proposed changes per key; nothing is written into `src/` automatically). Rows: fr 715, de 720, es 724, it 719,
  nl 717, sv 732, nb 731 (P1–P3 ≈ 230–240 rows per language).
- **Alternatives:** (b) full review (P1–P6) before activation — safest, slowest; (c) release the languages whose P1–P3
  are signed and hold the others (contradicts A1's simultaneous release).
- **Consequences:** recommended: release date set by the slowest P1–P3 sign-off; remaining P4–P6 errors possible on
  help pages for a short time. (b): longer delay. (c): requires changing A1.
- **Blocks public prelaunch?** Yes, per language (all 7 with the simultaneous release). **Blocks commercial sales?**
  Yes, for legal-adjacent wording in that language (B8).
- **Owner answer:** ☐ approve the option recommended in the workbooks ☐ other: ____ · Date ____ Initials ____

| Language | Reviewer (name) | P1–P3 signed | P4–P6 signed | Legal rows (register) left to counsel | Date |
|---|---|---|---|---|---|
| fr | ____ | ☐ | ☐ | fr 4, 5, 6 | ____ |
| de | ____ | ☐ | ☐ | de 4, 5b, 6, 7, 9, 12 | ____ |
| es | ____ | ☐ | ☐ | es 1, 2, 3, 6 | ____ |
| it | ____ | ☐ | ☐ | it 1, 2, 4 | ____ |
| nl | ____ | ☐ | ☐ | nl 1, 2, 4, 5, 11, 12 | ____ |
| sv | ____ | ☐ | ☐ | sv 1–9 | ____ |
| nb | ____ | ☐ | ☐ | nb 1, 3, 4b, 5, 6 | ____ |

A signed row means « native-reviewed », never « validated » or « legally approved ».

---

## Wording annex — current text and proposals

**Every « Proposed » cell is a proposal for counsel review — not legal advice.** « Counsel to draft » = no proposal
exists in the sources; none is invented here. Current texts are exact at `7a6577f` (file:line). For other languages,
the rows of `docs/i18n/phase11/sensitive-wording-register.md` are cited; the current text is exact (also in §4a of
`docs/i18n/phase13/review-<lang>.md`); the register suggestion is quoted exactly, including its « … » (only the
changed clause). Boxes: ☐ P = apply proposal · ☐ K = keep · ☐ C = counsel's wording.

### W1 — Sports, Terms « sports », devices (A2)

| Ref | File:line | Current (exact) | Proposed | Decision |
|---|---|---|---|---|
| A2.1 | `src/content/terms.ts:41` | « Live TV channels, sports, movies and series on compatible devices. Content depends on the licences available in each country and may change. Picture quality (HD to 4K HDR) depends on your plan, the content, your device and your internet connection. » | Counsel to draft | ☐ C ☐ K |
| A2.2 | `src/lib/email/templates.ts:280` | « Thank you for trying SYGMA TV+. We hope you enjoyed your favourite sports, movies, series and live TV. » | No proposal in the sources (owner to draft, counsel to review) | ☐ C ☐ K |
| A2.3 | `src/i18n/dictionaries/en.ts:252` | « Sports » — « Sports channels where available in your country » | Merged Phase 13 text (this is the proposal) | ☐ approve ☐ C |
| A2.4 | `en.ts:103-115` (6 tiles) | badge « SPORTS », region « Where available » | Merged Phase 13 text | ☐ approve ☐ C |
| A2.5 | `en.ts:149` | « Smart TV », « Streaming box », « Streaming stick », « Smartphone », « Tablet », « Computer » | Merged Phase 13 text | ☐ approve |
| A2.6 | `en.ts:504` (closed forms) | « Smart TV », « Android TV / Google TV », « Fire TV », « Apple TV », « Other TV box or stick », « Android phone / tablet », « iPhone / iPad », « Computer (Windows / Mac) », « Web browser » | No proposal (C8) | ☐ C ☐ K |

Other languages: rows flagged `CLAIMS` in `docs/i18n/phase13/review-<lang>.md` (now merged; to be reviewed in A5).

### W2 — Supplier-confirmed figures (A2b)

| Ref | Where | Current (exact) | Proposed |
|---|---|---|---|
| A2b.1 | `7a6577f` `src/config/catalogue.ts:14-16` | `starter`, `plus`, `ultra`: `{ channels: null, vod: null }` (nothing shown) | See supplier-specs proposal |
| A2b.2 | production `8797d7c` `en.ts:137-138` | « Live TV channels » « +12,000 » « +25,000 » « +35,000 »; « Movies & series (VOD) » « +100,000 » « +150,000 » « +200,000 » | Removed by `7a6577f` (A0); see supplier-specs proposal |
| A2b.3 | production `8797d7c` `en.ts:313` | « Access up to 35,000+ TV channels and 200,000+ movies & series, in HD to 4K HDR, from multiple countries — from {price}/month. » | Removed by `7a6577f` (A0); see supplier-specs proposal |

### W3 — Support (A3) — merged Phase 13 text (`aad188e`); the merged text is the proposal

| Ref | File:line | Current (exact) | Note |
|---|---|---|---|
| A3.1 | `en.ts:6` | « Live TV, movies and series on Smart TV, mobile and computer. Yearly plans for 1 to 4 devices, a free 24-hour trial and a 24/7 automated assistant. » | open-orders meta |
| A3.2 | `en.ts:83` | « 24/7 Assistant » (hero check) | |
| A3.3 | `en.ts:94` | « 24/7 assistant » — « Human help by email & WhatsApp » | while closed: « Human help by email » (`en.ts:417`) |
| A3.4 | `en.ts:143` | « Email & WhatsApp, 24/7 assistant » (comparison row) | while closed: « Email, 24/7 assistant » (`en.ts:419`) |
| A3.5 | `en.ts:154` | « Here to help » — « 24/7 assistant, human help when needed » | |
| A3.6 | `en.ts:173`, `:188`, `:203`, `:310` | « **24/7** assistant » / « 24/7 assistant » | |
| A3.7 | `src/content/en/info.ts:159-161` | « Our automated assistant is available ${F.supportHours}, with human support when needed. … » · note « Our support team speaks these six languages; our legal documents are in English. » | support languages `info.ts:37` |
| A3.8 | `src/content/legal.ts:187` | « Phone / WhatsApp » (Legal notice) | unchanged by design |

Decision: ☐ approve all ☐ change (list refs): ____

### W4 — Cookie banner and cookie policy (A4)

Proposed text: Phase 13 draft `docs/release/phase13/d9-cookie-policy-draft.md` §3–4 (quoted exactly), subject to
`docs/release/final/cookie-analytics-reconciliation.md`.

| Ref | File:line | Current (exact) | Proposed (D9 draft) | Decision |
|---|---|---|---|---|
| A4.1 | `en.ts:21` `consent.text` | « With your consent, we use cookies to measure our audience (Google Analytics, Microsoft Clarity) and our advertising campaigns (marketing). Nothing is set until you choose. You can change your choice at any time in « Cookie settings ». » | « With your consent, we use cookies to measure our audience (Google Analytics, Microsoft Clarity) and, for marketing, to measure our Google ads and show them to people who visited our site. Nothing is set until you choose. You can change your choice at any time in « Cookie settings ». » | ☐ P ☐ K ☐ C |
| A4.2 | `en.ts:28` `necessaryText` | « Remembers your cookie choice. Always on, no tracking. » | « Remembers your cookie choice and protects the site. Always on, no tracking. Anonymous cookie-less statistics (Cloudflare). » | ☐ P ☐ K ☐ C |
| A4.3 | `en.ts:30` `analyticsText` | « Audience measurement and site improvement (Google Analytics, Microsoft Clarity). » | (unchanged) | ☐ K ☐ C |
| A4.4 | `en.ts:32` `marketingText` | « Measurement of our advertising campaigns (Google Ads, Meta, TikTok). » | « Measurement of our ads and showing our ads to past visitors (Google Ads). » | ☐ P ☐ K ☐ C |
| A4.5 | `src/content/legal.ts:103` « Your choice » | « Optional cookies are only set if you accept them in the cookie banner. If you decline, the site works the same. » | « Optional cookies and similar technologies (local storage) are only used if you accept them in the cookie banner, separately for Analytics and Marketing. If you decline, the site works the same. Strictly necessary storage and our cookie-less statistics are always used. » | ☐ P ☐ K ☐ C |
| A4.6 | `legal.ts:111-117` table | `sygma_consent` « Remembers your cookie choice » « Until you change it » · `_ga, _ga_*` « Audience measurement (Google Analytics) — with your consent » « 2 years » · `_clck, _clsk` « Usage analysis (Microsoft Clarity) — with your consent » « 1 year / 1 day » | Three tables « Always on », « Analytics », « Marketing » exactly as in `d9-cookie-policy-draft.md` §3 | ☐ P ☐ K ☐ C |
| A4.7 | `legal.ts:119` | « No advertising cookie is used at the moment. » | « We do not use Meta or TikTok cookies today. If we add other advertising partners, we will update this page and ask for your consent again. » | ☐ P ☐ K ☐ C |
| A4.8 | `legal.ts:127` « Changing your choice » | « Click « Cookie settings » at the bottom of any page. You can also delete cookies in your browser. » | « Click « Cookie settings » at the bottom of any page. When you withdraw a consent, we delete the cookies and stored data that our site can delete and reload the page. Cookies set by Google or Microsoft on their own domains can only be deleted in your browser settings. » | ☐ P ☐ K ☐ C |

Open points for counsel (from the draft): Cloudflare Web Analytics outside consent in every target country; consent
expiry; remarketing at launch (can be switched off in Google Ads / GTM without a deploy). The approved English banner is
then translated into the 7 languages. Register rows already open on the banner:

| Row | File:line | Current (exact) | Register suggestion (exact) | Decision |
|---|---|---|---|---|
| de 6 | `de.ts:40` | « Mit Ihrer Einwilligung verwenden wir Cookies, um unsere Reichweite (Google Analytics, Microsoft Clarity) und unsere Werbekampagnen (Marketing) zu messen. Vor Ihrer Auswahl wird nichts gesetzt. Sie können Ihre Auswahl jederzeit unter „Cookie-Einstellungen“ ändern. » | « … Bevor Sie eine Auswahl treffen, werden keine Cookies gesetzt. … » | ☐ P ☐ K ☐ C |
| nl 1 | `nl.ts:40` | « Met je toestemming gebruiken we cookies om ons bereik te meten (Google Analytics, Microsoft Clarity) en onze advertentiecampagnes te meten (marketing). Er wordt niets geplaatst voordat je een keuze maakt. Je kunt je keuze altijd wijzigen via ‘Cookie-instellingen’. » | « Met je toestemming gebruiken we cookies om het bezoek aan onze website (Google Analytics, Microsoft Clarity) en onze advertentiecampagnes (marketing) te meten. Er wordt niets geplaatst voordat je een keuze maakt. Je kunt je keuze altijd wijzigen via ‘Cookie-instellingen’. » | ☐ P ☐ K ☐ C |
| nl 2 | `nl.ts:49` | « Bereikmeting en verbetering van de website (Google Analytics, Microsoft Clarity). » | « Meting van het websitebezoek en verbetering van de website (Google Analytics, Microsoft Clarity). » | ☐ P ☐ K ☐ C |
| sv 1 | `sv.ts:40` | « Med ditt samtycke använder vi cookies för att mäta vår publik (Google Analytics, Microsoft Clarity) och våra annonskampanjer (marknadsföring). Inget sätts förrän du har gjort ditt val. Du kan när som helst ändra ditt val under ”Cookieinställningar”. » | « Med ditt samtycke använder vi cookies för att mäta trafiken på webbplatsen (Google Analytics, Microsoft Clarity) och resultatet av våra annonskampanjer (marknadsföring). Inga cookies sätts förrän du har gjort ditt val. … » (or « Inga valfria cookies » if the choice cookie is excluded) | ☐ P ☐ K ☐ C |
| sv 2 | `sv.ts:49` | « Publikmätning och förbättring av webbplatsen (Google Analytics, Microsoft Clarity). » | « Besöksstatistik och förbättring av webbplatsen (Google Analytics, Microsoft Clarity). » | ☐ P ☐ K ☐ C |
| sv 3 | `sv.ts:47` | « Kommer ihåg ditt cookieval. Alltid på, ingen spårning. » | « … Alltid aktiva, ingen spårning. » | ☐ P ☐ K ☐ C |
| nb 5 | `nb.ts:39` | « Med ditt samtykke bruker vi informasjonskapsler (cookies) til å måle trafikken på nettstedet (Google Analytics, Microsoft Clarity) og annonsekampanjene våre (markedsføring). Ingenting lagres før du har valgt. Du kan når som helst endre valget ditt under «Cookie-innstillinger». » | « Hvis du samtykker, bruker vi informasjonskapsler (cookies) til å måle trafikken på nettstedet (Google Analytics, Microsoft Clarity) og effekten av annonsekampanjene våre (markedsføring). Ingenting lagres før du har valgt. … » | ☐ P ☐ K ☐ C |

Also open: nb term « informasjonskapsler » vs « cookies » (`review-nb.md` L-039): ☐ informasjonskapsler ☐ cookies.

### W5 — Taxes and price display (A7, B2)

| Ref | File:line | Current (exact) | Proposed | Decision |
|---|---|---|---|---|
| B2.1 | `en.ts:343` (FAQ, JSON-LD) | « Three yearly plans: Starter $59, Plus $69 and Ultra+ $99 per year (USD, before taxes), with 20% off over 24 months and 30% off over 36 months. Taxes and the final price are always displayed before any purchase. » | Counsel / tax adviser to draft (option: remove the last sentence) | ☐ remove ☐ C ☐ K |
| B2.2 | `src/content/terms.ts:49` | « … Prices are shown in USD before taxes; the final price, taxes included, is always displayed before payment. … » | Counsel to draft | ☐ C ☐ K |
| B2.3 | `en.ts:515` (closed forms) | « $0.00 USD » | « Calculated by our team before payment » (B2 option a) | ☐ P ☐ remove line ☐ C |
| nb 3 | `nb.ts:361` (FAQ); `src/content/nb/info.ts:258` | « Tre årsabonnementer: Starter 59 USD, Plus 69 USD og Ultra+ 99 USD per år (eksklusive avgifter), med 20 % rabatt for 24 måneder og 30 % rabatt for 36 måneder. Avgifter og sluttpris vises alltid før du kjøper. » · « Prisene vises i amerikanske dollar (USD) eksklusive avgifter, og prisen på abonnementet ditt vises før du sender bestillingen. Lengre varighet koster mindre per år: se gjeldende priser under «Abonnementer». » | No wording proposal in the register (business and legal decision) — counsel / tax adviser to draft | ☐ C ☐ K |

### W6 — Withdrawal (B3, A7)

| Ref | File:line | Current (exact) | Proposed | Decision |
|---|---|---|---|---|
| B3.1 | `src/content/legal.ts:152`, `:154`; `src/content/en/info.ts:376` | title « EU and UK customers » · « You also have 14 days to withdraw. After the first 7 days, we refund the unused part of your subscription. » | Counsel to draft (territories, information, model form, early-start acknowledgement) | ☐ C |
| B3.2 | `terms.ts:57` | « … EU and UK consumers also have a 14-day right of withdrawal. Details are in our Refunds & cancellations policy; your statutory consumer rights always apply. » | Counsel to draft | ☐ C |
| B3.3 | `en.ts:347` (FAQ) | « Plans never renew automatically. Ask within 7 days of activation and we refund you 100%. EU and UK customers also keep their 14-day withdrawal right. » | Counsel to draft | ☐ C |
| B3.4 | `en.ts:571`; `info.ts:150`, `:369`, `:371` | « …14-day withdrawal for EU and UK customers, no automatic renewal. » · « 7-day money-back guarantee after activation; EU and UK customers also keep their 14-day withdrawal right. » · « …14-day withdrawal for EU and UK customers, and how to ask. » | Counsel to draft | ☐ C |
| nb 1 | `nb.ts:365`; `src/content/nb/info.ts:98`, `:316`, `:318`, `:323` | « … Kunder i EU og Storbritannia har i tillegg 14 dagers angrerett. » · « 7 dagers pengene-tilbake-garanti etter aktivering; kunder i EU og Storbritannia har i tillegg 14 dagers angrerett. » · « …14 dagers angrerett i EU og Storbritannia, og slik ber du om det. » · title « Kunder i EU og Storbritannia » | « Kunder i EØS (inkludert Norge) og Storbritannia har i tillegg 14 dagers angrerett. » Section title: « Kunder i EØS og Storbritannia. » (affects the English source and every language) | ☐ P ☐ K ☐ C |
| de 4 | `src/content/de/info.ts:328` | « Sie haben zusätzlich 14 Tage Zeit für Ihren Widerruf. Nach den ersten 7 Tagen erstatten wir den nicht genutzten Teil Ihres Abos. » | « Sie haben zusätzlich ein 14-tägiges Widerrufsrecht. … » | ☐ P ☐ K ☐ C |

### W7 — Refunds (B4) — 16 register rows

| Ref | File:line | Current (exact) | Proposed | Decision |
|---|---|---|---|---|
| B4.1 | `legal.ts:146`; `info.ts:375` | « Not satisfied? Ask within 7 days of activation and we refund 100%, no questions asked. One refund per customer; not available for accounts suspended for sharing or reselling access. » | Counsel to draft (after the owner's refund procedure per method) | ☐ C ☐ K |
| B4.2 | `legal.ts:162`; `info.ts:377` | « Send your order reference to ${EMAIL} or on WhatsApp. You are refunded within 14 days, to the payment method you used. » | Counsel to draft | ☐ C ☐ K |
| fr 4 | `src/content/fr/info.ts:327` | « Pas satisfait ? Faites votre demande dans les 7 jours suivant l’activation et nous vous remboursons à 100 %, sans justification. Un seul remboursement par client ; non disponible pour les comptes suspendus pour partage ou revente de l’accès. » | « … nous vous remboursons à 100 %, sans avoir à vous justifier. … » | ☐ P ☐ K ☐ C |
| fr 6 | `fr/info.ts:329` | « Envoyez votre référence de commande à support@sygmatv.com ou sur WhatsApp. Vous êtes remboursé sous 14 jours, sur le moyen de paiement utilisé. » | « … Vous êtes remboursé sous 14 jours, via le moyen de paiement utilisé. » | ☐ P ☐ K ☐ C |
| de 5b | `de/info.ts:321` (`:323` prelaunch), `:324` | « Erstattungen bei SYGMA TV+: erst kostenlos testen, 100 % zurück binnen 7 Tagen ab Aktivierung, 14 Tage Widerruf für Kunden in EU und UK, so geht’s. » · « 7 Tage Geld-zurück-Garantie, so beantragen Sie sie. » | Use « Widerrufsrecht » in the description; in the summary, use « – » instead of the comma. | ☐ P ☐ K ☐ C |
| es 1 | `es.ts:366` | « Los planes nunca se renuevan automáticamente. Pídelo en los 7 días siguientes a la activación y te devolvemos el 100 %. Los clientes de la UE y del Reino Unido conservan además su derecho de desistimiento de 14 días. » | « … Si nos lo pides en los 7 días siguientes a la activación, te devolvemos el 100 %. … » | ☐ P ☐ K ☐ C |
| es 2 | `src/content/es/info.ts:322` | « ¿No estás satisfecho? Pídelo en los 7 días siguientes a la activación y te devolvemos el 100 %, sin preguntas. Un solo reembolso por cliente; no disponible para cuentas suspendidas por compartir o revender el acceso. » | « ¿No estás satisfecho? Solicita el reembolso en los 7 días siguientes a la activación y te devolvemos el 100 %, sin tener que dar explicaciones. … » | ☐ P ☐ K ☐ C |
| es 3 | `es/info.ts:320` | « Primero pruebas y, si no quedas satisfecho, te devolvemos todo en los 7 días siguientes a la activación. La política completa está en nuestra página de Reembolsos (en inglés). » | « Primero pruebas y, si no quedas satisfecho en los 7 días siguientes a la activación, te reembolsamos el importe íntegro. … » | ☐ P ☐ K ☐ C |
| it 1 | `it.ts:367` | « I piani non si rinnovano mai automaticamente. Chiedi entro 7 giorni dall’attivazione e ti rimborsiamo al 100%. I clienti di UE e Regno Unito mantengono inoltre il diritto di recesso di 14 giorni. » | « … Se lo chiedi entro 7 giorni dall’attivazione, ti rimborsiamo al 100%. … » | ☐ P ☐ K ☐ C |
| it 2 | `src/content/it/info.ts:323` | « Non sei soddisfatto? Chiedi entro 7 giorni dall’attivazione e ti rimborsiamo al 100%, senza domande. Un solo rimborso per cliente; non disponibile per gli account sospesi per condivisione o rivendita dell’accesso. » | « Non sei soddisfatto? Chiedi il rimborso entro 7 giorni dall’attivazione e ti rimborsiamo al 100%, senza bisogno di giustificazioni. … » | ☐ P ☐ K ☐ C |
| nl 4 | `nl.ts:366` | « Abonnementen worden nooit automatisch verlengd. Vraag het binnen 7 dagen na activering aan en je krijgt 100% terug. Klanten in de EU en het VK behouden daarnaast hun herroepingsrecht van 14 dagen. » | « … Vraag binnen 7 dagen na activering een terugbetaling aan en je krijgt 100% terug. … » | ☐ P ☐ K ☐ C |
| nl 11 | `src/content/nl/info.ts:324` | « Niet tevreden? Vraag het binnen 7 dagen na activering aan en we betalen 100% terug, zonder vragen. Eén terugbetaling per klant; niet mogelijk voor accounts die zijn geblokkeerd wegens het delen of doorverkopen van toegang. » | « Niet tevreden? Vraag binnen 7 dagen na activering een terugbetaling aan en je krijgt 100% terug, zonder vragen. … opgeschort wegens … » | ☐ P ☐ K ☐ C |
| sv 5 | `sv.ts:506` | « 7 dagars pengarna tillbaka » | « Pengarna tillbaka i 7 dagar » / « 7 dagars pengarna-tillbaka-garanti » | ☐ P ☐ K ☐ C |
| sv 6 | `sv.ts:172` | « Pengarna tillbaka » | « Pengarna-tillbaka-garanti » (25 characters; layout check needed) | ☐ P ☐ K ☐ C |
| sv 7 | `src/content/sv/info.ts:326` | « Skicka ditt ordernummer till support@sygmatv.com eller på WhatsApp. Du får pengarna tillbaka inom 14 dagar, till det betalsätt du använde. » | « … Du får pengarna tillbaka inom 14 dagar, via samma betalsätt som du använde. » | ☐ P ☐ K ☐ C |
| sv 8 | `sv/info.ts:322` | « Testa först och få sedan full återbetalning om du inte är nöjd inom 7 dagar från aktiveringen. Hela policyn finns på vår sida om återbetalning (på engelska). » | « Testa först. Är du inte nöjd får du full återbetalning om du hör av dig inom 7 dagar från aktiveringen. … » | ☐ P ☐ K ☐ C |
| sv 9 | `sv/info.ts:318` (`:320` prelaunch) | « Återbetalning hos SYGMA TV+: gratis provperiod först, 100 % tillbaka inom 7 dagar från aktivering, 14 dagars ångerrätt i EU och UK, och hur du begär den. » | « … 14 dagars ångerrätt i EU och UK – så går det till. » | ☐ P ☐ K ☐ C |
| nb 4b | `src/content/nb/info.ts:316` (`:318` prelaunch) | « Refusjon hos SYGMA TV+: prøv gratis først, 100 % refusjon innen 7 dager etter aktivering, 14 dagers angrerett i EU og Storbritannia, og slik ber du om det. » | « Refusjon hos SYGMA TV+: prøv gratis først, 100 % refusjon innen 7 dager etter aktivering, 14 dagers angrerett for kunder i EU/UK. Slik ber du om det. » (see also nb 1) | ☐ P ☐ K ☐ C |

### W8 — Contract sequence and payment statements (B5, A7)

| Ref | File:line | Current (exact) | Proposed | Decision |
|---|---|---|---|---|
| B5.1 | `terms.ts:25` | « These Terms govern your use of sygmatv.com and, once subscriptions open, the SYGMA TV+ streaming service. By using the website or submitting a form, you accept them. The operator’s full identity is published in our Legal notice. » | Counsel to draft | ☐ C ☐ K |
| B5.2 | `terms.ts:33` | « Trial requests are free and create no obligation. When you order on the site, nothing is charged there: our team contacts you on WhatsApp to confirm your order and payment, then activates your access. The contract starts when we confirm your order. » | Counsel to draft (after the owner states the sequence) | ☐ C |
| B5.3 | `info.ts:139`, `:185` | « You order with a short form and a real person from our team takes it from there on WhatsApp. We activate your subscription first: you pay only once your access is active. » | Align with B5.2 once decided | ☐ C ☐ K |
| B5.4 | `info.ts:291`; `en.ts:331` | « You order with a short form. Our team contacts you on WhatsApp and activates your access, and you pay after activation. Nothing is charged on this website. » · « …our team contacts you on WhatsApp and activates your access, and you pay after activation. … » | Align with B5.2 | ☐ C ☐ K |
| B5.5 | `info.ts:312` | « The contract starts when our team confirms your order. Plans never renew automatically. » | Counsel to draft | ☐ C ☐ K |
| fr 5 | `src/content/fr/info.ts:264` | « Le contrat commence lorsque notre équipe confirme votre commande. Les formules ne se renouvellent jamais automatiquement. » | « Le contrat prend effet lorsque notre équipe confirme votre commande. » | ☐ P ☐ K ☐ C |
| de 9 | `src/content/de/info.ts:264` | « Der Vertrag beginnt, wenn unser Team Ihre Bestellung bestätigt. Tarife verlängern sich nie automatisch. » | « Der Vertrag kommt zustande, wenn unser Team Ihre Bestellung bestätigt. » | ☐ P ☐ K ☐ C |
| nl 12 | `src/content/nl/info.ts:261` | « Het contract begint wanneer ons team je bestelling bevestigt. Abonnementen worden nooit automatisch verlengd. » | « De overeenkomst gaat in wanneer ons team je bestelling bevestigt. » | ☐ P ☐ K ☐ C |
| de 7 | `de.ts:499`, `:508`, `:531`; `src/content/de/info.ts:39`, `:120`, `:122`, `:183`, `:243`, `:256` | « Auf dieser Website wird nichts abgebucht. » (and the 8 other sentences listed in `review-de.md` §4a) | « Auf dieser Website bezahlen Sie nichts. » / « Auf dieser Website erfolgt keine Zahlung. » | ☐ P ☐ K ☐ C |

### W9 — « +30 days free » and « Regular price » (B6)

| Ref | File:line | Current (exact) | Proposed | Decision |
|---|---|---|---|---|
| B6.1 | `en.ts:127`, `:142` | « +30 days free » | Conditions: owner to define, counsel to draft; or remove | ☐ C ☐ remove |
| B6.2 | `terms.ts:49` | « … Promotions such as “+30 days free” apply under the conditions shown at purchase. » | Counsel to draft | ☐ C |
| B6.3 | `en.ts:227` (struck price, `PlanConfigurator.tsx:313-323`) | « Regular price » | « vs 2 × / 3 × 12-month plans » (reg. D7: « vs 2 × 12-month plans »), unless counsel approves the current label | ☐ P ☐ K ☐ remove |
| B6.4 | `en.ts:226` | « You save {amount} (−{pct}%) vs {n} × 12 months » | No proposal (already a comparison label) | ☐ K ☐ C |

### W10 — Form consent and data (B8, C6) — forms are closed in prelaunch

| Ref | File:line | Current (exact) | Proposed | Decision |
|---|---|---|---|---|
| B8.1 | `en.ts:464` (`forms.consent`) | « I agree to be contacted about this request. Data deleted within 12 months. » | Counsel to draft (depends on C6) | ☐ C ☐ K |
| B8.2 | `en.ts:491`, `:492` | « I agree to be contacted about my order. » · « Data deleted within 12 months. » | Counsel to draft | ☐ C ☐ K |
| de 12 | `de.ts:476`, `:504` | « Ich bin einverstanden, wegen dieser Anfrage kontaktiert zu werden. Daten werden innerhalb von 12 Monaten gelöscht. » · « Daten werden innerhalb von 12 Monaten gelöscht. » | « … Ihre Daten werden innerhalb von 12 Monaten gelöscht. » | ☐ P ☐ K ☐ C |
| es 6 | `es.ts:476`, `:504` | « Acepto que me contacten sobre esta solicitud. Datos eliminados en un plazo de 12 meses. » · « Datos eliminados en un plazo de 12 meses. » | « … Tus datos se eliminan en un plazo de 12 meses. » / « … Mis datos se eliminarán en un plazo de 12 meses si no me suscribo. » | ☐ P ☐ K ☐ C |
| it 4 | `it.ts:477`, `:504` | « Accetto di essere ricontattato/a in merito a questa richiesta. Dati cancellati entro 12 mesi. » · « Accetto di essere ricontattato/a in merito al mio ordine. » | « Accetto di essere contattato/a … » (optional); « I dati vengono cancellati entro 12 mesi » (optional) | ☐ P ☐ K ☐ C |
| sv 4 | `sv.ts:476`, `:503` | « Jag godkänner att bli kontaktad om den här förfrågan. Uppgifterna raderas inom 12 månader. » · « Jag godkänner att bli kontaktad om min beställning. » | « Jag godkänner att ni kontaktar mig om den här förfrågan / om min beställning. … » | ☐ P ☐ K ☐ C |
| nb 6 | `nb.ts:475`, `:503` | « Jeg godtar å bli kontaktet om denne forespørselen. Dataene slettes innen 12 måneder. » · « Dataene slettes innen 12 måneder. » | « … Opplysningene dine slettes innen 12 måneder. » | ☐ P ☐ K ☐ C |
| nl 5 | `nl.ts:371` (FAQ) | « Alleen de gegevens die je ons stuurt, gebruikt om je aanvraag en je abonnement af te handelen. We verkopen je gegevens nooit. » | « Alleen de gegevens die je ons zelf stuurt. We gebruiken ze alleen om je aanvraag en je abonnement af te handelen, en we verkopen je gegevens nooit. » | ☐ P ☐ K ☐ C |

### W11 — Auto-renewal and guarantee labels (B12)

| Ref | File:line | Current (exact) | Proposed | Decision |
|---|---|---|---|---|
| B12.1 | `en.ts:170`, `:185`, `:200` | « No automatic renewal » | Keep (reg. D12: factual label, subject to counsel) | ☐ K ☐ C |
| B12.2 | `legal.ts:144`; `terms.ts:57` | « Satisfied or refunded — 7 days » · « (“Satisfied or refunded”) » | « 7-day money-back after activation » (reg. D12, subject to counsel) | ☐ P ☐ K ☐ C |
| B12.3 | `fr.ts:189`, `:204`, `:219` | « Sans reconduction » | « Sans reconduction tacite » (Phase 12 L-009; 24 characters, over the 22-character card guide) | ☐ P ☐ K ☐ C |
| B12.4 | `sv.ts:189`, `:204`, `:219` | « Ingen autoförnyelse » | « Förnyas inte automatiskt » (Phase 12 L-019; 24 > 22: layout check) | ☐ P ☐ K ☐ C |
| B12.5 | `nb.ts:188`, `:203`, `:218` | « Ingen autofornyelse » | « Fornyes ikke automatisk » (Phase 12 L-019; 23 > 22: layout check) | ☐ P ☐ K ☐ C |
| B12.6 | `nb.ts:171` | « Pengene tilbake » | « Pengene-tilbake-garanti » (Phase 12 L-036) | ☐ P ☐ K ☐ C |

The 36 register rows are covered as follows: W4 (de 6, nl 1, nl 2, sv 1, sv 2, sv 3, nb 5), W5 (nb 3), W6 (nb 1,
de 4), W7 (16 refund rows), W8 (fr 5, de 9, nl 12, de 7), W10 (de 12, es 6, it 4, sv 4, nb 6, nl 5).

---

Approved by: ____________________ (owner, Sygma TV LLC) · Date: ____________

Specialist sign-offs attached: ☐ counsel ☐ privacy counsel ☐ tax adviser ☐ rights holder ☐ media/IP counsel ☐ native
reviewers (☐ fr ☐ de ☐ es ☐ it ☐ nl ☐ sv ☐ nb)
