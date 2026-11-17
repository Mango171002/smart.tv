import { expect, test } from '@playwright/test';

/**
 * SEO international, phase 1 — production build: « / » is unchanged and no international version
 * is published (they only exist in the private preview environment).
 */
test.describe('international versions are not published in production', () => {
  test('« / » keeps its language, canonical, Open Graph and has no hreflang', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/?$/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    await expect(page.locator('.preview-ribbon')).toHaveCount(0);
    // Every internal link stays on the English home (no prefix).
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    expect(hrefs.filter((h) => /^\/[a-z]{2}-[a-z]{2}(\/|#|$)/.test(h))).toEqual([]);
  });

  for (const path of ['/fr-fr', '/fr-fr/legal/terms', '/de-de', '/en-gb']) {
    test(`${path} does not exist in production (404)`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(404);
    });
  }

  test('the sitemap still lists the same 6 English pages, without alternates', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
    expect(urls).toEqual(['/', '/legal/terms', '/legal/privacy', '/legal/cookies', '/legal/refunds', '/legal/imprint']);
    expect(xml).not.toContain('hreflang');
  });

  test('a request claiming a preview version is refused by the server', async ({ request, baseURL }) => {
    const res = await request.post('/api/contact', {
      headers: { origin: baseURL!, 'content-type': 'application/json' },
      data: { kind: 'trial_request', name: 'QA', email: 'qa@example.test', phone: '+33612345678', locale: 'fr-fr', consent: true },
    });
    expect(res.status()).toBe(400);
  });
});
