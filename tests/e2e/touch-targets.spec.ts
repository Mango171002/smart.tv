import { expect, test, type Browser, type Page } from '@playwright/test';
import { RELEASED_LANGS } from './released';

/**
 * Phase 13 regression sweep (A-007, with Phase 12 U-013) — on touch screens (phones and tablets, `pointer: coarse`) every
 * control of the home page, the help center, a help topic and the about page has a hit area of at least 44 × 44 px,
 * measured where a finger lands (elementFromPoint around the control's centre), not from its drawn box: several small
 * controls keep their look and get the extra area from padding or an invisible ::after.
 * Exceptions, by design: the 15 carousel dots (44 px tall, narrower: 15 × 44 px cannot fit a phone row), and links inside
 * a sentence (WCAG 2.5.5 inline exception).
 */
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const CONTENT = process.env.E2E_CONTENT_PAGES === 'preview';
const LANGS = ['en', ...['de', 'nb'].filter((l) => PREVIEW || RELEASED_LANGS.includes(l))];
const path = (l: string, p: string) => (l === 'en' ? p || '/' : `/${l}${p}`);

async function touchPage(browser: Browser, width: number, height: number): Promise<Page> {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: width < 768 });
  return ctx.newPage();
}

/** Controls whose hit area is under 44 px (capped probe: 30 px each side of the centre). */
function smallTargets(page: Page, scope: string) {
  return page.evaluate((scope) => {
    const out: string[] = [];
    const vis = (e: Element) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('.sr-only');
    for (const e of document.querySelectorAll<HTMLElement>(`${scope} :is(a[href], button, summary, input, select)`)) {
      if (!vis(e) || e.classList.contains('skip-link') || e.classList.contains('dot')) continue;
      // Links inside a sentence are exempt (inline exception).
      if (e.tagName === 'A' && getComputedStyle(e).display === 'inline' && e.closest('p')) continue;
      // Instant: the page scrolls smoothly (scroll-behavior), the probe must run once the control is in place.
      e.scrollIntoView({ block: 'center', behavior: 'instant' });
      const b = e.getBoundingClientRect();
      if (b.width >= 44 && b.height >= 44) continue;
      const cx = b.left + b.width / 2;
      const cy = b.top + b.height / 2;
      const hit = (x: number, y: number) => { const t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t)); };
      let up = 0, down = 0, left = 0, right = 0;
      while (up < 30 && hit(cx, cy - up - 1)) up++;
      while (down < 30 && hit(cx, cy + down + 1)) down++;
      while (left < 30 && hit(cx - left - 1, cy)) left++;
      while (right < 30 && hit(cx + right + 1, cy)) right++;
      const w = left + right + 1;
      const h = up + down + 1;
      if (w < 44 || h < 44) out.push(`${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]} « ${(e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 24)} » ${Math.round(b.width)}×${Math.round(b.height)} hit ${w}×${h}`);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    return out;
  }, scope);
}

test.describe('touch targets ≥ 44 px on touch screens (A-007, U-013)', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'touch contexts are created explicitly'));
  for (const lang of LANGS) {
    for (const [width, height] of [[375, 812], [768, 1024], [1024, 768]] as const) {
      test(`${lang}@${width}: home page`, async ({ browser }) => {
        const page = await touchPage(browser, width, height);
        await page.goto(path(lang, ''));
        await page.locator('#plans').scrollIntoViewIfNeeded();
        await page.locator('.offers[data-ready]').waitFor({ state: 'attached' });
        expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches), 'touch layout').toBe(true);
        expect(await smallTargets(page, 'body')).toEqual([]);
        // Order window: « Change » in the order summary (prelaunch and open builds).
        await page.locator('.sim-cta').scrollIntoViewIfNeeded();
        await page.locator('.sim-cta').click();
        await page.getByTestId('checkout-dialog').waitFor();
        expect(await smallTargets(page, '[data-testid="checkout-dialog"]')).toEqual([]);
        await page.context().close();
      });
      test(`${lang}@${width}: help center, a help topic, about`, async ({ browser }) => {
        test.skip(!CONTENT, 'needs a build with NEXT_PUBLIC_CONTENT_PAGES=preview');
        const page = await touchPage(browser, width, height);
        for (const p of ['/help', '/help/free-trial', '/about']) {
          await page.goto(path(lang, p));
          expect(await smallTargets(page, 'body'), `${lang}${p}@${width}`).toEqual([]);
        }
        await page.context().close();
      });
    }
  }
});
