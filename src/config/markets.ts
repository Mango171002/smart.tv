export const MARKET_CODES = ['US', 'CA', 'EU'] as const;
export type MarketCode = (typeof MARKET_CODES)[number];

export const DURATIONS = [1, 3, 6, 12] as const;
export type DurationMonths = (typeof DURATIONS)[number];

export const STREAMS = [1, 2, 3, 4] as const;
export type StreamCount = (typeof STREAMS)[number];

export interface MarketInfo {
  code: MarketCode;
  currency: 'USD' | 'CAD' | 'EUR';
  flag: string;
  /** Territorial rights — unverified for every market. */
  licensed: false;
}

export const MARKETS: Record<MarketCode, MarketInfo> = {
  US: { code: 'US', currency: 'USD', flag: '🇺🇸', licensed: false },
  CA: { code: 'CA', currency: 'CAD', flag: '🇨🇦', licensed: false },
  EU: { code: 'EU', currency: 'EUR', flag: '🇪🇺', licensed: false },
};

export function isMarketCode(value: unknown): value is MarketCode {
  return typeof value === 'string' && (MARKET_CODES as readonly string[]).includes(value);
}

/**
 * Price markets (rows of public.markets — GB, CH and MA come with the phase 3A migration). Each market has
 * its OWN fixed price grid in its own currency, validated by the owner: never an automatic conversion.
 * `MARKET_CODES` above is the customer's region stored with a request (US / CA / EU), not a price market.
 */
export const PRICE_MARKET_CURRENCY = { US: 'USD', CA: 'CAD', EU: 'EUR', GB: 'GBP', CH: 'CHF', MA: 'MAD' } as const;
export type PriceMarketCode = keyof typeof PRICE_MARKET_CURRENCY;
export const isPriceMarket = (v: unknown): v is PriceMarketCode => typeof v === 'string' && v in PRICE_MARKET_CURRENCY;
