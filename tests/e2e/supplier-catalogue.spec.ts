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
import { fill, formatCount } from '../../src/i18n/format';
import { SUPPLIER_CATALOGUE } from '../../src/config/supplier-catalogue';
import { RELEASED_LANGS } from './released';

/**
 * PROPOSAL (owner decision 24/11/2026, D6 « Owner update »): the supplier-confirmed overall catalogue, rendered.
 * One sentence on the home page, under the plans comparison (not in a plan card or column), never in the title,
 * meta tags or JSON-LD; no horizontal overflow at 320 / 375 / 1366 px; no axe violation in the block.
 */
const DICTS = { en, fr, de, es, it, nl, sv, nb } as const;
type Lang = keyof typeof DICTS;
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const LANGS = (Object.keys(DICTS) as Lang[]).filter((l) => l === 'en' || PREVIEW || RELEASED_LANGS.includes(l));
const home = (l: Lang) => (l === 'en' ? '/' : `/${l}`);
const cat = SUPPLIER_CATALOGUE!;
const statement = (l: Lang) => fill(DICTS[l].plans.compare.supplierCatalogue, { channels: formatCount(cat.channels, l), vod: formatCount(cat.vod, l) });
/** The two figures in any grouping (35,000 · 35 000 · 35.000 · 35000). */
const FIGURES = /35[ ,.  ]?000|200[ ,.  ]?000/;

async function openPlans(page: Page, path: string) {
  await page.goto(path);
  await page.locator('#plans').scrollIntoViewIfNeeded();
  await page.locator('.offers[data-ready]').waitFor();
}

test.describe('supplier catalogue statement (proposal)', () => {
  for (const lang of LANGS) {
    test(`${lang}: shown once, under the comparison, outside every plan card; not in meta or JSON-LD`, async ({ page }) => {
      await openPlans(page, home(lang));
      const note = page.getByTestId('supplier-catalogue');
      await expect(note).toHaveCount(1);
      await expect(note).toBeVisible();
      await expect(note).toHaveText(statement(lang));
      // Placement: in the comparison block, after the scrolling table, not inside a plan card, column or table cell.
      const where = await note.evaluate((el) => ({
        inCompare: !!el.closest('.compare'),
        inTable: !!el.closest('table, .compare-scroll'),
        inPlan: !!el.closest('.tier-card, .tier-grid, .sim-layout, [data-tier]'),
        afterTable: !!(document.querySelector('.compare-scroll')!.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING),
      }));
      expect(where).toEqual({ inCompare: true, inTable: false, inPlan: false, afterTable: true });
      // Once on the page: the figures appear only in this sentence (not in the plan cards, the banner, the FAQ…).
      const body = await page.locator('body').innerText();
      expect(body.split(formatCount(cat.channels, lang)).length - 1).toBe(1);
      expect(body.split(formatCount(cat.vod, lang)).length - 1).toBe(1);
      for (const card of await page.locator('.tier-card').all()) await expect(card).not.toContainText(FIGURES);
      await expect(page.locator('.cta-section')).not.toContainText(FIGURES);
      // Not in the title, any meta tag or the structured data (snippets would drop the qualifier).
      expect(await page.title()).not.toMatch(FIGURES);
      const metas = await page.locator('head meta[content]').evaluateAll((els) => els.map((e) => e.getAttribute('content') ?? ''));
      for (const m of metas) expect(m, m).not.toMatch(FIGURES);
      const lds = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(lds.length).toBeGreaterThan(0);
      for (const ld of lds) {
        expect(ld).not.toMatch(FIGURES);
        expect(ld).not.toMatch(/35000|200000/);
        expect(ld).not.toContain(DICTS[lang].plans.compare.supplierCatalogue.slice(0, 12));
      }
    });

    test(`${lang}: fits at 320 / 375 / 1366 px (no horizontal overflow) and passes axe`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'widths are set explicitly (desktop project)');
      for (const width of [320, 375, 1366]) {
        await page.setViewportSize({ width, height: 900 });
        await openPlans(page, home(lang));
        const note = page.getByTestId('supplier-catalogue');
        await note.scrollIntoViewIfNeeded();
        const r = await note.evaluate((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          const text = range.getBoundingClientRect();
          const box = el.getBoundingClientRect();
          const compare = el.closest('.compare')!.getBoundingClientRect();
          return {
            pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            left: Math.min(text.left, box.left),
            right: Math.max(text.right, box.right),
            inCompare: text.left >= compare.left - 1 && text.right <= compare.right + 1,
            scrollOverflow: el.scrollWidth - el.clientWidth,
            viewport: window.innerWidth,
          };
        });
        expect(r.pageOverflow, `${lang} ${width}px page`).toBeLessThanOrEqual(0);
        expect(r.left, `${lang} ${width}px left`).toBeGreaterThanOrEqual(0);
        expect(r.right, `${lang} ${width}px right`).toBeLessThanOrEqual(r.viewport);
        expect(r.inCompare, `${lang} ${width}px inside the block`).toBe(true);
        expect(r.scrollOverflow, `${lang} ${width}px text overflow`).toBeLessThanOrEqual(0);
        if (width !== 375) {
          const results = await new AxeBuilder({ page }).include('.compare').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
          expect(results.violations.map((v) => `${width}px ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
        }
      }
    });
  }
});
