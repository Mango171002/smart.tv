import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import en, { type Dictionary } from '@/i18n/dictionaries/en';
import fr from '@/i18n/dictionaries/fr';
import de from '@/i18n/dictionaries/de';
import es from '@/i18n/dictionaries/es';
import it_ from '@/i18n/dictionaries/it';
import nl from '@/i18n/dictionaries/nl';
import sv from '@/i18n/dictionaries/sv';
import nb from '@/i18n/dictionaries/nb';
import { getInfo } from '@/content/info';
import { faqJsonLd } from '@/components/StructuredData';
import { PROMOTIONS, visibleCompareRows } from '@/config/promotions';
import { fill } from '@/i18n/format';
import { faqItems } from '@/lib/faq';
import { displayMoney } from '@/lib/money-display';
import { prelaunchCopy } from '@/lib/prelaunch-copy';
import { computeQuote, getStaticPriceTable, STREAMS, TERM_MONTHS, TIERS } from '@/lib/pricing';

/**
 * Owner decisions of 24/11/2026 on commercial wording (docs/release/phase13/owner-approval.md):
 * - B2 + A7: no computed tax amount (« $0.00 USD ») and no « before taxes » / « taxes and the final price are always
 *   displayed » statements in the site copy; a neutral statement instead (legal documents are counsel's, untouched);
 * - B6: no struck-through « Regular price », a factual comparison with separate 12-month plans; the « +30 days free »
 *   badge and table row hidden by src/config/promotions.ts until its conditions are approved;
 * - B12: factual guarantee label in Norwegian (L-036) where it fits.
 * Every translated sentence here is an AI draft awaiting native review (A5).
 */
type Lang = 'en' | 'fr' | 'de' | 'es' | 'it' | 'nl' | 'sv' | 'nb';
const DICTS: Record<Lang, Dictionary> = { en, fr, de, es, it: it_, nl, sv, nb };
const LANGS = Object.keys(DICTS) as Lang[];
const ROOT = join(__dirname, '..', '..');

const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
/** Every text of a language: dictionary (open and prelaunch states) and About / Help center pages (with their prelaunch variants). */
const allText = (lang: Lang) => [...strings(DICTS[lang]), ...strings(prelaunchCopy(DICTS[lang], false)), ...strings(getInfo(lang))];

/** The neutral tax statement (owner wording, EN « Applicable taxes, if any, are confirmed before payment. »). */
const TAX_SENTENCE: Record<Lang, string> = {
  en: 'Applicable taxes, if any, are confirmed before payment.',
  fr: 'Les taxes applicables, le cas échéant, sont confirmées avant le paiement.',
  de: 'Gegebenenfalls anfallende Steuern werden vor der Zahlung bestätigt.',
  es: 'Los impuestos aplicables, si los hay, se confirman antes del pago.',
  it: 'Le eventuali tasse applicabili vengono confermate prima del pagamento.',
  nl: 'Eventuele toepasselijke belastingen worden vóór de betaling bevestigd.',
  sv: 'Eventuell tillämplig skatt bekräftas före betalningen.',
  nb: 'Eventuelle gjeldende avgifter bekreftes før betaling.',
};
/** The removed statements: prices « before taxes » and taxes / final price « always displayed before any purchase ». */
const OLD_TAX_CLAIMS: Record<Lang, RegExp> = {
  en: /before taxes|always displayed before|taxes included/i,
  fr: /hors taxes|toujours affichés avant|taxes comprises/i,
  de: /zzgl\.? Steuern|vor jedem Kauf angezeigt/i,
  es: /impuestos no incluidos|siempre antes de cualquier compra/i,
  it: /tasse escluse|sempre indicati prima/i,
  nl: /exclusief belasting|altijd vóór elke aankoop/i,
  sv: /exklusive skatt|visas alltid innan du köper/i,
  nb: /eksklusive avgifter|vises alltid før du kjøper/i,
};
/** Reference-price labels (owner decision B6: none in any language). */
const REGULAR_PRICE = /regular price|normal price|full price|prix normal|prix plein|regulärer preis|normalpreis|precio normal|prezzo pieno|normale prijs|ordinarie pris|ordinær pris/i;
const ZERO_AMOUNT = /(?<![\d.,])0[.,]00(?!\d)/;

describe.each(LANGS)('%s — B2 / A7: taxes', (lang) => {
  const d = DICTS[lang];

  it('no tax amount anywhere (no « $0.00 » / « 0,00 »), a neutral label on the order review line', () => {
    for (const s of allText(lang)) expect(s, s).not.toMatch(ZERO_AMOUNT);
    expect(d.checkout.taxesValue).not.toMatch(/\d|\$|USD/);
    expect(d.checkout.taxesValue.length).toBeGreaterThan(10);
    if (lang === 'en') expect(d.checkout.taxesValue).toBe('Calculated by our team before payment');
  });

  it('no « before taxes » / « always displayed before any purchase » statement; the neutral statement instead', () => {
    for (const s of allText(lang)) expect(s, s).not.toMatch(OLD_TAX_CLAIMS[lang]);
    const tax = TAX_SENTENCE[lang];
    expect(d.faq.items[3]!.a.endsWith(tax), d.faq.items[3]!.a).toBe(true);
    expect(d.plans.details[1]!.text).toBe(tax);
    expect(d.plans.footnote).toContain(tax);
    const prices = getInfo(lang).topics.find((t) => t.slug === 'ordering-payment')!.sections.find((s) => s.id === 'prices')!;
    expect(strings(prices.body).join(' ')).toContain(tax);
  });

  it('the FAQ answer is the same in the visible FAQ and the FAQPage JSON-LD, in both states', () => {
    for (const open of [true, false]) {
      const items = faqItems(d, open);
      expect(items[3]!.a).toBe(d.faq.items[3]!.a);
      const ld = faqJsonLd(items, lang, `https://sygmatv.com/${lang}`);
      expect(ld.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(items.map((i) => i.a));
    }
  });
});

describe.each(LANGS)('%s — B6: reference price and « +30 days free »', (lang) => {
  const d = DICTS[lang];
  const table = getStaticPriceTable();

  it('no « Regular price » wording (any language, any state)', () => {
    expect(Object.keys(d.plans)).not.toContain('regularPrice');
    for (const s of allText(lang)) expect(s, s).not.toMatch(REGULAR_PRICE);
  });

  it('the comparison states the separate 12-month plans and the saving, all computed from the price list', () => {
    expect([...d.plans.savings.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()).toEqual(['amount', 'n', 'pct', 'reference']);
    for (const tier of TIERS) {
      for (const term of ['24m', '36m'] as const) {
        for (const streams of STREAMS) {
          const q = computeQuote(table, { tier, term, streams });
          const years = TERM_MONTHS[term]! / 12;
          const yearly = computeQuote(table, { tier, term: '12m', streams }).amountMinor;
          // Factual: the reference is exactly n separate 12-month plans, the saving the difference with the price.
          expect(q.referenceMinor).toBe(yearly * years);
          expect(q.savingsMinor).toBe(yearly * years - q.amountMinor);
          const text = fill(d.plans.savings, { n: years, reference: displayMoney(q.referenceMinor!, table.currency, lang), amount: displayMoney(q.savingsMinor, table.currency, lang), pct: q.savingsPercent });
          expect(text).toContain(displayMoney(q.referenceMinor!, table.currency, lang));
          expect(text).toContain(displayMoney(q.savingsMinor, table.currency, lang));
          expect(text).toContain(String(years));
        }
      }
    }
  });

  it('the « +30 days free » row is hidden from the comparison table while the promotion is off', () => {
    const rows = d.plans.compare.rows;
    expect(rows.filter((r) => r.label === d.plans.bonus)).toHaveLength(1);
    const visible = visibleCompareRows(rows, d.plans.bonus);
    expect(visible).toEqual(rows.filter((r) => r.label !== d.plans.bonus));
    expect(strings(visible).join(' ')).not.toMatch(/\+\s?30/);
    // Re-enabled by configuration only: the row comes back unchanged.
    expect(visibleCompareRows(rows, d.plans.bonus, { bonusDays: { enabled: true } })).toEqual([...rows]);
  });

  it('no other « +30 » mention in the site copy (only the hidden badge and table row)', () => {
    const others = { ...d, plans: { ...d.plans, bonus: '', compare: { ...d.plans.compare, rows: visibleCompareRows(d.plans.compare.rows, d.plans.bonus) } } };
    for (const s of [...strings(others), ...strings(getInfo(lang))]) expect(s, s).not.toMatch(/\+\s?30\b/);
  });
});

describe('B6: components', () => {
  const configurator = readFileSync(join(ROOT, 'src/components/PlanConfigurator.tsx'), 'utf8');
  const sections = readFileSync(join(ROOT, 'src/components/Sections.tsx'), 'utf8');

  it('the bonus-days promotion is off (owner decision B6, until its conditions are approved)', () => {
    expect(PROMOTIONS.bonusDays.enabled).toBe(false);
  });

  it('the « +30 days free » badge and table row are rendered only behind the promotion flag', () => {
    expect(configurator.match(/className="tier-bonus"/g)).toHaveLength(1);
    expect(configurator).toMatch(/\{PROMOTIONS\.bonusDays\.enabled && t !== 'starter' && <span className="tier-bonus">\{p\.bonus\}<\/span>\}/);
    expect(sections).toMatch(/visibleCompareRows\(c\.rows, dict\.plans\.bonus\)\.map\(/);
    expect(sections).not.toMatch(/\bc\.rows\.map\(/);
  });

  it('no struck-through price in the plan simulator', () => {
    expect(configurator).not.toMatch(/<s[\s>]|<del[\s>]|line-through|regular-price|regularPrice/);
  });
});

describe('B12: guarantee label (owner preference, counsel review pending)', () => {
  it('nb: « Pengene-tilbake-garanti » (L-036)', () => {
    expect(nb.plans.trust[1]!.title).toBe('Pengene-tilbake-garanti');
  });
});
