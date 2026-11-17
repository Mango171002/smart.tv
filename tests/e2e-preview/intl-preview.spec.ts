import AxeBuilder from '@axe-core/playwright';
import { expect, request as pwRequest, test, type Page } from '@playwright/test';

/**
 * Private preview of the international versions (SEO phase 1): /fr-fr is built, protected,
 * never indexable, without orders; the English home behaves as in production.
 */
const DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 };

async function stubThirdParties(page: Page) {
  const hits: string[] = [];
  await page.route(/googletagmanager\.com|google-analytics\.com|clarity\.ms|c\.bing\.com/, (route) => {
    hits.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
  });
  return hits;
}

test.describe('access protection', () => {
  test('without the password, nothing is served (pages, files, API)', async ({ baseURL }) => {
    const anon = await pwRequest.newContext({ baseURL, httpCredentials: undefined });
    for (const p of ['/', '/fr-fr', '/fr-fr/legal/terms', '/sitemap.xml', '/images/cat-sports-400.webp', '/api/health']) {
      const res = await anon.get(p, { maxRedirects: 0 });
      expect(res.status(), p).toBe(401);
      expect(res.headers()['x-robots-tag'], p).toMatch(/noindex/);
    }
    await anon.dispose();
  });

  test('with the password: noindex everywhere, every order / request API refused', async ({ request }) => {
    const page = await request.get('/fr-fr');
    expect(page.status()).toBe(200);
    expect(page.headers()['x-robots-tag']).toMatch(/noindex/);
    for (const p of ['/api/contact', '/api/quote', '/api/checkout']) {
      const res = await request.post(p, { data: { kind: 'trial_request', locale: 'en', email: 'qa@example.test' } });
      expect(res.status(), p).toBe(403);
    }
  });
});

test.describe('/fr-fr (French, preview)', () => {
  test('language, canonical, robots, Open Graph — and no hreflang', async ({ page }) => {
    await page.goto('/fr-fr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-FR');
    await expect(page).toHaveTitle('SYGMA TV+ — Abonnement streaming international');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/fr-fr$/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'fr_FR');
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(ld['@graph'][1]).toMatchObject({ '@type': 'WebSite', inLanguage: 'fr-FR' });
    await expect(page.locator('.preview-ribbon')).toBeVisible();
  });

  test('every internal link stays in /fr-fr', async ({ page }) => {
    await page.goto('/fr-fr');
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    expect(hrefs.length).toBeGreaterThan(10);
    expect(hrefs.filter((h) => !h.startsWith('/fr-fr'))).toEqual([]);
  });

  test('prices: no converted price — « prices coming soon » until the EUR grid is validated', async ({ page }) => {
    await page.goto('/fr-fr');
    await expect(page.locator('.prices-soon')).toContainText('Prix bientôt disponibles');
    await expect(page.locator('#plans')).not.toContainText('$');
    await expect(page.locator('.tier-card')).toHaveCount(0);
  });

  test('orders and trials closed: a notice, never the request window', async ({ page, isMobile }) => {
    await page.goto('/fr-fr');
    if (isMobile) await page.getByRole('button', { name: /menu/i }).click();
    await page.getByRole('button', { name: 'Essai gratuit' }).first().click();
    await expect(page.getByTestId('closed-notice')).toContainText('Bientôt disponible');
    await expect(page.getByTestId('request-dialog')).toHaveCount(0);
    await page.getByTestId('closed-notice').getByRole('button', { name: 'Fermer' }).click();
    await expect(page.getByTestId('closed-notice')).toHaveCount(0);
    await page.locator('.support-fab').click();
    await expect(page.getByTestId('closed-notice')).toBeVisible();
  });

  test('cookie banner in French; Consent Mode v2 identical (Analytics only → ads denied, blocked)', async ({ page }) => {
    const hits = await stubThirdParties(page);
    await page.addInitScript(() => localStorage.setItem('sygma_analytics_force', '1'));
    await page.goto('/fr-fr');
    const banner = page.getByTestId('consent-banner');
    await expect(banner.getByRole('button', { name: 'Tout accepter' })).toBeVisible();
    await expect(banner.getByRole('link', { name: 'Politique cookies' })).toHaveAttribute('href', '/fr-fr/legal/cookies');
    await banner.getByRole('button', { name: 'Personnaliser' }).click();
    await banner.getByRole('checkbox', { name: /Mesure d’audience/ }).check();
    await expect(banner.locator('.btn-lime')).toHaveText('Enregistrer mes choix');
    await banner.locator('.btn-lime').click();
    await expect.poll(() => hits.some((h) => h.includes('gtag/js'))).toBe(true);
    const calls = await page.evaluate(() => (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>)).filter((a) => a[0] === 'consent'));
    expect(calls[0]).toEqual(['consent', 'default', DENIED]);
    expect(calls.at(-1)).toEqual(['consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }]);
    expect(await page.evaluate(() => document.getElementById('sygma-no-ads-csp') !== null)).toBe(true);
    expect(hits.some((h) => h.includes('gtm.js'))).toBe(false);
  });

  test('legal pages: French navigation, links in /fr-fr', async ({ page }) => {
    await page.goto('/fr-fr/legal/refunds');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-FR');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Remboursement et résiliation');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/fr-fr\/legal\/refunds$/);
    const nav = await page.locator('.legal-nav a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(nav).toEqual(['/fr-fr/legal/terms', '/fr-fr/legal/privacy', '/fr-fr/legal/cookies', '/fr-fr/legal/refunds', '/fr-fr/legal/imprint']);
  });

  test('URLs: trailing slash redirects, unknown version and unknown page give the French 404', async ({ request, page }) => {
    const slash = await request.get('/fr-fr/', { maxRedirects: 0 });
    expect(slash.status()).toBe(308);
    expect(slash.headers().location).toMatch(/\/fr-fr$/);
    expect((await request.get('/xx-yy', { maxRedirects: 0 })).status()).toBe(404);
    await page.goto('/fr-fr/page-inconnue');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cette page n’existe pas.');
  });

  test('the preview sitemap does not list the preview version', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).not.toContain('/fr-fr');
  });

  test('mobile layout: no horizontal scrolling; no accessibility violation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const p of ['/fr-fr', '/fr-fr/legal/privacy']) {
      await page.goto(p);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), p).toBeLessThanOrEqual(0);
    }
    await page.goto('/fr-fr');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).exclude('.consent-banner').analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  test('no JavaScript error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/fr-fr');
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } });
    expect(errors).toEqual([]);
  });
});
