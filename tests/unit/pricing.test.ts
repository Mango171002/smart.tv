import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { tableFromRows } from '@/lib/price-source';
import {
  computeQuote,
  formatMoney,
  getStaticPriceTable,
  planKey,
  PricingError,
  STREAMS,
  TERMS,
  TERM_MONTHS,
  TIERS,
  type PriceTable,
} from '@/lib/pricing';

const table = getStaticPriceTable();
const q = (tier: (typeof TIERS)[number], term: (typeof TERMS)[number], streams: (typeof STREAMS)[number] = 1) =>
  computeQuote(table, { tier, term, streams });

describe('offer structure', () => {
  it('has the owner’s yearly prices: Starter 59, Plus 69, Ultra+ 99 USD', () => {
    expect(table.currency).toBe('USD');
    expect(q('starter', '12m').amountMinor).toBe(5900);
    expect(q('plus', '12m').amountMinor).toBe(6900);
    expect(q('ultra', '12m').amountMinor).toBe(9900);
  });

  it('has a price for every tier, term and number of screens (48)', () => {
    for (const tier of TIERS) for (const term of TERMS) for (const n of STREAMS) expect(q(tier, term, n).amountMinor).toBeGreaterThan(0);
    expect(Object.keys(table.prices)).toHaveLength(48);
  });

  it('long-term prices are charm prices ending in .99', () => {
    for (const tier of TIERS) for (const term of ['24m', '36m', 'lifetime'] as const) for (const n of STREAMS) {
      expect(q(tier, term, n).amountMinor % 100).toBe(99);
    }
  });

  it('extra devices per year: +10, +18, +25 USD (12 months)', () => {
    for (const tier of TIERS) {
      const base = q(tier, '12m', 1).amountMinor;
      expect([2, 3, 4].map((n) => q(tier, '12m', n as 2 | 3 | 4).amountMinor - base)).toEqual([1000, 1800, 2500]);
    }
    expect(q('plus', '12m', 4).amountMinor).toBe(9400);
    expect(q('plus', '36m', 2).amountMinor).toBe(16499); // (69 + 10) x 3 x 0.70 = 165.90 -> 164.99
  });

  it('higher tiers always cost more for the same term', () => {
    for (const term of TERMS) {
      expect(q('plus', term).amountMinor).toBeGreaterThan(q('starter', term).amountMinor);
      expect(q('ultra', term).amountMinor).toBeGreaterThan(q('plus', term).amountMinor);
    }
  });

  it('longer terms cost more in total but less per month', () => {
    for (const tier of TIERS) {
      const totals = TERMS.map((t) => q(tier, t).amountMinor);
      expect([...totals].sort((a, b) => a - b)).toEqual(totals);
      const monthly = (['12m', '24m', '36m'] as const).map((t) => q(tier, t).monthlyEquivalentMinor!);
      expect(monthly[1]).toBeLessThan(monthly[0]!);
      expect(monthly[2]).toBeLessThan(monthly[1]!);
    }
  });

  it('computes honest savings against consecutive 12-month plans', () => {
    const s24 = q('starter', '24m');
    expect(s24.referenceMinor).toBe(11800); // 2 x 59
    expect(s24.amountMinor).toBe(9399); // 94.40 -> 93.99
    expect(s24.savingsPercent).toBe(20);
    const s36 = q('starter', '36m');
    expect(s36.amountMinor).toBe(12299); // 123.90 -> 122.99
    expect(s36.savingsMinor).toBe(5401); // 177 - 122.99
    expect(s36.savingsPercent).toBe(30);
    expect(s36.monthlyEquivalentMinor).toBe(342); // 3.42 USD / month
    expect(q('ultra', '12m').savingsMinor).toBe(0);
  });

  it('long-term discounts on every plan and device count: 24 months −20%, 36 months −30%', () => {
    for (const tier of TIERS) for (const n of STREAMS) {
      expect(q(tier, '24m', n).savingsPercent).toBe(20);
      expect(q(tier, '36m', n).savingsPercent).toBe(30);
    }
  });

  it('lifetime is a one-time payment without monthly equivalent or invented savings', () => {
    const l = q('ultra', 'lifetime');
    expect(TERM_MONTHS.lifetime).toBeNull();
    expect(l.amountMinor).toBe(23699);
    expect(l.monthlyEquivalentMinor).toBeNull();
    expect(l.referenceMinor).toBeNull();
    expect(l.savingsPercent).toBe(0);
  });

  it('planned prices are never chargeable and taxes are not computed', () => {
    const r = q('plus', '24m');
    expect(r.status).toBe('illustrative');
    expect(r.chargeable).toBe(false);
    expect(r.taxMinor).toBeNull();
  });

  it('rejects unknown plans and missing prices', () => {
    expect(() => computeQuote(table, { tier: 'gold' as never, term: '12m', streams: 1 })).toThrow(PricingError);
    expect(() => computeQuote(table, { tier: 'plus', term: '6m' as never, streams: 1 })).toThrow(PricingError);
    expect(() => computeQuote(table, { tier: 'plus', term: '12m', streams: 5 as never })).toThrow(PricingError);
    const broken: PriceTable = structuredClone(table);
    delete broken.prices[planKey('plus', '12m', 1)];
    expect(() => computeQuote(broken, { tier: 'plus', term: '12m', streams: 1 })).toThrow(/No price/);
  });
});

describe('formatMoney', () => {
  it('shows whole charm prices without decimals', () => {
    expect(formatMoney(4900, 'USD', 'en')).toBe('$49');
    expect(formatMoney(4900, 'USD', 'fr').replace(/\s/g, ' ')).toBe('49 $');
  });
  it('keeps cents when needed', () => {
    expect(formatMoney(275, 'USD', 'en')).toBe('$2.75');
    expect(formatMoney(275, 'USD', 'fr').replace(/\s/g, ' ')).toBe('2,75 $');
  });
});

describe('database price table', () => {
  const rows = (status: 'illustrative' | 'approved') =>
    TIERS.flatMap((tier) =>
      TERMS.flatMap((term) =>
        STREAMS.map((n) => ({
          currency: 'USD',
          amount_minor: table.prices[planKey(tier, term, n)]!,
          status,
          plans: { tier_code: tier, term, streams: n },
        })),
      ),
    );

  it('builds the table and keeps the planned status', () => {
    const t = tableFromRows(rows('illustrative'))!;
    expect(t.prices['ultra:lifetime:1']).toBe(23699);
    expect(t.prices['ultra:lifetime:4']).toBe(29699);
    expect(t.status).toBe('illustrative');
  });

  it('is approved only when every price is approved', () => {
    const r = rows('approved');
    expect(tableFromRows(r)!.status).toBe('approved');
    r[0]!.status = 'illustrative' as never;
    expect(tableFromRows(r)!.status).toBe('illustrative');
  });

  it('ignores retired and legacy rows, and returns null when incomplete', () => {
    const r = [...rows('illustrative'), { currency: 'USD', amount_minor: 1, status: 'retired' as const, plans: { tier_code: null, term: null, streams: 1 } }];
    expect(tableFromRows(r)!.prices['starter:12m:1']).toBe(5900);
    expect(tableFromRows(rows('illustrative').slice(1))).toBeNull();
  });

  it('seed.sql matches the built-in price list', () => {
    const sql = readFileSync('supabase/seed.sql', 'utf8');
    for (const tier of TIERS) for (const term of TERMS) for (const n of STREAMS) {
      expect(sql).toContain(`('${tier}', '${term}', ${n}, ${table.prices[planKey(tier, term, n)]})`);
    }
  });
});
