import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderEmail, TRUSTPILOT_REVIEW_URL } from '@/lib/email/templates';

const rpc = vi.fn();
vi.mock('@/lib/supabase/server', () => ({ getServiceSupabase: () => (process.env.SUPABASE_SECRET_KEY ? { rpc } : null) }));
const send = vi.fn();
vi.mock('@/lib/email/send', () => ({ sendCustomerEmail: (...a: unknown[]) => send(...a) }));

const post = (secret?: string) =>
  new Request('https://sygmatv.com/api/cron/review-invites', { method: 'POST', headers: secret ? { 'x-cron-secret': secret } : {} });

describe('Trustpilot review invitation e-mail', () => {
  it('invites to Trustpilot, no incentive, support contacts', () => {
    const m = renderEmail('review_invite', { name: 'Sara Alaoui' });
    expect(m.subject).toBe('How is your SYGMA TV+ experience?');
    expect(m.html).toContain('Hello Sara,');
    expect(m.html).toContain(`href="${TRUSTPILOT_REVIEW_URL}"`);
    expect(m.html).toContain('Leave a review on Trustpilot');
    expect(m.html).not.toMatch(/discount|free month|gift|reward/i);
    expect(m.text).toContain(`Leave a review on Trustpilot: ${TRUSTPILOT_REVIEW_URL}`);
  });
});

describe('POST /api/cron/review-invites', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    rpc.mockReset();
    send.mockReset();
  });

  it('is disabled without the server key and rejects a wrong secret', async () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', '');
    const { POST } = await import('@/app/api/cron/review-invites/route');
    expect((await POST(post('x'))).status).toBe(503);
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test');
    expect((await POST(post('wrong'))).status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('sends the due invitations and gives failed ones back to the queue', async () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test');
    const { cronSecret } = await import('@/lib/cron');
    const { POST } = await import('@/app/api/cron/review-invites/route');
    rpc.mockImplementation(async (fn: string) =>
      fn === 'ops_review_claim_due'
        ? { data: [{ id: 'a', email: 'a@b.co', name: 'Ana' }, { id: 'b', email: 'b@b.co', name: null }], error: null }
        : { data: null, error: null },
    );
    send.mockResolvedValueOnce('sent').mockResolvedValueOnce('failed');
    const res = await POST(post((await cronSecret())!));
    expect(await res.json()).toEqual({ ok: true, due: 2, sent: 1, failed: 1 });
    expect(send).toHaveBeenCalledWith('review_invite', 'a@b.co', { name: 'Ana' });
    expect(rpc).toHaveBeenCalledWith('ops_review_release', { p_request: 'b' });
  });
});
