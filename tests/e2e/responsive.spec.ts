import { expect, test } from '@playwright/test';
import { RELEASED_LANGS } from './released';

/** Responsive layout: no horizontal scrolling, footer chips never overlap the next footer column, social icons stay inside the page margin. */
const WIDTHS = [320, 375, 768, 1024, 1366, 1440, 1920];
const INFO = ['/about', '/help', '/help/getting-started', '/help/devices', '/help/free-trial', '/help/ordering-payment', '/help/troubleshooting', '/help/contact-support', '/help/refunds'];
const CONTENT = process.env.E2E_CONTENT_PAGES === 'preview';
/** French preview (E2E_SITE_MODE=preview): the same checks on the French pages (longer strings). */
const FR = process.env.E2E_SITE_MODE === 'preview' || RELEASED_LANGS.includes('fr');
/** Phase 8: the other languages (preview build, or released) — home, About, Help hub and one topic each. */
const OTHERS = ['de', 'es', 'it', 'nl', 'sv', 'nb'].filter((l) => process.env.E2E_SITE_MODE === 'preview' || RELEASED_LANGS.includes(l));
const OTHER_PAGES = OTHERS.flatMap((l) => [`/${l}`, ...(CONTENT ? [`/${l}/about`, `/${l}/help`, `/${l}/help/ordering-payment`] : [])]);
const HOMES = ['/', ...(FR ? ['/fr'] : []), ...OTHERS.map((l) => `/${l}`)];
const PAGES = ['/', '/legal/terms', ...(CONTENT ? INFO : []), ...(FR ? ['/fr', ...(CONTENT ? INFO.map((p) => `/fr${p}`) : [])] : []), ...OTHER_PAGES];

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
          // Plan cards (home): each feature stays on one line and its text inside the card.
          const tierOverflow = [...document.querySelectorAll('.tier-card')].flatMap((card) => {
            const cr = card.getBoundingClientRect();
            return [...card.querySelectorAll('.tier-features li')]
              .filter((li) => {
                const text = document.createRange();
                text.selectNodeContents(li);
                return text.getBoundingClientRect().right > cr.right + 1 || li.getBoundingClientRect().height > 30;
              })
              .map((li) => li.textContent?.trim());
          });
          const sectionsRight = Math.max(0, ...[...document.querySelectorAll('main .terms section')].map((e) => e.getBoundingClientRect().right));
          return { tierOverflow, sectionsRight, contentRight, socialRight, sw: document.documentElement.scrollWidth, vw: window.innerWidth, chipsRight: Math.max(...chips.map((c) => c.right)), aboutRight: about.right, nextLeft: next ? next.left : null };
        });
        expect(r.sw, `${path} @${width}px scrollWidth`).toBeLessThanOrEqual(r.vw);
        expect(r.chipsRight, `${path} @${width}px chips`).toBeLessThanOrEqual(r.aboutRight + 1);
        expect(r.socialRight, `${path} @${width}px social icons`).toBeLessThanOrEqual(r.contentRight + 1);
        expect(r.tierOverflow, `${path} @${width}px plan lines wrapped or outside their card`).toEqual([]);
        // New pages only (/about, /help…): sections stay inside the page column (the legal pages are not changed here).
        if (!path.startsWith('/legal') && !HOMES.includes(path)) expect(r.sectionsRight, `${path} @${width}px sections`).toBeLessThanOrEqual(r.contentRight + 1);
        if (r.nextLeft !== null) expect(r.chipsRight, `${path} @${width}px overlap`).toBeLessThanOrEqual(r.nextLeft);
      }
    });
  }
});
