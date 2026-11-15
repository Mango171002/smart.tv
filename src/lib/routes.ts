import type { Locale } from '@/i18n/config';

/** One-page site: everything lives on the home page (owner decision, 11/11/2026). */
export const PAGES = ['', '/blog'] as const;
export const LEGAL_DOCS = ['terms', 'privacy', 'cookies', 'refunds', 'imprint'] as const;
export type LegalDoc = (typeof LEGAL_DOCS)[number];

/** Public URLs carry no language prefix (English only): /en/* is served at /*. */
export const href = (_locale: Locale, path = '') => path || '/';

/** Every public, indexable path (without locale prefix). The blog joins once it has articles (noindex until then). */
export const ALL_PATHS: string[] = ['', ...LEGAL_DOCS.map((d) => `/legal/${d}`)];
