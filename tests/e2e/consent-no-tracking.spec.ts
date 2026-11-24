import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import en from '../../src/i18n/dictionaries/en';

/**
 * F14 (cookie and analytics reconciliation): optional tracking never starts without the matching consent.
 *
 * Unlike the other consent specs (which stub only the Google / Microsoft hosts), EVERY request that leaves the
 * site's own host is ABORTED and recorded here — Google (GTM, GA4, Ads, DoubleClick), Microsoft (Clarity, Bing),
 * Meta, TikTok, Cloudflare Web Analytics and any other third party. Nothing reaches an analytics or advertising
 * system: the recorded URLs are only what the page WOULD have requested.
 */
const TRACKERS = /googletagmanager\.com|google-analytics\.com|doubleclick\.net|googleadservices\.com|googlesyndication\.com|google\.com\/(ccm|rmkt|pagead)|clarity\.ms|bing\.com|facebook\.(net|com)|tiktok\.com|cloudflareinsights\.com/;
const ADS = /gtm\.js|doubleclick\.net|googleadservices\.com|googlesyndication\.com|google\.com\/(ccm|rmkt|pagead)|facebook\.(net|com)|tiktok\.com|bing\.com\/action|bat\.bing\.com/;
const ANALYTICS = /gtag\/js|google-analytics\.com|clarity\.ms/;
const c = en.consent;

/** Aborts and records every request that does not go to the site under test. */
async function abortThirdParties(context: BrowserContext, siteHost: string) {
  const hits: string[] = [];
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (new URL(url).host === siteHost) return route.continue();
    hits.push(url);
    return route.abort('blockedbyclient');
  });
  return hits;
}

async function setup(page: Page, baseURL: string | undefined, qaFlag = true) {
  const hits = await abortThirdParties(page.context(), new URL(baseURL ?? 'http://127.0.0.1').host);
  // QA flag: lets the consent banner and analytics run on the local host (as on sygmatv.com).
  if (qaFlag) await page.addInitScript(() => localStorage.setItem('sygma_analytics_force', '1'));
  return hits;
}

/** Long enough for the deferred start (requestIdleCallback, 3 s timeout) to have run. */
const settle = (page: Page) => page.waitForTimeout(3500);

const state = (page: Page) =>
  page.evaluate(() => ({
    local: Object.keys(localStorage).sort(),
    session: Object.keys(sessionStorage).sort(),
    thirdPartyScripts: [...document.scripts].map((s) => s.src).filter((s) => s && !s.startsWith(location.origin)),
    firstDataLayer: Array.from(((window.dataLayer ?? [])[0] ?? []) as ArrayLike<unknown>),
  }));

const DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 };

test.describe('no tracking request without consent (all third-party requests aborted)', () => {
  test('before any choice: no third-party request, no cookie, no storage; Consent Mode default is « denied »', async ({ page, baseURL }) => {
    const hits = await setup(page, baseURL);
    for (const path of ['/', '/legal/cookies']) {
      await page.goto(path);
      await expect(page.getByTestId('consent-banner')).toBeVisible();
      await settle(page);
      const s = await state(page);
      expect(s.firstDataLayer).toEqual(['consent', 'default', DENIED]);
      expect(s.thirdPartyScripts).toEqual([]);
      expect(s.local).toEqual(['sygma_analytics_force']);
      expect(s.session).toEqual([]);
    }
    expect(hits).toEqual([]);
    expect(await page.context().cookies()).toEqual([]);
  });

  test('without the QA flag (any host other than sygmatv.com): no banner and no third-party request', async ({ page, baseURL }) => {
    const hits = await setup(page, baseURL, false);
    await page.goto('/');
    await settle(page);
    await expect(page.getByTestId('consent-banner')).toHaveCount(0);
    expect(hits).toEqual([]);
  });

  test('« Decline all »: nothing loads, now or after a reload and a navigation; only the choice is stored', async ({ page, baseURL }) => {
    const hits = await setup(page, baseURL);
    await page.goto('/');
    await page.getByTestId('consent-banner').getByRole('button', { name: c.declineAll }).click();
    await settle(page);
    await page.reload();
    await settle(page);
    await page.goto('/legal/cookies');
    await settle(page);
    await expect(page.getByTestId('consent-banner')).toHaveCount(0);
    expect(hits).toEqual([]);
    expect(await page.context().cookies()).toEqual([]);
    const s = await state(page);
    expect(s.local).toEqual(['sygma_analytics_force', 'sygma_consent']);
    expect(s.session).toEqual([]);
    expect(s.thirdPartyScripts).toEqual([]);
  });

  test('Analytics only: GA4 and Clarity are requested, never GTM or any advertising host', async ({ page, baseURL }) => {
    const hits = await setup(page, baseURL);
    await page.goto('/');
    const banner = page.getByTestId('consent-banner');
    await banner.getByRole('button', { name: c.customize }).click();
    await banner.getByRole('checkbox', { name: new RegExp(c.analyticsTitle) }).check();
    await banner.getByRole('button', { name: c.save }).click();
    await expect.poll(() => hits.some((h) => h.includes('gtag/js?id='))).toBe(true);
    await page.reload();
    await settle(page);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => TRACKERS.test(h))).toBe(true);
    expect(hits.filter((h) => ADS.test(h))).toEqual([]);
    expect(hits.every((h) => ANALYTICS.test(h))).toBe(true);
    // The extra « no ads » CSP is active without Marketing consent.
    expect(await page.evaluate(() => document.getElementById('sygma-no-ads-csp') !== null)).toBe(true);
  });

  test('Marketing only: only the GTM container is requested, never GA4 or Clarity', async ({ page, baseURL }) => {
    const hits = await setup(page, baseURL);
    await page.goto('/');
    const banner = page.getByTestId('consent-banner');
    await banner.getByRole('button', { name: c.customize }).click();
    await banner.getByRole('checkbox', { name: new RegExp(c.marketingTitle) }).check();
    await banner.getByRole('button', { name: c.save }).click();
    await expect.poll(() => hits.some((h) => h.includes('gtm.js?id='))).toBe(true);
    await settle(page);
    expect(hits.filter((h) => ANALYTICS.test(h))).toEqual([]);
    expect(hits.every((h) => h.includes('googletagmanager.com/gtm.js?id='))).toBe(true);
  });

  test('withdrawal after « Accept all »: after the reload, no third-party request at all', async ({ page, baseURL }) => {
    const hits = await setup(page, baseURL);
    await page.goto('/');
    await page.getByTestId('consent-banner').getByRole('button', { name: c.acceptAll }).click();
    await expect.poll(() => hits.some((h) => h.includes('gtm.js?id='))).toBe(true);
    await page.locator('footer').getByRole('button', { name: c.settings }).click();
    await Promise.all([
      page.waitForEvent('load'),
      page.getByTestId('consent-banner').getByRole('button', { name: c.declineAll }).click(),
    ]);
    const before = hits.length;
    await settle(page);
    await page.goto('/legal/cookies');
    await settle(page);
    expect(hits.slice(before)).toEqual([]);
    expect((await state(page)).thirdPartyScripts).toEqual([]);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sygma_consent') ?? '{}'))).toMatchObject({ analytics: 'denied', marketing: 'denied' });
  });
});
