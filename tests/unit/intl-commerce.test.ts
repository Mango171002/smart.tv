import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderEmail, type EmailKind } from '@/lib/email/templates';
import { currencyOfMarket, priceMarketOfLocale, priceMarketOfRequest, storedPriceMarket } from '@/lib/market';
import { PRICE_MARKET_CURRENCY } from '@/config/markets';
import { SITE_LOCALES, type SiteLocale } from '@/i18n/locales';
import { formatMoney } from '@/lib/pricing';
import { renderCard, type CardData } from '@/lib/telegram/cards';

const KINDS: EmailKind[] = ['trial_received', 'trial_started', 'trial_followup', 'preregistration_received', 'request_confirmed', 'review_invite'];
const plans = [{ name: 'Starter', tagline: 't', price: '$59', highlights: ['a', 'b'], color: '#19d3f3', image: 'x', recommended: false }, { name: 'Plus', tagline: 'u', price: '$69', highlights: ['c'], color: '#d1fe17', image: 'y', recommended: true }];
const DATA = { name: 'Sara Alaoui', email: 's@x.co', phone: '+33612345678', tier: 'ultra', term: '24m', streams: 2, trialDuration: '24 hours', plans,
  invoice: { number: 'SYG-1', issuedAt: '2026-11-15T10:00:00Z', amountMinor: 9900, currency: 'USD' } };

describe('price markets and currencies (no conversion)', () => {
  it('every version has a market whose currency is its own', () => {
    for (const l of Object.values(SITE_LOCALES) as SiteLocale[]) {
      expect(priceMarketOfLocale(l.id), l.id).toBe(l.market);
      expect(currencyOfMarket(priceMarketOfLocale(l.id)), l.id).toBe(l.currency);
    }
    expect(PRICE_MARKET_CURRENCY).toEqual({ US: 'USD', CA: 'CAD', EU: 'EUR', GB: 'GBP', CH: 'CHF', MA: 'MAD' });
  });
  it('the English home and older requests keep the US grid; other versions store their market', () => {
    expect(storedPriceMarket('en')).toBeNull();
    expect(storedPriceMarket('fr-fr')).toBe('EU');
    expect(storedPriceMarket('fr-ch')).toBe('CH');
    expect(storedPriceMarket('en-gb')).toBe('GB');
    expect(priceMarketOfRequest({ price_market: null })).toBe('US');
    expect(priceMarketOfRequest({})).toBe('US');
    expect(priceMarketOfRequest({ price_market: 'CA' })).toBe('CA');
    expect(priceMarketOfRequest({ price_market: 'XX' })).toBe('US');
    expect(priceMarketOfLocale('zz-zz')).toBe('US');
  });
  it('each currency is formatted the local way', () => {
    expect(formatMoney(9900, 'USD', 'en')).toBe('$99');
    expect(formatMoney(9900, 'EUR', 'fr-fr').replace(/\s/g, ' ')).toBe('99 €');
    expect(formatMoney(9950, 'CHF', 'fr-ch')).toMatch(/99[.,]50/);
    expect(formatMoney(9900, 'CAD', 'fr-ca').replace(/\s/g, ' ')).toMatch(/99 \$/);
    expect(formatMoney(9900, 'CAD', 'en-ca')).toMatch(/\$99/);
    expect(formatMoney(9900, 'GBP', 'en-gb')).toBe('£99');
    expect(formatMoney(99900, 'MAD', 'fr-ma')).toMatch(/999/);
  });
});

describe('customer e-mails by language and currency', () => {
  it('English e-mails are byte-identical to the pre-3A output (English home unchanged)', () => {
    const before = JSON.parse(readFileSync('tests/unit/fixtures/emails-en-before-3a.json', 'utf8'));
    for (const k of KINDS) {
      expect(renderEmail(k, DATA), k).toEqual(before[k]);
      expect(renderEmail(k, {}), `${k} (minimal)`).toEqual(before[`${k}_min`]);
      expect(renderEmail(k, { ...DATA, locale: 'en' }), `${k} (en)`).toEqual(before[k]);
    }
  });
  it('French versions get French e-mails, with links to their version', () => {
    for (const k of KINDS) {
      const m = renderEmail(k, { ...DATA, locale: 'fr-fr' });
      expect(m.html, k).toContain('<html lang="fr">');
      expect(m.html, k).toContain('https://sygmatv.com/fr-fr/legal/privacy');
      expect(`${m.subject} ${m.text}`, k).not.toMatch(/\b(Hello|Thank you|your|Need help|Write a review)\b/);
    }
    expect(renderEmail('trial_received', { ...DATA, locale: 'fr-fr' }).html).toContain('Bonjour Sara,');
    expect(renderEmail('preregistration_received', { ...DATA, locale: 'fr-ca' }).text).toContain('Ultra+ · 24 mois · 2 appareils');
    expect(renderEmail('trial_started', { ...DATA, locale: 'fr-fr' }).text).toContain('24 heures');
  });
  it('the invoice amount is shown in the order’s own currency', () => {
    const inv = (amountMinor: number, currency: string, locale: string) =>
      renderEmail('request_confirmed', { ...DATA, locale, invoice: { number: 'SYG-2', issuedAt: '2026-11-18T10:00:00Z', amountMinor, currency } }).text.replace(/\s/g, ' ');
    expect(inv(5900, 'EUR', 'fr-fr')).toContain('Montant payé : 59,00 €');
    expect(inv(6900, 'CHF', 'fr-ch')).toMatch(/Montant payé : 69[.,]00 CHF/);
    expect(inv(7900, 'CAD', 'fr-ca')).toMatch(/Montant payé : 79,00 \$/);
    expect(inv(4900, 'GBP', 'en-gb')).toContain('Amount Paid: £49.00 GBP');
    expect(inv(9900, 'USD', 'en')).toContain('Amount Paid: $99.00 USD');
  });
  it('trial follow-up: the plans currency is named; no plan list when the grid is not validated', () => {
    expect(renderEmail('trial_followup', { ...DATA, locale: 'fr-fr', currency: 'EUR' }).text).toContain('Prix par an en EUR');
    const none = renderEmail('trial_followup', { name: 'Sara', locale: 'fr-ch' });
    expect(none.text).toContain('Découvrez nos formules');
    expect(none.html).toContain('https://sygmatv.com/fr-ch#plans');
  });
});

describe('Telegram card', () => {
  const card = (request: Partial<CardData['request']>): CardData => ({
    request: { id: '11111111-2222-4333-8444-555555555555', kind: 'launch_waitlist', name: 'Ana', email: 'a@b.co', phone: null, market: null, subject: null, message: null, tier: 'plus', term: '12m', streams: 1, device: null, marketing: false, created_at: '2026-11-18T10:00:00Z', ...request },
    card: { flow: 'lead', status: 'new', version: 1, chat_id: null, thread_id: null, message_id: null },
    events: [],
  } as CardData);
  it('shows the site version and currency of an international order; nothing more for « / »', () => {
    expect(renderCard(card({ locale: 'fr-ch', price_market: 'CH' }), 'Europe/London').text).toContain('🗣 Version : fr-ch · CHF');
    expect(renderCard(card({ locale: 'en' }), 'Europe/London').text).not.toContain('Version');
    expect(renderCard(card({}), 'Europe/London').text).not.toContain('Version');
  });
});

// ---------------------------------------------------------------- API: quote and order by market
const EUR_TABLE = (() => {
  const prices: Record<string, number> = {};
  for (const t of ['starter', 'plus', 'ultra']) for (const term of ['12m', '24m', '36m', 'lifetime']) for (const n of [1, 2, 3, 4]) prices[`${t}:${term}:${n}`] = 4900 + n * 100;
  return { currency: 'EUR', status: 'illustrative' as const, prices };
})();

describe('API by market (a test-only registry where /fr-fr is live)', () => {
  const insert = vi.fn();
  const sendMail = vi.fn();
  beforeEach(() => {
    vi.resetModules();
    insert.mockReset().mockResolvedValue({ error: null });
    sendMail.mockReset().mockResolvedValue('sent');
    vi.doMock('@/i18n/locales', async (orig) => {
      const m = await orig<typeof import('@/i18n/locales')>();
      const reg = { ...m.SITE_LOCALES, 'fr-fr': { ...m.SITE_LOCALES['fr-fr'], status: 'live' as const } };
      return { ...m, SITE_LOCALES: reg, liveLocales: () => m.liveLocales(reg), builtLocales: () => m.builtLocales(false, reg), isLive: (id: string) => (reg as Record<string, { status: string }>)[id]?.status === 'live', commerceOpen: (id: string) => (reg as Record<string, { status: string }>)[id]?.status === 'live' };
    });
    vi.doMock('@/lib/price-source', async (orig) => ({ ...(await orig<typeof import('@/lib/price-source')>()), getPriceTableFor: async (m: string) => (m === 'EU' ? EUR_TABLE : null) }));
    vi.doMock('@/lib/supabase/server', () => ({ getPublicSupabase: () => ({ from: () => ({ insert }) }), getServiceSupabase: () => null }));
    vi.doMock('@/lib/email/send', () => ({ sendCustomerEmail: (...a: unknown[]) => sendMail(...a) }));
    vi.doMock('@/lib/telegram/ops', () => ({ notifyNewRequest: async () => undefined }));
    vi.doMock('next/server', async (orig) => ({ ...(await orig<typeof import('next/server')>()), after: (f: () => unknown) => f() }));
    vi.stubEnv('FEATURE_CONTACT_FORM', 'true');
    vi.stubEnv('SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock('@/i18n/locales');
    vi.doUnmock('@/lib/price-source');
    vi.doUnmock('@/lib/supabase/server');
    vi.doUnmock('@/lib/email/send');
    vi.doUnmock('@/lib/telegram/ops');
    vi.doUnmock('next/server');
  });
  const post = (url: string, body: unknown) =>
    new Request(`http://shop.test${url}`, { method: 'POST', headers: { host: 'shop.test', origin: 'http://shop.test', 'content-type': 'application/json', 'x-forwarded-for': `10.1.0.${Math.floor(Math.random() * 250)}` }, body: JSON.stringify(body) });

  it('quote: the server picks the version’s market and currency (EUR for /fr-fr); closed versions are refused', async () => {
    const { POST } = await import('@/app/api/quote/route');
    const fr = await (await POST(post('/api/quote', { tier: 'plus', term: '12m', streams: 1, locale: 'fr-fr' }))).json();
    expect(fr.quote).toMatchObject({ currency: 'EUR', amountMinor: 5000 });
    expect((await POST(post('/api/quote', { tier: 'plus', term: '12m', streams: 1, locale: 'fr-ch' }))).status).toBe(403);
    expect((await POST(post('/api/quote', { tier: 'plus', term: '12m', streams: 1, locale: 42 }))).status).toBe(403);
  });

  it('order from /fr-fr: stored with its version and price market (decided by the server), French e-mail', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const res = await POST(post('/api/contact', { kind: 'launch_waitlist', email: 'qa@example.test', phone: '+33612345678', locale: 'fr-fr', country: 'FR', tier: 'plus', term: '12m', streams: 1, consent: true }));
    expect(res.status).toBe(201);
    expect(insert.mock.calls[0]![0]).toMatchObject({ locale: 'fr-fr', price_market: 'EU' });
    expect(sendMail).toHaveBeenCalledWith('preregistration_received', 'qa@example.test', expect.objectContaining({ locale: 'fr-fr' }));
  });

  it('order from « / »: nothing new is written (no price_market), English e-mail as before', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const res = await POST(post('/api/contact', { kind: 'launch_waitlist', email: 'qa2@example.test', phone: '+14155550123', locale: 'en', country: 'US', tier: 'plus', term: '12m', streams: 1, consent: true }));
    expect(res.status).toBe(201);
    expect(insert.mock.calls[0]![0]).not.toHaveProperty('price_market');
    expect(insert.mock.calls[0]![0].locale).toBe('en');
    expect(sendMail.mock.calls[0]![2]).not.toHaveProperty('locale');
  });

  it('e-mail plans: the version’s own grid and currency; none while a grid is not validated', async () => {
    vi.doMock('@/lib/price-source', async (orig) => ({ ...(await orig<typeof import('@/lib/price-source')>()), getPriceTableFor: async (m: string) => (m === 'EU' ? EUR_TABLE : null) }));
    const { emailPlans } = await import('@/lib/email/plans');
    const fr = await emailPlans('fr-fr');
    expect(fr?.currency).toBe('EUR');
    expect(fr?.plans.map((p) => p.price.replace(/\s/g, ' '))).toEqual(['50 €', '50 €', '50 €']);
    expect(fr?.plans[0]!.highlights).toContain('Bouquet Essentiel');
    expect(await emailPlans('fr-ch')).toBeNull();
  });

  it('sitemap once /fr-fr is live: FAQ and guides listed, hreflang with « fr », English entries unchanged', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://sygmatv.com');
    const { default: sitemap } = await import('@/app/sitemap');
    const entries = sitemap();
    const paths = entries.map((e) => new URL(e.url).pathname);
    expect(paths).toEqual(expect.arrayContaining(['/', '/legal/terms', '/fr-fr', '/fr-fr/faq', '/fr-fr/guides', '/fr-fr/guides/fire-tv']));
    const home = entries.find((e) => new URL(e.url).pathname === '/')!;
    expect(home).not.toHaveProperty('lastModified');
    expect(home.alternates?.languages).toEqual({ en: 'https://sygmatv.com/', 'fr-FR': 'https://sygmatv.com/fr-fr', fr: 'https://sygmatv.com/fr-fr', 'x-default': 'https://sygmatv.com/' });
    const guide = entries.find((e) => e.url.endsWith('/fr-fr/guides/fire-tv'))!;
    expect(guide.lastModified).toBe('2026-11-18');
    expect(guide.alternates).toBeUndefined();
  });

  it('a request claiming a version that is not open is refused (fr-ch, preview)', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const res = await POST(post('/api/contact', { kind: 'launch_waitlist', email: 'qa3@example.test', phone: '+41791234567', locale: 'fr-ch', consent: true }));
    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });
});
