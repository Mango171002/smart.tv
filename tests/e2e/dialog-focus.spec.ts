import { expect, test, type Locator, type Page } from '@playwright/test';
import { RELEASED_LANGS } from './released';

/**
 * Phase 12 (UI audit U-001, U-006) — keyboard focus of the free-trial and support windows and of the header menu, in the
 * prelaunch build (no form: Close / « Back » only) and in the build with online requests open (form). WCAG 2.4.3:
 * - on opening, the focus moves inside the window; 8 Tabs (and Shift+Tab) stay inside; Escape closes it;
 * - on closing, the focus comes back to a visible element: the opener, or the menu button when the opener was in the
 *   menu that closed meanwhile (phones, collapsed fr / de / nl / nb header up to 1359 px);
 * - the header menu button comes before the menu: the next Tab enters the open menu; Escape and an outside tap close it.
 */
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const has = (l: string) => l === 'en' || PREVIEW || RELEASED_LANGS.includes(l);
const home = (l: string) => (l === 'en' ? '/' : `/${l}`);

async function inside(dialog: Locator) {
  return dialog.evaluate((d) => d.contains(document.activeElement) && document.activeElement !== d);
}
/** The focused element: visible, outside any window, keyboard focus ring shown (:focus-visible). */
async function focusedOnPage(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return { ok: false, what: 'body' };
    const r = el.getBoundingClientRect();
    return {
      ok: r.width > 0 && r.height > 0 && !el.closest('[role="dialog"]') && el.matches(':focus-visible'),
      what: `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${r.width}x${r.height}`,
      cls: String(el.className),
    };
  });
}

async function checkWindow(page: Page, where: string) {
  const dialog = page.getByTestId('request-dialog');
  await expect(dialog).toBeVisible();
  await expect.poll(() => inside(dialog), `${where}: focus inside on open`).toBe(true);
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await inside(dialog), `${where}: Tab ${i + 1} stays inside`).toBe(true);
  }
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await inside(dialog), `${where}: Shift+Tab ${i + 1} stays inside`).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect.poll(async () => (await focusedOnPage(page)).ok, `${where}: focus back on a visible element`).toBe(true);
  return focusedOnPage(page);
}

/** Keyboard activation of a control (focus + Enter), as a keyboard user would. */
async function press(page: Page, target: Locator) {
  await target.focus();
  await page.keyboard.press('Enter');
}

test.describe('free-trial and support windows: focus (U-001)', () => {
  test('header « Free trial » (wide screen): focus inside, trapped, back on the button', async ({ page, isMobile }) => {
    test.skip(isMobile, 'wide-screen header');
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');
    const opener = page.locator('.nav-ctas button');
    await press(page, opener);
    await checkWindow(page, 'en@1366 header trial');
    await expect(opener).toBeFocused();
  });

  test('« Free trial » from the open phone menu: focus back on the menu button', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const menu = page.locator('.mobile-menu');
    await press(page, menu);
    await expect(page.locator('#navlinks')).toHaveClass(/open/);
    await press(page, page.locator('.nav-ctas button'));
    await checkWindow(page, 'en@375 menu trial');
    await expect(menu).toBeFocused();
    await expect(page.locator('#navlinks')).not.toHaveClass(/open/);
  });

  test('« Free trial » from the collapsed fr header at 1280 px: focus back on the menu button', async ({ page, isMobile }) => {
    test.skip(isMobile || !has('fr'), 'French collapsed header (preview / released builds)');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/fr');
    const menu = page.locator('.mobile-menu');
    await expect(menu).toBeVisible();
    await press(page, menu);
    await press(page, page.locator('.nav-ctas button'));
    await checkWindow(page, 'fr@1280 collapsed trial');
    await expect(menu).toBeFocused();
  });

  for (const width of [375, 1366]) {
    test(`support button @${width}px: focus inside, trapped, back on the support button`, async ({ page }) => {
      await page.setViewportSize({ width, height: 850 });
      await page.goto('/');
      const fab = page.locator('.support-fab');
      await press(page, fab);
      await checkWindow(page, `en@${width} support`);
      await expect(fab).toBeFocused();
    });
  }

  test('closing-banner « free trial » button: focus back on it', async ({ page }) => {
    await page.setViewportSize({ width: 414, height: 896 });
    await page.goto('/');
    const opener = page.locator('.cta-actions .btn-lime');
    await opener.scrollIntoViewIfNeeded();
    await press(page, opener);
    await checkWindow(page, 'en@414 banner trial');
    await expect(opener).toBeFocused();
  });

  test('a mouse click on the opener also moves the focus inside the window', async ({ page, isMobile }) => {
    test.skip(isMobile, 'pointer flow on the wide header');
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');
    await page.locator('.support-fab').click();
    const dialog = page.getByTestId('request-dialog');
    await expect.poll(() => inside(dialog)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.locator('.support-fab')).toBeFocused();
  });
});

test.describe('header menu: keyboard order and closing (U-006)', () => {
  const cases: Array<[string, number]> = [['en', 375], ['en', 768], ...(['fr', 'de', 'nl', 'nb'] as const).filter(has).flatMap((l): Array<[string, number]> => [[l, 320], [l, 901], [l, 1280], [l, 1359]])];
  for (const [lang, width] of cases) {
    test(`${lang}@${width}px: Tab after opening enters the menu; Escape and an outside tap close it`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(home(lang));
      const menu = page.locator('.mobile-menu');
      const nav = page.locator('#navlinks');
      await expect(menu).toBeVisible();
      await press(page, menu);
      await expect(nav).toHaveClass(/open/);
      await page.keyboard.press('Tab');
      expect(await nav.evaluate((n) => n.contains(document.activeElement)), 'next Tab is inside the open menu').toBe(true);
      await expect(nav.locator('a').first()).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(nav).not.toHaveClass(/open/);
      await expect(menu).toBeFocused();
      // Outside tap / click closes; the button still toggles.
      await menu.click();
      await expect(nav).toHaveClass(/open/);
      await page.mouse.click(5, 790);
      await expect(nav).not.toHaveClass(/open/);
      await menu.click();
      await expect(nav).toHaveClass(/open/);
      await menu.click();
      await expect(nav).not.toHaveClass(/open/);
      // Nothing moved: the header keeps its height and the page never scrolls sideways.
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }
});
