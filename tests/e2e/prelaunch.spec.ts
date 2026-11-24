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
import { ORDERS_OPEN, RELEASED_LANGS, CONTENT_ON } from './released';

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
/** The content pages (About us, Help center) exist in the build under test: E2E_CONTENT_PAGES=preview or live. */
const CONTENT = CONTENT_ON;
const CLOSED_ONLY = 'build with online requests open (E2E_ORDERS_OPEN=true)';
const orderLabel = (p: (typeof en)['prelaunch']) => norm(`${p.orderTitleA} ${p.orderTitleHl}`);
const trialLabel = (p: (typeof en)['prelaunch']) => norm(`${p.trialTitleA} ${p.trialTitleHl}`);
const graph = async (page: Page) => JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)['@graph'] as Array<Record<string, unknown>>;

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
    test.skip(ORDERS_OPEN, CLOSED_ONLY);
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

    test('FAQ 1–3 (subscribe now, countries, devices) are answered accurately, in the page and in the FAQPage data', async ({ page }) => {
      await page.goto(home(lang));
      const ld = await graph(page);
      const faq = ld.find((n) => n['@type'] === 'FAQPage') as { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> };
      for (const [i, answer] of [p.faqSubscribe, p.faqCountries, p.faqDevices].entries()) {
        const item = page.locator('#faq details').nth(i);
        if (i > 0) await item.locator('summary').click();
        await expect(item).toContainText(answer);
        expect(faq.mainEntity[i]!.acceptedAnswer.text).toBe(answer);
        expect(faq.mainEntity[i]!.name).toBe(d.faq.items[i]!.q);
      }
      // The open answers (« Ask for a free trial… ») are nowhere on the page.
      for (const i of [1, 2]) await expect(page.locator('#faq')).not.toContainText(d.faq.items[i]!.a);
    });

    test('buttons: simulator « Orders opening soon », closing banner « Free trials opening soon »; same windows', async ({ page }) => {
      await openPlans(page, home(lang));
      const order = page.getByTestId('configurator').locator('button.btn').last();
      await expect(order).toHaveText(orderLabel(p));
      await order.click();
      await expect(page.getByTestId('checkout-dialog').getByTestId('prelaunch-notice')).toBeVisible();
      await page.keyboard.press('Escape');
      const trial = page.locator('.cta-actions button');
      await expect(trial).toHaveText(trialLabel(p));
      await trial.click();
      const dialog = page.getByTestId('request-dialog');
      await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(trialLabel(p));
      await expectNoForm(dialog);
    });

    test('home copy and search snippet: nothing presents ordering or a trial as open now', async ({ page }) => {
      await page.goto(home(lang));
      const h = p.home;
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', p.metaDescription);
      await expect(page.locator('.hero .lead')).toHaveText(h.heroLead);
      await expect(page.locator('.features-bar li').first()).toContainText(h.orderBenefitTitle);
      await expect(page.locator('.features-bar li').nth(3)).toContainText(h.trialBenefitText);
      await expect(page.locator('.how3-steps li').nth(1)).toContainText(h.orderStepText);
      await expect(page.locator('.how3-steps li').nth(2)).toContainText(h.activationStepText);
      await expect(page.locator('.how3-note')).toHaveText(h.howNote);
      await expect(page.locator('.cta-text2')).toHaveText(h.trialGuarantee);
      const body = await page.locator('main').innerText();
      for (const open of [d.hero.lead, d.benefits[0]!.title, d.how.note, d.cta.text2, d.plans.previewCheckout, d.cta.trial]) expect(body, open).not.toContain(open);
      // Organization / WebSite: one entity — the English description on every language's home, every built language.
      const ld = await graph(page);
      for (const t of ['Organization', 'WebSite']) expect(ld.find((n) => n['@type'] === t)!.description, t).toBe(en.prelaunch.metaDescription);
      const languages = ld.find((n) => n['@type'] === 'WebSite')!.inLanguage as string[];
      expect(languages).toEqual(expect.arrayContaining(['en', lang]));
      expect(languages).toHaveLength(PREVIEW ? 8 : 1 + RELEASED_LANGS.length);
    });

    test('About and Help center: prelaunch banner first, no « do it now » instruction', async ({ page }) => {
      test.skip(!CONTENT, 'needs a build with NEXT_PUBLIC_CONTENT_PAGES=preview or live');
      const base = lang === 'en' ? '' : `/${lang}`;
      for (const path of ['/about', '/help', '/help/getting-started', '/help/devices', '/help/free-trial', '/help/ordering-payment', '/help/troubleshooting', '/help/contact-support', '/help/refunds']) {
        await page.goto(`${base}${path}`);
        const banner = page.getByTestId('prelaunch-banner');
        await expect(banner, path).toBeVisible();
        await expect(banner).toContainText(p.pagesTitle);
        await expect(banner).toContainText(p.pagesText);
        await expect(banner.locator('form, input, button')).toHaveCount(0);
        // Above the page title.
        const [b, h1] = [await banner.boundingBox(), await page.getByRole('heading', { level: 1 }).boundingBox()];
        expect(b!.y, path).toBeLessThan(h1!.y);
        const trial = page.locator('main').getByRole('button', { name: trialLabel(p) });
        if (await trial.count()) await expect(trial).toBeVisible();
      }
      await page.goto(`${base}/help/free-trial`);
      await expect(page.locator('#request ol')).toHaveCount(0);
      await page.goto(`${base}/help/contact-support`);
      // Phase 13 (D8): e-mail only while requests are closed (no contact form, no WhatsApp / phone).
      await expect(page.locator('#reach li')).toHaveCount(1);
      await expect(page.locator('#reach')).toContainText(EMAIL);
      await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', /form|formul|Formular|modulo|skjema/i);
    });
  });
}

test.describe('orders open: today\'s texts, no prelaunch variant', () => {
  test.skip(!ORDERS_OPEN, 'build with online requests open only (E2E_ORDERS_OPEN=true)');
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'markup check (desktop only)'));
  for (const lang of LANGS) {
    const d = DICTS[lang];
    test(`${lang}: buttons, home copy, FAQ and description are the open ones`, async ({ page }) => {
      await openPlans(page, home(lang));
      await expect(page.getByTestId('configurator').locator('button.btn').last()).toHaveText(norm(d.plans.previewCheckout));
      await expect(page.locator('.cta-actions button')).toHaveText(norm(d.cta.trial));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', d.meta.homeDescription);
      await expect(page.locator('.hero .lead')).toHaveText(d.hero.lead);
      await expect(page.locator('.how3-note')).toHaveText(d.how.note);
      await expect(page.locator('.cta-text2')).toHaveText(d.cta.text2);
      const ld = await graph(page);
      const faq = ld.find((n) => n['@type'] === 'FAQPage') as { mainEntity: Array<{ acceptedAnswer: { text: string } }> };
      expect(faq.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(d.faq.items.map((i) => i.a));
      expect(ld.find((n) => n['@type'] === 'WebSite')!.description).toBe(en.meta.homeDescription);
      await expect(page.getByTestId('prelaunch-banner')).toHaveCount(0);
      if (CONTENT) {
        await page.goto(`${lang === 'en' ? '' : `/${lang}`}/help/free-trial`);
        await expect(page.getByTestId('prelaunch-banner')).toHaveCount(0);
        await expect(page.locator('#request ol li')).toHaveCount(3);
      }
    });
  }
});

test.describe('prelaunch — server, phones, accessibility', () => {
  test.skip(ORDERS_OPEN, CLOSED_ONLY);
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

  test('phones: « Orders opening soon » / « Free trials opening soon » buttons fit at 320 / 375 px in every built language', async ({ page, isMobile }) => {
    test.skip(isMobile, 'explicit viewport sizes');
    for (const lang of LANGS) {
      for (const width of [320, 375]) {
        await page.setViewportSize({ width, height: 800 });
        await openPlans(page, home(lang));
        for (const sel of ['[data-testid="configurator"] .sim-cta', '.cta-actions button', '.cta-actions a']) {
          const el = page.locator(sel);
          await el.scrollIntoViewIfNeeded();
          const r = await el.evaluate((e) => {
            const b = e.getBoundingClientRect();
            return { sw: e.scrollWidth, cw: e.clientWidth, left: b.left, right: b.right, h: b.height, vw: document.documentElement.clientWidth, page: document.documentElement.scrollWidth };
          });
          expect(r.sw, `${lang} @${width} ${sel} text overflow`).toBeLessThanOrEqual(r.cw + 1);
          expect(r.left, `${lang} @${width} ${sel}`).toBeGreaterThanOrEqual(0);
          expect(r.right, `${lang} @${width} ${sel}`).toBeLessThanOrEqual(r.vw);
          expect(r.h, `${lang} @${width} ${sel} touch target`).toBeGreaterThanOrEqual(44);
          expect(r.page, `${lang} @${width} page scroll`).toBeLessThanOrEqual(r.vw);
        }
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
