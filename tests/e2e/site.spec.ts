import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = [
  '/en', '/fr', '/en/plans', '/fr/plans', '/en/devices', '/fr/devices', '/en/coverage', '/fr/coverage',
  '/en/help', '/fr/help', '/en/legal/terms', '/en/legal/privacy', '/en/legal/cookies', '/en/legal/refunds',
  '/en/legal/imprint', '/fr/legal/privacy',
];


/** Home page; the plans island hydrates when it nears the viewport, like for a real visitor. */
async function openHome(page: import('@playwright/test').Page, path: '/en' | '/fr') {
  await page.goto(path);
  await page.locator('#plans').scrollIntoViewIfNeeded();
  await page.locator('.offers[data-ready]').waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
}

test.describe('routing & SEO', () => {
  test('every route renders with a unique title, h1, canonical and hreflang', async ({ page }) => {
    const titles = new Set<string>();
    for (const route of ROUTES) {
      const res = await page.goto(route);
      expect(res?.status(), route).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(1);
      titles.add(`${route.slice(0, 3)}:${await page.title()}`);
    }
    expect(titles.size).toBeGreaterThanOrEqual(ROUTES.length - 1);
  });

  test('root redirects using Accept-Language', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'fr-CA', extraHTTPHeaders: { 'accept-language': 'fr-CA,fr;q=0.9' } });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/fr$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await ctx.close();
  });

  test('unknown pages return a localized 404', async ({ page }) => {
    const res = await page.goto('/fr/does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cette page n’existe pas.');
  });

  test('language switcher keeps the current page', async ({ page }) => {
    await page.goto('/en/devices');
    await page.getByRole('group', { name: 'Display language' }).getByRole('link', { name: 'FR' }).click();
    await expect(page).toHaveURL(/\/fr\/devices$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('robots.txt is served', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/User-Agent: \*/i);
  });

  test('no prototype or demo wording remains', async ({ page }) => {
    for (const route of ['/en', '/fr', '/en/plans', '/fr/help']) {
      await page.goto(route);
      const text = (await page.locator('body').innerText()).toLowerCase();
      // "Simulateur / Simulator" (the price simulator) is fine; a *simulated* checkout is not.
      for (const word of ['prototype', 'demo', 'démo', 'simulation', 'simulé', 'simulated', 'illustrative', 'indicatif']) {
        expect(text, `${route} contains "${word}"`).not.toContain(word);
      }
    }
  });
});

test.describe('offers: Starter / Plus / Ultra + simulator', () => {
  test('shows the three yearly plans with Plus recommended', async ({ page }) => {
    await openHome(page, '/en');
    await expect(page.getByTestId('tier-price-starter')).toHaveText('$49');
    await expect(page.getByTestId('tier-price-plus')).toHaveText('$59');
    await expect(page.getByTestId('tier-price-ultra')).toHaveText('$69');
    await expect(page.locator('.tier-card.is-recommended')).toHaveAttribute('data-tier', 'plus');
    await expect(page.locator('.tier-card.is-recommended .tier-badge')).toHaveText('Recommended');
  });

  test('simulator: plan, duration and screens update price, monthly equivalent and savings', async ({ page }) => {
    await openHome(page, '/en');
    const price = page.getByTestId('price');
    await expect(page.getByTestId('selection')).toHaveText('Plus · 12 months · 1 device');
    await expect(price).toHaveText('$59');
    await page.locator('.simulator [data-tier="starter"]').click();
    await page.locator('[data-term="36m"]').click();
    await expect(page.getByTestId('selection')).toHaveText('Starter · 36 months · 1 device');
    await expect(price).toHaveText('$99');
    await expect(page.locator('.price-sub')).toHaveText('≈ $2.75 / month');
    await expect(page.getByTestId('savings')).toHaveText('Save $48 compared with 3 × 12 months');
    await page.locator('[data-stream="3"]').click();
    await expect(page.getByTestId('selection')).toHaveText('Starter · 36 months · 3 devices');
    await expect(price).toHaveText('$159');
    await expect(page.locator('[data-stream="2"] .choice-note')).toHaveText('+$30');
    await page.locator('.simulator [data-tier="ultra"]').click();
    await page.locator('[data-term="lifetime"]').click();
    await page.locator('[data-stream="4"]').click();
    await expect(price).toHaveText('$349');
    await expect(page.locator('.price-sub')).toHaveText('One-time payment');
    await expect(page.getByTestId('savings')).toHaveCount(0);
  });

  test('each plan benefit fits on one line, nothing cut off', async ({ page }) => {
    for (const width of [390, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/en', '/fr'] as const) {
        await openHome(page, path);
        const bad = await page.locator('.tier-features li').evaluateAll((els) =>
          els
            .filter((li) => {
              const span = li.querySelector('span')!;
              return li.getBoundingClientRect().height > 30 || span.scrollWidth > span.clientWidth + 1;
            })
            .map((li) => li.textContent),
        );
        expect(bad, `${path} @ ${width}px`).toEqual([]);
      }
    }
  });

  test('"Choose" on a plan card selects it in the simulator', async ({ page }) => {
    await openHome(page, '/en');
    await page.getByRole('button', { name: 'Choose Ultra' }).click();
    await expect(page.locator('.simulator [data-tier="ultra"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('price')).toHaveText('$69');
  });

  test('formats prices in French', async ({ page }) => {
    await openHome(page, '/fr');
    await expect(page.getByTestId('tier-price-starter')).toHaveText(/^49\s\$$/);
    await page.locator('[data-term="24m"]').click();
    await expect(page.getByTestId('price')).toHaveText(/^95\s\$$/);
  });

  test('price matrix lists every plan and duration, with the extra-screen rule', async ({ page }) => {
    await page.goto('/en/plans');
    const table = page.locator('table.matrix');
    await expect(table).toHaveCount(1);
    await expect(table.locator('tbody tr')).toHaveCount(3);
    await expect(table.locator('thead th')).toHaveCount(5);
    await expect(table).toContainText('$199');
    await expect(page.locator('.matrix-note')).toContainText('+$10 for 12 months');
    await expect(page.getByTestId('price-source')).toBeVisible();
  });
});

test.describe('pre-registration', () => {
  test('pre-registers with the selected plan in three steps', async ({ page }) => {
    let sent: Record<string, unknown> | null = null;
    await page.route('**/api/contact', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { ok: true } });
    });
    await openHome(page, '/en');
    await page.locator('.simulator [data-tier="ultra"]').click();
    await page.locator('[data-term="24m"]').click();
    await page.locator('[data-stream="2"]').click();
    const opener = page.getByRole('button', { name: /^Pre-register/ });
    await opener.click();
    const dialog = page.getByTestId('checkout-dialog');
    await expect(dialog).toHaveAccessibleName('Pre-registration');
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();

    await dialog.getByLabel('Email address').fill('viewer@example.test');
    await dialog.getByLabel('Your region').selectOption('CA');
    await dialog.getByLabel('Main device').selectOption('mobile');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: /Continue/ }).click();
    await expect(dialog.getByTestId('quote-status')).toHaveText(/Price confirmed by our server/);
    await expect(dialog.getByTestId('review-plan')).toHaveText('Ultra · 24 months · 2 devices');
    await expect(dialog.getByTestId('review-region')).toContainText('Canada');
    await expect(dialog.getByTestId('review-price')).toHaveText('$129 USD');

    await dialog.getByRole('button', { name: /Confirm my pre-registration/ }).click();
    await expect(dialog.getByRole('heading', { name: 'You are pre-registered!' })).toBeVisible();
    await expect(dialog).toContainText('viewer@example.test');
    expect(sent).toMatchObject({
      kind: 'launch_waitlist', email: 'viewer@example.test', market: 'CA', tier: 'ultra', term: '24m', streams: 2, device: 'mobile', consent: true,
    });
    await dialog.getByRole('button', { name: 'Back to the website' }).click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('requires a valid email and consent before continuing', async ({ page }) => {
    await openHome(page, '/fr');
    await page.getByRole('button', { name: /^Me pré-inscrire/ }).click();
    const dialog = page.getByTestId('checkout-dialog');
    await dialog.getByRole('button', { name: /Continuer/ }).click();
    await expect(dialog.getByText('Saisissez une adresse e-mail valide.')).toBeVisible();
    await expect(dialog.getByText('Veuillez accepter d’être contacté au sujet du lancement.')).toBeVisible();
    await expect(dialog.getByText('Choisissez votre région.')).toBeVisible();
    await expect(dialog.getByLabel('Adresse e-mail')).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.getByTestId('quote-status')).toHaveCount(0);
  });

  test('dialog stays still when hovered and lives in <body> (regression)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover only exists on desktop');
    await openHome(page, '/en');
    await page.getByRole('button', { name: /^Pre-register/ }).click();
    const checkbox = page.getByTestId('checkout-dialog').getByRole('checkbox');
    await checkbox.hover();
    const before = await checkbox.boundingBox();
    await page.waitForTimeout(400);
    expect(await checkbox.boundingBox()).toEqual(before);
    expect(await page.evaluate(() => document.querySelector('.overlay')?.parentElement === document.body)).toBe(true);
  });

  test('shows a clear message when rate limited', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 429, json: { ok: false } }));
    await openHome(page, '/en');
    await page.getByRole('button', { name: /^Pre-register/ }).click();
    const dialog = page.getByTestId('checkout-dialog');
    await dialog.getByLabel('Email address').fill('viewer@example.test');
    await dialog.getByLabel('Your region').selectOption('US');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: /Continue/ }).click();
    await expect(dialog.getByTestId('quote-status')).toHaveText(/confirmed/);
    await dialog.getByRole('button', { name: /Confirm my pre-registration/ }).click();
    await expect(dialog.getByRole('alert')).toHaveText('Too many requests. Please try again later.');
  });

  test('traps focus and closes with Escape, restoring focus', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard test runs on desktop');
    await openHome(page, '/en');
    const opener = page.getByRole('button', { name: /^Pre-register/ });
    await opener.click();
    const dialog = page.getByRole('dialog');
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });
});

test.describe('Electric Fusion Neon design system', () => {
  test('category icons use the official colours and the primary CTA is cyan', async ({ page }) => {
    await openHome(page, '/en');
    const expected: Record<string, string> = {
      sports: 'rgb(209, 254, 23)', // #D1FE17
      movies: 'rgb(240, 68, 196)', // #F044C4
      live: 'rgb(25, 211, 243)', // #19D3F3
      streaming: 'rgb(104, 120, 255)', // #6878FF
    };
    const cards = page.locator('#content .cat-card');
    await expect(cards).toHaveCount(4);
    for (const [key, rgb] of Object.entries(expected)) {
      const icon = page.locator(`#content .cat-card[data-category="${key}"] .cat-icon svg`).first();
      await expect(icon).toHaveCSS('color', rgb);
    }
    const cta = page.locator('.hero .btn').first();
    await expect(cta).toHaveCSS('background-color', 'rgb(25, 211, 243)');
    await expect(cta).toHaveCSS('color', 'rgb(7, 13, 23)');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(7, 13, 23)');
  });
});

test.describe('home page (approved mock-up)', () => {
  test('most watched: 12 genres with region, arrows on desktop, dots everywhere', async ({ page, isMobile }) => {
    await openHome(page, '/en');
    const carousel = page.getByRole('region', { name: 'Most watched genres' });
    await expect(carousel).toHaveAttribute('data-ready', 'true'); // wait for hydration
    await expect(carousel.getByRole('group')).toHaveCount(12);
    await expect(carousel.getByRole('group', { name: /American football/ })).toContainText('USA');
    await expect(carousel.getByRole('group', { name: /Ice hockey/ })).toContainText('Canada');
    if (!isMobile) {
      const next = carousel.getByRole('button', { name: 'Next' });
      await expect(next).toBeVisible();
      await next.click();
      await expect(page.getByRole('button', { name: '2 of 12', exact: true })).toHaveAttribute('aria-current', 'true');
    }
    await page.getByRole('button', { name: '12 of 12', exact: true }).click();
    await expect(page.getByRole('button', { name: '12 of 12', exact: true })).toHaveAttribute('aria-current', 'true');
    const imgs = await carousel.locator('img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).getAttribute('src')));
    expect(new Set(imgs).size).toBe(12);
  });

  test('announcement bar links to pre-registration', async ({ page }) => {
    await openHome(page, '/fr');
    await page.getByRole('link', { name: /S’inscrire à l’alerte/ }).click();
    await expect(page).toHaveURL(/\/fr\/help#prereg$/);
    await expect(page.locator('#prereg')).toBeVisible();
  });

  test('category cards lead to the content page', async ({ page }) => {
    await openHome(page, '/en');
    await page.locator('#content .cat-card[data-category="movies"]').click();
    await expect(page).toHaveURL(/\/en\/coverage$/);
  });

  test('no third-party brand names are shown', async ({ page }) => {
    for (const route of ['/en', '/fr']) {
      await page.goto(route);
      const text = (await page.locator('body').innerText()).toLowerCase();
      for (const word of ['uefa', 'champions league', 'nba', 'avatar', 'house of the dragon', 'f1', 'formula 1']) {
        expect(text, `${route} mentions ${word}`).not.toContain(word);
      }
    }
  });
});

test.describe('layout (fluid container)', () => {
  for (const width of [390, 768, 1024, 1180, 1280, 1440, 1920, 2560]) {
    test(`aligned edges and no horizontal scroll at ${width}px`, async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await openHome(page, '/fr');
      const m = await page.evaluate(() => {
        const left = (s: string) => Math.round(document.querySelector(s)!.getBoundingClientRect().left);
        const g = document.querySelector('.cat-grid')!.getBoundingClientRect();
        return {
          brand: left('.brand'), hero: left('.hero-copy'), cats: left('.cat-grid'), features: left('.features-bar'),
          width: g.width, overflow: document.documentElement.scrollWidth - innerWidth,
        };
      });
      expect(m.overflow).toBeLessThanOrEqual(0);
      // brand, hero text, cards and features bar share the same left edge
      for (const v of [m.hero, m.cats, m.features]) expect(Math.abs(v - m.brand)).toBeLessThanOrEqual(1);
      expect(m.brand).toBeGreaterThanOrEqual(16);
      // desktop: the content occupies 80% of the screen width
      if (width >= 1024) expect(Math.abs(m.width - width * 0.8)).toBeLessThanOrEqual(2);
      await page.close();
    });
  }
});

test.describe('navigation', () => {
  test('mobile menu opens, navigates and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    await openHome(page, '/en');
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Devices' }).click();
    await expect(page).toHaveURL(/\/en\/devices$/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('no horizontal scrolling', async ({ page }) => {
    for (const r of ['/en', '/fr/plans', '/en/help']) {
      await page.goto(r);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, r).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('help forms (network mocked)', () => {
  test('validates client-side and reports success', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 201, json: { ok: true } }));
    await page.goto('/en/help');
    const form = page.getByTestId('form-support');
    test.skip((await form.count()) === 0, 'contact form disabled in this build');
    await form.getByRole('button', { name: 'Send question' }).click();
    await expect(form.getByText('Please check the highlighted fields.')).toBeVisible();
    await expect(form.getByLabel('Email address')).toHaveAttribute('aria-invalid', 'true');
    await form.getByLabel('Name', { exact: true }).fill('Alex');
    await form.getByLabel('Email address').fill('alex@example.test');
    await form.getByLabel('Subject').fill('Setup');
    await form.getByLabel('Message').fill('How will device setup work?');
    await form.getByRole('checkbox').check();
    await form.getByRole('button', { name: 'Send question' }).click();
    await expect(form.getByText('Thank you — your question has been recorded.')).toBeVisible();
  });

  test('shows a rate-limit message', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 429, json: { ok: false } }));
    await page.goto('/fr/help');
    const form = page.getByTestId('form-launch_waitlist');
    test.skip((await form.count()) === 0, 'contact form disabled in this build');
    await form.getByLabel('Adresse e-mail').fill('alex@example.test');
    await form.getByRole('checkbox').check();
    await form.getByRole('button', { name: 'Me prévenir' }).click();
    await expect(form.getByText('Trop de demandes. Veuillez réessayer plus tard.')).toBeVisible();
  });
});

test.describe('accessibility (axe, WCAG 2.1 AA)', () => {
  for (const route of ['/en', '/fr/plans', '/en/help', '/en/devices', '/en/coverage', '/en/legal/privacy']) {
    test(`no violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
    });
  }

  test('checkout dialog has no violations', async ({ page }) => {
    await openHome(page, '/en');
    await page.getByRole('button', { name: /^Pre-register/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible(); // the dialog is loaded on demand
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
