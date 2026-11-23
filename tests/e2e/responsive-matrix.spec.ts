import { expect, test, type Page } from '@playwright/test';
import { RELEASED_LANGS } from './released';

/**
 * Release candidate (8 languages) — responsive matrix of the home page, at the phone, tablet and desktop widths of the
 * release checklist (320, 375, 390, 412, 768, 1024, 1440, 1920 px), in every built language. Complements
 * responsive.spec.ts (page scroll width, footer and plan-line layout) with what it does not check:
 * - no element sticks out of the viewport: html, #main and .footer use `overflow-x: clip`, which hides the page scroll
 *   bar but cuts the content, so the scroll width alone cannot see it. Elements inside their own scrolling or clipping
 *   box (carousels, tables, rounded media) are fine as long as that box fits;
 * - the header call-to-action (« Free trial », « Get started ») is reachable: directly, or from the menu button;
 * - the three plan cards are visible and fit the viewport.
 */
const LANGS = ['en', 'fr', 'de', 'es', 'it', 'nl', 'sv', 'nb'].filter((l) => l === 'en' || process.env.E2E_SITE_MODE === 'preview' || RELEASED_LANGS.includes(l));
const WIDTHS = [320, 375, 390, 412, 768, 1024, 1440, 1920];
const home = (l: string) => (l === 'en' ? '/' : `/${l}`);

/** Elements that stick out of the viewport horizontally, unless a scrolling / clipping box of their own contains them. */
function outOfViewport(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    // The page-level safety nets: clipping there hides an overflow, it does not make it acceptable.
    const pageLevel = (el: Element) => el === document.documentElement || el === document.body || el.id === 'main' || el.classList.contains('footer');
    const fits = (r: DOMRect) => r.left >= -1 && r.right <= vw + 1;
    const out: string[] = [];
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1 || fits(r)) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'contents' || Number(cs.opacity) === 0) continue;
      let contained = false;
      let hidden = false;
      for (let a = el.parentElement; a; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) { hidden = true; break; }
        if (pageLevel(a)) continue;
        if (s.overflowX !== 'visible' && fits(a.getBoundingClientRect())) { contained = true; break; }
      }
      if (contained || hidden) continue;
      // Visually hidden helpers (« sr-only », the anti-spam field) are not layout.
      if (cs.position === 'absolute' && (cs.clip !== 'auto' || cs.clipPath !== 'none' || r.right < 0)) continue;
      const id = el.id ? `#${el.id}` : '';
      const cls = typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
      out.push(`${el.tagName.toLowerCase()}${id}${cls} [${Math.round(r.left)}, ${Math.round(r.right)}] of ${vw}`);
    }
    // Report the outermost offenders only (their children follow them out).
    return out.slice(0, 12);
  });
}

/** Waits for the running finite animations (scroll reveals, menu transitions) to end: positions are measured at rest. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter((a) => {
      const end = a.effect?.getComputedTiming().endTime;
      return typeof end === 'number' && Number.isFinite(end);
    });
    await Promise.race([Promise.all(finite.map((a) => a.finished.catch(() => undefined))), new Promise((r) => setTimeout(r, 3000))]);
  });
}

/** The element is on screen horizontally and is the one a tap at its centre would hit. */
async function reachable(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { inView: r.width > 0 && r.height > 0 && r.left >= 0 && r.right <= document.documentElement.clientWidth && r.top >= 0 && r.bottom <= innerHeight, onTop: !!hit && (hit === el || el.contains(hit)) };
  });
}

/**
 * Real layout defects found at commit 0df474f (see the release-candidate QA report). Each combination stays in the
 * matrix as test.fixme until fixed; remove the entry once the layout is corrected. The site font is Inter when the
 * device has it, otherwise the system font; the E2E runs use the fallback font (FONTCONFIG without Inter), which is
 * wider, so « fallback font » defects show where a longer rendering of the same text breaks the layout.
 * Phase 12 (UI fixes) corrected all four entries found at 0df474f: sv hero title (hyphenation + shrinkable hero
 * column), de / nl open-menu buttons (U-007), de categories (shrinkable grid columns), nl hero feature bar (wraps).
 */
const KNOWN_DEFECTS: Record<string, string> = {};

test.describe('responsive matrix (home)', () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'widths are set explicitly (desktop project)'));
  // The headless test browser intermittently crashes on the home page under heavy machine load (« Page crashed »:
  // Chromium compositor CHECK failure, seen at 0df474f on any width and language, never on pages without the hero
  // videos). A crash is retried in a fresh browser; a layout failure fails again on every attempt.
  test.describe.configure({ retries: 2 });

  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      const at = `${lang} @${width}px`;
      const known = KNOWN_DEFECTS[`${lang}@${width}`];
      (known ? test.fixme : test)(`${at}: nothing outside the viewport, header CTA reachable, plan cards visible`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(home(lang));
        // The plans are « ready » once hydrated and scrolled to; then back to the top of the page.
        await page.locator('#plans').scrollIntoViewIfNeeded();
        await page.locator('.offers[data-ready]').waitFor({ state: 'attached' });
        await page.evaluate(() => window.scrollTo(0, 0));
        await settle(page);

        // 1. No horizontal page scroll, nothing sticking out of the viewport (top of the page).
        expect.soft(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${at} page scroll`).toBeLessThanOrEqual(0);
        expect.soft(await outOfViewport(page), `${at} elements outside the viewport`).toEqual([]);

        // 2. Header CTA: visible in the header, or behind the menu button (which must itself be reachable).
        const menu = page.locator('.mobile-menu');
        const collapsed = await menu.isVisible();
        if (collapsed) {
          expect.soft(await reachable(page, '.mobile-menu'), `${at} menu button`).toEqual({ inView: true, onTop: true });
          await menu.click();
          await expect(menu).toHaveAttribute('aria-expanded', 'true');
          await expect(page.locator('#navlinks')).toHaveClass(/\bopen\b/);
          await settle(page);
        }
        for (const cta of ['.nav-ctas button', '.nav-ctas a']) {
          await expect(page.locator(cta).first(), `${at} ${cta}`).toBeVisible();
          expect.soft(await reachable(page, cta), `${at} ${cta}`).toEqual({ inView: true, onTop: true });
        }
        if (collapsed) {
          expect.soft(await outOfViewport(page), `${at} open menu outside the viewport`).toEqual([]);
          await page.keyboard.press('Escape');
          await expect(menu).toHaveAttribute('aria-expanded', 'false');
        }

        // 3. The three plan cards: visible and inside the viewport once scrolled to.
        const cards = page.locator('#plans .tier-card');
        await expect(cards, `${at} plan cards`).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
          const card = cards.nth(i);
          await card.scrollIntoViewIfNeeded();
          await expect(card, `${at} card ${i + 1}`).toBeVisible();
          const box = (await card.boundingBox())!;
          expect.soft(box.x, `${at} card ${i + 1} left`).toBeGreaterThanOrEqual(0);
          expect.soft(box.x + box.width, `${at} card ${i + 1} right`).toBeLessThanOrEqual(width + 1);
          await expect.soft(card.locator('[data-testid^="tier-price-"]'), `${at} card ${i + 1} price`).toBeVisible();
        }

        // 4. Whole page, after scrolling through it (lazy and revealed sections included).
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 30));
          }
        });
        await settle(page);
        expect.soft(await outOfViewport(page), `${at} elements outside the viewport (whole page)`).toEqual([]);
      });
    }
  }
});
