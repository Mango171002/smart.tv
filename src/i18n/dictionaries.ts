import en, { type Dictionary } from './dictionaries/en';
import fr from './dictionaries/fr';
import type { Locale } from './config';

/**
 * One dictionary per BUILDABLE (enabled or preview) language. The `Record<Locale, Dictionary>` type makes enabling a language
 * in src/i18n/locales.ts fail the type check until its complete dictionary (same shape as `en`) is added here:
 * a language can never go live half-translated or fall back silently to English.
 * Translations are written or reviewed by native speakers from the validated English (never machine output).
 */
const dictionaries: Record<Locale, Dictionary> = { en, fr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };

/** Replaces `{name}` placeholders. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}

export function plural(dict: Dictionary['common'], kind: 'month' | 'stream' | 'device', n: number): string {
  const singular = dict[kind];
  const many = dict[`${kind}s` as 'months' | 'streams' | 'devices'];
  return n === 1 ? singular : fill(many, { n });
}
