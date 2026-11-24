import { expect, test, type Page } from '@playwright/test';
import en from '../../src/i18n/dictionaries/en';
import fr from '../../src/i18n/dictionaries/fr';
import de from '../../src/i18n/dictionaries/de';
import es from '../../src/i18n/dictionaries/es';
import it from '../../src/i18n/dictionaries/it';
import nl from '../../src/i18n/dictionaries/nl';
import sv from '../../src/i18n/dictionaries/sv';
import nb from '../../src/i18n/dictionaries/nb';
import { CONTENT_ON, ORDERS_OPEN, RELEASED_LANGS } from './released';

/**
 * Phase 15 — approved UI decisions.
 * D-1 page-wide prelaunch strip (closed builds only) · D-3 plan cards aligned from 901 px · D-4 return link on the English
 * legal pages · D-5 « Get started » next to the menu button of the collapsed fr/de/nl/nb header · D-6 self-hosted Inter.
 */
const DICTS = { en, fr, de, es, it, nl, sv, nb } as const;
type Lang = keyof typeof DICTS;
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const LANGS = (Object.keys(DICTS) as Lang[]).filter((l) => l === 'en' || PREVIEW || RELEASED_LANGS.includes(l));
const home = (l: Lang) => (l === 'en' ? '/' : `/${l}`);
const COLLAPSED: Lang[] = ['fr', 'de', 'nl', 'nb'];
const FONT = '/fonts/inter/inter-latin-wght-normal.v5.3.0.woff2';
const FONT_EXT = '/fonts/inter/inter-latin-ext-wght-normal.v5.3.0.woff2';
const strip = (page: Page) => page.getByTestId('prelaunch-strip');
/** Waits for the plan-card entrance animation (finite animations only). */
const settle = (page: Page) =>
  page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => null))));

test.describe('D-1 prelaunch strip', () => {
  const pages = ['/', '/blog', '/legal/terms', ...(CONTENT_ON ? ['/help', '/about', '/help/free-trial'] : [])];

  test('closed: one line under the header on every page, no date, link to the plans', async ({ page }) => {
    test.skip(ORDERS_OPEN, 'orders open: no strip');
    for (const l of LANGS) {
      const p = DICTS[l].prelaunch;
      for (const path of l === 'en' ? pages : [home(l), ...(CONTENT_ON ? [`/${l}/help`] : [])]) {
        await page.goto(path);
        const s = strip(page);
        await expect(s, path).toHaveCount(1);
        await expect(s, path).toBeVisible();
        await expect(s.locator('#prelaunch-strip-t'), path).toHaveText(p.pagesTitle);
        await expect(s.getByRole('link', { name: p.ui.stripPlans }), path).toHaveAttribute('href', l === 'en' ? '/#plans' : `/${l}#plans`);
        // D-2: no opening date anywhere in the strip.
        expect(await s.innerText(), path).not.toMatch(/\d/);
        // Right under the header, labelled by its own text, outside <main>.
        const order = await page.evaluate(() => {
          const h = document.querySelector('header.header')!;
          const a = document.querySelector('[data-testid="prelaunch-strip"]')!;
          return { next: h.nextElementSibling === a, label: a.getAttribute('aria-labelledby'), inMain: !!a.closest('main') };
        });
        expect(order, path).toEqual({ next: true, label: 'prelaunch-strip-t', inMain: false });
      }
    }
  });

  test('open (FEATURE_CONTACT_FORM=true): no strip', async ({ page }) => {
    test.skip(!ORDERS_OPEN, 'closed build');
    for (const path of [...pages, ...LANGS.filter((l) => l !== 'en').map(home)]) {
      await page.goto(path);
      await expect(page.getByTestId('prelaunch-strip'), path).toHaveCount(0);
    }
  });

  test('desktop: slim (≤ 36 px), one line, not sticky', async ({ page, isMobile }) => {
    test.skip(ORDERS_OPEN || isMobile, 'closed build, desktop');
    for (const l of LANGS) {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(home(l));
      const box = (await strip(page).boundingBox())!;
      expect(box.height, l).toBeLessThanOrEqual(37);
      expect(box.height, l).toBeGreaterThanOrEqual(32);
    }
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    const top = await strip(page).evaluate((e) => e.getBoundingClientRect().bottom);
    expect(top, 'scrolled away with the page').toBeLessThan(0);
  });

  test('320 px: no horizontal overflow, text and link inside the screen', async ({ page }) => {
    test.skip(ORDERS_OPEN, 'closed build');
    await page.setViewportSize({ width: 320, height: 640 });
    for (const l of LANGS) {
      for (const path of [home(l), ...(l === 'en' ? ['/legal/terms'] : [])]) {
        await page.goto(path);
        const r = await page.evaluate(() => {
          const s = document.querySelector('[data-testid="prelaunch-strip"]')!;
          const parts = [s.querySelector('.prelaunch-strip-text')!, s.querySelector('.prelaunch-strip-link')!].map((e) => e.getBoundingClientRect());
          return { sw: document.documentElement.scrollWidth, left: Math.min(...parts.map((p) => p.left)), right: Math.max(...parts.map((p) => p.right)), h: s.getBoundingClientRect().height };
        });
        expect(r.sw, `${path} scroll`).toBeLessThanOrEqual(320);
        expect(r.left, `${path} left`).toBeGreaterThanOrEqual(0);
        expect(r.right, `${path} right`).toBeLessThanOrEqual(320);
        expect(r.h, `${path} at most two lines`).toBeLessThanOrEqual(60);
      }
    }
  });
});

test.describe('D-3 plan cards from 901 px', () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'desktop layout'));
  test('prices and buttons line up (≤ 2 px) in every language; Plus stays the most prominent card', async ({ page }) => {
    test.setTimeout(240_000);
    for (const l of LANGS) {
      for (const width of [901, 1024, 1280, 1366, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(home(l));
        await page.locator('.tier-grid').scrollIntoViewIfNeeded();
        await expect(page.locator('.tier-grid.is-in')).toHaveCount(1);
        await settle(page);
        const m = await page.evaluate(() => {
          const cards = [...document.querySelectorAll<HTMLElement>('.tier-grid > .tier-card')];
          const top = (sel: string) => cards.map((c) => c.querySelector(sel)!.getBoundingClientRect().top);
          const spread = (a: number[]) => Math.max(...a) - Math.min(...a);
          const boxes = cards.map((c) => c.getBoundingClientRect());
          const plus = cards.findIndex((c) => c.classList.contains('is-recommended'));
          return {
            price: spread(top('.tier-price')), btn: spread(top(':scope > .btn')), n: cards.length, plus,
            plusTaller: boxes[plus]!.height - Math.max(...boxes.filter((_, i) => i !== plus).map((b) => b.height)),
            plusWider: boxes[plus]!.width - Math.max(...boxes.filter((_, i) => i !== plus).map((b) => b.width)),
            glow: getComputedStyle(cards[plus]!).boxShadow,
            sw: document.documentElement.scrollWidth,
          };
        });
        const at = `${l} @${width}px`;
        expect(m.n, at).toBe(3);
        expect(m.price, `${at} price rows`).toBeLessThanOrEqual(2);
        expect(m.btn, `${at} buttons`).toBeLessThanOrEqual(2);
        expect(m.plusTaller, `${at} Plus taller`).toBeGreaterThanOrEqual(20);
        expect(m.plusWider, `${at} Plus wider`).toBeGreaterThanOrEqual(10);
        expect(m.glow, `${at} Plus glow`).not.toBe('none');
        expect(m.sw, `${at} scroll`).toBeLessThanOrEqual(width);
      }
    }
  });
});

test.describe('D-4 return link on the English legal pages', () => {
  const others = LANGS.filter((l) => l !== 'en');
  const back = (page: Page) => page.getByTestId('legal-return');

  test('no link from English, on a direct visit, or for a language this build does not have', async ({ page }) => {
    await page.goto('/legal/terms');
    await expect(page.locator('h1')).toBeVisible();
    await expect(back(page)).toHaveCount(0);
    await page.goto('/');
    await page.locator('footer a[href^="/legal/privacy"]').click();
    await page.waitForURL(/\/legal\/privacy$/);
    await expect(page.locator('h1')).toHaveText(en.legal.docs.privacy.title);
    await expect(back(page)).toHaveCount(0);
    // ?from= with English, an unknown code or (production) a language that is not built: ignored.
    for (const q of ['en', 'xx', ...(['fr', 'de'] as Lang[]).filter((l) => !LANGS.includes(l))]) {
      await page.goto(`/legal/terms?from=${q}`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(back(page), q).toHaveCount(0);
    }
  });

  test('from a translated page (footer link): link in that language back to its site; canonical unchanged', async ({ page }) => {
    test.skip(others.length === 0, 'single-language build');
    for (const l of others) {
      await page.goto(home(l));
      const link = page.locator('footer a[href^="/legal/terms"]');
      await expect(link).toHaveAttribute('href', `/legal/terms?from=${l}`);
      await link.click();
      await page.waitForURL(new RegExp(`/legal/terms\\?from=${l}$`));
      const a = back(page).getByRole('link');
      await expect(a, l).toHaveText(DICTS[l].prelaunch.ui.legalBack);
      await expect(a, l).toHaveAttribute('href', home(l));
      await expect(a, l).toHaveAttribute('lang', l);
      // Above the title.
      const [y1, y2] = await Promise.all([back(page).boundingBox(), page.locator('h1').boundingBox()]);
      expect(y1!.y, l).toBeLessThan(y2!.y);
      // Same English page for search engines: canonical without the query, robots unchanged.
      expect(await page.evaluate(() => document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? ''), l).toMatch(/\/legal\/terms$/);
      const robots = await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null);
      await page.goto('/legal/terms');
      expect(await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null), `${l} robots`).toBe(robots);
    }
    // The link leads back.
    await page.goto(`/legal/privacy?from=${others[0]}`);
    await back(page).getByRole('link').click();
    await page.waitForURL(new RegExp(`/${others[0]}$`));
  });

  test('from a translated page through a link without ?from= (client-side navigation): back to that page', async ({ page }) => {
    test.skip(others.length === 0 || !CONTENT_ON, 'needs another language and the Help center');
    const l = others.includes('de') ? 'de' : others[0]!;
    await page.goto(`/${l}/help`);
    await page.locator('main a[href="/legal/refunds"]').first().click();
    await page.waitForURL(/\/legal\/refunds$/);
    const a = back(page).getByRole('link');
    await expect(a).toHaveText(DICTS[l].prelaunch.ui.legalBack);
    await expect(a).toHaveAttribute('href', `/${l}/help`);
  });
});

test.describe('D-5 collapsed header (fr, de, nl, nb, 901–1359 px): one call to action stays visible', () => {
  const langs = LANGS.filter((l) => COLLAPSED.includes(l));
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'desktop header'));

  test('« Get started » next to the menu button at every width, no overflow; hidden outside 901–1359 px', async ({ page }) => {
    test.skip(langs.length === 0, 'no long language in this build');
    test.setTimeout(180_000);
    for (const l of langs) {
      for (const width of [900, 901, 940, 1000, 1024, 1100, 1180, 1181, 1280, 1300, 1359, 1360]) {
        await page.setViewportSize({ width, height: 700 });
        await page.goto(home(l));
        const cta = page.locator('.nav-cta-xl');
        const shown = width >= 901 && width <= 1359;
        await expect(cta, `${l} @${width}`).toBeVisible({ visible: shown });
        if (!shown) continue;
        await expect(cta).toHaveText(DICTS[l].nav.getStarted);
        await expect(cta).toHaveAttribute('href', `/${l}#plans`);
        const r = await page.evaluate(() => {
          const wrap = document.querySelector('.header .wrap')!;
          const right = wrap.getBoundingClientRect().right - parseFloat(getComputedStyle(wrap).paddingRight);
          const nav = document.querySelector('.header .nav')!.getBoundingClientRect();
          const [brand, cta, menu] = ['.brand-link', '.nav-cta-xl', '.mobile-menu'].map((s) => document.querySelector(s)!.getBoundingClientRect());
          return {
            order: brand!.right <= cta!.left && cta!.right <= menu!.left, gap: menu!.left - cta!.right,
            inside: [brand!, cta!, menu!].every((p) => p.right <= right + 1 && p.top >= nav.top - 1 && p.bottom <= nav.bottom + 1),
            h: cta!.height, sw: document.documentElement.scrollWidth,
          };
        });
        expect(r.order, `${l} @${width} brand | CTA | menu, no overlap`).toBe(true);
        expect(r.gap, `${l} @${width} CTA next to the menu`).toBeLessThanOrEqual(24);
        expect(r.inside, `${l} @${width} inside the header`).toBe(true);
        expect(r.h, `${l} @${width} touch target`).toBeGreaterThanOrEqual(44);
        expect(r.sw, `${l} @${width} scroll`).toBeLessThanOrEqual(width);
      }
    }
  });

  test('the menu still works: keyboard, Escape, outside click; the CTA goes to the plans', async ({ page }) => {
    test.skip(langs.length === 0, 'no long language in this build');
    const l = langs[0]!;
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.goto(home(l));
    const menu = page.locator('.mobile-menu');
    const panel = page.locator('#navlinks');
    // Tab order: brand, CTA, menu button.
    await page.locator('.brand-link').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('.nav-cta-xl')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(menu).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(panel).toBeVisible();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    await expect(panel.locator('a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(menu).toBeFocused();
    await menu.click();
    await expect(panel).toBeVisible();
    await page.mouse.click(5, 500);
    await expect(panel).toBeHidden();
    await page.locator('.nav-cta-xl').click();
    await expect(page).toHaveURL(new RegExp(`/${l}#plans$`));
  });

  test('other languages: no extra call to action in the header', async ({ page }) => {
    for (const l of LANGS.filter((x) => !COLLAPSED.includes(x))) {
      await page.goto(home(l));
      await expect(page.locator('.nav-cta-xl'), l).toHaveCount(0);
    }
  });
});

test.describe('D-6 self-hosted Inter', () => {
  test('font files and licence are served with the right type; CSP allows them', async ({ request }) => {
    for (const path of [FONT, FONT_EXT]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect(res.headers()['content-type'], path).toBe('font/woff2');
      const body = await res.body();
      expect(body.subarray(0, 4).toString('latin1'), path).toBe('wOF2');
      expect(body.length, path).toBeLessThan(90_000);
    }
    const ofl = await request.get('/fonts/inter/OFL.txt');
    expect(ofl.status()).toBe(200);
    expect(await ofl.text()).toContain('SIL Open Font License, Version 1.1');
    const page = await request.get('/');
    expect(page.headers()['content-security-policy']).toContain("font-src 'self'");
  });

  test('pages use Inter: preloaded once (Latin only), loaded, computed font; Latin Extended not downloaded', async ({ page }) => {
    const fonts: string[] = [];
    page.on('request', (r) => r.url().includes('/fonts/') && fonts.push(new URL(r.url()).pathname));
    for (const l of LANGS.slice(0, 3)) {
      await page.goto(home(l));
      await expect(page.locator(`head link[rel="preload"][as="font"]`)).toHaveCount(1);
      await expect(page.locator(`head link[rel="preload"][as="font"]`)).toHaveAttribute('href', FONT);
      const r = await page.evaluate(async () => {
        await document.fonts.ready;
        return {
          body: getComputedStyle(document.body).fontFamily,
          h1: getComputedStyle(document.querySelector('h1')!).fontFamily,
          loaded: [...document.fonts].some((f) => f.family.replace(/"/g, '') === 'Inter Variable' && f.status === 'loaded'),
          check: document.fonts.check('700 16px "Inter Variable"', 'SYGMA'),
        };
      });
      expect(r.body.split(',')[0]!.replace(/["']/g, '').trim(), l).toBe('Inter Variable');
      expect(r.h1.split(',')[0]!.replace(/["']/g, '').trim(), l).toBe('Inter Variable');
      expect(r.loaded, l).toBe(true);
      expect(r.check, l).toBe(true);
    }
    expect(fonts.length).toBeGreaterThan(0);
    expect(fonts.every((f) => f === FONT), fonts.join(', ')).toBe(true);
  });
});
