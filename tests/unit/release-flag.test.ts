import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import en from '@/i18n/dictionaries/en';
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
const list = (dir: string, re: RegExp) => readdirSync(join(ROOT, dir)).filter((f) => re.test(f)).map((f) => (dir === '.' ? f : `${dir}/${f}`));
const WORKFLOWS = list('.github/workflows', /\.ya?ml$/);
const CONFIGS = list('.', /^(wrangler.*\.jsonc?|wrangler.*\.toml|next\.config\..+|open-next\.config\..+)$/);
/** Files that configure the production build and deployment. */
const PRODUCTION_FILES = ['.env.production', ...CONFIGS.filter((f) => !f.includes('staging')), ...WORKFLOWS];
/** The release switch may appear in NONE of these (only .env.production can release a language). */
const RELEASE_FORBIDDEN_FILES = [...CONFIGS, '.env.staging', ...WORKFLOWS];
const RELEASE_ASSIGNMENT = /NEXT_PUBLIC_RELEASED_LANGUAGES\s*[=:]/;
/** Languages that can be released: the « preview » languages of the registry (complete dictionary), never English. */
const RELEASABLE = REGISTRY.filter((l) => l.status === 'preview').map((l) => l.code);

/**
 * Problems with the release line of an env file (empty list = valid). Valid: no line at all, or exactly one line
 * `NEXT_PUBLIC_RELEASED_LANGUAGES=<codes>` where <codes> is a comma-separated list (no spaces, no quotes, no
 * trailing comment) of distinct releasable codes. Full-line comments are ignored (dotenv ignores them too).
 * NEXT_PUBLIC_SITE_MODE is never allowed (it would build the preview languages, noindex, on the production domain).
 */
function releaseLineProblems(text: string): string[] {
  const lines = text.split(/\r?\n/).filter((l) => !/^\s*#/.test(l));
  const problems: string[] = [];
  if (lines.some((l) => /NEXT_PUBLIC_SITE_MODE\s*[=:]/.test(l))) problems.push('NEXT_PUBLIC_SITE_MODE is set');
  const mentions = lines.filter((l) => l.includes('NEXT_PUBLIC_RELEASED_LANGUAGES'));
  const [line, ...extra] = mentions;
  if (line === undefined) return problems;
  if (extra.length > 0) return [...problems, `${mentions.length} release lines (one at most)`];
  const value = /^NEXT_PUBLIC_RELEASED_LANGUAGES=([a-z]{2}(?:,[a-z]{2})*)$/.exec(line)?.[1];
  if (value === undefined) return [...problems, `malformed release line: ${line}`];
  const codes = value.split(',');
  for (const c of codes) if (!RELEASABLE.includes(c)) problems.push(`not a releasable language: ${c}`);
  if (new Set(codes).size !== codes.length) problems.push(`duplicate language in: ${value}`);
  return problems;
}

const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];

describe('release flag (NEXT_PUBLIC_RELEASED_LANGUAGES)', () => {
  it('is off in this build: French not released, not built, not public', () => {
    expect(RELEASED_LANGUAGES).toEqual([]);
    expect(LOCALES).toEqual(['en']);
    expect(PUBLIC_LOCALES).toEqual(['en']);
    expect(previewLanguages().map((l) => l.code)).toEqual(['fr', 'de', 'es', 'it', 'nl', 'sv', 'nb']);
  });

  it('is set nowhere but .env.production (Cloudflare configs, Next / OpenNext configs, staging settings, workflows)', () => {
    expect([...CONFIGS].sort()).toEqual(['next.config.ts', 'open-next.config.ts', 'wrangler.jsonc', 'wrangler.staging.jsonc']);
    expect(WORKFLOWS).toContain('.github/workflows/deploy-cloudflare.yml');
    for (const f of RELEASE_FORBIDDEN_FILES) expect(read(f), f).not.toMatch(RELEASE_ASSIGNMENT);
  });

  it('in .env.production: absent, or ONE line listing releasable languages only (preview, not English, no duplicates)', () => {
    expect(releaseLineProblems(read('.env.production'))).toEqual([]);
  });

  it('the .env.production check accepts the documented release line and rejects anything else', () => {
    const env = (line: string) => `NEXT_PUBLIC_ALLOW_INDEXING=true\n${line}\nNEXT_PUBLIC_SITE_URL=https://sygmatv.com\n`;
    expect(RELEASABLE).toEqual(['fr', 'de', 'es', 'it', 'nl', 'sv', 'nb']);
    for (const ok of ['', '# NEXT_PUBLIC_RELEASED_LANGUAGES=xx (comment: no effect)', 'NEXT_PUBLIC_RELEASED_LANGUAGES=fr', 'NEXT_PUBLIC_RELEASED_LANGUAGES=fr,de,es,it,nl,sv,nb', 'NEXT_PUBLIC_RELEASED_LANGUAGES=nb,fr'])
      expect(releaseLineProblems(env(ok)), ok).toEqual([]);
    for (const bad of ['NEXT_PUBLIC_RELEASED_LANGUAGES=fr,xx', 'NEXT_PUBLIC_RELEASED_LANGUAGES=en', 'NEXT_PUBLIC_RELEASED_LANGUAGES=en,fr', 'NEXT_PUBLIC_RELEASED_LANGUAGES=fr,fr',
      'NEXT_PUBLIC_RELEASED_LANGUAGES=', 'NEXT_PUBLIC_RELEASED_LANGUAGES=FR', 'NEXT_PUBLIC_RELEASED_LANGUAGES=fr, de', 'NEXT_PUBLIC_RELEASED_LANGUAGES="fr"',
      'NEXT_PUBLIC_RELEASED_LANGUAGES=fr # comment', 'NEXT_PUBLIC_RELEASED_LANGUAGES=fr,', 'export NEXT_PUBLIC_RELEASED_LANGUAGES=fr', 'NEXT_PUBLIC_RELEASED_LANGUAGES = fr',
      'NEXT_PUBLIC_RELEASED_LANGUAGES=fr\nNEXT_PUBLIC_RELEASED_LANGUAGES=de', 'NEXT_PUBLIC_SITE_MODE=preview'])
      expect(releaseLineProblems(env(bad)), bad).not.toEqual([]);
  });

  it('NEXT_PUBLIC_SITE_MODE is never set in the production configuration (env file, Cloudflare config, workflows)', () => {
    for (const f of PRODUCTION_FILES) expect(read(f), f).not.toMatch(/NEXT_PUBLIC_SITE_MODE\s*[=:]/);
  });

  it('once set to « fr », French becomes enabled (built, public); other languages are unaffected', () => {
    const released = applyRelease(REGISTRY, ['fr']);
    expect(enabledLanguages(released).map((l) => l.code)).toEqual(['en', 'fr']);
    expect(builtLanguages(released, false).map((l) => l.code)).toEqual(['en', 'fr']);
    expect(previewLanguages(released).map((l) => l.code)).toEqual(['de', 'es', 'it', 'nl', 'sv', 'nb']);
  });

  it('can never release a disabled language (no complete dictionary)', () => {
    const withDisabled = REGISTRY.map((l) => (l.code === 'de' ? { ...l, status: 'disabled' as const } : l));
    expect(enabledLanguages(applyRelease(withDisabled, ['de'])).map((l) => l.code)).toEqual(['en']);
  });

  it('released French: /fr is served, former URLs point to the French home, legal URLs to the English pages (308)', () => {
    expect(legacyLanguageRedirects(applyRelease(REGISTRY, ['fr']), false)).toEqual([{ source: '/fr/legal/:path*', destination: '/legal/:path*', permanent: true }]);
  });
});

describe('all eight languages released together (phase 8)', () => {
  const all = applyRelease(REGISTRY, ['fr', 'de', 'es', 'it', 'nl', 'sv', 'nb']);
  it('reciprocal hreflang across the eight languages + x-default, same English slugs', () => {
    const set = hreflangAlternates('/help', { languages: all })!;
    expect(set).toEqual({ en: '/help', fr: '/fr/help', de: '/de/help', es: '/es/help', it: '/it/help', nl: '/nl/help', sv: '/sv/help', nb: '/nb/help', 'x-default': '/help' });
    expect(hreflangAlternates('', { languages: all })!['nb']).toBe('/nb');
  });
  it('legal pages stay English-only (no alternate); every language redirects its legal URLs to them', () => {
    expect(hreflangAlternates('/legal/privacy', { languages: all, availableIn: ['en'] })).toBeUndefined();
    expect(legacyLanguageRedirects(all, false).map((r) => r.source)).toEqual(['/fr', '/de', '/es', '/it', '/nl', '/sv', '/nb'].map((p) => `${p}/legal/:path*`));
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

describe('English security / privacy wording aligned with the French (phase 7D)', () => {
  // Interface texts only: the legal documents and their own page descriptions are not changed.
  const ui = strings([en.hero, en.cta, en.faq, en.help, en.request, en.checkout, en.footer, en.plans, en.benefits]).join('\n');
  it('no unsupported security / privacy claim', () => {
    for (const re of [/secure/i, /data protected/i, /privacy matters/i, /stored securely/i, /encrypt/i, /\bsafe\b/i])
      expect(ui, String(re)).not.toMatch(re);
  });
  it('the same verified fact in both languages', () => {
    expect(en.hero.checks[1]).toBe('Data Never Sold');
    expect(fr.hero.checks[1]).toBe('Données jamais vendues');
    expect(en.checkout.trust[0]).toBe('Data never sold');
    expect(fr.checkout.trust[0]).toBe('Données jamais vendues');
    expect(en.footer.chips[1]).toBe('Free trial');
    expect(fr.footer.chips[1]).toBe('Essai gratuit');
  });
});
