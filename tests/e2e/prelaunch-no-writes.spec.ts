import { expect, test, type Locator, type Page } from '@playwright/test';
import en from '../../src/i18n/dictionaries/en';
import fr from '../../src/i18n/dictionaries/fr';
import de from '../../src/i18n/dictionaries/de';
import es from '../../src/i18n/dictionaries/es';
import it from '../../src/i18n/dictionaries/it';
import nl from '../../src/i18n/dictionaries/nl';
import sv from '../../src/i18n/dictionaries/sv';
import nb from '../../src/i18n/dictionaries/nb';
import { ORDERS_OPEN, RELEASED_LANGS } from './released';

/**
 * Release candidate (8 languages) — prelaunch, nothing is written. While online requests are closed
 * (FEATURE_CONTACT_FORM=false), a visitor going through the order window, the free-trial window and the support window
 * in any built language never makes a write request (POST / PUT / PATCH) to /api/contact, /api/checkout or a Supabase
 * host, and the order and free-trial windows offer no form control to the keyboard (Tab / Shift+Tab stay in the window
 * and never reach an input, select, textarea, combobox or editable element).
 * Forbidden requests are recorded and then aborted, so a defect can never write to the real database during a test.
 */
const DICTS = { en, fr, de, es, it, nl, sv, nb } as const;
type Lang = keyof typeof DICTS;
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const LANGS = (Object.keys(DICTS) as Lang[]).filter((l) => l === 'en' || PREVIEW || RELEASED_LANGS.includes(l));
const home = (l: Lang) => (l === 'en' ? '/' : `/${l}`);
const WRITE_METHODS = ['POST', 'PUT', 'PATCH'];
const FORBIDDEN_PATH = /^\/api\/(contact|checkout)(\/|$)/;
const isSupabase = (u: URL) => /(^|\.)supabase\.(co|in|com|net)$/.test(u.hostname);
const isForbidden = (r: { method: string; url: string }) => {
  const u = new URL(r.url);
  return WRITE_METHODS.includes(r.method) && (FORBIDDEN_PATH.test(u.pathname) || isSupabase(u));
};
const TABS = 14;

test.skip(ORDERS_OPEN, 'build with online requests open (E2E_ORDERS_OPEN=true)');

/** Records every request of the page; aborts the forbidden ones (after recording them). */
async function recordRequests(page: Page) {
  const all: { method: string; url: string }[] = [];
  page.on('request', (r) => all.push({ method: r.method(), url: r.url() }));
  await page.route(
    (u) => FORBIDDEN_PATH.test(u.pathname) || isSupabase(u),
    (route) => (WRITE_METHODS.includes(route.request().method()) ? route.abort('blockedbyclient') : route.fallback()),
  );
  return {
    all,
    forbidden: () => all.filter(isForbidden),
  };
}

/** Presses Tab then Shift+Tab repeatedly and describes the focused element each time. */
async function tabThrough(page: Page, dialog: Locator) {
  const handle = await dialog.elementHandle();
  const seen: { desc: string; inside: boolean; formControl: boolean }[] = [];
  for (const key of [...Array(TABS).fill('Tab'), ...Array(TABS).fill('Shift+Tab')] as string[]) {
    await page.keyboard.press(key);
    seen.push(
      await page.evaluate((root) => {
        const el = document.activeElement as HTMLElement | null;
        const tag = el?.tagName.toLowerCase() ?? 'none';
        const role = el?.getAttribute('role') ?? '';
        const desc = `${tag}${role ? `[role=${role}]` : ''}${el?.getAttribute('href') ? `[href=${el.getAttribute('href')}]` : ''}:${(el?.textContent ?? '').trim().slice(0, 30)}`;
        const formControl = !!el && (['input', 'select', 'textarea'].includes(tag) || el.isContentEditable || ['combobox', 'textbox', 'listbox', 'spinbutton', 'searchbox', 'checkbox', 'radio'].includes(role) || !!el.closest('form'));
        return { desc, inside: !!root && !!el && root.contains(el), formControl };
      }, handle),
    );
  }
  return seen;
}

function expectNoFormControl(seen: Awaited<ReturnType<typeof tabThrough>>, label: string) {
  expect(seen.filter((s) => s.formControl).map((s) => s.desc), `${label}: form control reached by keyboard`).toEqual([]);
}
function expectFocusInside(seen: Awaited<ReturnType<typeof tabThrough>>, label: string) {
  expect(seen.filter((s) => !s.inside).map((s) => s.desc), `${label}: focus left the window`).toEqual([]);
  // There is something to reach (the window is not a keyboard trap with nothing focusable).
  expect(new Set(seen.map((s) => s.desc)).size, `${label}: focusable elements`).toBeGreaterThan(0);
}

async function openHome(page: Page, lang: Lang) {
  await page.goto(home(lang));
  await page.locator('#plans').scrollIntoViewIfNeeded();
  await page.locator('.offers[data-ready]').waitFor();
}

/** « Order » from the plan simulator, opened with the keyboard (Enter on the focused button). */
async function openOrderByKeyboard(page: Page, tier: string, term: string, n: number) {
  const c = page.getByTestId('configurator');
  await c.locator(`button[data-tier="${tier}"]`).click();
  await c.locator(`button[data-term="${term}"]`).click();
  await c.locator(`button[data-stream="${n}"]`).click();
  await focusSettled(page);
  await c.locator('button.sim-cta').focus();
  await expect(c.locator('button.sim-cta')).toBeFocused();
  await page.keyboard.press('Enter');
  const dialog = page.getByTestId('checkout-dialog');
  await expect(dialog.getByTestId('prelaunch-notice')).toBeVisible();
  await expect(dialog.locator('form, input, select, textarea')).toHaveCount(0);
  return dialog;
}

/** « Free trial » from the header (in the menu where the header is collapsed), opened with the keyboard. */
/** Focus returns to the opener on the next animation frame after a window closes (RequestHost/CheckoutDialog):
 *  wait two frames so the next keyboard action is not overtaken by that return (a person cannot act within a frame). */
async function focusSettled(page: Page) {
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
}

async function openTrialByKeyboard(page: Page) {
  await focusSettled(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  const menu = page.locator('.mobile-menu');
  if (await menu.isVisible()) {
    await menu.focus();
    await page.keyboard.press('Enter');
    // Wait until the menu is open, as a keyboard user would, before moving to its « Free trial » button.
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
  }
  const trial = page.locator('.nav-ctas button').first();
  await expect(trial).toBeVisible();
  await trial.focus();
  await expect(trial).toBeFocused();
  await page.keyboard.press('Enter');
  const dialog = page.getByTestId('request-dialog');
  await expect(dialog.getByTestId('prelaunch-notice')).toBeVisible();
  await expect(dialog.locator('form, input, select, textarea')).toHaveCount(0);
  return dialog;
}

/** Support window, from the floating button (keyboard). */
async function openSupportByKeyboard(page: Page) {
  await focusSettled(page);
  const fab = page.locator('.support-fab');
  await fab.focus();
  await expect(fab).toBeFocused();
  await page.keyboard.press('Enter');
  const dialog = page.getByTestId('request-dialog');
  await expect(dialog.getByTestId('prelaunch-notice')).toBeVisible();
  await expect(dialog.locator('form, input, select, textarea')).toHaveCount(0);
  return dialog;
}

const SELECTIONS = [['plus', '12m', 1], ['ultra', '36m', 4]] as const;

for (const lang of LANGS) {
  test.describe(`${lang}: prelaunch, nothing is written`, () => {
    test.beforeEach(({ isMobile }) => test.skip(isMobile, 'desktop flows (the phone layouts are covered by prelaunch.spec.ts)'));

    test('order, free-trial and support windows: no write request to /api/contact, /api/checkout or Supabase', async ({ page }) => {
      test.setTimeout(90_000);
      const net = await recordRequests(page);
      await openHome(page, lang);
      for (const [tier, term, n] of SELECTIONS) {
        const checkout = await openOrderByKeyboard(page, tier, term, n);
        await tabThrough(page, checkout);
        await checkout.getByTestId('prelaunch-action').click();
        await expect(checkout).toBeHidden();
      }
      const trial = await openTrialByKeyboard(page);
      await tabThrough(page, trial);
      await page.keyboard.press('Escape');
      await expect(trial).toBeHidden();
      const support = await openSupportByKeyboard(page);
      await tabThrough(page, support);
      await support.getByTestId('prelaunch-action').click();
      await expect(support).toBeHidden();
      // Let any late request leave, then check every request the page made.
      await page.waitForLoadState('networkidle').catch(() => {});
      expect(net.all.length, 'requests were recorded').toBeGreaterThan(0);
      expect(net.forbidden(), `${lang}: write requests to /api/contact, /api/checkout or Supabase`).toEqual([]);
      const writes = net.all.filter((r) => r.method !== 'GET' && r.method !== 'HEAD');
      if (writes.length) test.info().annotations.push({ type: 'other non-GET requests', description: writes.map((r) => `${r.method} ${r.url}`).join('\n') });
    });

    test('order window by keyboard: focus moves into the window, stays there, and never reaches a form control', async ({ page }) => {
      await openHome(page, lang);
      for (const [tier, term, n] of SELECTIONS) {
        const checkout = await openOrderByKeyboard(page, tier, term, n);
        const seen = await tabThrough(page, checkout);
        expectNoFormControl(seen, `${lang} order ${tier}:${term}:${n}`);
        expectFocusInside(seen, `${lang} order ${tier}:${term}:${n}`);
        // « Back to the plans » with the keyboard; focus returns to « Order ».
        await checkout.getByTestId('prelaunch-action').focus();
        await page.keyboard.press('Enter');
        await expect(checkout).toBeHidden();
        await expect(page.getByTestId('configurator').locator('button.sim-cta')).toBeFocused();
      }
    });

    test('free-trial and support windows by keyboard: no form control can be reached', async ({ page }) => {
      await openHome(page, lang);
      const trial = await openTrialByKeyboard(page);
      expectNoFormControl(await tabThrough(page, trial), `${lang} free trial`);
      await page.keyboard.press('Escape');
      await expect(trial).toBeHidden();
      const support = await openSupportByKeyboard(page);
      expectNoFormControl(await tabThrough(page, support), `${lang} support`);
      await page.keyboard.press('Escape');
      await expect(support).toBeHidden();
    });

    // Was a test.fixme at 0df474f (U-001: RequestDialog focused only `input.input`); fixed in phase 12.
    test('free-trial and support windows by keyboard: focus moves into the window and stays there', async ({ page }) => {
      await openHome(page, lang);
      const trial = await openTrialByKeyboard(page);
      expectFocusInside(await tabThrough(page, trial), `${lang} free trial`);
      await page.keyboard.press('Escape');
      await expect(trial).toBeHidden();
      const support = await openSupportByKeyboard(page);
      expectFocusInside(await tabThrough(page, support), `${lang} support`);
    });
  });
}
