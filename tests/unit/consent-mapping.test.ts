import { describe, expect, it } from 'vitest';
import { googleConsentFor, noAdsPolicy } from '@/lib/analytics';

describe('Google Consent Mode v2 mapping', () => {
  it.each([
    ['refus total', 'denied', 'denied'],
    ['Analytics uniquement', 'granted', 'denied'],
    ['Marketing uniquement', 'denied', 'granted'],
    ['acceptation totale', 'granted', 'granted'],
  ] as const)('%s', (_label, analytics, marketing) => {
    expect(googleConsentFor({ analytics, marketing })).toEqual({
      analytics_storage: analytics,
      ad_storage: marketing,
      ad_user_data: marketing,
      ad_personalization: marketing,
    });
  });
});

describe('advertising block (no Marketing consent)', () => {
  it('only allows analytics hosts for network calls and images', () => {
    const policy = noAdsPolicy();
    expect(policy).toMatch(/^connect-src 'self' .*; img-src 'self' data: /);
    for (const host of ['google-analytics.com', 'clarity.ms', 'cloudflareinsights.com']) expect(policy).toContain(host);
    for (const host of ['doubleclick', 'googlesyndication', 'googleadservices', 'www.google.com ', 'facebook', 'tiktok']) expect(policy).not.toContain(host);
    expect(policy).not.toMatch(/https:(\s|;|$)/);
  });
});
