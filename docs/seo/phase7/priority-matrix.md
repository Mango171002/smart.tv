# Phase 7 — Priority matrix

| ID | Prio | Recommendation | Expected benefit | Risk | Dependencies | Files (future) | Order |
|---|---|---|---|---|---|---|---|
| R1 | **P0** | Deploy the validated 5C/6A/6B lots (English About, Help center, home, footer) | More useful indexable English pages (6 → 15 sitemap URLs); clean base for translations | Terms contradiction until the legal text is updated | Owner authorisation; legal alignment (6C) | Already prepared on their branches | 1 |
| R2 | **P0** | Lot 7A: port the locale registry, hreflang and sitemap alternates with only English live | Multilingual readiness without any visible change; ends the Preview/production gap | Low (byte comparison, tests) | R1 merged or deployed (avoid double porting) | `src/i18n/locales.ts`, `src/i18n/config.ts`, `src/i18n/dictionaries.ts`, `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/[locale]/layout.tsx`, `src/lib/routes.ts`, `src/lib/lastmod.ts`, `next.config.ts`, tests | 2 |
| R3 | **P0** | Decide URL scheme: language prefixes `/fr`, `/es`, `/de` (recommended) vs country prefixes | Avoids duplicate country pages; simpler hreflang | Changing later costs redirects | Owner decision D-P7-1, D-P7-2 (slugs) | `src/i18n/locales.ts` | 3 |
| R4 | **P0** | Measurement baseline: Search Console reports per language folder, Bing, GA4 link, export | Comparable data per language | None | Access | — | 1 (parallel) |
| R5 | P1 | Lot 7B: re-base French on 6A/6B English; translate About + Help; claims guard tests | Credible French version; no unverified claims | Translation quality → native review | R2, native reviewer | `src/i18n/dictionaries/fr.ts`, `src/content/fr/*`, `src/content/intl.ts`, `Header.tsx`, `Footer.tsx`, tests | 4 |
| R6 | P1 | Device tests on 3 platforms, then guides EN + FR | Practical, non-promotional content; support savings | Untested steps mislead users → strictly gated | Devices, confirmed app names | `src/content/en/guides.ts`, `src/content/fr/guides.ts`, `src/app/[locale]/guides/*` | 5 |
| R7 | P1 | Lot 7C: French go-live (`/fr/`, hreflang, remove `/fr` redirect) | First non-English organic visibility | Rights for French-speaking markets; Terms in French | R5, rights, authorisation | `src/i18n/locales.ts`, `next.config.ts` | 6 |
| R8 | P1 | 2 English articles (internet speed, Wi-Fi vs cable) | Informational impressions; links to Help | Thin content if rushed | Review | `src/app/[locale]/blog/*`, `src/content/en/articles.ts`, `src/app/sitemap.ts` | 4 (parallel) |
| R9 | P2 | Article « What is IPTV? » (EN, then FR) — neutral | Educational visibility for a core term | Must not promote unlicensed content | R8 template | same as R8 | 7 |
| R10 | P2 | Spanish and German versions (Preview first) | New language markets | Rights, native writers, support capacity | Market decisions, rights | `src/i18n/dictionaries/es.ts`, `de.ts`, `src/content/es/*`, `src/content/de/*` | 8 |
| R11 | P2 | One sitemap per language (sitemap index) | Indexing monitored per language | None | R7 | `src/app/sitemap.ts` (or `sitemap/[lang]`) | 7 |
| R12 | P2 | Field Core Web Vitals monitoring; responsive tests per language with fallback fonts | Avoid layout regressions with longer strings | None | R5 | `tests/e2e/responsive.spec.ts` | with R5 |
| R13 | — | **Not recommended**: country copies, city/country landing pages, channel/sports/film pages, bulk machine translation | — | Duplicates, quality and rights risks | — | — | — |

## Decisions needed from the owner

| ID | Decision |
|---|---|
| D-P7-1 | URL prefixes: language-level `/fr`, `/es`, `/de` (recommended) or country-level `/fr-fr` … — **decided 22/11/2026: language prefixes** |
| D-P7-2 | Localised slugs (`/fr/aide`) or English slugs under each prefix (`/fr/help`) — **decided 22/11/2026: English slugs** |
| D-P7-3 | Markets served per language (and distribution rights for each) |
| D-P7-4 | Native reviewers for FR, ES, DE |
| D-P7-5 | Devices and app names to test for the first guides |
