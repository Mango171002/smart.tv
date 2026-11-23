import { describe, expect, it } from 'vitest';
import en from '@/i18n/dictionaries/en';
import { getDictionary } from '@/i18n/dictionaries';
import { getInfo } from '@/content/info';
import type { Locale } from '@/i18n/config';

/** Shared footer (every page): no claim that is not proven yet (sports, international channels, picture quality). */
describe('footer wording (phase 5C)', () => {
  const text = [en.footer.tagline, en.footer.about, ...en.footer.chips].join('\n');

  it('keeps the agreed wording', () => {
    expect(en.footer.tagline).toBe('Movies • Series • Live TV');
    // Phase 7D: « Secure & private » replaced by a verified fact (same as the French « Essai gratuit »).
    expect(en.footer.chips).toEqual(['Multi-device', 'Free trial']);
  });

  it('makes no sports, international-channel or picture-quality claim', () => {
    for (const re of [/sport/i, /international/i, /channels?/i, /\b4k\b/i, /\bhd\b/i, /\bhdr\b/i, /all your devices/i]) expect(text, String(re)).not.toMatch(re);
  });
});

/** Phase 12: with the Help center published, the footer FAQ link reads footer.faq, the same label as the Help hub's link to the FAQ. */
describe('footer FAQ link label (phase 12)', () => {
  const ALL = ['en', 'fr', 'de', 'es', 'it', 'nl', 'sv', 'nb'] as Locale[];
  it.each(ALL)('%s: footer.faq = the Help hub label for /#faq', (lang) => {
    const label = getInfo(lang).ui.hubRelated.find((l) => l.href.endsWith('#faq'))?.label;
    expect(label, 'Help hub link to the FAQ').toBeTruthy();
    expect(getDictionary(lang).footer.faq).toBe(label);
  });
  it('the per-language labels', () => {
    expect(Object.fromEntries(ALL.map((l) => [l, getDictionary(l).footer.faq]))).toEqual({
      en: 'FAQ', fr: 'FAQ', de: 'FAQ', es: 'Preguntas frecuentes', it: 'FAQ', nl: 'FAQ', sv: 'Vanliga frågor', nb: 'FAQ',
    });
  });
});
