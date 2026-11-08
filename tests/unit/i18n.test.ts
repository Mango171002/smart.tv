import { describe, expect, it } from 'vitest';
import { negotiateLocale } from '@/i18n/config';
import { fill, getDictionary, plural } from '@/i18n/dictionaries';

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort().map(([k, v]) => [k, shape(v)]));
  }
  return typeof value;
}

describe('dictionaries', () => {
  it('EN and FR have exactly the same structure (keys and list lengths)', () => {
    expect(shape(getDictionary('fr'))).toEqual(shape(getDictionary('en')));
  });

  it('has no empty strings', () => {
    for (const locale of ['en', 'fr'] as const) {
      const walk = (v: unknown): void => {
        if (typeof v === 'string') expect(v.trim().length).toBeGreaterThan(0);
        else if (v && typeof v === 'object') Object.values(v).forEach(walk);
      };
      walk(getDictionary(locale));
    }
  });

  it('keeps the same placeholders in both languages', () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    const en = getDictionary('en');
    const fr = getDictionary('fr');
    expect(placeholders(fr.plans.matrixCaption)).toBe(placeholders(en.plans.matrixCaption));
    expect(placeholders(fr.common.perMonth)).toBe(placeholders(en.common.perMonth));
  });

  it('pluralises', () => {
    const c = getDictionary('en').common;
    expect(plural(c, 'month', 1)).toBe('1 month');
    expect(plural(c, 'month', 12)).toBe('12 months');
    expect(plural(getDictionary('fr').common, 'device', 3)).toBe('3 appareils');
    expect(fill('{a}-{b}', { a: 1, b: 'x' })).toBe('1-x');
  });
});

describe('negotiateLocale', () => {
  it.each([
    [null, 'en'],
    ['fr-CA,fr;q=0.9,en;q=0.8', 'fr'],
    ['de-DE,de;q=0.9', 'en'],
    ['de;q=0.9,fr;q=0.5,en;q=0.4', 'fr'],
    ['en-GB', 'en'],
  ])('%s → %s', (header, expected) => {
    expect(negotiateLocale(header)).toBe(expected);
  });
});
