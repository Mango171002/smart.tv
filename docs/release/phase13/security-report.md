# Phase 13 — Security, reliability and privacy audit (agent D)

Release candidate audited: `5c3635f` (branch `claude/p13-sec`). Date: 23/11/2026.
Evidence: repository files, a local production-like build (`npm run build` + `next start`), read-only GETs to
https://sygmatv.com, unauthenticated GETs to https://staging.sygmatv.com. No production write, no Supabase / Telegram /
Brevo call, no secret printed. Cookie / tracking details (D9): `d9-cookie-policy-draft.md` (same folder).

## 1. Findings

Severity: Critical (exploitable now / consent breach) · High · Medium · Low · Info.

| ID | Sev. | Area | Finding and evidence | Status / owner |
|---|---|---|---|---|
| D13-001 | **High** | Rollback | `release-readiness.md` §7 says « Rollback … (or `npx wrangler rollback`) ». Without a version ID, `wrangler rollback` goes to the version **before the latest**. The deploy workflow creates up to 3 more versions after the code deploy (`wrangler secret put` BREVO_API_KEY, TELEGRAM_BOT_TOKEN, SUPABASE_SECRET_KEY — each « creates a new version and deploys it immediately », Cloudflare docs). A default rollback therefore lands on a version with the **same new code** (only a secret differs) and fixes nothing. | Procedure corrected in §4 below (always roll back to the **recorded version ID**). Owner/coordinator: update `release-readiness.md` §6 step 3 and §7 (not my file). |
| D13-002 | **High** | Privacy (D9), documentation | Cookie policy: « No advertising cookie is used at the moment. » Measured: after « Accept all » / Marketing, GTM `GTM-MGCLXP5L` runs Google Ads AW-18577285546 (conversion + **remarketing**): `_gcl_au` (90 d), `_gcl_ls` (localStorage), `IDE`/`test_cookie` on doubleclick.net. Table also omits Clarity `CLID`/`MUID`/`_cltk`; Cloudflare Web Analytics (request for every visitor, cookie-less) is not mentioned. Banner names Meta and TikTok (not configured) and calls Marketing « measurement » only (all 8 languages). Consent gating itself is correct (nothing before a choice, nothing after « Decline all »), so this is a transparency defect, not a technical one. | Not changed (legal text). Draft for owner/lawyer: `d9-cookie-policy-draft.md`. Option without deploy: disable ad personalisation/remarketing in Google Ads / GTM. |
| D13-003 | Medium | CI/CD secrets | Repository is **public**; all secrets are repository-level (`CLOUDFLARE_API_TOKEN`, `SUPABASE_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`, `BREVO_API_KEY`). Any workflow file on any branch pushed by a collaborator (including automated agent sessions pushing `claude/*` branches) can read them; no GitHub Environment, no required reviewer. The staging workflow uses the same Cloudflare token, which can also deploy or delete the production Worker. | Owner: create Environments `production` (deployment branches: `claude/intelligent-shannon-uwa4fi`, `main`) and `staging` (`claude/staging-deploy`), move the secrets there and add `environment:` to the jobs; give staging its own token; protect the deploy branches. |
| D13-004 | Medium | CI/CD supply chain | `deploy-cloudflare.yml` and `deploy-staging.yml` write the Cloudflare token to `$GITHUB_ENV` **before `npm ci`**: every later step (dependency install scripts, tests, IndexNow script, `npm i lighthouse`) has it in its environment. Actions are pinned by tag (`@v4`), not by commit SHA. | Owner: prepare the token after `npm ci` and pass it only to the deploy/secret steps (`env:` on the step), or `npm ci --ignore-scripts`; pin actions by SHA. |
| D13-005 | Medium | Deploy gate | Production deploy runs only `npm test` before deploying. Lint, typecheck, E2E and the Cloudflare bundle build run in `ci.yml`, which the deploy does not wait for. Smoke test / Lighthouse failures after the deploy do not roll back. | Owner: require CI success first (branch protection status checks, or `workflow_run`/`needs`); release checklist §6 step 2 covers it manually today. |
| D13-006 | Low | Consent withdrawal (D9) | Withdrawing consent removed the first-party cookies but left **`_gcl_ls`** (Google Ads, localStorage) and **`_cltk`** (Clarity, sessionStorage) — measured on the local build. | **Fixed** (`src/lib/analytics.ts`: storage of the withdrawn category removed before the reload; never `sygma_*`). Unit + E2E tests. |
| D13-007 | Low | Headers | Static files served by Cloudflare Workers Assets (`/_next/static/*`, `/images/*`, `/videos/*`, `/brand/*`, favicon) have **no** `X-Content-Type-Options`, HSTS, `X-Frame-Options`, `Referrer-Policy` (live: `curl -I https://sygmatv.com/brand/sygma-logo.svg`). `next.config.ts` headers only apply to Worker responses. | **Fixed** in `public/_headers` (`/*` rule, same values as `next.config.ts`; no Cache-Control change). Effective after the next deploy; unit test checks the values match. |
| D13-008 | Low | API robustness | `readJson` buffered the whole body (`req.text()`) before checking the size limit (contact 8 KB, quote 2 KB, checkout 4 KB). | **Fixed** (`src/lib/http.ts`): Content-Length checked first, streamed body cancelled past 4× the limit; the character limit and the `400 invalid_json` contract are unchanged. Unit tests. |
| D13-009 | Medium | Rate limiting | `src/lib/rate-limit.ts` is in-memory per isolate: on Workers, requests are spread over many isolates and locations, so « 5 per 10 min » (contact) and « 60 per min » (quote) are not global. The database throttles contact inserts again (`PT429`). Contact is closed today (`FEATURE_CONTACT_FORM=false`). | Owner, before reopening orders: Cloudflare WAF rate-limiting rule on `POST /api/contact` and `/api/quote` (e.g. 10 / min / IP). |
| D13-010 | Low | Monitoring / logs | `monitor.yml` prints the full `/api/cron/monitor` JSON (`cat result.json`) into **public** Actions logs: check names and details (Brevo credit count, blocked e-mail count, Telegram webhook last error). No secret, no personal data. | Owner: print only `healthy` and the failing check names. |
| D13-011 | Low | CSP | `script-src 'unsafe-inline'` (needed: statically pre-rendered Next.js inline scripts, no nonce possible on static pages); allow-list already includes Meta/TikTok/Google Ads script hosts not used today; `img-src https:` (owner decision 17/11); no CSP violation reporting. `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` present. | Accepted risk. Later: hashes for the inline scripts, remove unused hosts if phase 2 is dropped, `report-to` endpoint. |
| D13-012 | Low | Headers | No `Cross-Origin-Opener-Policy`. `same-origin-allow-popups` would isolate the window, but may break GTM Tag Assistant preview (opened from tagassistant.google.com). | Owner decision; test with Tag Assistant first. |
| D13-013 | Info | Secrets | Scan of RC history (302 commits) and all refs (322): no Supabase secret / JWT, Brevo, Telegram, GitHub, AWS, Stripe or private keys. Only the **publishable** Supabase key (`wrangler.jsonc`, `.env.production`, `.env.example`) and test placeholders. `.env.example/.production/.staging`: non-secret values only, secret names empty. Client bundles (`.next/static`): no secret name or value — not even the publishable key (Supabase is server-only). `public/`: IndexNow key file (public by design). | OK |
| D13-014 | Info | API | `/api/contact` 503 `contact_unavailable` before any parsing/storage when the flag is off (cross-origin 403 first); `/api/checkout` 403 `sales_disabled` (launch gate); payment webhook 503 without secret, 401 bad HMAC (5 min tolerance, timing-safe); Telegram webhook 503 without token, 401 without the derived secret header, 64 KB cap; cron routes 503 unconfigured / 401 wrong secret (timing-safe); GET on POST routes 405; OPTIONS 204 without `Access-Control-Allow-Origin` (no CORS); JSON + same-origin required (CSRF); `Cache-Control: no-store` + `noindex` on `/api/*`; errors are codes only (no stack traces); logs contain error codes/messages, never e-mails, names or phones. `/api/health` exposes only `status`, `mode`, `salesEnabled`, `priceSource`. | OK |
| D13-015 | Info | API | `checkSameOrigin` prefers `x-forwarded-host` over `host`. Not exploitable from a browser (custom header + JSON content type both need a CORS preflight that is never granted). | Keep; note for a future proxy. |
| D13-016 | Info | Secrets design | Cron secret = SHA-256(`SUPABASE_SECRET_KEY:sygma-cron`), Telegram webhook secret = SHA-256(bot token + salt). Rotating a key rotates its derived secret automatically (re-run the deploy workflow for the Telegram webhook). | OK |
| D13-017 | Info | Audit side effect | During the first D9 run on the local build, the Google Ads remarketing endpoint (`googleads.g.doubleclick.net/pagead/viewthroughconversion/18577285546`) responds as a script and was let through twice (page URL `http://127.0.0.1:3533/`, headless Chrome, no personal data). No GA4/Clarity hit was delivered. The allow-list was then restricted to library files only. | For information (Google Ads may show 2 test remarketing hits from 23/11/2026 ≈ 21:50 UTC). |

Security headers on Worker responses (live and local, identical): CSP as above, `Strict-Transport-Security:
max-age=63072000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(),
geolocation=(), payment=()`. `http://` → 301 `https://`; `www` → 308 apex. HTML pages are edge-cached
(`s-maxage`) — they contain no personal data; the 404 page and `/api/*` are `no-store`.

## 2. Production / staging isolation

| Item | Production (`wrangler.jsonc`) | Staging (`wrangler.staging.jsonc`) |
|---|---|---|
| Worker name | `iptv-international` | `sygma-staging` (workflow refuses `iptv-international` in the staging file) |
| Routes | custom domains `sygmatv.com`, `www.sygmatv.com` | route `staging.sygmatv.com/*`, Cloudflare Access (live check: unauthenticated `/` and `/api/health` → 302 to `*.cloudflareaccess.com`) |
| `workers_dev` / preview URLs | off / off | off / off |
| Crons | `17 * * * *` (review invitations) | none |
| Vars | Supabase URL + **publishable** key, `FEATURE_CONTACT_FORM=false`, `SALES_ENABLED=false` | every var set and **empty** (Supabase, Telegram, Brevo, payment), contact off, sales off — a secret with the same name could not be added (name clash) |
| Secrets | set by the deploy workflow (`wrangler secret put`) | none |
| Compatibility | `2026-11-01`, `nodejs_compat`, `global_fetch_strictly_public` | same |
| Build settings | `.env.production` (indexable) | `.env.staging` copied in the runner only (noindex, preview French, no DB) |
| Deploy trigger | push to `claude/intelligent-shannon-uwa4fi` or `main`, or manual | push to `claude/staging-deploy` only |
| Guards | token verified; concurrency `cloudflare-deploy` | settings checks, Access must protect 3 paths **before** deploy, Worker deleted if `/` answers 200 after deploy; concurrency `cloudflare-staging` |
| Analytics | runs (hosts `sygmatv.com`, `www.sygmatv.com`) | never (host not allowed) |

Shared: the Cloudflare account and **one** API token (D13-003). Otherwise isolated.

## 3. Changes in this branch

- `public/_headers`: security headers for static assets (D13-007).
- `src/lib/http.ts`: bounded body reading in `readJson` (D13-008).
- `src/lib/analytics.ts`: withdrawal also removes the withdrawn category's browser storage (D13-006).
- Tests: `tests/unit/security-hardening.test.ts` (11), `tests/e2e/consent-storage.spec.ts` (2 × 2 projects).
- Docs: this report, `d9-cookie-policy-draft.md`.

Not changed (by rule): legal texts, banner wording, launch gate, flags, prices, payments, Supabase, Telegram/Brevo
logic, production secrets/vars, workflows.

## 4. Rollback procedure (production Worker `iptv-international`)

Before every deploy (record in the release notes):
1. `npx wrangler deployments list --name iptv-international` (or dashboard → Workers & Pages → `iptv-international` →
   Deployments) — write down the **active version ID**, its date, and the git commit it was built from.
2. Save `curl -s https://sygmatv.com/api/health`, `/robots.txt`, `/sitemap.xml`.

Rollback (< 1 minute, no rebuild):
3. Dashboard → Workers & Pages → `iptv-international` → Deployments → ⋯ on the **recorded version** → Rollback, **or**
   `CLOUDFLARE_API_TOKEN=… npx wrangler rollback <RECORDED_VERSION_ID> --name iptv-international --message "rollback to <commit>"`.
   Never run `wrangler rollback` without a version ID (D13-001).
4. Check: `curl -s https://sygmatv.com/api/health` (`status: ok`, expected `mode`), home page 200 and the expected
   content, `/robots.txt`, `/sitemap.xml` as saved in step 2.
5. Keep the source aligned: `git revert` of the released commits on the deploy branch (new commits, no force push). The
   workflow then redeploys the previous code and re-puts the secrets.

Notes: a version carries its own code, vars and secret values; routes, custom domains and cron triggers are not part
of the rollback (unchanged here). Pages loaded before the rollback may request newer static files for a while (version
skew) — a hard reload fixes it. Nothing to roll back in Supabase, e-mails, Telegram or IndexNow. Only the last 100
versions can be restored.

Staging: no rollback needed — redeploy the branch, or `npx wrangler delete --config wrangler.staging.jsonc`.

## 5. Monitoring

- `monitor.yml` (GitHub, hourly at :41): home + `/api/health` (3 tries), then `POST /api/cron/monitor` with the derived
  cron secret → database (service key + price source), Brevo (key / IP / credits / blocked), Telegram webhook. Alerts
  to the Telegram « alertes » topic while broken, daily summary at 09:00; a failed run also e-mails the repository owner.
- Deploy workflow: smoke test (`/api/health`, home), Lighthouse gates (no automatic rollback — D13-005).
- Cloudflare Workers observability is enabled on both Workers (logs and metrics in the dashboard).
- Gaps (owner): no alert on Worker error rate / 5xx (Cloudflare notification), no CSP reporting (D13-011), public log
  output of the monitor JSON (D13-010).

## 6. Validation of this branch

- `tsc --noEmit` clean; `eslint .` 0 errors (3 pre-existing warnings, unchanged); `vitest run` 33 files, 542 tests passed.
- Production-like build (`rm -rf .next && npm run -s build`) + `E2E_PORT=3533 npx playwright test --workers=2`:
  202 passed, 140 skipped, 0 failed (includes the 4 new consent-storage tests).
- Orders-open preview build (`FEATURE_CONTACT_FORM=true NEXT_PUBLIC_SITE_MODE=preview NEXT_PUBLIC_CONTENT_PAGES=preview`,
  Supabase pointed at an unreachable local address so no request can be stored) + `E2E_ORDERS_OPEN=true
  E2E_SITE_MODE=preview E2E_CONTENT_PAGES=preview`: 656 passed, 392 skipped, 2 failed on 30 s timeouts under machine
  load (language-switcher nl header, order-summary 320 px); both passed when re-run alone (9/9).
- OpenNext bundle + `wrangler dev --local`: static files now carry the four headers; Worker responses unchanged and
  not duplicated.
