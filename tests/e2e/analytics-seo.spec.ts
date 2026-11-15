import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Consent, analytics events and technical SEO.
 * Third-party scripts are replaced by empty stubs: the tests read what the site pushes to
 * window.dataLayer (GA4) and window.clarity.q (Clarity), and nothing is sent to Google or Microsoft.
 */
async function stubThirdParties(page: Page) {
  const hits: string[] = [];
  await page.route(/googletagmanager\.com|google-analytics\.com|clarity\.ms|c\.bing\.com/, (route) => {
    hits.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
  });
  return hits;
}

/** Allows analytics on the local test host (QA flag) and optionally pre-sets a consent choice. */
async function prepare(page: Page, consent?: 'granted' | 'denied') {
  await page.addInitScript((c) => {
    localStorage.setItem('sygma_analytics_force', '1');
    if (c) localStorage.setItem('sygma_consent', JSON.stringify({ v: 1, analytics: c, ts: new Date().toISOString() }));
  }, consent ?? null);
}

/** GA4 events pushed by the site (gtag('event', name, params)). */
async function gaEvents(page: Page) {
  return page.evaluate(() =>
    (window.dataLayer ?? [])
      .map((a) => Array.from(a as ArrayLike<unknown>))
      .filter((a) => a[0] === 'event')
      .map((a) => ({ name: a[1] as string, params: (a[2] ?? {}) as Record<string, unknown> })),
  );
}

test.describe('cookie consent', () => {
  test('the banner never covers the order window or its buttons', async ({ page }) => {
    await stubThirdParties(page);
    await prepare(page);
    await page.goto('/');
    await expect(page.getByTestId('consent-banner')).toBeVisible();
    await page.locator('#plans').scrollIntoViewIfNeeded();
    await page.locator('.offers[data-ready]').waitFor();
    await page.getByRole('button', { name: /^Pre-register for free/ }).click();
    const dialog = page.getByTestId('checkout-dialog');
    // Clickable = not covered by the banner (Playwright checks what receives the click).
    await dialog.getByRole('button', { name: /Continue/ }).click({ trial: true });
    await dialog.getByRole('button', { name: 'Close' }).click({ trial: true });
  });

  test('nothing loads before a choice; Decline keeps everything off', async ({ page }) => {
    const hits = await stubThirdParties(page);
    await prepare(page);
    await page.goto('/');
    const banner = page.getByTestId('consent-banner');
    await expect(banner).toBeVisible();
    await expect(banner.getByRole('button', { name: 'Accept' })).toBeVisible();
    await page.waitForTimeout(1500);
    expect(hits).toEqual([]);
    expect(await page.evaluate(() => typeof window.gtag)).toBe('undefined');
    await banner.getByRole('button', { name: 'Decline' }).click();
    await expect(banner).toBeHidden();
    await page.reload();
    await expect(page.getByTestId('consent-banner')).toHaveCount(0);
    await page.waitForTimeout(1500);
    expect(hits).toEqual([]);
    expect(await page.evaluate(() => document.cookie)).not.toMatch(/_ga|_clck/);
  });

  test('Accept loads GA4 and Clarity once, with one page view per path', async ({ page }) => {
    const hits = await stubThirdParties(page);
    await prepare(page);
    await page.goto('/');
    await page.getByTestId('consent-banner').getByRole('button', { name: 'Accept' }).click();
    await expect.poll(() => hits.some((h) => h.includes('gtag/js?id=G-258WWPPN8Y'))).toBe(true);
    await expect.poll(() => hits.some((h) => h.includes('clarity.ms/tag/ze1jvwh69q'))).toBe(true);
    // The first page view is GA's own (config); the site sends only in-site navigations.
    const pageViews = async () => (await gaEvents(page)).filter((e) => e.name === 'page_view').length;
    await expect.poll(async () => (await page.evaluate(() => (window.dataLayer ?? []).filter((a) => Array.from(a as ArrayLike<unknown>)[0] === 'config').length))).toBe(1);
    expect(await pageViews()).toBe(0);
    // A section link (#hash) is not a new page view…
    await page.locator('footer').getByRole('link', { name: 'Plans' }).click();
    await page.waitForTimeout(800);
    expect(await pageViews()).toBe(0);
    // …an in-site navigation to another page is (scripts are not loaded again).
    await page.locator('footer').getByRole('link', { name: 'Terms of Service' }).click();
    await expect(page).toHaveURL(/\/legal\/terms$/);
    await expect.poll(pageViews).toBe(1);
    const views = (await gaEvents(page)).filter((e) => e.name === 'page_view').map((e) => e.params.page_path);
    expect(views).toEqual(['/legal/terms']);
    expect(hits.filter((h) => h.includes('gtag/js')).length).toBe(1);
    expect(hits.filter((h) => h.includes('clarity.ms/tag/')).length).toBe(1);
    const consent = await page.evaluate(() => (window.clarity?.q ?? []).map((a) => Array.from(a as ArrayLike<unknown>)[0]));
    expect(consent).toContain('consentv2');
  });

  test('the footer « Cookie settings » reopens the choice', async ({ page }) => {
    await stubThirdParties(page);
    await prepare(page, 'denied');
    await page.goto('/');
    await expect(page.getByTestId('consent-banner')).toHaveCount(0);
    await page.locator('footer').getByRole('button', { name: 'Cookie settings' }).click();
    await expect(page.getByTestId('consent-banner')).toBeVisible();
  });

  test('withdrawing consent unloads analytics and removes its cookies', async ({ page, context }) => {
    await stubThirdParties(page);
    await prepare(page, 'granted');
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => typeof window.gtag)).toBe('function');
    await context.addCookies([{ name: '_ga', value: 'GA1.1.1', url: page.url() }, { name: '_clck', value: 'x', url: page.url() }]);
    await page.locator('footer').getByRole('button', { name: 'Cookie settings' }).click();
    await page.getByTestId('consent-banner').getByRole('button', { name: 'Decline' }).click();
    // The page reloads: the scripts are gone.
    await expect.poll(() => page.evaluate(() => typeof window.gtag).catch(() => 'reloading'), { timeout: 10_000 }).toBe('undefined');
    expect((await context.cookies(page.url())).map((c) => c.name)).not.toContain('_ga');
    expect((await context.cookies(page.url())).map((c) => c.name)).not.toContain('_clck');
  });

  test('the banner has no accessibility violations', async ({ page }) => {
    await stubThirdParties(page);
    await prepare(page);
    await page.goto('/');
    await expect(page.getByTestId('consent-banner')).toBeVisible();
    const r = await new AxeBuilder({ page }).include('[data-testid="consent-banner"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(r.violations).toEqual([]);
  });
});

test.describe('analytics events (consent granted)', () => {
  test('view_item counts each plan once, even when scrolling back and forth', async ({ page }) => {
    await stubThirdParties(page);
    await prepare(page, 'granted');
    await page.goto('/');
    for (let i = 0; i < 3; i++) {
      await page.locator('.tier-grid').scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
    }
    await page.locator('.tier-grid').scrollIntoViewIfNeeded();
    await expect.poll(async () => (await gaEvents(page)).filter((e) => e.name === 'view_item').length).toBeGreaterThan(0);
    const ids = (await gaEvents(page)).filter((e) => e.name === 'view_item').map((e) => (e.params.items as { item_id: string }[])[0]!.item_id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeLessThanOrEqual(3);
  });

  test('plan view, plan selection, checkout and lead — without personal data', async ({ page }) => {
    await stubThirdParties(page);
    await prepare(page, 'granted');
    await page.route('**/api/contact', (route) => route.fulfill({ status: 201, json: { ok: true } }));
    await page.goto('/');
    await page.locator('#plans').scrollIntoViewIfNeeded();
    await page.locator('.offers[data-ready]').waitFor();
    await page.locator('.tier-card[data-tier="ultra"]').scrollIntoViewIfNeeded();
    await expect.poll(async () => (await gaEvents(page)).some((e) => e.name === 'view_item')).toBe(true);

    await page.locator('.sim-layout [data-tier="ultra"]').click();
    await page.locator('[data-term="24m"]').click();
    await page.getByRole('button', { name: /^Pre-register for free/ }).click();
    const dialog = page.getByTestId('checkout-dialog');
    await expect(dialog).toHaveAttribute('data-clarity-mask', 'true');
    await dialog.getByLabel('Email address').fill('viewer@example.test');
    await dialog.getByLabel('Your country').click();
    await dialog.getByRole('combobox', { name: 'Type a country…' }).fill('cana');
    await page.keyboard.press('Enter');
    await dialog.getByLabel('WhatsApp number').fill('4155550123');
    await dialog.getByLabel(/I agree to be contacted/).check();
    await dialog.getByRole('button', { name: /Continue/ }).click();
    await dialog.getByRole('button', { name: /Confirm my pre-registration/ }).click();
    await expect(dialog.getByRole('heading', { name: 'You are pre-registered!' })).toBeVisible();

    const events = await gaEvents(page);
    const names = events.map((e) => e.name);
    expect(names).toContain('select_item');
    expect(names.filter((n) => n === 'begin_checkout')).toHaveLength(1);
    expect(names.filter((n) => n === 'generate_lead')).toHaveLength(1);
    expect(names).not.toContain('purchase');
    const checkout = events.find((e) => e.name === 'begin_checkout')!;
    expect(checkout.params).toMatchObject({ currency: 'USD', items: [{ item_id: 'ultra-24m-1', item_category: 'subscription' }] });
    const lead = events.find((e) => e.name === 'generate_lead')!;
    expect(lead.params).toMatchObject({ lead_type: 'order', currency: 'USD', item_id: 'ultra-24m-1' });
    // No personal data in any event.
    expect(JSON.stringify(events)).not.toMatch(/viewer@example\.test|4155550123|\+1415/);
  });

  test('WhatsApp link clicks are tracked', async ({ page, context }) => {
    await stubThirdParties(page);
    await prepare(page, 'granted');
    await context.route(/whatsapp\.com/, (route) => route.fulfill({ status: 200, body: 'ok' }));
    await page.goto('/');
    const link = page.locator('footer a[href*="whatsapp.com"]').first();
    await Promise.all([context.waitForEvent('page'), link.click()]);
    await expect.poll(async () => (await gaEvents(page)).some((e) => e.name === 'contact_whatsapp')).toBe(true);
  });
});

test.describe('technical SEO', () => {
  test('sitemap lists only indexable canonical pages; robots points to it', async ({ request }) => {
    const sm = await request.get('/sitemap.xml');
    expect(sm.status()).toBe(200);
    const xml = await sm.text();
    expect(xml).toContain('<urlset');
    expect(xml).toMatch(/<loc>[^<]+\/<\/loc>/);
    expect(xml).toContain('/legal/terms</loc>');
    expect(xml).not.toContain('/blog</loc>');
    expect(xml).not.toContain('/api/');
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toMatch(/Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/);
    expect(robots).toMatch(/Disallow: \/api\//);
  });

  test('home: branded title, description, canonical, social cards and JSON-LD', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('SYGMA TV+ — International Streaming Subscription');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc!.length).toBeGreaterThan(70);
    expect(desc!.length).toBeLessThanOrEqual(160);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/brand\/og-image\.jpg$/);
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    const types = ld['@graph'].map((n: { '@type': string }) => n['@type']);
    expect(types).toEqual(['Organization', 'WebSite']);
    expect(ld['@graph'][0]).toMatchObject({ name: 'SYGMA TV+', slogan: 'One World. Endless Entertainment.' });
  });

  test('blog stays out of search until it has articles', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('www redirects to the canonical host', async ({ request }) => {
    const res = await request.get('/legal/terms?x=1', { headers: { host: 'www.sygmatv.com' }, maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()['location']).toBe('https://sygmatv.com/legal/terms?x=1');
  });
});
