import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** A12 / A13 (security report D13-003/004/005/010): workflow hardening (text checks, no YAML dependency). */
const DIR = '.github/workflows';
const raw = (f: string) => readFileSync(`${DIR}/${f}`, 'utf8');
const FILES = readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f));

/** Steps of a workflow as text blocks (from one « - name: / - uses: / - run: » at 6 spaces to the next). */
function stepBlocks(text: string): string[] {
  return text.split(/\n(?= {6}- )/).slice(1).map((b) => b.split(/\n(?= {2}[\w-]+:)/)[0]!);
}

describe('third-party actions are pinned by full commit SHA', () => {
  it.each(FILES)('%s', (f) => {
    const uses = [...raw(f).matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)].map((m) => m[1]!);
    for (const u of uses) if (!u.startsWith('./')) expect(u, `${f}: ${u}`).toMatch(/^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/);
  });
});

describe('Cloudflare token only on the steps that need it (D13-004)', () => {
  for (const f of ['deploy-cloudflare.yml', 'deploy-staging.yml']) {
    it(f, () => {
      const text = raw(f);
      // Never exported to the following steps.
      expect(text).not.toMatch(/CLOUDFLARE_API_TOKEN=[^\n]*>>\s*"?\$GITHUB_ENV/);
      // Not in the job-level env (only CLOUDFLARE_ACCOUNT_ID there).
      expect(text).not.toMatch(/^ {4}env:\n(?: {6}[^\n]*\n)*? {6}CLOUDFLARE_API_TOKEN/m);
      const blocks = stepBlocks(text);
      expect(blocks.length).toBeGreaterThan(5);
      for (const b of blocks) {
        const hasToken = /RAW_TOKEN: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/.test(b);
        const callsCloudflare = /npx opennextjs-cloudflare deploy|npx wrangler|api\.cloudflare\.com/.test(b);
        if (callsCloudflare) expect(hasToken, b.split('\n')[0]).toBe(true);
        if (/run: npm (ci|test)|lighthouse|indexnow\.mjs/.test(b) && !callsCloudflare) expect(hasToken, b.split('\n')[0]).toBe(false);
      }
      expect(text).toMatch(/- run: npm ci --ignore-scripts\n/);
      expect(text).not.toMatch(/- run: npm ci\n/);
    });
  }
});

describe('production deploy waits for the full CI (D13-005); environments; triggers unchanged', () => {
  it('deploy-cloudflare.yml: job « ci » (reusable ci.yml) is required by « deploy » (environment production)', () => {
    const text = raw('deploy-cloudflare.yml');
    expect(text).toMatch(/\n {2}ci:\n(?: {4}#[^\n]*\n)* {4}uses: \.\/\.github\/workflows\/ci\.yml\n/);
    expect(text).toMatch(/\n {2}deploy:\n {4}needs: ci\n {4}runs-on: ubuntu-latest\n {4}environment: production\n/);
    expect(text).toMatch(/\non:\n {2}workflow_dispatch:\n {2}push:\n {4}branches: \['claude\/intelligent-shannon-uwa4fi', 'main'\]\n\n/);
    expect(raw('ci.yml')).toMatch(/\non:\n {2}push:\n {4}branches: \['\*\*'\]\n {2}pull_request:\n(?: {2}#[^\n]*\n)* {2}workflow_call:\n\n/);
  });
  it('deploy-staging.yml: environment staging, trigger unchanged', () => {
    const text = raw('deploy-staging.yml');
    expect(text).toMatch(/\n {2}staging:\n {4}runs-on: ubuntu-latest\n {4}environment: staging\n/);
    expect(text).toMatch(/\non:\n {2}push:\n {4}branches: \['claude\/staging-deploy'\]\n\n/);
  });
});

describe('monitor.yml prints only « healthy » and the failing check names (A12, D13-010)', () => {
  it('no raw dump of the monitor JSON', () => {
    const text = raw('monitor.yml');
    expect(text).not.toMatch(/cat result\.json/);
    expect(text).toMatch(/jq -r '"healthy: [^\n]*select\(\.ok != true\) \| "failing: \\\(\.name\)"\)' result\.json/);
    expect(text).not.toMatch(/result\.json[^\n]*\.detail|\.detail[^\n]*result\.json/);
  });
});
