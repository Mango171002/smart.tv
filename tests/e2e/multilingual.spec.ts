import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import en from '../../src/i18n/dictionaries/en';
import de from '../../src/i18n/dictionaries/de';
import es from '../../src/i18n/dictionaries/es';
import it from '../../src/i18n/dictionaries/it';
import nl from '../../src/i18n/dictionaries/nl';
import sv from '../../src/i18n/dictionaries/sv';
import nb from '../../src/i18n/dictionaries/nb';
import { RELEASED_LANGS, expectedSet, ORDERS_OPEN } from './released';

/**
 * Phase 8 — German, Spanish, Italian, Dutch, Swedish, Norwegian Bokmål.
 * Production build: none of them exists (/de… → 404, no link, no sitemap entry).
 * Preview build (E2E_SITE_MODE=preview): built, noindex, no hreflang. Released (E2E_RELEASED=…,de,…): indexable, hreflang.
 */
const DICTS = { de, es, it, nl, sv, nb } as const;
type Lang = keyof typeof DICTS;
const PREVIEW = process.env.E2E_SITE_MODE === 'preview';
const CONTENT = process.env.E2E_CONTENT_PAGES === 'preview';
const BUILT = (Object.keys(DICTS) as Lang[]).filter((l) => PREVIEW || RELEASED_LANGS.includes(l));
const OG: Record<Lang, string> = { de: 'de_DE', es: 'es_ES', it: 'it_IT', nl: 'nl_NL', sv: 'sv_SE', nb: 'nb_NO' };
/** English sentences that must never appear on a translated page. */
const ENGLISH_MARKERS = [en.hero.lead, en.plans.sub, en.faq.title, en.footer.about, en.cta.text2, en.how.sub, en.nav.getStarted, en.prelaunch.home.heroLead, en.prelaunch.home.trialGuarantee, en.prelaunch.pagesText];

test.describe('other languages — production build (not built)', () => {
  test.skip(BUILT.length > 0, 'production-mode checks');
  test('/de, /es, /it, /nl, /sv, /nb are not served: their URLs redirect to English (rollback safety); no link, no sitemap entry', async ({ page, request }) => {
    for (const l of Object.keys(DICTS)) {
      for (const [from, to] of [[`/${l}`, '/'], [`/${l}/help`, CONTENT ? '/help' : '/#faq'], [`/${l}/legal/terms`, '/legal/terms']] as const) {
        const res = await request.get(from, { maxRedirects: 0 });
        expect(res.status(), from).toBe(308);
        expect(res.headers()['location'], from).toBe(to);
      }
    }
    await page.goto('/');
    await expect(page.locator('a[href^="/de"], a[href^="/es"], a[href^="/it"], a[href^="/nl"], a[href^="/sv"], a[href^="/nb"]')).toHaveCount(0);
    expect(await (await request.get('/sitemap.xml')).text()).not.toMatch(/\/(de|es|it|nl|sv|nb)[/<]/);
  });
});

for (const lang of BUILT) {
  const d = DICTS[lang];
  const released = RELEASED_LANGS.includes(lang);
  const pages = [`/${lang}`, `/${lang}/blog`, ...(CONTENT ? [`/${lang}/about`, `/${lang}/help`, `/${lang}/help/getting-started`, `/${lang}/help/ordering-payment`, `/${lang}/help/refunds`] : [])];

  test.describe(`${lang} — ${released ? 'released' : 'preview'}`, () => {
    for (const path of pages) {
      test(`${path}: language, canonical, robots, hreflang, links, structured data, no English left`, async ({ page }) => {
        const res = await page.goto(path);
        expect(res?.status()).toBe(200);
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${path}$`));
        await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', OG[lang]);
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        const title = await page.title();
        expect(title.length, title).toBeLessThanOrEqual(60);
        // Indexable once released: the home (the blog is noindex; About / Help are noindex in « preview » content mode).
        const indexable = released && path === `/${lang}`;
        if (released) {
          expect(res?.headers()['x-robots-tag']).toBeUndefined();
        } else {
          expect(res?.headers()['x-robots-tag']).toBe('noindex, nofollow');
          await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
        }
        if (indexable) {
          const set = Object.fromEntries(await page.locator('link[rel="alternate"][hreflang]').evaluateAll((ls) => ls.map((l) => [l.getAttribute('hreflang'), new URL(l.getAttribute('href')!).pathname])));
          expect(set).toEqual(expectedSet(''));
        } else if (!released) {
          await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
        }
        // Internal links stay in the language, except the English legal pages (marked hreflang="en").
        const hrefs = await page.locator(':is(main, header, footer) a[href^="/"]:not([data-lang-switcher] a)').evaluateAll((as) => as.map((a) => [a.getAttribute('href') ?? '', a.getAttribute('hreflang')] as const));
        for (const [href, hl] of hrefs) {
          if (href.startsWith('/legal/')) { expect(hl, href).toBe('en'); continue; }
          expect(href, href).toMatch(new RegExp(`^/${lang}(/|#|$)`));
        }
        for (const ld of (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t))) {
          for (const node of ld['@graph'] ?? [ld]) {
            // The WebSite is one entity on every language's home: it lists every language the build serves.
            if (node['@type'] === 'WebSite') expect(node.inLanguage).toEqual(expect.arrayContaining(['en', lang]));
            else if (node.inLanguage) expect(node.inLanguage).toBe(lang);
          }
        }
        const text = await page.locator('body').innerText();
        for (const m of ENGLISH_MARKERS) expect(text, `English left: ${m}`).not.toContain(m);
        // Phase 12: the footer FAQ link is in the language (« Help / FAQ », or footer.faq once the Help center is published).
        await expect(page.locator(`footer a[href="/${lang}#faq"]`)).toHaveText(CONTENT ? d.footer.faq : d.footer.helpFaq);
      });
    }

    test('order window in the language, price in USD, submission sends the language (intercepted, nothing sent)', async ({ page }) => {
      test.skip(!ORDERS_OPEN, 'online requests closed in this build (prelaunch): covered by prelaunch.spec.ts');
      let sent: Record<string, unknown> | null = null;
      await page.route('**/api/contact', async (route) => { sent = route.request().postDataJSON(); await route.fulfill({ status: 201, json: { ok: true } }); });
      await openPlans(page, `/${lang}`);
      await page.getByRole('button', { name: new RegExp(`^${escape(d.plans.previewCheckout)}`) }).click();
      const dialog = page.getByTestId('checkout-dialog');
      await expect(dialog).toContainText(d.checkout.headHl);
      await dialog.getByLabel(d.checkout.emailLabel).fill('staging-check@example.test');
      // Named by its visible <label> in every language (regression guard for the country picker's accessible name).
      await expect(dialog.getByRole('button', { name: d.checkout.regionLabel, exact: true })).toBeVisible();
      await dialog.getByLabel(d.checkout.regionLabel).click();
      const country = new Intl.DisplayNames([lang], { type: 'region' }).of('CH')!;
      await dialog.getByRole('combobox', { name: d.common.countrySearch }).fill(country);
      await page.keyboard.press('Enter');
      await dialog.getByLabel(d.checkout.phoneLabel).fill('79 123 45 67');
      await dialog.getByLabel(d.checkout.deviceLabel).selectOption('ios_mobile');
      await dialog.getByLabel(d.checkout.consentLabel.slice(0, 20), { exact: false }).check();
      await dialog.getByRole('button', { name: new RegExp(escape(d.checkout.review)) }).click();
      await expect(dialog.getByTestId('quote-status')).toHaveText(new RegExp(escape(d.checkout.verified)));
      await expect(dialog.getByTestId('review-price')).toHaveText(/USD/);
      await expect(dialog.getByTestId('review-region')).toContainText(country);
      await dialog.getByRole('button', { name: new RegExp(escape(d.checkout.finish)) }).click();
      await expect(dialog.getByRole('heading', { name: new RegExp(escape(d.checkout.doneTitle.replace(/[\s ]*[!¡]+/g, '').trim())) })).toBeVisible();
      expect(sent).toMatchObject({ kind: 'launch_waitlist', locale: lang, country: 'CH', consent: true });
    });

    test('404 in the language (HTTP 404) and legal URLs → English legal pages', async ({ page, request }) => {
      const raw = await request.get(`/${lang}/nope`);
      expect(raw.status()).toBe(404);
      // Server HTML, without JavaScript (phase 13): the language document, its title, H1 and noindex — not an empty shell.
      const html = await raw.text();
      expect(html).toMatch(new RegExp(`<html[^>]*\\blang="${lang}"`));
      expect(html).not.toContain('__next_error__');
      expect(html).toContain(`<title>${d.notFound.metaTitle} | SYGMA TV+</title>`);
      expect(html.replace(/<!-- -->/g, '')).toMatch(new RegExp(`<h1[^>]*>${d.notFound.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h1>`));
      expect(html).toMatch(/<meta name="robots" content="noindex[^"]*"/);
      expect(html).not.toContain('rel="canonical"');
      const res = await page.goto(`/${lang}/nope`);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(d.notFound.title);
      const legal = await request.get(`/${lang}/legal/privacy`, { maxRedirects: 0 });
      expect([307, 308]).toContain(legal.status());
      expect(legal.headers()['location']).toBe('/legal/privacy');
    });

    for (const path of [`/${lang}`, ...(CONTENT ? [`/${lang}/help`] : [])]) {
      test(`${path}: no accessibility violation (axe, WCAG 2.1 AA)`, async ({ page }) => {
        if (path === `/${lang}`) await openPlans(page, path); else await page.goto(path);
        await page.evaluate(() => window.scrollTo(0, 0));
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
      });
    }
  });
}

async function openPlans(page: Page, path: string) {
  await page.goto(path);
  await page.locator('#plans').scrollIntoViewIfNeeded();
  await page.locator('.offers[data-ready]').waitFor();
}
function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
