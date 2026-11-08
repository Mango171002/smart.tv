import prototypeTables from '@/config/prototype-price-tables.json';
import {
  DURATIONS,
  MARKET_CODES,
  STREAMS,
  type DurationMonths,
  type MarketCode,
  type StreamCount,
} from '@/config/markets';

/** Pure pricing logic, shared by the server (authoritative) and the UI (display). */

export type PriceStatus = 'illustrative' | 'approved';
export type PlanKey = `${DurationMonths}x${StreamCount}`;

export interface PriceTable {
  market: MarketCode;
  currency: string;
  /** illustrative = prototype data, never chargeable. */
  status: PriceStatus;
  prices: Partial<Record<PlanKey, number>>;
}

export type PriceTables = Record<MarketCode, PriceTable>;

export interface PlanSelection {
  market: MarketCode;
  durationMonths: DurationMonths;
  streams: StreamCount;
}

export interface Quote extends PlanSelection {
  currency: string;
  amountMinor: number;
  monthlyEquivalentMinor: number;
  status: PriceStatus;
  /** Taxes are never computed in the prototype. */
  taxMinor: null;
  chargeable: boolean;
}

export class PricingError extends Error {
  constructor(
    public readonly code: 'unknown_market' | 'unknown_plan' | 'price_unavailable',
    message: string,
  ) {
    super(message);
    this.name = 'PricingError';
  }
}

export const planKey = (d: DurationMonths, s: StreamCount): PlanKey => `${d}x${s}`;

export function isDuration(v: unknown): v is DurationMonths {
  return typeof v === 'number' && (DURATIONS as readonly number[]).includes(v);
}
export function isStreamCount(v: unknown): v is StreamCount {
  return typeof v === 'number' && (STREAMS as readonly number[]).includes(v);
}

export function computeQuote(tables: PriceTables, sel: PlanSelection): Quote {
  if (!(MARKET_CODES as readonly string[]).includes(sel.market)) {
    throw new PricingError('unknown_market', `Unknown market ${String(sel.market)}`);
  }
  if (!isDuration(sel.durationMonths) || !isStreamCount(sel.streams)) {
    throw new PricingError('unknown_plan', 'Unknown plan');
  }
  const table = tables[sel.market];
  const amount = table?.prices[planKey(sel.durationMonths, sel.streams)];
  if (!table || typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
    throw new PricingError('price_unavailable', 'No price for this plan in this market');
  }
  return {
    ...sel,
    currency: table.currency,
    amountMinor: amount,
    monthlyEquivalentMinor: Math.round(amount / sel.durationMonths),
    status: table.status,
    taxMinor: null,
    // Illustrative prices can never be charged, whatever else is configured.
    chargeable: table.status === 'approved',
  };
}

/** Static fallback tables (illustrative), generated from the approved prototype. */
export function getStaticPriceTables(): PriceTables {
  const out = {} as PriceTables;
  for (const market of MARKET_CODES) {
    const t = prototypeTables.tables[market];
    out[market] = {
      market,
      currency: t.currency,
      status: 'illustrative',
      prices: t.prices as Partial<Record<PlanKey, number>>,
    };
  }
  return out;
}

export function formatMoney(amountMinor: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}
