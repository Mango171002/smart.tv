import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { INDEXABLE, PRIVATE_ROBOTS, RELEASED_LANGS, expectedSet, ORDERS_OPEN } from './released';

/**
 * Phase 7B — French preview.
 * Default run (production build): French does not exist, /fr keeps redirecting to the English page.
 * With E2E_SITE_MODE=preview (build made with NEXT_PUBLIC_SITE_MODE=preview): French pages, noindex, no sitemap,
 * no hreflang, French order window. With E2E_CONTENT_PAGES=preview as well: French About and Help center.
 */
/** Phase 7C: E2E_RELEASED=fr = build made with NEXT_PUBLIC_RELEASED_LANGUAGES=fr (French public: indexable, hreflang, sitemap). */
const RELEASED = RELEASED_LANGS.includes('fr');
const FR = process.env.E2E_SITE_MODE === 'preview' || RELEASED;
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

test.describe('French — preview / released', () => {
  test.skip(!FR, 'needs a build with NEXT_PUBLIC_SITE_MODE=preview or NEXT_PUBLIC_RELEASED_LANGUAGES=fr');

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
    test(`${p.path}: French, ${RELEASED ? 'public (indexable where English is)' : 'noindex/nofollow (meta + header)'}, self canonical, hreflang`, async ({ page }) => {
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${p.path}$`));
      // Indexable French pages = the home (the blog is noindex, the content pages are noindex in « preview » mode).
      const indexable = RELEASED && p.path === '/fr';
      if (RELEASED) {
        expect(res?.headers()['x-robots-tag']).toBeUndefined();
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', indexable ? 'index, follow' : 'noindex, follow');
      } else {
        expect(res?.headers()['x-robots-tag']).toBe('noindex, nofollow');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
      }
      if (indexable) {
        // Reciprocal set, identical on the English page.
        const set = async () => Object.fromEntries(await page.locator('link[rel="alternate"][hreflang]').evaluateAll((ls) => ls.map((l) => [l.getAttribute('hreflang'), new URL(l.getAttribute('href')!).pathname])));
        const frSet = await set();
        expect(frSet).toEqual(expectedSet(''));
        await page.goto('/');
        expect(await set()).toEqual(frSet);
        await page.goto(p.path);
      } else {
        await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
      }
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'fr_FR');
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.h1);
      const title = await page.title();
      expect(title.length, title).toBeLessThanOrEqual(60);
      // Internal links stay in French, except the English legal pages (marked hreflang="en").
      const hrefs = await page.locator(':is(main, header, footer) a[href^="/"]:not([data-lang-switcher] a)').evaluateAll((as) => as.map((a) => [a.getAttribute('href') ?? '', a.getAttribute('hreflang')] as const));
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

  test(`sitemap and robots: ${RELEASED ? 'French home listed with reciprocal alternates' : 'no French URL'}`, async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    if (RELEASED) {
      const entry = (loc: string) => xml.split('<url>').find((u) => u.includes(`<loc>${loc}</loc>`))!;
      const alt = (u: string) => [...u.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]}=${new URL(m[2]!).pathname}`).sort();
      const home = entry(new URL('/', xml.match(/<loc>([^<]+)<\/loc>/)![1]!).href);
      const frHome = xml.split('<url>').find((u) => /<loc>[^<]+\/fr<\/loc>/.test(u))!;
      expect(alt(home)).toEqual(Object.entries(expectedSet('')).map(([k, v]) => `${k}=${v}`).sort());
      expect(alt(frHome)).toEqual(alt(home));
      expect(xml).not.toMatch(/\/fr\/legal|\/fr\/blog/);
    } else {
      expect(xml).not.toMatch(/\/fr[/<]/);
      expect(xml).not.toMatch(/xhtml:link/);
    }
    const robots = await (await request.get('/robots.txt')).text();
    if (INDEXABLE) expect(robots).toMatch(/Sitemap:/);
    else expect(robots, 'private build: no sitemap advertised, everything disallowed').toMatch(PRIVATE_ROBOTS);
  });

  test('English pages stay English; French is linked only from the language switcher', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(RELEASED ? RELEASED_LANGS.length + 2 : 0);
    await expect(page.locator('a[href^="/fr"]:not([data-lang-switcher] a)')).toHaveCount(0);
    // Phase 9: the switcher (desktop list + mobile menu section) links to the French home, marked hreflang="fr".
    await expect(page.locator('[data-lang-switcher] a[href="/fr"][hreflang="fr"]')).toHaveCount(2);
  });

  test('home: French plans, simulator and order window (activation before payment)', async ({ page }) => {
    test.skip(!ORDERS_OPEN, 'online requests closed in this build (prelaunch): covered by prelaunch.spec.ts');
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
    await expect(dialog.getByTestId('review-price')).toHaveText(/^\d+(,\d{2})?\s\$\sUS$/);
    await dialog.getByRole('button', { name: /Confirmer ma commande/ }).click();
    await expect(dialog.getByRole('heading', { name: /Commande reçue/ })).toBeVisible();
    expect(sent).toMatchObject({ kind: 'launch_waitlist', locale: 'fr', country: 'CH', phone: '+41791234567', tier: 'plus', term: '24m', streams: 1, consent: true });
  });

  test('French 404: unknown /fr URLs answer 404 with the French page (status from the server)', async ({ page, request }) => {
    for (const path of ['/fr/nope', '/fr/help/nope', '/fr/a/b/c']) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(404);
    }
    const res = await page.goto('/fr/nope');
    expect(res?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cette page n’existe pas.');
    await expect(page).toHaveTitle('Page introuvable | SYGMA TV+');
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
    await expect(page.locator('main a.btn')).toHaveAttribute('href', '/fr');
  });

  test('French trial window', async ({ page }) => {
    test.skip(!ORDERS_OPEN, 'online requests closed in this build (prelaunch): covered by prelaunch.spec.ts');
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
