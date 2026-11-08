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
