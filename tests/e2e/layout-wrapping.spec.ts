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
    // The label's text nodes, wherever they sit in the button (directly, or in its .btn-label span).
    const set = (btn: Element | null, txt: string) => {
      const nodes: Node[] = [];
      if (btn) for (let w = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT), n = w.nextNode(); n; n = w.nextNode()) if (n.textContent?.trim()) nodes.push(n);
      if (btn && !nodes.length) throw new Error('no label text to replace');
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

/**
 * Phase 13 regression sweep (A-001, A-002, A-005), checked against the CI fallback fonts:
 * - a button label that wraps keeps its icon next to the words (the icon is in the text line, not pinned to the edge);
 * - simulator duration / device labels never break inside a word (no « maan-den », « dispo-sitivos »);
 * - help / about headings never hyphenate a short word (« com-mitments »): only long compounds may break.
 */
/** Per button: number of label lines and the distance from each icon to the nearest text (px). */
const iconGaps = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)].filter((b) => b.getClientRects().length).map((b) => {
  const lines: DOMRect[] = [];
  for (let w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT), n = w.nextNode(); n; n = w.nextNode()) {
    if (!n.textContent?.trim()) continue;
    const r = document.createRange();
    r.selectNodeContents(n);
    lines.push(...[...r.getClientRects()].filter((x) => x.width > 0.5));
  }
  const rows = new Set(lines.map((x) => Math.round(x.top / 4))).size;
  const gaps = [...b.querySelectorAll('svg')].map((svg) => {
    const i = svg.getBoundingClientRect();
    const cy = i.top + i.height / 2;
    // Nearest text box on the icon's own line (or any line if none is level with it).
    const level = lines.filter((x) => cy >= x.top - 2 && cy <= x.bottom + 2);
    const pool = level.length ? level : lines;
    return Math.round(Math.min(...pool.map((x) => (i.right <= x.left + 1 ? x.left - i.right : x.right <= i.left + 1 ? i.left - x.right : 0))));
  });
  return { text: b.innerText.trim().slice(0, 40), rows, gaps, levelled: gaps.length > 0 };
});

/** Words of the matched elements that the browser split over two lines (hyphenation or overflow-wrap). */
const splitWords = (sel: string, minLen: number) => {
  const out: string[] = [];
  for (const e of document.querySelectorAll(sel)) {
    if (!e.getClientRects().length) continue;
    for (let w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), n = w.nextNode(); n; n = w.nextNode()) {
      const re = /[\p{L}\p{N}]+/gu;
      let m: RegExpExecArray | null;
      while ((m = re.exec(n.textContent ?? ''))) {
        if (m[0].length < 3 || m[0].length >= minLen) continue;
        const r = document.createRange();
        r.setStart(n, m.index);
        r.setEnd(n, m.index + m[0].length);
        if (new Set([...r.getClientRects()].filter((x) => x.width > 0.5).map((x) => Math.round(x.top / 3))).size > 1) out.push(m[0]);
      }
    }
  }
  return out;
};

test.describe('wrapped button labels keep their icon next to the words (A-001)', () => {
  test.describe.configure({ timeout: 120_000 });
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'widths are set explicitly'));
  for (const lang of LANGS) {
    test(`${lang}: closing banner, « How it works » and simulator buttons at 320–414 px, also with « opening soon » labels`, async ({ page }) => {
      for (const width of [320, 375, 414, 1366]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(home(lang));
        await ready(page);
        for (const label of ['current', 'long']) {
          if (label === 'long') await injectLong(page, lang);
          const res = await page.evaluate((fn) => (new Function(`return (${fn})`)() as (s: string) => Array<{ text: string; rows: number; gaps: number[] }>)('.cta-actions .btn, .sim-cta, .how3-cta'), iconGaps.toString());
          expect(res.length, 'buttons found').toBeGreaterThanOrEqual(4);
          for (const r of res) {
            expect(r.gaps.length, `${lang}@${width} « ${r.text} » has its icon`).toBe(1);
            // 8 px design spacing; the flex layout left 20–105 px between the icon and a wrapped label.
            expect(r.gaps.every((g) => g >= 2 && g <= 12), `${lang}@${width} ${label} « ${r.text} » (${r.rows} lines): icon gap ${r.gaps}`).toBe(true);
          }
        }
      }
    });
  }
});

test.describe('simulator labels never break inside a word (A-002)', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'widths are set explicitly'));
  for (const lang of LANGS) {
    test(`${lang}: duration and device labels at 320–1920 px`, async ({ page }) => {
      for (const width of [320, 330, 340, 360, 375, 414, 768, 900, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(home(lang));
        await ready(page);
        await page.getByTestId('configurator').scrollIntoViewIfNeeded();
        const split = await page.evaluate((fn) => (new Function(`return (${fn})`)() as (s: string, n: number) => string[])('.simulator [data-term] .choice-text b, .simulator [data-stream] .choice-text b', 99), splitWords.toString());
        expect(split, `${lang}@${width}: words broken over two lines`).toEqual([]);
      }
    });
  }
});

test.describe('help and about headings hyphenate long compounds only (A-005)', () => {
  test.describe.configure({ timeout: 120_000 });
  test.skip(!CONTENT, 'needs a build with NEXT_PUBLIC_CONTENT_PAGES=preview');
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'widths are set explicitly'));
  for (const lang of LANGS) {
    test(`${lang}: no word under 14 letters split at 320–414 px`, async ({ page }) => {
      for (const width of [320, 375, 414]) {
        await page.setViewportSize({ width, height: 800 });
        for (const p of ['/about', '/help/free-trial', '/help/troubleshooting']) {
          await page.goto((lang === 'en' ? '' : `/${lang}`) + p);
          const split = await page.evaluate((fn) => (new Function(`return (${fn})`)() as (s: string, n: number) => string[])('.terms-section h2, .terms-contact h2', 14), splitWords.toString());
          expect(split, `${lang}${p}@${width}`).toEqual([]);
        }
      }
    });
  }
});

test.describe('footer links break long words at a hyphenation point (A-008)', () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'widths are set explicitly'));
  for (const lang of LANGS) {
    test(`${lang}: no bare mid-word break in the footer at 320–414 px`, async ({ page }) => {
      for (const width of [320, 375, 414]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(home(lang));
        const bare = await page.evaluate(() => {
          const out: string[] = [];
          for (const e of document.querySelectorAll<HTMLElement>('.footer-col a, .footer-link-btn')) {
            for (let w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), n = w.nextNode(); n; n = w.nextNode()) {
              const re = /[\p{L}\p{N}]+/gu;
              let m: RegExpExecArray | null;
              while ((m = re.exec(n.textContent ?? ''))) {
                const r = document.createRange();
                r.setStart(n, m.index);
                r.setEnd(n, m.index + m[0].length);
                const split = new Set([...r.getClientRects()].filter((x) => x.width > 0.5).map((x) => Math.round(x.top / 3))).size > 1;
                // A word may only be split when it is long and the browser hyphenates it (a visible « - » at the break).
                if (split && (m[0].length < 14 || getComputedStyle(e).hyphens !== 'auto')) out.push(m[0]);
              }
            }
          }
          return out;
        });
        expect(bare, `${lang}@${width}`).toEqual([]);
      }
    });
  }
});
