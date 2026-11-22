import { DEFAULT_LANGUAGE, SITE_LANGUAGES, type EnabledLanguageCode, enabledLanguages } from './locales';

/**
 * Locales built by this site = the enabled languages of the registry (src/i18n/locales.ts).
 * Today: English only (served at the root; /en/* redirects to /*; /fr and /fr/* redirect to the English page).
 * French, German, Spanish, Italian, Dutch, Swedish and Norwegian Bokmål are declared but disabled: no route, no sitemap entry, no hreflang.
 */
export type Locale = EnabledLanguageCode;
export const LOCALES = enabledLanguages().map((l) => l.code) as [Locale, ...Locale[]];
export const DEFAULT_LOCALE: Locale = DEFAULT_LANGUAGE;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** SEO codes of a built locale (hreflang, html lang, og:locale, Intl, target markets). */
export function localeSeo(locale: Locale) {
  return SITE_LANGUAGES[locale];
}
