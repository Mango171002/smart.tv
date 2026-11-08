import 'server-only';
import { MARKET_CODES, type DurationMonths, type StreamCount } from '@/config/markets';
import { getPublicSupabase } from '@/lib/supabase/server';
import { getStaticPriceTables, isDuration, isStreamCount, planKey, type PriceTables } from '@/lib/pricing';

export type PriceSource = 'database' | 'static';

const TTL_MS = 5 * 60 * 1000;
let cache: { at: number; value: { tables: PriceTables; source: PriceSource } } | null = null;

interface PriceRow {
  market_code: string;
  currency: string;
  amount_minor: number;
  status: 'illustrative' | 'approved' | 'retired';
  plans: { duration_months: number; streams: number } | null;
}

/** Builds price tables from database rows. Exported for unit tests. */
export function tablesFromRows(rows: PriceRow[]): PriceTables | null {
  const tables = getStaticPriceTables();
  const seen = new Set<string>();
  for (const market of MARKET_CODES) {
    tables[market] = { ...tables[market], prices: {}, status: 'approved' };
  }
  for (const row of rows) {
    if (!(MARKET_CODES as readonly string[]).includes(row.market_code) || !row.plans) continue;
    const { duration_months: d, streams: s } = row.plans;
    if (!isDuration(d) || !isStreamCount(s) || row.status === 'retired') continue;
    const t = tables[row.market_code as (typeof MARKET_CODES)[number]];
    if (t.currency !== row.currency) continue;
    t.prices[planKey(d as DurationMonths, s as StreamCount)] = row.amount_minor;
    // A table is only "approved" when every price in it is approved.
    if (row.status !== 'approved') t.status = 'illustrative';
    seen.add(row.market_code);
  }
  for (const market of MARKET_CODES) {
    if (!seen.has(market)) return null; // incomplete data: fall back to static tables
  }
  return tables;
}

export async function getPriceTables(): Promise<{ tables: PriceTables; source: PriceSource }> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
  let value: { tables: PriceTables; source: PriceSource } = { tables: getStaticPriceTables(), source: 'static' };
  const supabase = getPublicSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('prices')
        .select('market_code, currency, amount_minor, status, plans(duration_months, streams)')
        .abortSignal(AbortSignal.timeout(4000));
      if (!error && data) {
        const tables = tablesFromRows(data as unknown as PriceRow[]);
        if (tables) value = { tables, source: 'database' };
      } else if (error) {
        console.warn('[price-source] falling back to static tables:', error.message);
      }
    } catch (e) {
      console.warn('[price-source] falling back to static tables:', (e as Error).message);
    }
  }
  cache = { at: Date.now(), value };
  return value;
}

export function resetPriceCacheForTests() {
  cache = null;
}
