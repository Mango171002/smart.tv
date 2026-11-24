# Native-speaker review workbooks (fr, de, es, it, nl, sv, nb)

**Status of every translation: pending native review.** The seven translations of SYGMA TV+ are AI translations. No
native speaker has validated them. The « AI note or question » column is an AI review (Claude), not a native-speaker
validation and not legal advice. **Validation stays « pending » until a real, named native reviewer has filled and signed
the « Sign-off » sheet of the workbook for that language.** Nothing in this folder may be reported as « validated » before
that; a signed-off language is « native-reviewed », and rows flagged « legal sign-off » also need the owner / legal
reviewer before they change.

Prepared on 24 November 2026 from branch `claude/f14-review` (release candidate `7a6577f`), from the **current** text of
`src/i18n/dictionaries/<lang>.ts` and `src/content/<lang>/info.ts`, with the same scope and notes as the Phase 13 pack
([../phase13/README.md](../phase13/README.md)). Phase 13 changes since that pack are included: claims D6/D8 (`aad188e`:
« Where available » sports labels, device categories, « 24/7 assistant », footer legal-entity line, prelaunch meta
descriptions and About / Help prelaunch variants) and the 14 safe fixes (`b7772bd`). The pack's « CLAIMS » placeholders are
gone: those rows now show the rewritten text. No file under `src/` was changed.

## Files

| File | For | Content |
|---|---|---|
| `review-<lang>.xlsx` (7) | the native reviewer of that language | sheets « Instructions », « Strings » (one row per rendered string), « Sign-off » (empty) |
| `review-<lang>.csv` (7) | reviewers without Excel | the « Strings » sheet: same columns, same rows, UTF-8 with BOM |
| `import-review.mjs` | integration lead | reads a returned CSV or XLSX and prints the decisions and proposed changes per key (never writes `src/`) |
| `verify-workbooks.mjs` | integration lead | checks the workbooks against the current source files (see « Verification ») |
| `tools/` | integration lead | the generator: `regenerate.sh` and its steps (see « How to regenerate ») |

« Strings » columns: ID · Priority (P1–P6) · Risk · Page / URL · Location · Key · English reference · Current translation ·
Max length · Flags · AI note or question · **Reviewer decision** (dropdown: Approved / Approved with change / Rejected /
Question) · **Proposed text** · **Reviewer comment** · **Reviewer name** · **Date**. The last five (yellow headers) are for
the reviewer; the first eleven must not be edited. Header row frozen, filters on, text wrapped, no sheet protected. Rows
are sorted by priority, then page (every page, home, `#plans`, `#how`, `#faq`, blog, 404, About, Help hub, Help topics).

Key: a dictionary path (`prelaunch.orderText` → `src/i18n/dictionaries/<lang>.ts`) or `info:` + a path in the About /
Help content (`info:topics[3].sections[1].title` → `src/content/<lang>/info.ts`). Flags: `legal sign-off` (with the
Phase 11 register ID when there is one), `contractual: do not change the meaning`, `privacy / consent wording`,
`claims (…)` (keep the qualifier: 24/7 = automated assistant, « where available », device category, contact channel,
picture quality; add no claim), `layout: n / max`, `open-orders text`, `safe fix SF-nn applied`.

## How to send

1. One reviewer per language: send `review-<lang>.xlsx`. To a reviewer without Excel, send the `.csv` together with the
   instructions summary below (the xlsx also opens in LibreOffice, Google Sheets and Numbers).
2. Ask for **P1–P4 first** (visible on the site now), then P5 (forms, needed before orders open) and P6 (About / Help,
   needed before those pages are published). Rows flagged `legal sign-off` go to the owner / legal reviewer as well.
3. Ask the reviewer to return the file renamed `review-<lang>-<initials>-<YYYYMMDD>.xlsx`, with the « Sign-off » sheet
   filled, and not to change sheet names, column headers or columns A–K.

Instructions summary (the « Instructions » sheet says the same, with the language rules and site terminology): the
English text is the functional reference, not a wording model; keep every fact, figure, price, placeholder (`{n}`,
`{price}`, `{plan}`, `{email}`, `{name}`, `{brand}`, `{pct}`, `{amount}`, `{total}`, `{entity}`), `**bold**` pair and
product name; never add a claim; legal / contractual rows may be commented and reworded only without changing their
meaning and change only after legal sign-off; respect « Max length » (characters with spaces; `without **`; Help titles
count « | SYGMA TV+ »), and say so when a proposal is longer.

## How to return (reviewer)

- **Excel:** save as .xlsx and send it back.
- **CSV:** Excel › File › Save As › « CSV UTF-8 (comma delimited) »; LibreOffice › Save As › Text CSV, character set
  « Unicode (UTF-8) », field delimiter `,` or `;`; Google Sheets › File › Download › CSV. A CSV saved with another
  character set is refused by the import script. When **opening** a CSV in a spreadsheet, import every column as Text
  (Excel › Data › From Text/CSV, File origin UTF-8): otherwise a cell such as « +30 jours offerts » is read as a formula.

## How to import (integration lead)

```bash
node docs/i18n/review-workbooks/import-review.mjs returned/review-fr-AB-20261201.xlsx   # or .csv; several files allowed
node docs/i18n/review-workbooks/import-review.mjs returned/review-fr.csv --json > fr-decisions.json
```

The script reads the « Strings » sheet (XLSX through `python3` + `openpyxl`; CSV with `,` or `;`, with or without BOM),
compares the locked columns A–K with the original `review-<lang>.csv` of this folder (`--ref` to use another file), and
prints, per language: decision counts; every « Approved with change », « Rejected » and « Question » row with the key, the
source file, the current and the proposed text, the comment and the reviewer; and checks on each proposal — placeholders
and `**` pairs unchanged, length against « Max length », and `LEGAL SIGN-OFF REQUIRED` for legal rows. Warnings: decision
without name or date, change without proposed text, question without comment, unknown decision, edited locked column,
unknown or duplicate ID. **It writes nothing.** Apply accepted changes by hand in the file shown (legal rows only after
legal sign-off), run the unit tests (`tests/unit/translations.test.ts`, `french.test.ts`, `prelaunch-copy.test.ts`,
`claims-d6-d8.test.ts` check limits and blocked claims), and keep the returned file and its signed « Sign-off » sheet as
the record of the review. If a reviewer returns no signed « Sign-off » sheet, the language stays « pending ».

## Rows per language and priority

| Language | P1 | P2 | P3 | P4 | P5 | P6 | Total | High risk | Legal sign-off | Claims flag | New / changed since the pack | With a length limit |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| fr | 69 | 130 | 37 | 135 | 78 | 266 | **715** | 346 | 126 | 115 | 58 | 76 |
| de | 69 | 128 | 37 | 140 | 80 | 266 | **720** | 352 | 129 | 113 | 56 | 76 |
| es | 69 | 129 | 37 | 141 | 80 | 268 | **724** | 352 | 127 | 114 | 57 | 76 |
| it | 69 | 127 | 38 | 142 | 80 | 263 | **719** | 352 | 128 | 113 | 57 | 76 |
| nl | 69 | 127 | 37 | 139 | 80 | 265 | **717** | 348 | 127 | 115 | 64 | 76 |
| sv | 69 | 133 | 38 | 145 | 80 | 267 | **732** | 359 | 128 | 118 | 61 | 76 |
| nb | 69 | 134 | 38 | 143 | 80 | 267 | **731** | 358 | 128 | 118 | 66 | 76 |
| **All** | 483 | 908 | 262 | 985 | 558 | 1862 | **5058** | | | | | |

Priorities as in the Phase 13 pack: **P1** prelaunch block, FAQ and About / Help prelaunch variants · **P2** plans,
simulator, order summary, buttons, navigation · **P3** legal-adjacent (cookie banner, consent, legal links, and now the
footer legal-entity line) · **P4** other home copy, metadata, structured data · **P5** order and request forms (hidden
while orders are closed) · **P6** About and Help pages. « New / changed since the pack »: 17 new strings per language
(note « New string in Phase 13 ») plus the strings rewritten by the claims work (« Rewritten in Phase 13 claims D6/D8 »)
and the applied safe fixes (it 1, nl 6, nb 5: « Safe fix SF-nn applied »); these have no earlier AI review and need a full
check. One row is over a length guide: French `plans.tiers.ultra.note` (72 / 70, guide only for French, as in the pack).

## Scope and reconciliation with the Phase 13 pack

Same scope as the pack: every string the site renders in that language, including prelaunch variants, metadata and the
About / Help pages; strings identical to English and shorter than 30 characters (brand and technical names such as
« Smart TV », « Tablet ») are left out; the not-rendered keys listed in the pack README are left out.

| | fr | de | es | it | nl | sv | nb |
|---|---:|---:|---:|---:|---:|---:|---:|
| Rows in the Phase 13 pack | 680 | 685 | 705 | 701 | 699 | 710 | 710 |
| + new keys and new prelaunch variants (all languages) | 17 | 17 | 17 | 17 | 17 | 17 | 17 |
| + comparison « Support » row text | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| + device-category labels now translated | 2 | 2 | 2 | 2 | 2 | 3 | 3 |
| + other strings no longer identical to English | 15 | 16 | 0 | 0 | 0 | 1 | 0 |
| − strings now identical to English (< 30 characters) | 0 | 1 | 1 | 2 | 2 | 0 | 0 |
| **Rows in the workbook** | **715** | **720** | **724** | **719** | **717** | **732** | **731** |

- New keys (17): `prelaunch.home.setupText`, `supportBenefitText`, `compareSupport`, `footer.entity` and 13 About / Help
  prelaunch variants (`about.prelaunch.sections.who` second paragraph, « Contact support » link description « By email · 24/7 automated assistant », Getting started /
  Free trial / Ordering and payment / Refunds prelaunch meta descriptions, Devices prelaunch intro and « check your
  device », Contact support prelaunch title tag, summary and intro, `ui.prelaunch.topicContact`, `ui.prelaunch.availability`).
- `plans.compare.rows[6].values[0]`: the « Support » row text of the comparison table (the same text in the three plan
  columns). It is rendered but was left out of the pack by its code-value filter; added here.
- Device categories `plans.devicesBar.items[1]`, `[2]` (sv, nb also `[3]`) replaced the brand names that were identical
  to English. Other additions: fr, de the 15 « Where available » highlight labels (formerly « International »); de, sv
  `info:ui.aboutFacts[2].k` (formerly « Support »). Removed: de, es « Tablet »; it, nl « Tablet » and « Computer »
  (identical to English).
- Rows sorted by priority then page, so IDs (`FR-P1-001`…) are new; the Key column links a row to the pack.

## Verification

`node --experimental-strip-types --no-warnings docs/i18n/review-workbooks/verify-workbooks.mjs` imports the TS
dictionaries and About / Help content of the branch (template literals resolved as rendered) and checks, for the 7
languages: every « English reference » and « Current translation » cell of the CSV and of the XLSX equals the source text
for its key (**mismatches: 0 English, 0 translation**); CSV and XLSX identical cell by cell (0 differences); UTF-8 BOM;
unique IDs and keys; priority order; reviewer columns and « Sign-off » fields empty; decision dropdowns, frozen header,
filter, no protected sheet; reconciliation with `docs/i18n/phase13/review-<lang>.md` (pack + added − removed = workbook,
every removed key now identical to English). Result on 24 November 2026: all checks passed. Re-run it after any change
to the translation files: a mismatch means the workbook is out of date and must be regenerated before it is sent.

## How to regenerate

When a translation file changes, regenerate before sending (never edit the workbooks by hand):

```bash
bash docs/i18n/review-workbooks/tools/regenerate.sh
```

Needs node ≥ 22.6 and python3 with openpyxl. Steps (all paths relative to the repository; intermediate files in
`docs/i18n/review-workbooks/tools/build/`, ignored by git):

1. `tools/flat.mjs` (with `tools/hooks.mjs`, `tools/register-hooks.mjs`) imports the TS dictionaries and About / Help
   content of `src/` and writes every rendered string to `build/flat.json`; it does the same for the files of `5c3635f`
   (the source of the Phase 13 pack, extracted with `git archive`) into `build/pack-flat.json`.
2. `tools/build.cjs` builds the rows with `tools/gen14.cjs` (the Phase 13 pack generator: scope, priorities, locations,
   risk, legal flags, layout limits; AI notes from `tools/notes.cjs` and the Phase 11 register from `tools/register.cjs`).
   Rows whose text differs from `pack-flat.json` get the « new / rewritten / safe fix applied » note instead of the old
   one. Output: `build/rows/<lang>.json`, `build/summary.json` (the counts of the table above), `build/langinfo.json`.
3. `tools/make_workbooks.py` writes `review-<lang>.xlsx` and `review-<lang>.csv` into this folder. The « Source » line of
   the Instructions sheet names the last commit that changed `src/` (set `REVIEW_SOURCE_LABEL` to override it).
4. `verify-workbooks.mjs` runs the checks of « Verification ».

Then update the counts in this README from `build/summary.json` if they changed. A regenerated workbook starts empty
again: send it only to reviewers who have not started, or import their returned file first. `docs/i18n/phase13/` is the
historical pack and is not regenerated.
