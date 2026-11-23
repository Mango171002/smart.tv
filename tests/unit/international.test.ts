import { describe, expect, it, vi } from 'vitest';
import nextConfig from '../../next.config';
import { LOCALES, isLocale, localeSeo } from '@/i18n/config';
import {
  ALL_LANGUAGE_CODES,
  DEFAULT_LANGUAGE,
  PRIORITY_MARKETS,
  SITE_LANGUAGES,
  type SiteLanguage,
  disabledLanguages,
  previewLanguages,
  enabledLanguages,
  formerPagePrefixes,
  languagesForMarket,
  legacyLanguageRedirects,
} from '@/i18n/locales';
import { absoluteUrl, localizedPath, splitLocale } from '@/lib/routes';
import { buildMetadata, hreflangAlternates, pageLocales } from '@/lib/seo';

const REGISTRY = Object.values(SITE_LANGUAGES) as SiteLanguage[];
const DISABLED = ['fr', 'de', 'es', 'it', 'nl', 'sv', 'nb'];
/** Simulated registry for future releases (nothing is enabled in the real one). */
const withEnabled = (...codes: string[]): SiteLanguage[] =>
  REGISTRY.map((l) => (codes.includes(l.code) ? { ...l, status: 'enabled' as const } : l));

describe('language registry (phase 7A)', () => {
  it('declares 8 languages; English is the only enabled one', () => {
    expect(ALL_LANGUAGE_CODES).toEqual(['en', 'fr', 'de', 'es', 'it', 'nl', 'sv', 'nb']);
    expect(enabledLanguages().map((l) => l.code)).toEqual(['en']);
    // Phase 7B: French in preview; phase 8: the six other languages in preview too (built only in the preview
    // environment, never public). No language is disabled any more.
    expect(previewLanguages().map((l) => l.code)).toEqual(DISABLED);
    expect(disabledLanguages().map((l) => l.code)).toEqual([]);
    expect(LOCALES).toEqual(['en']);
    expect(DEFAULT_LANGUAGE).toBe('en');
    for (const code of DISABLED) expect(isLocale(code)).toBe(false);
  });

  it('English at the root, every other language under its own language prefix', () => {
    expect(SITE_LANGUAGES.en.prefix).toBe('');
    for (const code of DISABLED) expect(SITE_LANGUAGES[code as keyof typeof SITE_LANGUAGES].prefix).toBe(`/${code}`);
  });

  it('hreflang codes are generic language codes (no en-US, en-GB, fr-CH, fr-CA…)', () => {
    for (const l of REGISTRY) {
      expect(l.hreflang).toBe(l.code);
      expect(l.hreflang).toMatch(/^[a-z]{2}$/);
      expect(l.htmlLang).toBe(l.code);
    }
  });

  it('SEO codes per language', () => {
    expect(REGISTRY.map((l) => l.ogLocale)).toEqual(['en_US', 'fr_FR', 'de_DE', 'es_ES', 'it_IT', 'nl_NL', 'sv_SE', 'nb_NO']);
    expect(localeSeo('en').ogLocale).toBe('en_US');
  });
});

describe('13 target markets, one page per language (no country copies)', () => {
  const expected: Record<string, string[]> = {
    US: ['en'], GB: ['en'], CA: ['en', 'fr'], IE: ['en'],
    FR: ['fr'], CH: ['fr', 'de', 'it'], LU: ['en', 'fr', 'de'],
    DE: ['de'], ES: ['es'], IT: ['it'],
    NL: ['en', 'nl'], SE: ['en', 'sv'], NO: ['en', 'nb'],
  };

  it('lists the 13 priority markets', () => {
    expect([...PRIORITY_MARKETS].sort()).toEqual(Object.keys(expected).sort());
  });

  it('maps each market to its languages once they are enabled', () => {
    const all = withEnabled(...ALL_LANGUAGE_CODES);
    for (const [country, langs] of Object.entries(expected)) {
      expect(languagesForMarket(country as (typeof PRIORITY_MARKETS)[number], all).map((l) => l.code).sort()).toEqual([...langs].sort());
    }
  });

  it('today only English serves a market; nothing is published for disabled languages', () => {
    for (const country of PRIORITY_MARKETS) {
      const codes = languagesForMarket(country).map((l) => l.code);
      expect(codes).toEqual(expected[country]!.includes('en') ? ['en'] : []);
    }
  });

  it('no region-specific prefix exists (no /fr-ch, /en-gb…)', () => {
    for (const l of REGISTRY) expect(l.prefix).toMatch(/^(|\/[a-z]{2})$/);
  });
});

describe('locale-aware routing', () => {
  it('English URLs are unchanged', () => {
    expect(localizedPath('en')).toBe('/');
    expect(localizedPath('en', '/help')).toBe('/help');
    expect(localizedPath('en', '/legal/privacy')).toBe('/legal/privacy');
    expect(localizedPath('en', '#plans')).toBe('/#plans');
    expect(absoluteUrl('en', '/about')).toMatch(/^https?:\/\/[^/]+\/about$/);
  });

  it('a disabled prefix is not recognised as a language', () => {
    expect(splitLocale('/help')).toEqual({ locale: 'en', path: '/help' });
    expect(splitLocale('/')).toEqual({ locale: 'en', path: '' });
    for (const code of DISABLED) expect(splitLocale(`/${code}/help`)).toEqual({ locale: 'en', path: `/${code}/help` });
  });
});

describe('hreflang', () => {
  it('none today: a single-language page needs no hreflang', () => {
    for (const path of ['', '/about', '/help', '/legal/privacy', '/legal/refunds']) expect(hreflangAlternates(path)).toBeUndefined();
  });

  it('future: generic codes + x-default → English, same English slugs under each prefix', () => {
    expect(hreflangAlternates('/help', { languages: withEnabled('fr', 'de') })).toEqual({
      en: '/help', fr: '/fr/help', de: '/de/help', 'x-default': '/help',
    });
    expect(hreflangAlternates('', { languages: withEnabled('it') })).toEqual({ en: '/', it: '/it', 'x-default': '/' });
    expect(hreflangAlternates('/about', { languages: withEnabled('nb'), base: 'https://sygmatv.com' })).toEqual({
      en: 'https://sygmatv.com/about', nb: 'https://sygmatv.com/nb/about', 'x-default': 'https://sygmatv.com/about',
    });
  });

  it('never references a disabled language', () => {
    const set = hreflangAlternates('/help', { languages: withEnabled('fr') })!;
    for (const code of ['de', 'es', 'it', 'nl', 'sv', 'nb']) expect(set[code]).toBeUndefined();
  });

  it('never references a language where the page does not exist', () => {
    const set = hreflangAlternates('/legal/privacy', { languages: withEnabled('fr', 'de'), availableIn: ['en', 'de'] })!;
    expect(Object.keys(set)).toEqual(['en', 'de', 'x-default']);
  });

  it('is reciprocal: every version of a page declares the same set, including itself', () => {
    const set = hreflangAlternates('/about', { languages: withEnabled(...ALL_LANGUAGE_CODES) })!;
    expect(Object.keys(set)).toEqual([...ALL_LANGUAGE_CODES, 'x-default']);
    // The set depends on the page only, not on the version being rendered: each listed URL links back to all others.
    for (const l of REGISTRY) expect(set[l.hreflang]).toBe(l.prefix ? `${l.prefix}/about` : '/about');
  });
});

describe('metadata and sitemap (English only: output unchanged)', () => {
  it('self canonical, og:locale en_US, no hreflang alternates', () => {
    const m = buildMetadata({ locale: 'en', path: '/legal/privacy', title: 'Privacy', description: 'd' });
    expect(m.alternates).toEqual({ canonical: '/legal/privacy' });
    expect(m.openGraph).toMatchObject({ url: '/legal/privacy', locale: 'en_US' });
    expect(m.openGraph).not.toHaveProperty('alternateLocale');
    expect(buildMetadata({ locale: 'en', path: '', title: 't', description: 'd' }).alternates).toEqual({ canonical: '/' });
  });

  it('Open Graph and X cards: same title, description and 1200×630 image, each with its text alternative', () => {
    const m = buildMetadata({ locale: 'en', path: '/help', title: 'Help', description: 'd' });
    expect(m.openGraph).toMatchObject({ title: 'Help | SYGMA TV+', description: 'd', images: [{ url: '/brand/og-image.jpg', width: 1200, height: 630, alt: expect.stringMatching(/\S/) }] });
    expect(m.twitter).toMatchObject({ card: 'summary_large_image', title: 'Help | SYGMA TV+', description: 'd' });
    const [img] = (m.twitter as { images: { url: string; alt: string }[] }).images;
    expect(img).toEqual({ url: '/brand/og-image.jpg', alt: (m.openGraph as { images: { alt: string }[] }).images[0]!.alt });
  });

  it('pages exist in English only', () => {
    expect(pageLocales('/help')).toEqual(['en']);
  });

  it('sitemap: English URLs only, no disabled language, no alternates', async () => {
    // Production build (.env.production: indexing allowed); a non-indexable build lists no URL (sitemap-staging.test.ts).
    vi.stubEnv('NEXT_PUBLIC_ALLOW_INDEXING', 'true');
    vi.resetModules();
    const { default: sitemap } = await import('@/app/sitemap');
    const entries = sitemap();
    vi.unstubAllEnvs();
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) {
      const path = new URL(e.url).pathname;
      for (const code of DISABLED) expect(path === `/${code}` || path.startsWith(`/${code}/`)).toBe(false);
      expect(e).not.toHaveProperty('alternates');
    }
  });
});

describe('redirects preserved (generated from the registry)', () => {
  it('former French URLs keep redirecting while French is disabled', () => {
    expect(legacyLanguageRedirects()).toEqual([
      { source: '/fr', destination: '/', permanent: true },
      { source: '/fr/:path*', destination: '/:path*', permanent: true },
    ]);
    expect(formerPagePrefixes()).toEqual(['en', 'fr']);
  });

  it('are removed in the same release that enables French (legal URLs keep pointing to the English pages)', () => {
    expect(legacyLanguageRedirects(withEnabled('fr'))).toEqual([{ source: '/fr/legal/:path*', destination: '/legal/:path*', permanent: true }]);
    expect(formerPagePrefixes(withEnabled('fr'))).toEqual(['en']);
  });

  it('next.config redirects are exactly the pre-7A list (content pages off)', async () => {
    const redirects = await nextConfig.redirects!();
    expect(redirects).toEqual([
      { source: '/:path*', has: [{ type: 'host', value: 'www.sygmatv.com' }], destination: 'https://sygmatv.com/:path*', permanent: true },
      { source: '/:locale(en|fr)/plans', destination: '/#plans', permanent: true },
      { source: '/plans', destination: '/#plans', permanent: true },
      { source: '/:locale(en|fr)/devices', destination: '/#content', permanent: true },
      { source: '/devices', destination: '/#content', permanent: true },
      { source: '/:locale(en|fr)/coverage', destination: '/#content', permanent: true },
      { source: '/coverage', destination: '/#content', permanent: true },
      { source: '/:locale(en|fr)/help', destination: '/#faq', permanent: true },
      { source: '/help', destination: '/#faq', permanent: true },
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path+', destination: '/:path+', permanent: true },
      { source: '/fr', destination: '/', permanent: true },
      { source: '/fr/:path*', destination: '/:path*', permanent: true },
    ]);
    // No redirect for prefixes that were never published.
    for (const code of ['de', 'es', 'it', 'nl', 'sv', 'nb']) {
      for (const r of redirects) expect(r.source === `/${code}` || r.source.startsWith(`/${code}/`) || r.source.includes(`|${code}`)).toBe(false);
    }
  });
});
