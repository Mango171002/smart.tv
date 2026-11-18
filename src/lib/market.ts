import { isPriceMarket, PRICE_MARKET_CURRENCY, type PriceMarketCode } from '@/config/markets';
import { SITE_LOCALES, type LocaleId, type SiteLocale } from '@/i18n/locales';

/**
 * Price market of a request or of a site version (SEO international, phase 3A).
 * Decided on the server from the version (src/i18n/locales.ts), never from what the browser sends.
 * The English home « / » and every request stored before phase 3A (price_market NULL) use the US grid.
 */
export function priceMarketOfLocale(locale: string | null | undefined): PriceMarketCode {
  const l = locale ? (SITE_LOCALES as Record<string, SiteLocale>)[locale] : undefined;
  return l && isPriceMarket(l.market) ? l.market : 'US';
}

export function priceMarketOfRequest(r: { price_market?: string | null; locale?: string | null }): PriceMarketCode {
  if (isPriceMarket(r.price_market)) return r.price_market;
  return 'US';
}

export const currencyOfMarket = (m: PriceMarketCode) => PRICE_MARKET_CURRENCY[m];

/** Value stored in contact_requests.price_market: NULL for the English home (unchanged rows), the market otherwise. */
export function storedPriceMarket(locale: LocaleId): PriceMarketCode | null {
  return locale === 'en' ? null : priceMarketOfLocale(locale);
}
