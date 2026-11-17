import en, { type Dictionary } from './dictionaries/en';
import fr from './dictionaries/fr';
import type { Locale } from './config';
import { SITE_LOCALES, type Language } from './locales';
import { applyVariant } from './variants';

/** One dictionary per language; country variants are applied on top (src/i18n/variants.ts). */
const dictionaries: Partial<Record<Language, Dictionary>> = { en, fr };

export function getDictionary(locale: Locale): Dictionary {
  const language = SITE_LOCALES[locale].language;
  const dict = dictionaries[language];
  // Never an English page under another language: a version without its dictionary cannot be built.
  if (!dict) throw new Error(`No dictionary for language « ${language} » (version ${locale})`);
  // Country variants (fr-be, fr-ch, fr-ca, en-gb, en-ca): only their real local differences.
  return applyVariant(locale, dict);
}

export function hasDictionary(language: Language): boolean {
  return Boolean(dictionaries[language]);
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
