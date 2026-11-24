import { expect, test, type Page } from '@playwright/test';
import en from '../../src/i18n/dictionaries/en';
import fr from '../../src/i18n/dictionaries/fr';
import de from '../../src/i18n/dictionaries/de';
import es from '../../src/i18n/dictionaries/es';
import it from '../../src/i18n/dictionaries/it';
import nl from '../../src/i18n/dictionaries/nl';
import sv from '../../src/i18n/dictionaries/sv';
import nb from '../../src/i18n/dictionaries/nb';
import type { Locale } from '../../src/i18n/config';
import { fill, plural } from '../../src/i18n/format';
import { displayMoney, displayMoneyWithCode } from '../../src/lib/money-display';
import { computeQuote, getStaticPriceTable, STREAMS, TERM_MONTHS, TIERS } from '../../src/lib/pricing';
import { RELEASED_LANGS } from './released';

/**
 * Release candidate (8 languages) — price matrix. For every built language and every combination of the three plans,
 * the three terms (12 / 24 / 36 months) and 1 to 4 devices (36 combinations), the plan simulator shows the price of the
 * repository's price list (src/config/price-tables.json through src/lib/pricing.ts, never hard-coded here), formatted
 * by the app's own display rules (src/lib/money-display.ts), and the order window's summary repeats the same plan,
 * duration, devices and price. Works with online requests closed (prelaunch) or open: no order is sent.
 */
const DICTS = { en, fr, de, es, it, nl, sv, nb } as const;
type Lang = keyof typeof DICTS;
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const LANGS = (Object.keys(DICTS) as Lang[]).filter((l) => l === 'en' || PREVIEW || RELEASED_LANGS.includes(l));
const home = (l: Lang) => (l === 'en' ? '/' : `/${l}`);
/** Same normalisation as Playwright's toHaveText (non-breaking and narrow non-breaking spaces become spaces). */
const norm = (s: string) => s.replace(/​/g, '').replace(/\s+/g, ' ').trim();

const TABLE = getStaticPriceTable();
const TERMS3 = ['12m', '24m', '36m'] as const;
const COMBOS = TIERS.flatMap((tier) => TERMS3.flatMap((term) => STREAMS.map((streams) => ({ tier, term, streams }))));

async function openPlans(page: Page, path: string) {
  await page.goto(path);
  await page.locator('#plans').scrollIntoViewIfNeeded();
  await page.locator('.offers[data-ready]').waitFor();
}

test.describe('price matrix', () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'desktop project only (the prices do not depend on the device)'));

  test('the matrix covers 3 plans × 3 terms × 4 device counts from the repository price list', () => {
    expect(COMBOS).toHaveLength(36);
    expect(TABLE.currency).toBe('USD');
    for (const c of COMBOS) expect(computeQuote(TABLE, c).amountMinor, `${c.tier}:${c.term}:${c.streams}`).toBeGreaterThan(0);
  });

  for (const lang of LANGS) {
    const d = DICTS[lang];
    const locale = lang as Locale;
    const money = (minor: number) => norm(displayMoney(minor, TABLE.currency, locale));

    test(`${lang}: simulator and order summary show the price-list price for all 36 combinations`, async ({ page }) => {
      test.setTimeout(240_000);
      await openPlans(page, home(lang));
      const c = page.getByTestId('configurator');
      const orderButton = c.locator('button.sim-cta');
      const dialog = page.getByTestId('checkout-dialog');

      // The three yearly plan cards (12 months, 1 device).
      for (const tier of TIERS) {
        await expect.soft(page.getByTestId(`tier-price-${tier}`), `${lang} card ${tier}`).toHaveText(money(computeQuote(TABLE, { tier, term: '12m', streams: 1 }).amountMinor));
      }

      for (const { tier, term, streams } of COMBOS) {
        const id = `${lang} ${tier}:${term}:${streams}`;
        const q = computeQuote(TABLE, { tier, term, streams });
        await c.locator(`button[data-tier="${tier}"]`).click();
        await c.locator(`button[data-term="${term}"]`).click();
        await c.locator(`button[data-stream="${streams}"]`).click();
        await expect(c.locator(`button[data-tier="${tier}"]`)).toHaveAttribute('aria-pressed', 'true');
        await expect(c.locator(`button[data-term="${term}"]`)).toHaveAttribute('aria-pressed', 'true');
        await expect(c.locator(`button[data-stream="${streams}"]`)).toHaveAttribute('aria-pressed', 'true');

        // Simulator: selection, price, duration comparison and monthly equivalent, all from the price list.
        const devices = plural(d.common, 'device', streams);
        await expect.soft(page.getByTestId('selection'), `${id} selection`).toHaveText(norm(`${d.plans.tiers[tier].name} · ${d.plans.terms[term]} · ${devices}`));
        await expect.soft(page.getByTestId('price'), `${id} price`).toHaveText(money(q.amountMinor));
        // Owner decision B6: the price of the same plan as separate 12-month plans is stated as a comparison (no
        // struck-through « regular » price), with the saving, both computed from the price list.
        if (q.referenceMinor !== null && q.savingsMinor > 0) {
          await expect.soft(page.getByTestId('savings'), `${id} comparison`).toHaveText(
            norm(fill(d.plans.savings, { n: (TERM_MONTHS[term] ?? 12) / 12, reference: displayMoney(q.referenceMinor, TABLE.currency, locale), amount: displayMoney(q.savingsMinor, TABLE.currency, locale), pct: q.savingsPercent })),
          );
          await expect.soft(page.getByTestId('savings'), `${id} comparison amount`).toContainText(money(q.referenceMinor));
        } else {
          await expect.soft(page.getByTestId('savings'), `${id} no comparison`).toHaveCount(0);
        }
        await expect.soft(c.locator('.sim-summary s, .sim-summary del, [data-testid="regular-price"]'), `${id} no struck price`).toHaveCount(0);
        await expect.soft(c.locator('.sim-summary .price-sub'), `${id} per month`).toHaveText(norm(fill(d.common.perMonth, { price: displayMoney(q.monthlyEquivalentMinor!, TABLE.currency, locale) })));
        // Extra-device notes of the selected plan and term.
        const base = computeQuote(TABLE, { tier, term, streams: 1 }).amountMinor;
        for (const n of STREAMS) {
          if (n === 1) continue;
          const extra = computeQuote(TABLE, { tier, term, streams: n }).amountMinor - base;
          await expect.soft(c.locator(`button[data-stream="${n}"] .choice-note`), `${id} +${n} devices`).toHaveText(`+${money(extra)}`);
        }

        // Order window: same plan, duration, devices and price (English adds the currency code: « $69 USD »).
        await orderButton.click();
        await expect(dialog).toBeVisible();
        await expect.soft(page.getByTestId('summary-plan'), `${id} summary plan`).toHaveText(d.plans.tiers[tier].name);
        await expect.soft(page.getByTestId('summary-duration'), `${id} summary duration`).toHaveText(d.plans.terms[term]);
        await expect.soft(page.getByTestId('summary-devices'), `${id} summary devices`).toHaveText(devices);
        await expect.soft(page.getByTestId('summary-price'), `${id} summary price`).toHaveText(norm(displayMoneyWithCode(q.amountMinor, TABLE.currency, locale)));
        expect.soft(norm(await page.getByTestId('summary-price').innerText()).startsWith(norm(await page.getByTestId('price').innerText())), `${id} summary starts with the simulator price`).toBe(true);
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
      }
    });
  }
});
