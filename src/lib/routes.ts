import { siteConfig } from '@/config/site';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/config';
import { SITE_LANGUAGES, prefixedPath } from '@/i18n/locales';

/** One-page site: everything lives on the home page (owner decision, 11/11/2026). */
export const PAGES = ['', '/blog'] as const;
export const LEGAL_DOCS = ['terms', 'privacy', 'cookies', 'refunds', 'imprint'] as const;
export type LegalDoc = (typeof LEGAL_DOCS)[number];

/**
 * Public path of a page in a language: the language prefix (none for English) + the same English slug
 * under every prefix (/help, /fr/help, /de/help…). '' is the home page. Anchors (#plans) stay on the home.
 * English: unchanged (/, /legal/privacy, /#plans).
 */
export function localizedPath(locale: Locale, path = ''): string {
  return prefixedPath(SITE_LANGUAGES[locale].prefix, path);
}

/** Absolute URL of a page in a language (canonical, sitemap, hreflang, JSON-LD). */
export const absoluteUrl = (locale: Locale, path = '') => `${siteConfig.siteUrl}${localizedPath(locale, path)}`;

/** Public URLs: the English pages carry no language prefix (/en/* is served at /*). */
export const href = (locale: Locale, path = '') => localizedPath(locale, path);

/**
 * Splits a public pathname into its language and page path (/fr/help → fr + /help; /help → en + /help).
 * Only built (enabled) languages are recognised: a disabled prefix is not a language of this site.
 */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first = '', ...rest] = pathname.split('/');
  if (isLocale(first) && SITE_LANGUAGES[first].prefix !== '') return { locale: first, path: rest.length ? `/${rest.join('/')}` : '' };
  return { locale: DEFAULT_LOCALE, path: pathname === '/' ? '' : pathname };
}

/** Every public, indexable path (without locale prefix). The blog joins once it has articles (noindex until then). */
export const ALL_PATHS: string[] = ['', ...LEGAL_DOCS.map((d) => `/legal/${d}`)];
