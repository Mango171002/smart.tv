import { expect, test, type Page } from '@playwright/test';
import en from '../../src/i18n/dictionaries/en';
import fr from '../../src/i18n/dictionaries/fr';
import de from '../../src/i18n/dictionaries/de';
import es from '../../src/i18n/dictionaries/es';
import it from '../../src/i18n/dictionaries/it';
import nl from '../../src/i18n/dictionaries/nl';
import sv from '../../src/i18n/dictionaries/sv';
import nb from '../../src/i18n/dictionaries/nb';
import { RELEASED_LANGS } from './released';

/**
 * Phase 11 — order summary on the first step of the order window: the current selection (plan, duration, devices,
 * price) from the plan simulator, kept in sync with it, in every built language. No order is sent by these tests.
 */
const DICTS = { en, fr, de, es, it, nl, sv, nb } as const;
type Lang = keyof typeof DICTS;
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const LANGS = (Object.keys(DICTS) as Lang[]).filter((l) => l === 'en' || PREVIEW || RELEASED_LANGS.includes(l));
const home = (l: Lang) => (l === 'en' ? '/' : `/${l}`);
const norm = (s: string) => s.replace(/[  ]/g, ' ').trim();
const COMBOS = [['starter', '12m', 1], ['plus', '24m', 2], ['ultra', '36m', 4]] as const;

async function select(page: Page, tier: string, term: string, n: number) {
  const c = page.getByTestId('configurator');
  await c.locator(`button[data-tier="${tier}"]`).click();
  await c.locator(`button[data-term="${term}"]`).click();
  await c.locator(`button[data-stream="${n}"]`).click();
}
async function openPlans(page: Page, path: string) {
  await page.goto(path);
  await page.locator('#plans').scrollIntoViewIfNeeded();
  await page.locator('.offers[data-ready]').waitFor();
}
const orderButton = (page: Page) => page.getByTestId('configurator').locator('button.btn').last();

for (const lang of LANGS) {
  const d = DICTS[lang];
  test.describe(`${lang}: order summary`, () => {
    test('shows plan, duration, devices and the simulator price for every tier; « Change » keeps the selection in sync', async ({ page }) => {
      await openPlans(page, home(lang));
      for (const [tier, term, n] of COMBOS) {
        await select(page, tier, term, n);
        const simPrice = norm(await page.getByTestId('price').innerText());
        await orderButton(page).click();
        const s = page.getByTestId('order-summary');
        await expect(s).toBeVisible();
        await expect(s.getByRole('heading', { name: d.checkout.summary.title })).toBeVisible();
        await expect(page.getByTestId('summary-plan')).toHaveText(d.plans.tiers[tier].name);
        await expect(page.getByTestId('summary-duration')).toHaveText(d.plans.terms[term]);
        await expect(page.getByTestId('summary-devices')).toHaveText(n === 1 ? d.common.device : d.common.devices.replace('{n}', String(n)));
        // Same price as the simulator (English adds the currency code: « $69 USD »).
        const summaryPrice = norm(await page.getByTestId('summary-price').innerText());
        expect(summaryPrice.startsWith(simPrice), `${summaryPrice} vs ${simPrice}`).toBe(true);
        expect(summaryPrice).toMatch(/USD|\$ US/);
        // « Change »: closes the window, focus back on the order button; a new selection is reflected on reopening.
        await page.getByRole('button', { name: d.checkout.summary.changeLabel }).click();
        await expect(page.getByTestId('checkout-dialog')).toBeHidden();
        await expect(orderButton(page)).toBeFocused();
      }
    });

    test('keyboard: the « Change » button is reachable with Tab, Escape closes the window', async ({ page }) => {
      await openPlans(page, home(lang));
      await orderButton(page).click();
      const change = page.getByRole('button', { name: d.checkout.summary.changeLabel });
      for (let i = 0; i < 6 && !(await change.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
      await expect(change).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('checkout-dialog')).toBeHidden();
    });
  });
}

test.describe('order summary — review step and mobile', () => {
  test('the review step shows the same price as the summary (verified by the server quote)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop');
    await page.route('**/api/contact', (r) => r.fulfill({ status: 201, json: { ok: true } }));
    await openPlans(page, '/');
    await select(page, 'plus', '24m', 2);
    await orderButton(page).click();
    const dialog = page.getByTestId('checkout-dialog');
    const summaryPrice = norm(await page.getByTestId('summary-price').innerText());
    await dialog.getByLabel(en.checkout.emailLabel).fill('summary-check@example.test');
    await dialog.getByLabel(en.checkout.regionLabel).click();
    await dialog.getByRole('combobox', { name: en.common.countrySearch }).fill('Sweden');
    await page.keyboard.press('Enter');
    await dialog.getByLabel(en.checkout.phoneLabel).fill('70 123 45 67');
    await dialog.getByLabel(en.checkout.consentLabel.slice(0, 20), { exact: false }).check();
    await dialog.getByRole('button', { name: new RegExp(en.checkout.review) }).click();
    await expect(dialog.getByTestId('quote-status')).toHaveText(new RegExp(en.checkout.verified));
    expect(norm(await dialog.getByTestId('review-price').innerText())).toBe(summaryPrice);
    // The summary belongs to the first step only.
    await expect(page.getByTestId('order-summary')).toHaveCount(0);
  });

  test('phones: the summary fits the window in every built language (320 px)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'explicit viewport sizes');
    for (const lang of LANGS) {
      for (const width of [320, 375]) {
        await page.setViewportSize({ width, height: 800 });
        await openPlans(page, home(lang));
        await select(page, 'ultra', '36m', 4);
        await orderButton(page).click();
        await page.getByTestId('order-summary').waitFor();
        const r = await page.evaluate(() => {
          const s = document.querySelector('[data-testid="order-summary"]')!;
          const box = s.getBoundingClientRect();
          const inner = [...s.querySelectorAll('dd, h3, button')].map((e) => e.getBoundingClientRect());
          return { sw: s.scrollWidth, cw: s.clientWidth, right: box.right, vw: innerWidth, out: inner.filter((b) => b.right > box.right + 1 || b.left < box.left - 1).length };
        });
        expect(r.sw, `${lang} @${width}px summary scroll`).toBeLessThanOrEqual(r.cw);
        expect(r.out, `${lang} @${width}px content outside the summary`).toBe(0);
        expect(r.right, `${lang} @${width}px summary outside the viewport`).toBeLessThanOrEqual(r.vw);
        const change = await page.getByRole('button', { name: DICTS[lang].checkout.summary.changeLabel }).boundingBox();
        expect(change!.height, `${lang} touch target`).toBeGreaterThanOrEqual(44);
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('checkout-dialog')).toBeHidden();
      }
    }
  });
});
