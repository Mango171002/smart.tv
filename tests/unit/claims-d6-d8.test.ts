import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import en, { type Dictionary } from '@/i18n/dictionaries/en';
import fr from '@/i18n/dictionaries/fr';
import de from '@/i18n/dictionaries/de';
import es from '@/i18n/dictionaries/es';
import it_ from '@/i18n/dictionaries/it';
import nl from '@/i18n/dictionaries/nl';
import sv from '@/i18n/dictionaries/sv';
import nb from '@/i18n/dictionaries/nb';
import { prelaunchCopy } from '@/lib/prelaunch-copy';
import { getInfo, infoFor } from '@/content/info';
import type { InfoContentSet, InfoPage } from '@/content/en/info';
import { LEGAL_DOCUMENTS } from '@/content/legal';
import { siteConfig } from '@/config/site';

/**
 * Phase 13 — owner-authorised corrections of unsupported claims (decision register D6, D8; audit C-005, C-010, C-012,
 * C-018). AI drafts in 8 languages, not a native-speaker validation.
 * - D6 content: no « International » label on the highlight tiles, no league, competition or broadcaster name; the
 *   Sports category is « where available in your country ».
 * - D6 devices: the devices bar names device categories, never a platform brand (no app list is verified per platform).
 * - D8 support: « 24/7 » always names the automated assistant (human help when needed), never a « 24/7 support » team,
 *   and no « 24/7 … 6 languages » line.
 * - D8 prelaunch: while online requests are closed, WhatsApp and the phone are not offered as a way to reach us on the
 *   home, About and Help center contact texts (e-mail only); the legal notice keeps every contact detail; open: today's texts.
 */
type Lang = 'en' | 'fr' | 'de' | 'es' | 'it' | 'nl' | 'sv' | 'nb';
const DICTS: Record<Lang, Dictionary> = { en, fr, de, es, it: it_, nl, sv, nb };
const LANGS = Object.keys(DICTS) as Lang[];
const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];

/** The qualifier each language already uses for « where available » (4K, TV guide). */
const WHERE_AVAILABLE: Record<Lang, RegExp> = {
  en: /where available/i, fr: /selon disponibilité/i, de: /je nach Verfügbarkeit/i, es: /según disponibilidad/i,
  it: /dove disponibil[ei]/i, nl: /waar beschikbaar/i, sv: /i mån av tillgång/i, nb: /der tilgjengelig/i,
};
const ASSISTANT = /assistant|assistent|asistente|assistente/i;
const LANGUAGE_COUNT = /\b(6|six|sechs|seis|sei|zes|sex|seks)\s+(languages|langues|Sprachen|idiomas|lingue|talen|språk)/i;
/** The old « 24/7 support » labels (a support team announced as available 24/7). */
const SUPPORT_24_7: Record<Lang, RegExp> = {
  en: /24\/7 support|support 24\/7|24\/7 customer support/i,
  fr: /assistance (client )?24\/7/i,
  de: /24\/7-(Kunden)?support|Support 24\/7/i,
  es: /(soporte|atención al cliente) 24\/7/i,
  it: /assistenza (clienti )?24\/7/i,
  nl: /24\/7 klantenservice|klantenservice 24\/7/i,
  sv: /24\/7-support|(kund)?support 24\/7/i,
  nb: /kundestøtte 24\/7/i,
};
const BRANDS = /android|fire ?tv|apple|\bmac\b|\bios\b|iphone|ipad|google|amazon|roku|samsung|\blg\b|tizen|webos|chromecast|windows/i;
const COMPETITIONS = /\b(NBA|NFL|NHL|MLB|UEFA|FIFA|ATP|WTA|F1|NASCAR|MotoGP|Premier League|Champions League|Ligue 1|La ?Liga|Serie A|Bundesliga|Eredivisie|Allsvenskan|Eliteserien|Super Bowl|Wimbledon|Roland|beIN|CANAL\+|ESPN|DAZN|Sky Sports)\b/i;
const WHATSAPP_OR_PHONE = new RegExp(`WhatsApp|${siteConfig.supportPhone!.replace(/[+ ]/g, (c) => (c === '+' ? '\\+' : '\\s?'))}|7412`, 'i');

const page = (s: InfoContentSet, slug: string) => (slug === 'about' ? s.about : s.topics.find((t) => t.slug === slug)!);
const section = (pg: InfoPage, id: string) => pg.sections.find((x) => x.id === id)!;

describe.each(LANGS)('%s — D6 content claims', (lang) => {
  const d = DICTS[lang];
  it('no « International » label on the highlight tiles: the « where available » qualifier instead, same tiles', () => {
    expect(d.featured.items).toHaveLength(en.featured.items.length);
    expect(d.featured.items.map((i) => i.cat)).toEqual(en.featured.items.map((i) => i.cat));
    for (const item of d.featured.items) {
      expect(item.region, item.title).not.toMatch(/internation/i);
      expect(item.region, item.title).toMatch(WHERE_AVAILABLE[lang]);
    }
    expect(new Set(d.featured.items.map((i) => i.region)).size).toBe(1);
  });

  it('Sports category: generic and « where available in your country »; no league, competition or broadcaster', () => {
    const sports = d.content.categories[0]!;
    expect(sports.text).toMatch(WHERE_AVAILABLE[lang]);
    for (const s of strings([d.featured, d.content, d.plans, d.hero, d.benefits, d.faq, d.footer])) expect(s, s).not.toMatch(COMPETITIONS);
  });
});

describe.each(LANGS)('%s — D6 device claims', (lang) => {
  const d = DICTS[lang];
  it('the devices bar names six device categories, no platform brand', () => {
    expect(d.plans.devicesBar.items).toHaveLength(6);
    for (const item of d.plans.devicesBar.items) expect(item, item).not.toMatch(BRANDS);
    // « Smart TV » is the device category (also the FAQ's first word), not a brand.
    expect(d.plans.devicesBar.items[0]).toBe('Smart TV');
  });

  it('Help › Supported devices names categories only (open and prelaunch)', () => {
    for (const set of [getInfo(lang), infoFor(lang, false)]) expect(strings(page(set, 'devices')).filter((s) => BRANDS.test(s))).toEqual([]);
  });
});

describe.each(LANGS)('%s — D8 support claims', (lang) => {
  const d = DICTS[lang];
  const texts = (ordersOpen: boolean) => strings([prelaunchCopy(d, ordersOpen), infoFor(lang, ordersOpen)]);

  for (const ordersOpen of [false, true]) {
    it(`${ordersOpen ? 'open' : 'prelaunch'}: « 24/7 » always names the automated assistant, never a support team or a language count`, () => {
      // « 24/7 » alone is the value of a fact card whose label names the assistant (checked below).
      const lines = texts(ordersOpen).filter((s) => /24\/7/.test(s) && s !== '24/7');
      expect(lines.length).toBeGreaterThan(10);
      expect(lines.filter((s) => !ASSISTANT.test(s))).toEqual([]);
      expect(texts(ordersOpen).filter((s) => SUPPORT_24_7[lang].test(s))).toEqual([]);
      expect(texts(ordersOpen).filter((s) => /24\/7/.test(s) && LANGUAGE_COUNT.test(s))).toEqual([]);
      const ui = infoFor(lang, ordersOpen).ui;
      for (const f of [...ui.helpFacts, ...ui.aboutFacts].filter((x) => x.v === '24/7')) expect(f.k, f.k).toMatch(ASSISTANT);
    });
  }

  it('home: no language count next to the support line (the six languages stay listed on About / Contact support)', () => {
    const home = strings([d.meta.homeDescription, d.hero, d.benefits, d.plans.trust, d.plans.compare, d.plans.tiers, d.cta, d.prelaunch.home]);
    expect(home.filter((s) => LANGUAGE_COUNT.test(s) || /\b6\b.*(languages|langues|Sprachen|idiomas|lingue|talen|språk)/i.test(s))).toEqual([]);
    expect(page(getInfo(lang), 'contact-support').sections.find((x) => x.id === 'languages')!.body.some((b) => 'chips' in b && b.chips.length === 6)).toBe(true);
  });

  if (lang === 'nl' || lang === 'sv' || lang === 'nb') {
    it('the support-language facts say that human help is in English', () => {
      const re = { nl: /Engels/, sv: /engelska/, nb: /engelsk/ }[lang];
      const ui = getInfo(lang).ui;
      expect(ui.helpFacts[2]!.small).toMatch(re);
      expect(ui.aboutFacts[3]!.small).toMatch(re);
    });
  }
});

describe.each(LANGS)('%s — D8 WhatsApp while online requests are closed', (lang) => {
  const d = DICTS[lang];
  const open = getInfo(lang);
  const closed = infoFor(lang, false);
  const contactBlocks = (s: InfoContentSet) => {
    const cs = page(s, 'contact-support');
    const links = (section(s.about, 'links').body[0] as { links: Array<{ href: string; text: string }> }).links;
    return [
      s.ui.topicContact, s.ui.aboutContact, s.ui.hubContact, s.ui.helpFacts[0]!.small,
      cs.metaTitle, cs.description, cs.summary!, cs.intro, ...strings(section(cs, 'reach').body),
      links.find((l) => l.href.endsWith('/help/contact-support'))!.text,
    ];
  };

  it('prelaunch: the About / Help center contact texts name the e-mail only', () => {
    expect(contactBlocks(closed).filter((s) => WHATSAPP_OR_PHONE.test(s))).toEqual([]);
    expect(strings(section(page(closed, 'contact-support'), 'reach').body)).toEqual([expect.stringContaining(siteConfig.supportEmail!)]);
  });

  it('open: today’s WhatsApp and phone texts are back', () => {
    expect(infoFor(lang, true)).toBe(open);
    const blocks = contactBlocks(open);
    for (const s of [open.ui.topicContact, open.ui.helpFacts[0]!.small, page(open, 'contact-support').metaTitle]) expect(s, s).toMatch(/WhatsApp/);
    expect(blocks.some((s) => s.includes(siteConfig.supportPhone!))).toBe(true);
  });

  it('prelaunch: the home support benefit, guided-setup line and comparison « Support » row drop WhatsApp; open keeps it', () => {
    const [o, c] = [prelaunchCopy(d, true), prelaunchCopy(d, false)];
    const support = (x: Dictionary) => strings(x.plans.compare.rows.find((r) => r.values.every((v) => typeof v === 'string'))!.values);
    for (const s of [c.benefits[4]!.text, c.plans.trust[0]!.text, ...support(c)]) expect(s, s).not.toMatch(WHATSAPP_OR_PHONE);
    for (const s of [o.benefits[4]!.text, o.plans.trust[0]!.text, ...support(o)]) expect(s, s).toMatch(/WhatsApp/);
    expect(o).toBe(d);
  });

  it('the legal notice and the About company facts keep the phone / WhatsApp contact (seller identity)', () => {
    expect(section(closed.about, 'company')).toEqual(section(open.about, 'company'));
    expect(strings(section(closed.about, 'company').body).join(' ')).toContain(siteConfig.supportPhone!);
  });
});

describe('legal pages unchanged by the prelaunch contact rule', () => {
  it('the legal notice lists the phone / WhatsApp number (rendered in every state by LegalContent)', () => {
    expect(strings(LEGAL_DOCUMENTS.imprint.sections).join(' ')).toMatch(/WhatsApp/);
    const legalContent = readFileSync(join(__dirname, '../../src/components/LegalContent.tsx'), 'utf8');
    expect(legalContent).toMatch(/const phone = siteConfig\.supportPhone;/);
    expect(legalContent).not.toMatch(/isContactFormEnabled|ordersOpen/);
  });

  it('the Help / About contact box hides the phone only when asked (pages pass isContactFormEnabled())', () => {
    const src = readFileSync(join(__dirname, '../../src/components/InfoContent.tsx'), 'utf8');
    expect(src).toMatch(/const phone = showPhone \? siteConfig\.supportPhone : null;/);
    for (const f of ['about/page.tsx', 'help/page.tsx', 'help/[topic]/page.tsx']) {
      expect(readFileSync(join(__dirname, `../../src/app/[locale]/${f}`), 'utf8'), f).toMatch(/<InfoContent [^>]*phone=\{ordersOpen\}/);
    }
  });
});

describe.each(LANGS)('%s — prelaunch search snippets', (lang) => {
  it('every page title fits with the brand (≤ 60) and every description is 70–155 characters, open and closed', () => {
    for (const set of [getInfo(lang), infoFor(lang, false)]) {
      for (const pg of [set.about, ...set.topics]) {
        expect(`${pg.metaTitle} | SYGMA TV+`.length, pg.metaTitle).toBeLessThanOrEqual(60);
        expect(pg.description.length, pg.description).toBeGreaterThanOrEqual(70);
        expect(pg.description.length, pg.description).toBeLessThanOrEqual(155);
      }
    }
  });

  it('Getting started, Free trial, Ordering and Refunds descriptions and the About « Who we are » paragraph change while closed (S13-003)', () => {
    const [o, c] = [getInfo(lang), infoFor(lang, false)];
    for (const slug of ['getting-started', 'free-trial', 'ordering-payment', 'refunds']) expect(page(c, slug).description, slug).not.toBe(page(o, slug).description);
    expect(page(c, 'free-trial').description).toContain('24');
    expect(section(c.about, 'who').body[1]).not.toEqual(section(o.about, 'who').body[1]);
    // Refunds: the refund and withdrawal figures are kept as they are.
    const figures = (x: string) => x.match(/\d+/g);
    expect(figures(page(c, 'refunds').description)).toEqual(figures(page(o, 'refunds').description));
  });
});

/** S13-004: the publisher of the site, in visible text on every page (footer), from the same facts as the About page. */
describe.each(LANGS)('%s — footer legal entity line', (lang) => {
  it('names SYGMA TV+, the entity placeholder and the About page location', () => {
    const f = DICTS[lang].footer.entity;
    expect(f.startsWith('SYGMA TV+ ')).toBe(true);
    expect(f).toContain('{entity}');
    const location = getInfo(lang).ui.aboutFacts[1]!.small;
    expect(f).toContain(location);
    expect(f.replace('{entity}', siteConfig.legalEntity!).length).toBeLessThanOrEqual(80);
  });
});

it('the footer renders the entity line from the site configuration', () => {
  const src = readFileSync(join(__dirname, '../../src/components/Footer.tsx'), 'utf8');
  expect(src).toMatch(/f\.entity\.replace\('\{entity\}', siteConfig\.legalEntity\)/);
  expect(siteConfig.legalEntity).toBe('Sygma TV LLC');
});
