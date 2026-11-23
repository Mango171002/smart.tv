import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The sitemap follows the same switch as robots.txt (siteConfig.allowIndexing, NEXT_PUBLIC_ALLOW_INDEXING === 'true').
 * Staging / previews (indexing not allowed): no URL at all, even with the content pages « live ».
 */
async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  const [{ default: sitemap }, { default: robots }] = await Promise.all([import('@/app/sitemap'), import('@/app/robots')]);
  return { sitemap: sitemap(), robots: robots() };
}

describe('sitemap and indexing switch', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

  it('indexing not allowed (staging settings): empty sitemap, robots disallows everything and advertises no sitemap', async () => {
    for (const allow of ['false', '', 'TRUE', '1']) {
      const { sitemap, robots } = await load({ NEXT_PUBLIC_ALLOW_INDEXING: allow, NEXT_PUBLIC_CONTENT_PAGES: 'live', NEXT_PUBLIC_SITE_MODE: 'preview', NEXT_PUBLIC_SITE_URL: 'https://staging.sygmatv.com' });
      expect(sitemap, allow).toEqual([]);
      expect(robots, allow).toEqual({ rules: { userAgent: '*', disallow: '/' } });
    }
  });

  it('indexing allowed (production settings): the current public URLs, unchanged', async () => {
    const { sitemap, robots } = await load({ NEXT_PUBLIC_ALLOW_INDEXING: 'true', NEXT_PUBLIC_CONTENT_PAGES: '', NEXT_PUBLIC_SITE_URL: 'https://sygmatv.com' });
    expect(sitemap.map((e) => e.url)).toEqual(['/', '/legal/terms', '/legal/privacy', '/legal/cookies', '/legal/refunds', '/legal/imprint'].map((p) => `https://sygmatv.com${p}`));
    expect(sitemap[0]).toEqual({ url: 'https://sygmatv.com/', changeFrequency: 'monthly', priority: 1 });
    expect(sitemap[1]).toEqual({ url: 'https://sygmatv.com/legal/terms', lastModified: '2026-11-17', changeFrequency: 'monthly', priority: 0.6 });
    expect(robots).toEqual({ rules: { userAgent: '*', allow: '/', disallow: '/api/' }, sitemap: 'https://sygmatv.com/sitemap.xml' });
  });

  it('indexing allowed with the content pages live: 15 URLs', async () => {
    const { sitemap } = await load({ NEXT_PUBLIC_ALLOW_INDEXING: 'true', NEXT_PUBLIC_CONTENT_PAGES: 'live', NEXT_PUBLIC_SITE_URL: 'https://sygmatv.com' });
    expect(sitemap).toHaveLength(15);
  });
});
