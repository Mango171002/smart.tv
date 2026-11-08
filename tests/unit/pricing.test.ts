import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DURATIONS, MARKET_CODES, STREAMS } from '@/config/markets';
import { computeQuote, formatMoney, getStaticPriceTables, planKey, PricingError, type PriceTables } from '@/lib/pricing';
import { tablesFromRows } from '@/lib/price-source';

const tables = getStaticPriceTables();

describe('computeQuote', () => {
  it('reproduces the approved prototype prices exactly', () => {
    expect(computeQuote(tables, { market: 'US', durationMonths: 12, streams: 1 }).amountMinor).toBe(7900);
    expect(computeQuote(tables, { market: 'US', durationMonths: 1, streams: 1 }).amountMinor).toBe(1400);
    expect(computeQuote(tables, { market: 'CA', durationMonths: 12, streams: 1 }).amountMinor).toBe(10428);
    expect(computeQuote(tables, { market: 'EU', durationMonths: 12, streams: 3 }).amountMinor).toBe(15263);
  });

  it('has a complete table for every market, duration and stream count', () => {
    for (const m of MARKET_CODES) for (const d of DURATIONS) for (const s of STREAMS) {
      const q = computeQuote(tables, { market: m, durationMonths: d, streams: s });
      expect(Number.isInteger(q.amountMinor)).toBe(true);
      expect(q.amountMinor).toBeGreaterThan(0);
    }
  });

  it('is monotonic: more streams or longer plans never cost less', () => {
    for (const m of MARKET_CODES) for (const d of DURATIONS) {
      const row = STREAMS.map((s) => computeQuote(tables, { market: m, durationMonths: d, streams: s }).amountMinor);
      expect([...row].sort((a, b) => a - b)).toEqual(row);
    }
  });

  it('uses the market currency, never a converted one', () => {
    expect(computeQuote(tables, { market: 'CA', durationMonths: 1, streams: 1 }).currency).toBe('CAD');
    expect(computeQuote(tables, { market: 'EU', durationMonths: 1, streams: 1 }).currency).toBe('EUR');
  });

  it('marks prototype prices as illustrative and never chargeable', () => {
    const q = computeQuote(tables, { market: 'US', durationMonths: 3, streams: 2 });
    expect(q.status).toBe('illustrative');
    expect(q.chargeable).toBe(false);
    expect(q.taxMinor).toBeNull();
  });

  it('computes a monthly equivalent', () => {
    expect(computeQuote(tables, { market: 'US', durationMonths: 12, streams: 1 }).monthlyEquivalentMinor).toBe(658);
  });

  it('rejects unknown markets and plans', () => {
    expect(() => computeQuote(tables, { market: 'XX' as never, durationMonths: 1, streams: 1 })).toThrow(PricingError);
    expect(() => computeQuote(tables, { market: 'US', durationMonths: 2 as never, streams: 1 })).toThrow(PricingError);
    expect(() => computeQuote(tables, { market: 'US', durationMonths: 1, streams: 9 as never })).toThrow(PricingError);
  });

  it('refuses a missing or corrupted price', () => {
    const broken: PriceTables = structuredClone(tables);
    delete broken.US.prices['1x1'];
    broken.CA.prices['1x1'] = -5;
    expect(() => computeQuote(broken, { market: 'US', durationMonths: 1, streams: 1 })).toThrow(/No price/);
    expect(() => computeQuote(broken, { market: 'CA', durationMonths: 1, streams: 1 })).toThrow(PricingError);
  });
});

describe('formatMoney (locale)', () => {
  it('formats like the prototype in English', () => {
    expect(formatMoney(7900, 'USD', 'en')).toBe('$79.00');
    expect(formatMoney(10428, 'CAD', 'en')).toBe('CA$104.28');
    expect(formatMoney(7268, 'EUR', 'en')).toBe('€72.68');
  });
  it('uses French conventions in French', () => {
    expect(formatMoney(7268, 'EUR', 'fr').replace(/\s/g, ' ')).toBe('72,68 €');
    expect(formatMoney(7900, 'USD', 'fr').replace(/\s/g, ' ')).toBe('79,00 $US');
  });
});

describe('database price tables', () => {
  const rowsFor = (status: 'illustrative' | 'approved') =>
    MARKET_CODES.flatMap((m) =>
      DURATIONS.flatMap((d) =>
        STREAMS.map((s) => ({
          market_code: m,
          currency: tables[m].currency,
          amount_minor: tables[m].prices[planKey(d, s)]!,
          status,
          plans: { duration_months: d, streams: s },
        })),
      ),
    );

  it('builds tables from rows and keeps the illustrative status', () => {
    const t = tablesFromRows(rowsFor('illustrative'))!;
    expect(t.US.prices['12x1']).toBe(7900);
    expect(t.EU.status).toBe('illustrative');
  });

  it('only marks a table approved when every row is approved', () => {
    const rows = rowsFor('approved');
    rows[0]!.status = 'illustrative' as never;
    const t = tablesFromRows(rows)!;
    expect(t[rows[0]!.market_code as 'US'].status).toBe('illustrative');
    expect(t.EU.status).toBe('approved');
  });

  it('ignores rows whose currency does not match the market', () => {
    const rows = rowsFor('illustrative').map((r) => (r.market_code === 'EU' ? { ...r, currency: 'USD' } : r));
    expect(tablesFromRows(rows)).toBeNull(); // EU incomplete → caller falls back to static tables
  });

  it('seed.sql matches the static fallback tables', () => {
    const sql = readFileSync('supabase/seed.sql', 'utf8');
    for (const m of MARKET_CODES) for (const d of DURATIONS) for (const s of STREAMS) {
      expect(sql).toContain(`('${m}', ${d}, ${s}, '${tables[m].currency}', ${tables[m].prices[planKey(d, s)]})`);
    }
  });
});
