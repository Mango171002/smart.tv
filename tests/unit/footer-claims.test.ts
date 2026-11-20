import { describe, expect, it } from 'vitest';
import en from '@/i18n/dictionaries/en';

/** Shared footer (every page): no claim that is not proven yet (sports, international channels, picture quality). */
describe('footer wording (phase 5C)', () => {
  const text = [en.footer.tagline, en.footer.about, ...en.footer.chips].join('\n');

  it('keeps the agreed wording', () => {
    expect(en.footer.tagline).toBe('Movies • Series • Live TV');
    expect(en.footer.chips).toEqual(['Multi-device', 'Secure & private']);
  });

  it('makes no sports, international-channel or picture-quality claim', () => {
    for (const re of [/sport/i, /international/i, /channels?/i, /\b4k\b/i, /\bhd\b/i, /\bhdr\b/i, /all your devices/i]) expect(text, String(re)).not.toMatch(re);
  });
});
