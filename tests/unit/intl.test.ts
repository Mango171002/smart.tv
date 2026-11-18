import { describe, expect, it } from 'vitest';
import en from '@/i18n/dictionaries/en';
import fr from '@/i18n/dictionaries/fr';
import { getDictionary, hasDictionary } from '@/i18n/dictionaries';
import { ALL_LOCALE_IDS, builtLocales, liveLocales, SITE_LOCALES, type SiteLocale } from '@/i18n/locales';
import { localeOfPath, NOT_FOUND_TEXTS } from '@/i18n/not-found';
import { formatMoney } from '@/lib/pricing';
import { tableFromRows } from '@/lib/price-source';
import { href } from '@/lib/routes';
import { buildMetadata, hreflangAlternates } from '@/lib/seo';
import { contactSchema } from '@/lib/validation';
import { previewFetch } from '@/lib/preview-gate';

const ISO_CURRENCIES = new Set(['USD', 'CAD', 'EUR', 'GBP', 'CHF', 'MAD']);

describe('registry of international versions', () => {
  it('every version has a unique id, prefix and hreflang, valid codes and currency', () => {
    const all = Object.values(SITE_LOCALES) as SiteLocale[];
    expect(new Set(all.map((l) => l.id)).size).toBe(all.length);
    expect(new Set(all.map((l) => l.prefix)).size).toBe(all.length);
    expect(new Set(all.map((l) => l.hreflang)).size).toBe(all.length);
    for (const l of all) {
      expect(l.prefix === '' ? l.id === 'en' : l.prefix === `/${l.id}`).toBe(true);
      expect(l.id === 'en' || /^[a-z]{2}-[a-z]{2}$/.test(l.id)).toBe(true);
      expect(l.hreflang === 'en' || l.hreflang === `${l.language}-${l.country}`).toBe(true);
      expect(Intl.getCanonicalLocales(l.intl)).toEqual([l.intl]);
      expect(ISO_CURRENCIES.has(l.currency)).toBe(true);
    }
  });

  it('only « / » is live; France, Belgium, Switzerland, Canada and the UK are private previews', () => {
    expect(liveLocales()).toEqual(['en']);
    expect(builtLocales(false)).toEqual(['en']);
    expect(builtLocales(true)).toEqual(['en', 'fr-fr', 'fr-be', 'fr-ch', 'fr-ca', 'en-gb', 'en-ca']);
    expect(SITE_LOCALES.en.currency).toBe('USD');
  });

  it('every built version has its own dictionary (never an English page under another language)', () => {
    for (const id of builtLocales(true)) expect(hasDictionary(SITE_LOCALES[id as keyof typeof SITE_LOCALES].language)).toBe(true);
    expect(() => getDictionary('de-de')).toThrow(/No dictionary/);
  });
});

describe('URLs', () => {
  it('« / » keeps exactly the same links', () => {
    expect(href('en')).toBe('/');
    expect(href('en', '#plans')).toBe('/#plans');
    expect(href('en', '/blog')).toBe('/blog');
    expect(href('en', '/legal/terms')).toBe('/legal/terms');
  });
  it('other versions are prefixed, without trailing slash', () => {
    expect(href('fr-fr')).toBe('/fr-fr');
    expect(href('fr-fr', '#plans')).toBe('/fr-fr#plans');
    expect(href('fr-fr', '/legal/terms')).toBe('/fr-fr/legal/terms');
  });
  it('the 404 page finds the version of the path', () => {
    expect(localeOfPath('/fr-fr/xyz').id).toBe('fr-fr');
    expect(localeOfPath('/xyz').id).toBe('en');
    expect(NOT_FOUND_TEXTS.en).toEqual(en.notFound);
    expect(NOT_FOUND_TEXTS.fr).toEqual(fr.notFound);
  });
});

describe('hreflang and canonical', () => {
  it('nothing while « / » is the only live version (same as before)', () => {
    expect(hreflangAlternates('')).toBeUndefined();
    const m = buildMetadata({ locale: 'en', path: '', title: 't', description: 'd' });
    expect(m.alternates).toEqual({ canonical: '/' });
    expect(m.openGraph).toMatchObject({ locale: 'en_US', url: '/' });
  });

  it('once France is live: every live version + x-default (the English home)', () => {
    const reg = { en: { ...SITE_LOCALES.en }, 'fr-fr': { ...SITE_LOCALES['fr-fr'], status: 'live' as const }, 'de-de': { ...SITE_LOCALES['de-de'] } };
    // « fr » (language only) points to /fr-fr: French speakers of countries without their own version land there.
    expect(hreflangAlternates('', reg)).toEqual({ en: '/', 'fr-FR': '/fr-fr', fr: '/fr-fr', 'x-default': '/' });
    expect(hreflangAlternates('/legal/terms', reg)).toEqual({ en: '/legal/terms', 'fr-FR': '/fr-fr/legal/terms', fr: '/fr-fr/legal/terms', 'x-default': '/legal/terms' });
    // A page that only exists in one live version has no alternates (e.g. the French guides).
    expect(hreflangAlternates('/guides', reg, (id) => id === 'fr-fr')).toBeUndefined();
    // Several French versions: each country + « fr » → the main one (fr-fr).
    const reg2 = { ...reg, 'fr-ch': { ...SITE_LOCALES['fr-ch'], status: 'live' as const } };
    expect(hreflangAlternates('/faq', reg2, (id) => id !== 'en')).toEqual({ 'fr-FR': '/fr-fr/faq', 'fr-CH': '/fr-ch/faq', fr: '/fr-fr/faq', 'x-default': '/fr-fr/faq' });
  });

  it('a preview version points to itself, is never indexable and has no hreflang', () => {
    const m = buildMetadata({ locale: 'fr-fr', path: '/legal/terms', title: 't', description: 'd' });
    expect(m.alternates).toEqual({ canonical: '/fr-fr/legal/terms' });
    expect(m.robots).toEqual({ index: false, follow: false });
    expect(m.openGraph).toMatchObject({ locale: 'fr_FR' });
  });
});

describe('French dictionary (same structure as English)', () => {
  const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  const walk = (a: unknown, b: unknown, path: string, out: { same: number; total: number }) => {
    if (typeof a === 'string') {
      expect(typeof b, path).toBe('string');
      expect((b as string).trim().length, path).toBeGreaterThan(0);
      expect(placeholders(b as string), path).toEqual(placeholders(a));
      out.total++;
      if (a === b) out.same++;
    } else if (Array.isArray(a)) {
      expect(Array.isArray(b), path).toBe(true);
      expect((b as unknown[]).length, path).toBe(a.length);
      a.forEach((v, i) => walk(v, (b as unknown[])[i], `${path}[${i}]`, out));
    } else if (a && typeof a === 'object') {
      expect(Object.keys(b as object).sort(), path).toEqual(Object.keys(a).sort());
      for (const k of Object.keys(a)) walk((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`, out);
    } else {
      expect(b, path).toBe(a);
    }
  };
  it('every key, every list length and every {placeholder} match; texts are really translated', () => {
    const out = { same: 0, total: 0 };
    walk(en, fr, 'fr', out);
    // Brand and product names (SYGMA TV+, Starter, Plus, Ultra+, Smart TV, Fire TV, HDR…) and the 15
    // « International » genre labels stay identical; everything else is translated.
    expect(out.same / out.total).toBeLessThan(0.2);
    expect(fr.hero.titleA).not.toBe(en.hero.titleA);
    expect(fr.consent.acceptAll).toBe('Tout accepter');
  });
});

describe('prices: own grid per currency, never converted', () => {
  it('formats each currency in the version’s conventions', () => {
    expect(formatMoney(5900, 'USD', 'en')).toBe('$59');
    expect(formatMoney(5900, 'EUR', 'fr-fr').replace(/\s/g, ' ')).toBe('59 €');
    expect(formatMoney(5950, 'CHF', 'fr-ch')).toMatch(/59[.,]50/);
    expect(formatMoney(4900, 'GBP', 'en-gb')).toBe('£49');
    expect(formatMoney(6900, 'CAD', 'en-ca')).toMatch(/\$69/);
    expect(formatMoney(59900, 'MAD', 'fr-ma')).toMatch(/599/);
  });
  it('a grid in another currency is ignored; an incomplete grid gives « prices coming soon »', () => {
    const row = { currency: 'USD', amount_minor: 5900, status: 'illustrative' as const, plans: { tier_code: 'starter', term: '12m', streams: 1 } };
    expect(tableFromRows([row], 'EUR')).toBeNull();
    expect(tableFromRows([{ ...row, currency: 'EUR' }], 'EUR')).toBeNull();
  });
});

describe('orders closed on versions that are not live (server side)', () => {
  const base = { kind: 'trial_request', name: 'Ana', email: 'a@b.co', phone: '+33612345678', consent: true };
  it('the contact API only accepts live versions, whatever the browser sends', () => {
    expect(contactSchema.safeParse({ ...base, locale: 'en' }).success).toBe(true);
    expect(contactSchema.safeParse({ ...base, locale: 'fr-fr' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...base, locale: 'de-de' }).success).toBe(false);
  });
});

describe('private preview gate (separate Worker)', () => {
  const ok = async () => new Response('<html>site</html>', { headers: { 'content-type': 'text/html' } });
  const req = (path: string, password?: string) =>
    new Request(`https://preview.sygmatv.com${path}`, password === undefined ? {} : { headers: { authorization: `Basic ${btoa(`team:${password}`)}` } });

  it('locked without the password secret (fail-closed)', async () => {
    expect((await previewFetch(req('/fr-fr', 'x'), {}, {}, ok)).status).toBe(503);
  });
  it('asks for the password; a wrong one is refused', async () => {
    const env = { PREVIEW_PASSWORD: 's3cret' };
    const r1 = await previewFetch(req('/fr-fr'), env, {}, ok);
    expect(r1.status).toBe(401);
    expect(r1.headers.get('www-authenticate')).toMatch(/Basic/);
    expect((await previewFetch(req('/fr-fr', 'nope'), env, {}, ok)).status).toBe(401);
  });
  it('serves pages with noindex; refuses every API route except health', async () => {
    const env = { PREVIEW_PASSWORD: 's3cret' };
    const page = await previewFetch(req('/fr-fr', 's3cret'), env, {}, ok);
    expect(page.status).toBe(200);
    expect(page.headers.get('x-robots-tag')).toMatch(/noindex/);
    for (const p of ['/api/contact', '/api/quote', '/api/checkout', '/api/telegram/webhook', '/api/cron/monitor', '/api/cron/review-invites']) {
      const r = await previewFetch(req(p, 's3cret'), env, {}, ok);
      expect(r.status, p).toBe(403);
      expect(r.headers.get('x-robots-tag')).toMatch(/noindex/);
    }
    expect((await previewFetch(req('/api/health', 's3cret'), env, {}, ok)).status).toBe(200);
  });
});

describe('every declared version', () => {
  it('is listed', () => {
    expect(ALL_LOCALE_IDS).toEqual(['en', 'fr-fr', 'fr-be', 'fr-ch', 'fr-ca', 'fr-ma', 'en-gb', 'en-ca', 'de-de', 'de-ch', 'es-es', 'nl-be']);
  });
});

describe('country picker in other languages', () => {
  it('French names, French order; the English home list is unchanged', async () => {
    const { countriesFor, countryIn } = await import('@/components/CountryPicker');
    const fr = countriesFor('fr-FR');
    expect(countryIn('DE', 'fr-FR')?.name).toBe('Allemagne');
    expect(countryIn('DE', 'fr-FR')?.en).toBe('Germany');
    expect(countryIn('DE')?.name).toBe('Germany');
    expect(fr.findIndex((c) => c.code === 'DE')).toBeLessThan(fr.findIndex((c) => c.code === 'FR'));
    expect(countriesFor('en-US')).toBe(countriesFor());
  });
});
