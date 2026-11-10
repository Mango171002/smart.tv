import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = [
  '/en', '/fr', '/en/plans', '/fr/plans', '/en/devices', '/fr/devices', '/en/coverage', '/fr/coverage',
  '/en/help', '/fr/help', '/en/legal/terms', '/en/legal/privacy', '/en/legal/cookies', '/en/legal/refunds',
  '/en/legal/imprint', '/fr/legal/privacy',
];

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
      for (const word of ['prototype', 'demo', 'démo', 'simulat', 'illustrative', 'indicatif']) {
        expect(text, `${route} contains "${word}"`).not.toContain(word);
      }
    }
  });
});

test.describe('plan configurator', () => {
  test('updates the price for region, duration and streams', async ({ page }) => {
    await page.goto('/en');
    const price = page.getByTestId('price');
    await expect(price).toHaveText('$79.00');
    await page.locator('[data-month="1"]').click();
    await expect(price).toHaveText('$14.00');
    await expect(page.locator('[data-month="1"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-stream="2"]').click();
    await expect(price).toHaveText('$21.70');
    await expect(page.getByTestId('selection')).toHaveText('1 month · 2 streams');
    await page.selectOption('#region', 'CA');
    await expect(price).toHaveText('CA$28.64');
    await page.selectOption('#region', 'EU');
    await expect(price).toHaveText('€19.96');
  });

  test('formats prices in French', async ({ page }) => {
    await page.goto('/fr');
    await page.selectOption('#region', 'EU');
    await expect(page.getByTestId('price')).toHaveText(/72,68\s€/);
  });

  test('price matrix lists all markets', async ({ page }) => {
    await page.goto('/en/plans');
    await expect(page.locator('table.matrix')).toHaveCount(3);
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
    await page.goto('/en');
    await page.locator('[data-stream="3"]').click();
    const opener = page.getByRole('button', { name: /^Pre-register/ });
    await opener.click();
    const dialog = page.getByTestId('checkout-dialog');
    await expect(dialog).toHaveAccessibleName('Pre-registration');
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();

    await dialog.getByLabel('Email address').fill('viewer@example.test');
    await dialog.getByLabel('Main device').selectOption('mobile');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: /Continue/ }).click();
    await expect(dialog.getByTestId('quote-status')).toHaveText(/Price confirmed by our server/);
    await expect(dialog.getByTestId('review-plan')).toHaveText('12 months · 3 streams');
    await expect(dialog.getByTestId('review-price')).toHaveText('$165.90 USD');

    await dialog.getByRole('button', { name: /Confirm my pre-registration/ }).click();
    await expect(dialog.getByRole('heading', { name: 'You are pre-registered!' })).toBeVisible();
    await expect(dialog).toContainText('viewer@example.test');
    expect(sent).toMatchObject({
      kind: 'launch_waitlist', email: 'viewer@example.test', market: 'US', durationMonths: 12, streams: 3, device: 'mobile', consent: true,
    });
    await dialog.getByRole('button', { name: 'Back to the website' }).click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('requires a valid email and consent before continuing', async ({ page }) => {
    await page.goto('/fr');
    await page.getByRole('button', { name: /^Me pré-inscrire/ }).click();
    const dialog = page.getByTestId('checkout-dialog');
    await dialog.getByRole('button', { name: /Continuer/ }).click();
    await expect(dialog.getByText('Saisissez une adresse e-mail valide.')).toBeVisible();
    await expect(dialog.getByText('Veuillez accepter d’être contacté au sujet du lancement.')).toBeVisible();
    await expect(dialog.getByLabel('Adresse e-mail')).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.getByTestId('quote-status')).toHaveCount(0);
  });

  test('shows a clear message when rate limited', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 429, json: { ok: false } }));
    await page.goto('/en');
    await page.getByRole('button', { name: /^Pre-register/ }).click();
    const dialog = page.getByTestId('checkout-dialog');
    await dialog.getByLabel('Email address').fill('viewer@example.test');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: /Continue/ }).click();
    await expect(dialog.getByTestId('quote-status')).toHaveText(/confirmed/);
    await dialog.getByRole('button', { name: /Confirm my pre-registration/ }).click();
    await expect(dialog.getByRole('alert')).toHaveText('Too many requests. Please try again later.');
  });

  test('traps focus and closes with Escape, restoring focus', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard test runs on desktop');
    await page.goto('/en');
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
    await page.goto('/en');
    const expected: Record<string, string> = {
      sports: 'rgb(209, 254, 23)', // #D1FE17
      movies: 'rgb(240, 68, 196)', // #F044C4
      live: 'rgb(25, 211, 243)', // #19D3F3
      streaming: 'rgb(104, 120, 255)', // #6878FF
    };
    const cards = page.locator('#content .cat-card');
    await expect(cards).toHaveCount(4);
    for (const [key, rgb] of Object.entries(expected)) {
      const icon = page.locator(`#content .cat-card[data-category="${key}"] .icon-box svg`).first();
      await expect(icon).toHaveCSS('color', rgb);
    }
    const cta = page.locator('.hero .btn').first();
    await expect(cta).toHaveCSS('background-color', 'rgb(25, 211, 243)');
    await expect(cta).toHaveCSS('color', 'rgb(7, 13, 23)');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(7, 13, 23)');
  });
});

test.describe('navigation', () => {
  test('mobile menu opens, navigates and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    await page.goto('/en');
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
    await page.goto('/en');
    await page.getByRole('button', { name: /^Pre-register/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible(); // the dialog is loaded on demand
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
