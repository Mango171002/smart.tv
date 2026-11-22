import { formatMoney } from '@/lib/pricing';
import type { Locale } from '@/i18n/config';

/**
 * How a price is DISPLAYED in each language (phase 7C). Amounts, currencies and pricing rules are not touched:
 * the amount comes from src/lib/pricing.ts as before.
 * - English: exactly formatMoney() (« $59 », « $4.92 »), unchanged.
 * - French: one format everywhere, with the currency always explicit (USD, not the Canadian dollar):
 *   « 59 $ US », « 4,92 $ US » (French number format, non-breaking spaces).
 */
const FR_SYMBOL: Record<string, string> = { USD: '$ US', CAD: '$ CA', EUR: '€', GBP: '£', CHF: 'CHF' };

export function displayMoney(amountMinor: number, currency: string, locale: Locale): string {
  if (locale !== 'fr') return formatMoney(amountMinor, currency, locale);
  const whole = amountMinor % 100 === 0;
  const n = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(amountMinor / 100);
  return `${n} ${FR_SYMBOL[currency] ?? currency}`;
}

/** Price followed by its currency code where the order window needs it: « $69 USD » (English, unchanged), « 69 $ US » (French). */
export function displayMoneyWithCode(amountMinor: number, currency: string, locale: Locale): string {
  return locale === 'fr' ? displayMoney(amountMinor, currency, locale) : `${formatMoney(amountMinor, currency, locale)} ${currency}`;
}
