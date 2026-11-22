import en, { type Dictionary } from './dictionaries/en';
import fr from './dictionaries/fr';
import de from './dictionaries/de';
import es from './dictionaries/es';
import it from './dictionaries/it';
import nl from './dictionaries/nl';
import sv from './dictionaries/sv';
import nb from './dictionaries/nb';
import type { Locale } from './config';

/**
 * One dictionary per BUILDABLE (enabled or preview) language. The `Record<Locale, Dictionary>` type makes enabling a language
 * in src/i18n/locales.ts fail the type check until its complete dictionary (same shape as `en`) is added here:
 * a language can never go live half-translated or fall back silently to English.
 * Translations are written or reviewed by native speakers from the validated English (never machine output).
 */
const dictionaries: Record<Locale, Dictionary> = { en, fr, de, es, it, nl, sv, nb };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };

export { fill, plural } from './format';
