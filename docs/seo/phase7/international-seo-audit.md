# Phase 7 — International SEO audit (20 November 2026)

**Read-only audit and documentation.** Branch `claude/seo-phase7-international`, created from the validated SEO
baseline 6B `7285837` (includes 5C, 6A, 6B). No route, locale, page, order, price, payment, WhatsApp, Telegram,
email, database or design change. Nothing merged or deployed. `350882a` absent. Legal documents untouched.

**Sources**: code of this branch (production `864f703` + 5C/6A/6B), code of the international Preview branch
`claude/seo-phase1-preview` (`6f57746`), live site checks of 20/11/2026, Search Console baseline supplied by the owner.
No search volume, ranking, difficulty or traffic forecast is used or invented.

---

## 1. Summary

1. **The live site is English-only by design** (`src/i18n/config.ts`: `LOCALES = ['en']`), served at the root
   (`/en/*` → 308 to the unprefixed URL; `/fr` and `/fr/*` → 308 to the English URL). No hreflang, which is correct for
   a single-language site.
2. **A complete multilingual mechanism already exists — in the Preview branch only**: locale registry with
   `live / preview / disabled` statuses, hreflang + `x-default` in HTML and sitemap, language-only hreflang (`fr`), FR
   FAQ and 7 FR setup guides, country picker, no automatic redirects. Its *mechanics* are sound.
3. **But the Preview is outdated**: it branches from an older production (`24cdc49`) and lacks the 404 page, the
   `sameAs` fix, the 5C pages (About, Help center), the 6A home rewrite and the 6B order-window note. Its French
   interface is a translation of the **pre-6A** English and still contains every unverified claim (live sports,
   international channels, 12,000–35,000 channels, 100,000–200,000 films, replay, « Prioritaire VIP »).
4. **Its country model (`fr-fr`, `fr-be`, `fr-ch`, `fr-ca`, `en-gb`, `en-ca`) multiplies near-identical pages**: the
   versions differ only by a few FAQ answers (currency, consumer law), have no validated prices and no orders. Opening
   them as indexable URLs today would create duplicates without user value.
5. **No German or Spanish content exists** (`de-de`, `de-ch`, `es-es` are declared but `disabled`, with no dictionary).
6. **Measurement baseline is tiny**: 5 impressions, 1 click, CTR 20 %, 6 sitemap URLs (owner data, 20/11/2026). No
   query is visible; this sample proves indexing, not commercial rankings.

---

## 2. Findings by area

| Area | Current state (production + 6B baseline) | Preview branch | Assessment |
|---|---|---|---|
| **URL architecture** | English at the root; `/en/*` → 308 root; `/fr/*` → 308 root | Root = English; other versions under `/<lang>-<country>/` (e.g. `/fr-fr/`, `/fr-be/`) | Root English is right. Country prefixes are premature: no country-specific offer, price or right yet |
| **Language routing** | Single `[locale]` segment, `dynamicParams = false`, rewrites `/` → `/en` | Same segment, registry of 12 versions, only `live` ones built in production | Mechanism reusable; no IP / Accept-Language redirect (good — crawlers see every version) |
| **hreflang** | None (correct for one language) | `hreflangAlternates()`: every live version where the page exists + language-only code + `x-default` → English | Correct design; must stay limited to pages that really exist in each language |
| **x-default** | — | English root | Keep English root as `x-default` |
| **Canonical** | Absolute, self-referencing, unprefixed (`https://sygmatv.com/...`) | Self per version | Keep self-canonical per language; never canonicalise a translation to English |
| **XML sitemap** | 6 URLs (home + 5 legal), real `lastmod`; 15 with 5C `live` | Live versions only, with `xhtml:link` alternates; preview versions never listed | Sitemap alternates are a good complement to HTML hreflang |
| **Robots** | `Allow: /`, `Disallow: /api/`, sitemap declared | Preview environment: password + `X-Robots-Tag: noindex` | No change needed |
| **Indexation rules** | `index, follow` on live pages; 5C pages `noindex` until `live`; blog `noindex` (empty); 404 `noindex` | Non-live versions `noindex, nofollow` | Rule to keep: a version is indexable only when `live` |
| **Structured data** | Home: `Organization` (foundingDate, 6 support languages) + `WebSite`; 5C: `BreadcrumbList`, `AboutPage`, `CollectionPage`, `WebPage` | `WebSite` per version with `inLanguage`? (to check at port) | One `Organization` for all languages (same `@id`); `inLanguage` on each page; no FAQPage/HowTo rich-result promises |
| **Internal linking** | Header, footer, home anchors; FAQ → refunds/privacy (6A) | Language/country picker in header and footer; FR guides hub linked from FR pages | Add language switcher with `hreflang`/`lang` attributes on links; keep one hub per language |
| **Mobile performance** | Lighthouse mobile (lab, home): 89–97, LCP 1.9–3.1 s, CLS 0, TBT 120–320 ms | Same stack | Good in lab; **field data unknown** |
| **Core Web Vitals (field)** | Not available (traffic too low for CrUX; Search Console report probably « not enough data ») | — | Monitor; no claim |
| **Fonts** | Site relies on the device font (Inter is not loaded); fixed layout issues found in 6A | Same | Translations are longer (FR/DE +15–35 % text): test every language with fallback fonts (6A responsive test) |

---

## 3. Translation audit (existing material)

| Material | Location | Status | Issues |
|---|---|---|---|
| French interface (`fr.ts`, 570 lines) | Preview branch | Complete, marked « draft to be reviewed by a native speaker » | Translates the **pre-6A** English: sports in H1 and meta, international channels, 12 000–35 000 channels, replay 7/14 days, « Prioritaire VIP », « +100 000 films » — must be re-based on the 6A/6B English |
| French FAQ (`fr/faq.ts`) | Preview | Complete, country variants for CH/CA (currency, consumer law) | Country answers « à valider » (`docs/INTERNATIONAL.md`); refund wording « 7 jours suivant l'activation » (pre-6C decision) |
| French setup guides (7: Smart TV, Android TV, Fire TV, Apple TV, iPhone/iPad, Android, ordinateur) | Preview | Clean: no app names, official stores only, no sideloading | **Not tested on devices** (5B verification plan); must not be published before tests |
| French legal pages (`fr/legal.ts`) | Preview | Translations of the current legal texts | Out of Phase 7 scope (legal workflow stopped); must follow the validated English legal text |
| About / Help center (5C) | 6B baseline, English only | — | No French, Spanish or German version |
| German, Spanish | — | None | Must be written (not machine-generated) and reviewed by native speakers |

---

## 4. Risks

| Risk | Level | Mitigation |
|---|---|---|
| Publishing country copies (`fr-be`, `fr-ch`, `fr-ca`, `en-gb`, `en-ca`) with identical content | High (duplicates, crawl waste, cannibalisation) | One version per **language** first; country variants only with real differences (prices, currency, law, availability) |
| Translating unverified claims into 3 more languages | High (consumer law, Ads policy, rights) | Translate only the 6A/6B English; claims guard tests per language |
| Promotional pages for channels, sports or films without rights | High | Excluded from the roadmap |
| hreflang errors (missing return links, links to non-existent or `noindex` pages) | Medium | Generate from the registry; unit tests on reciprocity; only `live` versions |
| Machine translation published as is | Medium (quality systems, trust) | Native review mandatory; no bulk generation |
| Language detection redirects | Medium (hides versions from crawlers) | Never redirect automatically; suggest via a dismissible banner at most |
| Measurement too thin to steer decisions | Medium | Domain property + reports limited to each language folder; wait for meaningful volumes before optimising |
