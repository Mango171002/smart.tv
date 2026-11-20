# Phase 7 — Technical implementation plan

**Plan only — nothing implemented.** Base for future lots: the validated SEO baseline (6B `7285837`) — never the
outdated Preview branch as a whole. `350882a` is never included.

## 1. Lots (recommended order)

### Lot 7A — Multilingual foundation, no visible change (P0)

Goal: bring the Preview's locale mechanism onto the current baseline with **only English `live`**, so production
output stays byte-identical.

| File | Change |
|---|---|
| `src/i18n/locales.ts` (new, ported from Preview) | Registry: `en` live; `fr`, `es`, `de` declared `disabled` (language-level prefixes `/fr`, `/es`, `/de` — decision D-P7-1) |
| `src/i18n/config.ts` | `LOCALES` / `LIVE_LOCALES` from the registry |
| `src/i18n/dictionaries.ts` | Load per locale (only `en` today) |
| `src/lib/seo.ts` | `hreflangAlternates()` (ported), used by `buildMetadata` / `infoMetadata`; returns nothing while only `en` is live |
| `src/app/sitemap.ts` | Per-page alternates (`xhtml:link`) from the same function; unchanged output with one language |
| `src/app/[locale]/layout.tsx` | `<html lang>` from the registry; robots per locale status |
| `src/lib/routes.ts`, `src/lib/lastmod.ts` | Paths and dates per locale |
| `next.config.ts` | Keep `/fr` → `/` redirect while `fr` is not live (generated from the registry) |
| `tests/unit/i18n.test.ts`, `tests/unit/seo.test.ts` (new cases) | Registry rules, hreflang reciprocity, no hreflang to non-live versions, sitemap unchanged |
| `tests/e2e/*` | Production comparison (169 URLs identical), robots, 404 |

Benefit: removes the gap between Preview and production without publishing anything. Risk: low (verified by
byte comparison). Dependency: 5C/6A/6B deployed or merged first, to avoid porting twice.

### Lot 7B — French content re-base (Preview only, P1)

| File | Change |
|---|---|
| `src/i18n/dictionaries/fr.ts` | Port from Preview and re-base on the 6A/6B English (claims removed); native review |
| `src/content/fr/info.ts` (new) | French About + Help center (from `src/content/en/info.ts`) |
| `src/content/fr/faq.ts`, `src/content/intl.ts` | Language-level FAQ; country answers kept for later |
| `src/content/fr/guides.ts` | Only guides whose device tests are done |
| `src/components/Header.tsx`, `Footer.tsx` | Language switcher (live languages only, `hreflang`/`lang` on links) |
| `src/app/global-not-found.tsx` | Localised 404 or language-neutral fallback |
| `tests/unit/*-claims.test.ts` | Claims guard for French texts (same rules as `home-claims`, `footer-claims`, `info-pages`) |

### Lot 7C — French go-live (P1, after authorisation)

| File | Change |
|---|---|
| `src/i18n/locales.ts` | `fr` → `live` |
| `next.config.ts` | Remove `/fr` → `/` redirects in the same release |
| `.github/workflows/deploy-cloudflare.yml` | No change expected (status read at build); post-deploy checks for `/fr` |

### Lot 7D — English articles and guides (P1/P2)

| File | Change |
|---|---|
| `src/app/[locale]/blog/[slug]/page.tsx` (new), `src/content/en/articles.ts` (new) | Article template (`Article` JSON-LD, breadcrumbs, last reviewed) |
| `src/app/[locale]/blog/page.tsx` | List articles; lift `noindex` from 3 articles |
| `src/app/[locale]/guides/*` (new), `src/content/en/guides.ts` (new) | Guides after device tests |
| `src/app/sitemap.ts` | Add articles and guides with real `lastmod` |

### Lot 7E — Spanish and German (P2, Preview first)

`src/i18n/dictionaries/es.ts`, `de.ts`, `src/content/es/*`, `src/content/de/*`; same tests; go-live per language.

## 2. Measurement implementation

| Tool | Setup | Monitoring |
|---|---|---|
| Google Search Console | Domain property (verified); sitemap submitted; later one sitemap per language (optional) | Pages report by language folder (`/fr/`…); Performance limited to the page prefix, country and device; URL inspection after each launch |
| Bing Webmaster Tools | Import from Search Console; sitemap; IndexNow manual workflow (exists, `INDEXNOW_ENABLED` off) | Index coverage, queries per language |
| Sitemap monitoring | Discovered vs indexed per language | Weekly during launches, then monthly |
| Index coverage | « Crawled – currently not indexed » triage per template | Monthly |
| Organic reporting | GA4: landing page + `html lang` / page path language dimension; `generate_lead` by organic landing page | Monthly report |
| International performance | Search Console country × page-prefix comparisons (language ≠ country) | After ≥ 4 weeks per language |
| Mobile Core Web Vitals | Search Console Experience report; PageSpeed Insights field data when available; Lighthouse lab per language on deploy | Each release |

Baseline to keep in every report: 5 impressions, 1 click, CTR 20 %, 6 sitemap URLs (20/11/2026) — not a ranking claim.

## 3. Quality gates for every language release

1. Native review signed off; no machine-translated text left.
2. Claims guard tests pass (no volumes, sports, international channels, replay, superlatives, VIP, « IPTV » in titles).
3. Titles ≤ 60, descriptions ≤ 155, one H1, self-canonical, hreflang reciprocal, `x-default` → English.
4. Responsive tests at 7 widths with fallback fonts (longer strings in FR/DE).
5. axe WCAG 2.1 AA: 0 violation; Lighthouse mobile not worse than English.
6. Production comparison: only the intended URLs change.
