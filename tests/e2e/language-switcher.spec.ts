import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { RELEASED_LANGS, CONTENT_ON } from './released';

/**
 * Language switcher (phase 9).
 * Production build: one language → no switcher at all (no link to an unpublished language).
 * Preview (E2E_SITE_MODE=preview): the 8 languages. Released (E2E_RELEASED=…): English + the released ones.
 */
const ALL = [
  ['en', 'English'], ['fr', 'Français'], ['de', 'Deutsch'], ['es', 'Español'], ['it', 'Italiano'], ['nl', 'Nederlands'], ['sv', 'Svenska'], ['nb', 'Norsk bokmål'],
] as const;
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
/** The content pages (About us, Help center) exist in the build under test: E2E_CONTENT_PAGES=preview or live. */
const CONTENT = CONTENT_ON;
const LANGS = ALL.filter(([c]) => c === 'en' || PREVIEW || RELEASED_LANGS.includes(c));
const prefix = (c: string) => (c === 'en' ? '' : `/${c}`);
const home = (c: string) => prefix(c) || '/';
/** A page that exists in every language: a Help topic when the content pages are on, the blog otherwise. */
const PAGE = CONTENT ? '/help/devices' : '/blog';

/** Languages whose header uses the menu button from 901 to 1359 px (long labels; NAV_COLLAPSE in LanguageSwitcher.tsx). */
const COLLAPSED = ['fr', 'de', 'nl', 'nb'];
const button = (page: Page) => page.locator('.lang-switch-btn');
const list = (page: Page) => page.locator('.lang-switch-list');

test.describe('language switcher — production build (one language)', () => {
  test.skip(LANGS.length > 1, 'production-mode checks');
  test('no switcher, no link to another language', async ({ page }) => {
    for (const path of ['/', '/blog', '/legal/privacy']) {
      await page.goto(path);
      await expect(page.locator('[data-lang-switcher]')).toHaveCount(0);
      await expect(page.locator('a[href^="/fr"], a[href^="/de"], a[href^="/es"], a[href^="/it"], a[href^="/nl"], a[href^="/sv"], a[href^="/nb"]')).toHaveCount(0);
    }
  });
});

test.describe('language switcher — desktop', () => {
  test.skip(LANGS.length < 2, 'needs two or more languages');
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'desktop dropdown'));
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const [code, name] of LANGS) {
    test(`${code}: globe + current language, native names, same page in every language, active marked`, async ({ page }) => {
      await page.goto(`${prefix(code)}${PAGE}`);
      const btn = button(page);
      await expect(btn).toBeVisible();
      await expect(btn).toHaveAttribute('aria-expanded', 'false');
      await expect(btn).toContainText(code.toUpperCase());
      await expect(btn).toHaveAccessibleName(new RegExp(`${code.toUpperCase()}.*${name}`));
      await expect(list(page)).toBeHidden();
      await btn.click();
      await expect(btn).toHaveAttribute('aria-expanded', 'true');
      const links = list(page).getByRole('link');
      await expect(links).toHaveCount(LANGS.length);
      for (const [i, [c, n]] of LANGS.entries()) {
        const a = links.nth(i);
        await expect(a).toContainText(n);
        await expect(a).toHaveAttribute('href', `${prefix(c)}${PAGE}`);
        await expect(a).toHaveAttribute('hreflang', c);
        await expect(a).toHaveAttribute('lang', c);
        if (c === code) await expect(a).toHaveAttribute('aria-current', 'true');
        else await expect(a).not.toHaveAttribute('aria-current', /.*/);
      }
      // No flags: no emoji regional indicators, no flag images.
      expect(await list(page).innerText()).not.toMatch(/\p{Regional_Indicator}/u);
      await expect(list(page).locator('img')).toHaveCount(0);
      // The panel stays inside the viewport.
      const box = (await list(page).boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    });
  }

  test('switching keeps the page, updates the language, and the browser history works', async ({ page }) => {
    const [a, b] = [LANGS[0]![0], LANGS[LANGS.length - 1]![0]];
    await page.goto(`${prefix(a)}${PAGE}`);
    await button(page).click();
    await list(page).locator(`a[hreflang="${b}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${prefix(b)}${PAGE}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', b);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${prefix(b)}${PAGE}$`));
    await expect(button(page)).toContainText(b.toUpperCase());
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${prefix(a) || ''}${PAGE}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', a);
    await page.goForward();
    await expect(page.locator('html')).toHaveAttribute('lang', b);
  });

  test('section anchors are kept (#faq) and pages missing in a language fall back to its home page', async ({ page }) => {
    const other = LANGS[1]![0];
    await page.goto('/#faq');
    await button(page).click();
    await list(page).locator(`a[hreflang="${other}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${other}#faq$`));
    // Legal documents exist in English only → the other languages link to their home page.
    await page.goto('/legal/privacy');
    await button(page).click();
    for (const [c] of LANGS) await expect(list(page).locator(`a[hreflang="${c}"]`)).toHaveAttribute('href', c === 'en' ? '/legal/privacy' : home(c));
    // A missing page (404) → every link goes to a home page.
    await page.goto(`/${other}/no-such-page`);
    await button(page).click();
    for (const [c] of LANGS) await expect(list(page).locator(`a[hreflang="${c}"]`)).toHaveAttribute('href', home(c));
  });

  test('keyboard: arrows, Home / End, Escape returns focus, Tab out closes; click outside closes', async ({ page }) => {
    await page.goto(home(LANGS[1]![0]));
    const btn = button(page);
    await btn.focus();
    await page.keyboard.press('Enter');
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(list(page)).toBeVisible();
    await expect(list(page).locator('a[aria-current="true"]')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(list(page).getByRole('link').nth(2)).toBeFocused();
    await page.keyboard.press('End');
    await expect(list(page).getByRole('link').last()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(list(page).getByRole('link').first()).toBeFocused();
    await page.keyboard.press('Home');
    await expect(list(page).getByRole('link').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(list(page)).toBeHidden();
    await expect(btn).toBeFocused();
    await page.keyboard.press('Space');
    await expect(list(page)).toBeVisible();
    await page.keyboard.press('ArrowUp');
    await expect(list(page).getByRole('link').last()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(list(page)).toBeHidden();
    await btn.click();
    await expect(list(page)).toBeVisible();
    await page.mouse.click(5, 400);
    await expect(list(page)).toBeHidden();
  });

  for (const [c] of LANGS) {
    test(`${c}: header fits on one line (901–1920 px); long languages use the menu up to 1359 px`, async ({ page }) => {
      for (const width of [901, 960, 1024, 1100, 1180, 1181, 1280, 1359, 1360, 1366, 1440, 1920]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(home(c));
        const collapsed = COLLAPSED.includes(c) && width <= 1359;
        await expect(page.locator('.mobile-menu'), `${c} @${width}px menu button`).toBeVisible({ visible: collapsed });
        await expect(button(page), `${c} @${width}px globe`).toBeVisible({ visible: !collapsed });
        const r = await page.evaluate(() => {
          const wrap = document.querySelector('.header .wrap')!;
          const right = wrap.getBoundingClientRect().right - parseFloat(getComputedStyle(wrap).paddingRight);
          const nav = document.querySelector('.header .nav')!.getBoundingClientRect();
          const parts = [document.querySelector('.brand-link'), ...document.querySelectorAll('#navlinks > a'), document.querySelector('.lang-switch'), ...document.querySelectorAll('.nav-ctas > *'), document.querySelector('.mobile-menu'), document.querySelector('.nav-cta-xl')]
            .filter(Boolean).map((e) => e!.getBoundingClientRect()).filter((p) => p.width > 0);
          const overlaps = parts.some((p, i) => parts.slice(i + 1).some((q) => p.right > q.left + 0.5 && q.right > p.left + 0.5 && p.bottom > q.top && q.bottom > p.top));
          const outside = parts.some((p) => p.right > right + 1 || p.top < nav.top - 1 || p.bottom > nav.bottom + 1);
          const mids = parts.map((p) => p.top + p.height / 2);
          return { overlaps, outside, rows: Math.max(...mids) - Math.min(...mids), sw: document.documentElement.scrollWidth };
        });
        expect(r.overlaps, `${c} @${width}px overlap`).toBe(false);
        expect(r.outside, `${c} @${width}px outside the header`).toBe(false);
        expect(r.rows, `${c} @${width}px one line`).toBeLessThanOrEqual(4);
        expect(r.sw, `${c} @${width}px scroll`).toBeLessThanOrEqual(width);
      }
    });
  }

  test('long languages between 901 and 1359 px: the menu holds the links, the CTAs and the language section', async ({ page }) => {
    const langs = LANGS.filter(([c]) => COLLAPSED.includes(c));
    test.skip(langs.length === 0, 'no long language in this build');
    for (const [c] of langs) {
      for (const width of [1024, 1280]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`${prefix(c)}${PAGE}`);
        await page.locator('.mobile-menu').click();
        const panel = page.locator('#navlinks');
        await expect(panel).toBeVisible();
        await expect(panel.locator('.lang-mobile')).toBeVisible();
        await expect(panel.locator('.lang-mobile a')).toHaveCount(LANGS.length);
        await expect(panel.locator('.lang-mobile a[aria-current="true"]')).toHaveAttribute('hreflang', c);
        const box = (await panel.boundingBox())!;
        expect(box.x + box.width, `${c} @${width}px panel`).toBeLessThanOrEqual(width);
        await page.keyboard.press('Escape');
        await expect(panel.locator('.lang-mobile')).toBeHidden();
      }
    }
  });

  test('accessibility: no axe violation with the dropdown open (WCAG 2.1 AA)', async ({ page }) => {
    for (const [c] of LANGS.slice(0, 3)) {
      await page.goto(home(c));
      await button(page).click();
      const results = await new AxeBuilder({ page }).include('.header').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations.map((v) => `${c} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    }
  });
});

test.describe('language switcher — mobile menu', () => {
  test.skip(LANGS.length < 2, 'needs two or more languages');
  test.beforeEach(({ isMobile }) => test.skip(!isMobile, 'mobile menu'));

  for (const [code] of LANGS) {
    test(`${code}: language section in the menu, large touch targets, no overflow`, async ({ page }) => {
      await page.goto(`${prefix(code)}${PAGE}`);
      await expect(button(page)).toBeHidden();
      const section = page.locator('.lang-mobile');
      await expect(section).toBeHidden();
      await page.locator('.mobile-menu').click();
      await expect(section).toBeVisible();
      const links = section.getByRole('link');
      await expect(links).toHaveCount(LANGS.length);
      for (const [i, [c, n]] of LANGS.entries()) {
        const a = links.nth(i);
        await expect(a).toContainText(n);
        await expect(a).toHaveAttribute('href', `${prefix(c)}${PAGE}`);
        const box = (await a.boundingBox())!;
        expect(box.height, `${n} touch target`).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
      }
      await expect(section.locator(`a[aria-current="true"]`)).toHaveAttribute('hreflang', code);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
    });
  }

  test('tap a language: same page in that language; back returns', async ({ page }) => {
    const [a, b] = [LANGS[0]![0], LANGS[LANGS.length - 1]![0]];
    await page.goto(`${prefix(a)}${PAGE}`);
    await page.locator('.mobile-menu').click();
    await page.locator(`.lang-mobile a[hreflang="${b}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('lang', b);
    await expect(page).toHaveURL(new RegExp(`${prefix(b)}${PAGE}$`));
    await page.goBack();
    await expect(page.locator('html')).toHaveAttribute('lang', a);
  });

  test('accessibility: no axe violation with the menu open', async ({ page }) => {
    await page.goto(home(LANGS[LANGS.length - 1]![0]));
    await page.locator('.mobile-menu').click();
    const results = await new AxeBuilder({ page }).include('.header').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
});

test.describe('language switcher — SEO', () => {
  test.skip(LANGS.length < 2, 'needs two or more languages');
  test('rendered in the HTML (crawlable links), canonical and hreflang unchanged, preview pages stay noindex', async ({ request }) => {
    for (const [c] of LANGS) {
      const res = await request.get(home(c));
      const html = await res.text();
      for (const [o] of LANGS) expect(html, `${c} → ${o}`).toContain(`href="${home(o)}" hrefLang="${o}"`);
      const head = html.split('</head>')[0]!;
      const alternates = (head.match(/<link rel="alternate" hrefLang=/g) ?? []).length;
      const released = c === 'en' || RELEASED_LANGS.includes(c);
      if (!released) {
        expect(res.headers()['x-robots-tag']).toBe('noindex, nofollow');
        expect(head).toContain('<meta name="robots" content="noindex, nofollow"/>');
        expect(alternates).toBe(0);
      } else if (RELEASED_LANGS.length) {
        expect(alternates).toBe(RELEASED_LANGS.length + 2);
      }
    }
  });
});
