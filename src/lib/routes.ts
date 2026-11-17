import type { Locale } from '@/i18n/config';
import { SITE_LOCALES } from '@/i18n/locales';

/** One-page site: everything lives on the home page (owner decision, 11/11/2026). */
export const PAGES = ['', '/blog'] as const;
export const LEGAL_DOCS = ['terms', 'privacy', 'cookies', 'refunds', 'imprint'] as const;
export type LegalDoc = (typeof LEGAL_DOCS)[number];

/**
 * Public URL of a page in a version of the site. The English home has no prefix (« / », « /#plans »,
 * « /legal/terms »); other versions are prefixed (« /fr-fr », « /fr-fr#plans », « /fr-fr/legal/terms »).
 * `path` is '' (home), '#section' or '/sub/path'.
 */
export function href(locale: Locale, path = ''): string {
  const prefix = SITE_LOCALES[locale].prefix;
  if (!path) return prefix || '/';
  if (path.startsWith('#')) return `${prefix || '/'}${path}`;
  return `${prefix}${path}`;
}

/** Every public, indexable path of a version (without its prefix). The blog joins once it has articles (noindex until then). */
export const ALL_PATHS: string[] = ['', ...LEGAL_DOCS.map((d) => `/legal/${d}`)];
