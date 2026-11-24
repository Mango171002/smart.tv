import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import en, { type Dictionary } from '@/i18n/dictionaries/en';
import fr from '@/i18n/dictionaries/fr';
import de from '@/i18n/dictionaries/de';
import es from '@/i18n/dictionaries/es';
import it_ from '@/i18n/dictionaries/it';
import nl from '@/i18n/dictionaries/nl';
import sv from '@/i18n/dictionaries/sv';
import nb from '@/i18n/dictionaries/nb';
import { prelaunchCopy } from '@/lib/prelaunch-copy';
import { siteEntityFacts, StructuredData } from '@/components/StructuredData';
import { getInfo, helpTopicFor, infoFor } from '@/content/info';
import type { InfoPage } from '@/content/en/info';
import { LOCALES } from '@/i18n/config';

/**
 * Prelaunch consistency (phase 12): while online orders are closed (FEATURE_CONTACT_FORM=false) no text of the home,
 * About or Help center pages presents ordering, a free trial or activation as available now. Open: every text is
 * exactly today's (the dictionaries and content are untouched; the variants are only selected while closed).
 */
type Lang = 'en' | 'fr' | 'de' | 'es' | 'it' | 'nl' | 'sv' | 'nb';
const DICTS: Record<Lang, Dictionary> = { en, fr, de, es, it: it_, nl, sv, nb };
const LANGS = Object.keys(DICTS) as Lang[];
const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
/** Prices, dates and guarantee / refund wording (none may appear in a new prelaunch text). */
const NO_PRICE_DATE_GUARANTEE = /\$|USD|\d{1,2}[./]\d{1,2}|guarant|garant|rembours|reembolso|rimborsat|geld-terug|pengarna|pengene|refund|erstatt/i;

describe.each(LANGS)('%s: home copy while closed', (lang) => {
  const d = DICTS[lang];
  const p = d.prelaunch;
  const closed = prelaunchCopy(d, false);

  it('open: the dictionary itself, unchanged', () => {
    expect(prelaunchCopy(d, true)).toBe(d);
  });

  it('simulator button « Orders opening soon », closing-banner button « Free trials opening soon »', () => {
    expect(closed.plans.previewCheckout).toBe(`${p.orderTitleA} ${p.orderTitleHl}`);
    expect(closed.cta.trial).toBe(`${p.trialTitleA} ${p.trialTitleHl}`);
    expect(closed.plans.previewCheckout).not.toBe(d.plans.previewCheckout);
  });

  it('meta description: the prelaunch one, 70–155 characters, no « 24/7 … 6 languages » claim', () => {
    expect(closed.meta.homeDescription).toBe(p.metaDescription);
    expect(p.metaDescription.length).toBeGreaterThanOrEqual(70);
    expect(p.metaDescription.length).toBeLessThanOrEqual(155);
    expect(p.metaDescription).not.toMatch(/24\/7|\b6\b/);
    expect(p.metaDescription).not.toMatch(/sport/i);
  });

  it('hero, benefits, « How it works », simulator point, closing banner: prelaunch variants', () => {
    const h = p.home;
    expect(closed.hero.lead).toBe(h.heroLead);
    expect(closed.benefits[0]).toEqual({ title: h.orderBenefitTitle, text: h.orderBenefitText });
    expect(closed.benefits[3]).toEqual({ ...d.benefits[3], text: h.trialBenefitText });
    // Support benefit: the « 24/7 assistant » title is kept, its line names the e-mail only (no WhatsApp while closed).
    expect(closed.benefits[4]).toEqual({ ...d.benefits[4], text: h.supportBenefitText });
    expect([1, 2].map((i) => closed.benefits[i])).toEqual([1, 2].map((i) => d.benefits[i]));
    expect(closed.how.steps.map((s) => s.title)).toEqual(d.how.steps.map((s) => s.title));
    expect(closed.how.steps.map((s) => s.text)).toEqual([d.how.steps[0]!.text, h.orderStepText, h.activationStepText, d.how.steps[3]!.text]);
    expect(closed.how.note).toBe(h.howNote);
    expect(closed.plans.simulatorPoints).toEqual([...d.plans.simulatorPoints.slice(0, 3), h.trialGuarantee]);
    expect(closed.cta.text2).toBe(h.trialGuarantee);
    // Same short-label limits as the open texts (features bar).
    for (const b of closed.benefits) { expect(b.title.length, b.title).toBeLessThanOrEqual(20); expect(b.text.length, b.text).toBeLessThanOrEqual(35); } // 35: same limit as translations.test.ts (Phase 12 copy polish)
  });

  it('FAQ: answers 1, 2 and 3 replaced, questions and the other answers unchanged', () => {
    expect(closed.faq.items.map((i) => i.a)).toEqual([p.faqSubscribe, p.faqCountries, p.faqDevices, ...d.faq.items.slice(3).map((i) => i.a)]);
    expect(closed.faq.items.map((i) => i.q)).toEqual(d.faq.items.map((i) => i.q));
  });

  it('nothing else changes (prices, refunds, legal, checkout, footer…)', () => {
    const changed = new Set(['meta', 'hero', 'benefits', 'plans', 'how', 'cta', 'faq']);
    for (const k of Object.keys(d) as Array<keyof Dictionary>) if (!changed.has(k)) expect(closed[k], k).toBe(d[k]);
    const plansChanged = new Set(['previewCheckout', 'simulatorPoints', 'trust', 'compare']);
    for (const k of Object.keys(d.plans) as Array<keyof Dictionary['plans']>) if (!plansChanged.has(k)) expect(closed.plans[k], k).toBe(d.plans[k]);
    // Trust bar: only the guided-setup line (WhatsApp not offered as a channel); comparison table: only the « Support » row.
    expect(closed.plans.trust).toEqual([{ ...d.plans.trust[0]!, text: d.prelaunch.home.setupText }, ...d.plans.trust.slice(1)]);
    const rows = d.plans.compare.rows;
    const support = rows.findIndex((r) => r.values.every((v) => typeof v === 'string'));
    expect(support).toBe(rows.length - 1);
    expect(closed.plans.compare.rows).toEqual(rows.map((r, i) => (i === support ? { ...r, values: r.values.map(() => d.prelaunch.home.compareSupport) } : r)));
    expect({ ...closed.plans.compare, rows }).toEqual(d.plans.compare);
    expect({ ...closed.meta, homeDescription: d.meta.homeDescription }).toEqual(d.meta);
    expect({ ...closed.cta, trial: d.cta.trial, text2: d.cta.text2 }).toEqual(d.cta);
  });

  it('the new home strings carry no price, date or guarantee (the kept guarantee lines aside)', () => {
    const { howNote, trialGuarantee, ...rest } = p.home;
    const fresh = [...strings(rest), p.faqCountries, p.faqDevices, p.metaDescription, p.pagesTitle, p.pagesText, p.orderText];
    // « 24/7 » (the automated assistant) is not a date.
    expect(fresh.filter((s) => NO_PRICE_DATE_GUARANTEE.test(s.replace(/24\/7/g, '')))).toEqual([]);
    expect([howNote, trialGuarantee].filter((s) => /\$|USD|\d{1,2}[./]\d{1,2}/.test(s))).toEqual([]);
  });

  it('order window text: the summary box keeps its name; German avoids « abgebucht »', () => {
    expect(p.orderText).toMatch(new RegExp(d.checkout.summary.title.replace(/^(Votre|Ihre|Tu|La tua|Je|Ditt|Your) /, ''), 'i'));
    if (lang === 'de') expect(p.orderText).not.toMatch(/abgebucht/);
  });
});

describe('Organization / WebSite JSON-LD: one entity, one value', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });
  const graph = (el: ReactElement) => JSON.parse((el.props as { dangerouslySetInnerHTML: { __html: string } }).dangerouslySetInnerHTML.__html)['@graph'] as Array<Record<string, unknown>>;

  for (const ordersOpen of [false, true]) {
    it(`${ordersOpen ? 'open' : 'closed'}: the English description and the same WebSite languages on every language's home`, () => {
      const description = ordersOpen ? en.meta.homeDescription : en.prelaunch.metaDescription;
      expect(siteEntityFacts(ordersOpen).description).toBe(description);
      for (const lang of LANGS) {
        const items = prelaunchCopy(DICTS[lang], ordersOpen).faq.items;
        const g = graph(StructuredData({ ordersOpen, locale: lang as (typeof LOCALES)[number], faq: { items, pageUrl: `https://sygmatv.com/${lang}` } }) as ReactElement);
        const node = (t: string) => g.find((n) => n['@type'] === t)!;
        expect(node('Organization').description, lang).toBe(description);
        expect(node('WebSite').description, lang).toBe(description);
        expect(node('WebSite').inLanguage, lang).toEqual(LOCALES.map((l) => l));
        // FAQPage stays per page and per language: the visible FAQ of that page.
        expect(node('FAQPage').inLanguage).toBe(lang);
        expect((node('FAQPage').mainEntity as Array<{ acceptedAnswer: { text: string } }>).map((q) => q.acceptedAnswer.text)).toEqual(items.map((i) => i.a));
        expect(g.map((n) => n['@type'])).toEqual(['Organization', 'WebSite', 'FAQPage']);
      }
    });
  }

  it('WebSite inLanguage lists every language the build serves (all eight in the preview build)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_MODE', 'preview');
    vi.resetModules();
    const mod = await import('@/components/StructuredData');
    expect([...mod.siteEntityFacts(false).inLanguage].sort()).toEqual(['de', 'en', 'es', 'fr', 'it', 'nb', 'nl', 'sv']);
  });
});

describe.each(LANGS)('%s: About and Help center while closed', (lang) => {
  const open = getInfo(lang);
  const closed = infoFor(lang, false);
  const page = (s: typeof open, slug: string) => (slug === 'about' ? s.about : s.topics.find((t) => t.slug === slug)!);
  const section = (pg: InfoPage, id: string) => pg.sections.find((s) => s.id === id)!;

  it('open: exactly the written content', () => {
    expect(infoFor(lang, true)).toBe(open);
    expect(helpTopicFor(lang, 'free-trial', true)).toBe(open.topics.find((t) => t.slug === 'free-trial'));
  });

  it('only About, Getting started, Devices, Free trial, Ordering and payment, Contact support and the Refunds description change', () => {
    const changed = ['about', 'getting-started', 'devices', 'free-trial', 'ordering-payment', 'contact-support', 'refunds'];
    for (const t of open.topics) if (!changed.includes(t.slug)) expect(page(closed, t.slug), t.slug).toBe(t);
    expect(closed.hub).toBe(open.hub);
    // Interface: the trial button, the topic contact text and the first Help center fact (no WhatsApp while closed).
    expect({ ...closed.ui, actions: open.ui.actions, topicContact: open.ui.topicContact, helpFacts: open.ui.helpFacts }).toEqual(open.ui);
    expect(closed.ui.topicContact).toBe(open.ui.prelaunch.topicContact);
    expect(closed.ui.helpFacts).toEqual([{ ...open.ui.helpFacts[0]!, small: open.ui.prelaunch.availability }, ...open.ui.helpFacts.slice(1)]);
    for (const t of [closed.ui.topicContact, closed.ui.helpFacts[0]!.small]) expect(t).not.toMatch(/WhatsApp|\+\d/);
    expect(open.ui.topicContact).toMatch(/WhatsApp/);
    expect(closed.ui.actions.trial).toBe(`${DICTS[lang].prelaunch.trialTitleA} ${DICTS[lang].prelaunch.trialTitleHl}`);
    // Refunds (phase 13, S13-003): only the « free trial first » fragment of the search description changes; every
    // section (guarantee, withdrawal, how to ask) is untouched.
    const [ro, rc] = [page(open, 'refunds'), page(closed, 'refunds')];
    expect({ ...rc, description: ro.description }).toEqual(ro);
    expect(rc.sections).toEqual(ro.sections);
    expect(rc.description).not.toBe(ro.description);
    const common = (a: string, b: string) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; let j = 0; while (j < a.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++; return [a.slice(i, a.length - j), b.slice(i, b.length - j)]; };
    const [was = '', now = ''] = common(ro.description, rc.description);
    // One short fragment differs (the trial), the refund and withdrawal figures around it are identical.
    expect(was.length, was).toBeLessThanOrEqual(30);
    expect(now.length, now).toBeLessThanOrEqual(35);
    expect(`${was} ${now}`).not.toMatch(/\d/);
  });

  it('About: the trial invitation becomes « Free trials are opening soon », the rest of the section is kept', () => {
    const [o, c] = [section(open.about, 'how'), section(closed.about, 'how')];
    expect(c.title).toBe(o.title);
    expect(c.body.slice(0, 2)).toEqual(o.body.slice(0, 2));
    expect(c.body).toHaveLength(3);
    expect(c.body[2]).not.toEqual(o.body[2]);
  });

  it('Getting started intro, Free trial request, Ordering steps titled « How ordering will work »', () => {
    expect(page(closed, 'getting-started').intro).not.toBe(page(open, 'getting-started').intro);
    const trial = section(page(closed, 'free-trial'), 'request');
    expect(trial.title).toBe(section(page(open, 'free-trial'), 'request').title);
    expect(trial.body.map((b) => Object.keys(b)[0])).toEqual(['p']);
    const [o, c] = [section(page(open, 'ordering-payment'), 'order'), section(page(closed, 'ordering-payment'), 'order')];
    expect(c.title).not.toBe(o.title);
    expect(c.body[1]).toEqual(o.body[1]);
    expect(strings(c.body[0])).not.toEqual(strings(o.body[0]));
  });

  it('Contact support: e-mail only while closed (no contact form, WhatsApp or phone); open: all three kept', () => {
    const [o, c] = [page(open, 'contact-support'), page(closed, 'contact-support')];
    const list = (pg: InfoPage) => (section(pg, 'reach').body[0] as { list: string[] }).list;
    expect(list(o)).toHaveLength(3);
    expect(list(o)[1]).toMatch(/WhatsApp/);
    expect(list(c)).toEqual(list(o).slice(0, 1));
    expect(list(c)[0]).toContain('support@sygmatv.com');
    expect(c.description).not.toBe(o.description);
    expect(c.description.length).toBeGreaterThanOrEqual(70);
    expect(c.description.length).toBeLessThanOrEqual(155);
    expect(`${c.metaTitle} | SYGMA TV+`.length).toBeLessThanOrEqual(60);
    for (const t of [c.metaTitle, c.description, c.summary!, c.intro, ...strings(c.sections)]) expect(t, t).not.toMatch(/WhatsApp|\+44|7412/);
    for (const t of [o.metaTitle, o.description, o.summary!, o.intro]) expect(t, t).toMatch(/WhatsApp/);
  });

  it('Devices: the free-trial invitation becomes « Free trials are opening soon »', () => {
    const [o, c] = [page(open, 'devices'), page(closed, 'devices')];
    expect(c.intro).not.toBe(o.intro);
    expect(section(c, 'check').title).toBe(section(o, 'check').title);
    expect(strings(section(c, 'check').body)).not.toEqual(strings(section(o, 'check').body));
    expect(c.sections.filter((s) => s.id !== 'check')).toEqual(o.sections.filter((s) => s.id !== 'check'));
  });

  it('About: « you can test the service with a free trial » becomes « opening soon »; the Contact support link names the e-mail only', () => {
    const [o, c] = [section(open.about, 'who'), section(closed.about, 'who')];
    expect(c.body[0]).toEqual(o.body[0]);
    expect(c.body[1]).not.toEqual(o.body[1]);
    const contact = (pg: InfoPage) => (section(pg, 'links').body[0] as { links: Array<{ href: string; text: string }> }).links;
    expect(contact(closed.about).map((l) => l.href)).toEqual(contact(open.about).map((l) => l.href));
    const cs = (pg: InfoPage) => contact(pg).find((l) => l.href.endsWith('/help/contact-support'))!.text;
    expect(cs(open.about)).toMatch(/WhatsApp/);
    expect(cs(closed.about)).not.toMatch(/WhatsApp/);
    // Company facts (seller identity) keep the phone / WhatsApp number in both states.
    expect(section(closed.about, 'company')).toEqual(section(open.about, 'company'));
    expect(strings(section(closed.about, 'company').body).join(' ')).toContain('+44 7412 857594');
  });

  it('the prelaunch variants exist in every language and add no price, date or guarantee', () => {
    const variants = [open.about, ...open.topics].filter((pg) => pg.prelaunch).map((pg) => pg.slug);
    expect(variants).toEqual(['about', 'getting-started', 'devices', 'free-trial', 'ordering-payment', 'contact-support', 'refunds']);
    // New wording only: a variant may repeat a block of the open page as it is (e.g. the About « Useful links », whose
    // Refunds link keeps its open label), but no text it adds carries a price, a date or a guarantee.
    const openText = new Set(strings([open.about, ...open.topics].map(({ prelaunch: _p, ...pg }) => pg)));
    // The Refunds description keeps its open refund / withdrawal wording around the changed trial fragment (checked above).
    const text = strings([open.about, ...open.topics].filter((pg) => pg.slug !== 'refunds').map((pg) => pg.prelaunch)).filter((s) => !openText.has(s));
    expect(text.length).toBeGreaterThanOrEqual(10);
    // « 24/7 » is the support line kept from the open description, not a date.
    expect(text.filter((s) => NO_PRICE_DATE_GUARANTEE.test(s.replace(/24\/7/g, '')))).toEqual([]);
  });
});
