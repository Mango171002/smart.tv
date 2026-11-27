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

## 2. Code changes of branch `claude/cicd-hardening` (live with the next authorized deployment)

| Change | Why |
|---|---|
| Token check: account endpoint `/accounts/<id>/tokens/verify` first, then `/user/tokens/verify` (production and staging) | An account-owned token was rejected by the user-only check and blocked the deploy |
| Production: trigger and job limited to `claude/intelligent-shannon-uwa4fi` (`main` removed; `if: github.ref == …` on the job) | `main` does not exist: anyone with write access could create it and deploy; a manual run from another branch never deploys |
| Staging: full CI first (`needs: ci`), job limited to `claude/staging-deploy` | Same gate as production |
| Staging fail-safe: a public staging is replaced by a 503 Worker (`wrangler.staging-lockdown.jsonc`) instead of `wrangler delete` | Deleting needs Workers Admin; a token limited to « Edit » on `sygma-staging` can deploy the locked page |
| `monitor.yml`: job in environment `monitor` | Lets `SUPABASE_SECRET_KEY` and `TELEGRAM_BOT_TOKEN` leave the repository secrets; until they are added to `monitor`, the repository secrets keep being used (no interruption). Each hourly run is recorded as a deployment of `monitor` |

The production branch runs the workflow files of the commit it holds: until the next authorized production deploy,
`8797d7c` still has the old `deploy-cloudflare.yml` (no environment). The changes are one commit on top of `10b9643`
(8 languages) and cherry-pick cleanly onto `10eb7fb` (English).

## 3. Owner actions (GitHub and Cloudflare settings cannot be changed from the Claude session)

Order matters: nothing is deleted before its replacement has been used successfully once.

1. **Environment `production`** → *Deployment branches*: « Selected branches » → `claude/intelligent-shannon-uwa4fi`
   only (remove `main`). Add yourself as *Required reviewer*.
2. **Environment `staging`** → deployment branch `claude/staging-deploy` only (already done per owner).
3. **Environment `monitor`** (create it) → deployment branch `claude/intelligent-shannon-uwa4fi` only, no reviewer
   (the hourly schedule must not wait). Add `SUPABASE_SECRET_KEY` and `TELEGRAM_BOT_TOKEN` (same values).
4. **Check the secret names**: each environment's token is named exactly `CLOUDFLARE_API_TOKEN`; `production` also has
   `BREVO_API_KEY`, `TELEGRAM_BOT_TOKEN`, `SUPABASE_SECRET_KEY`.
5. **Cloudflare tokens**: production = Workers Scripts Edit (account `9a7bb862…`, product level: Custom Domains do not
   support per-Worker roles) + Zone `sygmatv.com` Workers Routes Edit; staging = Workers Edit on `sygma-staging` only
   + Zone `sygmatv.com` Workers Routes Edit. Nothing else (no DNS, KV, R2, D1, Access, WAF).
6. **Branch ruleset** (*Settings → Rules → Rulesets*) on `claude/intelligent-shannon-uwa4fi` and `claude/staging-deploy`:
   block force-push and deletion; on `refs/heads/main`: restrict creation.
7. **Settings → Actions → General**: approval required for fork pull-request workflows; *Workflow permissions* « Read
   repository contents and packages permissions ».
8. **Delete repository-level secrets, only after their replacement ran green**:
   - `PREVIEW_PASSWORD`: now (only the retired preview workflow uses it).
   - `CLOUDFLARE_API_TOKEN`, `BREVO_API_KEY`: after the first green production deploy from the new workflow
     (deleting `CLOUDFLARE_API_TOKEN` also disables the old deploy workflow still present on 38 branches).
   - `SUPABASE_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`: after the first green Monitor run that uses environment `monitor`
     (*Actions → Monitor*, run header « monitor » environment), which happens once `monitor.yml` reaches the
     production branch.

## 4. Record

Done by / date: ____________ · production rules ☐ · monitor env ☐ · token scopes ☐ · ruleset ☐ · Actions settings ☐ · repository secrets deleted ☐
