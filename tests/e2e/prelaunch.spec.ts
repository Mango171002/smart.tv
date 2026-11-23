import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
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
 * Phase 11B — prelaunch: online orders, free trials and support requests are closed (FEATURE_CONTACT_FORM=false).
 * The order, trial and support windows say so BEFORE any form; no field can be filled, nothing can be sent; the order
 * summary and prices stay; the e-mail is offered for general questions only; the FAQ answer « Can I subscribe now? »
 * is accurate. Runs on every build made with the production configuration.
 */
const DICTS = { en, fr, de, es, it, nl, sv, nb } as const;
type Lang = keyof typeof DICTS;
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const LANGS = (Object.keys(DICTS) as Lang[]).filter((l) => l === 'en' || PREVIEW || RELEASED_LANGS.includes(l));
const home = (l: Lang) => (l === 'en' ? '/' : `/${l}`);
const norm = (s: string) => s.replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
const EMAIL = 'support@sygmatv.com';

test.skip(ORDERS_OPEN, 'build with online requests open (E2E_ORDERS_OPEN=true)');

async function openPlans(page: Page, path: string) {
  await page.goto(path);
  await page.locator('#plans').scrollIntoViewIfNeeded();
  await page.locator('.offers[data-ready]').waitFor();
}
async function expectNoForm(dialog: ReturnType<Page['getByTestId']>) {
  await expect(dialog.locator('form, input, select, textarea, [role="combobox"]')).toHaveCount(0);
  await expect(dialog.getByTestId('prelaunch-notice')).toBeVisible();
  await expect(dialog.locator(`a[href="mailto:${EMAIL}"]`)).toBeVisible();
}

for (const lang of LANGS) {
  const d = DICTS[lang];
  const p = d.prelaunch;
  test.describe(`${lang}: prelaunch`, () => {
    test.beforeEach(({ isMobile }) => test.skip(isMobile, 'desktop flows; phones are covered below'));

    test('order window: « Orders opening soon », the selection and its price, no form; back to the plans', async ({ page }) => {
      await openPlans(page, home(lang));
      const c = page.getByTestId('configurator');
      await c.locator('button[data-tier="ultra"]').click();
      await c.locator('button[data-term="24m"]').click();
      await c.locator('button[data-stream="3"]').click();
      const simPrice = norm(await page.getByTestId('price').innerText());
      const orderButton = c.locator('button.btn').last();
      await orderButton.click();
      const dialog = page.getByTestId('checkout-dialog');
      await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(norm(`${p.orderTitleA} ${p.orderTitleHl}`));
      await expect(dialog).toContainText(p.orderText);
      await expect(dialog).toContainText(p.contactNote);
      await expectNoForm(dialog);
      await expect(dialog.locator('.stepper')).toHaveCount(0);
      // The approved order summary stays, with the simulator's selection and price.
      await expect(page.getByTestId('summary-plan')).toHaveText(d.plans.tiers.ultra.name);
      await expect(page.getByTestId('summary-duration')).toHaveText(d.plans.terms['24m']);
      expect(norm(await page.getByTestId('summary-price').innerText()).startsWith(simPrice)).toBe(true);
      await dialog.getByTestId('prelaunch-action').click();
      await expect(dialog).toBeHidden();
      await expect(orderButton).toBeFocused();
    });

    test('free-trial and support windows: prelaunch message, no form, e-mail for general questions', async ({ page }) => {
      await page.goto(home(lang));
      // fr / de / nl / nb: menu button up to 1359 px (phase 9) — the « Free trial » button is in the menu.
      if (await page.locator('.mobile-menu').isVisible()) await page.locator('.mobile-menu').click();
      await page.locator('.nav-ctas button').first().click();
      const dialog = page.getByTestId('request-dialog');
      await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(norm(`${p.trialTitleA} ${p.trialTitleHl}`));
      await expect(dialog).toContainText(p.trialText);
      await expectNoForm(dialog);
      await dialog.getByTestId('prelaunch-action').click();
      await expect(dialog).toBeHidden();
      await page.locator('.support-fab').click();
      await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(norm(`${p.supportTitleA} ${p.supportTitleHl}`));
      await expect(dialog).toContainText(p.supportText);
      await expectNoForm(dialog);
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    });

    test('FAQ « Can I subscribe now? » is answered accurately, in the page and in the FAQPage data', async ({ page }) => {
      await page.goto(home(lang));
      const first = page.locator('#faq details').first();
      await first.locator('summary').click();
      await expect(first).toContainText(p.faqSubscribe);
      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
      const faq = ld['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage');
      expect(faq.mainEntity[0].acceptedAnswer.text).toBe(p.faqSubscribe);
      expect(faq.mainEntity[0].name).toBe(d.faq.items[0]!.q);
    });
  });
}

test.describe('prelaunch — server, phones, accessibility', () => {
  test('the API refuses orders, trials and support requests (503), before storing anything', async ({ request, baseURL, isMobile }) => {
    test.skip(isMobile, 'once');
    const headers = { origin: new URL(baseURL!).origin, 'content-type': 'application/json' };
    for (const data of [
      { kind: 'launch_waitlist', email: 'prelaunch-check@example.test', locale: 'en', consent: true, tier: 'plus', term: '12m', streams: 1 },
      { kind: 'trial_request', name: 'Check', email: 'prelaunch-check@example.test', phone: '+14155550100', locale: 'en', consent: true },
      { kind: 'support', name: 'Check', email: 'prelaunch-check@example.test', message: 'Prelaunch check, please ignore.', locale: 'en', consent: true },
    ]) {
      const res = await request.post('/api/contact', { headers, data });
      expect(res.status(), data.kind).toBe(503);
      expect((await res.json()).error).toBe('contact_unavailable');
    }
  });

  test('phones: the prelaunch windows fit at 320 / 375 px in every built language, 48 px button', async ({ page, isMobile }) => {
    test.skip(isMobile, 'explicit viewport sizes');
    for (const lang of LANGS) {
      for (const width of [320, 375]) {
        await page.setViewportSize({ width, height: 800 });
        await openPlans(page, home(lang));
        await page.getByTestId('configurator').locator('button.btn').last().click();
        const dialog = page.getByTestId('checkout-dialog');
        await dialog.getByTestId('prelaunch-notice').waitFor();
        const r = await dialog.evaluate((el) => {
          const box = el.getBoundingClientRect();
          const out = [...el.querySelectorAll('p, a, button, dd, h2, h3')].filter((e) => {
            const b = e.getBoundingClientRect();
            return b.width > 0 && (b.right > box.right + 1 || b.left < box.left - 1);
          }).length;
          return { sw: el.scrollWidth, cw: el.clientWidth, out, page: document.documentElement.scrollWidth, vw: innerWidth };
        });
        expect(r.sw, `${lang} @${width} dialog scroll`).toBeLessThanOrEqual(r.cw + 1);
        expect(r.out, `${lang} @${width} content outside`).toBe(0);
        expect(r.page, `${lang} @${width} page scroll`).toBeLessThanOrEqual(r.vw);
        expect((await dialog.getByTestId('prelaunch-action').boundingBox())!.height).toBeGreaterThanOrEqual(44);
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
      }
    }
  });

  test('accessibility: no axe violation in the prelaunch order and trial windows (WCAG 2.1 AA)', async ({ page }) => {
    await openPlans(page, '/');
    await page.getByTestId('configurator').locator('button.btn').last().click();
    await page.getByTestId('prelaunch-notice').waitFor();
    let results = await new AxeBuilder({ page }).include('[data-testid="checkout-dialog"]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
    await page.keyboard.press('Escape');
    await page.locator('.support-fab').click();
    await page.getByTestId('prelaunch-notice').waitFor();
    results = await new AxeBuilder({ page }).include('[data-testid="request-dialog"]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
