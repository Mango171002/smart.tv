# Private staging — proposal for approval (22 November 2026)

**Nothing has been created.** No Cloudflare resource, DNS record, secret, Access policy or deployment exists yet.
Branch `claude/staging-setup` (from the release candidate `a97f6a4`) holds the configuration below; it deploys
nothing by itself.

## 1. What would exist after approval

| Resource | Created by | Details |
|---|---|---|
| Cloudflare Access application « SYGMA TV+ staging » | Owner, Zero Trust dashboard (the deployment token has no Access permission) | Self-hosted, domain `staging.sygmatv.com` (all paths), policy **Allow — Emails: the owner's address(es)**, login method **One-time PIN**, session 24 h |
| Worker `sygma-staging` | Workflow `deploy-staging.yml` (existing `CLOUDFLARE_API_TOKEN`) | Separate script; production Worker `iptv-international` untouched |
| Custom domain `staging.sygmatv.com` | Same deployment (Workers custom domain) | One proxied DNS record managed by Cloudflare; certificate issued automatically |
| Git branch `claude/staging-deploy` | Push of the approved commit | Pushing to it = deploying staging (never production) |

Not created: no KV, R2, D1, Durable Object, queue, cron trigger, secret, Supabase project or database object,
Telegram webhook, email sender, IndexNow ping. The production workflow, Worker, routes, secrets and branch are unchanged.

## 2. Exact configuration

`wrangler.staging.jsonc` (standalone, not an environment of the production file):

- `name: "sygma-staging"`, `routes: [{ pattern: "staging.sygmatv.com", custom_domain: true }]`,
  `workers_dev: false`, `preview_urls: false`, `triggers: { crons: [] }`, assets binding only;
- runtime variables all set explicitly (so nothing is filled from `.env.production`):
  `SUPABASE_URL = ""`, `SUPABASE_PUBLISHABLE_KEY = ""`, `SUPABASE_SECRET_KEY = ""`, `FEATURE_CONTACT_FORM = "false"`,
  `SALES_ENABLED = "false"`, `TELEGRAM_BOT_TOKEN = ""`, `BREVO_API_KEY = ""`, `PAYMENT_WEBHOOK_SECRET = ""`.

`.env.staging` (build settings, copied over `.env.production` inside the workflow runner only):

| Setting | Value | Effect |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://staging.sygmatv.com` | Canonical URLs and sitemap on the staging host |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `false` | `robots.txt` `Disallow: /`; `noindex, nofollow` meta on every page; `X-Robots-Tag: noindex, nofollow` header on every URL |
| `NEXT_PUBLIC_CONTENT_PAGES` | `live` | About us + Help center as they would be published |
| `NEXT_PUBLIC_SITE_MODE` | `preview` | French built in preview (noindex); `NEXT_PUBLIC_RELEASED_LANGUAGES` not set (French never released) |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | empty | No database connection at all (read or write) |
| `FEATURE_CONTACT_FORM` / `SALES_ENABLED` | `false` / `false` | Order, trial and support submissions refused (HTTP 503); checkout locked (403) |

`.github/workflows/deploy-staging.yml`: runs **only** on a push to `claude/staging-deploy`; checks the staging settings
(not indexable, contact form off, no language release, Worker name), runs the unit tests, builds and deploys with
`--config wrangler.staging.jsonc`, then requests `https://staging.sygmatv.com/` without login: **if it answers 200
(Access missing), the staging Worker is deleted immediately and the run fails.** It uploads no secret, registers no
webhook and pings no search engine.

Code change shared with production: one line in `next.config.ts` adds the `X-Robots-Tag` header **only when indexing is
not allowed**; production builds (`NEXT_PUBLIC_ALLOW_INDEXING=true`) are byte-identical (232 URLs compared, CSS identical).

## 3. Data, secrets, notifications

| Concern | Guarantee |
|---|---|
| Production database | Not connected: empty URL and key (verified: health `priceSource: static`); prices from the built-in list, **identical to the database prices on all 48 plan / duration / device combinations** (compared) |
| Orders, trial and support requests | Refused before any storage: `POST /api/contact` → 503 `contact_unavailable`; the window shows « Ordering is temporarily unavailable » |
| Payments | `POST /api/checkout` → 403 `sales_disabled`; payment webhook → 503 `webhooks_not_configured` |
| Emails, Telegram, activations | No Brevo key, no Telegram token, no Supabase secret: nothing can be sent or changed; Telegram webhook → 503; cron routes → 503 |
| Production secrets | None uploaded to `sygma-staging`; the workflow uses only the existing deployment token, already used by production |
| Analytics | Google Analytics, Clarity and Tag Manager run only on `sygmatv.com` / `www` (host check in the code): never on staging. Cloudflare Web Analytics, if enabled for the zone, may count staging visits under the `staging` hostname (filterable) |
| Search engines | Behind Access (login wall) + robots `Disallow: /` + noindex meta and header |

## 4. Costs

| Item | Cost |
|---|---|
| Worker `sygma-staging` | $0 extra: one more script (limits: 100 on Workers Free, 500 on Paid); a few hundred test requests a day, far below the included requests (100,000/day Free; 10 million/month on the $5/month Paid plan) |
| Custom domain, DNS record, TLS certificate | $0 |
| Cloudflare Access (Zero Trust) | $0 on the Zero Trust Free plan (up to 50 users); Cloudflare may ask to confirm the Free plan when Zero Trust is first opened |
| Workers Logs (observability) | Within the included volume for this traffic |
| GitHub Actions | About 6 minutes of runner time per staging deployment (counted in the repository's included minutes) |
| Supabase, Brevo, Telegram | None used |

## 5. Order of operations (after written approval)

1. Owner: create the Access application (section 1) and send a test login request to confirm the one-time PIN arrives.
2. Push the approved staging commit to `claude/staging-deploy` (starts `deploy-staging.yml`; production not involved).
3. Workflow: build, deploy, then the Access check (non-200 expected; otherwise automatic deletion).
4. Owner: open `https://staging.sygmatv.com`, log in with the one-time PIN, run the test matrix (section 7).
5. Optional automated verification behind Access: an Access **service token** (free) saved as two GitHub secrets would let
   a workflow run the crawler and E2E suite against staging; not part of this proposal unless approved.

Teardown at any time: `npx wrangler delete --config wrangler.staging.jsonc` (removes the Worker and its custom domain),
delete the Access application, delete the branch `claude/staging-deploy`.

## 6. Pre-verification already done (local Cloudflare runtime, staging build)

Built with OpenNext and the staging configuration, run with `wrangler dev` (workerd, local only, no Cloudflare account):

| Check | Result |
|---|---|
| Worker environment | Only staging values bundled (no production URL or key); health `{"mode":"assisted","salesEnabled":false,"priceSource":"static"}` |
| 27 pages (16 English, 11 French) | 200, `noindex` meta and `X-Robots-Tag` on each, correct `lang`, canonical on the staging host, no hreflang |
| `robots.txt` / `sitemap.xml` | `Disallow: /` / 15 English URLs, no French URL |
| Redirects | `/en` → `/`, `/plans` → `/#plans`, `/fr/legal/privacy` → `/legal/privacy`, `/fr/plans` → `/fr#plans`; `/nope`, `/fr/nope`, `/de` → 404; `/help` 200 |
| APIs | contact 503, checkout 403, quote 200 (static prices), cron 503, Telegram webhook 503, payment webhook 503 |
| Browser, desktop 1366 px and iPhone 12 | 6 pages each (EN and FR): no horizontal overflow, 0 axe violation (WCAG 2.1 AA); order window in French works up to the final step, submission refused with « La commande est temporairement indisponible. » |
| External requests from the browser | None |
| Unit tests | 191 / 191 (7 new staging safety tests) |

## 7. Test matrix on the private URL (owner, after deployment)

Devices: iPhone (Safari), Android phone (Chrome; Samsung Internet if available), iPad (Safari), Windows (Chrome, Edge),
macOS (Safari, Firefox). Pages: `/`, `/about`, `/help`, the 7 help topics, the 5 legal pages, `/blog`, a 404; French:
`/fr`, `/fr/about`, `/fr/help`, the 7 topics, `/fr/blog`, `/fr/nope`. For each: layout and text, menu, links, plan
simulator, order / trial / support windows up to the refused submission, cookie banner, keyboard navigation, 200 % zoom.
French wording: review list in `docs/seo/phase7/lot-7b-french.md` (section 5) and `lot-7d-quality.md` (section 4).
