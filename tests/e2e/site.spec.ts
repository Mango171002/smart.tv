import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = [
  '/en', '/en/legal/terms', '/en/legal/privacy', '/en/legal/cookies', '/en/legal/refunds', '/en/legal/imprint',
];


/** Home page; the plans island hydrates when it nears the viewport, like for a real visitor. */
async function openHome(page: import('@playwright/test').Page, path: '/en') {
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
      await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(0);
      titles.add(`${route.slice(0, 3)}:${await page.title()}`);
    }
    expect(titles.size).toBeGreaterThanOrEqual(ROUTES.length - 1);
  });

  test('English only: the root and the former French URLs lead to English', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'fr-CA', extraHTTPHeaders: { 'accept-language': 'fr-CA,fr;q=0.9' } });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.goto('/fr/legal/privacy');
    await expect(page).toHaveURL(/\/en\/legal\/privacy$/);
    await expect(page.getByRole('group', { name: 'Display language' })).toHaveCount(0);
    await ctx.close();
  });

  test('unknown pages return a localized 404', async ({ page }) => {
    const res = await page.goto('/en/does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist.');
  });

  test('robots.txt is served', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/User-Agent: \*/i);
  });

  test('no prototype or demo wording remains', async ({ page }) => {
    for (const route of ['/en']) {
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
      for (const path of ['/en'] as const) {
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

  test('former pages redirect to their section of the one-page site', async ({ request }) => {
    for (const [from, to] of [['/en/plans', '/en#plans'], ['/fr/help', '/en#faq'], ['/en/devices', '/en#preview'], ['/fr/coverage', '/en#content']] as const) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(308);
      expect(res.headers()['location'], from).toMatch(new RegExp(`${to.replace('#', '\\#')}$`));
    }
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
    const opener = page.getByRole('button', { name: /^Free pre-registration/ });
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
    await openHome(page, '/en');
    await page.getByRole('button', { name: /^Free pre-registration/ }).click();
    const dialog = page.getByTestId('checkout-dialog');
    await dialog.getByRole('button', { name: /^Continue/ }).click();
    await expect(dialog.getByText('Enter a valid email address.')).toBeVisible();
    await expect(dialog.getByText('Please accept to be contacted about the launch.')).toBeVisible();
    await expect(dialog.getByText('Choose your region.')).toBeVisible();
    await expect(dialog.getByLabel('Email address')).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.getByTestId('quote-status')).toHaveCount(0);
  });

  test('dialog stays still when hovered and lives in <body> (regression)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover only exists on desktop');
    await openHome(page, '/en');
    await page.getByRole('button', { name: /^Free pre-registration/ }).click();
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
    await page.getByRole('button', { name: /^Free pre-registration/ }).click();
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
    const opener = page.getByRole('button', { name: /^Free pre-registration/ });
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

  test('category cards lead to the most watched genres', async ({ page }) => {
    await openHome(page, '/en');
    await page.locator('#content .cat-card[data-category="movies"]').click();
    await expect(page).toHaveURL(/\/en#featured$/);
  });

  test('no third-party brand names are shown', async ({ page }) => {
    for (const route of ['/en']) {
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
      await openHome(page, '/en');
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
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'How it works' }).click();
    await expect(page).toHaveURL(/\/en#how$/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('no horizontal scrolling', async ({ page }) => {
    for (const r of ['/en', '/en/legal/privacy']) {
      await page.goto(r);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, r).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('one-page navigation, trial & support requests (network mocked)', () => {
  test('header: 3 section links and 2 call-to-action buttons', async ({ page, isMobile }) => {
    await page.goto('/en');
    if (isMobile) await page.getByRole('button', { name: 'Toggle menu' }).click();
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav.getByRole('link')).toHaveText(['Plans', 'How it works', 'Help', 'Get started']);
    await expect(nav.getByRole('button', { name: 'Request a trial' })).toHaveCSS('background-color', 'rgb(25, 211, 243)');
    await expect(nav.getByRole('link', { name: 'Get started' })).toHaveCSS('background-color', 'rgb(209, 254, 23)');
  });

  test('"Request a trial" opens a window: name, email, phone with country code', async ({ page, isMobile }) => {
    let sent: Record<string, unknown> | null = null;
    await page.route('**/api/contact', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { ok: true } });
    });
    await page.goto('/en');
    if (isMobile) await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page.getByRole('button', { name: 'Request a trial' }).click();
    const dialog = page.getByRole('dialog', { name: 'Request a trial' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Send request' }).click();
    await expect(dialog.getByText('Enter your name.')).toBeVisible();
    await expect(dialog.getByText('Enter a valid phone number.')).toBeVisible();
    const countries = dialog.getByRole('combobox', { name: 'Country calling code' });
    expect(await countries.locator('option').count()).toBeGreaterThan(200);
    await countries.selectOption('FR');
    await dialog.getByLabel('Full name').fill('Alex Martin');
    await dialog.getByLabel('Email address').fill('alex@example.test');
    await dialog.getByLabel('Phone number').fill('06 12 34 56 78');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Send request' }).click();
    await expect(page.getByRole('dialog', { name: 'Request sent!' })).toContainText('Thank you, Alex Martin.');
    expect(sent).toMatchObject({ kind: 'trial_request', name: 'Alex Martin', email: 'alex@example.test', phone: '+33612345678', market: 'EU', consent: true });
  });

  test('floating support button opens the support window (question required)', async ({ page }) => {
    let sent: Record<string, unknown> | null = null;
    await page.route('**/api/contact', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { ok: true } });
    });
    await page.goto('/en');
    await page.getByRole('button', { name: 'Contact support' }).click();
    const dialog = page.getByRole('dialog', { name: 'Contact support' });
    await dialog.getByLabel('Full name').fill('Alex');
    await dialog.getByLabel('Email address').fill('alex@example.test');
    await dialog.getByLabel('Phone number').fill('4155550123');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Send request' }).click();
    await expect(dialog.getByText('Your message must be at least 10 characters.')).toBeVisible();
    await dialog.getByLabel('Your question').fill('How will the installation work?');
    await dialog.getByRole('button', { name: 'Send request' }).click();
    await expect(page.getByRole('dialog', { name: 'Request sent!' })).toBeVisible();
    expect(sent).toMatchObject({ kind: 'support', phone: '+14155550123', subject: 'Support request', message: 'How will the installation work?' });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('request window shows a rate-limit message', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 429, json: { ok: false } }));
    await page.goto('/en');
    await page.getByRole('button', { name: 'Contact support' }).click();
    const dialog = page.getByRole('dialog', { name: 'Contact support' });
    await dialog.getByLabel('Full name').fill('Alex');
    await dialog.getByLabel('Email address').fill('alex@example.test');
    await dialog.getByLabel('Phone number').fill('4155550123');
    await dialog.getByLabel('Your question').fill('How will the installation work?');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Send request' }).click();
    await expect(dialog.getByText('Too many requests. Please try again later.')).toBeVisible();
  });
});

test.describe('accessibility (axe, WCAG 2.1 AA)', () => {
  for (const route of ['/en', '/en/legal/privacy', '/en/legal/terms']) {
    test(`no violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
    });
  }

  test('request window has no violations', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('button', { name: 'Contact support' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  test('checkout dialog has no violations', async ({ page }) => {
    await openHome(page, '/en');
    await page.getByRole('button', { name: /^Free pre-registration/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible(); // the dialog is loaded on demand
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
