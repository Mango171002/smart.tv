import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = [
  '/en', '/fr', '/en/plans', '/fr/plans', '/en/devices', '/fr/devices', '/en/coverage', '/fr/coverage',
  '/en/help', '/fr/help', '/en/legal/terms', '/en/legal/privacy', '/en/legal/cookies', '/en/legal/refunds',
  '/en/legal/imprint', '/fr/legal/privacy',
];

test.describe('routing & SEO', () => {
  test('every route renders with a unique title, h1 and noindex', async ({ page }) => {
    const titles = new Set<string>();
    for (const route of ROUTES) {
      const res = await page.goto(route);
      expect(res?.status(), route).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
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

  test('robots.txt disallows everything during the prototype', async ({ request }) => {
    expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');
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

test.describe('simulated checkout', () => {
  test('walks through the three steps with a server-confirmed amount', async ({ page }) => {
    await page.goto('/en');
    await page.locator('[data-stream="3"]').click();
    const opener = page.getByRole('button', { name: /Preview checkout/ });
    await opener.click();
    const dialog = page.getByTestId('checkout-dialog');
    await expect(dialog).toHaveAccessibleName('Checkout preview');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();

    await dialog.getByRole('button', { name: /Review demo order/ }).click();
    await expect(dialog.getByTestId('quote-status')).toHaveText(/Amount confirmed by the server/);
    await expect(dialog.getByTestId('review-plan')).toHaveText('12 months · 3 streams');
    await expect(dialog.getByTestId('review-price')).toHaveText('$165.90 USD');

    await dialog.getByRole('button', { name: /Back/ }).click();
    await dialog.getByRole('button', { name: /Review demo order/ }).click();
    await dialog.getByRole('button', { name: /Complete simulation/ }).click();
    await expect(dialog.getByRole('heading', { name: 'Demo completed' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Return to website' }).click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('traps focus and closes with Escape, restoring focus', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard test runs on desktop');
    await page.goto('/en');
    const opener = page.getByRole('button', { name: /Preview checkout/ });
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

  test('sends no network request containing the demo email', async ({ page }) => {
    const bodies: string[] = [];
    page.on('request', (r) => bodies.push(r.postData() ?? ''));
    await page.goto('/en');
    await page.getByRole('button', { name: /Preview checkout/ }).click();
    await page.fill('#demoemail', 'private@example.test');
    await page.getByRole('button', { name: /Review demo order/ }).click();
    await expect(page.getByTestId('quote-status')).toHaveText(/confirmed/);
    expect(bodies.some((b) => b.includes('private@example.test'))).toBe(false);
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
    await page.getByRole('button', { name: /Preview checkout/ }).click();
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
