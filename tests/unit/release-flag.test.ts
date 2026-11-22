import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import fr from '@/i18n/dictionaries/fr';
import { ABOUT_FR, HELP_TOPICS_FR, INFO_UI_FR } from '@/content/fr/info';
import { LOCALES, PUBLIC_LOCALES } from '@/i18n/config';
import {
  RELEASED_LANGUAGES, SITE_LANGUAGES, type SiteLanguage, applyRelease, builtLanguages, enabledLanguages,
  legacyLanguageRedirects, previewLanguages,
} from '@/i18n/locales';
import { displayMoney, displayMoneyWithCode } from '@/lib/money-display';
import { formatMoney } from '@/lib/pricing';
import { PAGE_AVAILABILITY, hreflangAlternates, pageLocales } from '@/lib/seo';

/** Phase 7C: French release readiness. */
const ROOT = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const REGISTRY = Object.values(SITE_LANGUAGES) as SiteLanguage[];
const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];

describe('release flag (NEXT_PUBLIC_RELEASED_LANGUAGES)', () => {
  it('is off in this build: French not released, not built, not public', () => {
    expect(RELEASED_LANGUAGES).toEqual([]);
    expect(LOCALES).toEqual(['en']);
    expect(PUBLIC_LOCALES).toEqual(['en']);
    expect(previewLanguages().map((l) => l.code)).toEqual(['fr']);
  });

  it('is never set in the production configuration (env file, Cloudflare config, workflows)', () => {
    const files = ['.env.production', 'wrangler.jsonc', 'open-next.config.ts', 'next.config.ts', ...readdirSync(join(ROOT, '.github/workflows')).map((f) => `.github/workflows/${f}`)];
    for (const f of files) {
      const text = read(f);
      expect(text, f).not.toMatch(/NEXT_PUBLIC_RELEASED_LANGUAGES\s*[=:]/);
      expect(text, f).not.toMatch(/NEXT_PUBLIC_SITE_MODE\s*[=:]/);
    }
  });

  it('once set to « fr », French becomes enabled (built, public); other languages are unaffected', () => {
    const released = applyRelease(REGISTRY, ['fr']);
    expect(enabledLanguages(released).map((l) => l.code)).toEqual(['en', 'fr']);
    expect(builtLanguages(released, false).map((l) => l.code)).toEqual(['en', 'fr']);
    expect(previewLanguages(released)).toEqual([]);
    expect(released.filter((l) => l.status === 'disabled').map((l) => l.code)).toEqual(['de', 'es', 'it', 'nl', 'sv', 'nb']);
  });

  it('can never release a disabled language (no complete dictionary)', () => {
    expect(enabledLanguages(applyRelease(REGISTRY, ['de', 'es', 'it', 'nl', 'sv', 'nb'])).map((l) => l.code)).toEqual(['en']);
  });

  it('released French: /fr is served, former URLs point to the French home, legal URLs to the English pages (308)', () => {
    expect(legacyLanguageRedirects(applyRelease(REGISTRY, ['fr']), false)).toEqual([{ source: '/fr/legal/:path*', destination: '/legal/:path*', permanent: true }]);
  });
});

describe('hreflang and sitemap alternates once French is released', () => {
  const released = applyRelease(REGISTRY, ['fr']);
  it('reciprocal en / fr / x-default on translated pages, same English slugs', () => {
    for (const path of ['', '/about', '/help', '/help/refunds']) {
      const set = hreflangAlternates(path, { languages: released })!;
      const fr = path ? `/fr${path}` : '/fr';
      expect(set).toEqual({ en: path || '/', fr, 'x-default': path || '/' });
    }
  });

  it('never for the legal pages (English only): no alternate to a redirect', () => {
    for (const doc of ['terms', 'privacy', 'cookies', 'refunds', 'imprint']) {
      expect(PAGE_AVAILABILITY[`/legal/${doc}`]).toEqual(['en']);
      expect(hreflangAlternates(`/legal/${doc}`, { languages: released, availableIn: ['en'] })).toBeUndefined();
      expect(pageLocales(`/legal/${doc}`)).toEqual(['en']);
    }
  });
});

describe('price display', () => {
  it('English is exactly the previous format', () => {
    for (const minor of [5900, 6900, 9900, 492, 17399, 1000]) {
      expect(displayMoney(minor, 'USD', 'en')).toBe(formatMoney(minor, 'USD', 'en'));
      expect(displayMoneyWithCode(minor, 'USD', 'en')).toBe(`${formatMoney(minor, 'USD', 'en')} USD`);
    }
  });

  it('French uses one explicit format: « 59 $ US », « 4,92 $ US » (also in the order window)', () => {
    expect(displayMoney(5900, 'USD', 'fr')).toBe('59 $ US');
    expect(displayMoney(492, 'USD', 'fr')).toBe('4,92 $ US');
    expect(displayMoneyWithCode(6900, 'USD', 'fr')).toBe('69 $ US');
    expect(displayMoney(123456, 'USD', 'fr')).toMatch(/^1\s?234,56 \$ US$/);
  });

  it('French text prices use the same format (FAQ, taxes)', () => {
    const text = strings(fr).join('\n');
    expect(fr.checkout.taxesValue).toBe('0,00 $ US');
    for (const m of text.match(/\d[\d,]*\s?\$(?:\s?[A-Z]{2,3})?/g) ?? []) expect(m, m).toMatch(/ \$ US$/);
    expect(text).not.toMatch(/\$ USD|\$USD/);
  });
});

describe('French security and privacy wording: verified facts only', () => {
  const text = strings([fr, ABOUT_FR, HELP_TOPICS_FR, INFO_UI_FR]).join('\n');
  it('no unsupported security / privacy claim', () => {
    for (const re of [/sécuris/i, /\bsûr\b/i, /données protégées/i, /vie privée compte/i, /de façon sécurisée/i, /chiffr/i, /100\s?%\s?sécur/i])
      expect(text, String(re)).not.toMatch(re);
  });

  it('uses the documented fact instead: data never sold', () => {
    expect(fr.hero.checks).toContain('Données jamais vendues');
    expect(fr.checkout.trust).toContain('Données jamais vendues');
    expect(fr.footer.chips).toEqual(['Multi-écrans', 'Essai gratuit']);
  });
});
