import { describe, expect, it } from 'vitest';
import en from '@/i18n/dictionaries/en';
import fr from '@/i18n/dictionaries/fr';
import { getDictionary } from '@/i18n/dictionaries';
import { LEGAL_DOCUMENTS, legalDocuments } from '@/content/legal';
import { FR_LEGAL_DOCUMENTS } from '@/content/fr/legal';
import { FR_FAQ } from '@/content/fr/faq';
import { FR_GUIDES, FR_GUIDES_INTRO } from '@/content/fr/guides';
import { faqFor, guidesFor, guidesLocale } from '@/content/intl';

const text = (v: unknown): string => (typeof v === 'string' ? v : Array.isArray(v) ? v.map(text).join(' ') : v && typeof v === 'object' ? Object.values(v).map(text).join(' ') : '');
// Words that betray an untranslated English sentence.
const ENGLISH = /\b(the|and|your|you|with|our|we|this|these|from|will|must|only|after)\b/i;
// No invented price, no player app name, no « IPTV » wording in the French content.
const FORBIDDEN = /(\d+[.,]?\d*\s?(€|\$|EUR|USD|CHF|£))|smarters|tivimate|ibo player|downloader|\biptv\b|apk/i;

describe('French legal pages', () => {
  it('same documents, same sections (ids, order, kind of blocks) as English', () => {
    expect(Object.keys(FR_LEGAL_DOCUMENTS)).toEqual(Object.keys(LEGAL_DOCUMENTS));
    for (const doc of Object.keys(LEGAL_DOCUMENTS) as (keyof typeof LEGAL_DOCUMENTS)[]) {
      const a = LEGAL_DOCUMENTS[doc].sections;
      const b = FR_LEGAL_DOCUMENTS[doc].sections;
      expect(b.map((x) => x.id), doc).toEqual(a.map((x) => x.id));
      b.forEach((sec, i) => expect(sec.body.map((x) => Object.keys(x)[0]), `${doc}.${sec.id}`).toEqual(a[i]!.body.map((x) => Object.keys(x)[0])));
    }
  });
  it('fully in French (no English sentence), no price, served for French versions', () => {
    for (const d of Object.values(FR_LEGAL_DOCUMENTS)) {
      const t = text(d.sections.map((s) => [s.title, s.body])).replace(/sygmatv\.com|SYGMA TV\+|Sygma TV LLC|WhatsApp|Google Analytics|Microsoft Clarity|Starter|Plus|Ultra\+/g, '');
      expect(t).not.toMatch(ENGLISH);
      expect(t).not.toMatch(FORBIDDEN);
      expect(d.updated).toMatch(/novembre/);
    }
    expect(legalDocuments('fr')).toBe(FR_LEGAL_DOCUMENTS);
    expect(legalDocuments('en')).toBe(LEGAL_DOCUMENTS);
  });
  it('keeps the commitments of the English text (7 days, 14 days, 12 months, New Mexico law)', () => {
    const t = text(FR_LEGAL_DOCUMENTS);
    for (const s of ['7 jours', '14 jours', '12 mois', 'Nouveau-Mexique', 'satisfait', 'jamais automatiquement']) expect(t.toLowerCase()).toContain(s.toLowerCase());
  });
});

describe('French FAQ', () => {
  it('8 to 10 useful questions, unique, in French, without invented prices or delays', () => {
    expect(FR_FAQ.length).toBeGreaterThanOrEqual(8);
    expect(FR_FAQ.length).toBeLessThanOrEqual(10);
    expect(new Set(FR_FAQ.map((f) => f.id)).size).toBe(FR_FAQ.length);
    for (const f of FR_FAQ) {
      expect(f.q.endsWith('?')).toBe(true);
      expect(`${f.q} ${f.a}`).not.toMatch(FORBIDDEN);
      // No delay promise (only the 24-hour trial, which is a verified fact).
      expect(f.a.replace('24 heures', '')).not.toMatch(/\b\d+\s?(minutes?|heures?|h)\b/);
      expect(f.a).not.toMatch(/Mbit|Mb\/s|Mbps/);
    }
  });
  it('the French home shows the « home » questions with the same text', () => {
    expect(fr.faq.items).toEqual(FR_FAQ.filter((f) => f.home).map(({ q, a }) => ({ q, a })));
    expect(fr.faq.items.length).toBe(en.faq.items.length);
  });
  it('country answers: Switzerland and Canada quote their currency and no EU withdrawal', () => {
    const ch = faqFor('fr-ch')!;
    expect(ch.find((f) => f.id === 'prix')!.a).toContain('francs suisses');
    expect(ch.find((f) => f.id === 'remboursement')!.a).not.toContain('14 jours');
    const ca = faqFor('fr-ca')!;
    expect(ca.find((f) => f.id === 'prix')!.a).toContain('dollars canadiens');
    expect(text(ca)).not.toMatch(/\be-mail\b/);
    expect(faqFor('en')).toBeNull();
    expect(faqFor('en-gb')).toBeNull();
  });
});

describe('installation guides', () => {
  it('7 devices, unique slugs and titles, complete, SEO lengths', () => {
    expect(FR_GUIDES.map((g) => g.slug)).toEqual(['smart-tv', 'android-tv', 'fire-tv', 'apple-tv', 'iphone-ipad', 'android', 'ordinateur']);
    expect(new Set(FR_GUIDES.map((g) => g.title)).size).toBe(7);
    expect(new Set(FR_GUIDES.map((g) => g.description)).size).toBe(7);
    for (const g of FR_GUIDES) {
      expect(g.metaTitle.length, g.slug).toBeLessThanOrEqual(60);
      expect(g.description.length, g.slug).toBeLessThanOrEqual(160);
      expect(g.steps.length, g.slug).toBeGreaterThanOrEqual(4);
      expect(g.troubleshooting.length, g.slug).toBeGreaterThanOrEqual(2);
      expect(text(g)).not.toMatch(FORBIDDEN);
    }
    expect(FR_GUIDES_INTRO.metaTitle.length).toBeLessThanOrEqual(60);
  });
  it('one guides section per language (French on /fr-fr), none in English', () => {
    expect(guidesLocale('fr-ch')).toBe('fr-fr');
    expect(guidesFor('fr-fr')).not.toBeNull();
    expect(guidesFor('fr-be')).toBeNull();
    expect(guidesFor('en')).toBeNull();
  });
});

describe('country variants', () => {
  it('only their real differences; « / » keeps exactly the English dictionary', () => {
    expect(getDictionary('en')).toBe(en);
    expect(getDictionary('fr-fr')).toBe(fr);
    expect(getDictionary('fr-ch').plans.footnote).toContain('francs suisses');
    expect(getDictionary('fr-ca').checkout.emailLabel).toBe('Adresse courriel');
    expect(getDictionary('en-gb').consent.customize).toBe('Customise');
    expect(getDictionary('en-gb').plans.footnote).toContain('GBP');
    expect(getDictionary('en-ca').plans.footnote).toContain('CAD');
    // No USD price quoted outside the US version.
    for (const id of ['en-gb', 'en-ca'] as const) expect(text(getDictionary(id).faq)).not.toMatch(/\$\d/);
  });
});
