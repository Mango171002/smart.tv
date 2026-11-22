# Phase 7A — International SEO technical foundation (22 November 2026)

Branch `claude/seo-phase7a-foundation`, from `9bae718` (Phase 7 docs, on top of the validated 6B baseline).
Production reference `864f703`. `350882a` never included. Nothing merged or deployed.

**Result: English stays the only enabled language. The public output is unchanged** (HTML, headers, status
codes, redirects, sitemap, robots, CSS and client scripts identical to the baseline in the three content-page
modes). French, German, Spanish, Italian, Dutch, Swedish and Norwegian Bokmål are declared, disabled,
not routed, not in the sitemap and never referenced in hreflang.

## 1. Languages (8) and URL prefixes

| Code | Language | Prefix | hreflang | html lang | og:locale | Status |
|---|---|---|---|---|---|---|
| `en` | English | `/` (root) | `en` + `x-default` | `en` | `en_US` | **Enabled** |
| `fr` | French | `/fr/` | `fr` | `fr` | `fr_FR` | Disabled |
| `de` | German | `/de/` | `de` | `de` | `de_DE` | Disabled |
| `es` | Spanish | `/es/` | `es` | `es` | `es_ES` | Disabled |
| `it` | Italian | `/it/` | `it` | `it` | `it_IT` | Disabled |
| `nl` | Dutch | `/nl/` | `nl` | `nl` | `nl_NL` | Disabled |
| `sv` | Swedish | `/sv/` | `sv` | `sv` | `sv_SE` | Disabled |
| `nb` | Norwegian Bokmål | `/nb/` | `nb` | `nb` | `nb_NO` | Disabled |

Same English slugs under every prefix: `/help`, `/about`, `/legal/privacy`, `/legal/refunds` → future
`/fr/help`, `/de/about`, `/it/legal/privacy`, `/nb/legal/refunds`.

## 2. Markets (13) — one page per language, no country copies

| Market | Languages served (once enabled) | Today |
|---|---|---|
| United States | English | English |
| United Kingdom | English | English |
| Canada | English, French | English |
| Ireland | English | English |
| France | French | — (English root reachable, no French version) |
| Switzerland | French, German, Italian | — |
| Luxembourg | French, German, English | English |
| Germany | German | — |
| Spain | Spanish | — |
| Italy | Italian | — |
| Netherlands | Dutch, English | English |
| Sweden | Swedish, English | English |
| Norway | Norwegian Bokmål, English | English |

No regional hreflang (`en-US`, `en-GB`, `fr-CH`, `fr-CA`, `de-CH`…) and no regional prefix: a market is served
by the language page(s) above. A regional variant is added only if a page becomes genuinely distinct for a
country (prices in a local currency, local law, availability) — a later owner decision.

## 3. What was implemented

| File | Change |
|---|---|
| `src/i18n/locales.ts` (new) | Language registry (8 languages, status, prefix, hreflang, html lang, og:locale, Intl, native name, markets); 13 priority markets; `enabledLanguages`, `languagesForMarket`, `prefixedPath`; `/fr` legacy redirects generated from the registry (no path aliases: imported by `next.config.ts`) |
| `src/i18n/config.ts` | `LOCALES` and the `Locale` type derived from the enabled languages (`['en']`); `localeSeo()` |
| `src/i18n/dictionaries.ts` | `Record<Locale, Dictionary>`: enabling a language without its complete dictionary fails the type check |
| `src/lib/routes.ts` | `localizedPath`, `absoluteUrl`, `href`, `splitLocale` (a disabled prefix is not a language) |
| `src/lib/seo.ts` | `hreflangAlternates` (generic codes, x-default → English, enabled languages only, only where the page exists, none for a single language), `canonicalPath` (self-referencing), `pageLocales` + `PAGE_AVAILABILITY`, locale-aware `buildMetadata` (og:locale from the registry; `alternateLocale` only with a second language; no hreflang on noindex pages) |
| `src/app/sitemap.ts` | One entry per page and enabled language; `xhtml:link` alternates only once a second language is enabled |
| `src/app/[locale]/layout.tsx` | `<html lang>` from the registry |
| `src/components/StructuredData.tsx`, `src/lib/info-pages.ts` | JSON-LD `inLanguage` from the registry (default English) |
| `next.config.ts` | `/fr`, `/fr/*` and `/:locale(en\|fr)/<former page>` redirects generated from the registry (same values) |
| `tests/unit/international.test.ts` (new) | 21 tests: registry, 13 markets, routing, hreflang (generic codes, x-default, reciprocity, no disabled language, no missing page), metadata, sitemap, exact pre-7A redirect list |

Not changed: pages, components' markup, dictionaries' text, CSS, orders, checkout, prices, payments, emails,
WhatsApp, Telegram, database, legal documents, feature flags (`NEXT_PUBLIC_CONTENT_PAGES` unchanged).

## 4. Verification

| Check | Result |
|---|---|
| TypeScript, ESLint | OK (0 errors; 4 existing warnings, unrelated files) |
| Unit tests | 145 / 145 (124 before + 21 new) |
| E2E (production mode, no Inter font as in CI) | 163 passed, 0 failed, 41 skipped (preview-only checks) |
| E2E (content pages `preview`) | 201 passed, 2 failed — the same 2 fail on the baseline `9bae718` (test expects `/fr/help` → `/#faq`, true only when the pages are off; not run by CI) |
| Accessibility (axe, in E2E) | 0 violation |
| Responsive (in E2E) | Passed |
| HTML / headers / status, 221 URLs (169 reference URLs + every disabled prefix and regional prefix), baseline vs 7A | Identical in `off`, `preview` and `live` |
| Same 169 URLs vs production `864f703` | Same 10 differences as the baseline (validated 5C/6A/6B wording and `/api/health` mode) — none from 7A |
| `sitemap.xml`, `robots.txt` | Byte-identical; 6 URLs (15 in `live`); no `xhtml:link`; no `/fr`, `/de`, `/es`, `/it`, `/nl`, `/sv`, `/nb` URL |
| Canonical | Self-referencing, unchanged (`https://sygmatv.com`, `…/legal/privacy`, `…/help` in preview/live) |
| hreflang | None in HTML or sitemap (single language) |
| CSS | Byte-identical to 6B (both stylesheets) |
| Client scripts (`/_next/static`) | Identical file set and content |
| Disabled prefixes | `/de`, `/es`, `/it`, `/nl`, `/sv`, `/nb` and sub-paths → 404 (as before); `/fr`, `/fr/*` → 308 to the English page (as before) |

## 5. How a language is enabled later (Phase 7B onward)

1. Add the complete dictionary `src/i18n/dictionaries/<code>.ts` (native-reviewed) and register it in
   `src/i18n/dictionaries.ts`.
2. Translate the page content used by that language (About, Help, FAQ…); list untranslated paths in
   `PAGE_AVAILABILITY` so that no hreflang or sitemap alternate points to a missing page.
3. Set the status to `enabled` in `src/i18n/locales.ts`. Effects, all generated: routes built, sitemap entries
   with alternates, reciprocal hreflang + x-default, og:locale, html lang; for French, the `/fr` redirects
   disappear in the same release.
4. Add a rewrite only if a prefixed path must be served by another internal route (not needed: `/fr/*` is
   served by the `[locale]` segment directly).
5. Same gates as every release: claims tests, metadata lengths, responsive with fallback fonts, axe, URL
   comparison showing only the intended new URLs.

## 6. Proposed Phase 7B — French localisation (preview first)

| Step | Content |
|---|---|
| 7B.1 | French dictionary re-based on the validated English (6A/6B): no sports, international channels, volumes, replay or VIP wording. The old Preview translation is a starting point only |
| 7B.2 | French About and Help center (7 topics), FAQ at language level (no country answers) |
| 7B.3 | A `preview` language status (built only in a private preview environment, `noindex`, never in sitemap or hreflang) to review French pages before go-live |
| 7B.4 | Language switcher (enabled languages only, `hreflang` and `lang` on links); localised or language-neutral 404 |
| 7B.5 | Claims guard tests for French; title ≤ 60 / description ≤ 155 tests; responsive tests with longer strings |
| 7B.6 | Legal pages: shown in English under `/fr/legal/*` with a notice, or translated after legal validation — owner decision (no legal text changed by 7B without it) |
| Go-live (7C) | `fr` → `enabled`, `/fr` redirects removed in the same release, Search Console report for `/fr/` |

Dependencies: native French reviewer, owner authorisation, decision on legal pages, distribution rights for
the French-speaking markets (France, Canada, Switzerland, Luxembourg).

## 7. Roadmap for the other languages

| Order | Language | Markets | Prerequisites |
|---|---|---|---|
| 1 | French | FR, CA, CH, LU | Phase 7B above |
| 2 | German | DE, CH, LU | Native writer; same pages as French; rights |
| 3 | Spanish | ES | Native writer; rights |
| 4 | Italian | IT, CH | Native writer; rights |
| 5 | Dutch | NL | English already serves NL; add Dutch only with native support capacity |
| 6 | Swedish | SE | English already serves SE; same condition |
| 7 | Norwegian Bokmål | NO | English already serves NO; same condition |

Each language: preview first, native review, measurement for at least 4 weeks after go-live before the next
one. No machine-translated text, no country copies, no channel, sports or film promotion.
