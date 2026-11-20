# Phase 7 — International architecture proposal

**Proposal only — no route or locale is created or activated.**

## 1. Principles

1. **One version per language** before any country version. A country version exists only when something material
   differs for the visitor: price grid and currency, consumer-law answers, availability, or support channel.
2. **English stays the default international version at the root** and is the `x-default`.
3. **Every language version is written for that language** (localised examples, units, consumer rights), reviewed by a
   native speaker — never published from raw machine translation.
4. **A page exists in a language only if it is useful there.** No empty or near-empty pages to "complete" a language.
5. **Crawlers see every version**: no automatic redirect by IP or browser language; a dismissible suggestion at most.
6. **Indexable only when `live`** (owner approval + content review + rights for the market concerned).

## 2. URL scheme

| Version | Prefix | hreflang | Status today | Condition to go live |
|---|---|---|---|---|
| English (international, default) | `/` | `en` + `x-default` | Live | — |
| French | `/fr/` | `fr` | Not built in production (Preview has `/fr-fr/`) | Re-based FR content (6A/6B wording), native review, owner approval; rights for the French-speaking markets served |
| Spanish | `/es/` | `es` | None | Content written and reviewed; rights for the Spanish-speaking markets served |
| German | `/de/` | `de` | None | Same, for German-speaking markets |
| Country variants (e.g. `/fr-ch/`, `/fr-ca/`, `/en-gb/`) | `/<lang>-<cc>/` | `fr-CH`, `fr-CA`, `en-GB` | Preview only | Only when price grid / currency / law / availability really differ; then the language version keeps `fr` and the country one adds `fr-CH` |

**Recommendation**: migrate the Preview's `fr-fr` main version to the language-only prefix **`/fr/`** (shorter, matches a
language-level offer, avoids implying France-only rights). Keep the registry able to add `fr-ch` etc. later. Decision
needed (D-P7-1); if the owner prefers `/fr-fr/`, the rest of the plan is unchanged.

Current production redirects `/fr` and `/fr/*` to English (`next.config.ts`): they must be **removed in the same
release** that makes `/fr/` live, otherwise the French version would be unreachable.

## 3. Page inventory per language (first wave)

| Page | EN (root) | FR `/fr/` | ES `/es/` | DE `/de/` |
|---|---|---|---|---|
| Home | `/` | `/fr` | `/es` | `/de` |
| About | `/about` | `/fr/a-propos` | `/es/sobre-nosotros` | `/de/ueber-uns` |
| Help center + 7 topics | `/help`, `/help/<topic>` | `/fr/aide`, `/fr/aide/<sujet>` | `/es/ayuda/...` | `/de/hilfe/...` |
| Setup guides (after device tests) | `/guides`, `/guides/<device>` | `/fr/guides/<appareil>` | `/es/guias/<dispositivo>` | `/de/anleitungen/<geraet>` |
| Informational articles | `/blog/<slug>` | `/fr/blog/<slug>` | `/es/blog/<slug>` | `/de/blog/<slug>` |
| Legal pages | `/legal/*` | translated only after the English legal text is validated | idem | idem |

Localised slugs are proposed for readability; hreflang links the equivalents, so slugs may differ. Alternative (simpler):
keep English slugs under each prefix (`/fr/help/...`). Decision D-P7-2.

## 4. hreflang rules

- Generated from the locale registry (Preview `hreflangAlternates()`), on each page, **only for versions where that
  page exists and is `live`**.
- Each page lists itself, all its live equivalents, and `x-default` → the English equivalent (or the English home for
  pages without an English twin — to avoid; prefer English twins).
- Language-only codes (`fr`, `es`, `de`) for language versions; add region codes (`fr-CH`) only for country variants.
- Reciprocity enforced by unit tests (every A→B has B→A); no hreflang to `noindex`, redirected or 404 URLs.
- Emitted in HTML `<head>` **and** in the sitemap (`xhtml:link`), from the same function.

## 5. Canonicals and indexation

- Self-referencing absolute canonical per language version; never point a translation to English.
- `noindex` until `live`; preview environment protected (password + `X-Robots-Tag: noindex`), never in sitemaps.
- 404 for unknown pages in every language (global 404, `noindex`), no soft 404s.

## 6. Sitemaps

- Keep one `sitemap.xml` while the site is small (< a few hundred URLs); each URL with its alternates.
- Optional later: sitemap index with one sitemap per language (`/sitemaps/en.xml`, `/sitemaps/fr.xml`…) to monitor
  indexing per language in Search Console.
- `lastmod` = real « Last reviewed / updated » date of each language version (mechanism already in place).

## 7. Structured data

- One `Organization` entity (same `@id` `https://sygmatv.com/#organization`) referenced from every language; English
  home keeps the full description.
- `WebSite` / `WebPage` / `AboutPage` / `CollectionPage` with `inLanguage` per version; `BreadcrumbList` with localised
  names and absolute URLs.
- Articles: `Article` (author = organisation, `dateModified`), no `FAQPage` / `HowTo` (no rich results to expect).
- No `Product` / `Offer` markup with prices until prices per market are final.

## 8. Language switcher and internal links

- Header and footer switcher listing **only live languages**, as plain links with `hreflang` and `lang` attributes,
  pointing to the equivalent page (fallback: the language home).
- Each language has its own hub structure (Help center, guides, blog) linked from its home and footer; no cross-language
  links in body copy except the switcher.
- `<html lang>` per version (`en`, `fr`, `es`, `de`).

## 9. What not to build

- Country copies without differences; automatically generated pages per city or country.
- Promotional pages for channels, sports, films or competitions without distribution rights.
- Machine-translated pages without native review; hundreds of pages at once.
