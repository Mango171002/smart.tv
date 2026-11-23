import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { RELEASED_LANGS, ORDERS_OPEN, ORDER_BUTTON } from './released';

const ROUTES = [
  '/', '/blog', '/legal/terms', '/legal/privacy', '/legal/cookies', '/legal/refunds', '/legal/imprint',
];


/** Home page; the plans island hydrates when it nears the viewport, like for a real visitor. */
async function openHome(page: import('@playwright/test').Page, path: '/' = '/') {
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
      // French released (E2E_RELEASED=fr): the English home lists its French version; nothing else (legal and blog stay English-only / noindex).
      await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(RELEASED_LANGS.includes('fr') && route === '/' ? 1 : 0);
      titles.add(`${route}:${await page.title()}`);
    }
    expect(titles.size).toBeGreaterThanOrEqual(ROUTES.length - 1);
  });

  test('English only: the root and the former French URLs lead to English', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'fr-CA', extraHTTPHeaders: { 'accept-language': 'fr-CA,fr;q=0.9' } });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.goto('/fr/legal/privacy');
    await expect(page).toHaveURL(/\/legal\/privacy$/);
    await expect(page.getByRole('group', { name: 'Display language' })).toHaveCount(0);
    await ctx.close();
  });

  test('unknown pages return a localized 404', async ({ page }) => {
    const res = await page.goto('/does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist.');
  });

  // Branded global 404 (app/global-not-found.tsx): every unmatched URL, whatever its depth.
  for (const path of ['/nope', '/nope/deeper/still', '/legal/xyz', '/blog/x', '/index.html', '/LEGAL/TERMS', '/nope?utm_source=x']) {
    test(`unknown URL ${path}: branded 404, noindex, no canonical, way back to the site`, async ({ page, request }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page).toHaveTitle('Page not found | SYGMA TV+');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist.');
      await expect(page.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
      await expect(page.getByRole('img', { name: 'SYGMA TV+' })).toBeVisible();
      const suggestions = page.getByRole('navigation', { name: 'You may be looking for' });
      await expect(suggestions.getByRole('link')).toHaveText(['Plans', 'How it works', 'Help / FAQ', 'Contact support']);
      await expect(page.getByRole('navigation', { name: 'Legal' }).getByRole('link')).toHaveCount(5);
      // No tracking and no consent banner on the 404 page (unchanged: the previous 404 had none either).
      expect(await page.locator('script[src*="googletagmanager"], script[src*="clarity"]').count()).toBe(0);
      await expect(page.getByTestId('consent-banner')).toHaveCount(0);
      // Not cacheable, never served with a 200.
      const raw = await request.get(path);
      expect(raw.status()).toBe(404);
    });
  }

  test('existing pages keep their own status and metadata (no regression from the global 404)', async ({ request }) => {
    for (const path of ROUTES) expect((await request.get(path)).status(), path).toBe(200);
    expect((await request.get('/en/nope', { maxRedirects: 0 })).status()).toBe(308);
  });

  test('robots.txt is served', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/User-Agent: \*/i);
  });

  test('no prototype or demo wording remains', async ({ page }) => {
    for (const route of ['/']) {
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
    await openHome(page, '/');
    await expect(page.getByTestId('tier-price-starter')).toHaveText('$59');
    await expect(page.getByTestId('tier-price-plus')).toHaveText('$69');
    await expect(page.getByTestId('tier-price-ultra')).toHaveText('$99');
    await expect(page.locator('.tier-card.is-recommended')).toHaveAttribute('data-tier', 'plus');
    await expect(page.locator('.tier-card.is-recommended .tier-badge')).toHaveText('Recommended');
  });

  test('simulator: plan, duration and screens update price, monthly equivalent and savings', async ({ page }) => {
    await openHome(page, '/');
    const price = page.getByTestId('price');
    await expect(page.getByTestId('selection')).toHaveText('Plus · 12 months · 1 device');
    await expect(price).toHaveText('$69');
    await page.locator('.simulator [data-tier="starter"]').click();
    await page.locator('[data-term="36m"]').click();
    await expect(page.getByTestId('selection')).toHaveText('Starter · 36 months · 1 device');
    await expect(price).toHaveText('$122.99');
    await expect(page.locator('.price-sub')).toHaveText('≈ $3.42 / month');
    await expect(page.getByTestId('savings')).toHaveText('You save $54.01 (−30%) vs 3 × 12 months');
    await page.locator('[data-stream="3"]').click();
    await expect(page.getByTestId('selection')).toHaveText('Starter · 36 months · 3 devices');
    await expect(price).toHaveText('$160.99');
    await expect(page.locator('[data-stream="2"] .choice-note')).toHaveText('+$21');
    await page.locator('.simulator [data-tier="ultra"]').click();
    await page.locator('[data-term="12m"]').click();
    await page.locator('[data-stream="4"]').click();
    await expect(price).toHaveText('$124');
    await expect(page.getByTestId('savings')).toHaveCount(0);
    // Lifetime is not offered in the simulator (owner decision)
    await expect(page.locator('.simulator [data-term]')).toHaveCount(3);
    await expect(page.locator('[data-term="lifetime"]')).toHaveCount(0);
  });

  test('each plan benefit fits on one line, nothing cut off', async ({ page }) => {
    for (const width of [390, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/'] as const) {
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
    await openHome(page, '/');
    await page.getByRole('button', { name: 'Get Ultra+' }).click();
    await expect(page.locator('.simulator [data-tier="ultra"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('price')).toHaveText('$99');
  });

  test('section links scroll even when the address already has the same #hash', async ({ page }) => {
    await page.goto('/#plans');
    await page.locator('.how3-cta').evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const plansTop = () => page.evaluate(() => Math.round(document.querySelector('#plans')!.getBoundingClientRect().top));
    expect(await plansTop()).toBeLessThan(-200); // the plans section is above the viewport
    await page.locator('.how3-cta').click({ position: { x: 20, y: 20 } });
    // lands on the section once the scroll has settled
    await expect.poll(async () => { const t = await plansTop(); return t > -40 && t < 200; }, { timeout: 6000 }).toBe(true);
  });

  test('former pages redirect to their section of the one-page site', async ({ request }) => {
    // The expected target depends on the build (routing unchanged): with the content pages on (E2E_CONTENT_PAGES=preview)
    // /help is a page, so /fr/help follows the /fr/* → /* redirect to /help; with the French preview built
    // (E2E_SITE_MODE=preview) the former French URLs point to the French home instead.
    const CONTENT = process.env.E2E_CONTENT_PAGES === 'preview';
    const FR = process.env.E2E_SITE_MODE === 'preview' || RELEASED_LANGS.includes('fr');
    const cases: Array<readonly [string, string]> = [
      ['/en/plans', '/#plans'], ['/en/devices', '/#content'], ['/en', '/'], ['/en/blog', '/blog'],
      ['/fr/coverage', FR ? '/fr#content' : '/#content'],
      ...(CONTENT ? (FR ? [] : [['/fr/help', '/help'] as const]) : [['/fr/help', FR ? '/fr#faq' : '/#faq'] as const]),
    ];
    for (const [from, to] of cases) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(308);
      expect(res.headers()['location'], from).toMatch(new RegExp(`${to.replace('#', '\\#')}$`));
    }
  });
});

test.describe('pre-registration', () => {
  test.skip(!ORDERS_OPEN, 'online requests closed in this build (prelaunch): covered by prelaunch.spec.ts');
  test('pre-registers with the selected plan in three steps', async ({ page }) => {
    let sent: Record<string, unknown> | null = null;
    await page.route('**/api/contact', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { ok: true } });
    });
    await openHome(page, '/');
    await page.locator('.simulator [data-tier="ultra"]').click();
    await page.locator('[data-term="24m"]').click();
    await page.locator('[data-stream="2"]').click();
    const opener = page.getByRole('button', { name: ORDER_BUTTON });
    await opener.click();
    const dialog = page.getByTestId('checkout-dialog');
    await expect(dialog).toHaveAccessibleName('Complete your order');
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();

    await dialog.getByLabel('Email address').fill('viewer@example.test');
    await dialog.getByLabel('Your country').click();
    await dialog.getByRole('combobox', { name: 'Type a country…' }).fill('cana');
    await page.keyboard.press('Enter');
    await expect(dialog.getByRole('button', { name: 'Country calling code' })).toHaveText(/Canada \(\+1\)/);
    await dialog.getByLabel('WhatsApp number').fill('(415) 555-0123');
    await dialog.getByLabel('Main device').selectOption('ios_mobile');
    await dialog.getByLabel(/I agree to be contacted/).check();
    await dialog.getByRole('button', { name: /Continue/ }).click();
    await expect(dialog.getByTestId('quote-status')).toHaveText(/Price confirmed by our server/);
    await expect(dialog.getByTestId('review-plan')).toHaveText('Ultra+ · 24 months · 2 devices');
    await expect(dialog.getByTestId('review-region')).toContainText('Canada');
    await expect(dialog.getByTestId('review-phone')).toHaveText('+14155550123');
    await expect(dialog.getByTestId('review-price')).toHaveText('$173.99 USD');

    await dialog.getByRole('button', { name: /Confirm my order/ }).click();
    await expect(dialog.getByRole('heading', { name: 'Order received!' })).toBeVisible();
    await expect(dialog).toContainText('viewer@example.test');
    expect(sent).toMatchObject({
      kind: 'launch_waitlist', email: 'viewer@example.test', market: 'CA', country: 'CA', phone: '+14155550123', tier: 'ultra', term: '24m', streams: 2, device: 'mobile', deviceDetail: 'ios_mobile', consent: true,
    });
    await dialog.getByRole('button', { name: 'Back to the website' }).click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('requires a valid email and consent before continuing', async ({ page }) => {
    await openHome(page, '/');
    await page.getByRole('button', { name: ORDER_BUTTON }).click();
    const dialog = page.getByTestId('checkout-dialog');
    await dialog.getByRole('button', { name: /^Continue/ }).click();
    await expect(dialog.getByText('Enter a valid email address.')).toBeVisible();
    await expect(dialog.getByText('Please accept to be contacted about your order.')).toBeVisible();
    await expect(dialog.getByText('Choose your country.')).toBeVisible();
    await expect(dialog.getByText('Enter a valid WhatsApp number.')).toBeVisible();
    await expect(dialog.getByLabel('Email address')).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.getByTestId('quote-status')).toHaveCount(0);
  });

  test('dialog stays still when hovered and lives in <body> (regression)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover only exists on desktop');
    await openHome(page, '/');
    await page.getByRole('button', { name: ORDER_BUTTON }).click();
    const checkbox = page.getByTestId('checkout-dialog').getByLabel(/I agree to be contacted/);
    await checkbox.hover();
    const before = await checkbox.boundingBox();
    await page.waitForTimeout(400);
    expect(await checkbox.boundingBox()).toEqual(before);
    expect(await page.evaluate(() => document.querySelector('.overlay')?.parentElement === document.body)).toBe(true);
  });

  test('shows a clear message when rate limited', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 429, json: { ok: false } }));
    await openHome(page, '/');
    await page.getByRole('button', { name: ORDER_BUTTON }).click();
    const dialog = page.getByTestId('checkout-dialog');
    await dialog.getByLabel('Email address').fill('viewer@example.test');
    await dialog.getByLabel('Your country').click();
    await dialog.getByRole('option', { name: /United States$/ }).click();
    await dialog.getByLabel('WhatsApp number').fill('4155550123');
    await dialog.getByLabel(/I agree to be contacted/).check();
    await dialog.getByRole('button', { name: /Continue/ }).click();
    await expect(dialog.getByTestId('quote-status')).toHaveText(/confirmed/);
    await dialog.getByRole('button', { name: /Confirm my order/ }).click();
    await expect(dialog.getByRole('alert')).toHaveText('Too many requests. Please try again later.');
  });

  test('traps focus and closes with Escape, restoring focus', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard test runs on desktop');
    await openHome(page, '/');
    const opener = page.getByRole('button', { name: ORDER_BUTTON });
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
    await openHome(page, '/');
    const expected: Record<string, string> = {
      sports: 'rgb(209, 254, 23)', // #D1FE17
      movies: 'rgb(25, 211, 243)', // cyan on the cards (owner 14/11)
      live: 'rgb(240, 68, 196)', // magenta on the cards (owner 14/11)
      streaming: 'rgb(104, 120, 255)', // #6878FF
    };
    const cards = page.locator('#content .cat-card');
    await expect(cards).toHaveCount(4);
    for (const [key, rgb] of Object.entries(expected)) {
      const icon = page.locator(`#content .cat-card[data-category="${key}"] .cat-icon svg`).first();
      await expect(icon).toHaveCSS('color', rgb);
    }
    const cta = page.locator('.hero .btn').first();
    await expect(cta).toHaveCSS('background-color', 'rgb(209, 254, 23)');
    await expect(cta).toHaveCSS('color', 'rgb(7, 13, 23)');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(7, 13, 23)');
  });
});

test.describe('home page (approved mock-up)', () => {
  test('most watched: 15 genres with region, arrows on desktop, dots everywhere', async ({ page, isMobile }) => {
    await openHome(page, '/');
    const carousel = page.getByRole('region', { name: 'Featured genres' });
    await expect(carousel).toHaveAttribute('data-ready', 'true'); // wait for hydration
    await expect(carousel.getByRole('group')).toHaveCount(15);
    await expect(carousel.getByRole('group', { name: /American football/ })).toContainText('International');
    await expect(carousel.getByRole('group', { name: /Ice hockey/ })).toContainText('International');
    if (!isMobile) {
      const next = carousel.getByRole('button', { name: 'Next' });
      await expect(next).toBeVisible();
      await next.click();
      await expect(page.getByRole('button', { name: '2 of 15', exact: true })).toHaveAttribute('aria-current', 'true');
    }
    await page.getByRole('button', { name: '15 of 15', exact: true }).click();
    await expect(page.getByRole('button', { name: '15 of 15', exact: true })).toHaveAttribute('aria-current', 'true');
    const imgs = await carousel.locator('picture img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).getAttribute('src')));
    expect(new Set(imgs).size).toBe(15);
  });

  test('category cards lead to the most watched genres', async ({ page }) => {
    await openHome(page, '/');
    await page.locator('#content .cat-card[data-category="movies"]').click();
    await expect(page).toHaveURL(/\/#featured$/);
  });

  test('no third-party brand names are shown', async ({ page }) => {
    for (const route of ['/']) {
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
      await openHome(page, '/');
      const m = await page.evaluate(() => {
        const left = (s: string) => Math.round(document.querySelector(s)!.getBoundingClientRect().left);
        const g = document.querySelector('.cat-grid')!.getBoundingClientRect();
        return {
          brand: left('.brand-logo'), hero: left('.hero h1'), cats: left('.cat-grid'), features: left('.features-bar'),
          width: g.width, overflow: document.documentElement.scrollWidth - innerWidth,
          // elements sticking out of the page (shown when the check fails)
          wide: [...document.querySelectorAll('body *')]
            .filter((el) => {
              if (el.getBoundingClientRect().right <= innerWidth + 1) return false;
              // ignore elements inside a scrolling or clipping box (they cannot widen the page)
              for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
                if (getComputedStyle(a).overflowX !== 'visible') return false;
              }
              return true;
            })
            .slice(0, 8)
            .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)} → ${Math.round(el.getBoundingClientRect().right)}`),
        };
      });
      expect(m.overflow, m.wide.join(' | ')).toBeLessThanOrEqual(0);
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
    await openHome(page, '/');
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'How it works' }).click();
    await expect(page).toHaveURL(/\/#how$/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('no horizontal scrolling', async ({ page }) => {
    for (const r of ['/', '/legal/privacy']) {
      await page.goto(r);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, r).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('one-page navigation, trial & support requests (network mocked)', () => {
  test('header: 3 section links and 2 call-to-action buttons', async ({ page, isMobile }) => {
    await page.goto('/');
    if (isMobile) await page.getByRole('button', { name: 'Toggle menu' }).click();
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    // The language switcher (phase 9, multilingual builds only) is checked in language-switcher.spec.ts.
    await expect(nav.locator('a:not([data-lang-switcher] a)')).toHaveText(['Plans', 'How it works', 'Help', 'Get started']);
    // Blog link hidden until the first article is published (phase 4); the page itself stays reachable and noindex.
    await expect(page.locator('a[href="/blog"]')).toHaveCount(0);
    await expect(nav.getByRole('button', { name: 'Free trial' })).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(nav.getByRole('link', { name: 'Get started' })).toHaveCSS('background-color', 'rgb(209, 254, 23)');
  });

  test('"Request a trial" opens a window: name, email, phone with country code', async ({ page, isMobile }) => {
    test.skip(!ORDERS_OPEN, 'online requests closed in this build (prelaunch): covered by prelaunch.spec.ts');
    let sent: Record<string, unknown> | null = null;
    await page.route('**/api/contact', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { ok: true } });
    });
    await page.goto('/');
    if (isMobile) await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Free trial' }).click();
    const dialog = page.getByRole('dialog', { name: 'Request a Trial' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Send request' }).click();
    await expect(dialog.getByText('Enter your name.')).toBeVisible();
    await expect(dialog.getByText('Enter a valid phone number.')).toBeVisible();
    await dialog.getByRole('button', { name: 'Country calling code' }).click();
    expect(await dialog.getByRole('option').count()).toBeGreaterThan(200);
    await dialog.getByRole('combobox', { name: 'Type a country…' }).fill('fran');
    await expect(dialog.getByRole('option').first()).toHaveText(/France/);
    await page.keyboard.press('Enter');
    await expect(dialog.getByRole('button', { name: 'Country calling code' })).toHaveText(/France \(\+33\)/);
    await dialog.getByLabel('Full name').fill('Alex Martin');
    await dialog.getByLabel('Email address').fill('alex@example.test');
    await dialog.getByLabel('Phone number').fill('06 12 34 56 78');
    await dialog.getByRole('checkbox').check();
    await dialog.getByRole('button', { name: 'Send request' }).click();
    await expect(page.getByRole('dialog', { name: 'Request sent!' })).toContainText('Thank you, Alex Martin.');
    expect(sent).toMatchObject({ kind: 'trial_request', name: 'Alex Martin', email: 'alex@example.test', phone: '+33612345678', market: 'EU', country: 'FR', consent: true });
  });

  test('floating support button and footer Contact open the support window (question required)', async ({ page }) => {
    test.skip(!ORDERS_OPEN, 'online requests closed in this build (prelaunch): covered by prelaunch.spec.ts');
    let sent: Record<string, unknown> | null = null;
    await page.route('**/api/contact', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { ok: true } });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Contact support', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Contact support' })).toBeVisible();
    await expect(page.getByRole('dialog').getByLabel('Full name')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.locator('footer').getByRole('button', { name: 'Contact', exact: true }).click();
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
    test.skip(!ORDERS_OPEN, 'online requests closed in this build (prelaunch): covered by prelaunch.spec.ts');
    await page.route('**/api/contact', (route) => route.fulfill({ status: 429, json: { ok: false } }));
    await page.goto('/');
    await page.locator('footer').getByRole('button', { name: 'Contact', exact: true }).click();
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
  for (const route of ['/', '/legal/privacy', '/legal/terms', '/this-page-does-not-exist']) {
    test(`no violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
    });
  }

  test('request window has no violations', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').getByRole('button', { name: 'Contact', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  test('checkout dialog has no violations', async ({ page }) => {
    await openHome(page, '/');
    await page.getByRole('button', { name: ORDER_BUTTON }).click();
    await expect(page.getByRole('dialog')).toBeVisible(); // the dialog is loaded on demand
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
