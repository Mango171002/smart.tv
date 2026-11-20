import { expect, test } from '@playwright/test';

/** Responsive layout: no horizontal scrolling, footer chips never overlap the next footer column, social icons stay inside the page margin. */
const WIDTHS = [320, 375, 768, 1024, 1366, 1440, 1920];
const PAGES = ['/', '/legal/terms', ...(process.env.E2E_CONTENT_PAGES === 'preview' ? ['/about', '/help', '/help/ordering-payment'] : [])];

test.describe('responsive layout', () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'widths are set explicitly (desktop project)'));
  for (const path of PAGES) {
    test(`${path}: 7 widths, no horizontal overflow, footer chips inside their column`, async ({ page }) => {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const r = await page.evaluate(() => {
          const grid = document.querySelector('.footer-grid')!;
          const cols = [...grid.children].map((e) => e.getBoundingClientRect());
          const about = document.querySelector('.footer-about')!.getBoundingClientRect();
          const chips = [...document.querySelectorAll('.footer-chips li')].map((e) => e.getBoundingClientRect());
          const next = cols.find((c) => c.left >= about.right - 1 && Math.abs(c.top - about.top) < 40);
          const wrap = document.querySelector('.footer .wrap')!;
          const contentRight = wrap.getBoundingClientRect().right - parseFloat(getComputedStyle(wrap).paddingRight);
          const socialRight = Math.max(...[...document.querySelectorAll('.footer-social li')].map((e) => e.getBoundingClientRect().right));
          return { contentRight, socialRight, sw: document.documentElement.scrollWidth, vw: window.innerWidth, chipsRight: Math.max(...chips.map((c) => c.right)), aboutRight: about.right, nextLeft: next ? next.left : null };
        });
        expect(r.sw, `${path} @${width}px scrollWidth`).toBeLessThanOrEqual(r.vw);
        expect(r.chipsRight, `${path} @${width}px chips`).toBeLessThanOrEqual(r.aboutRight + 1);
        expect(r.socialRight, `${path} @${width}px social icons`).toBeLessThanOrEqual(r.contentRight + 1);
        if (r.nextLeft !== null) expect(r.chipsRight, `${path} @${width}px overlap`).toBeLessThanOrEqual(r.nextLeft);
      }
    });
  }
});
