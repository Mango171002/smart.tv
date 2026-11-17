import type { Dictionary } from './dictionaries/en';
import type { LocaleId } from './locales';

/**
 * Country variants of a language (SEO international, phase 2 — preview only).
 * A variant = the language dictionary + a few real local differences: currency and tax wording,
 * local spelling (en-GB, fr-CA « courriel »), and the price question of the FAQ (no price is quoted
 * before the country's grid is validated). Nothing else is duplicated.
 */
type DeepPartial<T> = { [K in keyof T]?: T[K] extends Array<infer U> ? U[] : T[K] extends object ? DeepPartial<T[K]> : T[K] };

function merge<T>(base: T, over: DeepPartial<T> | undefined): T {
  if (!over) return base;
  const out: Record<string, unknown> = Array.isArray(base) ? [...(base as unknown[])] as never : { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over)) {
    const b = (base as Record<string, unknown>)[k];
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object' ? merge(b, v as never) : v;
  }
  return out as T;
}

/** Applies a text transform to every string of the dictionary (spelling of a country). */
function mapStrings<T>(v: T, f: (s: string) => string): T {
  if (typeof v === 'string') return f(v) as T;
  if (Array.isArray(v)) return v.map((x) => mapStrings(x, f)) as T;
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mapStrings(x, f)])) as T;
  return v;
}

const enGbSpelling = (s: string) =>
  s.replace(/\bfavorite/g, 'favourite').replace(/\bFavorite/g, 'Favourite').replace(/\bCustomize/g, 'Customise').replace(/\bcustomize/g, 'customise').replace(/\borganized/g, 'organised').replace(/\bcolor/g, 'colour');
const enCaSpelling = (s: string) => s.replace(/\bfavorite/g, 'favourite').replace(/\bFavorite/g, 'Favourite');
const frCaSpelling = (s: string) =>
  s.replace(/\bAdresse e-mail/g, 'Adresse courriel').replace(/\badresse e-mail/g, 'adresse courriel').replace(/\bpar e-mail/g, 'par courriel').replace(/\bE-mail\b/g, 'Courriel').replace(/\be-mail\b/g, 'courriel');

const OVERRIDES: Partial<Record<LocaleId, { spelling?: (s: string) => string; dict: DeepPartial<Dictionary> }>> = {
  'fr-be': {
    dict: {
      plans: { footnote: 'Prix TTC en euros. Le contenu et le nombre de chaînes peuvent varier selon le pays.' },
    },
  },
  'fr-ch': {
    dict: {
      plans: {
        footnote: 'Prix en francs suisses (CHF), taxes comprises. Le contenu et le nombre de chaînes peuvent varier selon le pays.',
        matrixCaption: 'Prix en {currency}, taxes comprises.',
      },
    },
  },
  'fr-ca': {
    spelling: frCaSpelling,
    dict: {
      plans: {
        footnote: 'Prix en dollars canadiens (CAD). Les taxes applicables sont indiquées avant la confirmation de votre commande. Le contenu et le nombre de chaînes peuvent varier selon le pays.',
        matrixCaption: 'Prix en {currency}, avant taxes.',
        details: [
          { title: 'Contenus', text: 'Les chaînes et les contenus à la demande peuvent varier selon le pays.' },
          { title: 'Taxes', text: 'Les taxes applicables sont indiquées avant la confirmation de votre commande.' },
          { title: 'Renouvellement', text: 'Aucun renouvellement automatique : c’est vous qui décidez de renouveler.' },
          { title: 'Remboursement', text: 'Essai gratuit d’abord, puis remboursement intégral si vous le demandez dans les 7 jours suivant l’activation. Vos droits de consommateur s’appliquent toujours.' },
        ],
      },
      checkout: { taxesValue: 'Indiquées à la confirmation' },
    },
  },
  'en-gb': {
    spelling: enGbSpelling,
    dict: {
      plans: {
        footnote: 'Prices in pounds sterling (GBP), VAT included. Content and number of channels may vary by country.',
        matrixCaption: 'Prices in {currency}, VAT included.',
      },
      checkout: { taxesValue: 'Included' },
    },
  },
  'en-ca': {
    spelling: enCaSpelling,
    dict: {
      plans: {
        footnote: 'Prices in Canadian dollars (CAD). Applicable taxes are shown before you confirm your order. Content and number of channels may vary by country.',
      },
      checkout: { taxesValue: 'Shown at confirmation' },
    },
  },
};

/** English FAQ answer about prices for countries whose grid is not validated (no USD price quoted). */
const EN_PRICE_ANSWER = 'Three yearly plans — Starter, Plus and Ultra+ — for 12, 24 or 36 months, with a discount on longer terms. Prices in your currency will be shown in the Plans section once they are validated; the final price, taxes included, is always displayed before payment.';

export function applyVariant(locale: LocaleId, base: Dictionary): Dictionary {
  const o = OVERRIDES[locale];
  if (!o) return base;
  let d = merge(base, o.dict);
  if (locale === 'en-gb' || locale === 'en-ca') {
    d = { ...d, faq: { ...d.faq, items: d.faq.items.map((it) => (it.q === 'How much does it cost?' ? { ...it, a: EN_PRICE_ANSWER } : it)) } };
  }
  return o.spelling ? mapStrings(d, o.spelling) : d;
}

export const VARIANT_LOCALES = Object.keys(OVERRIDES) as LocaleId[];
