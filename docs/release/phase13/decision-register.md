# SYGMA TV+ — Phase 13 decision register (D1–D16)

**Date:** 23 November 2026 · **Branch:** `claude/p13-docs` · **Base:** release candidate `5c3635f`
**Scope:** documentation only. No source, configuration, price, legal text, e-mail, database or deployment was changed.
No database was queried; every statement below comes from the repository at `5c3635f` (file and line references
verified on that commit) or from the Phase 11/12 reports named in « Sources ».

**This is not legal or tax advice.** The author is not a lawyer or tax adviser. Where a legal or tax topic is named,
it is a question for the responsible specialist, not a conclusion. Nothing here assumes that any right, licence, tax
registration or approval exists.

**IDs.** D1–D16 are the IDs of the Phase 12 owner/legal register (`PHASE12-FINAL-REPORT.md` §7). They are **not** the
D-numbers of `docs/DECISIONS.md` (which uses D1–D68 for its own history); references to that file are written
« DECISIONS D65 », etc. The « Exact issue » text of each entry is copied from the Phase 12 register.

**Companion documents:** `legal-blocker-register.md` (one row per legal/commercial topic) and `owner-approval.md`
(one consolidated checklist for the owner).

---

## Context that affects every entry

1. **The live production build has the order and trial forms open.** At production commit `864f703`,
   `.env.production` and `wrangler.jsonc:28` set `FEATURE_CONTACT_FORM=true` (checked with `git show 864f703:…`).
   The release candidate sets `FEATURE_CONTACT_FORM=false` (`.env.production`, `wrangler.jsonc:28`). Until production
   Step A (Phase 12 §9) is deployed, the assisted order flow is reachable on sygmatv.com. Items below marked « blocks
   opening orders » therefore also concern the live site today. Whether orders were taken and paid in the past was
   not checked (no database query).
2. **The launch gate covers only the automated checkout.** `getLaunchBlockers()` (`src/config/launch-gate.ts:20-48`)
   is called by `POST /api/checkout` (`src/app/api/checkout/route.ts:13-14`). `POST /api/contact`, which receives the
   assisted orders, checks only `FEATURE_CONTACT_FORM` (`src/app/api/contact/route.ts:20`, `src/lib/features.ts:3-4`).
3. **Identical sales code in production and the release candidate.** `git diff 864f703 5c3635f` shows no change in
   `src/lib/email`, `src/lib/telegram`, `src/lib/pricing.ts`, `src/lib/price-source.ts`, `src/config/price-tables.json`,
   `supabase/`, `src/content/legal.ts`, `src/content/terms.ts`, `src/config/site.ts`, `src/config/launch-gate.ts`;
   in `src/app/api` only the `/api/health` label changed.

## Legend

| Column | Meaning |
|---|---|
| Prelaunch publication | Production Step B of Phase 12 §9: 8 languages public, content pages live, orders and trials closed. « Yes » = should not proceed before the item is decided; « Recommended » = Phase 12 or this register recommends deciding first; « No » = does not block. |
| Opening orders | Setting `FEATURE_CONTACT_FORM=true` (assisted order and trial forms reopen). |
| Commercial sales | Taking payment for subscriptions by any channel (assisted WhatsApp sale or `SALES_ENABLED=true`). |
| Phase 13 status | « Being implemented in Phase 13, verify at integration » = another Phase 13 agent is preparing the change in parallel; this register describes the planned change, not a verified result. |

## Summary

| ID | Topic | Decision owner | Phase 13 technical work | Prelaunch publication | Opening orders | Commercial sales |
|---|---|---|---|---|---|---|
| D1 | Release scope | Owner | Release config prepared as a patch, not applied (being implemented) | **Yes** | No | No |
| D2 | Taxes and price display | Owner + tax adviser + counsel | None | Recommended (FAQ wording) | **Yes** | **Yes** |
| D3 | Withdrawal right | Owner + counsel | None | Recommended (nb page) | **Yes** | **Yes** |
| D4 | Refund wording | Owner + counsel | None | No | **Yes** | **Yes** |
| D5 | Contract formation / Terms flow | Owner + counsel | None | Recommended | **Yes** | **Yes** |
| D6 | Content rights, sports, device names | Owner + counsel + rights holder | Wording qualified (being implemented) | **Yes** (recommended minimum) | **Yes** | **Yes** |
| D7 | « +30 DAYS FREE », « Regular price » | Owner + counsel | None | No | **Yes** | **Yes** |
| D8 | Support claims, WhatsApp in prelaunch | Owner | Wording + WhatsApp hidden (being implemented) | **Yes** (recommended) | No | Recommended |
| D9 | Cookie policy vs consent banner | Owner + privacy counsel | Audit + draft correction, not published (being implemented) | **Yes** (recommended) | No | **Yes** |
| D10 | Legal pages in English only | Owner + counsel | None | No | **Yes** | **Yes** |
| D11 | 36 sensitive wordings | Owner + counsel + native reviewers | None | Recommended (25 rendered) | **Yes** | **Yes** |
| D12 | Auto-renewal / guarantee wording choices | Owner + counsel + native reviewers | None | No | **Yes** | **Yes** |
| D13 | Design choices | Owner | None | No | No | No |
| D14 | Operations during prelaunch | Owner | None | **Yes** (procedure) | No | Partly (`domain` gate) |
| D15 | Native-speaker review | Owner + native reviewers | Review pack (being implemented) | **Yes** (per language) | **Yes** (per language) | **Yes** (per language) |
| D16 | Reopening rule | Owner (+ counsel, tax adviser) | None (technical guard possible later) | No | **Yes** | **Yes** |

| Counts (16 entries) | Yes | Recommended | Partly | No |
|---|---|---|---|---|
| Prelaunch publication | 6 (D1, D6, D8, D9, D14, D15) | 4 (D2, D3, D5, D11) | — | 6 (D4, D7, D10, D12, D13, D16) |
| Opening orders | 11 (D2–D7, D10, D11, D12, D15, D16) | — | — | 5 (D1, D8, D9, D13, D14) |
| Commercial sales | 12 (D2–D7, D9–D12, D15, D16) | 1 (D8) | 1 (D14) | 2 (D1, D13) |

---

## D1 — Release scope

**Exact issue (Phase 12):** « Release scope: all 8 languages at once, or phased (en → About/Help → fr → others)?
Publish About/Help (`CONTENT_PAGES=live`) during prelaunch? » — « 6 → 85 indexable URLs in one deploy; rollback turns
/de /es /it /nl /sv /nb into 404 unless added to legacy redirects. » Where: `.env.production` (release commit).
Blocks: public 8-language release.

**Current implementation (verified)**
- `.env.production` contains neither `NEXT_PUBLIC_RELEASED_LANGUAGES` nor `NEXT_PUBLIC_CONTENT_PAGES`: no language is
  released and About/Help are off.
- `src/i18n/locales.ts:64-72`: en `enabled`; fr, de, es, it, nl, sv, nb `preview`. `:150`:
  `LEGACY_REDIRECT_LANGUAGES = ['fr']` only.
- `docs/release/release-readiness.md` §9: the two lines to add in the release commit; `tests/unit/release-flag.test.ts`
  accepts the flag only in `.env.production`.

**Risk.** One deploy publishes 85 indexable URLs with AI-only translations (D15) and legal-adjacent wording that is
pending (D3, D4, D11). A rollback without first extending `LEGACY_REDIRECT_LANGUAGES` returns 404 for six indexed
language prefixes.

**Recommended safest option.** Phased: (1) Step A, English prelaunch, which also closes the live order form (Context
1); (2) content pages live in English; (3) only the languages whose native review (D15) is signed off. Before any
rollback of a public language, add it to `LEGACY_REDIRECT_LANGUAGES`.

**Technical resolution.** Fully technical once decided (one `.env.production` commit). Phase 13: the release
configuration is prepared as a patch and **not applied** — being implemented in Phase 13, verify at integration.

**Requires approval.** Owner (scope, date, language list). No external approval for the configuration itself; the
content released depends on D6, D8, D9, D15.

**Remaining action.** Owner chooses the scope and language list in writing; engineering applies the prepared patch on
private staging, then production, and runs the Phase 12 §9 post-deploy checks.

**Blocks prelaunch publication:** Yes (it is the publication decision). **Blocks commercial sales:** No.

---

## D2 — Taxes and price display

**Exact issue (Phase 12):** « Taxes and price display: tax-inclusive display (EU/EEA/UK/NO/CH), currency (USD only,
CHF?), VAT/GST registration » — « "before taxes" and "final price always displayed" are shown; taxes are never
computed (blocker A). » Where: FAQ, Help › prices, Terms. Blocks: commercial launch.

**Current implementation (verified)**
- No tax rule: `src/config/site.ts:51` `taxRules: null`; launch blocker `tax_rules_missing`
  (`src/config/launch-gate.ts:45`), checkout only.
- Quotes never contain tax: `src/lib/pricing.ts:51-53` and `:93` (`taxMinor: null`); `src/app/api/quote/route.ts:32-33`
  returns `taxes: { calculated: false, reason: 'tax_rules_not_configured' }`, `chargeable: false`.
- Prices exist in USD for market `US` only: `src/lib/price-source.ts:8`, `:26`; `src/config/price-tables.json`
  (`currency: USD`, `market: US`); `scripts/generate-prices.mjs:1-3`.
- Visible statements: FAQ « …(USD, before taxes)… Taxes and the final price are always displayed before any
  purchase » (`src/i18n/dictionaries/en.ts:343`, also in the FAQPage JSON-LD); Terms « Prices are shown in USD before
  taxes; the final price, taxes included, is always displayed before payment » (`src/content/terms.ts:49`).
- Order window (forms only; returns when orders open): « Taxes » line fed by the constant `taxesValue: '$0.00 USD'`
  (`src/i18n/dictionaries/en.ts:509`, rendered at `src/components/CheckoutDialog.tsx:415`), not by the quote.
- Payment confirmation e-mail: « Amount Paid » with no tax line (`src/lib/email/templates.ts:314`).

**Risk.** The texts cannot all be true at once (« before taxes », a hard-coded zero, « taxes included … always
displayed »). Whether consumer markets require tax-inclusive price display, prices in a local currency (e.g. CHF), or
foreign-seller VAT/GST registration from the first sale is unassessed (questions listed in
`legal-blocker-register.md` L-02). If assisted sales already took place while the form was open (Context 1), their
tax treatment is also unassessed.

**Recommended safest option.** Do not reopen orders or take payment in any market until a tax adviser has given a
written, dated per-market position. Before orders reopen, the order window must not show a tax figure that the
server did not compute (options in `owner-approval.md` B2).

**Technical resolution.** Partly technical: removing or neutralising the `$0.00 USD` line, feeding it from the quote,
and later tax-inclusive or local-currency price tables are engineering work, but each depends on the tax decision.
Phase 13 does **not** change any of it.

**Requires approval.** Tax adviser (EU VAT/OSS, UK VAT, Norway VOEC, Swiss VAT, Canada GST/HST/QST/PST, US state sales
tax incl. New Mexico); consumer counsel (price display); owner (markets, currency).

**Remaining action.** Owner commissions the per-market tax assessment (tax adviser); owner + counsel approve the
price-display wording; engineering implements after approval.

**Blocks prelaunch publication:** Recommended — the FAQ sentence « Taxes and the final price are always displayed
before any purchase » is shown in prelaunch in 8 languages; owner may keep, reword or remove it. **Blocks opening
orders:** Yes. **Blocks commercial sales:** Yes.

---

## D3 — Withdrawal right

**Exact issue (Phase 12):** « Withdrawal right: EEA/Norway and Switzerland scope, withdrawal form, acknowledgement before
service starts » — « Text names "EU and UK" only (blocker D). » Where: FAQ, About, Help › Refunds, legal pages, Terms.
Blocks: commercial launch.

**Current implementation (verified)**
- Refunds page: section « EU and UK customers »: « You also have 14 days to withdraw. After the first 7 days, we refund
  the unused part of your subscription. » (`src/content/legal.ts:149-156`).
- Terms: « EU and UK consumers also have a 14-day right of withdrawal… your statutory consumer rights always apply »
  (`src/content/terms.ts:57`).
- FAQ (`src/i18n/dictionaries/en.ts:347`), refunds meta description (`:565`), About commitments
  (`src/content/en/info.ts:138`), Help › Refunds (`src/content/en/info.ts:352-358`).
- No mention of EEA, Norway or Switzerland, no model withdrawal form, no step where the customer expressly requests
  early start (Phase 11 register D, search re-checked on `5c3635f` in `src/content` and `en.ts`).
- Access is activated before payment (`src/content/en/info.ts:127`, `:178`, `:278`).
- Translated equivalents, e.g. nb « EU og Storbritannia » (sensitive-wording register nb 1, nb 4b).

**Risk.** Norwegian (EEA) and Swiss customers are not addressed; the treatment of a service that starts within the
withdrawal period may depend on an express request and acknowledgement that the flow does not collect. Questions for
counsel; no conclusion drawn.

**Recommended safest option.** Counsel defines the territorial wording, withdrawal information, model form and
early-start step before orders reopen; the English source and the 7 translations are then changed together.

**Technical resolution.** After counsel's text: content changes in `legal.ts`, `terms.ts`, `info.ts` × 8,
dictionaries × 8; an acknowledgement checkbox with a stored consent version is technically possible (pattern of
`siteConfig.consentTextVersion`, `src/config/site.ts:60`). Phase 13 does **not** do it.

**Requires approval.** Consumer counsel (EU/EEA incl. Norway, UK, Switzerland); owner (policy generosity).

**Remaining action.** Owner sends the current texts (list above) to counsel; counsel returns approved wording and
process; engineering implements; native reviewers check translations.

**Blocks prelaunch publication:** Recommended for the nb page only (the Norway-targeted page states « EU og
Storbritannia »); No otherwise. **Blocks opening orders:** Yes. **Blocks commercial sales:** Yes.

---

## D4 — Refund wording

**Exact issue (Phase 12):** « Refund wording: "100 %, no questions asked", refunds "to the payment method used" with
crypto / Western Union / MoneyGram » — « 36 sensitive wordings still pending. » Where: FAQ 5, Help › Refunds. Blocks:
commercial launch.

**Current implementation (verified)**
- « Ask within 7 days of activation and we refund 100%, no questions asked. One refund per customer; not available for
  accounts suspended for sharing or reselling access. » (`src/content/legal.ts:146`).
- « You are refunded within 14 days, to the payment method you used. » (`src/content/legal.ts:162`,
  `src/content/en/info.ts:359`).
- Payment methods listed: card, PayPal, « Cryptocurrency (USDT via Binance) », bank transfer, Western Union, MoneyGram
  (`src/content/en/info.ts:39`).
- `refundPolicy: 'satisfied-or-refunded-7-days'` (`src/config/site.ts:55`) clears the `refund_policy_missing` gate.

**Risk.** Refund « to the payment method used » may not be executable for every listed method; the exclusions of the
voluntary guarantee must not read as limiting statutory rights (question for counsel). 16 refund items of the
sensitive-wording register are pending.

**Recommended safest option.** Owner documents how a refund is executed for each payment method; counsel approves one
English wording; translations follow (D11/D15).

**Technical resolution.** Text changes only, after approval. Phase 13 does **not** change them.

**Requires approval.** Owner (process), counsel (wording), payment operations (feasibility per method).

**Remaining action.** Owner writes the refund procedure per payment method; counsel approves the wording.

**Blocks prelaunch publication:** No (25 of the 36 pending wordings are rendered in prelaunch; see D11).
**Blocks opening orders:** Yes. **Blocks commercial sales:** Yes.

---

## D5 — Contract formation / Terms flow

**Exact issue (Phase 12):** « Contract formation / Terms flow: Terms say confirm + payment then activation; the site
says activation before payment » — « Inconsistent order of steps. » Where: Terms, Help, fr/de/nl contract sentences.
Blocks: commercial launch.

**Current implementation (verified)**
- Terms: « our team contacts you on WhatsApp to confirm your order and payment, then activates your access. The
  contract starts when we confirm your order. » (`src/content/terms.ts:33`); « By using the website or submitting a
  form, you accept them » and « once subscriptions open » (`:25`).
- Site: « We activate your subscription first: you pay only once your access is active. » (`src/content/en/info.ts:127`,
  `:178`); « …activates your access, and you pay after activation » (`:278`, `:289`).
- fr 5, de 9, nl 12 of the sensitive-wording register (contract start sentences).

**Risk.** Two different sequences are published; the moment of contract formation, payment and start of performance
also determines the withdrawal and confirmation obligations (D3, legal register L-08). Questions for counsel.

**Recommended safest option.** Owner confirms the real sequence in writing; counsel aligns the Terms to it before
orders reopen.

**Technical resolution.** Text only. Phase 13 does **not** change the Terms.

**Requires approval.** Owner (facts), counsel (Terms).

**Remaining action.** Owner states the actual order → confirmation → activation → payment sequence; counsel redrafts
`terms.ts` §ordering (and checks the acceptance sentence of `:25`).

**Blocks prelaunch publication:** Recommended — the Terms are public and describe ordering in the present tense.
**Blocks opening orders:** Yes. **Blocks commercial sales:** Yes.

---

## D6 — Content rights, sports claims, device platform names

**Exact issue (Phase 12):** « Content rights: sports tiles "International", "Sports" category, Terms "sports", device
platform names (Apple TV, Fire TV…) » — « No licensed territory (blocker C); claims visible on every page. » Where:
Home, Terms, e-mails. Blocks: public release (recommended) and commercial launch.

**Current implementation (verified)**
- `src/config/site.ts:46` `licensedTerritories: []`; `:48` `contentCatalog: null`; `:50` `supportedDevices: null`;
  launch blocker `no_licensed_territory` (`src/config/launch-gate.ts:39`), checkout only.
- Highlights carousel: 15 tiles, six with badge `SPORTS`, every tile region `International`
  (`src/i18n/dictionaries/en.ts:103-117`).
- Content category « Sports — Depending on the channels available in your country » (`en.ts:252`).
- Terms: « Live TV channels, sports, movies and series… Content depends on the licences available in each country »
  (`src/content/terms.ts:41`).
- Trial follow-up e-mail: « your favourite sports, movies, series and live TV » (`src/lib/email/templates.ts:280`).
- Device bar: « Smart TV · Android TV · Fire TV · Apple TV · Mobile & tablet · PC & Mac » (`en.ts:149`); order form
  device list (`en.ts:498`, forms only).
- Assisted orders are accepted from any country: no market or licence check in `src/app/api/contact/route.ts:41-60`.
- DECISIONS D65: rights per country unconfirmed, owner's responsibility.

**Risk.** No written territorial rights are documented in the repository. Advertising sports and « International »
content, and taking orders from any country, is the core legal exposure identified in Phase 11 (blocker C).
Rights-holders' approval for third-party platform names is not documented.

**Recommended safest option.** Prelaunch: publish only the qualified wording (availability qualifiers, no
« International », device categories). Orders and sales: none in a territory without written rights reviewed by
counsel; gate the assisted flow by country once `licensedTerritories` is filled (option C-2(a) of the Phase 11
register).

**Technical resolution.** Wording: **being implemented in Phase 13, verify at integration** (sports « International »
labels → availability qualifiers; device brand names → categories). Not stated as part of that change, to verify at
integration: Terms `terms.ts:41` « sports » and e-mail `templates.ts:280` « favourite sports ». Country gating of
`/api/contact` is technically possible but **not** done in Phase 13. The wording change creates no right.

**Requires approval.** Rights holders / content provider (written territorial licences), media/IP counsel per
territory, owner.

**Remaining action.** Owner approves the Phase 13 wording; owner obtains rights documentation per target territory;
counsel reviews it; engineering fills `licensedTerritories` only after counsel's review.

**Blocks prelaunch publication:** Yes (recommended minimum: the Phase 13 wording change merged and approved).
**Blocks opening orders:** Yes. **Blocks commercial sales:** Yes.

**Owner update (24/11/2026) — supplier-confirmed specifications.** The owner states that the supplier has
confirmed: **35,000+ TV channels**, **200,000+ movies and series**, and **4K HDR availability, subject to compatible
content and devices**. Recorded as *supplier-confirmed specifications*. Per the owner, this confirmation **does not
establish territorial broadcasting rights** (blocker C stays open). The written supplier confirmation itself is not
in the repository: keep a copy with the rights documentation (evidence for L-01 / L-11).

*History.* The figures were shown until Phase 6A (commit `9923c7f`, 20/11/2026): closing banner « Access up to 35,000+
TV channels and 200,000+ movies & series, in HD to 4K HDR, from multiple countries », comparison rows « Live TV
channels +12,000 / +25,000 / +35,000 » and « Movies & series +100,000 / +150,000 / +200,000 », and per-plan card
lines. They were removed (claims inventory A1–A3, `docs/seo/claims-inventory.md`) because no contract or rights
were documented, and the per-plan lines were switched off in `src/config/catalogue.ts` (all `null`). They were not
removed in Phase 12 or 13; the emergency hotfix `8797d7c` kept the production banner text unchanged.

*Recommended treatment (not applied — owner choice, see owner-approval A2b).*
1. Show the confirmed totals again, framed as the supplier's catalogue, never as rights or availability in the
   visitor's country: e.g. EN « Supplier catalogue: 35,000+ TV channels and 200,000+ movies & series. What you can
   watch depends on your country and device. » 4K HDR keeps « on compatible content and devices » (today's
   « 4K/HDR where available » qualifier is consistent and stays).
2. Use them on the Ultra+ card only through the existing switch (`src/config/catalogue.ts`: `ultra: { channels:
   35000, vod: 200000 }`), or in one sentence of the closing banner — not both, and not in the page title, meta
   description or JSON-LD (search snippets lose the qualifier).
3. Keep Starter and Plus figures hidden: the per-plan figures (12,000 / 25,000; 100,000 / 150,000) are **not**
   covered by this confirmation.
4. Never pair the figures with « from multiple countries », « international », « around the world » or named
   sports, leagues or broadcasters (that would imply distribution rights).
5. Translate the qualifier in all 8 languages and add it to the native-review pack (P2).

---

## D7 — « +30 DAYS FREE » badge and struck « Regular price »

**Exact issue (Phase 12):** « "+30 DAYS FREE" badge conditions; struck "Regular price" (computed, not a previous
price) » — « Promotion rules / price-reduction rules. » Where: plan cards, simulator. Blocks: commercial launch.

**Current implementation (verified)**
- Badge `bonus: '+30 days free'` (`en.ts:127`), comparison row (`en.ts:142`), rendered for Plus and Ultra+
  (`src/components/PlanConfigurator.tsx:202`).
- Terms: « Promotions such as "+30 days free" apply under the conditions shown at purchase » (`src/content/terms.ts:49`);
  no conditions are shown anywhere (Phase 12 C-013).
- « Regular price » (`en.ts:227`) = 2 or 3 × the 12-month price (`src/lib/pricing.ts:81`), shown struck through with the
  saving (`PlanConfigurator.tsx:313-323`). Saving percentage rounded down (`pricing.ts:91`); math verified correct in
  Phase 12.

**Risk.** A promotion without stated conditions; a struck « regular » price that was never charged. Whether EU/EEA
price-reduction rules apply to this comparison is a question for counsel (Phase 12 C-014).

**Recommended safest option.** State the badge conditions (eligible terms, start/end) or remove the badge; replace the
struck « Regular price » by a plain comparison label (« vs 2 × 12-month plans ») unless counsel approves it.

**Technical resolution.** Text/CSS only after approval; no price change. Phase 13 does **not** change it.

**Requires approval.** Owner (promotion terms), counsel.

**Remaining action.** Owner defines the promotion conditions; counsel reviews both items.

**Blocks prelaunch publication:** No (recommended before any paid campaign). **Blocks opening orders:** Yes.
**Blocks commercial sales:** Yes.

---

## D8 — Support claims and WhatsApp during prelaunch

**Exact issue (Phase 12):** « Support claims: "24/7 support in 6 languages" (nl/sv/nb visitors get English human
support); WhatsApp/phone number shown during prelaunch while windows say no other channel can be used » —
« Expectation mismatch. » Where: Home, footer, Help, About. Blocks: public release (recommended).

**Current implementation (verified)**
- « 24/7 support in 6 languages » and « 24/7 support » labels: `en.ts:6` (meta), `:83`, `:94`, `:143`, `:154`, `:173`,
  `:188`, `:203`, `:310`.
- Approved fact (owner): automated assistant 24/7, human support when needed — already used in
  `src/content/en/info.ts:324` and `:412`. Support languages: English, French, Arabic, German, Spanish, Italian
  (`src/content/en/info.ts:37`).
- Phone/WhatsApp shown on every Help/About page (`src/components/InfoContent.tsx:104-113`), every legal page
  (`src/components/LegalContent.tsx:29`, `:90-94`), the Legal notice (`src/content/legal.ts:187`) and About facts
  (`src/content/en/info.ts:120`).
- E-mail help blocks show WhatsApp (`src/lib/email/templates.ts:55-56`, `:164-172`).

**Risk.** Short labels read as « human 24/7 in my language »; nl/sv/nb customers get human support in English. A
visible WhatsApp number invites order requests that the prelaunch notice says cannot be made.

**Recommended safest option.** Use the approved wording « 24/7 automated assistant, human help when needed »; show
e-mail only on marketing and help pages during prelaunch; keep the Legal notice unchanged.

**Technical resolution.** **Being implemented in Phase 13, verify at integration**: « 24/7 support in 6 languages » →
« 24/7 automated assistant, human help when needed »; WhatsApp not shown as a contact on marketing/help pages
during prelaunch; Legal notice unchanged. Not part of that change: e-mail templates (no e-mail is sent by the site in
prelaunch; see D14).

**Requires approval.** Owner (marketing wording; WhatsApp display rule); native reviewers for the 7 translations (D15).

**Remaining action.** Owner approves the Phase 13 wording and the prelaunch contact rule; engineering verifies the
merged result in 8 languages.

**Blocks prelaunch publication:** Yes (recommended). **Blocks opening orders:** No. **Blocks commercial sales:**
Recommended (support claims must stay accurate when customers pay).

---

## D9 — Cookie policy vs consent banner

**Exact issue (Phase 12):** « Cookie policy vs consent banner: policy says no advertising cookie, banner asks
Marketing consent (Google Ads, Meta, TikTok); 14 consent wordings » — « Privacy consistency. » Where: `legal.ts`,
banner (8 languages). Blocks: public release (recommended).

**Current implementation (verified)**
- Cookie policy table lists `sygma_consent`, `_ga, _ga_*`, `_clck, _clsk` and states « No advertising cookie is used at
  the moment. » (`src/content/legal.ts:111-119`).
- Banner category « Marketing — Measurement of our advertising campaigns (Google Ads, Meta, TikTok) »
  (`en.ts:31-32`); GTM container `GTM-MGCLXP5L` loaded after Marketing consent, `gtmEnabled: true`
  (`src/config/analytics.ts:10-12`); DECISIONS D61, D62, D68 (Consent Mode, Google Ads ping found and blocked).
- The GTM container's contents are not in the repository.
- 14 consent/privacy wordings in the sensitive-wording register (13 requiring approval).

**Risk.** The published policy and the banner describe different practices; what the GTM container sets cannot be
verified from the code.

**Recommended safest option.** Publish a policy that lists what is actually set, measured on the production host
with each consent state, after privacy counsel's review.

**Technical resolution.** **Being implemented in Phase 13, verify at integration**: actual scripts and cookies
measured; a policy correction drafted **for approval, not published**.

**Requires approval.** Owner; privacy counsel; whoever administers the GTM container (to confirm its tags).

**Remaining action.** Owner (or GTM administrator) exports the container's tag list; privacy counsel approves the
draft; engineering publishes it and the 8-language banner texts after native review.

**Blocks prelaunch publication:** Yes (recommended). **Blocks opening orders:** No. **Blocks commercial sales:** Yes
(if still open by then).

---

## D10 — Legal pages in English only

**Exact issue (Phase 12):** « Legal pages in English only for 7 translated languages » — « Pre-contract information
language. » Where: legal pages. Blocks: commercial launch (counsel).

**Current implementation (verified)**
- Legal documents are generated for English only; other languages link to them and `/fr/legal/*` redirects
  (`src/app/[locale]/legal/[doc]/page.tsx:13-14`).
- About states « our legal documents are in English » (`src/content/en/info.ts:149`).
- Transactional e-mails are English only (`src/lib/email/templates.ts:1`, `<html lang="en">` at `:195`).

**Risk.** Whether consumers addressed in their own language must receive pre-contractual information, Terms or
confirmations in that language is a per-market question for counsel.

**Recommended safest option.** Counsel decides per market; until then, no orders from translated pages in markets
where counsel has not answered.

**Technical resolution.** Translating and routing legal pages is technical work after approved texts exist. Phase 13
does **not** do it.

**Requires approval.** Counsel (per market), owner (budget), native/legal translators.

**Remaining action.** Owner asks counsel which documents must exist in which language before orders reopen.

**Blocks prelaunch publication:** No. **Blocks opening orders:** Yes (counsel to confirm). **Blocks commercial
sales:** Yes.

---

## D11 — 36 sensitive wordings

**Exact issue (Phase 12):** « 36 sensitive wordings (Phase 11 register), incl. de "abgebucht" » — « All pending; Phase
12 introduced none new (de prelaunch text avoids "abgebucht"). » Where: register. Blocks: commercial launch.

**Current implementation (verified)**
- `docs/i18n/phase11/sensitive-wording-register.md`: 36 rows « REQUIRES OWNER/LEGAL APPROVAL » (refund 16,
  consent-privacy 13, contract 3, withdrawal 2, payment 1, tax 1).
- Phase 12 compliance audit: 25 rendered in prelaunch, 11 only in the closed forms; 0 resolved.
- de prelaunch `orderText` now reads « …es erfolgt keine Zahlung » (`src/i18n/dictionaries/de.ts:403`); « abgebucht »
  remains in forms (`de.ts:496`, `:505`, `:528`) and info pages (`src/content/de/info.ts:39`, `:110`, `:112`, `:176`,
  `:245`).

**Risk.** Translated legal-adjacent promises published without owner/legal decision or native validation.

**Recommended safest option.** Decide the English source first (D3, D4, D5, D9), then apply one decision per item in
all languages; native review (D15) on the result.

**Technical resolution.** Text changes after decisions. Phase 13 does **not** change them; the D15 review pack may
group them for reviewers (being implemented, verify at integration).

**Requires approval.** Owner, counsel, native reviewers.

**Remaining action.** Owner marks each of the 36 rows apply / keep / other in the register; counsel signs refund,
withdrawal, consent and contract rows.

**Blocks prelaunch publication:** Recommended (25 are rendered in prelaunch). **Blocks opening orders:** Yes (the 11
forms-only items return with the forms). **Blocks commercial sales:** Yes.

---

## D12 — Auto-renewal and guarantee wording choices

**Exact issue (Phase 12):** « Wording choices: fr "Sans reconduction", sv/nb "Ingen autoförnyelse", nb "Pengene
tilbake", nb cookie terms, en "Satisfied or refunded" » — « Auto-renewal / guarantee wording. » Where: plan cards,
legal. Blocks: commercial launch.

**Current implementation (verified)**
- fr « Sans reconduction » (`src/i18n/dictionaries/fr.ts:189`, `:204`, `:219`); sv « Ingen autoförnyelse »
  (`sv.ts:189`, `:204`, `:219`); nb « Pengene tilbake » (`nb.ts:171`, `:502`); en « Satisfied or refunded — 7 days »
  (`src/content/legal.ts:144`), Terms (`src/content/terms.ts:57`). nb cookie terms: see sensitive-wording register
  nb 5.

**Risk.** Guarantee and renewal labels may be read as broader or narrower promises than the policy (questions for
native reviewers and counsel).

**Recommended safest option.** Decide together with D4 and D11; keep labels factual (« No automatic renewal »,
« 7-day money-back after activation ») subject to counsel.

**Technical resolution.** Text only. Phase 13 does **not** change them.

**Requires approval.** Owner, counsel, native reviewers (fr, sv, nb).

**Remaining action.** Owner chooses per label with the native reviewers' input.

**Blocks prelaunch publication:** No. **Blocks opening orders:** Yes. **Blocks commercial sales:** Yes.

---

## D13 — Design choices

**Exact issue (Phase 12):** « Design choices: page-wide prelaunch strip under the header; "Follow the launch" +
indicative opening period in windows; plan-card alignment; "back to your language" on English legal pages; keep a
CTA visible in the fr/de/nl/nb collapsed header; self-host the Inter font » — « Conversion and clarity; none blocks
release. »

**Current implementation (verified).** Prelaunch state shown in hero, simulator and banner buttons
(`src/components/PrelaunchBanner.tsx`, `PrelaunchNotice.tsx`); no page-wide strip. The font stack starts with `Inter`
(`src/app/globals.css:31`); no external font request was found in `src/`.

**Risk.** Clarity and conversion only. An « indicative opening period » would be a dated commitment; if chosen, it
should be one the owner can keep.

**Recommended safest option.** Page-wide strip: yes (clearest prelaunch signal). Opening period: no date until D16
conditions are met. Other items: owner preference.

**Technical resolution.** Fully technical. Phase 13 does **not** implement them.

**Requires approval.** Owner.

**Remaining action.** Owner ticks the preferred options (`owner-approval.md` section D).

**Blocks prelaunch publication:** No. **Blocks commercial sales:** No.

---

## D14 — Operations during prelaunch

**Exact issue (Phase 12):** « Operations: staff Telegram actions still send trial/subscription e-mails (not tied to
prelaunch); social posts must not offer orders/trials; IndexNow on or off at release; "last reviewed" dates;
`domain: null` and other config fields » — « Consistency of the prelaunch message. » Where: Telegram/e-mail (not
changed), config. Blocks: public release (procedure).

**Current implementation (verified)**
- Staff « Converti » and « Essai envoyé » send e-mails without checking `FEATURE_CONTACT_FORM`
  (`src/lib/telegram/ops.ts:373-380`, `:403-430`).
- Hourly cron (`wrangler.jsonc:7`) sends trial follow-ups (« Ready to keep watching? Choose my plan ») and review
  invites without a prelaunch check (`src/app/api/cron/review-invites/route.ts:30`, `:41-53`).
- IndexNow is a dry run unless the repository variable `INDEXNOW_ENABLED=true`
  (`.github/workflows/deploy-cloudflare.yml:136-142`).
- `domain: null` (`src/config/site.ts:20`, keeps the `domain_not_decided` gate blocker), `supportHours: null` (`:37`),
  `paymentMethods: []` (`:52`); legacy `src/config/markets.ts:1-22` (US/CA/EU, durations 1/3/6/12).
- Social channel posts are outside the repository.

**Risk.** E-mails and posts that offer trials or plans contradict the public « opening soon » message.

**Recommended safest option.** Written team procedure: no « Essai envoyé » / « Converti » actions and no social posts
offering orders or trials while orders are closed; IndexNow on at the language release (owner choice); update
« last reviewed » dates in the release commit; set `domain: 'sygmatv.com'` after owner confirmation.

**Technical resolution.** Optional guard: make staff e-mails and the follow-up cron respect `FEATURE_CONTACT_FORM`
(engineering, not done in Phase 13). Config fields: one-line changes after owner confirmation.

**Requires approval.** Owner (procedure, IndexNow, domain confirmation).

**Remaining action.** Owner issues the procedure to the team and confirms the config values; engineering applies them
in the release commit.

**Blocks prelaunch publication:** Yes (procedure in place). **Blocks opening orders:** No. **Blocks commercial
sales:** Partly — `domain: null` keeps the automated checkout gate closed until set.

---

## D15 — Native-speaker review

**Exact issue (Phase 12):** « Native-speaker review of the 7 translations (section 6) » — « AI translations only. »
Where: all pages. Blocks: public release of each language.

**Current implementation (verified).** All 7 languages `preview` (`src/i18n/locales.ts:66-72`); review status
« automated (AI) review, not native-speaker validation » (`docs/i18n/phase10/README.md`); Phase 12 §6 word counts per
priority.

**Risk.** Mistranslation of commercial or legal-adjacent text (a material case was already found in German, Phase 10).

**Recommended safest option.** Release a language only after its native reviewer signs off priorities 1–3 (Phase 12
§6), with priority de → nl → sv → nb, then fr, es, it.

**Technical resolution.** **Being implemented in Phase 13, verify at integration**: native review pack. Applying the
reviewers' corrections is technical work after sign-off.

**Requires approval.** Native-speaker reviewers (external), owner.

**Remaining action.** Owner engages reviewers and returns signed review files; engineering applies corrections.

**Blocks prelaunch publication:** Yes, per language. **Blocks opening orders / commercial sales:** Yes, per language
(for legal-adjacent wording in that language).

---

## D16 — Reopening rule

**Exact issue (Phase 12):** « Reopening rule: before `FEATURE_CONTACT_FORM=true`, must blockers A (tax), C (rights)
and D (refunds/withdrawal) be closed? » — « The assisted order flow is not tied to the launch gate. » Where: process.
Blocks: opening orders.

**Current implementation (verified)**
- `FEATURE_CONTACT_FORM` alone controls `/api/contact` (`src/app/api/contact/route.ts:20`, `src/lib/features.ts:3-4`);
  no launch-gate call, no market/licence check (`route.ts:41-60`).
- Live production `864f703` has `FEATURE_CONTACT_FORM=true` (Context 1).
- **Technical finding (this register, migration-level, not verified against the live database):** the column check
  `contact_requests.locale in ('en', 'fr')` (`supabase/migrations/20261108134848_contact_requests.sql:15`) is not
  widened by any later migration, while the order window sends the page locale
  (`src/components/CheckoutDialog.tsx:133`) and the validator accepts every built locale
  (`src/lib/validation.ts:20`). If orders reopen with de/es/it/nl/sv/nb released, inserts from those pages may be
  refused by the database (`502 storage_failed`, `route.ts:71-72`). Engineering should check the live constraint
  (read-only schema query, with approval) before any reopening.

**Risk.** Reopening the forms re-creates, in all released languages, the sales path that Phase 11 blockers A, C and D
concern.

**Recommended safest option.** Yes: require D2 (tax), D3/D4 (withdrawal/refunds), D5 (Terms), D6 rights and the e-mail
trader identity (legal register L-08) to be closed, in writing, before `FEATURE_CONTACT_FORM=true`; optionally add an
automated guard (a unit test that refuses `FEATURE_CONTACT_FORM=true` in `.env.production` while
`getLaunchBlockers()` reports `no_licensed_territory` or `tax_rules_missing`).

**Technical resolution.** The guard and the locale constraint fix are technical; neither is done in Phase 13.

**Requires approval.** Owner (rule); counsel and tax adviser (the underlying closures).

**Remaining action.** Owner records the rule in `docs/DECISIONS.md`; engineering adds the guard and verifies the
locale constraint when asked.

**Blocks prelaunch publication:** No. **Blocks opening orders:** Yes. **Blocks commercial sales:** Yes.

---

## Sources

- `scratchpad/p13/PHASE12-FINAL-REPORT.md` §7 (register D1–D16), §2, §9, §11.
- `scratchpad/p12/com/report.md` (Phase 12 commercial and compliance audit, findings C-001 to C-024).
- `docs/i18n/phase11/launch-blocker-register.md` (blockers A–E), `docs/i18n/phase11/sensitive-wording-register.md`.
- `docs/DECISIONS.md`, `docs/release/release-readiness.md`, `docs/seo/claims-inventory.md`,
  `docs/seo/claims-validation.md`, `docs/DATABASE.md`.
- Code at `5c3635f`: `src/config/{launch-gate,site,analytics,markets}.ts`, `src/content/{legal,terms}.ts`,
  `src/content/en/info.ts`, `src/i18n/dictionaries/*.ts`, `src/i18n/locales.ts`, `src/lib/email/templates.ts`,
  `src/lib/telegram/ops.ts`, `src/lib/{pricing,price-source,validation,features}.ts`, `scripts/generate-prices.mjs`,
  `src/app/api/{checkout,quote,contact,webhooks/payment,cron/review-invites}/route.ts`, `supabase/migrations/*.sql`.
