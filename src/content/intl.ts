/**
 * Localized content beyond the interface (SEO international, phase 2): FAQ page and installation guides.
 * - Guides: ONE set per language, hosted by the language's main version (French → /fr-fr/guides);
 *   the other versions of the language link to it (no duplicated pages).
 * - FAQ: one page per version, because some answers really differ by country (currency, consumer law).
 * English versions have no FAQ page or guides yet: « / » is unchanged.
 */
import { SITE_LOCALES, type Language, type LocaleId } from '@/i18n/locales';
import { type FaqItem, FR_FAQ } from './fr/faq';
import { FR_GUIDES, FR_GUIDES_INTRO } from './fr/guides';

const GUIDES_HOME: Partial<Record<Language, LocaleId>> = { fr: 'fr-fr' };

/** Version hosting the guides of this version's language (null: no guides in this language). */
export function guidesLocale(locale: LocaleId): LocaleId | null {
  return GUIDES_HOME[SITE_LOCALES[locale].language] ?? null;
}

export function guidesFor(locale: LocaleId) {
  if (guidesLocale(locale) !== locale) return null;
  return { intro: FR_GUIDES_INTRO, guides: FR_GUIDES };
}

const CH_PRICE = 'Trois formules annuelles sont proposées — Starter, Plus et Ultra+ — sur 12, 24 ou 36 mois, avec une remise sur les durées longues. Les prix en francs suisses s’afficheront dans la section Formules dès leur validation ; le prix final, taxes comprises, est toujours indiqué avant le paiement.';
const CA_PRICE = 'Trois formules annuelles sont proposées — Starter, Plus et Ultra+ — sur 12, 24 ou 36 mois, avec une remise sur les durées longues. Les prix en dollars canadiens s’afficheront dans la section Formules dès leur validation ; les taxes applicables sont toujours indiquées avant la confirmation de votre commande.';
const REFUND_NO_EU = 'Oui. Si vous n’êtes pas satisfait, demandez-le dans les 7 jours suivant l’activation et vous êtes remboursé à 100 %. Vos droits légaux de consommateur s’appliquent toujours.';

/** FAQ page of a version (null: no FAQ page). Country answers marked « à valider » in docs/INTERNATIONAL.md. */
export function faqFor(locale: LocaleId): FaqItem[] | null {
  if (SITE_LOCALES[locale].language !== 'fr') return null;
  const swap = (id: string, a: string) => (f: FaqItem) => (f.id === id ? { ...f, a } : f);
  if (locale === 'fr-ch') return FR_FAQ.map(swap('prix', CH_PRICE)).map(swap('remboursement', REFUND_NO_EU));
  if (locale === 'fr-ca') {
    const courriel = (s: string) => s.replace(/\bpar e-mail/g, 'par courriel').replace(/\be-mail\b/g, 'courriel');
    return FR_FAQ.map(swap('prix', CA_PRICE)).map(swap('remboursement', REFUND_NO_EU)).map((f) => ({ ...f, a: courriel(f.a) }));
  }
  return FR_FAQ;
}
