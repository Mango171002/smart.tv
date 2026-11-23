# Phase 13 — D15 native-speaker review pack (fr, de, es, it, nl, sv, nb)

**Status of every translation in this pack: pending native review.** The seven translations of SYGMA TV+ (French,
German, Spanish, Italian, Dutch, Swedish, Norwegian Bokmål) are AI translations. No native speaker has validated any of
them. The notes and suggestions in this pack are an AI review (Claude, Phase 13 agent B): they are **not** a
native-speaker validation and **not** legal advice. No row may ever be marked « validated » in this pack.

Prepared on 23 November 2026 from branch `claude/p13-l10n` (release candidate `5c3635f`). Documentation only: no file
under `src/` was changed.

## Files

| File | For | Content |
|---|---|---|
| [review-fr.md](review-fr.md) · [review-de.md](review-de.md) · [review-es.md](review-es.md) · [review-it.md](review-it.md) · [review-nl.md](review-nl.md) · [review-sv.md](review-sv.md) · [review-nb.md](review-nb.md) | one native reviewer per language | language rules, terminology, Phase 12 status, legal sign-off list, claims-rewrite list, metadata lengths, then one table per priority (P1–P6) with every rendered string |
| [safe-fixes.md](safe-fixes.md) | integration lead | 14 clear, non-contractual grammar / typography / consistency fixes (exact string → proposed string, file:line), to apply after the claims rewrite |
| README.md (this file) | everyone | how to use the pack, priorities, status legend, word counts |

## How to use the pack (native reviewer)

1. Work in priority order: **P1 first**, then P2, P3 (with the legal reviewer), P4, P5, P6. P1–P4 are on the site now
   (prelaunch); P5 and P6 are needed before orders open and before the About / Help pages are published.
2. For each row, read the **English reference for its function** (what the text must do on the page), then the
   **current translation**. English is not a wording model: propose natural, professional wording in your language, not a
   literal rendering.
3. Answer the « Reviewer question / AI suggestion » when there is one, and check every other row too (an empty note
   means the AI review found nothing, not that the row is correct).
4. Record your verdict per row in a copy of the file (or in the review tool you use), with one of the verdicts below,
   your wording if you change something, and your name and date. Do not edit `src/`.
5. Keep, in every proposal: all facts, figures, prices, durations, placeholders (`{n}`, `{price}`, `{plan}`,
   `{email}`, `{name}`, `{brand}`, `{pct}`, `{amount}`, `{total}`), `**bold**` pairs, product names (Smart TV,
   Android TV, Fire TV, Apple TV, SYGMA TV+, Sygma TV LLC). Never add a claim: superlatives, « live sports »,
   « international channels », channel volumes, « IPTV », « VIP » and « replay » are blocked by test.
6. Respect the **layout limit** column (characters, counted as JavaScript string length; card features without `**`;
   Help titles with « | SYGMA TV+ »). If your wording is longer, say so: the layout must be checked before it ships.
7. Rows flagged **LEGAL** are contractual or privacy wording. Comment freely on grammar and naturalness, but any change
   needs the owner or the legal reviewer. Section 4 of each file lists the 36 Phase 11 register items (« legal sign-off
   needed ») with their exact current text; no rewording of contractual meaning is proposed in this pack.
8. Rows flagged **CLAIMS** are being rewritten right now by another workstream (sports « International » labels, device
   brand names, « 24/7 support in 6 languages », WhatsApp mentions). They carry no proposal; review the new text when it
   lands.

## Status legend

| Flag / status | Meaning |
|---|---|
| `PENDING` | Pending native review. Default status of every row. |
| `LEGAL (…)` | Legal sign-off needed: contractual meaning, do not change without legal. Register IDs (e.g. `de 7`) refer to `docs/i18n/phase11/sensitive-wording-register.md`. |
| `CLAIMS` | In the claims rewrite (another workstream): no proposal here; review the rewritten text. |
| `SAFE-FIX SF-nn` | Listed in [safe-fixes.md](safe-fixes.md): an AI-confident grammar / typography / consistency fix waiting to be applied. Still pending native review. |
| `OPEN-ONLY` | Open-orders text: replaced by a prelaunch variant while orders are closed, shown again when orders open. |
| Reviewer verdicts | `NATIVE-OK` (keep as is) · `NATIVE-CHANGE` (with the reviewer's wording) · `NATIVE-QUESTION` (needs the owner) · `LEGAL-HOLD` (waits for legal). A row reviewed by a named native speaker becomes « native-reviewed », never « validated ». |

**Risk** (column « Risk »): **high** = visible now while orders are closed on the home page, in the order / trial /
support windows, in the FAQ or in search metadata, or legal-adjacent; **medium** = assistive text (alt, aria labels),
secondary pages (blog, 404), open-orders text that returns when orders open, About / Help prelaunch variants;
**low** = forms hidden while orders are closed, About / Help pages (unpublished in production).

## Priorities

| Priority | Scope (dictionary keys unless stated) |
|---|---|
| **P1** | Prelaunch block `prelaunch.*` (order / trial / support windows, `faqSubscribe`, `faqCountries`, `faqDevices`, `metaDescription`, `pagesTitle`, `pagesText`, `prelaunch.home.*`), the FAQ `faq.*` (page and FAQPage JSON-LD), and the About / Help prelaunch variants (`info: … .prelaunch.*`, staging only). |
| **P2** | Plans and simulator `plans.*`, order summary `checkout.summary.*`, `checkout.plan`, `checkout.subtotal`, buttons and navigation (`nav.*`, `hero.cta*`, `cta.choose`, `cta.trial`, `how.cta`, `markets.*`, shared labels `common.*`). |
| **P3** | Legal-adjacent, **needs legal sign-off**: cookie banner `consent.*`, footer legal links, legal title and « documents in English » note, FAQ legal link labels, consent checkboxes and consent errors of the forms, About / Help legal link labels. |
| **P4** | Other home copy (hero, benefits, featured carousel, content categories, How it works, closing banner, footer), metadata (`meta.*`, blog, 404), structured data. Organization / WebSite JSON-LD use the English description on every language page by design (test-enforced), so nothing to translate there; the FAQPage JSON-LD is the P1 FAQ. |
| **P5** | Order and request forms (`checkout.*`, `request.*`, country picker): hidden while orders are closed, needed before orders open. |
| **P6** | About and Help pages (`src/content/<lang>/info.ts`): unpublished in production, live on staging. |

## Word counts

Words of the current text (rendered strings only, Phase 12 method: placeholders and `**` ignored), with the number of
rows in brackets. The English column counts the English reference of the same rows. Strings identical to English and
shorter than 30 characters (brand and technical names such as « Smart TV », « 4K Ultra HD », « Starter ») are left out
of the tables and of the counts. Rows in the claims rewrite are included (their new text will need review too).

| Priority | en (reference) | fr | de | es | it | nl | sv | nb |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| P1 | 566 | 621 (53) | 581 (53) | 645 (53) | 601 (53) | 604 (53) | 567 (53) | 568 (53) |
| P2 | 389 | 405 (127) | 359 (126) | 424 (127) | 418 (126) | 390 (126) | 379 (129) | 376 (130) |
| P3 | 178 | 213 (36) | 180 (36) | 216 (36) | 219 (37) | 219 (36) | 183 (37) | 190 (37) |
| P4 | 618 | 692 (120) | 571 (125) | 740 (141) | 721 (142) | 618 (139) | 625 (145) | 620 (143) |
| P5 | 315 | 327 (78) | 331 (80) | 357 (80) | 355 (80) | 363 (80) | 313 (80) | 330 (80) |
| P6 | 2419 | 2480 (266) | 2416 (265) | 2660 (268) | 2470 (263) | 2521 (265) | 2391 (266) | 2349 (267) |
| P1–P4 | 1751 | 1931 | 1691 | 2025 | 1959 | 1831 | 1754 | 1754 |
| **Total** | **4485** | **4738** (680) | **4438** (685) | **5042** (705) | **4784** (701) | **4715** (699) | **4458** (710) | **4433** (710) |

Row counts differ slightly between languages because a string identical to English is left out (for example the French
« International » region labels, or « Blog » outside sv/nb).

| | fr | de | es | it | nl | sv | nb |
|---|---:|---:|---:|---:|---:|---:|---:|
| High-risk rows | 326 | 333 | 348 | 349 | 345 | 353 | 352 |
| Rows flagged LEGAL | 124 | 127 | 125 | 126 | 125 | 126 | 126 |
| Phase 11 register items (legal sign-off needed) | 3 | 6 | 4 | 3 | 6 | 9 | 5 |
| Rows in the claims rewrite (no proposal) | 50 | 50 | 65 | 65 | 65 | 65 | 65 |
| Safe fixes ([safe-fixes.md](safe-fixes.md)) | 0 | 0 | 0 | 1 | 6 | 0 | 5 |

Plus 2 safe fixes in the English source (SF-01, SF-02). The 36 register items (3 + 6 + 4 + 3 + 6 + 9 + 5) are the
« REQUIRES OWNER/LEGAL APPROVAL » rows of the Phase 11 register; the 22 « NOT RENDERED » and 9 « APPLIED » rows of that
register are not repeated.

## Scope and method

- **Inputs:** `src/i18n/dictionaries/*.ts`, `src/content/<lang>/info.ts`, `src/lib/prelaunch-copy.ts` and
  `src/lib/faq.ts` (what changes while orders are closed), `src/content/info.ts` (`infoFor`: About / Help prelaunch
  variants), the Phase 12 localisation audit (40 findings; status of each in section 3 of every file), the Phase 12
  new-string table, `docs/i18n/phase11/sensitive-wording-register.md`, `docs/i18n/phase10/review-<lang>.md`,
  `tests/unit/translations.test.ts`, `tests/unit/prelaunch-copy.test.ts`, `tests/unit/french.test.ts`,
  `tests/unit/copy-polish.test.ts`.
- **Verification:** every quoted string comes from loading the real files with Node (`--experimental-strip-types`), so
  template literals are resolved to the text the site renders (for example `${TRIAL}` → « 24 heures »). A second script
  checked that 95 % of the quoted strings appear literally in the source file; the rest are those template-literal texts.
  Table columns were checked by script.
- **Rendered strings only.** Left out because no page shows them (checked with `grep` in `src/components`, `src/app`,
  `src/lib`): `meta.plans*`, `meta.devices*`, `meta.coverage*`, `meta.help*`, `meta.notFoundTitle`, `meta.legalTitle`,
  `common.prototypeNotice`, `common.notCalculated`, `common.months`, `common.stream`, `common.learnMore`,
  `common.illustrative`, `hero.stamp`, `plans.matrixTitle`, `plans.matrixCaption`, `plans.extraStreams`,
  `plans.detailsTitle`, `plans.details`, `plans.footnote`, `plans.source`, `plans.terms.lifetime`, `devices.*`,
  `preview.*`, `helpCta.*`, `help.*`, `forms.*` except `forms.consent`, `checkout.consentLabel`, `checkout.intro`,
  `coverage.*`, `footer.concept`, `footer.complianceTitle`, `footer.compliance`, `footer.compliance2`, and `legal.*`
  (the legal pages are built in English only: Phase 12 L-011).
- **Layout limits** come from `tests/unit/translations.test.ts` (de, es, it, nl, sv, nb), `tests/unit/french.test.ts`
  (fr: title and descriptions only, so the card limits are shown as a guide for French) and
  `tests/unit/prelaunch-copy.test.ts` (all languages: prelaunch description 70–155, prelaunch benefits ≤ 20 / ≤ 35).
  One string is over a guide limit today: French `plans.tiers.ultra.note` (72 / 70, see review-fr.md).
- **Checked by script, clean in all seven languages:** French no-break spaces before « : ; ? ! » and inside « »;
  quotation-mark style per language; ¿ ¡ in Spanish; double spaces; straight quotes; space before punctuation; repeated
  words (the hits « je je », « Sie sie » are correct grammar).

## Main findings for the reviewers (AI review)

- **P1 natural wording of the Phase 12 prelaunch strings:** headings that are also button labels while orders are
  closed (`prelaunch.orderTitleA + orderTitleHl`, `trialTitleA + trialTitleHl`) need a check in both uses; telegraphic
  feature-bar titles (fr « Commandes bientôt », sv « Beställningar snart », nb « Bestilling snart », nl « Bestellen
  binnenkort »); es « Prueba gratis muy pronto » can read as an imperative; it uses « A breve » and « In arrivo » for the
  same English text.
- **Terminology:** German uses « kostenloser Test » in four prelaunch / How-it-works strings while the site term is
  « kostenloser Testzugang »; Spanish keeps « prueba gratis » in two places where « prueba gratuita » now fits; the
  Italian and Dutch footer chips can now use the site term (safe fixes SF-03, SF-06).
- **Typography:** Dutch and Norwegian still use the English spaced em dash in `hero.lead`, `cta.text` and 9 About /
  Help strings each; the 5 per language that do not mention WhatsApp are safe fixes, the others wait for the claims
  rewrite. Spanish spaced rayas (about 10 strings) and Italian em dashes are for the native reviewer.
- **Metadata:** all titles and descriptions are within limits; the French and Spanish Help-hub titles drop « devices »;
  the French, Spanish and Italian home titles use the compact « abonnement streaming » / « suscripción streaming » /
  « abbonamento streaming TV » forms chosen for the 60-character limit (a Spanish option with « de » fits: see review-es.md).

## Notes on the English source (for the owner, not for the native reviewers)

- « e-mail » in `prelaunch.contactNote` (`src/i18n/dictionaries/en.ts:392`) and in the Help › Free trial prelaunch
  variant (`src/content/en/info.ts:256`): safe fixes SF-01, SF-02. `prelaunch.pagesText` (en.ts:403) has the same
  « e-mail » but mentions WhatsApp: fix it with the claims rewrite.
- Still open from Phase 12: guillemets in `consent.text` (L-030, consent text: legal sign-off), US « Customize » next to
  UK « organised » / « Catalogue » (L-031, owner's choice), Title Case headings (L-032), English legal wording L-033 /
  L-034 (owner/legal).
- Technical: `src/app/[locale]/layout.tsx` sets `meta.homeDescription` (the open-orders text) as the default description;
  every page overrides it today, so nothing visible.
