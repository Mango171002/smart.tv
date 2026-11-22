/**
 * Central language registry (SEO phase 7A, 22/11/2026). Single source of truth for every language the
 * site may be published in, its URL prefix, its SEO codes and the markets it targets.
 *
 * Status (decided here only, at build time):
 * - enabled:  built, served, indexable (when indexing is allowed), listed in the sitemap and in hreflang;
 * - disabled: declared for planning only. No route is built (the [locale] segment uses
 *             `dynamicParams = false`), no URL in the sitemap, never referenced in hreflang.
 *
 * Rules (docs/seo/phase7/international-architecture.md):
 * - one version per LANGUAGE, under a language prefix (/fr, /de, /es, /it, /nl, /sv, /nb); English stays at the root
 *   and is the x-default;
 * - hreflang uses generic language codes (« fr », not « fr-FR » / « fr-CH » / « fr-CA »): no regional
 *   variant is generated unless genuinely distinct regional pages exist one day;
 * - the same English slugs are used under every prefix (/fr/help, /de/about, /it/legal/privacy);
 * - a language is enabled only with a native-reviewed dictionary and the owner's authorisation.
 *
 * This file has no path-alias imports: next.config.ts imports it (redirects generated from the registry).
 */
export type LanguageStatus = 'enabled' | 'disabled';

/** ISO 3166-1 alpha-2 codes of the 13 priority markets (owner, phase 7A + addendum of 22/11/2026). */
export const PRIORITY_MARKETS = ['US', 'GB', 'CA', 'FR', 'CH', 'DE', 'ES', 'IT', 'LU', 'NL', 'SE', 'NO', 'IE'] as const;
export type MarketCountry = (typeof PRIORITY_MARKETS)[number];

export interface SiteLanguage {
  /** Route segment and language code (ISO 639-1). « en » is served at « / » (internal route /en, rewritten). */
  code: string;
  /** Public URL prefix: '' for English (root), '/fr', '/de'… otherwise. */
  prefix: '' | `/${string}`;
  /** hreflang value: generic language code only (no region). */
  hreflang: string;
  /** <html lang> and JSON-LD inLanguage value. */
  htmlLang: string;
  /** Open Graph locale (og:locale). */
  ogLocale: string;
  /** Default formatting locale for numbers and dates (Intl). */
  intl: string;
  /** Native name, for a future language switcher. */
  nativeName: string;
  /** Markets this language version targets. One page per language serves all of them (no country copies). */
  markets: readonly MarketCountry[];
  status: LanguageStatus;
}

export const SITE_LANGUAGES = {
  en: { code: 'en', prefix: '', hreflang: 'en', htmlLang: 'en', ogLocale: 'en_US', intl: 'en-US', nativeName: 'English', markets: ['US', 'GB', 'CA', 'IE', 'LU', 'NL', 'SE', 'NO'], status: 'enabled' },
  fr: { code: 'fr', prefix: '/fr', hreflang: 'fr', htmlLang: 'fr', ogLocale: 'fr_FR', intl: 'fr-FR', nativeName: 'Français', markets: ['FR', 'CA', 'CH', 'LU'], status: 'disabled' },
  de: { code: 'de', prefix: '/de', hreflang: 'de', htmlLang: 'de', ogLocale: 'de_DE', intl: 'de-DE', nativeName: 'Deutsch', markets: ['DE', 'CH', 'LU'], status: 'disabled' },
  es: { code: 'es', prefix: '/es', hreflang: 'es', htmlLang: 'es', ogLocale: 'es_ES', intl: 'es-ES', nativeName: 'Español', markets: ['ES'], status: 'disabled' },
  it: { code: 'it', prefix: '/it', hreflang: 'it', htmlLang: 'it', ogLocale: 'it_IT', intl: 'it-IT', nativeName: 'Italiano', markets: ['IT', 'CH'], status: 'disabled' },
  nl: { code: 'nl', prefix: '/nl', hreflang: 'nl', htmlLang: 'nl', ogLocale: 'nl_NL', intl: 'nl-NL', nativeName: 'Nederlands', markets: ['NL'], status: 'disabled' },
  sv: { code: 'sv', prefix: '/sv', hreflang: 'sv', htmlLang: 'sv', ogLocale: 'sv_SE', intl: 'sv-SE', nativeName: 'Svenska', markets: ['SE'], status: 'disabled' },
  nb: { code: 'nb', prefix: '/nb', hreflang: 'nb', htmlLang: 'nb', ogLocale: 'nb_NO', intl: 'nb-NO', nativeName: 'Norsk bokmål', markets: ['NO'], status: 'disabled' },
} as const satisfies Record<string, SiteLanguage>;

export type LanguageCode = keyof typeof SITE_LANGUAGES;
/** Codes of the enabled languages, as a type (a disabled language cannot be used as a page locale). */
export type EnabledLanguageCode = {
  [K in LanguageCode]: (typeof SITE_LANGUAGES)[K]['status'] extends 'enabled' ? K : never;
}[LanguageCode];

/** The default language: served at the root, x-default of every hreflang set. */
export const DEFAULT_LANGUAGE = 'en' satisfies EnabledLanguageCode;

const ALL = Object.values(SITE_LANGUAGES) as readonly SiteLanguage[];

export const ALL_LANGUAGE_CODES = Object.keys(SITE_LANGUAGES) as LanguageCode[];

/** Enabled languages, default first. */
export function enabledLanguages(registry: readonly SiteLanguage[] = ALL): SiteLanguage[] {
  return registry.filter((l) => l.status === 'enabled');
}

export function languageInfo(code: string, registry: readonly SiteLanguage[] = ALL): SiteLanguage | undefined {
  return registry.find((l) => l.code === code);
}

export function isEnabledLanguage(code: string, registry: readonly SiteLanguage[] = ALL): boolean {
  return languageInfo(code, registry)?.status === 'enabled';
}

/** Languages declared but not published: their URL prefixes keep today's behaviour (see legacyLanguageRedirects). */
export function disabledLanguages(registry: readonly SiteLanguage[] = ALL): SiteLanguage[] {
  return registry.filter((l) => l.status === 'disabled');
}

/** Public path of a page under a language prefix: '' → home; anchors stay on that language's home page. */
export function prefixedPath(prefix: string, path = ''): string {
  if (!path) return prefix || '/';
  return path.startsWith('#') ? `${prefix}/${path}` : `${prefix}${path}`;
}

/** Enabled languages that target a market (e.g. CH → the enabled ones among fr, de, it). */
export function languagesForMarket(country: MarketCountry, registry: readonly SiteLanguage[] = ALL): SiteLanguage[] {
  return enabledLanguages(registry).filter((l) => l.markets.includes(country));
}

/**
 * Former French URLs (/fr, /fr/*) redirect to the English page (308) — kept until French is enabled,
 * then removed in the same release. Other disabled prefixes (/de, /es, /it, /nl, /sv, /nb) were never published and keep
 * returning the branded 404 page: no new redirect is created for them.
 */
export const LEGACY_REDIRECT_LANGUAGES = ['fr'] as const;

/** Redirects generated from the registry (consumed by next.config.ts). Same order and values as before 7A. */
export function legacyLanguageRedirects(registry: readonly SiteLanguage[] = ALL) {
  const legacy = LEGACY_REDIRECT_LANGUAGES.filter((code) => !isEnabledLanguage(code, registry));
  return legacy.flatMap((code) => [
    { source: `/${code}`, destination: '/', permanent: true },
    { source: `/${code}/:path*`, destination: '/:path*', permanent: true },
  ]);
}

/** Prefixes whose former one-page URLs (/en/plans, /fr/plans…) point to a home section. */
export function formerPagePrefixes(registry: readonly SiteLanguage[] = ALL): string[] {
  return [DEFAULT_LANGUAGE, ...LEGACY_REDIRECT_LANGUAGES.filter((code) => !isEnabledLanguage(code, registry))];
}
