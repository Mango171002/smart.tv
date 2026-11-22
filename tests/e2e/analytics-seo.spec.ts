import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { RELEASED_LANGS } from './released';

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

/** Allows analytics on the local test host (QA flag) and optionally pre-sets the consent choices. */
async function prepare(page: Page, consent?: 'granted' | 'denied' | { analytics: 'granted' | 'denied'; marketing: 'granted' | 'denied' }) {
  const state = consent === undefined ? null : typeof consent === 'string' ? { analytics: consent, marketing: consent } : consent;
  await page.addInitScript((c) => {
    localStorage.setItem('sygma_analytics_force', '1');
    // Only once per tab: a reload (e.g. after withdrawing consent) must keep the visitor's new choice.
    if (c && !sessionStorage.getItem('sygma_prepared')) {
      localStorage.setItem('sygma_consent', JSON.stringify({ v: 2, ...c, ts: new Date().toISOString() }));
      sessionStorage.setItem('sygma_prepared', '1');
    }
  }, state);
}

/** Advertising messages pushed for GTM ({ event: 'sygma.<name>', event_id, sygma }). */
async function adEvents(page: Page) {
  return page.evaluate(() =>
    (window.dataLayer ?? [])
      .filter((a): a is { event: string; event_id: string; sygma: Record<string, unknown> } => typeof (a as { event?: unknown }).event === 'string' && (a as { event: string }).event.startsWith('sygma.'))
      .map((a) => ({ event: a.event, event_id: a.event_id, sygma: a.sygma })),
  );
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
    await page.getByRole('button', { name: /^Order now/ }).click();
    const dialog = page.getByTestId('checkout-dialog');
    // Clickable = not covered by the banner (Playwright checks what receives the click).
    await dialog.getByRole('button', { name: /Continue/ }).click({ trial: true });
    await dialog.getByRole('button', { name: 'Close' }).click({ trial: true });
  });

  test('nothing loads before a choice; Decline all keeps everything off', async ({ page }) => {
    const hits = await stubThirdParties(page);
    await prepare(page);
    await page.goto('/');
    const banner = page.getByTestId('consent-banner');
    await expect(banner).toBeVisible();
    await expect(banner.getByRole('button', { name: 'Accept all' })).toBeVisible();
    await page.waitForTimeout(1500);
    expect(hits).toEqual([]);
    expect(await page.evaluate(() => document.querySelector('script[src*="googletagmanager.com/gtag/js"]') === null)).toBe(true);
    await banner.getByRole('button', { name: 'Decline all' }).click();
    await expect(banner).toBeHidden();
    await page.reload();
    await expect(page.getByTestId('consent-banner')).toHaveCount(0);
    await page.waitForTimeout(1500);
    expect(hits).toEqual([]);
    expect(await page.evaluate(() => document.cookie)).not.toMatch(/_ga|_clck/);
  });

  test('Accept all loads GA4, Clarity and GTM once, with one page view per path', async ({ page }) => {
    const hits = await stubThirdParties(page);
    await prepare(page);
    await page.goto('/');
    await page.getByTestId('consent-banner').getByRole('button', { name: 'Accept all' }).click();
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
    expect(hits.filter((h) => h.includes('gtm.js?id=GTM-MGCLXP5L')).length).toBe(1);
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
    await expect.poll(() => page.evaluate(() => document.querySelector('script[data-sygma="ga4"]') !== null)).toBe(true);
    await context.addCookies([{ name: '_ga', value: 'GA1.1.1', url: page.url() }, { name: '_clck', value: 'x', url: page.url() }]);
    await page.locator('footer').getByRole('button', { name: 'Cookie settings' }).click();
    await page.getByTestId('consent-banner').getByRole('button', { name: 'Decline all' }).click();
    // The page reloads: the scripts are gone.
    await page.waitForTimeout(500);
    await expect.poll(() => page.evaluate(() => document.querySelector('script[src*="googletagmanager.com/gtag/js"]') === null).catch(() => false), { timeout: 10_000 }).toBe(true);
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
    await page.getByRole('button', { name: /^Order now/ }).click();
    const dialog = page.getByTestId('checkout-dialog');
    await expect(dialog).toHaveAttribute('data-clarity-mask', 'true');
    await dialog.getByLabel('Email address').fill('viewer@example.test');
    await dialog.getByLabel('Your country').click();
    await dialog.getByRole('combobox', { name: 'Type a country…' }).fill('cana');
    await page.keyboard.press('Enter');
    await dialog.getByLabel('WhatsApp number').fill('4155550123');
    await dialog.getByLabel(/I agree to be contacted/).check();
    await dialog.getByRole('button', { name: /Continue/ }).click();
    await dialog.getByRole('button', { name: /Confirm my order/ }).click();
    await expect(dialog.getByRole('heading', { name: 'Order received!' })).toBeVisible();

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
    // lastmod only where the date is real: the « Last updated » date printed on each legal page; none on the home.
    expect(xml).toContain('/legal/terms</loc>\n<lastmod>2026-11-17</lastmod>');
    expect(xml).toContain('/legal/privacy</loc>\n<lastmod>2026-11-16</lastmod>');
    // No lastmod on the home (its alternates, once French is released, come between <loc> and <changefreq>).
    expect(xml).toMatch(/<loc>[^<]+\/<\/loc>\n(?:<xhtml:link [^>]+\/>\n)*<changefreq>/);
    expect(xml.match(/<lastmod>/g)).toHaveLength(5);
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toMatch(/Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/);
    expect(robots).toMatch(/Disallow: \/api\//);
  });

  test('home: branded title, description, canonical, social cards and JSON-LD', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('SYGMA TV+ — Streaming subscription for TV, mobile & computer');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc!.length).toBeGreaterThan(70);
    expect(desc!.length).toBeLessThanOrEqual(160);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/brand\/og-image\.jpg$/);
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    // hreflang only once languages are released (E2E_RELEASED=fr,…): English, each released language, x-default.
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(RELEASED_LANGS.length ? RELEASED_LANGS.length + 2 : 0);
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    const types = ld['@graph'].map((n: { '@type': string }) => n['@type']);
    expect(types).toEqual(['Organization', 'WebSite']);
    expect(ld['@graph'][0]).toMatchObject({ name: 'SYGMA TV+', slogan: 'One World. Endless Entertainment.', foundingDate: '2026' });
    // Owner-validated facts (phase 6A): support in six languages.
    expect(ld['@graph'][0].contactPoint[0].availableLanguage).toEqual(['English', 'French', 'Arabic', 'German', 'Spanish', 'Italian']);
    // Google asks for a logo of at least 112×112 px: the square symbol, not the 512×67 wordmark.
    expect(ld['@graph'][0].logo).toMatchObject({ width: 512, height: 512 });
    expect(ld['@graph'][0].logo.url).toMatch(/\/brand\/sygma-symbol-512\.png$/);
    const logo = await page.request.get('/brand/sygma-symbol-512.png');
    expect(logo.status()).toBe(200);
    // sameAs: public profiles only — the Telegram invite link stays in the footer but not in the JSON-LD.
    const sameAs: string[] = ld['@graph'][0].sameAs;
    expect(sameAs.length).toBeGreaterThan(0);
    expect(sameAs.some((u) => /^https:\/\/t\.me\/\+/.test(u))).toBe(false);
    await expect(page.locator('footer a[href^="https://t.me/+"]')).toHaveCount(1);
  });

  test('legal pages: descriptive meta description (≤155 characters), distinct from each other', async ({ page }) => {
    const seen = new Set<string>();
    for (const doc of ['terms', 'privacy', 'cookies', 'refunds', 'imprint']) {
      await page.goto(`/legal/${doc}`);
      const d = (await page.locator('meta[name="description"]').getAttribute('content'))!;
      expect(d.length, doc).toBeGreaterThanOrEqual(110);
      expect(d.length, doc).toBeLessThanOrEqual(155);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', d);
      seen.add(d);
    }
    expect(seen.size).toBe(5);
  });

  test('favicon.ico is served (older browsers, Bing)', async ({ request }) => {
    const res = await request.get('/favicon.ico');
    expect(res.status()).toBe(200);
    const body = await res.body();
    expect([...body.subarray(0, 4)]).toEqual([0, 0, 1, 0]); // ICO header
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

test.describe('marketing consent (Google Tag Manager, phase 1)', () => {
  const consentCalls = (page: Page) =>
    page.evaluate(() =>
      (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>)).filter((a) => a[0] === 'consent').map((a) => ({ mode: a[1], state: a[2] as Record<string, string> })),
    );

  test('Customize → Analytics only: GA4 + Clarity, no GTM, ads consent denied', async ({ page }) => {
    const hits = await stubThirdParties(page);
    await prepare(page);
    await page.goto('/');
    const banner = page.getByTestId('consent-banner');
    await banner.getByRole('button', { name: 'Customize' }).click();
    await banner.getByRole('checkbox', { name: /Analytics/ }).check();
    await banner.getByRole('button', { name: 'Save my choices' }).click();
    await expect.poll(() => hits.some((h) => h.includes('gtag/js'))).toBe(true);
    await page.waitForTimeout(1000);
    expect(hits.some((h) => h.includes('gtm.js'))).toBe(false);
    const calls = await consentCalls(page);
    expect(calls[0]).toEqual({ mode: 'default', state: { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 } });
    expect(calls.filter((c) => c.mode === 'default')).toHaveLength(1);
    expect(calls.at(-1)).toEqual({ mode: 'update', state: { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' } });
  });

  test('Customize → Marketing only: GTM loads, GA4 and Clarity stay off; ad events carry an event_id', async ({ page }) => {
    const hits = await stubThirdParties(page);
    await prepare(page);
    await page.goto('/');
    const banner = page.getByTestId('consent-banner');
    await banner.getByRole('button', { name: 'Customize' }).click();
    await banner.getByRole('checkbox', { name: /Marketing/ }).check();
    await banner.getByRole('button', { name: 'Save my choices' }).click();
    await expect.poll(() => hits.filter((h) => h.includes('gtm.js?id=GTM-MGCLXP5L')).length).toBe(1);
    await page.waitForTimeout(1000);
    expect(hits.some((h) => h.includes('gtag/js') || h.includes('clarity.ms'))).toBe(false);
    const calls = await consentCalls(page);
    expect(calls[0]).toMatchObject({ mode: 'default', state: { ad_storage: 'denied', analytics_storage: 'denied' } });
    expect(calls.at(-1)).toEqual({ mode: 'update', state: { analytics_storage: 'denied', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' } });
    // An advertising event reaches the dataLayer for GTM; nothing is sent to GA4 (no gtag events).
    await page.locator('.tier-grid').scrollIntoViewIfNeeded();
    await expect.poll(async () => (await adEvents(page)).filter((e) => e.event === 'sygma.view_item').length).toBeGreaterThan(0);
    expect((await gaEvents(page)).length).toBe(0);
  });

  test('Accept all: ad events for view, checkout and lead — unique event_id, no personal data, GA4 unchanged', async ({ page }) => {
    await stubThirdParties(page);
    await prepare(page, 'granted');
    await page.route('**/api/contact', (route) => route.fulfill({ status: 201, json: { ok: true } }));
    await page.goto('/');
    await page.locator('#plans').scrollIntoViewIfNeeded();
    await page.locator('.offers[data-ready]').waitFor();
    await page.locator('.tier-grid').scrollIntoViewIfNeeded();
    await page.locator('.sim-layout [data-tier="ultra"]').click();
    await page.getByRole('button', { name: /^Order now/ }).click();
    const dialog = page.getByTestId('checkout-dialog');
    await dialog.getByLabel('Email address').fill('ads.qa@example.test');
    await dialog.getByLabel('Your country').click();
    await dialog.getByRole('combobox', { name: 'Type a country…' }).fill('fran');
    await page.keyboard.press('Enter');
    await dialog.getByLabel('WhatsApp number').fill('0612345678');
    await dialog.getByLabel(/I agree to be contacted/).check();
    await dialog.getByRole('button', { name: /Continue/ }).click();
    await dialog.getByRole('button', { name: /Confirm my order/ }).click();
    await expect(dialog.getByRole('heading', { name: 'Order received!' })).toBeVisible();

    const ads = await adEvents(page);
    const names = ads.map((e) => e.event);
    expect(names).toContain('sygma.view_item');
    expect(names.filter((n) => n === 'sygma.begin_checkout')).toHaveLength(1);
    expect(names.filter((n) => n === 'sygma.generate_lead')).toHaveLength(1);
    expect(names).not.toContain('sygma.select_item');
    expect(names.some((n) => n.includes('purchase'))).toBe(false);
    const ids = ads.map((e) => e.event_id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(ads.find((e) => e.event === 'sygma.generate_lead')!.sygma).toEqual({ event_name: 'generate_lead', lead_type: 'order', currency: 'USD', value: expect.any(Number), item_id: 'ultra-12m-1' });
    expect(JSON.stringify(ads)).not.toMatch(/ads\.qa|example\.test|612345678/);
    // GA4 events are unchanged: same names, no event_id added.
    const ga = await gaEvents(page);
    expect(ga.filter((e) => e.name === 'generate_lead')).toHaveLength(1);
    expect(JSON.stringify(ga)).not.toContain('event_id');
  });

  test('withdrawing Marketing only: GTM unloaded, ad cookies removed, Analytics kept', async ({ page, context }) => {
    const hits = await stubThirdParties(page);
    await prepare(page, 'granted');
    await page.goto('/');
    await expect.poll(() => hits.some((h) => h.includes('gtm.js'))).toBe(true);
    await context.addCookies([{ name: '_fbp', value: 'fb.1.1', url: page.url() }, { name: '_gcl_au', value: '1.1', url: page.url() }, { name: '_ga', value: 'GA1.1.1', url: page.url() }]);
    await page.locator('footer').getByRole('button', { name: 'Cookie settings' }).click();
    const banner = page.getByTestId('consent-banner');
    await expect(banner.getByRole('checkbox', { name: /Marketing/ })).toBeChecked();
    await banner.getByRole('checkbox', { name: /Marketing/ }).uncheck();
    hits.length = 0;
    await banner.getByRole('button', { name: 'Save my choices' }).click();
    await expect.poll(() => page.evaluate(() => document.querySelector('script[data-sygma="gtm"]') === null).catch(() => false), { timeout: 10_000 }).toBe(true);
    await page.waitForTimeout(2500);
    const names = (await context.cookies(page.url())).map((c) => c.name);
    expect(names).not.toContain('_fbp');
    expect(names).not.toContain('_gcl_au');
    expect(names).toContain('_ga');
    expect(hits.some((h) => h.includes('gtm.js'))).toBe(false);
    expect(hits.some((h) => h.includes('gtag/js'))).toBe(true);
  });

  test('a choice made under the previous policy (Analytics only) is asked again', async ({ page }) => {
    await stubThirdParties(page);
    await page.addInitScript(() => {
      localStorage.setItem('sygma_analytics_force', '1');
      localStorage.setItem('sygma_consent', JSON.stringify({ v: 1, analytics: 'granted', ts: '2026-11-15T00:00:00Z' }));
    });
    await page.goto('/');
    await expect(page.getByTestId('consent-banner')).toBeVisible();
    expect(await page.evaluate(() => document.querySelector('script[src*="googletagmanager.com/gtag/js"]') === null)).toBe(true);
  });

  test('the Customize view has no accessibility violations', async ({ page }) => {
    await stubThirdParties(page);
    await prepare(page);
    await page.goto('/');
    await page.getByTestId('consent-banner').getByRole('button', { name: 'Customize' }).click();
    const r = await new AxeBuilder({ page }).include('[data-testid="consent-banner"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(r.violations).toEqual([]);
  });
});

test.describe('Google Consent Mode default and CSP (corrections 1 and 2)', () => {
  const consentCalls = (page: Page) =>
    page.evaluate(() =>
      (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>)).filter((a) => a[0] === 'consent').map((a) => ({ mode: a[1], state: a[2] as Record<string, unknown> })),
    );
  const DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 };

  for (const [label, consent, expected] of [
    ['no choice yet', undefined, null],
    ['Decline all', 'denied', null],
    ['Analytics only', { analytics: 'granted', marketing: 'denied' }, { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }],
    ['Accept all', 'granted', { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' }],
  ] as const) {
    test(`${label}: default « denied » is the very first dataLayer entry, then the matching update`, async ({ page }) => {
      const hits = await stubThirdParties(page);
      await prepare(page, consent as Parameters<typeof prepare>[1]);
      await page.goto('/');
      await page.waitForTimeout(2500);
      const first = await page.evaluate(() => Array.from((window.dataLayer ?? [])[0] as ArrayLike<unknown>));
      expect(first).toEqual(['consent', 'default', DENIED]);
      const calls = await consentCalls(page);
      if (expected === null) {
        // No choice / refusal: the default stays « denied » and nothing Google or Clarity is requested.
        expect(calls).toEqual([{ mode: 'default', state: DENIED }]);
        expect(hits).toEqual([]);
      } else {
        expect(calls.at(-1)).toEqual({ mode: 'update', state: expected });
      }
    });
  }

  test('the update reaches Google before the first tag request (order in the dataLayer)', async ({ page }) => {
    await stubThirdParties(page);
    await prepare(page, 'granted');
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.querySelector('script[data-sygma="ga4"]') !== null)).toBe(true);
    const order = await page.evaluate(() => (window.dataLayer ?? []).map((a) => { const x = Array.from(a as ArrayLike<unknown>); return x.length ? `${x[0]}:${x[1]}` : (a as { event?: string }).event ?? '?'; }));
    expect(order.indexOf('consent:update')).toBeGreaterThan(order.indexOf('consent:default'));
    expect(order.indexOf('consent:update')).toBeLessThan(order.indexOf('config:G-258WWPPN8Y'));
    expect(order.indexOf('consent:update')).toBeLessThan(order.indexOf('gtm.js'));
  });

  test('CSP allows GA4 hits to analytics.google.com', async ({ page }) => {
    await page.route('https://analytics.google.com/**', (route) => route.fulfill({ status: 204, body: '' }));
    await page.goto('/');
    const ok = await page.evaluate(() => fetch('https://analytics.google.com/g/collect?v=2', { method: 'POST', mode: 'no-cors' }).then(() => true).catch(() => false));
    expect(ok).toBe(true);
  });
});

test.describe('no advertising request without Marketing consent', () => {
  // Network to the ad hosts is answered locally: if the browser lets a request out, the probe says « sent ».
  const probe = (page: Page) =>
    page.evaluate(async () => {
      const urls = ['https://pagead2.googlesyndication.com/ccm/collect', 'https://googleads.g.doubleclick.net/pagead/viewthroughconversion/1', 'https://www.google.com/rmkt/collect/1'];
      const out: string[] = [];
      for (const u of urls) out.push(await fetch(u, { mode: 'no-cors' }).then(() => 'sent', () => 'blocked'));
      const img = await new Promise<string>((done) => { const i = new Image(); i.onload = () => done('sent'); i.onerror = () => done('blocked'); i.src = 'https://www.google.com/pagead/1p-user-list/1/?x=1'; });
      return [...out, img];
    });
  const routeAds = (page: Page) =>
    page.route(/googlesyndication\.com|doubleclick\.net|www\.google\.com\/(rmkt|pagead)/, (route) => route.fulfill({ status: 200, contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64') }));

  test('Analytics only: the browser refuses every advertising request; GA4 hits still allowed', async ({ page }) => {
    await stubThirdParties(page);
    await routeAds(page);
    await page.route('https://region1.google-analytics.com/**', (route) => route.fulfill({ status: 204, body: '' }));
    await prepare(page, { analytics: 'granted', marketing: 'denied' });
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.getElementById('sygma-no-ads-csp') !== null)).toBe(true);
    expect(await probe(page)).toEqual(['blocked', 'blocked', 'blocked', 'blocked']);
    const ga = await page.evaluate(() => fetch('https://region1.google-analytics.com/g/collect?v=2', { method: 'POST', mode: 'no-cors' }).then(() => true, () => false));
    expect(ga).toBe(true);
  });

  test('Accept all: no block (advertising allowed)', async ({ page }) => {
    await stubThirdParties(page);
    await routeAds(page);
    await prepare(page, 'granted');
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.querySelector('script[data-sygma="ga4"]') !== null)).toBe(true);
    expect(await page.evaluate(() => document.getElementById('sygma-no-ads-csp'))).toBeNull();
    expect(await probe(page)).toEqual(['sent', 'sent', 'sent', 'sent']);
  });

  test('Analytics only, then Marketing granted: the page reloads without the block, ads consent granted', async ({ page }) => {
    await stubThirdParties(page);
    await routeAds(page);
    await prepare(page, { analytics: 'granted', marketing: 'denied' });
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.getElementById('sygma-no-ads-csp') !== null)).toBe(true);
    await page.getByRole('button', { name: 'Cookie settings' }).click();
    const banner = page.getByTestId('consent-banner');
    await banner.getByRole('checkbox', { name: /Marketing/ }).check();
    await Promise.all([page.waitForEvent('load'), banner.getByRole('button', { name: 'Save my choices' }).click()]);
    await expect.poll(() => page.evaluate(() => document.querySelector('script[data-sygma="gtm"]') !== null)).toBe(true);
    expect(await page.evaluate(() => document.getElementById('sygma-no-ads-csp'))).toBeNull();
    const last = await page.evaluate(() => (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>)).filter((a) => a[0] === 'consent').at(-1));
    expect(last).toEqual(['consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' }]);
  });
});

test.describe('Customize view: the main button saves only what is ticked (Tag Assistant report, 17/11/2026)', () => {
  test('Analytics ticked, Marketing not: the highlighted button is « Save my choices » and ads stay denied', async ({ page }) => {
    const hits = await stubThirdParties(page);
    await prepare(page);
    await page.goto('/');
    const banner = page.getByTestId('consent-banner');
    await banner.getByRole('button', { name: 'Customize' }).click();
    await banner.getByRole('checkbox', { name: /Analytics/ }).check();
    // The only highlighted (lime) button of the Customize view is « Save my choices ».
    await expect(banner.locator('.btn-lime')).toHaveCount(1);
    await expect(banner.locator('.btn-lime')).toHaveText('Save my choices');
    await banner.locator('.btn-lime').click();
    await expect.poll(() => hits.some((h) => h.includes('gtag/js'))).toBe(true);
    await page.waitForTimeout(800);
    const calls = await page.evaluate(() => (window.dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>)).filter((a) => a[0] === 'consent'));
    expect(calls[0]).toEqual(['consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 }]);
    expect(calls.filter((c) => c[1] === 'update')).toEqual([['consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }]]);
    expect(hits.some((h) => h.includes('gtm.js'))).toBe(false);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sygma_consent') ?? '{}'))).toMatchObject({ v: 2, analytics: 'granted', marketing: 'denied' });
  });

  test('« Accept all » and « Decline all » keep the same weight in the Customize view', async ({ page }) => {
    await stubThirdParties(page);
    await prepare(page);
    await page.goto('/');
    const banner = page.getByTestId('consent-banner');
    await banner.getByRole('button', { name: 'Customize' }).click();
    const accept = banner.getByRole('button', { name: 'Accept all' });
    const decline = banner.getByRole('button', { name: 'Decline all' });
    await expect(accept).toHaveClass(/ghost/);
    await expect(decline).toHaveClass(/ghost/);
  });
});
