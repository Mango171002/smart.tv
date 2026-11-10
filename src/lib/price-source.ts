import 'server-only';
import { getPublicSupabase } from '@/lib/supabase/server';
import { getStaticPriceTable, isStreamCount, isTerm, isTier, planKey, STREAMS, TERMS, TIERS, type PriceTable } from '@/lib/pricing';

export type PriceSource = 'database' | 'static';

/** Planned prices are published for the US market (USD) for every visitor. */
const PRICE_MARKET = 'US';
const TTL_MS = 5 * 60 * 1000;
let cache: { at: number; value: { table: PriceTable; source: PriceSource } } | null = null;

interface PriceRow {
  currency: string;
  amount_minor: number;
  status: 'illustrative' | 'approved' | 'retired';
  plans: { tier_code: string | null; term: string | null; streams: number } | null;
}

/** Builds the price table from database rows; null when incomplete. Exported for unit tests. */
export function tableFromRows(rows: PriceRow[]): PriceTable | null {
  const t: PriceTable = { currency: 'USD', status: 'approved', prices: {} };
  for (const row of rows) {
    const tier = row.plans?.tier_code;
    const term = row.plans?.term;
    const streams = row.plans?.streams;
    if (!isTier(tier) || !isTerm(term) || !isStreamCount(streams) || row.status === 'retired' || row.currency !== 'USD') continue;
    t.prices[planKey(tier, term, streams)] = row.amount_minor;
    // The table is "approved" only when every price in it is approved.
    if (row.status !== 'approved') t.status = 'illustrative';
  }
  for (const tier of TIERS) for (const term of TERMS) for (const n of STREAMS) if (!t.prices[planKey(tier, term, n)]) return null;
  return t;
}

export async function getPriceTable(): Promise<{ table: PriceTable; source: PriceSource }> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
  let value: { table: PriceTable; source: PriceSource } = { table: getStaticPriceTable(), source: 'static' };
  const supabase = getPublicSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('prices')
        .select('currency, amount_minor, status, plans(tier_code, term, streams)')
        .eq('market_code', PRICE_MARKET)
        .abortSignal(AbortSignal.timeout(4000));
      if (!error && data) {
        const table = tableFromRows(data as unknown as PriceRow[]);
        if (table) value = { table, source: 'database' };
      } else if (error) {
        console.warn('[price-source] falling back to the static table:', error.message);
      }
    } catch (e) {
      console.warn('[price-source] falling back to the static table:', (e as Error).message);
    }
  }
  cache = { at: Date.now(), value };
  return value;
}

export function resetPriceCacheForTests() {
  cache = null;
}
