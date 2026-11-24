import { expect, test, type Page } from '@playwright/test';
import en from '../../src/i18n/dictionaries/en';
import fr from '../../src/i18n/dictionaries/fr';
import de from '../../src/i18n/dictionaries/de';
import es from '../../src/i18n/dictionaries/es';
import it from '../../src/i18n/dictionaries/it';
import nl from '../../src/i18n/dictionaries/nl';
import sv from '../../src/i18n/dictionaries/sv';
import nb from '../../src/i18n/dictionaries/nb';
import { ORDERS_OPEN, RELEASED_LANGS, CONTENT_ON } from './released';

/**
 * Phase 13 — unsupported claims (D6, D8), rendered: highlight tiles without « International », devices bar without
 * platform brands, « 24/7 » naming the automated assistant; while online requests are closed, no WhatsApp / phone in
 * the home support lines, the footer or the About / Help center contact box (the legal notice keeps them); open: back.
 */
const DICTS = { en, fr, de, es, it, nl, sv, nb } as const;
type Lang = keyof typeof DICTS;
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
/** The content pages (About us, Help center) exist in the build under test: E2E_CONTENT_PAGES=preview or live. */
const CONTENT = CONTENT_ON;
const LANGS = (Object.keys(DICTS) as Lang[]).filter((l) => l === 'en' || PREVIEW || RELEASED_LANGS.includes(l));
const home = (l: Lang) => (l === 'en' ? '/' : `/${l}`);
const PHONE = /\+44\s?7412\s?857594/;
const BRANDS = /Android|Fire TV|Apple|\bMac\b|\biOS\b/;

async function openPlans(page: Page, path: string) {
  await page.goto(path);
  await page.locator('#plans').scrollIntoViewIfNeeded();
  await page.locator('.offers[data-ready]').waitFor();
}

test.describe('claims (D6, D8)', () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'markup check (desktop only; layouts are covered by the responsive suites)'));

  for (const lang of LANGS) {
    const d = DICTS[lang];
    test(`${lang}: tiles, devices bar, support lines and footer`, async ({ page }) => {
      await openPlans(page, home(lang));
      const main = page.locator('main');
      // D6: no « International » label, no platform brand in the devices bar (six device categories).
      await expect(page.locator('.slide-region').first()).toHaveText(d.featured.items[0]!.region);
      expect(await page.locator('.slide-region').allInnerTexts()).not.toContain(expect.stringMatching(/internation/i));
      const bar = page.locator('.platforms-bar li');
      await expect(bar).toHaveCount(6);
      await expect(page.locator('.platforms-bar')).not.toContainText(BRANDS);
      // D8: « 24/7 » names the assistant.
      await expect(page.locator('.features-bar li').nth(4)).toContainText(d.benefits[4]!.title);
      const lines247 = (await main.innerText()).split('\n').filter((l) => /24\/7/.test(l));
      expect(lines247.length).toBeGreaterThan(0);
      for (const l of lines247) expect(l, l).toMatch(/assist|asist/i);
      // D8: WhatsApp is not offered as a contact channel while closed; today's texts when open.
      const support = page.locator('.features-bar li').nth(4);
      const trust = page.locator('.trust-bar li').first();
      const compare = page.locator('.compare-table tbody tr').last();
      if (ORDERS_OPEN) {
        for (const l of [support, trust, compare]) await expect(l).toContainText('WhatsApp');
      } else {
        for (const l of [support, trust, compare]) await expect(l).not.toContainText('WhatsApp');
        await expect(support).toContainText(d.prelaunch.home.supportBenefitText);
      }
      // Footer: no phone number and no tel: link in any state (the contact button opens the support window).
      await expect(page.locator('footer')).not.toContainText(PHONE);
      await expect(page.locator('footer a[href^="tel:"]')).toHaveCount(0);
      // S13-004: the publisher, in visible text on every page.
      await expect(page.locator('footer .footer-entity')).toHaveText(d.footer.entity.replace('{entity}', 'Sygma TV LLC'));
    });
  }

  for (const lang of LANGS) {
    test(`${lang}: About / Help center contact box — e-mail only while closed, phone back when open`, async ({ page }) => {
      test.skip(!CONTENT, 'needs a build with NEXT_PUBLIC_CONTENT_PAGES=preview or live');
      const base = lang === 'en' ? '' : `/${lang}`;
      for (const path of ['/about', '/help', '/help/contact-support', '/help/troubleshooting']) {
        await page.goto(`${base}${path}`);
        const box = page.locator('#contact');
        await expect(box.locator('a[href="mailto:support@sygmatv.com"]'), `${lang}${path}`).toBeVisible();
        await expect(box.locator('a[href^="tel:"]'), `${lang}${path}`).toHaveCount(ORDERS_OPEN ? 1 : 0);
        if (!ORDERS_OPEN) await expect(box, `${lang}${path}`).not.toContainText(/WhatsApp|\+44/);
      }
      // Seller identity: the About company facts keep the phone / WhatsApp number in both states.
      await page.goto(`${base}/about`);
      await expect(page.locator('#company')).toContainText(PHONE);
    });
  }

  test('the footer entity line is on the legal and Help pages too', async ({ page }) => {
    for (const path of ['/legal/terms', ...(CONTENT ? ['/help', '/about'] : [])]) {
      await page.goto(path);
      await expect(page.locator('footer .footer-entity'), path).toHaveText(en.footer.entity.replace('{entity}', 'Sygma TV LLC'));
    }
  });

  test('the legal notice keeps every contact detail (phone, WhatsApp) in both states', async ({ page }) => {
    await page.goto('/legal/imprint');
    await expect(page.locator('main')).toContainText(PHONE);
    await expect(page.locator('main')).toContainText('WhatsApp');
    await expect(page.locator('main a[href^="tel:"]').first()).toBeVisible();
  });
});
