import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import en, { type Dictionary } from '@/i18n/dictionaries/en';
import { ABOUT, HELP_HUB, HELP_TOPICS, INFO_UI, OWNER_FACTS, type InfoContentSet, type InfoPage } from '@/content/en/info';

/**
 * Phase 8 — quality gate for every additional language (de, es, it, nl, sv, nb). Runs for each language whose files
 * exist: src/i18n/dictionaries/<lang>.ts (default export: Dictionary; named export notFoundText) and
 * src/content/<lang>/info.ts (named exports INFO: InfoContentSet and OWNER_FACTS).
 * Brief: docs/i18n/phase8-translation-brief.md.
 */
const ROOT = join(__dirname, '..', '..');
type Dict = Dictionary;

/** Per-language rules (validated choices, see the brief). */
const RULES: Record<string, { qualifier: RegExp; sport: RegExp; claims: RegExp[]; price: RegExp; reviewed: string }> = {
  de: { qualifier: /je nach Verfügbarkeit/, sport: /sport/i, claims: [/\bbeste[nrsm]?\b/i, /live-?sport/i, /internationale (sender|kanäle)/i], price: /^\d+(,\d{2})? USD$/, reviewed: '20. November 2026' },
  es: { qualifier: /según disponibilidad/, sport: /deport/i, claims: [/\bmejor(es)?\b/i, /deportes? en directo/i, /canales internacionales/i], price: /^\d+(,\d{2})? USD$/, reviewed: '20 de noviembre de 2026' },
  it: { qualifier: /dove disponibile/, sport: /sport/i, claims: [/\bmiglior[ei]?\b/i, /sport in diretta/i, /canali internazionali/i], price: /^\d+(,\d{2})? USD$/, reviewed: '20 novembre 2026' },
  nl: { qualifier: /waar beschikbaar/, sport: /sport/i, claims: [/\bbeste\b/i, /live ?sport/i, /internationale (zenders|kanalen)/i], price: /^USD \d+(,\d{2})?$/, reviewed: '20 november 2026' },
  sv: { qualifier: /i mån av tillgång/, sport: /sport/i, claims: [/\bbästa\b/i, /live ?sport/i, /internationella kanaler/i], price: /^\d+(,\d{2})? USD$/, reviewed: '20 november 2026' },
  nb: { qualifier: /der tilgjengelig/, sport: /sport/i, claims: [/\bbeste\b/i, /direktesendt sport|live ?sport/i, /internasjonale kanaler/i], price: /^\d+(,\d{2})? USD$/, reviewed: '20. november 2026' },
};
const COMMON_CLAIMS = [/\d{1,3}[ .,  ]\d{3}\b/, /\breplay\b/i, /\bvip\b/i, /\biptv\b/i];

/** I18N_LANG=de limits the run to one language (parallel work). */
const ONLY = process.env.I18N_LANG;
const LANGS = Object.keys(RULES).filter((l) => !ONLY || l === ONLY).filter((l) => existsSync(join(ROOT, `src/i18n/dictionaries/${l}.ts`)) || existsSync(join(ROOT, `src/content/${l}/info.ts`)));

const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const nums = (s: string) => (s.replace(/\{\w+\}/g, '').match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(',', '.')).sort().join(' ');

/** Same keys, array lengths, placeholders, non-text values and figures as the English source. */
function compare(a: unknown, b: unknown, path: string, out: string[], figures = true): void {
  if (typeof a === 'string') {
    if (typeof b !== 'string') { out.push(`${path}: not a string`); return; }
    if (!b.trim()) out.push(`${path}: empty`);
    if (placeholders(a).join() !== placeholders(b).join()) out.push(`${path}: placeholders ${placeholders(b)} ≠ ${placeholders(a)}`);
    if (figures && nums(a) !== nums(b)) out.push(`${path}: figures [${nums(b)}] ≠ English [${nums(a)}]`);
    return;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || b.length !== a.length) { out.push(`${path}: array length ${Array.isArray(b) ? b.length : '—'} ≠ ${a.length}`); return; }
    a.forEach((x, i) => compare(x, b[i], `${path}[${i}]`, out, figures));
    return;
  }
  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') { out.push(`${path}: missing object`); return; }
    const ka = Object.keys(a).sort().join();
    const kb = Object.keys(b).filter((k) => k !== 'legalLanguageNote').sort().join();
    if (ka !== kb) out.push(`${path}: keys [${kb}] ≠ [${ka}]`);
    for (const k of Object.keys(a)) compare((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`, out, figures);
    return;
  }
  if (a !== b) out.push(`${path}: value ${JSON.stringify(b)} ≠ ${JSON.stringify(a)}`);
}

/** Words that are legitimately identical in other languages (brands, technical terms, international words). */
const UNIVERSAL = new Set(('sygma tv+ tv smart android fire apple google iphone ipad ios mac pc whatsapp hd full 4k ultra hdr epg vod usd ' +
  'paypal western union moneygram visa mastercard usdt binance starter plus ultra+ blog anime docs faq wi-fi email e-mail ' +
  'international streaming tennis basketball hockey marketing cookies google analytics microsoft clarity ads meta tiktok gtm ' +
  'one world endless entertainment sygmatv.com support@sygmatv.com new mexico llc ein ok').split(' '));
function untranslated(a: unknown, b: unknown, allow: Set<string>, path = '', out: string[] = []): string[] {
  if (typeof a === 'string' && typeof b === 'string') {
    if (a === b && !allow.has(a)) {
      const words = a.toLowerCase().replace(/\*\*|\{\w+\}/g, ' ').match(/[a-z][a-z.+@-]*/g) ?? [];
      if (words.some((w) => !UNIVERSAL.has(w))) out.push(`${path}: « ${a} »`);
    }
  } else if (Array.isArray(a) && Array.isArray(b)) a.forEach((x, i) => untranslated(x, b[i], allow, `${path}[${i}]`, out));
  else if (a && typeof a === 'object' && b && typeof b === 'object') for (const k of Object.keys(a)) untranslated((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], allow, `${path}.${k}`, out);
  return out;
}
const allowList = (lang: string) => {
  const f = join(ROOT, `tests/unit/i18n-allow/${lang}.json`);
  return new Set<string>(existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : []);
};

/** English page → localised href (same English slugs under the language prefix; legal pages stay English). */
const localHref = (lang: string, href: string) => (href.startsWith('/legal/') ? href : href.startsWith('/#') ? `/${lang}${href.slice(1)}` : href === '/' ? `/${lang}` : `/${lang}${href}`);
const plain = (s: string) => s.replace(/\*\*/g, '');

describe.each(LANGS)('language %s', (lang) => {
  const rules = RULES[lang]!;

  describe('interface dictionary', async () => {
    const mod = await import(`../../src/i18n/dictionaries/${lang}.ts`);
    const d = mod.default as Dict;

    it('exports the dictionary and notFoundText (= dictionary.notFound)', () => {
      expect(d).toBeTruthy();
      expect(mod.notFoundText).toEqual(d.notFound);
    });

    it('same structure, placeholders, non-text values and figures as English', () => {
      const out: string[] = [];
      compare(en, d, 'dict', out);
      expect(out).toEqual([]);
    });

    it('nothing left in English', () => {
      expect(untranslated(en, d, allowList(lang), 'dict')).toEqual([]);
    });

    it('no claim beyond the English (volumes, replay, VIP, IPTV, superlatives, live sports, international channels)', () => {
      const text = strings(d).filter((s) => !/^\*\*\+\{n\}\*\*/.test(s)).join('\n');
      for (const re of [...COMMON_CLAIMS, ...rules.claims]) expect(text, String(re)).not.toMatch(re);
      expect([d.meta.homeTitle, d.meta.homeDescription, ...strings(d.hero)].join(' '), 'hero / search snippet without sport').not.toMatch(rules.sport);
    });

    it('4K / HDR and the TV guide always qualified as in English', () => {
      for (const s of strings([d.plans.sub, d.cta, d.hero]).filter((x) => /4K|HDR/.test(x))) expect(s, s).toMatch(rules.qualifier);
      for (const [name, tier] of Object.entries(d.plans.tiers)) {
        if (tier.features.some((f) => /4K|HDR/.test(f.text))) expect(tier.note, name).toMatch(rules.qualifier);
      }
      expect(d.plans.compare.note).toMatch(rules.qualifier);
      expect(d.plans.compare.rows[3]!.label).toMatch(rules.qualifier);
    });

    it('prices written in the language format (same as the price display), never with $', () => {
      const text = strings(d).join('\n');
      expect(text, 'no $ sign').not.toMatch(/\$/);
      const found = text.match(/(USD \d+(,\d{2})?|\d+(,\d{2})? USD)/g) ?? [];
      expect(found.length, 'FAQ prices and taxes present').toBeGreaterThanOrEqual(4);
      for (const p of found) expect(p, p).toMatch(rules.price);
      expect(d.checkout.taxesValue).toMatch(rules.price);
    });

    it('search titles and descriptions fit (≤ 60 / 70–155 characters)', () => {
      expect(d.meta.homeTitle.length).toBeLessThanOrEqual(60);
      expect(d.meta.homeTitle.startsWith('SYGMA TV+ — ')).toBe(true);
      expect(d.meta.homeDescription.length).toBeGreaterThanOrEqual(70);
      expect(d.meta.homeDescription.length).toBeLessThanOrEqual(155);
      expect(d.blog.metaDescription.length).toBeLessThanOrEqual(155);
    });

    it('short labels fit the narrow layouts (plan cards, footer, table, banner)', () => {
      for (const tier of Object.values(d.plans.tiers)) {
        for (const f of tier.features) expect(plain(f.text).length, plain(f.text)).toBeLessThanOrEqual(22);
        expect(tier.tagline.length, tier.tagline).toBeLessThanOrEqual(34);
        expect(tier.note.length, tier.note).toBeLessThanOrEqual(62);
      }
      for (const c of d.footer.chips) expect(c.length, c).toBeLessThanOrEqual(13);
      expect(d.plans.compare.feature.length).toBeLessThanOrEqual(10);
      for (const c of d.hero.checks) expect(c.length, c).toBeLessThanOrEqual(24);
      for (const b of d.benefits) { expect(b.title.length, b.title).toBeLessThanOrEqual(20); expect(b.text.length, b.text).toBeLessThanOrEqual(34); }
      expect(d.footer.tagline.length).toBeLessThanOrEqual(34);
    });

    it('legal documents announced as English (footer note, FAQ link labels)', () => {
      expect(d.footer.legalLanguageNote, 'footer.legalLanguageNote').toBeTruthy();
    });

    if (lang === 'es') {
      it('Spanish punctuation: every question and exclamation is opened (¿ ¡)', () => {
        for (const s of strings(d)) {
          expect((s.match(/\?/g) ?? []).length, s).toBeLessThanOrEqual((s.match(/¿/g) ?? []).length);
          expect((s.match(/!/g) ?? []).length, s).toBeLessThanOrEqual((s.match(/¡/g) ?? []).length);
        }
      });
    }
  });

  describe('About and Help center', async () => {
    const mod = await import(`../../src/content/${lang}/info.ts`);
    const set = mod.INFO as InfoContentSet;
    const facts = mod.OWNER_FACTS as { languages: readonly string[]; paymentMethods: readonly string[]; established: string; supportHours: string };

    it('exports INFO and OWNER_FACTS with the English facts', () => {
      expect(set).toBeTruthy();
      expect(facts.established).toBe(OWNER_FACTS.established);
      expect(facts.supportHours).toBe(OWNER_FACTS.supportHours);
      expect(facts.languages).toHaveLength(6);
      expect(facts.paymentMethods).toHaveLength(6);
      for (const m of ['PayPal', 'Western Union', 'MoneyGram']) expect(facts.paymentMethods).toContain(m);
      expect(set.supportHours).toBe('24/7');
      expect(set.reviewed).toBe(rules.reviewed);
    });

    const pages = (s: { about: InfoPage; topics: InfoPage[] }) => [s.about, ...s.topics];
    it('same pages, slugs, sections, icons and block types as English', () => {
      const enPages = [ABOUT, ...HELP_TOPICS];
      const xs = pages(set);
      expect(xs.map((p) => p.slug)).toEqual(enPages.map((p) => p.slug));
      xs.forEach((p, i) => {
        const e = enPages[i]!;
        expect(p.icon).toBe(e.icon);
        expect(p.sections.map((s) => [s.id, s.icon, s.body.map((b) => Object.keys(b)[0])])).toEqual(e.sections.map((s) => [s.id, s.icon, s.body.map((b) => Object.keys(b)[0])]));
      });
    });

    it('same figures in every text (the reviewed date aside)', () => {
      const out: string[] = [];
      compare([ABOUT, HELP_HUB, HELP_TOPICS, INFO_UI], [set.about, set.hub, set.topics, set.ui], 'info', out);
      expect(out.filter((l) => !/\.links\[\d+\]\.href|\.href|plansHref/.test(l))).toEqual([]);
    });

    it('links: same pages under the language prefix; legal pages stay English', () => {
      const linkList = (s: { about: InfoPage; hub: { popular: ReadonlyArray<{ href: string }> }; ui: typeof INFO_UI }) => [
        ...s.about.sections.flatMap((x) => x.body.flatMap((b) => ('links' in b ? b.links.map((l) => l.href) : []))),
        ...s.hub.popular.map((p) => p.href), ...s.ui.hubRelated.map((l) => l.href), s.ui.refundPolicy.href, s.ui.terms.href, s.ui.actions.plansHref,
      ];
      expect(linkList(set)).toEqual(linkList({ about: ABOUT, hub: HELP_HUB, ui: INFO_UI }).map((h) => localHref(lang, h)));
    });

    it('titles ≤ 60 characters with the brand, descriptions 70–155', () => {
      for (const p of [set.about, set.hub, ...set.topics]) {
        expect(`${p.metaTitle} | SYGMA TV+`.length, p.metaTitle).toBeLessThanOrEqual(60);
        expect(p.description.length, p.metaTitle).toBeGreaterThanOrEqual(70);
        expect(p.description.length, p.metaTitle).toBeLessThanOrEqual(155);
      }
    });

    it('nothing left in English, no claim beyond the English', () => {
      expect(untranslated([ABOUT, HELP_HUB, HELP_TOPICS, INFO_UI], [set.about, set.hub, set.topics, set.ui], allowList(lang), 'info')).toEqual([]);
      const text = strings([set.about, set.hub, set.topics, set.ui]).join('\n');
      for (const re of [...COMMON_CLAIMS, ...rules.claims]) expect(text, String(re)).not.toMatch(re);
    });
  });
});

it('the translation gate covers the six phase-8 languages once their files exist', () => {
  expect(Object.keys(RULES)).toEqual(['de', 'es', 'it', 'nl', 'sv', 'nb']);
});
