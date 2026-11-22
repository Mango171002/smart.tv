# Phase 8 — translation brief (de, es, it, nl, sv, nb)

Source of truth: the validated English (`src/i18n/dictionaries/en.ts`, `src/content/en/info.ts`). Reference for
adaptation choices already validated in another language: French (`src/i18n/dictionaries/fr.ts`,
`src/content/fr/info.ts`). Quality gate: `npx vitest run tests/unit/translations.test.ts` must pass.

## Files per language (and nothing else)

1. `src/i18n/dictionaries/<lang>.ts`
   - `import type { Dictionary } from './en';`
   - `export const notFoundText = { …same keys as en.notFound… };`
   - `const <lang>: Dictionary = { …every key of en, translated…, notFound: notFoundText };`
   - `footer.legalLanguageNote`: one short sentence « Legal documents available in English. »
   - `export default <lang>;`
2. `src/content/<lang>/info.ts` — same structure as `src/content/fr/info.ts`, but export:
   - `export const OWNER_FACTS = { established: '2026', supportHours: '24/7', basedIn, usualReply, usualActivation, languages: [6 names], paymentMethods: [6 items] } as const;`
   - `export const INFO: InfoContentSet = { about, hub, topics, reviewed, supportHours: '24/7', ui };`
   - `import type { InfoContentSet, InfoPage, InfoUi } from '@/content/en/info';` and `import { siteConfig } from '@/config/site';`
3. Optional `tests/unit/i18n-allow/<lang>.json`: array of strings that are legitimately identical to the English
   (only if the gate flags a genuine international word). Keep it minimal.

## Meaning (never change)

- Activation BEFORE payment: order form → our team contacts you on WhatsApp → activates your access → you pay
  → when payment is received and confirmed, an email confirms the subscription with the order number.
- Nothing is charged on the website. No automatic renewal. Free trial first (24 hours), one per customer.
- Money-back: 100 % within 7 days of activation; EU and UK customers also keep their 14-day withdrawal right.
- Support 24/7, email and WhatsApp, six languages, « usually » replies in under an hour (never a guarantee).
- No claim beyond the English: no channel/film counts, no replay, no VIP, no « best » / superlative, no IPTV,
  no « live sports », no « international channels ». « Data never sold » is the only privacy statement.
- 4K / HDR / TV guide always qualified like the English « where available », with the fixed phrase:
  de « je nach Verfügbarkeit », es « según disponibilidad », it « dove disponibile », nl « waar beschikbaar »,
  sv « i mån av tillgång », nb « der tilgjengelig ».

## Language and market

| Lang | Market(s) | Address | Notes |
|---|---|---|---|
| de | Germany, Switzerland, Luxembourg | « Sie » | Standard German (ss/ß: use ß); „…" quotes |
| es | Spain | « tú » | Spain Spanish (« móvil », « ordenador »); ¿…? ¡…! always |
| it | Italy, Switzerland | « tu » | |
| nl | Netherlands | « je » | |
| sv | Sweden | « du » | |
| nb | Norway | « du » | Bokmål |

Natural marketing language, not word-for-word; keep the brand « SYGMA TV+ », plan names « Starter », « Plus »,
« Ultra+ », and product names (Smart TV, Android TV / Google TV, Fire TV, Apple TV, iPhone / iPad, WhatsApp).

## Formats (must match the site's price display exactly — non-breaking space ` `)

| Lang | Price | Example monthly | Taxes value | Reviewed date (`INFO.reviewed`) |
|---|---|---|---|---|
| de | `59 USD` | `4,92 USD` | `0,00 USD` | `20. November 2026` |
| es | `59 USD` | `4,92 USD` | `0,00 USD` | `20 de noviembre de 2026` |
| it | `59 USD` | `4,92 USD` | `0,00 USD` | `20 novembre 2026` |
| nl | `USD 59` | `USD 4,92` | `USD 0,00` | `20 november 2026` |
| sv | `59 USD` | `4,92 USD` | `0,00 USD` | `20 november 2026` |
| nb | `59 USD` | `4,92 USD` | `0,00 USD` | `20. november 2026` |

Never use « $ ». Keep every figure of the English text (prices 59 / 69 / 99, 20 % / 30 %, 24 h, 7 / 14 days, 12 months,
1 to 4 devices, 6 languages, 24/7…). Keep every `{placeholder}` and every `**bold**` marker pair.

## Length limits (layouts are tested at 320–1920 px with fallback fonts)

- Plan-card feature lines ≤ 22 characters (without `**`); plan tagline ≤ 34; plan note ≤ 62.
- Footer chips ≤ 13 characters; comparison-table header `plans.compare.feature` ≤ 10.
- Banner checks ≤ 24; benefit title ≤ 20, text ≤ 34; footer tagline ≤ 34.
- `meta.homeTitle` starts with « SYGMA TV+ — » and is ≤ 60; `meta.homeDescription` 70–155.
- Every About / Help page: `metaTitle + " | SYGMA TV+"` ≤ 60; `description` 70–155.

## Links

Same English slugs under the language prefix: `/de`, `/de/help`, `/de/help/<topic>`, `/de/about`, `/de#plans`,
`/de#faq` (no slash before `#`). Legal pages stay English: `/legal/terms`, `/legal/refunds`, … with a short
« (in English) » note in the link label.
