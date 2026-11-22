import { describe, expect, it } from 'vitest';
import en from '@/i18n/dictionaries/en';
import fr from '@/i18n/dictionaries/fr';
import { ABOUT, HELP_HUB, HELP_TOPICS, INFO_UI, OWNER_FACTS } from '@/content/en/info';
import { ABOUT_FR, HELP_HUB_FR, HELP_TOPICS_FR, INFO_UI_FR, OWNER_FACTS_FR } from '@/content/fr/info';

/**
 * Phase 7C consistency audit (automated part): every French text carries exactly the same figures as its English
 * source — prices, durations, percentages, device counts, phone number, dates — and the same facts.
 */
const nums = (s: string) => (s.replace(/\{\w+\}/g, '').match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(',', '.')).sort();

function diffs(a: unknown, b: unknown, path = ''): string[] {
  if (typeof a === 'string' && typeof b === 'string') {
    const x = nums(a).join(' ');
    const y = nums(b).join(' ');
    return x === y ? [] : [`${path}: EN[${x}] FR[${y}]`];
  }
  if (Array.isArray(a) && Array.isArray(b)) return a.flatMap((v, i) => diffs(v, b[i], `${path}[${i}]`));
  if (a && typeof a === 'object' && b && typeof b === 'object') return Object.keys(a).flatMap((k) => diffs((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`));
  return [];
}

describe('French / English consistency', () => {
  it('the check itself detects a changed figure', () => {
    expect(diffs({ a: '7 days, 100%' }, { a: '14 jours, 100 %' })).toEqual(['.a: EN[100 7] FR[100 14]']);
  });

  it('interface: same figures in every text', () => {
    expect(diffs(en, fr)).toEqual([]);
  });

  it('About and Help center: same figures in every text', () => {
    expect(diffs([ABOUT, HELP_HUB, HELP_TOPICS, INFO_UI], [ABOUT_FR, HELP_HUB_FR, HELP_TOPICS_FR, INFO_UI_FR])).toEqual([]);
  });

  it('same owner facts: year, hours, six languages, six payment methods', () => {
    expect(OWNER_FACTS_FR.established).toBe(OWNER_FACTS.established);
    expect(OWNER_FACTS_FR.supportHours).toBe(OWNER_FACTS.supportHours);
    expect(OWNER_FACTS_FR.languages).toHaveLength(OWNER_FACTS.languages.length);
    expect(OWNER_FACTS_FR.paymentMethods).toHaveLength(OWNER_FACTS.paymentMethods.length);
    // Brand and method names that are not translated stay identical.
    for (const m of ['PayPal', 'Western Union', 'MoneyGram']) expect(OWNER_FACTS_FR.paymentMethods).toContain(m);
  });
});
