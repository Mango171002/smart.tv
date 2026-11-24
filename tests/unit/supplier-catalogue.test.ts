import { readFileSync, readdirSync, statSync } from 'node:fs';
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
import { fill, formatCount } from '@/i18n/format';
import { SUPPLIER_CATALOGUE } from '@/config/supplier-catalogue';
import { CATALOGUE } from '@/config/catalogue';
import { TIERS } from '@/lib/pricing';

/**
 * PROPOSAL (owner decision 24/11/2026, decision register D6 « Owner update »; docs/release/final/supplier-specs-proposal.md):
 * the supplier-confirmed OVERALL catalogue (35,000+ TV channels, 200,000+ movies & series, 4K HDR on compatible content
 * and devices) as ONE qualified sentence under the plans comparison. Not per plan, not a right in the visitor's country:
 * - every language says it is the supplier's catalogue, keeps « compatible content and devices » and « depends on your
 *   country and device »;
 * - never paired with « international », « multiple countries », « around the world », a sport, league or broadcaster,
 *   or a plan name;
 * - figures come from src/config/supplier-catalogue.ts only, in the language's number format; the per-plan switch
 *   (src/config/catalogue.ts) stays all `null`; nothing in the title, meta description or structured data.
 */
type Lang = 'en' | 'fr' | 'de' | 'es' | 'it' | 'nl' | 'sv' | 'nb';
const DICTS: Record<Lang, Dictionary> = { en, fr, de, es, it: it_, nl, sv, nb };
const LANGS = Object.keys(DICTS) as Lang[];
const ROOT = join(__dirname, '..', '..');

/** Per language: supplier label, device/content qualifier, country/device qualifier, expected number format. */
const RULES: Record<Lang, { supplier: RegExp; compatible: RegExp; country: RegExp; channels: string; vod: string }> = {
  en: { supplier: /^Supplier catalogue: /, compatible: /on compatible content and devices/, country: /What you can watch depends on your country and device\.$/, channels: '35,000', vod: '200,000' },
  fr: { supplier: /^Catalogue du fournisseur : /, compatible: /sur les contenus et appareils compatibles/, country: /Ce que vous pouvez regarder dépend de votre pays et de votre appareil\.$/, channels: '35 000', vod: '200 000' },
  de: { supplier: /^Katalog des Lieferanten: /, compatible: /bei kompatiblen Inhalten und Geräten/, country: /Was Sie sehen können, hängt von Ihrem Land und Ihrem Gerät ab\.$/, channels: '35.000', vod: '200.000' },
  es: { supplier: /^Catálogo del proveedor: /, compatible: /en contenidos y dispositivos compatibles/, country: /Lo que puedes ver depende de tu país y de tu dispositivo\.$/, channels: '35.000', vod: '200.000' },
  it: { supplier: /^Catalogo del fornitore: /, compatible: /su contenuti e dispositivi compatibili/, country: /Cosa puoi guardare dipende dal tuo paese e dal tuo dispositivo\.$/, channels: '35.000', vod: '200.000' },
  nl: { supplier: /^Catalogus van de leverancier: /, compatible: /op compatibele content en apparaten/, country: /Wat je kunt kijken, hangt af van je land en je apparaat\.$/, channels: '35.000', vod: '200.000' },
  sv: { supplier: /^Leverantörens utbud: /, compatible: /på kompatibelt innehåll och kompatibla enheter/, country: /Vad du kan titta på beror på ditt land och din enhet\.$/, channels: '35 000', vod: '200 000' },
  nb: { supplier: /^Leverandørens katalog: /, compatible: /på kompatibelt innhold og kompatible enheter/, country: /Hva du kan se, avhenger av landet ditt og enheten din\.$/, channels: '35 000', vod: '200 000' },
};

/** Pairings that would imply distribution rights (owner rule 24/11/2026), in all 8 languages. */
const FORBIDDEN: RegExp[] = [
  /internation|internacional|internazional|internasjonal/i,
  /multiple countries|several countries|plusieurs pays|mehreren Ländern|varios países|più paesi|diversi paesi|meerdere landen|flera länder|flere land/i,
  /around the world|worldwide|global|monde|Welt|mundo|mondo|wereld|världen|verden/i,
  /sport|deport|football|soccer|fútbol|calcio|voetbal|fotboll|fotball|tennis|basket|hockey|F1\b|formula|NBA|NFL|NHL|MLB|UEFA|FIFA|Premier League|Champions League|Ligue 1|La ?Liga|Serie A|Bundesliga|Eredivisie|Allsvenskan|Eliteserien|beIN|CANAL\+|ESPN|DAZN|Sky\b/i,
  /\bstarter\b|\bplus\b|\bultra\b|ultra\+/i,
  /\bcountries\b(?! and)|\bfrom \d/i,
  /\b(rights?|licen[cs]ed?|droits|Rechte|derechos|diritti|rechten|rättigheter|rettigheter)\b/i,
];

const statement = (lang: Lang) =>
  fill(DICTS[lang].plans.compare.supplierCatalogue, { channels: formatCount(SUPPLIER_CATALOGUE!.channels, lang), vod: formatCount(SUPPLIER_CATALOGUE!.vod, lang) });

describe('supplier catalogue figures (config)', () => {
  it('are the supplier-confirmed totals: 35,000 channels, 200,000 movies & series', () => {
    expect(SUPPLIER_CATALOGUE).toEqual({ channels: 35000, vod: 200000 });
  });

  it('per-plan counts stay hidden: the plan switch is untouched (all null)', () => {
    for (const t of TIERS) expect(CATALOGUE[t]).toEqual({ channels: null, vod: null });
  });
});

describe.each(LANGS)('%s — supplier catalogue statement', (lang) => {
  const d = DICTS[lang];
  const r = RULES[lang];
  const template = d.plans.compare.supplierCatalogue;
  const text = statement(lang);

  it('exists, with the two figures as placeholders (no hard-coded number but 4K)', () => {
    expect(template).toBeTruthy();
    expect([...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1])).toEqual(['channels', 'vod']);
    expect(template.replace(/\{\w+\}/g, '').match(/\d+/g)).toEqual(['4']);
  });

  it('is framed as the supplier’s catalogue and keeps both qualifiers (compatible content/devices; country and device)', () => {
    expect(text).toMatch(r.supplier);
    expect(text).toMatch(/4K HDR/);
    expect(text).toMatch(r.compatible);
    expect(text).toMatch(r.country);
  });

  it('figures in the language’s number format, each with « + », each once', () => {
    expect(formatCount(35000, lang)).toBe(r.channels);
    expect(formatCount(200000, lang)).toBe(r.vod);
    expect(text.split(`${r.channels}+`)).toHaveLength(2);
    expect(text.split(`${r.vod}+`)).toHaveLength(2);
  });

  it('never paired with international, multiple countries, around the world, sports or plan names', () => {
    for (const re of FORBIDDEN) expect(text, String(re)).not.toMatch(re);
  });

  it('short enough for one footnote (≤ 230 characters) and French typography where needed', () => {
    expect(text.length).toBeLessThanOrEqual(230);
    if (lang === 'fr') expect(text).not.toMatch(/ [?!;:»]/);
  });

  it('the existing « where available » qualifier on the 4K/HDR line is kept next to it', () => {
    expect(d.plans.compare.note).toMatch(/where available|selon disponibilité|je nach Verfügbarkeit|según disponibilidad|dove disponibile|waar beschikbaar|i mån av tillgång|der tilgjengelig/);
  });

  it('not in the page title, meta description or any other meta text', () => {
    const meta = Object.values(d.meta).join('\n');
    expect(meta).not.toMatch(/\{channels\}|\{vod\}|35[ ,.  ]?000|200[ ,.  ]?000/);
    expect(meta).not.toContain(template.slice(0, 12));
  });
});

describe('supplier catalogue statement — used once, outside plans, meta and structured data', () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
    });
  const src = files(join(ROOT, 'src')).filter((f) => !f.includes(`${join('src', 'i18n', 'dictionaries')}`));
  const users = (needle: string) => src.filter((f) => readFileSync(f, 'utf8').includes(needle)).map((f) => f.slice(ROOT.length + 1)).sort();

  it('rendered by one component only (the plans comparison note), never by the plan cards', () => {
    expect(users('supplierCatalogue').filter((f) => !f.startsWith('src/config/'))).toEqual(['src/components/Sections.tsx']);
    expect(users('SUPPLIER_CATALOGUE')).toEqual(['src/components/Sections.tsx', 'src/config/supplier-catalogue.ts']);
  });

  it('not used by the metadata or the structured data builders', () => {
    for (const f of ['src/lib/seo.ts', 'src/components/StructuredData.tsx', 'src/components/JsonLd.tsx']) {
      const code = readFileSync(join(ROOT, f), 'utf8');
      expect(code, f).not.toMatch(/supplier|SUPPLIER_CATALOGUE|35000|200000/i);
    }
  });
});
