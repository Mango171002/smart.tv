import { expect, test, type Page } from '@playwright/test';
import { RELEASED_LANGS, ORDERS_OPEN } from './released';

/**
 * Phase 11 — order window and trial window on phones (mobile ad campaign): the window, its step bar and the order
 * summary never get wider than the window or the screen, in every built language. Widths are set explicitly (desktop
 * project), like responsive.spec.ts.
 */
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const LANGS = ['en', ...['fr', 'de', 'es', 'it', 'nl', 'sv', 'nb'].filter((l) => PREVIEW || RELEASED_LANGS.includes(l))];
const WIDTHS = [320, 375, 412];

type Box = { left: number; right: number };
type Audit = { vw: number; docSW: number; dsw: number; dcw: number; inner: Box; stepSW: number; stepCW: number; outside: string[] };

/** Measures the open dialog: horizontal scrolling, and every visible element against the dialog's content box. */
async function audit(page: Page, testId: string): Promise<Audit> {
  return page.getByTestId(testId).evaluate((dlg) => {
    const d = dlg.getBoundingClientRect();
    const cs = getComputedStyle(dlg);
    const left = d.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft);
    const right = d.left + parseFloat(cs.borderLeftWidth) + dlg.clientWidth - parseFloat(cs.paddingRight);
    const outside = [...dlg.querySelectorAll<HTMLElement>('*')]
      .filter((el) => !el.closest('.hp') && el.getClientRects().length > 0)
      .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > right + 1 || r.left < left - 1); })
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).trim().replace(/\s+/g, '.')} ${Math.round(el.getBoundingClientRect().left)}..${Math.round(el.getBoundingClientRect().right)}`);
    const step = dlg.querySelector('.stepper');
    return {
      vw: window.innerWidth, docSW: document.documentElement.scrollWidth, dsw: dlg.scrollWidth, dcw: dlg.clientWidth,
      inner: { left, right }, stepSW: step?.scrollWidth ?? 0, stepCW: step?.clientWidth ?? 0, outside,
    };
  });
}

function expectInside(a: Audit, where: string) {
  expect(a.docSW, `${where}: page scrollWidth`).toBeLessThanOrEqual(a.vw);
  expect(a.dsw, `${where}: window scrolls sideways`).toBeLessThanOrEqual(a.dcw);
  expect(a.stepSW, `${where}: step bar wider than its box`).toBeLessThanOrEqual(a.stepCW + 1);
  expect(a.outside, `${where}: elements outside the window`).toEqual([]);
}

test.describe('order window on phones', () => {
  test.skip(!ORDERS_OPEN, 'online requests closed in this build (prelaunch): covered by prelaunch.spec.ts');
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'widths are set explicitly (desktop project)'));
  for (const lang of LANGS) {
    const home = lang === 'en' ? '/' : `/${lang}`;
    test(`${home}: order window, step bar and summary fit at ${WIDTHS.join('/')} px; review step and trial window at 320 px`, async ({ page }) => {
      await page.route('**/api/contact', (route) => route.fulfill({ status: 201, json: { ok: true } }));
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(home);
        await page.locator('#plans').scrollIntoViewIfNeeded();
        await page.locator('.offers[data-ready]').waitFor();
        await page.locator('[data-testid="configurator"] button.btn').last().click();
        const dialog = page.getByTestId('checkout-dialog');
        await expect(dialog.getByTestId('order-summary')).toBeVisible();
        expectInside(await audit(page, 'checkout-dialog'), `${home} @${width}px step 1`);
        // Price of the summary fully visible inside the summary box.
        const [sum, price] = await Promise.all([dialog.getByTestId('order-summary').boundingBox(), dialog.getByTestId('summary-price').boundingBox()]);
        expect(price!.x + price!.width, `${home} @${width}px summary price`).toBeLessThanOrEqual(sum!.x + sum!.width + 1);
        if (width !== 320) continue;

        // Review step (longest step name is the current one) — the quote comes from the server, nothing is sent.
        await dialog.locator('#prereg-email').fill('qa-mobile@example.test');
        await dialog.locator('#prereg-region').click();
        await dialog.getByRole('option').first().click();
        await dialog.locator('#prereg-phone').fill('79 123 45 67');
        await dialog.locator('#prereg-consent').check();
        await dialog.locator('button[type=submit]').click();
        await expect(dialog.getByTestId('review-price')).toBeVisible();
        expectInside(await audit(page, 'checkout-dialog'), `${home} @${width}px review step`);

        // Trial window (from the mobile menu), with the country chosen above pre-selected in the phone picker.
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.locator('.mobile-menu').click();
        await page.locator('.nav-ctas button').click();
        await expect(page.getByTestId('request-dialog')).toBeVisible();
        expectInside(await audit(page, 'request-dialog'), `${home} @${width}px trial window`);
      }
    });
  }
});
