/**
 * International versions of the site (owner decision, 17/11/2026 — SEO phase 1).
 *
 * One entry per language + country version. The status decides everything:
 * - live:     built everywhere, indexable, in the sitemap and hreflang, orders open;
 * - preview:  built ONLY in the private preview environment (NEXT_PUBLIC_SITE_MODE=preview),
 *             never indexable, never in the sitemap / hreflang, orders closed (server-side);
 * - disabled: declared for planning, never built (no dictionary yet).
 * Phase 2 (18/11/2026): Belgium, Switzerland, Canada (fr + en) and the United Kingdom are in preview,
 * without prices (no validated grid) and without orders.
 *
 * The English home stays at « / » (id « en », internal route /en, rewritten), unchanged.
 * A country only becomes live after the owner validated its broadcasting rights, prices
 * (fixed grid in its own currency — never an automatic conversion) and local information.
 */
export type LocaleStatus = 'live' | 'preview' | 'disabled';
export type Language = 'en' | 'fr' | 'de' | 'es' | 'nl';
/** Price markets (rows of public.markets). Only US has a price grid today. */
export type PriceMarket = 'US' | 'CA' | 'EU' | 'GB' | 'CH' | 'MA';

export interface SiteLocale {
  /** Route segment (« en » is served at « / »). */
  id: string;
  /** Public URL prefix: '' for the English home, '/fr-fr'… otherwise. */
  prefix: string;
  language: Language;
  /** ISO 3166-1 country, or null for the international English version. */
  country: string | null;
  /** hreflang value (BCP 47). */
  hreflang: string;
  /** <html lang> value. */
  htmlLang: string;
  /** Number / currency / date formats (Intl). */
  intl: string;
  /** Open Graph locale. */
  ogLocale: string;
  market: PriceMarket;
  currency: 'USD' | 'CAD' | 'EUR' | 'GBP' | 'CHF' | 'MAD';
  status: LocaleStatus;
}

export const SITE_LOCALES = {
  en: { id: 'en', prefix: '', language: 'en', country: null, hreflang: 'en', htmlLang: 'en', intl: 'en-US', ogLocale: 'en_US', market: 'US', currency: 'USD', status: 'live' },
  'fr-fr': { id: 'fr-fr', prefix: '/fr-fr', language: 'fr', country: 'FR', hreflang: 'fr-FR', htmlLang: 'fr-FR', intl: 'fr-FR', ogLocale: 'fr_FR', market: 'EU', currency: 'EUR', status: 'preview' },
  'fr-be': { id: 'fr-be', prefix: '/fr-be', language: 'fr', country: 'BE', hreflang: 'fr-BE', htmlLang: 'fr-BE', intl: 'fr-BE', ogLocale: 'fr_BE', market: 'EU', currency: 'EUR', status: 'preview' },
  'fr-ch': { id: 'fr-ch', prefix: '/fr-ch', language: 'fr', country: 'CH', hreflang: 'fr-CH', htmlLang: 'fr-CH', intl: 'fr-CH', ogLocale: 'fr_CH', market: 'CH', currency: 'CHF', status: 'preview' },
  'fr-ca': { id: 'fr-ca', prefix: '/fr-ca', language: 'fr', country: 'CA', hreflang: 'fr-CA', htmlLang: 'fr-CA', intl: 'fr-CA', ogLocale: 'fr_CA', market: 'CA', currency: 'CAD', status: 'preview' },
  'fr-ma': { id: 'fr-ma', prefix: '/fr-ma', language: 'fr', country: 'MA', hreflang: 'fr-MA', htmlLang: 'fr-MA', intl: 'fr-MA', ogLocale: 'fr_MA', market: 'MA', currency: 'MAD', status: 'disabled' },
  'en-gb': { id: 'en-gb', prefix: '/en-gb', language: 'en', country: 'GB', hreflang: 'en-GB', htmlLang: 'en-GB', intl: 'en-GB', ogLocale: 'en_GB', market: 'GB', currency: 'GBP', status: 'preview' },
  'en-ca': { id: 'en-ca', prefix: '/en-ca', language: 'en', country: 'CA', hreflang: 'en-CA', htmlLang: 'en-CA', intl: 'en-CA', ogLocale: 'en_CA', market: 'CA', currency: 'CAD', status: 'preview' },
  'de-de': { id: 'de-de', prefix: '/de-de', language: 'de', country: 'DE', hreflang: 'de-DE', htmlLang: 'de-DE', intl: 'de-DE', ogLocale: 'de_DE', market: 'EU', currency: 'EUR', status: 'disabled' },
  'de-ch': { id: 'de-ch', prefix: '/de-ch', language: 'de', country: 'CH', hreflang: 'de-CH', htmlLang: 'de-CH', intl: 'de-CH', ogLocale: 'de_CH', market: 'CH', currency: 'CHF', status: 'disabled' },
  'es-es': { id: 'es-es', prefix: '/es-es', language: 'es', country: 'ES', hreflang: 'es-ES', htmlLang: 'es-ES', intl: 'es-ES', ogLocale: 'es_ES', market: 'EU', currency: 'EUR', status: 'disabled' },
  'nl-be': { id: 'nl-be', prefix: '/nl-be', language: 'nl', country: 'BE', hreflang: 'nl-BE', htmlLang: 'nl-BE', intl: 'nl-BE', ogLocale: 'nl_BE', market: 'EU', currency: 'EUR', status: 'disabled' },
} as const satisfies Record<string, SiteLocale>;

export type LocaleId = keyof typeof SITE_LOCALES;
export const ALL_LOCALE_IDS = Object.keys(SITE_LOCALES) as LocaleId[];

/** The private preview environment also builds the « preview » versions (never the main domain). */
export const IS_PREVIEW_SITE = process.env.NEXT_PUBLIC_SITE_MODE === 'preview';

export function localeInfo(id: LocaleId): SiteLocale {
  return SITE_LOCALES[id];
}

/** Versions open to the public (indexable, orders open). Decided by this file only, on the server and in the build. */
export function liveLocales(registry: Record<string, SiteLocale> = SITE_LOCALES): string[] {
  return Object.values(registry).filter((l) => l.status === 'live').map((l) => l.id);
}

/** Versions generated by this build: live ones, plus preview ones in the private preview environment. */
export function builtLocales(preview = IS_PREVIEW_SITE, registry: Record<string, SiteLocale> = SITE_LOCALES): string[] {
  return Object.values(registry).filter((l) => l.status === 'live' || (preview && l.status === 'preview')).map((l) => l.id);
}

export function isLive(id: string): boolean {
  return (SITE_LOCALES as Record<string, SiteLocale>)[id]?.status === 'live';
}

/** Orders, trials and support requests are only possible on a live version. */
export const commerceOpen = isLive;
