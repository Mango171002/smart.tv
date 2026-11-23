import { describe, expect, it } from 'vitest';
import { getDictionary } from '@/i18n/dictionaries';
import type { Dictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';

/**
 * Phase 12 copy polish (AI edits, not a native-speaker validation): plan wording, device wording, summary term,
 * dashes and English spelling. Prices, legal, refund, consent and privacy wording are not part of it.
 */
const ALL = ['en', 'fr', 'de', 'es', 'it', 'nl', 'sv', 'nb'] as Locale[];
const d = (l: Locale) => getDictionary(l);
const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];

describe('phase 12 copy polish', () => {
  it('first « How it works » step: choose a plan (not the content bundle)', () => {
    expect(Object.fromEntries(ALL.map((l) => [l, d(l).how.steps[0]!.text]))).toEqual({
      en: 'Choose your plan', fr: 'Choisissez votre formule', de: 'Wählen Sie Ihren Tarif', es: 'Elige tu plan',
      it: 'Scegli il tuo piano', nl: 'Kies je abonnement', sv: 'Välj ditt paket', nb: 'Velg abonnementet ditt',
    });
  });

  it('« Flexible plans » counts devices, not screens', () => {
    expect(Object.fromEntries(ALL.map((l) => [l, d(l).benefits[1]!.text]))).toEqual({
      en: 'Up to 4 devices, 1 to 3 years', fr: 'Jusqu’à 4 appareils, de 1 à 3 ans', de: 'Bis zu 4 Geräte, 1 bis 3 Jahre',
      es: 'Hasta 4 dispositivos, de 1 a 3 años', it: 'Fino a 4 dispositivi, da 1 a 3 anni', nl: 'Tot 4 apparaten, 1 tot 3 jaar',
      sv: 'Upp till 4 enheter, 1 till 3 år', nb: 'Opptil 4 enheter, 1 til 3 år',
    });
  });

  it('Ultra+ note names the plan (nl, nb, es)', () => {
    expect(d('nl').plans.tiers.ultra.note).toBe('Ons meest complete abonnement · 4K/HDR en tv-gids waar beschikbaar.');
    expect(d('nb').plans.tiers.ultra.note).toBe('Vårt mest komplette abonnement · 4K/HDR og TV-guide der tilgjengelig.');
    expect(d('es').plans.tiers.ultra.note).toBe('Nuestro plan más completo · 4K/HDR y guía de TV según disponibilidad.');
  });

  it.each(ALL)('%s: plan summary label = order summary title', (l) => {
    expect(d(l).plans.summaryLabel).toBe(d(l).checkout.summary.title);
  });

  it('English: « Choose {plan} » on the plan cards; « email », not « e-mail », outside the prelaunch block', () => {
    expect(d('en').plans.choose).toBe('Choose {plan}');
    const { prelaunch: _owned, ...rest } = d('en') as Dictionary;
    for (const s of strings(rest)) expect(s, s).not.toMatch(/e-mail/i);
  });

  it('German: « Loslegen », « Mehrere Geräte », « Kostenlos testen »', () => {
    expect(d('de').nav.getStarted).toBe('Loslegen');
    expect(d('de').footer.chips).toEqual(['Mehrere Geräte', 'Kostenlos testen']);
  });

  it.each(['nl', 'nb'] as Locale[])('%s: spaced en dash (–) in running text, not the em dash', (l) => {
    // Not checked: title separators (meta), the legal documents (English-only pages; see the sensitive-wording register),
    // and hero.lead / cta.text (edited in parallel in phase 12).
    const { meta: _m, legal: _l, hero, cta, ...rest } = d(l) as Dictionary;
    const { lead: _lead, ...heroRest } = hero;
    const { text: _text, ...ctaRest } = cta;
    for (const s of strings([rest, heroRest, ctaRest])) expect(s, s).not.toContain('—');
  });
});
