# SYGMA TV+ — Owner approval sheet (Phase 13)

**Date:** 23 November 2026 · **Base:** release candidate `5c3635f` · **Prepared by:** Claude Code (documentation only)

Tick **one** option per item, add the date and your initials, and attach the evidence where asked. The first option
is the recommended (safest) one; it is not a legal opinion. Items marked *counsel* / *tax adviser* / *rights holder*
need that specialist's written answer before the box is ticked. Details and file evidence: `decision-register.md`
(D1–D16) and `legal-blocker-register.md` (L-01 to L-13).

> **Note before you start.** The live site (production `864f703`) still has the order and trial forms open
> (`FEATURE_CONTACT_FORM=true`). The release candidate closes them. Item A0 decides when that happens.

---

## A. Before the public 8-language prelaunch (production Step B)

- [ ] **A0 — Close the live order and trial forms now (production Step A, English prelaunch).** (Phase 12 §9)
  - [ ] Deploy Step A after the private-staging check *(recommended)*
  - [ ] Keep the forms open on the live site until Step B (accept the risks of section B for orders received meanwhile)
- [ ] **A1 — Release scope (D1).**
  - [ ] Phased: English prelaunch → content pages live → each language only after its native sign-off (A5) *(recommended)*
  - [ ] All 8 languages and content pages at once
  - [ ] Other (list languages): ______
  - Also approve: add released languages to `LEGACY_REDIRECT_LANGUAGES` before any rollback ☐ yes ☐ no
- [ ] **A2 — Content and device wording (D6).** Phase 13 change: sports « International » labels → availability
  qualifiers; device brand names → categories. *(Being implemented in Phase 13 — review the merged text.)*
  - [ ] Approve the Phase 13 wording, and also neutralise « sports » in the Terms (`terms.ts:41`, *counsel*) and the
    trial follow-up e-mail (`templates.ts:280`) *(recommended)*
  - [ ] Approve the Phase 13 wording only
  - [ ] Keep the current claims — requires written rights per territory (*rights holder*, *counsel*)
- [ ] **A3 — Support wording and WhatsApp (D8).** Phase 13 change: « 24/7 automated assistant, human help when
  needed »; WhatsApp not shown on marketing/help pages during prelaunch; Legal notice unchanged. *(Being implemented —
  review the merged text.)*
  - [ ] Approve as described *(recommended)*
  - [ ] Approve the wording, keep WhatsApp visible with the prelaunch note beside it
  - [ ] Keep the current « 24/7 support in 6 languages »
- [ ] **A4 — Cookie policy (D9).** Phase 13 measures the actual cookies and drafts a corrected policy (not published).
  - [ ] Publish the corrected policy after *privacy counsel* review; attach the GTM container tag list *(recommended)*
  - [ ] Set `gtmEnabled: false` until the policy is approved, then publish
  - [ ] Keep the current policy (« No advertising cookie… ») — not recommended
- [ ] **A5 — Native-speaker review (D15).** Phase 13 prepares the review pack.
  - [ ] Release a language only after its reviewer signs priorities 1–3; order de → nl → sv → nb → fr → es → it *(recommended)*
  - [ ] Release all languages now; review afterwards
- [ ] **A6 — Team procedure during prelaunch (D14).**
  - [ ] No « Essai envoyé » / « Converti » actions, no social posts offering orders or trials while forms are closed
    *(recommended)*
  - [ ] Team may continue trials/sales on WhatsApp (then section B applies now)
  - IndexNow at the language release: ☐ on ☐ dry run · Confirm `domain: 'sygmatv.com'` in config: ☐ yes
- [ ] **A7 — Prelaunch wording that touches legal topics (optional before Step B, required before section B).**
  - FAQ « Taxes and the final price are always displayed before any purchase » (D2): ☐ remove/reword now *(recommended)*
    ☐ keep until the tax decision
  - Terms present-tense ordering text (D5): ☐ ask *counsel* to align before Step B *(recommended)* ☐ align before orders
  - nb page « EU og Storbritannia » (D3): ☐ ask *counsel* before releasing nb *(recommended)* ☐ decide with B3

## B. Before opening orders and free trials (`FEATURE_CONTACT_FORM=true`)

- [ ] **B1 — Reopening rule (D16).**
  - [ ] Reopen only when B2–B8 are ticked and documented; add an automated guard that refuses the flag while
    `no_licensed_territory` or `tax_rules_missing` remain *(recommended)*
  - [ ] Reopen in selected markets only (list): ______ with the same conditions for those markets
  - [ ] Reopen without these conditions (written risk acceptance in `docs/DECISIONS.md`)
- [ ] **B2 — Tax line in the order window and tax wording (D2, L-02).** *Tax adviser.*
  - [ ] Replace « Taxes $0.00 USD » with « Calculated by our team before payment » until tax rules exist *(recommended)*
  - [ ] Remove the « Taxes » line
  - [ ] Feed the line from the server quote (requires tax rules)
- [ ] **B3 — Withdrawal right (D3, L-03).** *Counsel* (EU/EEA incl. Norway, UK, Switzerland).
  - [ ] Counsel's wording + model form + early-start acknowledgement before activation *(recommended)*
  - [ ] Voluntary 14-day right for every customer, wording by counsel
- [ ] **B4 — Refunds (D4, D12, L-04).** *Counsel.*
  - [ ] Written refund procedure per payment method (card, PayPal, USDT, bank, Western Union, MoneyGram) and
    counsel-approved wording *(recommended)*
  - [ ] Reduce accepted payment methods to those that can be refunded as promised
- [ ] **B5 — Terms and order sequence (D5, L-05).** *Counsel.* Actual sequence (tick): ☐ confirm → activate → pay
  ☐ confirm → pay → activate · ☐ Counsel redrafts the Terms accordingly *(required)*
- [ ] **B6 — Promotion and reference price (D7).** *Counsel.*
  - [ ] State the « +30 days free » conditions (terms, start/end) and replace the struck « Regular price » by « vs 2 × /
    3 × 12-month plans » *(recommended)*
  - [ ] Remove the badge and the struck price
- [ ] **B7 — Confirmation e-mails (L-08).** *Counsel.*
  - [ ] Add legal entity, address and links to Terms/Refunds/Legal notice to every e-mail; send a confirmation with
    the key terms before activation *(recommended)*
  - [ ] Add the trader block only
- [ ] **B8 — Language of legal pages and the 36 pending sensitive wordings (D10, D11).** *Counsel*, native reviewers.
  - [ ] Counsel states per market which documents must be translated; owner decides each register row *(recommended)*
  - [ ] Keep legal pages in English; accept orders only from English pages
- [ ] **B9 — Country gate for orders (L-01, D6).**
  - [ ] Accept order requests only from countries in `licensedTerritories` *(recommended)*
  - [ ] Accept all countries; team checks rights before activation (written procedure)
- [ ] **B10 — Engineering checks before reopening (no decision content; approve the work).** ☐ verify the live
  `contact_requests.locale` constraint (migrations allow only `en`, `fr`) · ☐ restrict order `term` to offered terms

## C. Before commercial sales (taking payment by any channel; `SALES_ENABLED=true`)

- [ ] **C1 — Distribution rights per territory (L-01).** *Rights holder*, *media/IP counsel.* Attach licences per
  territory; engineering fills `licensedTerritories` only after counsel's review. ☐ done
- [ ] **C2 — Tax registrations and price display per market (L-02).** *Tax adviser.* Written position for EU (OSS),
  NO (VOEC), GB, CH, CA, US states; then ☐ tax-inclusive local-currency prices where required *(recommended)*
  ☐ USD only, wording per adviser. Also: ☐ adviser reviews any past assisted sales.
- [ ] **C3 — Amount actually received (L-09).**
  - [ ] Record amount, currency, method and date at « Converti » and show it in the e-mail; reconcile past
    conversions against payment records (read-only query, approved separately) *(recommended)*
  - [ ] Keep list-price amounts, labelled « Plan price » instead of « Amount Paid »
- [ ] **C4 — Invoices (L-08).** *Tax adviser.* ☐ Issue invoices with the required content ☐ Not required (adviser's
  written answer attached)
- [ ] **C5 — Seller identity (L-07).** *Counsel.* ☐ Add the elements counsel lists (e.g. state filing number, VAT
  numbers, hosting provider, representative) ☐ none required (written answer attached)
- [ ] **C6 — Privacy operations (L-06).** *Privacy counsel.* ☐ Implement the 12-month purge ☐ change the promise ·
  EU/UK representative (art. 27): ☐ appoint ☐ not required (written answer) · processors disclosed: ☐ yes
- [ ] **C7 — Providers.** ☐ Payment provider chosen and contracted ☐ activation provider chosen (both are launch-gate
  blockers)
- [ ] **C8 — Trademark and platform names (L-13).** ☐ « SYGMA TV+ » clearance/filing done ☐ app verified per platform
  before naming it

## D. Optional design choices (D13 — none blocks release)

- [ ] Page-wide prelaunch strip under the header: ☐ yes *(recommended)* ☐ no
- [ ] « Follow the launch » + indicative opening period in the windows: ☐ no date until B1 is met *(recommended)*
  ☐ show a period: ______
- [ ] Plan-card alignment change: ☐ yes ☐ no
- [ ] « Back to your language » link on English legal pages: ☐ yes *(recommended)* ☐ no
- [ ] Keep a CTA visible in the collapsed fr/de/nl/nb header: ☐ yes ☐ no
- [ ] Self-host the Inter font: ☐ yes ☐ no (no external font request is made today)

---

Approved by: ____________________ (owner, Sygma TV LLC) · Date: ____________

Specialist sign-offs attached: ☐ counsel ☐ privacy counsel ☐ tax adviser ☐ rights holder ☐ native reviewers (☐ fr ☐ de
☐ es ☐ it ☐ nl ☐ sv ☐ nb)
