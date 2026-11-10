import { describe, expect, it } from 'vitest';
import { getLaunchBlockers, isSalesEnabled } from '@/config/launch-gate';
import { siteConfig } from '@/config/site';
import { checkSameOrigin } from '@/lib/http';
import { createRateLimiter } from '@/lib/rate-limit';
import { contactSchema, planSelectionSchema } from '@/lib/validation';
import { signWebhook, verifyWebhookSignature } from '@/lib/webhook-signature';

describe('launch gate', () => {
  it('blocks sales with the current (unresolved) configuration, even if the flag is on', () => {
    expect(isSalesEnabled(siteConfig, 'true')).toBe(false);
    expect(getLaunchBlockers(siteConfig, 'true')).toContain('no_licensed_territory');
  });

  const resolved = {
    brandIsPlaceholder: false,
    domain: 'example.com',
    licensedTerritories: ['US'],
    legalEntity: 'Example Ltd',
    legalAddress: '1 Example St',
    supportEmail: 'help@example.com',
    paymentProvider: 'provider',
    refundPolicy: 'v1',
    activationProvider: 'provider',
    taxRules: {} as never,
  };

  it('requires the explicit SALES_ENABLED flag even when everything else is resolved', () => {
    expect(getLaunchBlockers(resolved, undefined)).toEqual(['sales_flag_off']);
    expect(isSalesEnabled(resolved, 'true')).toBe(true);
  });

  it('lists every missing item individually', () => {
    expect(getLaunchBlockers({ ...resolved, licensedTerritories: [], supportEmail: null }, 'true')).toEqual([
      'no_licensed_territory',
      'support_contact_missing',
    ]);
  });
});

describe('webhook signatures', () => {
  const secret = 'whsec_test_secret';
  const body = '{"id":"evt_1","type":"payment.succeeded"}';
  const now = 1_800_000_000;

  it('accepts a valid signature', () => {
    expect(verifyWebhookSignature(secret, body, signWebhook(secret, body, now), { now })).toBe(true);
  });
  it('rejects a tampered body', () => {
    expect(verifyWebhookSignature(secret, body + ' ', signWebhook(secret, body, now), { now })).toBe(false);
  });
  it('rejects a wrong secret', () => {
    expect(verifyWebhookSignature(secret, body, signWebhook('other', body, now), { now })).toBe(false);
  });
  it('rejects replays outside the tolerance window', () => {
    expect(verifyWebhookSignature(secret, body, signWebhook(secret, body, now - 600), { now })).toBe(false);
  });
  it('rejects malformed headers', () => {
    for (const h of [null, '', 'garbage', 't=abc,v1=00', `t=${now},v1=zz`]) {
      expect(verifyWebhookSignature(secret, body, h, { now })).toBe(false);
    }
  });
  it('rejects when no secret is configured', () => {
    expect(verifyWebhookSignature('', body, signWebhook('', body, now), { now })).toBe(false);
  });
});

describe('rate limiter', () => {
  it('allows up to the limit then blocks with Retry-After, per key', () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(rl.check('a', 0).allowed).toBe(true);
    expect(rl.check('a', 10).allowed).toBe(true);
    const blocked = rl.check('a', 20);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(rl.check('b', 20).allowed).toBe(true);
    expect(rl.check('a', 1500).allowed).toBe(true); // window slid
  });
});

describe('same-origin (CSRF) check', () => {
  const req = (headers: Record<string, string>) =>
    new Request('http://shop.test/api/quote', { method: 'POST', headers: { host: 'shop.test', ...headers } });

  it('accepts same-origin JSON requests', () => {
    expect(checkSameOrigin(req({ 'content-type': 'application/json', origin: 'http://shop.test' }))).toBe(true);
  });
  it('rejects cross-site origins', () => {
    expect(checkSameOrigin(req({ 'content-type': 'application/json', origin: 'https://evil.test' }))).toBe(false);
    expect(
      checkSameOrigin(req({ 'content-type': 'application/json', origin: 'http://shop.test', 'sec-fetch-site': 'cross-site' })),
    ).toBe(false);
  });
  it('rejects non-JSON (form) posts and missing origin', () => {
    expect(checkSameOrigin(req({ 'content-type': 'application/x-www-form-urlencoded', origin: 'http://shop.test' }))).toBe(false);
    expect(checkSameOrigin(req({ 'content-type': 'application/json' }))).toBe(false);
  });
});

describe('input validation', () => {
  it('validates plan selection strictly', () => {
    expect(planSelectionSchema.safeParse({ tier: 'ultra', term: 'lifetime', streams: 4 }).success).toBe(true);
    expect(planSelectionSchema.safeParse({ tier: 'ultra', term: 'lifetime', streams: 5 }).success).toBe(false);
    expect(planSelectionSchema.safeParse({ tier: 'ultra', term: '6m', streams: 1 }).success).toBe(false);
    expect(planSelectionSchema.safeParse({ tier: 'gold', term: '12m', streams: 1 }).success).toBe(false);
    expect(planSelectionSchema.safeParse({ tier: 'plus' }).success).toBe(false);
  });

  const support = { kind: 'support', name: 'A', email: 'A@Example.com ', subject: 'Help', message: 'Long enough message', locale: 'en', consent: true };

  it('normalises emails and accepts a valid support request', () => {
    const r = contactSchema.safeParse(support);
    expect(r.success && r.data.email).toBe('a@example.com');
  });
  it('requires consent', () => {
    expect(contactSchema.safeParse({ ...support, consent: false }).success).toBe(false);
  });
  it('requires a message for support but not for the waitlist', () => {
    expect(contactSchema.safeParse({ ...support, message: 'short' }).success).toBe(false);
    expect(contactSchema.safeParse({ kind: 'launch_waitlist', email: 'a@b.co', locale: 'fr', consent: true }).success).toBe(true);
    expect(contactSchema.safeParse({ kind: 'launch_waitlist', email: 'a@b.co', locale: 'fr', consent: true, tier: 'plus', term: '36m', market: 'CA' }).success).toBe(true);
    expect(contactSchema.safeParse({ kind: 'launch_waitlist', email: 'a@b.co', locale: 'fr', consent: true, tier: 'gold' }).success).toBe(false);
  });
  it('rejects oversized fields and unknown locales', () => {
    expect(contactSchema.safeParse({ ...support, message: 'x'.repeat(4001) }).success).toBe(false);
    expect(contactSchema.safeParse({ ...support, locale: 'de' }).success).toBe(false);
  });
});
