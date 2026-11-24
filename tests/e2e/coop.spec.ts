import { expect, test } from '@playwright/test';

/**
 * D13-012: Cross-Origin-Opener-Policy « same-origin-allow-popups » on every page (next.config.ts headers).
 * The consent banner, GTM / analytics consent flows and dialogs are covered by the other specs, which run with the
 * header in place; this spec checks the header and the two opener cases.
 */
test.describe('Cross-Origin-Opener-Policy', () => {
  test('pages are served with COOP same-origin-allow-popups', async ({ request }) => {
    for (const path of ['/', '/legal/terms', '/legal/privacy']) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect(res.headers()['cross-origin-opener-policy'], path).toBe('same-origin-allow-popups');
    }
  });

  test('a window the site opens keeps its opener (same-origin popup)', async ({ page }) => {
    await page.goto('/legal/terms');
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.evaluate(() => void window.open('/legal/privacy', '_blank'))]);
    await popup.waitForLoadState('domcontentloaded');
    expect(await popup.evaluate(() => window.opener !== null)).toBe(true);
    await popup.close();
  });

  test('a page opened by another site loses window.opener (documents the Tag Assistant preview impact)', async ({ context, page, baseURL }) => {
    test.skip(!baseURL || !/^http:\/\/127\.0\.0\.1:/.test(baseURL), 'local server only');
    await context.route('https://opener.test/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>opener</title>' }));
    await page.goto('https://opener.test/');
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.evaluate((u) => void window.open(u, '_blank'), `${baseURL}/legal/terms`)]);
    await popup.waitForLoadState('domcontentloaded');
    expect(await popup.evaluate(() => window.opener === null)).toBe(true);
    await popup.close();
  });
});
