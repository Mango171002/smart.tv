import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Release candidate (8 languages) — configuration safety. Complements prelaunch.test.ts, release-flag.test.ts and
 * staging-config.test.ts (not repeated here) with what they do not check:
 * - the EFFECTIVE values (parsed files, last definition wins, sub-environments), not only a matching line of text;
 * - quoted JSON keys (« "NEXT_PUBLIC_SITE_MODE": » escapes the text pattern of release-flag.test.ts);
 * - the production deployment never picks up the staging settings or switches online requests / sales on;
 * - the staging workflow's safety checks (noindex, contact form, Worker names), their order, the Access check after
 *   the deployment, and that every Cloudflare command targets the staging configuration.
 * NEXT_PUBLIC_RELEASED_LANGUAGES in .env.production is an open release decision: deliberately not checked here.
 */
const ROOT = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

/** JSONC → JSON: removes // and /* *\/ comments outside strings, and trailing commas. */
function jsonc(p: string) {
  const src = read(p);
  let out = '';
  for (let i = 0, inStr = false; i < src.length; i++) {
    const ch = src[i]!;
    if (inStr) {
      out += ch;
      if (ch === '\\') out += src[++i] ?? '';
      else if (ch === '"') inStr = false;
    } else if (ch === '"') {
      inStr = true;
      out += ch;
    } else if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      out += '\n';
    } else if (ch === '/' && src[i + 1] === '*') {
      i = src.indexOf('*/', i + 2) + 1;
    } else out += ch;
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
}

/** dotenv-style file → [key, value] pairs in order (comments and blank lines ignored, optional quotes removed). */
function envPairs(p: string): [string, string][] {
  return read(p)
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const m = l.replace(/^export\s+/, '').match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      expect(m, `${p}: unreadable line « ${l} »`).not.toBeNull();
      return [m![1]!, m![2]!.replace(/\s+#.*$/, '').replace(/^(['"])(.*)\1$/, '$2')] as [string, string];
    });
}
const duplicates = (pairs: [string, string][]) => pairs.map(([k]) => k).filter((k, i, a) => a.indexOf(k) !== i);
/** Workflow without its comment lines (comments describe what it does NOT do). */
const workflow = (p: string) => read(p).split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');

describe('production build settings (.env.production): effective values', () => {
  const pairs = envPairs('.env.production');
  const env = Object.fromEntries(pairs);

  it('every variable is defined once (a later duplicate would silently win)', () => {
    expect(duplicates(pairs)).toEqual([]);
  });

  it('online requests and sales are off, as effectively read by the build', () => {
    expect(env.FEATURE_CONTACT_FORM).toBe('false');
    expect(env.SALES_ENABLED).toBe('false');
  });
});

describe('production Worker (wrangler.jsonc): effective values', () => {
  const prod = jsonc('wrangler.jsonc');
  const text = read('wrangler.jsonc');

  it('runtime variables keep online requests and sales off (parsed, not only a line of text)', () => {
    expect(prod.vars.FEATURE_CONTACT_FORM).toBe('false');
    expect(prod.vars.SALES_ENABLED).toBe('false');
    // A duplicated key would make JSON.parse keep the last one: each is written exactly once.
    expect(text.match(/"FEATURE_CONTACT_FORM"\s*:/g)).toHaveLength(1);
    expect(text.match(/"SALES_ENABLED"\s*:/g)).toHaveLength(1);
  });

  it('no NEXT_PUBLIC_SITE_MODE, even as a quoted JSON key, and no preview mode anywhere', () => {
    expect(prod.vars.NEXT_PUBLIC_SITE_MODE).toBeUndefined();
    expect(text).not.toMatch(/"NEXT_PUBLIC_SITE_MODE"\s*:/);
    expect(text).not.toMatch(/SITE_MODE["']?\s*[:=]\s*["']?preview/i);
  });

  it('no sub-environment that could override the variables or the routes', () => {
    expect(prod.env).toBeUndefined();
  });

  it('is not the staging Worker and has no staging route', () => {
    expect(prod.name).not.toBe('sygma-staging');
    expect(text).not.toContain('staging');
  });
});

describe('production configuration code (next.config.ts, open-next.config.ts)', () => {
  for (const f of ['next.config.ts', 'open-next.config.ts']) {
    it(`${f} never forces the preview mode, online requests or sales on`, () => {
      const text = read(f);
      expect(text, f).not.toMatch(/["']?NEXT_PUBLIC_SITE_MODE["']?\s*:/);
      expect(text, f).not.toMatch(/SITE_MODE["']?\s*[:=]\s*["']preview["']/);
      expect(text, f).not.toMatch(/["']?FEATURE_CONTACT_FORM["']?\s*[:=]\s*["']?true/);
      expect(text, f).not.toMatch(/["']?SALES_ENABLED["']?\s*[:=]\s*["']?true/);
    });
  }
});

describe('production deployment workflow (deploy-cloudflare.yml)', () => {
  const wf = workflow('.github/workflows/deploy-cloudflare.yml');

  it('never applies the staging settings or the staging Worker configuration', () => {
    expect(wf).not.toMatch(/\.env\.staging/);
    expect(wf).not.toMatch(/wrangler\.staging\.jsonc/);
    expect(wf).not.toMatch(/sygma-staging/);
  });

  it('never switches online requests or sales on, and never sets the preview mode', () => {
    expect(wf).not.toMatch(/FEATURE_CONTACT_FORM\s*[:=]\s*["']?true/);
    expect(wf).not.toMatch(/SALES_ENABLED\s*[:=]\s*["']?true/);
    expect(wf).not.toMatch(/--var\s+["']?(FEATURE_CONTACT_FORM|SALES_ENABLED|NEXT_PUBLIC_SITE_MODE)/);
    expect(wf).not.toMatch(/secret put (FEATURE_CONTACT_FORM|SALES_ENABLED)/);
    expect(wf).not.toMatch(/>>?\s*\.env\.production/);
  });

  it('builds with the committed production configuration (no --config override)', () => {
    expect(wf).toMatch(/npx opennextjs-cloudflare build && npx opennextjs-cloudflare deploy/);
    expect(wf).not.toMatch(/opennextjs-cloudflare (build|deploy)[^\n]*--config/);
  });
});

describe('staging settings (.env.staging, wrangler.staging.jsonc): effective values', () => {
  const pairs = envPairs('.env.staging');
  const stg = jsonc('wrangler.staging.jsonc');

  it('every variable of .env.staging is defined once', () => {
    expect(duplicates(pairs)).toEqual([]);
  });

  it('the build and the runtime both keep the contact form off (same value)', () => {
    const env = Object.fromEntries(pairs);
    expect(env.FEATURE_CONTACT_FORM).toBe(stg.vars.FEATURE_CONTACT_FORM);
    expect(env.SALES_ENABLED).toBe(stg.vars.SALES_ENABLED);
    expect(stg.vars.NEXT_PUBLIC_ALLOW_INDEXING ?? 'false').toBe('false');
  });

  it('no sub-environment that could bring back crons, routes, variables or the production Worker', () => {
    expect(stg.env).toBeUndefined();
    expect(Object.keys(stg.triggers)).toEqual(['crons']);
  });
});

describe('staging deployment workflow (deploy-staging.yml): safety checks kept', () => {
  const wf = workflow('.github/workflows/deploy-staging.yml');
  const at = (s: string) => {
    const i = wf.indexOf(s);
    expect(i, `missing in deploy-staging.yml: ${s}`).toBeGreaterThan(0);
    return i;
  };

  it('the noindex check and the other settings checks run BEFORE the build', () => {
    const build = at('opennextjs-cloudflare build');
    for (const check of [
      "grep -qx 'NEXT_PUBLIC_ALLOW_INDEXING=false' .env.staging",
      "grep -qx 'FEATURE_CONTACT_FORM=false' .env.staging",
      `grep -q '"name": "sygma-staging"' wrangler.staging.jsonc`,
      "! grep -q 'iptv-international' wrangler.staging.jsonc",
    ]) {
      expect(at(check), check).toBeLessThan(build);
      // Each check stops the job when it fails.
      expect(wf.slice(at(check)).split('\n')[0], check).toMatch(/\|\| \{ echo "::error::[^"]+"; exit 1; \}$/);
    }
  });

  it('Access is checked again AFTER the deployment, and a public staging is deleted', () => {
    const deploy = at('opennextjs-cloudflare deploy');
    const after = at('Access protection check');
    expect(after).toBeGreaterThan(deploy);
    const step = wf.slice(after);
    expect(step).toMatch(/curl -s -o \/dev\/null -w '%\{http_code\}' https:\/\/staging\.sygmatv\.com\//);
    expect(step).toMatch(/if \[ "\$code" = "200" \]; then[\s\S]*npx wrangler delete --config wrangler\.staging\.jsonc --force[\s\S]*exit 1/);
  });

  it('the Access check before the deployment covers the home, the health check and a language, and fails closed', () => {
    const step = wf.slice(at('Cloudflare Access must already protect'), at('opennextjs-cloudflare build'));
    expect(step).toMatch(/for path in \/ \/api\/health \/fr; do/);
    expect(step).toMatch(/\*\) echo "::error::Access is not protecting[^"]*"; exit 1 ;;/);
  });

  it('every Cloudflare command targets the staging configuration, never wrangler.jsonc', () => {
    const cmds = wf.match(/npx (?:opennextjs-cloudflare|wrangler) [^\n&]*/g) ?? [];
    expect(cmds.length).toBeGreaterThanOrEqual(3);
    for (const cmd of cmds) expect(cmd, cmd).toMatch(/--config wrangler\.staging\.jsonc/);
    expect(wf).not.toMatch(/--config wrangler\.jsonc/);
  });
});
