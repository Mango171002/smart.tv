import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Phase 7B — French preview.
 * Default run (production build): French does not exist, /fr keeps redirecting to the English page.
 * With E2E_SITE_MODE=preview (build made with NEXT_PUBLIC_SITE_MODE=preview): French pages, noindex, no sitemap,
 * no hreflang, French order window. With E2E_CONTENT_PAGES=preview as well: French About and Help center.
 */
const FR = process.env.E2E_SITE_MODE === 'preview';
const CONTENT = process.env.E2E_CONTENT_PAGES === 'preview';
const TOPICS = ['getting-started', 'devices', 'free-trial', 'ordering-payment', 'troubleshooting', 'contact-support', 'refunds'];

test.describe('French — production build (not built)', () => {
  test.skip(FR, 'production-mode checks');
  test('/fr and /fr/* keep redirecting to the English page; no French link, no French URL', async ({ page, request }) => {
    for (const [from, to] of [['/fr', '/'], ['/fr/legal/privacy', '/legal/privacy'], ['/fr/about', '/about']] as const) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(308);
      expect(res.headers()['location'], from).toBe(to);
    }
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('a[href^="/fr"], link[hreflang]')).toHaveCount(0);
    expect(await (await request.get('/sitemap.xml')).text()).not.toMatch(/\/fr[/<]/);
  });
});

test.describe('French — preview', () => {
  test.skip(!FR, 'needs a build with NEXT_PUBLIC_SITE_MODE=preview');

  const pages = [
    { path: '/fr', h1: /Le streaming premium/ },
    { path: '/fr/blog', h1: /Guides, conseils et actualités/ },
    ...(CONTENT
      ? [
          { path: '/fr/about', h1: /^À propos de SYGMA TV\+$/ },
          { path: '/fr/help', h1: /^Centre d’aide$/ },
          ...TOPICS.map((t) => ({ path: `/fr/help/${t}`, h1: /./ })),
        ]
      : []),
  ];

  for (const p of pages) {
    test(`${p.path}: French, noindex/nofollow (meta + header), self canonical, no hreflang`, async ({ page }) => {
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);
      expect(res?.headers()['x-robots-tag']).toBe('noindex, nofollow');
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${p.path}$`));
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'fr_FR');
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.h1);
      const title = await page.title();
      expect(title.length, title).toBeLessThanOrEqual(60);
      // Internal links stay in French, except the English legal pages (marked hreflang="en").
      const hrefs = await page.locator('main a[href^="/"], header a[href^="/"], footer a[href^="/"]').evaluateAll((as) => as.map((a) => [a.getAttribute('href') ?? '', a.getAttribute('hreflang')] as const));
      for (const [href, lang] of hrefs) {
        if (href.startsWith('/legal/')) continue;
        expect(href, href).toMatch(/^\/fr(\/|#|$)/);
        expect(lang).toBeNull();
      }
      await expect(page.locator('footer a[href^="/legal/"]').first()).toHaveAttribute('hreflang', 'en');
      const lds = await page.locator('script[type="application/ld+json"]').allTextContents();
      for (const ld of lds.map((t) => JSON.parse(t))) {
        for (const node of ld['@graph'] ?? [ld]) if (node.inLanguage) expect(node.inLanguage).toBe('fr');
      }
    });
  }

  test('legal pages are not translated: /fr/legal/* → English legal pages', async ({ request }) => {
    const res = await request.get('/fr/legal/privacy', { maxRedirects: 0 });
    expect([307, 308]).toContain(res.status());
    expect(res.headers()['location']).toBe('/legal/privacy');
  });

  test('sitemap and robots: no French URL, English unchanged', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).not.toMatch(/\/fr[/<]/);
    expect(xml).not.toMatch(/xhtml:link/);
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toMatch(/Sitemap:/);
  });

  test('English pages are not affected: English, no hreflang, no link to French', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    await expect(page.locator('a[href^="/fr"]')).toHaveCount(0);
  });

  test('home: French plans, simulator and order window (activation before payment)', async ({ page }) => {
    let sent: Record<string, unknown> | null = null;
    await page.route('**/api/contact', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { ok: true } });
    });
    await page.goto('/fr');
    await page.locator('#plans').scrollIntoViewIfNeeded();
    await page.locator('.offers[data-ready]').waitFor();
    await expect(page.locator('#plans-title')).toHaveText(/Choisissez votre formule/);
    await page.locator('.simulator [data-tier="plus"]').click();
    await page.locator('[data-term="24m"]').click();
    await page.getByRole('button', { name: /^Commander/ }).click();
    const dialog = page.getByTestId('checkout-dialog');
    await expect(dialog).toHaveAccessibleName('Finalisez votre commande');
    await expect(dialog).toContainText('Rien n’est débité sur ce site');
    await dialog.getByLabel('Adresse e-mail').fill('spectateur@example.test');
    await dialog.getByLabel('Votre pays').click();
    await dialog.getByRole('combobox', { name: 'Saisissez un pays…' }).fill('suis');
    await page.keyboard.press('Enter');
    await expect(dialog.getByRole('button', { name: 'Indicatif du pays' })).toHaveText(/Suisse \(\+41\)/);
    await dialog.getByLabel('Numéro WhatsApp').fill('79 123 45 67');
    await dialog.getByLabel('Appareil principal').selectOption('ios_mobile');
    await dialog.getByLabel(/J’accepte d’être contacté/).check();
    await dialog.getByRole('button', { name: /Vérifier ma commande/ }).click();
    await expect(dialog.getByTestId('quote-status')).toHaveText(/Prix confirmé par notre serveur/);
    await expect(dialog.getByTestId('review-plan')).toHaveText('Plus · 24 mois · 1 appareil');
    await expect(dialog.getByTestId('review-region')).toContainText('Suisse');
    await expect(dialog).toContainText('active votre accès, puis vous envoie les instructions de paiement');
    // Same price as the English page (pricing unchanged), French number format.
    await expect(dialog.getByTestId('review-price')).toHaveText(/^\d+(,\d{2})?\s\$\sUSD$/);
    await dialog.getByRole('button', { name: /Confirmer ma commande/ }).click();
    await expect(dialog.getByRole('heading', { name: /Commande reçue/ })).toBeVisible();
    expect(sent).toMatchObject({ kind: 'launch_waitlist', locale: 'fr', country: 'CH', phone: '+41791234567', tier: 'plus', term: '24m', streams: 1, consent: true });
  });

  test('French trial window', async ({ page }) => {
    await page.goto('/fr');
    await page.getByRole('button', { name: 'Essai gratuit' }).first().click();
    await expect(page.getByRole('dialog')).toContainText('Demandez votre');
    await expect(page.getByRole('dialog').getByLabel('Nom complet')).toBeVisible();
  });

  for (const path of ['/fr', ...(CONTENT ? ['/fr/about', '/fr/help', '/fr/help/ordering-payment'] : [])]) {
    test(`${path}: no accessibility violation (axe, WCAG 2.1 AA)`, async ({ page }) => {
      await page.goto(path);
      // The plans island hydrates when it nears the viewport, like for a real visitor (same as the English home checks).
      if (path === '/fr') {
        await page.locator('#plans').scrollIntoViewIfNeeded();
        await page.locator('.offers[data-ready]').waitFor();
        await page.evaluate(() => window.scrollTo(0, 0));
      }
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
    });
  }
});
