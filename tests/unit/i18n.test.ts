import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/config';
import { fill, getDictionary, plural } from '@/i18n/dictionaries';

describe('dictionary (English only)', () => {
  it('the site is in English only', () => {
    expect(LOCALES).toEqual(['en']);
  });

  it('has no empty strings', () => {
    const walk = (v: unknown): void => {
      if (typeof v === 'string') expect(v.trim().length).toBeGreaterThan(0);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(getDictionary('en'));
  });

  it('pluralises', () => {
    const c = getDictionary('en').common;
    expect(plural(c, 'month', 1)).toBe('1 month');
    expect(plural(c, 'month', 12)).toBe('12 months');
    expect(plural(c, 'device', 3)).toBe('3 devices');
    expect(fill('{a}-{b}', { a: 1, b: 'x' })).toBe('1-x');
  });
});
