import type { Locale } from '@/i18n/config';
import { fill, type Dictionary } from '@/i18n/dictionaries';
import { computeQuote, formatMoney, TERMS, TIERS, type PriceTable } from '@/lib/pricing';

/** Full planned price list: tiers (rows) x terms (columns). */
export function PriceMatrix({ locale, table, dict }: { locale: Locale; table: PriceTable; dict: Dictionary }) {
  const p = dict.plans;
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label={p.matrixTitle}>
      <table className="matrix">
        <caption>
          <span className="badge">{table.status === 'approved' ? '✓' : dict.common.illustrative}</span>{' '}
          {fill(p.matrixCaption, { currency: table.currency })}
        </caption>
        <thead>
          <tr>
            <th scope="col">{p.plan}</th>
            {TERMS.map((t) => <th scope="col" key={t}>{p.terms[t]}{t === 'lifetime' ? '*' : ''}</th>)}
          </tr>
        </thead>
        <tbody>
          {TIERS.map((tier) => (
            <tr key={tier}>
              <th scope="row">{p.tiers[tier].name}</th>
              {TERMS.map((term) => {
                const q = computeQuote(table, { tier, term, streams: 1 });
                return (
                  <td key={term}>
                    {formatMoney(q.amountMinor, table.currency, locale)}
                    {q.monthlyEquivalentMinor !== null && term !== '12m' && (
                      <small className="matrix-sub">{fill(dict.common.perMonth, { price: formatMoney(q.monthlyEquivalentMinor, table.currency, locale) })}</small>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="matrix-note">{fill(p.extraStreams, {
        y12: formatMoney(computeQuote(table, { tier: 'starter', term: '12m', streams: 2 }).amountMinor - computeQuote(table, { tier: 'starter', term: '12m', streams: 1 }).amountMinor, table.currency, locale),
        y24: formatMoney(computeQuote(table, { tier: 'starter', term: '24m', streams: 2 }).amountMinor - computeQuote(table, { tier: 'starter', term: '24m', streams: 1 }).amountMinor, table.currency, locale),
        y36: formatMoney(computeQuote(table, { tier: 'starter', term: '36m', streams: 2 }).amountMinor - computeQuote(table, { tier: 'starter', term: '36m', streams: 1 }).amountMinor, table.currency, locale),
        life: formatMoney(computeQuote(table, { tier: 'starter', term: 'lifetime', streams: 2 }).amountMinor - computeQuote(table, { tier: 'starter', term: 'lifetime', streams: 1 }).amountMinor, table.currency, locale),
      })}</p>
    </div>
  );
}
