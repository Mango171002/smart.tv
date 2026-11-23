import { expect, test } from '@playwright/test';
import { RELEASED_LANGS } from './released';

/** Phase 10: FAQPage JSON-LD on every built home page = the visible FAQ (same questions, same order, page language). */
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const HOMES = ['en', ...['fr', 'de', 'es', 'it', 'nl', 'sv', 'nb'].filter((l) => PREVIEW || RELEASED_LANGS.includes(l))];

test.beforeEach(({ isMobile }) => test.skip(isMobile, 'markup check (desktop only)'));
for (const lang of HOMES) {
  test(`${lang}: FAQPage structured data matches the visible FAQ`, async ({ page }) => {
    await page.goto(lang === 'en' ? '/' : `/${lang}`);
    const lds = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
    const faq = lds.filter((x) => x['@type'] === 'FAQPage');
    expect(faq).toHaveLength(1);
    expect(faq[0].inLanguage).toBe(lang);
    const visible = (await page.locator('#faq summary').allInnerTexts()).map((t) => t.trim());
    expect(faq[0].mainEntity.map((q: { name: string }) => q.name)).toEqual(visible);
    for (const q of faq[0].mainEntity) await expect(page.locator('#faq')).toContainText(q.acceptedAnswer.text.slice(0, 60));
  });
}
