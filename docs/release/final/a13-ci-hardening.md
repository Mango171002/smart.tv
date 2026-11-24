# A13 — CI / secrets hardening: what changed, and the owner's GitHub actions

Security report D13-003, D13-004, D13-005, D13-010. The workflow changes are committed; the GitHub settings below
can only be changed by the repository owner (engineering has no access and made no GitHub API call).

## 1. Done in the workflows

| Item | Change | File |
|---|---|---|
| D13-004 token exposure | `CLOUDFLARE_API_TOKEN` is no longer written to `$GITHUB_ENV`. It is given (`env:` on the step, normalised inside the step) only to: token verification, « Build and deploy », the Brevo and Telegram secret uploads (`wrangler secret put`); staging: token check, « Build and deploy », the Access protection check (`wrangler delete`). `npm ci`, `npm test`, IndexNow, Lighthouse no longer see it. | `deploy-cloudflare.yml`, `deploy-staging.yml` |
| D13-004 install scripts | `npm ci --ignore-scripts` in both deploy workflows. Only three packages in the lock have install scripts: `esbuild` and `workerd` (they resolve their prebuilt `@esbuild/linux-x64` / `@cloudflare/workerd-linux-64` packages without the postinstall; the OpenNext build uses the esbuild JS API, which resolves the platform package directly) and `fsevents` (macOS only). `ci.yml` keeps a normal `npm ci` (no secret there). | same |
| D13-004 pinning | `actions/checkout@11d5960a326750d5838078e36cf38b85af677262` (v4.4.0) and `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020` (v4.4.0) in every workflow (SHAs read with `git ls-remote`; `v4` points to the same commits today). | all workflows |
| D13-005 deploy gate | The production workflow first runs the whole CI (job `ci` → `./.github/workflows/ci.yml`: lint, typecheck, unit tests, build, E2E, Cloudflare bundle, database tests); `deploy` has `needs: ci`. `ci.yml` gained a `workflow_call` trigger; its `push` / `pull_request` triggers are unchanged. A deploy now takes as long as the CI plus the deploy. | `deploy-cloudflare.yml`, `ci.yml` |
| D13-003 environments | `environment: production` on the deploy job, `environment: staging` on the staging job. If the environment does not exist, GitHub creates it automatically on the first run, without protection rules, so runs are not broken. Repository-level secrets stay readable from these jobs until they are moved. | same |
| D13-010 public logs | The monitor prints only `healthy: true/false` and `failing: <check name>` lines, never the JSON details. | `monitor.yml` |

Triggers and branch filters are unchanged (`claude/intelligent-shannon-uwa4fi`, `main`; `claude/staging-deploy`;
`**` for CI). Tests: `tests/unit/ci-hardening.test.ts`.

## 2. Owner actions in GitHub (in this order)

1. **Settings → Environments → `production`** (exists after the first deploy run, or create it):
   - *Deployment branches and tags*: « Selected branches » → `claude/intelligent-shannon-uwa4fi`, `main`.
   - Optional: *Required reviewers* (owner) — every production deploy then waits for an approval click.
2. **Settings → Environments → `staging`**: deployment branch `claude/staging-deploy` only.
3. **Cloudflare (dashboard): a separate token for staging**, limited to the `sygma-staging` Worker if the plan allows
   per-Worker scoping, otherwise to « Workers Scripts: Edit » on the account; add it as the `CLOUDFLARE_API_TOKEN`
   secret of the **staging** environment. Do not reuse the production token.
4. **Move the production secrets** into the `production` environment: `CLOUDFLARE_API_TOKEN`, `BREVO_API_KEY`,
   `TELEGRAM_BOT_TOKEN`, `SUPABASE_SECRET_KEY` (*Environment secrets → Add secret*, same names), then delete the
   repository-level copies (*Settings → Secrets and variables → Actions*).
   - **Before deleting** `SUPABASE_SECRET_KEY` and `TELEGRAM_BOT_TOKEN` at repository level: `monitor.yml` (hourly)
     reads them and has no `environment:` (adding one would record a « deployment » every hour). Either keep those two
     at repository level as well, or ask engineering to add `environment: production` to the monitor job.
5. **Branch protection / rulesets** for `main` and `claude/intelligent-shannon-uwa4fi`: no force-push, no deletion,
   require the « CI » checks (`app`, `cloudflare-bundle`, `database`) on pull requests.
6. **Settings → Actions → General**: « Require approval for all external contributors » for fork pull requests, and
   *Workflow permissions* « Read repository contents ».
7. Run « Deploy to Cloudflare » once (*Actions → Run workflow*) after the moves and check the run is green.

## 3. Record

Done by / date: ____________ · Environments created ☐ · staging token ☐ · secrets moved ☐ · branch rules ☐
