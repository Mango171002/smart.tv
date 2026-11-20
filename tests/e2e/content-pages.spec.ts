import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Phase 5C content pages. Default run = production build (switch off): nothing exists, nothing changes.
 * With E2E_CONTENT_PAGES=preview (build made with NEXT_PUBLIC_CONTENT_PAGES=preview): pages, SEO, a11y.
 */
const PREVIEW = process.env.E2E_CONTENT_PAGES === 'preview';
const TOPICS = ['getting-started', 'devices', 'free-trial', 'ordering-payment', 'troubleshooting', 'contact-support', 'refunds'];

test.describe('content pages — switch off (production)', () => {
  test.skip(PREVIEW, 'production-mode checks');
  test('no About / Help center pages, /help still redirects to the FAQ, no new link', async ({ page, request }) => {
    expect((await request.get('/about')).status()).toBe(404);
    expect((await request.get('/help/refunds')).status()).toBe(404);
    const help = await request.get('/help', { maxRedirects: 0 });
    expect(help.status()).toBe(308);
    expect(help.headers()['location']).toBe('/#faq');
    await page.goto('/');
    await expect(page.locator('a[href="/about"], a[href="/help"]')).toHaveCount(0);
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).not.toMatch(/\/about<|\/help/);
  });
});

test.describe('content pages — preview', () => {
  test.skip(!PREVIEW, 'needs a build with NEXT_PUBLIC_CONTENT_PAGES=preview');

  const pages = [
    { path: '/about', h1: 'About SYGMA TV+', type: 'AboutPage', crumbs: ['Home', 'About us'] },
    { path: '/help', h1: 'Help center', type: 'CollectionPage', crumbs: ['Home', 'Help center'] },
    ...TOPICS.map((t) => ({ path: `/help/${t}`, h1: null, type: 'WebPage', crumbs: ['Home', 'Help center', null] })),
  ];

  for (const p of pages) {
    test(`${p.path}: 200, metadata, noindex in preview, breadcrumbs, structured data`, async ({ page }) => {
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);
      const title = await page.title();
      expect(title.endsWith(' | SYGMA TV+')).toBe(true);
      expect(title.length).toBeLessThanOrEqual(60);
      const desc = (await page.locator('meta[name="description"]').getAttribute('content'))!;
      expect(desc.length).toBeLessThanOrEqual(155);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${p.path}$`));
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      if (p.h1) await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.h1);
      const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem');
      await expect(crumbs).toHaveCount(p.crumbs.length);
      await expect(crumbs.last().locator('[aria-current="page"]')).toHaveCount(1);
      const lds = await page.locator('script[type="application/ld+json"]').allTextContents();
      const types = lds.map((t) => JSON.parse(t)['@type']);
      expect(types).toContain('BreadcrumbList');
      expect(types).toContain(p.type);
      const bc = lds.map((t) => JSON.parse(t)).find((d) => d['@type'] === 'BreadcrumbList');
      expect(bc.itemListElement.map((i: { position: number }) => i.position)).toEqual(p.crumbs.map((_, i) => i + 1));
      const body = await page.locator('main').innerText();
      expect(body).not.toMatch(/\d{1,3},\d{3}|\bbest\b|iptv|replay|\bchannels?\b/i);
      expect(body).toContain('Last reviewed');
    });
  }

  test('About: verified company facts, owner facts worded as usual times, no unproven promise', async ({ page }) => {
    await page.goto('/about');
    const main = page.locator('main');
    for (const v of ['Sygma TV LLC', '98-1836592', 'Albuquerque', 'support@sygmatv.com', '+44 7412 857594', 'Established', '2026', '24/7', 'usually replies in under an hour']) await expect(main).toContainText(v);
    for (const l of ['English', 'French', 'Arabic', 'German', 'Spanish', 'Italian']) await expect(main.getByRole('list', { name: 'Support languages' })).toContainText(l);
    await expect(main.getByRole('list', { name: 'Payment methods' }).getByRole('listitem')).toHaveCount(6);
    await expect(main).toContainText('none is charged automatically on this website');
    await expect(main).not.toContainText(/pdf|invoice|smarters|ibo player|guaranteed/i);
    await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('link')).toHaveCount(8);
  });

  test('topic page: table of contents, previous/next, calls to action open the site dialogs', async ({ page }) => {
    await page.goto('/help/ordering-payment');
    await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: 'When and how do I pay?' })).toHaveAttribute('href', '#pay');
    const pager = page.getByRole('navigation', { name: 'Help topics' });
    await expect(pager.getByRole('link')).toHaveCount(2);
    await expect(pager.getByRole('link').last()).toHaveAttribute('href', '/help/troubleshooting');
    await page.locator('main').getByRole('button', { name: 'Contact support' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.goto('/help/free-trial');
    await page.locator('main').getByRole('button', { name: 'Request a free trial' }).click();
    await expect(page.getByRole('dialog', { name: 'Request a Trial' })).toBeVisible();
  });

  test('keyboard: skip link first, then breadcrumb and topic cards reachable with Tab, visible focus', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard navigation is a desktop check');
    await page.goto('/help');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText('Skip to content');
    await page.keyboard.press('Enter');
    let reached = false;
    for (let i = 0; i < 30 && !reached; i++) {
      await page.keyboard.press('Tab');
      reached = (await page.evaluate(() => document.activeElement?.getAttribute('href'))) === '/help/getting-started';
    }
    expect(reached).toBe(true);
    const outline = await page.evaluate(() => { const st = getComputedStyle(document.activeElement!); return st.outlineStyle !== 'none' || st.boxShadow !== 'none' || st.borderColor !== ''; });
    expect(outline).toBe(true);
  });

  test('Help center: one card per topic, internal links work', async ({ page }) => {
    await page.goto('/help');
    const cards = page.locator('main ul[aria-label="Help topics"] a');
    await expect(cards).toHaveCount(7);
    await cards.nth(6).click();
    await expect(page).toHaveURL(/\/help\/refunds$/);
    await expect(page.getByRole('link', { name: 'Full refund policy' })).toHaveAttribute('href', '/legal/refunds');
  });

  test('navigation: header Help → /help, footer About us + Help center; sitemap unchanged in preview', async ({ page, request, isMobile }) => {
    await page.goto('/');
    if (isMobile) await page.getByRole('button', { name: 'Toggle menu' }).click();
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Help' })).toHaveAttribute('href', '/help');
    await expect(page.locator('footer a[href="/about"]')).toHaveCount(1);
    await expect(page.locator('footer a[href="/help"]')).toHaveCount(1);
    await expect(page.locator('footer a[href="/#faq"]')).toHaveText('FAQ');
    expect((await request.get('/help', { maxRedirects: 0 })).status()).toBe(200);
    expect(await (await request.get('/sitemap.xml')).text()).not.toMatch(/\/about<|\/help/);
  });

  for (const path of ['/about', '/help', '/help/refunds']) {
    test(`axe WCAG 2.1 AA: ${path}`, async ({ page }) => {
      await page.goto(path);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
    });
  }
});
