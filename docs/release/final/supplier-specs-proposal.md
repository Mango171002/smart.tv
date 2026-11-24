# Supplier catalogue specifications on the home page — proposal

**Status: PROPOSAL, not for release.** Branch `claude/f14-specs` (from release candidate `7a6577f`), committed locally,
not pushed, merged or deployed. Wording in the 7 non-English languages is an **AI draft, native review pending**
(add it to the Phase 13 native-review pack, D15 / P2).

**Basis.** Owner decision of 24/11/2026, recorded in `docs/release/phase13/decision-register.md` (D6, « Owner update
24/11/2026 ») and `docs/release/phase13/owner-approval.md` (A2b): the supplier confirmed these **overall catalogue
specifications** — 35,000+ TV channels, 200,000+ movies and series, 4K HDR availability on compatible content and
devices. They are **not per-plan guarantees** and **not evidence of broadcasting rights** (blocker C and claims
inventory A1–A3, `docs/seo/claims-inventory.md`, stay open for rights). History: the figures were removed from the home
page in Phase 6A (commit `9923c7f`).

Owner rules applied: availability qualifiers; the whole catalogue is not attributed to Ultra+ or any plan; no
Starter/Plus/Ultra+ quantities; never paired with « international », « from multiple countries », « around the world »
or a named sport, league or broadcaster; nothing implying distribution rights in the visitor's country.

---

## 1. What changes

One sentence, shown **once** on the home page, as a second footnote line under the **« Compare the plans »** table,
right after the existing note « 4K/HDR where available. Catalogue may vary by country. » (which is kept unchanged).

| Item | Where |
|---|---|
| Figures (35000, 200000), one place | `src/config/supplier-catalogue.ts` (`SUPPLIER_CATALOGUE`; `null` hides the sentence) |
| Sentence template, 8 languages | `plans.compare.supplierCatalogue` in `src/i18n/dictionaries/{en,fr,de,es,it,nl,sv,nb}.ts` |
| Number format | `formatCount()` in `src/i18n/format.ts` — the language's Intl locale from `SITE_LANGUAGES` (the same source as the price display). The plan cards' dormant count helper now uses it too (same output). |
| Rendering | `ComparisonTable` in `src/components/Sections.tsx` (`<p class="footnote catalogue-note" data-testid="supplier-catalogue">`); `PlanExtras` receives `locale` from `src/app/[locale]/page.tsx` |
| Style | `src/app/globals.css`: `.compare .catalogue-note` — the existing footnote style, plus a 68ch line length and normal wrapping (no redesign) |
| Per-plan switch | `src/config/catalogue.ts` **unchanged** — all values stay `null`; not used |
| Title, meta description, Open Graph, JSON-LD | **unchanged** — the sentence and the figures are not there (snippets would drop the qualifier) |

## 2. Exact wording (rendered, with the language's number format)

The dictionaries hold `{channels}+` and `{vod}+`; the page fills them with `formatCount()`. French uses a non-breaking
space before « : »; French uses a narrow no-break space (U+202F) and Swedish / Norwegian a no-break space (U+00A0) as
thousands separator, so a figure never splits across lines.

| Lang | Sentence | Review |
|---|---|---|
| en | Supplier catalogue: 35,000+ TV channels and 200,000+ movies & series, in up to 4K HDR on compatible content and devices. What you can watch depends on your country and device. | Owner reference wording |
| fr | Catalogue du fournisseur : 35 000+ chaînes TV et 200 000+ films et séries, jusqu’en 4K HDR sur les contenus et appareils compatibles. Ce que vous pouvez regarder dépend de votre pays et de votre appareil. | AI draft, native review pending |
| de | Katalog des Lieferanten: 35.000+ TV-Sender und 200.000+ Filme und Serien, in bis zu 4K HDR bei kompatiblen Inhalten und Geräten. Was Sie sehen können, hängt von Ihrem Land und Ihrem Gerät ab. | AI draft, native review pending |
| es | Catálogo del proveedor: 35.000+ canales de TV y 200.000+ películas y series, hasta 4K HDR en contenidos y dispositivos compatibles. Lo que puedes ver depende de tu país y de tu dispositivo. | AI draft, native review pending |
| it | Catalogo del fornitore: 35.000+ canali TV e 200.000+ film e serie, fino al 4K HDR su contenuti e dispositivi compatibili. Cosa puoi guardare dipende dal tuo paese e dal tuo dispositivo. | AI draft, native review pending |
| nl | Catalogus van de leverancier: 35.000+ tv-zenders en 200.000+ films en series, tot 4K HDR op compatibele content en apparaten. Wat je kunt kijken, hangt af van je land en je apparaat. | AI draft, native review pending |
| sv | Leverantörens utbud: 35 000+ tv-kanaler och 200 000+ filmer och serier, i upp till 4K HDR på kompatibelt innehåll och kompatibla enheter. Vad du kan titta på beror på ditt land och din enhet. | AI draft, native review pending |
| nb | Leverandørens katalog: 35 000+ TV-kanaler og 200 000+ filmer og serier, i opptil 4K HDR på kompatibelt innhold og kompatible enheter. Hva du kan se, avhenger av landet ditt og enheten din. | AI draft, native review pending |

Each file's existing register is kept: *vous* (fr), *Sie* (de), *tú* (es), *tu* (it), *je* (nl), *du* (sv, nb); each
file's existing catalogue noun (sv « utbud », as in the comparison note « Utbudet kan variera … ») and capitalisation
(« tv » in nl/sv, « TV » in nb). Points for the native reviewers:

- de « Katalog des Lieferanten »: « Anbieter » was avoided because it can read as SYGMA TV+ itself; a reviewer may
  prefer « Katalog unseres Lieferanten ».
- es « 35.000+ »: Spanish style often prefers « más de 35.000 »; the « + » form follows the owner's brief (same form in
  every language).
- fr « 35 000+ » rather than « plus de 35 000 », for the same reason.

## 3. Placement and rationale

**Chosen: the catalogue note under the plans comparison.**

1. It is the existing « catalogue note » of the home page: the line right above it already says « Catalogue may vary
   by country ». The new sentence completes it instead of opening a new claim area. (The « Coverage & catalogue »
   section text in the dictionaries, `coverage.*`, is not rendered on the home page, so there is no separate coverage
   block to use without adding one.)
2. **Not tied to a plan.** It sits below the whole table, outside the horizontally scrolling table region, outside
   every plan column, cell and card (checked by the E2E test). It reads as a note on the catalogue, not as a feature of
   Starter, Plus or Ultra+.
3. **Low prominence, factual tone.** It uses the footnote style already used for qualifiers, so the figures are not a
   headline or a selling argument; the qualifiers are in the same sentence and cannot be separated from them.
4. **The « where available » line stays.** The 4K/HDR qualifier above it and on the plan cards is unchanged.
5. **No redesign.** Only a line-length limit was added; fits from 320 px (tested at 320, 375 and 1366 px in all 8
   languages; no horizontal overflow; no axe WCAG 2.1 AA violation in the block).

## 4. Alternatives considered

| Option | Assessment |
|---|---|
| **Catalogue note under the comparison (chosen)** | Neutral, next to the existing catalogue qualifier, not inside a plan; low prominence. Slight repetition with « Catalogue may vary by country » (acceptable; can be merged after native review). |
| Closing banner sentence (`cta.text`) | Rejected. (a) The banner is built around a photo of the Earth from space (alt « Earth at night seen from space, city lights across the continents »): putting the totals there pairs them visually with « around the world », which the owner excludes. (b) The banner sentence ends « — from {price}/month »: the totals would read as what the Starter price buys, i.e. attributed to a plan. (c) It is the exact place of the Phase 6A-removed claim A1 (« … from multiple countries »). |
| Ultra+ card through `src/config/catalogue.ts` (`ultra: { channels: 35000, vod: 200000 }`) | Excluded by the owner rule of 24/11/2026: the whole catalogue must not be attributed to Ultra+ (or any plan) unless separately confirmed; Starter/Plus quantities must not be invented. The switch stays all `null` (unit test). |
| Hidden (status quo, `7a6577f`) | Safest for the open rights question (blocker C). Remains the fallback: one-line hide, see § 7. |
| Page title, meta description, JSON-LD | Excluded: search snippets and rich results drop the qualifiers. |

## 5. What is NOT claimed

- No number of channels or titles **per plan** (Starter, Plus, Ultra+); no plan name in the sentence.
- Not that these channels or titles are **available in the visitor's country** or on the visitor's device: the
  sentence says what can be watched depends on country and device.
- No **broadcasting or distribution rights**, licences or territories; no « international », « multiple countries »,
  « around the world » or « worldwide »; no sport, league, competition or broadcaster name.
- No 4K HDR **guarantee**: « up to », « on compatible content and devices »; the comparison table's HDR row and the
  « 4K/HDR where available » qualifiers are unchanged.
- Nothing in the title, meta description, Open Graph / Twitter tags or structured data.

## 6. Tests

- `tests/unit/supplier-catalogue.test.ts` (60 tests): figures in config; per-plan switch all `null`; for each of the 8
  languages — the sentence exists with `{channels}` / `{vod}` only (no hard-coded figure but « 4K »), the supplier
  framing, « compatible content and devices » and « country and device » qualifiers, the language's number format
  (`35,000` / `35 000` / `35.000` …) with « + », no forbidden pairing (international, multiple countries, around the
  world / worldwide, sports and broadcasters, plan names, rights wording), French typography, the « where available »
  4K line kept, nothing in `meta.*`; the sentence is rendered by `Sections.tsx` only and never used by the metadata or
  JSON-LD builders.
- `tests/e2e/supplier-catalogue.spec.ts` (all languages of the build; preview build = 8): exactly one
  `[data-testid="supplier-catalogue"]` with the expected text; inside `.compare`, after the table, not in a table, plan
  column, plan card or the simulator; each figure appears once on the page; not in plan cards or the closing banner;
  not in the title, any `<meta content>` or any JSON-LD block (desktop and mobile projects). Layout at 320 / 375 / 1366
  px: no page overflow, text inside the viewport and the block; axe (WCAG 2.1 AA) on the block at 320 and 1366 px.

Validation on this branch (24/11/2026): `npx tsc --noEmit` clean; `npx eslint .` 0 errors (the 3 existing warnings,
unchanged); `npx vitest run` 35 files, 739 tests passed (60 new); full Playwright suite on the all-languages preview
build (`NEXT_PUBLIC_SITE_MODE=preview`, `NEXT_PUBLIC_CONTENT_PAGES=preview`, port 3562, 2 workers): **802 passed, 0
failed, 434 skipped** (skips are the suite's own desktop/mobile splits); new spec 24 passed (16 desktop + 8 mobile),
8 skipped (layout test is desktop-only).

## 7. How to revert

- **Hide without removing the work:** in `src/config/supplier-catalogue.ts` set `SUPPLIER_CATALOGUE = null` — the
  sentence disappears in every language (the component renders nothing). Then delete or skip
  `tests/unit/supplier-catalogue.test.ts` and `tests/e2e/supplier-catalogue.spec.ts`, which assert the figures.
- **Remove entirely:** `git revert <commit>` of the commit that adds this file (it touches only the files listed in § 1,
  the two test files and this document).
- Production `7a6577f` is unaffected until this branch is merged.

## 8. Before / after screenshots

Plans comparison block, deviceScaleFactor 2, local preview build (`next start`, port 3562), in
`/tmp/claude-0/-home-user-smart-tv/2a60658e-988d-573d-8028-78b6e580122b/scratchpad/final/specs/` (scratchpad, not in
the repository):

- `before-{en,de,nb}-{375,1366}.png` — release candidate `7a6577f`;
- `after-{en,de,nb}-{375,1366}.png` — this proposal;
- `after-{en,de,nb}-{375,1366}-nofab.png` — the same with the floating support button hidden (it covers the bottom
  right of the block at 375 px in the element capture; on the live page it floats over the content as everywhere).

## 9. Remaining actions (owner)

1. Approve or reject the placement and the English wording (owner-approval A2b: tick « hidden » or this option).
2. Native review of the 7 translations (D15) before any language is published with it.
3. Keep the written supplier confirmation with the rights documentation (D6, L-01 / L-11). Rights per territory remain
   a separate, open item: this sentence does not resolve it.
4. If approved: update `docs/seo/claims-inventory.md` A1–A3 (« shown as supplier catalogue, qualified, not per plan »).
