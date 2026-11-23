import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import en from '../../src/i18n/dictionaries/en';
import { ORDERS_OPEN } from './released';

/**
 * Prelaunch hotfix (English only, on top of 864f703): online orders, free trials and support requests are closed
 * (FEATURE_CONTACT_FORM=false). The order, trial and support windows say so INSTEAD of any form; no field can be
 * filled, nothing can be sent; the selection and its price stay in the order window; the e-mail is offered for general
 * questions only; the FAQ answers and the home copy no longer present ordering or a trial as available now.
 */
const p = en.prelaunch;
const norm = (s: string) => s.replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
const EMAIL = 'support@sygmatv.com';
const CLOSED_ONLY = 'build with online requests open (ORDERS_OPEN=true)';
const ORDER_LABEL = `${p.orderTitleA} ${p.orderTitleHl}`;
const TRIAL_LABEL = `${p.trialTitleA} ${p.trialTitleHl}`;
const graph = async (page: Page) => JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)['@graph'] as Array<Record<string, unknown>>;

async function openPlans(page: Page, path = '/') {
  await page.goto(path);
  await page.locator('#plans').scrollIntoViewIfNeeded();
  await page.locator('.offers[data-ready]').waitFor();
}
async function expectNoForm(dialog: ReturnType<Page['getByTestId']>) {
  await expect(dialog.getByTestId('prelaunch-notice')).toBeVisible();
  await expect(dialog.locator('form, input, select, textarea, [role="combobox"], [contenteditable="true"]')).toHaveCount(0);
  await expect(dialog.locator(`a[href="mailto:${EMAIL}"]`)).toBeVisible();
  await expect(dialog.getByTestId('prelaunch-notice')).toContainText(`${p.contactLead} ${EMAIL}`);
  await expect(dialog).toContainText(p.contactNote);
  await expect(dialog.getByTestId('prelaunch-action')).toHaveCount(1);
}

test.describe('prelaunch windows and texts (English)', () => {
  test.skip(ORDERS_OPEN, CLOSED_ONLY);
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'desktop flows; phones are covered below'));

  test('order window: « Orders opening soon », the selection and its price, no form; back to the plans', async ({ page }) => {
    await openPlans(page);
    const c = page.getByTestId('configurator');
    await c.locator('button[data-tier="ultra"]').click();
    await c.locator('button[data-term="24m"]').click();
    await c.locator('button[data-stream="3"]').click();
    const simPrice = norm(await page.getByTestId('price').innerText());
    const selection = norm(await page.getByTestId('selection').innerText());
    const orderButton = c.locator('button.sim-cta');
    await orderButton.click();
    const dialog = page.getByTestId('checkout-dialog');
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(ORDER_LABEL);
    await expect(page.getByRole('dialog', { name: ORDER_LABEL })).toBeVisible();
    await expect(dialog).toContainText(p.orderText);
    await expectNoForm(dialog);
    await expect(dialog.locator('.stepper')).toHaveCount(0);
    await expect(dialog).not.toContainText(en.checkout.finish);
    await expect(dialog).not.toContainText(en.checkout.headSub);
    // The selection (plan · duration · devices) and the simulator's price stay, for reference.
    await expect(dialog.getByTestId('summary-plan')).toHaveText(selection);
    await expect(dialog.getByTestId('summary-plan')).toHaveText('Ultra+ · 24 months · 3 devices');
    await expect(dialog.getByTestId('summary-price')).toHaveText(simPrice);
    await expect(dialog.getByTestId('prelaunch-action')).toHaveText(p.back);
    await dialog.getByTestId('prelaunch-action').click();
    await expect(dialog).toBeHidden();
    await expect(orderButton).toBeFocused();
  });

  test('free-trial, support and footer Contact windows: prelaunch message, no form, e-mail for general questions', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Free trial' }).click();
    const dialog = page.getByTestId('request-dialog');
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(TRIAL_LABEL);
    await expect(page.getByRole('dialog', { name: TRIAL_LABEL })).toBeVisible();
    await expect(dialog).toContainText(p.trialText);
    await expectNoForm(dialog);
    await expect(dialog.getByTestId('prelaunch-action')).toHaveText(p.close);
    await dialog.getByTestId('prelaunch-action').click();
    await expect(dialog).toBeHidden();
    for (const open of [() => page.locator('.support-fab').click(), () => page.locator('footer').getByRole('button', { name: 'Contact', exact: true }).click()]) {
      await open();
      await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(`${p.supportTitleA} ${p.supportTitleHl}`);
      await expect(dialog).toContainText(p.supportText);
      await expectNoForm(dialog);
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    }
  });

  test('FAQ: « Can I subscribe now? » and « Which devices are supported? » answered accurately; JSON-LD consistent', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('#faq details');
    await expect(items).toHaveCount(en.faq.items.length);
    await expect(items.locator('summary')).toHaveText(en.faq.items.map((i) => i.q));
    await expect(items.nth(0)).toContainText(p.faqSubscribe);
    await items.nth(2).locator('summary').click();
    await expect(items.nth(2)).toContainText(p.faqDevices);
    // Answers that do not present ordering or a trial as open stay as they are.
    for (const i of [1, 3, 4, 5]) expect(norm((await items.nth(i).locator('p').textContent())!)).toBe(norm(en.faq.items[i]!.a));
    // The open answers (« Yes. Choose your plan… », « Ask for a free trial… ») are nowhere on the page or in its data.
    for (const i of [0, 2]) await expect(page.locator('body')).not.toContainText(en.faq.items[i]!.a);
    const html = await page.content();
    expect(html).not.toContain(en.faq.items[0]!.a);
    expect(html).not.toContain(en.faq.items[2]!.a);
    // 864f703 has no FAQPage node: the JSON-LD stays Organization + WebSite, with the prelaunch description.
    const ld = await graph(page);
    expect(ld.map((n) => n['@type'])).toEqual(['Organization', 'WebSite']);
    for (const n of ld) expect(n.description, String(n['@type'])).toBe(p.metaDescription);
  });

  test('buttons: simulator « Orders opening soon », closing banner « Free trials opening soon »; same windows', async ({ page }) => {
    await openPlans(page);
    const order = page.getByTestId('configurator').locator('button.sim-cta');
    await expect(order).toHaveText(ORDER_LABEL);
    await expect(page.getByRole('button', { name: /^Order now/ })).toHaveCount(0);
    await order.click();
    await expect(page.getByTestId('checkout-dialog').getByTestId('prelaunch-notice')).toBeVisible();
    await page.keyboard.press('Escape');
    const trial = page.locator('.cta-actions button');
    await expect(trial).toHaveText(TRIAL_LABEL);
    await expect(page.getByRole('button', { name: en.cta.trial })).toHaveCount(0);
    await trial.click();
    const dialog = page.getByTestId('request-dialog');
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(TRIAL_LABEL);
    await expectNoForm(dialog);
  });

  test('home copy and search snippet: nothing presents ordering or a trial as open now', async ({ page }) => {
    await page.goto('/');
    const h = p.home;
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', p.metaDescription);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', p.metaDescription);
    await expect(page.locator('.features-bar li').first()).toHaveText(`${h.orderBenefitTitle}${h.orderBenefitText}`);
    await expect(page.locator('.features-bar li').nth(3)).toHaveText(`${en.benefits[3]!.title}${h.trialBenefitText}`);
    await expect(page.locator('.how3-steps li').nth(1)).toContainText(h.orderStepText);
    await expect(page.locator('.how3-steps li').nth(2)).toContainText(h.activationStepText);
    await expect(page.locator('.how3-note')).toHaveText(h.howNote);
    await expect(page.locator('.cta-text2')).toHaveText(h.trialGuarantee);
    await expect(page.locator('.sim-points li').nth(3)).toHaveText(h.trialGuarantee);
    const body = await page.locator('body').innerText();
    for (const open of [en.benefits[0]!.title, en.how.note, en.cta.text2, en.plans.previewCheckout, en.cta.trial, en.plans.simulatorPoints[3]!, 'Quickly, on WhatsApp', 'Order online in minutes']) {
      expect(body, open).not.toContain(open);
    }
    // Hero, header, footer and every other home text: unchanged (English only, 864f703 wording).
    await expect(page.locator('.hero .lead')).toHaveText(en.hero.lead);
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: en.nav.trial })).toBeVisible();
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('orders open: today\'s texts, no prelaunch variant', () => {
  test.skip(!ORDERS_OPEN, 'build with online requests open only (ORDERS_OPEN=true)');
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'markup check (desktop only)'));
  test('buttons, home copy, FAQ and description are the 864f703 ones', async ({ page }) => {
    await openPlans(page);
    await expect(page.getByTestId('configurator').locator('button.sim-cta')).toHaveText(en.plans.previewCheckout);
    await expect(page.locator('.cta-actions button')).toHaveText(en.cta.trial);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', en.meta.homeDescription);
    await expect(page.locator('.how3-note')).toHaveText(en.how.note);
    await expect(page.locator('.cta-text2')).toHaveText(en.cta.text2);
    await expect(page.locator('#faq details p')).toHaveText(en.faq.items.map((i) => i.a));
    const ld = await graph(page);
    expect(ld.find((n) => n['@type'] === 'WebSite')!.description).toBe(en.meta.homeDescription);
    await page.getByTestId('configurator').locator('button.sim-cta').click();
    await expect(page.getByTestId('checkout-dialog').locator('form')).toHaveCount(1);
    await expect(page.getByTestId('prelaunch-notice')).toHaveCount(0);
  });
});

test.describe('prelaunch — server, phones, accessibility', () => {
  test.skip(ORDERS_OPEN, CLOSED_ONLY);
  test('the API refuses orders, trials and support requests (503) before storing anything; checkout stays 403', async ({ request, baseURL, isMobile }) => {
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
    const checkout = await request.post('/api/checkout', { headers, data: { tier: 'plus', term: '12m', streams: 1 } });
    expect(checkout.status()).toBe(403);
    expect((await checkout.json()).error).toBe('sales_disabled');
  });

  test('phones: the prelaunch windows fit at 320 / 375 px, 44 px+ buttons, no horizontal scroll', async ({ page, isMobile }) => {
    test.skip(isMobile, 'explicit viewport sizes');
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: 800 });
      await openPlans(page);
      const opens: Array<[string, () => Promise<void>]> = [
        ['checkout-dialog', () => page.getByTestId('configurator').locator('button.sim-cta').click()],
        ['request-dialog', () => page.locator('.cta-actions button').click()],
        ['request-dialog', () => page.locator('.support-fab').click()],
      ];
      for (const [id, open] of opens) {
        await open();
        const dialog = page.getByTestId(id);
        await dialog.getByTestId('prelaunch-notice').waitFor();
        const r = await dialog.evaluate((el) => {
          const box = el.getBoundingClientRect();
          const out = [...el.querySelectorAll('p, a, button, b, span, h2')].filter((e) => {
            const b = e.getBoundingClientRect();
            return b.width > 0 && (b.right > box.right + 1 || b.left < box.left - 1);
          }).length;
          return { sw: el.scrollWidth, cw: el.clientWidth, out, page: document.documentElement.scrollWidth, vw: innerWidth };
        });
        expect(r.sw, `${id} @${width} dialog scroll`).toBeLessThanOrEqual(r.cw + 1);
        expect(r.out, `${id} @${width} content outside`).toBe(0);
        expect(r.page, `${id} @${width} page scroll`).toBeLessThanOrEqual(r.vw);
        expect((await dialog.getByTestId('prelaunch-action').boundingBox())!.height).toBeGreaterThanOrEqual(44);
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
      }
    }
  });

  test('phones: « Orders opening soon » / « Free trials opening soon » buttons fit at 320 / 375 px', async ({ page, isMobile }) => {
    test.skip(isMobile, 'explicit viewport sizes');
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: 800 });
      await openPlans(page);
      for (const sel of ['[data-testid="configurator"] .sim-cta', '.cta-actions button', '.cta-actions a']) {
        const el = page.locator(sel);
        await el.scrollIntoViewIfNeeded();
        const r = await el.evaluate((e) => {
          const b = e.getBoundingClientRect();
          return { sw: e.scrollWidth, cw: e.clientWidth, left: b.left, right: b.right, h: b.height, vw: document.documentElement.clientWidth, page: document.documentElement.scrollWidth };
        });
        expect(r.sw, `@${width} ${sel} text overflow`).toBeLessThanOrEqual(r.cw + 1);
        expect(r.left, `@${width} ${sel}`).toBeGreaterThanOrEqual(0);
        expect(r.right, `@${width} ${sel}`).toBeLessThanOrEqual(r.vw);
        expect(r.h, `@${width} ${sel} touch target`).toBeGreaterThanOrEqual(44);
        expect(r.page, `@${width} page scroll`).toBeLessThanOrEqual(r.vw);
      }
    }
  });

  test('accessibility: no axe violation in the prelaunch order, trial and support windows (WCAG 2.1 AA)', async ({ page }) => {
    const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
    await openPlans(page);
    await page.getByTestId('configurator').locator('button.sim-cta').click();
    await page.getByTestId('prelaunch-notice').waitFor();
    let results = await new AxeBuilder({ page }).include('[data-testid="checkout-dialog"]').withTags(tags).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
    await page.keyboard.press('Escape');
    await page.locator('.cta-actions button').click();
    await page.getByTestId('prelaunch-notice').waitFor();
    results = await new AxeBuilder({ page }).include('[data-testid="request-dialog"]').withTags(tags).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
    await page.keyboard.press('Escape');
    await page.locator('.support-fab').click();
    await page.getByTestId('prelaunch-notice').waitFor();
    results = await new AxeBuilder({ page }).include('[data-testid="request-dialog"]').withTags(tags).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
