import { afterEach, describe, expect, it, vi } from 'vitest';
import { ABOUT, HELP_HUB, HELP_TOPICS } from '@/content/en/info';
import { siteConfig } from '@/config/site';

const pages = [ABOUT, ...HELP_TOPICS];
const allText = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(allText) : v && typeof v === 'object' ? Object.values(v).flatMap(allText) : []);

describe('About us + Help center content (phase 5C, not published)', () => {
  it('titles ≤ 60 characters with the brand suffix, descriptions ≤ 155, all unique', () => {
    const titles = [...pages.map((p) => p.metaTitle), HELP_HUB.metaTitle].map((t) => `${t} | ${siteConfig.brandName}`);
    const descs = [...pages.map((p) => p.description), HELP_HUB.description];
    for (const t of titles) expect(t.length, t).toBeLessThanOrEqual(60);
    for (const d of descs) { expect(d.length, d).toBeLessThanOrEqual(155); expect(d.length, d).toBeGreaterThanOrEqual(90); }
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descs).size).toBe(descs.length);
  });

  it('7 help topics, unique slugs, each with at least 2 sections', () => {
    expect(HELP_TOPICS.map((t) => t.slug)).toEqual(['getting-started', 'devices', 'free-trial', 'ordering-payment', 'troubleshooting', 'contact-support', 'refunds']);
    for (const t of HELP_TOPICS) expect(t.sections.length, t.slug).toBeGreaterThanOrEqual(2);
  });

  it('no unverified commercial claim (catalogue, channels, sports, quality, superlatives, IPTV)', () => {
    const text = allText([ABOUT, HELP_HUB, HELP_TOPICS]).join('\n');
    const forbidden = [/\d{1,3},\d{3}/, /\d+\s*\+/, /\bbest\b/i, /\bultimate\b/i, /\biptv\b/i, /\bvip\b/i, /premium/i, /replay/i, /\b4k\b/i, /\bhdr\b/i, /\bchannels?\b/i, /\bsports?\b/i, /catalog/i, /servers?/i, /help centre/i, /step-by-step guide/i,
      // Owner information not published until proven (M6 PDF invoice, M7 app names, M8 market list) and no guarantee wording.
      /\bpdf\b/i, /invoice/i, /smarters/i, /ibo player/i, /\b(france|belgium|switzerland|germany|spain|italy|netherlands|united kingdom)\b/i, /guarantee(d)? (reply|response|activation)/i, /\binstant(ly)? activ/i];
    for (const re of forbidden) expect(text, String(re)).not.toMatch(re);
  });

  it('declared times are always « usually », never a promise', () => {
    const text = allText([ABOUT, HELP_HUB, HELP_TOPICS]).join('\n');
    for (const m of text.matchAll(/[^.]*(within an hour|under an hour)[^.]*\./g)) expect(m[0], m[0]).toMatch(/usually|usual/i);
  });

  it('every payment method is presented as arranged by our team, not charged on the site', () => {
    const pay = HELP_TOPICS.find((t) => t.slug === 'ordering-payment')!.sections.find((x) => x.id === 'pay')!;
    expect(JSON.stringify(pay)).toMatch(/arranged manually by our team/);
    expect(JSON.stringify(pay)).toMatch(/No payment and no card details are requested on this website/);
  });

  it('company facts come from the verified configuration', () => {
    const facts = ABOUT.sections.find((s) => s.id === 'company')!.body[0] as { facts: Array<[string, string | null]> };
    expect(Object.fromEntries(facts.facts)).toMatchObject({ Company: siteConfig.legalEntity, EIN: siteConfig.companyNumber, 'Registered address': siteConfig.legalAddress });
  });
});

describe('sitemap and the content-pages switch', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

  it('off (production today): the 6 current URLs only', async () => {
    vi.stubEnv('NEXT_PUBLIC_CONTENT_PAGES', '');
    const { default: sitemap } = await import('@/app/sitemap');
    expect(sitemap().map((e) => new URL(e.url).pathname)).toEqual(['/', '/legal/terms', '/legal/privacy', '/legal/cookies', '/legal/refunds', '/legal/imprint']);
  });

  it('preview: still not in the sitemap', async () => {
    vi.stubEnv('NEXT_PUBLIC_CONTENT_PAGES', 'preview');
    vi.resetModules();
    const { default: sitemap } = await import('@/app/sitemap');
    expect(sitemap()).toHaveLength(6);
  });

  it('live: About + Help center + 7 topics, with the « Last reviewed » date', async () => {
    vi.stubEnv('NEXT_PUBLIC_CONTENT_PAGES', 'live');
    vi.resetModules();
    const { default: sitemap } = await import('@/app/sitemap');
    const entries = sitemap();
    expect(entries).toHaveLength(15);
    const about = entries.find((e) => e.url.endsWith('/about'))!;
    expect(about.lastModified).toBe('2026-11-20');
    expect(entries.filter((e) => e.url.includes('/help/'))).toHaveLength(7);
  });
});
