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

test.describe('phase 2 — French content (preview)', () => {
  const GUIDES = ['smart-tv', 'android-tv', 'fire-tv', 'apple-tv', 'iphone-ipad', 'android', 'ordinateur'];

  test('FAQ page: 10 questions, FAQPage + BreadcrumbList data, noindex, canonical', async ({ page }) => {
    await page.goto('/fr-fr/faq');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Questions fréquentes');
    await expect(page.locator('.faq-full details')).toHaveCount(10);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/fr-fr\/faq$/);
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = ld.map((t) => JSON.parse(t)['@type']);
    expect(types).toEqual(expect.arrayContaining(['FAQPage', 'BreadcrumbList']));
    const faq = ld.map((t) => JSON.parse(t)).find((d) => d['@type'] === 'FAQPage');
    expect(faq.mainEntity).toHaveLength(10);
  });

  test('guides: index and 7 device pages — one H1, breadcrumb, noindex, links inside /fr-fr', async ({ page }) => {
    await page.goto('/fr-fr/guides');
    await expect(page.locator('.guide-card')).toHaveCount(7);
    for (const slug of GUIDES) {
      await page.goto(`/fr-fr/guides/${slug}`);
      await expect(page.locator('h1'), slug).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]'), slug).toHaveAttribute('href', new RegExp(`/fr-fr/guides/${slug}$`));
      await expect(page.locator('meta[name="robots"]'), slug).toHaveAttribute('content', /noindex/);
      await expect(page.locator('.guide-steps li').first(), slug).toBeVisible();
      const title = await page.title();
      expect(title.length, slug).toBeLessThanOrEqual(60);
      const hrefs = await page.locator('main a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
      expect(hrefs.filter((h) => !h.startsWith('/fr-fr')), slug).toEqual([]);
    }
  });

  test('home: menu and footer link to the guides and the FAQ page; « see all questions »', async ({ page, isMobile }) => {
    await page.goto('/fr-fr');
    if (isMobile) await page.getByRole('button', { name: /menu/i }).click();
    const nav = page.getByRole('navigation', { name: 'Navigation principale' });
    await expect(nav.getByRole('link', { name: 'Guides' })).toHaveAttribute('href', '/fr-fr/guides');
    await expect(nav.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/fr-fr/faq');
    await expect(page.getByRole('link', { name: /Voir toutes les questions/ })).toHaveAttribute('href', '/fr-fr/faq');
    await expect(page.locator('footer').getByRole('link', { name: 'Guides d’installation' })).toHaveAttribute('href', '/fr-fr/guides');
  });

  test('legal pages are in French (body included)', async ({ page }) => {
    for (const [doc, h2] of [['terms', 'Comment se passe une commande'], ['privacy', 'Ce que nous collectons'], ['cookies', 'Les cookies que nous utilisons'], ['refunds', 'Satisfait ou remboursé'], ['imprint', 'Éditeur du site']]) {
      await page.goto(`/fr-fr/legal/${doc}`);
      await expect(page.locator('.terms-body'), doc).toContainText(h2!);
      await expect(page.locator('.terms-meta'), doc).toContainText('novembre');
    }
  });

  for (const [id, lang, text] of [
    ['fr-be', 'fr-BE', 'Prix TTC en euros'],
    ['fr-ch', 'fr-CH', 'francs suisses'],
    ['fr-ca', 'fr-CA', 'dollars canadiens'],
    ['en-gb', 'en-GB', 'pounds sterling'],
    ['en-ca', 'en-CA', 'Canadian dollars'],
  ] as const) {
    test(`${id}: preview version, own language, currency wording, no price, orders closed`, async ({ page }) => {
      await page.goto(`/${id}`);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/${id}$`));
      await expect(page.locator('#plans')).toContainText(text);
      await expect(page.locator('.tier-card')).toHaveCount(0);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    });
  }
});

test.describe('phase 3A — SEO and tracking of international versions', () => {
  test('titles ≤ 60 characters and descriptions 50–160 on the French pages', async ({ page }) => {
    for (const p of ['/fr-fr', '/fr-fr/faq', '/fr-fr/guides', '/fr-fr/guides/apple-tv', '/fr-fr/legal/terms', '/fr-fr/legal/privacy', '/fr-fr/legal/cookies', '/fr-fr/legal/refunds', '/fr-fr/legal/imprint']) {
      await page.goto(p);
      expect((await page.title()).length, p).toBeLessThanOrEqual(60);
      const d = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
      expect(d.length, p).toBeGreaterThanOrEqual(50);
      expect(d.length, p).toBeLessThanOrEqual(160);
    }
  });

  test('GA4 content group = site version (fr-fr), set before the GA4 configuration', async ({ page }) => {
    await page.route(/googletagmanager\.com|google-analytics\.com|clarity\.ms|c\.bing\.com/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    await page.addInitScript(() => {
      localStorage.setItem('sygma_analytics_force', '1');
      localStorage.setItem('sygma_consent', JSON.stringify({ v: 2, analytics: 'granted', marketing: 'denied', ts: new Date().toISOString() }));
    });
    await page.goto('/fr-fr');
    await expect(page.locator('html')).toHaveAttribute('data-site-version', 'fr-fr');
    await expect.poll(() => page.evaluate(() => document.querySelector('script[data-sygma="ga4"]') !== null)).toBe(true);
    const order = await page.evaluate(() => (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>)).filter((a) => a[0] === 'set' || a[0] === 'config').map((a) => JSON.stringify(a)));
    expect(order[0]).toBe(JSON.stringify(['set', { content_group: 'fr-fr' }]));
    expect(order[1]).toContain('"config","G-258WWPPN8Y"');
  });
});
