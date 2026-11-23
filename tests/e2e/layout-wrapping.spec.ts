import { expect, test, type Page } from '@playwright/test';
import { RELEASED_LANGS } from './released';

/**
 * Phase 12 (UI audit U-003, U-004, U-005, U-007) — labels wrap instead of overflowing, in every built language, measured
 * against the widest fallback fonts in CI. Also with the longer « … opening soon » labels injected into the closing-banner
 * and simulator buttons, so that a later copy change cannot overflow either.
 */
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const CONTENT = process.env.E2E_CONTENT_PAGES === 'preview';
const LANGS = ['en', ...['fr', 'de', 'es', 'it', 'nl', 'sv', 'nb'].filter((l) => PREVIEW || RELEASED_LANGS.includes(l))];
const home = (l: string) => (l === 'en' ? '/' : `/${l}`);
const LONG: Record<string, [string, string]> = {
  en: ['Free trials opening soon', 'Orders opening soon'],
  fr: ['Essais gratuits bientôt disponibles', 'Commandes bientôt ouvertes'],
  de: ['Kostenloser Testzugang in Kürze', 'Online-Bestellung in Kürze'],
  es: ['Pruebas gratuitas muy pronto', 'Pedidos disponibles muy pronto'],
  it: ['Prove gratuite in arrivo a breve', 'Ordini disponibili a breve'],
  nl: ['Gratis proberen kan binnenkort', 'Bestellen kan binnenkort'],
  sv: ['Gratis provperioder öppnar snart', 'Beställningar öppnar snart'],
  nb: ['Gratis prøveperioder åpner snart', 'Bestillinger åpner snart'],
};

/** Every text run of the element, against the element's border box: how far the text sticks out (px). */
const overflowOf = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)].filter((e) => e.getClientRects().length).map((e) => {
  const b = e.getBoundingClientRect();
  let out = -Infinity;
  const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    if (!n.textContent?.trim()) continue;
    const r = document.createRange();
    r.selectNodeContents(n);
    for (const x of r.getClientRects()) if (x.width > 0.5) out = Math.max(out, b.left - x.left, x.right - b.right);
  }
  return Math.round(out);
});

/** The plans (and the simulator) are « ready » once hydrated and scrolled to. */
async function ready(page: Page) {
  await page.locator('#plans').scrollIntoViewIfNeeded();
  await page.locator('.offers[data-ready]').waitFor({ state: 'attached' });
}

async function injectLong(page: Page, lang: string) {
  await page.evaluate(([trial, order]) => {
    const set = (btn: Element | null, txt: string) => {
      const nodes = [...(btn?.childNodes ?? [])].filter((n) => n.nodeType === 3 && n.textContent?.trim());
      nodes.forEach((n, i) => (n.textContent = i === nodes.length - 1 ? ` ${txt}` : ''));
    };
    set(document.querySelector('.cta-actions .btn-lime'), trial!);
    set(document.querySelector('.sim-cta'), order!);
  }, LONG[lang]!);
}

async function bannerAudit(page: Page) {
  return page.evaluate((fn) => {
    const overflow = new Function(`return (${fn})`)() as (s: string) => number[];
    const banner = document.querySelector('.cta-banner')!.getBoundingClientRect();
    const btns = [...document.querySelectorAll('.cta-actions .btn')].map((b) => b.getBoundingClientRect());
    const overlap = btns.length === 2 && btns[0]!.right > btns[1]!.left + 0.5 && btns[0]!.bottom > btns[1]!.top + 0.5 && btns[1]!.bottom > btns[0]!.top + 0.5;
    const outside = [...document.querySelectorAll('.cta-actions .btn, .cta-trust li')].filter((e) => { const r = e.getBoundingClientRect(); return r.left < banner.left - 0.5 || r.right > banner.right + 0.5; }).length;
    const sim = document.querySelector('.sim-summary') as HTMLElement | null;
    return { btnText: overflow('.cta-actions .btn'), simText: overflow('.sim-cta'), overlap, outside, simSW: sim ? sim.scrollWidth - sim.clientWidth : 0, docSW: document.documentElement.scrollWidth };
  }, overflowOf.toString());
}

test.describe('closing banner and simulator button wrap (U-003)', () => {
  test.describe.configure({ timeout: 120_000 });
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'widths are set explicitly'));
  for (const lang of LANGS) {
    test(`${lang}: banner buttons and trust row fit at 320–600 px, also with « opening soon » labels`, async ({ page }) => {
      for (const width of [320, 375, 414, 600, 1366]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(home(lang));
        await ready(page);
        await page.locator('.cta-banner').scrollIntoViewIfNeeded();
        for (const label of ['current', 'long']) {
          if (label === 'long') await injectLong(page, lang);
          const a = await bannerAudit(page);
          const where = `${lang}@${width} ${label} labels`;
          expect(a.btnText.every((o) => o <= 0), `${where}: banner button text inside its pill ${a.btnText}`).toBe(true);
          expect(a.simText.every((o) => o <= 0), `${where}: simulator button text inside it ${a.simText}`).toBe(true);
          expect(a.overlap, `${where}: banner buttons overlap`).toBe(false);
          expect(a.outside, `${where}: banner items outside the banner`).toBe(0);
          expect(a.simSW, `${where}: simulator summary scrolls sideways`).toBeLessThanOrEqual(0);
          expect(a.docSW, `${where}: page scrollWidth`).toBeLessThanOrEqual(width);
        }
      }
    });
  }
});

test.describe('simulator duration and device labels (U-004)', () => {
  test.describe.configure({ timeout: 120_000 });
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'widths are set explicitly'));
  for (const lang of LANGS) {
    test(`${lang}: labels stay inside their buttons and never touch each other`, async ({ page }) => {
      for (const width of [320, 375, 414, 1366, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(home(lang));
        await ready(page);
        await page.getByTestId('configurator').scrollIntoViewIfNeeded();
        const out = await page.evaluate((fn) => {
          const overflow = new Function(`return (${fn})`)() as (s: string) => number[];
          return { terms: overflow('.simulator [data-term] .choice-text b'), streams: overflow('.simulator [data-stream] .choice-text b'), termBtns: overflow('.simulator [data-term]'), streamBtns: overflow('.simulator [data-stream]') };
        }, overflowOf.toString());
        // The label may use the button padding but never reaches its border.
        expect(out.termBtns.every((o) => o <= -2), `${lang}@${width} duration labels ${out.termBtns}`).toBe(true);
        expect(out.streamBtns.every((o) => o <= -2), `${lang}@${width} device labels ${out.streamBtns}`).toBe(true);
      }
    });
  }
});

test.describe('open phone menu never widens the page (U-007)', () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'widths are set explicitly'));
  for (const lang of LANGS) {
    test(`${lang}@320: the two buttons stay on screen`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      await page.goto(home(lang));
      await page.locator('.mobile-menu').click();
      const r = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        ctas: [...document.querySelectorAll('#navlinks .nav-ctas > *')].map((e) => { const b = e.getBoundingClientRect(); return [b.left, b.right, (e as HTMLElement).scrollWidth - (e as HTMLElement).clientWidth]; }),
      }));
      expect(r.sw).toBeLessThanOrEqual(320);
      for (const [l, rr, o] of r.ctas) {
        expect(l).toBeGreaterThanOrEqual(0);
        expect(rr).toBeLessThanOrEqual(320);
        expect(o).toBeLessThanOrEqual(0);
      }
    });
  }
});

test.describe('help and about headings wrap (U-005)', () => {
  test.describe.configure({ timeout: 120_000 });
  test.skip(!CONTENT, 'needs a build with NEXT_PUBLIC_CONTENT_PAGES=preview');
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'widths are set explicitly'));
  const pages = ['/about', '/help/devices', '/help/troubleshooting', '/help/free-trial', '/help/refunds'];
  for (const lang of LANGS) {
    test(`${lang}: section headings stay inside their card at 320 px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      for (const p of pages) {
        await page.goto((lang === 'en' ? '' : `/${lang}`) + p);
        const over = await page.evaluate(() => [...document.querySelectorAll('.terms-section h2, .terms-contact h2')].map((h) => {
          const card = h.closest('.terms-section, .terms-contact')!.getBoundingClientRect();
          const r = document.createRange();
          r.selectNodeContents(h);
          return Math.max(0, ...[...r.getClientRects()].map((x) => x.right - card.right));
        }));
        expect(over.every((o) => o <= 0), `${lang}${p}: ${over}`).toBe(true);
      }
    });
  }
});
