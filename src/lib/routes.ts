import type { Locale } from '@/i18n/config';

export const PAGES = ['', '/plans', '/devices', '/coverage', '/help'] as const;
export const LEGAL_DOCS = ['terms', 'privacy', 'cookies', 'refunds', 'imprint'] as const;
export type LegalDoc = (typeof LEGAL_DOCS)[number];

export const href = (locale: Locale, path = '') => `/${locale}${path}`;

/** Every public, indexable path (without locale prefix). */
export const ALL_PATHS: string[] = [...PAGES, ...LEGAL_DOCS.map((d) => `/legal/${d}`)];
