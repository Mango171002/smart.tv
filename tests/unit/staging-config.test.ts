import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Private staging (owner authorisation of 22/11/2026): separate, private, no data written, no production secret. */
const ROOT = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const jsonc = (p: string) => JSON.parse(read(p).replace(/^\s*\/\/.*$/gm, ''));

describe('staging Worker configuration (wrangler.staging.jsonc)', () => {
  const stg = jsonc('wrangler.staging.jsonc');
  const prod = jsonc('wrangler.jsonc');

  it('is a separate Worker on staging.sygmatv.com only', () => {
    expect(stg.name).toBe('sygma-staging');
    expect(stg.name).not.toBe(prod.name);
    // Route on the owner's proxied placeholder record: Access is active before the Worker exists.
    expect(stg.routes).toEqual([{ pattern: 'staging.sygmatv.com/*', zone_name: 'sygmatv.com' }]);
    expect(stg.workers_dev).toBe(false);
    expect(stg.preview_urls).toBe(false);
  });

  it('has no scheduled job and no binding beyond static assets', () => {
    expect(stg.triggers).toEqual({ crons: [] });
    for (const k of ['durable_objects', 'kv_namespaces', 'r2_buckets', 'd1_databases', 'services', 'queues']) expect(stg[k], k).toBeUndefined();
  });

  it('has no database, no contact form, no sales, no secret value', () => {
    expect(stg.vars).toEqual({
      SUPABASE_URL: '', SUPABASE_PUBLISHABLE_KEY: '', SUPABASE_SECRET_KEY: '', FEATURE_CONTACT_FORM: 'false', SALES_ENABLED: 'false',
      TELEGRAM_BOT_TOKEN: '', BREVO_API_KEY: '', PAYMENT_WEBHOOK_SECRET: '',
    });
  });

  it('production configuration is untouched', () => {
    expect(prod.name).toBe('iptv-international');
    expect(prod.routes.map((r: { pattern: string }) => r.pattern)).toEqual(['sygmatv.com', 'www.sygmatv.com']);
  });
});

describe('staging build settings (.env.staging) and workflow', () => {
  const env = Object.fromEntries(read('.env.staging').split('\n').filter((l) => /^[A-Z_]+=/.test(l)).map((l) => l.split(/=(.*)/s).slice(0, 2)));
  // Workflow steps only (comment lines describe what it does NOT do).
  const wf = read('.github/workflows/deploy-staging.yml').split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');

  it('never indexable, French preview only, About / Help on, no database', () => {
    expect(env).toEqual({
      NEXT_PUBLIC_SITE_URL: 'https://staging.sygmatv.com', NEXT_PUBLIC_ALLOW_INDEXING: 'false', NEXT_PUBLIC_CONTENT_PAGES: 'live',
      NEXT_PUBLIC_SITE_MODE: 'preview', SUPABASE_URL: '', SUPABASE_PUBLISHABLE_KEY: '', FEATURE_CONTACT_FORM: 'false', SALES_ENABLED: 'false',
    });
  });

  it('the workflow deploys only staging, only from claude/staging-deploy, with no secret upload, webhook or IndexNow', () => {
    expect(wf).toMatch(/branches: \['claude\/staging-deploy'\]/);
    expect(wf).not.toMatch(/workflow_dispatch|intelligent-shannon|\bmain\b/);
    expect(wf).toMatch(/--config wrangler\.staging\.jsonc/g);
    // Access is checked BEFORE the build and deploy step, and again after it.
    expect(wf.indexOf('Access must already protect')).toBeGreaterThan(0);
    expect(wf.indexOf('Access must already protect')).toBeLessThan(wf.indexOf('opennextjs-cloudflare deploy'));
    for (const re of [/secret put/, /setWebhook/i, /indexnow/i, /TELEGRAM_BOT_TOKEN|BREVO_API_KEY|SUPABASE_SECRET_KEY/]) expect(wf, String(re)).not.toMatch(re);
  });

  it('the production deployment workflow is unchanged (production branch and main only)', () => {
    expect(read('.github/workflows/deploy-cloudflare.yml')).toMatch(/branches: \['claude\/intelligent-shannon-uwa4fi', 'main'\]/);
  });
});
