# SYGMA TV+ — Release readiness: international SEO work (22 November 2026)

**Status: release candidate prepared, nothing deployed.** Waiting for the owner's explicit approval.

| | |
|---|---|
| Production (live today) | `864f703` — head of `claude/intelligent-shannon-uwa4fi` (checked on sygmatv.com: same title, claims and redirects) |
| Release candidate | branch `claude/release-candidate-seo` = `daebbc0` (Phase 7D) + this document |
| Relation | Fast-forward: production is an ancestor; 18 commits on top, no merge, no rewrite |
| Forbidden commit `350882a` | Absent from the release candidate and from production |
| How production deploys | `.github/workflows/deploy-cloudflare.yml` runs on **every push to `claude/intelligent-shannon-uwa4fi` (or `main`)** and on manual dispatch. Pushing to that branch = deploying. Nothing was pushed there. |

## 1. Commit history and dependencies

Linear chain, each phase built on the previous one (no cherry-pick, no merge commit):

| # | Commit | Phase | Content | Code / docs |
|---|---|---|---|---|
| 1 | `40600b1` | 5B | SEO growth preparation documents | docs only |
| 2 | `142c7c0` | 5B | Claims validation table, guides verification plan | docs only |
| 3 | `55ccd8d` | 5C | About us + Help center pages behind `NEXT_PUBLIC_CONTENT_PAGES` (off by default) | code |
| 4 | `fd8c0f6` | 5C | Claims decisions, proposals | docs only |
| 5 | `486e7d9` | 5C | About / Help finalised, footer chips fix | code |
| 6 | `7fab2ec` | 5C | Audit of the real ordering flow | docs only |
| 7 | `45e05c7` | 5C | Real assisted ordering flow in About / Help; `/api/health` label « assisted » | code |
| 8 | `1d52e1e` | 5C | Pre-publication review fixes | code |
| 9 | `7052460` | 5C | Footer without unproven claims | code |
| 10 | `9923c7f` | 6A | Home SEO: title, description, H1, claims removed, channel/film counts hidden, FAQ links, JSON-LD | code |
| 11 | `76d0e03` | 6A | Plan cards layout fix (fallback fonts) | code |
| 12 | `7285837` | 6B | Clearer order-window note (activation, then payment) | code |
| 13 | `9bae718` | 7 | International SEO audit and plan | docs only |
| 14 | `4f3a7f7` | 7A | Language registry (8 languages, 13 markets), hreflang / canonical / sitemap foundation — English only | code |
| 15 | `e5ac628` | 7B | French translation, preview only | code |
| 16 | `3b8cff1` | 7C | Release flag (off), French prices, French 404, legal pages English-only | code |
| 17 | `970c92d` | 7C | Checklist results | docs only |
| 18 | `daebbc0` | 7D | English trust wording aligned (« Data never sold », « Free trial »), French terminology | code |

**Not included** (separate branches, by design): 6C.1 legal proposals (`claude/seo-phase6c1-legal`,
`…-decisions` — documents only, not validated), Phase 6 audit (`claude/seo-phase6-audit`), the old international preview
(`claude/seo-phase1-preview`), `350882a`.

**Dependencies** — every lot is controlled at build time; none needs a database change or a new secret:

| Switch (build time) | Default | Effect |
|---|---|---|
| `NEXT_PUBLIC_CONTENT_PAGES` | unset = off | `live` publishes About / Help (indexable, sitemap 6 → 15 URLs, header/footer links); `preview` = noindex |
| `NEXT_PUBLIC_RELEASED_LANGUAGES` | unset | `fr` publishes French (never set without written approval; a unit test forbids it in production files) |
| `NEXT_PUBLIC_SITE_MODE` | unset | `preview` builds French in noindex (private environments only; forbidden in production files by a test) |

The deployment workflow sets none of them: deployed as is, the release candidate keeps About / Help and French **off**.

## 2. Differences between the release candidate and production

Source (`git diff 864f703 daebbc0`): 83 files, of which 28 documents. Sensitive areas:

| Area | Changed? |
|---|---|
| Order API, quote, checkout lock, contact API, validation, rate limits | No |
| Prices, pricing logic, price source | No |
| Emails (templates, sending), Telegram bot | No |
| Database (`supabase/`), migrations | No |
| Legal documents (`src/content/legal.ts`, terms) | No |
| Cloudflare config (`wrangler.jsonc`, `worker.ts`, `open-next.config.ts`), workflows, dependencies | No |
| `/api/health` | Label only: `mode: "prelaunch"` → `"assisted"` (nothing reads it; `salesEnabled` still false) |
| `src/config/catalogue.ts` | Channel / film counts hidden (not backed by contracts) |

### Rendered pages (232 URLs, HTML, status, headers, then visible text)

| Configuration of the release candidate | Identical | Different | What differs |
|---|---|---|---|
| As deployed by the workflow (About / Help off, French off) | 222 | 10 | Home (6A/6B/7D wording, title, description, no channel/film counts, plan cards, FAQ), footer of 7 pages (tagline, about text, chips), `/api/health` label. **No status, redirect or header difference.** |
| With About / Help `live` | 215 | 17 | The same, plus `/about`, `/help`, `/help/<topic>` now 200, `/help` and `/fr/help` no longer redirect to `/#faq`, sitemap 6 → 15 URLs |

The full text diff is in `appendix-rendered-differences.md`. Every difference comes from a validated phase
(5C, 6A, 6B, 7D); there is no French text in any public page.

## 3. Verification of the release candidate

| Check | Result |
|---|---|
| Unit tests (Vitest) | 184 / 184 |
| E2E — production build (CI configuration, fallback fonts) | 165 passed, 0 failed |
| E2E — About / Help preview | 205 passed, 0 failed |
| E2E — French preview | 255 passed, 0 failed |
| E2E — French released (flag on) | 255 passed, 0 failed |
| Accessibility (axe WCAG 2.1 AA), responsive (7 widths), order / trial / support windows | Included above, all passing |
| GitHub CI on the release candidate (lint, types, unit, build, E2E, Cloudflare build) | see the CI run of this branch |

E2E figures: Phase 7D runs on `daebbc0` (the release candidate adds documents only; CSS checked identical).

SEO crawl of the release candidate (sitemap + every internal link; title, description, H1, canonical, robots, `lang`,
hreflang reciprocity, sitemap consistency, duplicates):

| Configuration | Indexable | Sitemap | hreflang pages | Issues |
|---|---|---|---|---|
| As deployed (About / Help off, French off) | 6 | 6 | 0 | none |
| About / Help `live` | 15 | 15 | 0 | none |
| About / Help `live` + French released | 25 | 25 | 20 (10 EN ↔ 10 FR) | none |

Redirects checked: `/en`, `/en/*` → `/`…; `/fr`, `/fr/*` → English page (French off); former pages `/plans`,
`/devices`, `/coverage` → home sections; `/help` → `/#faq` (About / Help off); `www` → apex; unknown URL → branded 404.
French released: `/fr/legal/*` → 308 English legal page, `/fr/plans` → `/fr#plans`, `/fr/nope` → 404.

## 4. Assisted order process (no real payment, no real subscription)

| Check | How | Result |
|---|---|---|
| Order window (3 steps, server price confirmation, WhatsApp number, consent) | E2E with the submission intercepted in the browser (nothing sent) — English and French | Pass |
| Trial and support windows, rate-limit message | E2E, intercepted | Pass |
| Automatic online payment stays locked | E2E `POST /api/checkout` → 403 `sales_disabled` | Pass |
| Health endpoint | E2E: `assisted`, `salesEnabled: false` | Pass |
| Contact API validation (incl. language `en` / `fr`) | Unit tests (`tests/unit/api.test.ts`) | Pass |
| Order code unchanged | `git diff 864f703 daebbc0 -- src/app/api src/lib/email src/lib/telegram src/lib/pricing.ts …` | Only the health label |
| Database accepts the language of a French order | Read-only schema query: `contact_requests_locale_check` = `en`, `fr`; only trigger = throttle | OK (no data read) |
| Test submissions never reach production | All E2E submissions intercepted; no test posts to `/api/contact` | Confirmed |

Not done on purpose: no real order, no Telegram card, no email, no payment, no activation. A real end-to-end test needs
either the private staging with a test database or one owner-run test order after deployment (section 5, decision D5).

## 5. Private staging plan (desktop and mobile)

Today there is no staging: `workers_dev` and preview URLs are disabled (owner choice). Proposed, **not created**:

| Item | Proposal |
|---|---|
| Hosting | Separate Worker `sygma-staging` on `staging.sygmatv.com` (custom domain), deployed by a manual-only workflow |
| Access | Cloudflare Access (owner email, one-time code) in front of the whole hostname |
| Indexing | `NEXT_PUBLIC_ALLOW_INDEXING=false` (robots `Disallow: /`, `noindex` on every page) |
| Content | `NEXT_PUBLIC_CONTENT_PAGES=live` (or `preview`), `NEXT_PUBLIC_SITE_MODE=preview` (French in noindex) |
| Orders | `FEATURE_CONTACT_FORM=false` by default (forms show « unavailable »); optional test database (separate Supabase project) to test the full flow |
| Safety | No cron trigger, no `SUPABASE_SECRET_KEY`, no Telegram / Brevo secrets, no Telegram webhook registration, no IndexNow |
| Test matrix | iPhone (Safari), Android (Chrome, Samsung Internet), iPad, Windows (Chrome, Edge), macOS (Safari, Firefox); pages: home, plans, simulator, order / trial / support windows, About, Help hub + 7 topics, legal pages, 404, French equivalents; checks: layout, text, links, forms, cookie banner, accessibility (keyboard, zoom 200 %) |

Requires: approval, a Cloudflare Access policy, one DNS record (created by the custom domain), a small `wrangler`
staging environment and workflow (code change in a separate lot).

## 6. Deployment plan

Recommended in **three separate, independently reversible steps**:

| Step | What | Configuration | Prerequisites |
|---|---|---|---|
| R1 | English quality and SEO: 6A home, 6B wording, 7A foundation, 7D trust wording, footer, 404 already live | As is (About / Help off, French off) | D1 |
| R2 | About us + Help center published | `NEXT_PUBLIC_CONTENT_PAGES=live` in `.env.production` (one-line commit) | D2 (Terms alignment), R1 stable |
| R3 | French public | `NEXT_PUBLIC_RELEASED_LANGUAGES=fr` | D3, D4, D6, R2 stable, staging test |

### Checklist (each step)

Before:
1. Written approval of the step; release candidate commit identified.
2. CI green on the exact commit (lint, types, unit, build, E2E, Cloudflare build).
3. Note the current Cloudflare Worker version (Workers → `iptv-international` → Deployments) for rollback.
4. Snapshot: `curl https://sygmatv.com/sitemap.xml`, `/robots.txt`, `/api/health` (saved for comparison).

Deploy:
5. Fast-forward `claude/intelligent-shannon-uwa4fi` to the approved commit (no force push) — this starts the
   deployment workflow (tests, build, deploy, secrets, Telegram webhook re-registration, smoke test, Lighthouse, IndexNow
   dry run unless `INDEXNOW_ENABLED=true`).

After (within 15 minutes):
6. Workflow green; `/api/health` 200 (`assisted`, `salesEnabled: false`).
7. Home: new title « SYGMA TV+ — Streaming subscription for TV, mobile & computer », « Data Never Sold », no channel counts.
8. `/fr` → 308 `/` (R1, R2); `/en` → 308 `/`; `/plans` → `/#plans`; unknown URL → branded 404.
9. `sitemap.xml`: 6 URLs (R1) / 15 (R2) / 25 + alternates (R3); `robots.txt` unchanged.
10. Order window opens, price confirmed by the server, then close it **without sending** (or owner test order, D5).
11. Telegram ops bot answers `/stats` (webhook re-registered by the workflow).
12. Search Console: submit the sitemap; inspect `/` (and `/about`, `/help` after R2; `/fr` after R3).
13. Next day: hourly monitor run green; Search Console coverage without new errors.

## 7. Rollback

| Situation | Action | Time |
|---|---|---|
| Any regression after a deploy | Cloudflare dashboard → Workers → `iptv-international` → Deployments → **Rollback** to the previous version (or `npx wrangler rollback`) | < 1 minute, no rebuild |
| Then, keep the source aligned | `git revert` of the released commits on `claude/intelligent-shannon-uwa4fi` (new commits, no force push) — this redeploys the previous code | one workflow run |
| R2 only (About / Help) | Remove `NEXT_PUBLIC_CONTENT_PAGES=live` and redeploy: pages disappear, `/help` redirects to `/#faq` again | one workflow run |
| R3 only (French) | Remove `NEXT_PUBLIC_RELEASED_LANGUAGES=fr` and redeploy: `/fr/*` redirects to English again | one workflow run |

Nothing to roll back in the database, emails, Telegram, prices or payments: the release changes none of them.
Search engines: after a rollback, removed URLs answer 404 or redirect; no manual removal is needed.

## 8. Blockers and decisions for the owner

| # | Decision | Blocks |
|---|---|---|
| D1 | Approve release R1 (English quality and SEO) and its date | R1 |
| D2 | Terms of Service: align the refund wording with the site (7 days from activation / payment confirmation — 6C.1 proposals) or accept the current Terms before publishing About / Help | R2 |
| D3 | Native French review sign-off | R3 |
| D4 | Distribution rights for France, Canada, Switzerland, Luxembourg | R3 |
| D5 | Real order test: staging with a test database, or one owner test order after deployment (no payment, no activation) | Full end-to-end check |
| D6 | French 404 without JavaScript: approve the `worker.ts` fix (7D option E) or accept the current behaviour | R3 (non-blocking if accepted) |
| D7 | Private staging environment (section 5) | Recommended before R2/R3 |
| D8 | Legal pages in French (optional), French transactional emails (optional) | — |
| D9 | `INDEXNOW_ENABLED` (search-engine notification) on or kept as dry run | — |

No technical blocker remains for R1.
