import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGIN = 'http://shop.test';
const post = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`${ORIGIN}${url}`, {
    method: 'POST',
    headers: { host: 'shop.test', origin: ORIGIN, 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${Math.floor(Math.random() * 250)}`, ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

beforeEach(() => {
  vi.resetModules();
  // Unit tests never touch the network: no Supabase configured.
  vi.stubEnv('SUPABASE_URL', '');
  vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', '');
  vi.stubEnv('SUPABASE_SECRET_KEY', '');
  vi.stubEnv('PAYMENT_WEBHOOK_SECRET', '');
});
afterEach(() => vi.unstubAllEnvs());

describe('POST /api/quote', () => {
  it('returns the authoritative quote', async () => {
    const { POST } = await import('@/app/api/quote/route');
    const res = await POST(post('/api/quote', { market: 'US', durationMonths: 12, streams: 1 }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.quote.amountMinor).toBe(7900);
    expect(json.chargeable).toBe(false);
    expect(json.taxes.calculated).toBe(false);
    expect(json.source).toBe('static');
  });
  it('ignores any client-supplied price', async () => {
    const { POST } = await import('@/app/api/quote/route');
    const res = await POST(post('/api/quote', { market: 'US', durationMonths: 12, streams: 1, amountMinor: 1 }));
    expect((await res.json()).quote.amountMinor).toBe(7900);
  });
  it('rejects invalid input, bad JSON and cross-origin calls', async () => {
    const { POST } = await import('@/app/api/quote/route');
    expect((await POST(post('/api/quote', { market: 'US', durationMonths: 7, streams: 1 }))).status).toBe(400);
    expect((await POST(post('/api/quote', '{not json'))).status).toBe(400);
    expect((await POST(post('/api/quote', { market: 'US', durationMonths: 1, streams: 1 }, { origin: 'https://evil.test' }))).status).toBe(403);
  });
  it('rate limits per IP', async () => {
    const { POST } = await import('@/app/api/quote/route');
    const statuses: number[] = [];
    for (let i = 0; i < 62; i++) {
      statuses.push((await POST(post('/api/quote', { market: 'US', durationMonths: 1, streams: 1 }, { 'x-forwarded-for': '203.0.113.9' }))).status);
    }
    expect(statuses.slice(0, 60).every((s) => s === 200)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
  });
});

describe('POST /api/checkout', () => {
  it('is locked while launch blockers remain, even with SALES_ENABLED=true', async () => {
    vi.stubEnv('SALES_ENABLED', 'true');
    const { POST } = await import('@/app/api/checkout/route');
    const res = await POST(post('/api/checkout', { market: 'US', durationMonths: 1, streams: 1 }));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('sales_disabled');
    expect(json.blockers).toContain('no_licensed_territory');
  });
});

describe('POST /api/contact', () => {
  it('answers 503 when the database is not configured', async () => {
    vi.stubEnv('FEATURE_CONTACT_FORM', 'true');
    const { POST } = await import('@/app/api/contact/route');
    const res = await POST(post('/api/contact', { kind: 'launch_waitlist', email: 'a@b.co', locale: 'en', consent: true }));
    expect(res.status).toBe(503);
  });
});

describe('POST /api/webhooks/payment', () => {
  it('is disabled without a secret', async () => {
    const { POST } = await import('@/app/api/webhooks/payment/route');
    expect((await POST(post('/api/webhooks/payment', {}))).status).toBe(503);
  });
  it('rejects unsigned or badly signed events', async () => {
    vi.stubEnv('PAYMENT_WEBHOOK_SECRET', 'whsec_x');
    const { POST } = await import('@/app/api/webhooks/payment/route');
    expect((await POST(post('/api/webhooks/payment', { id: 'evt', type: 't' }))).status).toBe(401);
    expect((await POST(post('/api/webhooks/payment', { id: 'evt', type: 't' }, { 'x-webhook-signature': 't=1,v1=' + '0'.repeat(64) }))).status).toBe(401);
  });
  it('accepts a valid signature but refuses to store without the server key', async () => {
    vi.stubEnv('PAYMENT_WEBHOOK_SECRET', 'whsec_x');
    const { signWebhook } = await import('@/lib/webhook-signature');
    const { POST } = await import('@/app/api/webhooks/payment/route');
    const body = JSON.stringify({ id: 'evt_1', type: 'payment.succeeded' });
    const sig = signWebhook('whsec_x', body, Math.floor(Date.now() / 1000));
    expect((await POST(post('/api/webhooks/payment', body, { 'x-webhook-signature': sig }))).status).toBe(503);
  });
});
