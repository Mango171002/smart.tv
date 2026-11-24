import type { Dictionary } from './dictionaries/en';
import { SITE_LANGUAGES } from './locales';

/**
 * Text helpers with no dictionary import, so client components can use them without pulling every
 * language's dictionary into the browser bundle (dictionaries reach client components as props).
 */

/** Replaces `{name}` placeholders. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}

export function plural(dict: Dictionary['common'], kind: 'month' | 'stream' | 'device', n: number): string {
  const singular = dict[kind];
  const many = dict[`${kind}s` as 'months' | 'streams' | 'devices'];
  return n === 1 ? singular : fill(many, { n });
}

/** A whole number in the language's own format (Intl, the same locale as prices): 35,000 · 35 000 · 35.000. */
export function formatCount(value: number, locale: string): string {
  const intl = (SITE_LANGUAGES as Record<string, { intl: string }>)[locale]?.intl ?? 'en-US';
  return new Intl.NumberFormat(intl, { maximumFractionDigits: 0 }).format(value);
}

/** Legal documents exist in English only: on a page in another language, a link to one is marked hreflang="en". */
export function legalHrefLang(href: string, pageLang: string): { hrefLang?: string } {
  return pageLang !== 'en' && href.startsWith('/legal/') ? { hrefLang: 'en' } : {};
}
