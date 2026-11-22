# Phase 7B — French localisation, preview only (22 November 2026)

Branch `claude/seo-phase7b-french`, from Phase 7A `4f3a7f7`. Production reference `864f703`. `350882a` never included.
Nothing merged, deployed or published. **French is not public**: production builds do not contain it.

## 1. How the French preview works

| Item | Production build (default) | Preview environment (`NEXT_PUBLIC_SITE_MODE=preview`) |
|---|---|---|
| French routes | Not built | `/fr`, `/fr/blog`; with `NEXT_PUBLIC_CONTENT_PAGES=preview`: `/fr/about`, `/fr/help`, `/fr/help/[topic]` (7) |
| `/fr`, `/fr/*` | 308 → English page (unchanged) | Served in French; `/fr/legal/*` → 307 to the English legal page |
| Indexing | — | `noindex, nofollow` in the page **and** `X-Robots-Tag: noindex, nofollow` on every `/fr` URL |
| Sitemap | English only (unchanged) | English only: no French URL, no `xhtml:link` |
| hreflang | None (unchanged) | None: only *enabled* languages are ever listed |
| Canonical | Unchanged | Self-referencing French URL (`/fr/help`) |
| `<html lang>`, og:locale, JSON-LD `inLanguage` | `en`, `en_US`, `en` | `fr`, `fr_FR`, `fr` |
| English pages | Unchanged | Unchanged (identical HTML) |

The language registry (`src/i18n/locales.ts`) now has three statuses: `enabled`, `preview` (French) and `disabled` (de, es,
it, nl, sv, nb). Going live later (Phase 7C) = `fr` → `enabled` in that file, after authorisation.

URLs use the English slugs under `/fr` (language level, no country copies): `/fr/`, `/fr/about`, `/fr/help`,
`/fr/help/getting-started`, `/fr/help/devices`, `/fr/help/free-trial`, `/fr/help/ordering-payment`,
`/fr/help/troubleshooting`, `/fr/help/contact-support`, `/fr/help/refunds`. Legal pages are not translated: French pages
link to the English legal pages (`hreflang="en"` on the links, a footer note says they are in English).

## 2. Translation coverage

| Area | Source | French | Coverage |
|---|---|---|---|
| Home (hero, categories, highlights, benefits, how it works, call to action) | `src/i18n/dictionaries/en.ts` | `src/i18n/dictionaries/fr.ts` | 100 % |
| Pricing section, plan cards, comparison, simulator, price formats (`59 $`, `4,92 $ / mois`) | same | same | 100 % (prices and pricing logic unchanged) |
| FAQ (6 questions) | same | same | 100 % |
| Order window (3 steps, review, confirmation, errors) and trial / support windows | same | same | 100 % |
| Navigation, footer, cookie banner, 404 inside a language | same | same | 100 % |
| Country names in the forms | `countries.json` | Browser country names in French (`Intl.DisplayNames`) | 100 % |
| About + Help center hub + 7 topics | `src/content/en/info.ts` | `src/content/fr/info.ts` | 100 % (same facts, sections and order) |
| SEO titles and descriptions | per page | per page | 100 %, titles ≤ 60, descriptions ≤ 155 (tested) |
| Accessibility labels (breadcrumb, menus, carousel, dialogs, form errors) | dictionaries + `INFO_UI` | French | 100 % |
| Legal documents | — | Not translated (by instruction) | — |
| Transactional emails, Telegram | — | Not changed (by instruction) | — |

Checks in `tests/unit/french.test.ts`: same structure, placeholders and non-text values as English; no claim beyond the
English (volumes, replay, VIP, superlatives, IPTV, international channels, live sports); 4K/HDR/TV guide always
« selon disponibilité »; activation before payment and the refund facts kept word for word in meaning; French typography.

## 3. Meaning kept on the sensitive points

- Activation **before** payment: « notre équipe vous contacte sur WhatsApp et active votre accès, et vous payez après
  l’activation »; order window: « Rien n’est débité sur ce site. […] active votre accès, puis vous envoie les
  instructions de paiement ».
- Refunds: 7 days from activation, 100 %; 14-day withdrawal for EU and UK customers; no automatic renewal.
- Times « généralement » (never guaranteed); payment methods arranged with the team, none charged on the website.

## 4. Files

New: `src/i18n/dictionaries/fr.ts`, `src/content/fr/info.ts`, `src/content/info.ts`, `tests/unit/french.test.ts`,
`tests/e2e/french.spec.ts`, this document.

Changed: `src/i18n/locales.ts` (preview status), `src/i18n/config.ts`, `src/i18n/dictionaries.ts`,
`src/i18n/dictionaries/en.ts` (type only), `src/lib/seo.ts`, `src/app/sitemap.ts`, `next.config.ts`,
`src/app/[locale]/layout.tsx`, `page.tsx`, `not-found.tsx`, `blog/page.tsx`, `about/page.tsx`, `help/page.tsx`,
`help/[topic]/page.tsx`, `legal/[doc]/page.tsx` (English only, unchanged output), `src/content/en/info.ts` (labels moved
from the pages, same text), `src/components/Header.tsx`, `Footer.tsx`, `Sections.tsx`, `InfoContent.tsx`,
`Breadcrumbs.tsx`, `HelpActions.tsx`, `CountryPicker.tsx`, `CheckoutDialog.tsx`, `RequestDialog.tsx` (locale-aware links
and labels, English defaults), `tests/unit/international.test.ts`, `tests/e2e/site.spec.ts`, `tests/e2e/responsive.spec.ts`.

Not changed: CSS, prices and pricing logic, order API, checkout, payments, emails, WhatsApp, Telegram, database, legal
documents.

## 5. Remaining translation-review issues (native reviewer)

| # | Point | Current choice |
|---|---|---|
| 1 | « No automatic renewal » on the plan cards had to stay on one line | « Sans reconduction » (elsewhere: « ne se renouvellent jamais automatiquement ») |
| 2 | « Live TV & on demand » on the plan cards | « TV en direct et VOD » |
| 3 | « Great value for most homes » | « Idéale pour la plupart des foyers » |
| 4 | Footer chips « Multi-device », « Secure & private » (column width) | « Multi-écrans », « Sûr et privé » |
| 5 | « stream / streams » in the simulator | « écran / écrans » |
| 6 | Comparison table header « Feature » (mobile width) | « Fonction » |
| 7 | « e-mail » vs « courriel » (Québec) | « e-mail » everywhere (language level) |
| 8 | Price format: USD shown as « 59 $ » and « 59 $ USD » / « 59 $ US » in the FAQ | Clarity of « $ » for Canadian readers to confirm |
| 9 | Highlight carousel genres (« Soirée football »…) translate the English wording | Kept as in English |
| 10 | Legal pages in English only | Footer note + `hreflang="en"`; translation needs legal validation |
| 11 | Unknown `/fr/...` URLs show the English 404 page (Next.js global 404 has no language) | Acceptable in preview; localise in 7C |
| 12 | Transactional emails stay in English for French customers | Out of scope (emails not to be modified) |

## 6. Verification summary

- TypeScript, ESLint: OK (0 errors). Unit tests: 164 / 164.
- E2E, CI configuration (production build, no Inter font): 165 passed, 0 failed.
- E2E, content pages `preview`: 205 passed, 0 failed (the 2 pre-existing failures fixed in the test, routing unchanged).
- E2E, French preview + content pages: 253 passed, 0 failed (French SEO, noindex, sitemap, order window, axe, 7 widths
  with fallback fonts).
- English output: 221 URLs identical to Phase 7A in the three content-page modes (HTML, headers, status, sitemap, robots);
  English pages also identical inside the French preview build; CSS byte-identical; English screenshots pixel-identical.

## 7. Recommendations for Phase 7C (French go-live, after authorisation)

1. Native review of all French texts (section 5), sign-off recorded.
2. Decide the legal pages: keep English with the note, or publish validated French translations.
3. Switch `fr` to `enabled`: French routes in production, `/fr` redirects removed (generated), hreflang `en` / `fr` /
   `x-default` and sitemap alternates appear automatically, French pages indexable.
4. Localised 404 for `/fr/...`; French transactional emails if the owner wants them (separate, authorised lot).
5. Search Console: report for the `/fr/` folder, URL inspection of `/fr`, `/fr/help`, `/fr/about` after go-live; Bing.
6. Distribution rights confirmed for France, Canada, Switzerland and Luxembourg before promoting French pages.
