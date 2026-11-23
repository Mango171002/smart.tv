import { expect, test, type Page } from '@playwright/test';

/**
 * Phase 13 (D9): withdrawing a consent also removes the browser storage written by the withdrawn tags
 * (measured on a production-like build: Clarity `_cltk` in sessionStorage, Google Ads `_gcl_ls` in localStorage).
 * Third-party scripts are replaced by empty stubs: nothing is sent to Google or Microsoft.
 */
async function prepareGranted(page: Page) {
  await page.route(/googletagmanager\.com|google-analytics\.com|clarity\.ms|c\.bing\.com|doubleclick\.net|google\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  );
  await page.addInitScript(() => {
    localStorage.setItem('sygma_analytics_force', '1');
    // Only once per tab: the reload after the withdrawal must keep the visitor's new choice.
    if (!sessionStorage.getItem('sygma_prepared')) {
      localStorage.setItem('sygma_consent', JSON.stringify({ v: 2, analytics: 'granted', marketing: 'granted', ts: new Date().toISOString() }));
      sessionStorage.setItem('sygma_prepared', '1');
    }
  });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => document.querySelector('script[data-sygma="gtm"]') !== null)).toBe(true);
  // What the real tags write after « Accept all ».
  await page.evaluate(() => {
    localStorage.setItem('_gcl_ls', '{"schema":"gcl"}');
    sessionStorage.setItem('_cltk', 'x');
  });
}

const storage = (page: Page) =>
  page.evaluate(() => ({ local: Object.keys(localStorage).sort(), session: Object.keys(sessionStorage).sort() }));

test.describe('consent withdrawal removes the tags’ browser storage', () => {
  test('Decline all (both withdrawn): _gcl_ls and _cltk removed, the choice is kept', async ({ page }) => {
    await prepareGranted(page);
    await page.locator('footer').getByRole('button', { name: 'Cookie settings' }).click();
    await page.getByTestId('consent-banner').getByRole('button', { name: 'Decline all' }).click();
    await expect.poll(() => page.evaluate(() => document.querySelector('script[data-sygma="gtm"]') === null).catch(() => false), { timeout: 10_000 }).toBe(true);
    const s = await storage(page);
    expect(s.local).not.toContain('_gcl_ls');
    expect(s.session).not.toContain('_cltk');
    expect(s.local).toContain('sygma_consent');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sygma_consent') ?? '{}'))).toMatchObject({ analytics: 'denied', marketing: 'denied' });
  });

  test('Marketing only withdrawn: _gcl_ls removed, Clarity storage kept', async ({ page }) => {
    await prepareGranted(page);
    await page.locator('footer').getByRole('button', { name: 'Cookie settings' }).click();
    const banner = page.getByTestId('consent-banner');
    await banner.getByRole('checkbox', { name: /Marketing/ }).uncheck();
    await banner.getByRole('button', { name: 'Save my choices' }).click();
    await expect.poll(() => page.evaluate(() => document.querySelector('script[data-sygma="gtm"]') === null).catch(() => false), { timeout: 10_000 }).toBe(true);
    const s = await storage(page);
    expect(s.local).not.toContain('_gcl_ls');
    expect(s.session).toContain('_cltk');
  });
});
