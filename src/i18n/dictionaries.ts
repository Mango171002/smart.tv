import en, { type Dictionary } from './dictionaries/en';
import type { Locale } from './config';

const dictionaries: Record<Locale, Dictionary> = { en };

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
