# D1 — Release configuration: 8 languages + content pages (Phase 13, 23 November 2026)

**Status: prepared, NOT applied.** `.env.production` on this branch is unchanged. Applying it requires the owner's
written approval (release-readiness.md §8–§9). Validated on the release candidate `5c3635f` + Phase 13 SEO commits `27a5e88`, `2e8a63f`.

## 1. The release commit (exact diff)

Apply with `git apply docs/release/phase13/release-switch.patch` (it touches `.env.production` only):

```diff
@@ -7,3 +7,5 @@
 SALES_ENABLED=false
 NEXT_PUBLIC_ALLOW_INDEXING=true
 NEXT_PUBLIC_SITE_URL=https://sygmatv.com
+NEXT_PUBLIC_RELEASED_LANGUAGES=fr,de,es,it,nl,sv,nb
+NEXT_PUBLIC_CONTENT_PAGES=live
```

- One line per variable, no spaces or quotes (`tests/unit/release-flag.test.ts` rejects anything else).
- Do not add `NEXT_PUBLIC_SITE_MODE` anywhere. Do not touch `wrangler.jsonc`, the workflows or `.env.staging`: the
  build step (`npx opennextjs-cloudflare build`) reads `.env.production` only.
- `FEATURE_CONTACT_FORM=false` stays: orders and free trials stay closed (prelaunch copy everywhere).
- Recommended in the same commit: `docs/release/phase13/legacy-redirects.patch` (§6). It has no effect while the
  languages are released and makes a later rollback safe.
- Partial release: list only the approved codes (e.g. `NEXT_PUBLIC_RELEASED_LANGUAGES=fr`); counts below change.

## 2. Validation on this release candidate (scratch copy, nothing committed)

| Check | Result |
|---|---|
| `npx vitest run` with the two lines in `.env.production` | 32 files, 534 tests passed (`release-flag.test.ts` 19/19, incl. the `.env.production` line check; a bad line such as `fr,xx` or `CONTENT_PAGES=Live` fails it) |
| `npx next build` reading `.env.production` only (no variable on the command line) | OK (`Environments: .env.production`) |
| Crawl of that build (`next start`) | 85 sitemap URLs, all 200 `index, follow`; 720 hreflang links (9 × 80), reciprocal, = sitemap alternates; 0 broken of 3,781 internal links; output identical to the command-line build (1) |
| Release switch + `legacy-redirects.patch` together | vitest 535 passed; crawl output identical (the patch changes nothing while released) |

## 3. What changes (production today → after the release)

| | Today | After |
|---|---|---|
| Sitemap URLs | 6 (5 legal + home) | **85**: 10 pages × 8 languages + 5 English legal pages |
| Indexable languages | English | en, fr, de, es, it, nl, sv, nb |
| hreflang | none | 9 per translated page (8 languages + `x-default` → English), also in the sitemap (`xhtml:link`, 720) |
| `/fr` | 308 → `/` | 200, French home |
| `/de`, `/es`, `/it`, `/nl`, `/sv`, `/nb` | 404 | 200 |
| `/help`, `/about`, `/help/<topic>` | `/help` 308 → `/#faq`; others 404 | 200, indexable |
| `/xx/legal/<doc>` | `/fr/…` 308 → `/legal/<doc>`; others 404 | 308 → `/legal/<doc>` (legal pages stay English) |
| `/xx/<unknown>` | `/fr/…` 308 → English; others 404 | 404, localized page, `noindex`, `<html lang="xx">` |
| `robots.txt` | `Allow: /`, `Disallow: /api/`, `Sitemap:` | unchanged |

## 4. IndexNow

- The deploy workflow takes a snapshot of the live sitemap pages before the build and compares after the deploy
  (`scripts/indexnow.mjs changed`). For this release: about **85 URLs** (79 new + the 6 English pages whose HTML
  changes). IndexNow reaches Bing, Yandex and others, not Google.
- URLs are **sent only if** the repository variable `INDEXNOW_ENABLED` is `true` (GitHub → Settings → Variables).
  Otherwise the step is a dry run that lists them in the job summary. Decide before pushing (decision D9).
- The script refuses preview mode and any host other than `sygmatv.com`; the key file
  (`public/f85f4dfde89fac6180f91862b82fea4c.txt`) must be live.
- A rollback is also a change: with `INDEXNOW_ENABLED=true`, the removed URLs are submitted so engines recrawl them
  (they then see the redirect, or a 404 without §6.3).

## 5. « Last reviewed » dates to update in the release commit

Set them to the real final review date (S-007). Values at `5c3635f` (line numbers may move with the parallel copy work):

| File | Constant | Current value | Used for |
|---|---|---|---|
| `src/content/en/info.ts:13` | `INFO_REVIEWED` | `20 November 2026` | English pages and the sitemap `lastmod` of all 72 content URLs |
| `src/content/fr/info.ts:14` | `INFO_REVIEWED_FR` | `20 novembre 2026` | French pages |
| `src/content/de/info.ts:367` | `reviewed` | `20. November 2026` | German pages |
| `src/content/es/info.ts:362` | `reviewed` | `20 de noviembre de 2026` | Spanish pages |
| `src/content/it/info.ts:363` | `reviewed` | `20 novembre 2026` | Italian pages |
| `src/content/nl/info.ts:13` | `INFO_REVIEWED_NL` | `20 november 2026` | Dutch pages |
| `src/content/sv/info.ts:364` | `reviewed` | `20 november 2026` | Swedish pages |
| `src/content/nb/info.ts:362` | `reviewed` | `20. november 2026` | Norwegian pages |
| `tests/unit/translations.test.ts:19-24` | `RULES.*.reviewed` | the six values above | must match (de, es, it, nl, sv, nb) |

Legal pages (English only) keep their own « Last updated » dates — change them only if the legal text changes:
`src/content/legal.ts:32` `UPDATED = '16 November 2026'` (privacy, cookies, refunds, imprint) and
`src/content/terms.ts:8` `TERMS_UPDATED = '17 November 2026'`.

## 6. Rollback

1. Fastest: Cloudflare rollback to the previous Worker version (release-readiness.md §7). Then, in git, revert the
   release commit (remove the two lines) so that the next deploy does not re-release.
2. Without `legacy-redirects.patch`: `/fr` and `/fr/*` redirect (308) to the English pages, but `/de`, `/es`, `/it`,
   `/nl`, `/sv`, `/nb` and their pages answer **404** (only French is in `LEGACY_REDIRECT_LANGUAGES`).
3. **Recommendation:** apply `docs/release/phase13/legacy-redirects.patch` first — ideally in the release commit, at the
   latest in the rollback commit. It adds the six languages to `LEGACY_REDIRECT_LANGUAGES` (`src/i18n/locales.ts`) and
   updates the tests (unit: redirects of an unreleased language, rollback safety; E2E: `/de` → 308 `/`). While a
   language is released the entry generates no redirect, so the release output is identical. After a rollback, every
   un-released language's URL redirects to its English page (`/de/help` → `/help`, `/nb` → `/`) instead of 404.
   Validated in a scratch copy: production-today build with the patch gives `/de` → 308 `/`, `/nb/about` → 308
   `/about`, `/es/x/y` → 308 `/x/y`, `/it/plans` → 308 `/#plans`, `/pt` still 404, sitemap still 6. If the content
   pages are rolled back too, `/xx/about` lands on `/about` → 404 (no page). Not applied on this branch: without the release, it would also change
   today's production (`/de` 404 → 308 `/`), which needs the owner's approval.
4. Permanent redirects are cached by browsers: after a rollback, check in a private window or with `curl -I`.

## 7. Post-deploy verification (exact commands)

```bash
B=https://sygmatv.com
# Sitemap: 85 URLs, 720 alternates; per language 10 (English 15)
curl -s $B/sitemap.xml | grep -c '<loc>'                                 # 85
curl -s $B/sitemap.xml | grep -c 'xhtml:link'                            # 720
for l in fr de es it nl sv nb; do echo "$l $(curl -s $B/sitemap.xml | grep -c "<loc>$B/$l[</]")"; done   # 10 each
# Language homes and one topic per language: 200, index, follow, 9 hreflang, self canonical
for u in / /fr /de /es /it /nl /sv /nb /fr/help/devices /nb/about; do
  h=$(curl -s "$B$u"); echo "$u $(curl -s -o /dev/null -w '%{http_code}' "$B$u") \
  robots=$(echo "$h" | grep -o '<meta name="robots" content="[^"]*"' | head -1 | cut -d'"' -f4) \
  hreflang=$(echo "$h" | grep -o 'hrefLang="[^"]*"' | sort -u | wc -l) \
  canonical=$(echo "$h" | grep -o '<link rel="canonical" href="[^"]*"' | cut -d'"' -f4)"
done                                                                     # 200 index, follow hreflang=9
# Redirects
curl -sI $B/en | grep -iE '^(HTTP|location)'                             # 308 → /
curl -sI $B/fr/legal/terms | grep -iE '^(HTTP|location)'                 # 308 → /legal/terms
curl -sI $B/fr/plans | grep -iE '^(HTTP|location)'                       # 308 → /fr#plans
curl -sI https://www.sygmatv.com/de | grep -iE '^(HTTP|location)'        # 308 → https://sygmatv.com/de
curl -s -o /dev/null -w '%{http_code}\n' $B/help                         # 200 (no longer 308 /#faq)
# 404s: status, noindex, language document
curl -s -o /dev/null -w '%{http_code}\n' $B/de/nope                      # 404
curl -s $B/de/nope | grep -oE '<html[^>]*lang="de"|<meta name="robots" content="noindex[^"]*"'
curl -s -o /dev/null -w '%{http_code}\n' $B/nope                         # 404 (English global page)
curl -s -o /dev/null -w '%{http_code}\n' $B/pt                           # 404 (not a site language)
# robots.txt unchanged
curl -s $B/robots.txt                                                    # Allow: /  Disallow: /api/  Sitemap: …
# Staging still private
curl -sI https://staging.sygmatv.com/ | grep -iE '^(HTTP|location)'      # 302 → …cloudflareaccess.com/cdn-cgi/access/login/…
```

Then, by hand: Search Console and Bing Webmaster Tools — resubmit `sitemap.xml`, inspect `/fr`, `/de` and one Help page
per language (S-010). Check the IndexNow step summary of the deploy job (sent or dry run).
