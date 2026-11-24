import { expect, test, type Page } from '@playwright/test';
import en from '../../src/i18n/dictionaries/en';
import fr from '../../src/i18n/dictionaries/fr';
import de from '../../src/i18n/dictionaries/de';
import es from '../../src/i18n/dictionaries/es';
import it from '../../src/i18n/dictionaries/it';
import nl from '../../src/i18n/dictionaries/nl';
import sv from '../../src/i18n/dictionaries/sv';
import nb from '../../src/i18n/dictionaries/nb';
import { CONTENT_ON, RELEASED_LANGS } from './released';

/**
 * Owner decisions of 24/11/2026, rendered (unit side: tests/unit/commercial-wording.test.ts):
 * - B6: no « +30 days free » badge or comparison-table row while the promotion is off (src/config/promotions.ts), no
 *   struck-through « Regular price » (a factual comparison with separate 12-month plans instead);
 * - B2 / A7: no « $0.00 » / « 0,00 » tax amount and no « before taxes » statement on the home page and the ordering
 *   help page; the FAQ answer « How much does it cost? » ends with the neutral tax statement.
 */
const DICTS = { en, fr, de, es, it, nl, sv, nb } as const;
type Lang = keyof typeof DICTS;
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const LANGS = (Object.keys(DICTS) as Lang[]).filter((l) => l === 'en' || PREVIEW || RELEASED_LANGS.includes(l));
const prefix = (l: Lang) => (l === 'en' ? '' : `/${l}`);
const REGULAR_PRICE = /regular price|prix normal|regulärer preis|precio normal|prezzo pieno|normale prijs|ordinarie pris|ordinær pris/i;
const ZERO_AMOUNT = /(?<![\d.,])0[.,]00(?!\d)/;
const BEFORE_TAXES = /before taxes|hors taxes|zzgl\. Steuern|impuestos no incluidos|tasse escluse|exclusief belasting|exklusive skatt|eksklusive avgifter/i;
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

async function openPlans(page: Page, path: string) {
  await page.goto(path);
  await page.locator('#plans').scrollIntoViewIfNeeded();
  await page.locator('.offers[data-ready]').waitFor();
}

test.describe('commercial wording (B2, B6)', () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'markup check (desktop only; layouts are covered by the responsive suites)'));

  for (const lang of LANGS) {
    const d = DICTS[lang];
    test(`${lang}: no « +30 days free », no struck « regular » price, no tax amount or « before taxes » on the home page`, async ({ page }) => {
      await openPlans(page, prefix(lang) || '/');
      await expect(page.locator('.tier-bonus')).toHaveCount(0);
      const rowLabels = await page.locator('.compare-table tbody th').allInnerTexts();
      expect(rowLabels.length).toBe(d.plans.compare.rows.length - 1);
      expect(rowLabels.map(norm)).not.toContain(norm(d.plans.bonus));

      // A 36-month selection: the comparison is shown, without a struck-through price.
      const c = page.getByTestId('configurator');
      await c.locator('button[data-term="36m"]').click();
      await expect(page.getByTestId('savings')).toBeVisible();
      await expect(c.locator('s, del, [data-testid="regular-price"]')).toHaveCount(0);

      // Page text without scripts (closed FAQ answers included): the pricing answer ends with the neutral tax statement.
      const text = norm(await page.locator('body').evaluate((b) => {
        const copy = b.cloneNode(true) as HTMLElement;
        copy.querySelectorAll('script, style, template, noscript').forEach((n) => n.remove());
        return copy.textContent ?? '';
      }));
      expect(text).toContain(norm(d.faq.items[3]!.a));
      expect(text).not.toContain(norm(d.plans.bonus));
      expect(text).not.toMatch(/\+\s?30\b/);
      expect(text).not.toMatch(REGULAR_PRICE);
      expect(text).not.toMatch(ZERO_AMOUNT);
      expect(text).not.toMatch(BEFORE_TAXES);
    });

    test(`${lang}: the ordering help page states prices in USD without a tax amount or « before taxes »`, async ({ page }) => {
      test.skip(!CONTENT_ON, 'content pages not built (E2E_CONTENT_PAGES)');
      const res = await page.goto(`${prefix(lang)}/help/ordering-payment`);
      expect(res?.status()).toBe(200);
      const text = norm(await page.locator('main').innerText());
      expect(text).toContain('USD');
      expect(text).not.toMatch(ZERO_AMOUNT);
      expect(text).not.toMatch(BEFORE_TAXES);
      expect(text).not.toMatch(REGULAR_PRICE);
    });
  }
});
