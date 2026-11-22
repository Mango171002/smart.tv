import { DEFAULT_LANGUAGE, SITE_LANGUAGES, type BuildableLanguageCode, builtLanguages, enabledLanguages } from './locales';

/**
 * Locales built by this site = the enabled languages of the registry (src/i18n/locales.ts), plus the preview
 * languages in the private preview environment only (NEXT_PUBLIC_SITE_MODE=preview).
 * Production today: English only (served at the root; /en/* redirects to /*; /fr and /fr/* redirect to the English page).
 * French is in preview (phase 7B). German, Spanish, Italian, Dutch, Swedish and Norwegian Bokmål are declared but
 * disabled: no route, no sitemap entry, no hreflang.
 */
export type Locale = BuildableLanguageCode;
export const LOCALES = builtLanguages().map((l) => l.code) as [Locale, ...Locale[]];
/** Public (enabled) locales: the only ones indexable, in the sitemap and in hreflang. */
export const PUBLIC_LOCALES = enabledLanguages().map((l) => l.code) as Locale[];
export const DEFAULT_LOCALE: Locale = DEFAULT_LANGUAGE;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Enabled (public) locale: may be indexed, listed in the sitemap and in hreflang. A preview locale never is. */
export function isPublicLocale(locale: Locale): boolean {
  return (PUBLIC_LOCALES as readonly string[]).includes(locale);
}

/** SEO codes of a built locale (hreflang, html lang, og:locale, Intl, target markets). */
export function localeSeo(locale: Locale) {
  return SITE_LANGUAGES[locale];
}
