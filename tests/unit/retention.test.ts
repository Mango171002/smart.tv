import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { countsOnly, retentionPurgeEnabled } from '@/lib/retention';

const rpc = vi.fn();
vi.mock('@/lib/supabase/server', () => ({ getServiceSupabase: () => (process.env.SUPABASE_SECRET_KEY ? { rpc } : null) }));

const ROOT = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const post = (secret?: string) =>
  new Request('https://sygmatv.com/api/cron/retention', { method: 'POST', headers: secret ? { 'x-cron-secret': secret } : {} });

/** What public.retention_purge returns (see supabase/migrations/20261124130000_retention_purge.sql). */
const DB_RESULT = {
  ok: true,
  dry_run: true,
  cutoff: '2025-11-24T12:00:00+00:00',
  max_rows: 500,
  run_id: 7,
  counts: {
    contact_requests_eligible: 4, contact_requests_anonymised: 4, ops_cards_closed: 1, ops_events_reason_cleared: 1,
    orders_eligible: 1, orders_deleted: 1, order_events_deleted: 1,
    kept: { invoice: 1, open_support: 1, retention_hold: 1, marketing_consent: 1, converted_customer: 2 },
  },
};

async function route() {
  vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test');
  const { cronSecret } = await import('@/lib/cron');
  const { POST } = await import('@/app/api/cron/retention/route');
  return { POST, secret: (await cronSecret())! };
}

describe('POST /api/cron/retention', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    rpc.mockReset();
  });

  it('requires the cron secret (503 without the server key, 401 without or with a wrong secret)', async () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', '');
    const { POST } = await import('@/app/api/cron/retention/route');
    expect((await POST(post('x'))).status).toBe(503);
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test');
    expect((await POST(post())).status).toBe(401);
    expect((await POST(post('wrong'))).status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('is a dry run by default (flag absent)', async () => {
    const { POST, secret } = await route();
    rpc.mockResolvedValue({ data: DB_RESULT, error: null });
    const res = await POST(post(secret));
    expect(res.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('retention_purge', { p_dry_run: true, p_max_rows: 500 });
    expect(await res.json()).toEqual({ ok: true, dryRun: true, counts: DB_RESULT.counts });
  });

  it("purges only when RETENTION_PURGE_ENABLED is exactly 'true'", async () => {
    const { POST, secret } = await route();
    rpc.mockResolvedValue({ data: { ...DB_RESULT, dry_run: false }, error: null });
    for (const v of ['false', '1', 'TRUE', 'yes', ' true', '']) {
      vi.stubEnv('RETENTION_PURGE_ENABLED', v);
      expect(retentionPurgeEnabled(), v).toBe(false);
      await POST(post(secret));
      expect(rpc).toHaveBeenLastCalledWith('retention_purge', { p_dry_run: true, p_max_rows: 500 });
    }
    vi.stubEnv('RETENTION_PURGE_ENABLED', 'true');
    const res = await POST(post(secret));
    expect(rpc).toHaveBeenLastCalledWith('retention_purge', { p_dry_run: false, p_max_rows: 500 });
    expect((await res.json()).dryRun).toBe(false);
  });

  it('answers and logs counts only: no id, e-mail, cutoff detail or database message', async () => {
    const { POST, secret } = await route();
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const leaky = { ...DB_RESULT, email: 'victim@example.test', counts: { ...DB_RESULT.counts, ids: ['5f0e…'], note: 'jane@example.test', kept: { ...DB_RESULT.counts.kept, who: 'jane' } } };
    rpc.mockResolvedValueOnce({ data: leaky, error: null });
    const ok = JSON.stringify(await (await POST(post(secret))).json());
    rpc.mockResolvedValueOnce({ data: null, error: { code: '23514', message: 'Failing row contains (jane@example.test, +14155550123)' } });
    const failed = await POST(post(secret));
    expect(failed.status).toBe(502);
    const failedBody = JSON.stringify(await failed.json());
    rpc.mockResolvedValueOnce({ data: { ok: false, code: 'busy' }, error: null });
    const busy = await POST(post(secret));
    expect(busy.status).toBe(409);
    const output = [ok, failedBody, JSON.stringify(await busy.json()), ...log.mock.calls.flat(), ...warn.mock.calls.flat()].map(String).join('\n');
    expect(output).not.toMatch(/@|\+1415|jane|victim|5f0e|sb_secret|Failing row/);
    expect(output).toContain('23514');
    expect(JSON.parse(ok)).toEqual({ ok: true, dryRun: true, counts: DB_RESULT.counts });
  });

  it('countsOnly keeps numeric counters and drops everything else', () => {
    expect(countsOnly({ a: 1, b: 'x', c: [1], d: { e: 2, f: 'y' }, 'Bad-Key': 3 })).toEqual({ a: 1, d: { e: 2 } });
    expect(countsOnly(null)).toEqual({});
    expect(countsOnly([1, 2])).toEqual({});
  });
});

describe('retention: proposal only, nothing enabled or scheduled', () => {
  const files = [
    'wrangler.jsonc', 'worker.ts', ...readdirSync(ROOT).filter((f) => /^\.env/.test(f)),
    ...readdirSync(join(ROOT, '.github/workflows')).map((f) => `.github/workflows/${f}`),
  ];

  it('RETENTION_PURGE_ENABLED is set in no config, env file or workflow', () => {
    for (const f of files) expect(read(f), f).not.toMatch(/RETENTION_PURGE_ENABLED/);
  });

  it('no cron trigger or workflow calls /api/cron/retention', () => {
    for (const f of files) expect(read(f), f).not.toMatch(/cron\/retention/);
  });

  it('the SQL purge is dry-run by default, 12 months minimum, batch-limited and service_role only', () => {
    const m = read('supabase/migrations/20261124130000_retention_purge.sql');
    expect(m).toMatch(/p_dry_run boolean default true/);
    expect(m).toMatch(/p_retention interval default interval '12 months'/);
    expect(m).toMatch(/if v_cutoff > now\(\) - interval '12 months' then\s+raise exception/);
    expect(m).toMatch(/p_max_rows < 1 or p_max_rows > 5000/);
    expect(m).toMatch(/revoke all on function public\.retention_purge\(boolean, integer\) from public, anon, authenticated;/);
    expect(m).toMatch(/grant execute on function public\.retention_purge\(boolean, integer\) to service_role;/);
    expect(m).toMatch(/revoke all on private\.retention_runs from public, anon, authenticated, service_role;/);
    expect(m).not.toMatch(/cron\.schedule|pg_cron/i);
  });
});
