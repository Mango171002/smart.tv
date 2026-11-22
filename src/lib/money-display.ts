import { formatMoney } from '@/lib/pricing';
import type { Locale } from '@/i18n/config';
import { SITE_LANGUAGES } from '@/i18n/locales';

/**
 * How a price is DISPLAYED in each language (phase 7C). Amounts, currencies and pricing rules are not touched:
 * the amount comes from src/lib/pricing.ts as before.
 * - English: exactly formatMoney() (« $59 », « $4.92 »), unchanged.
 * - French: one format everywhere, with the currency always explicit (USD, not the Canadian dollar):
 *   « 59 $ US », « 4,92 $ US » (French number format, non-breaking spaces).
 * - Other languages (phase 8): the language's own number format with the currency CODE, always explicit:
 *   de / es / it / sv / nb « 59 USD », « 4,92 USD »; nl « USD 59 », « USD 4,92 » (Intl, non-breaking spaces).
 */
const FR_SYMBOL: Record<string, string> = { USD: '$ US', CAD: '$ CA', EUR: '€', GBP: '£', CHF: 'CHF' };

export function displayMoney(amountMinor: number, currency: string, locale: Locale): string {
  const whole = amountMinor % 100 === 0;
  const lang = locale as string;
  if (lang === 'en') return formatMoney(amountMinor, currency, locale);
  if (lang !== 'fr') {
    const intl = (SITE_LANGUAGES as Record<string, { intl: string }>)[lang]?.intl ?? 'en-US';
    return new Intl.NumberFormat(intl, { style: 'currency', currency, currencyDisplay: 'code', minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(amountMinor / 100);
  }
  const n = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(amountMinor / 100);
  return `${n} ${FR_SYMBOL[currency] ?? currency}`;
}

/** Price followed by its currency where the order window needs it: « $69 USD » (English, unchanged); every other language already shows it. */
export function displayMoneyWithCode(amountMinor: number, currency: string, locale: Locale): string {
  return (locale as string) === 'en' ? `${formatMoney(amountMinor, currency, locale)} ${currency}` : displayMoney(amountMinor, currency, locale);
}
