import { DURATIONS, MARKETS, MARKET_CODES, STREAMS } from '@/config/markets';
import type { Locale } from '@/i18n/config';
import { fill, plural, type Dictionary } from '@/i18n/dictionaries';
import { formatMoney, planKey, type PriceTables } from '@/lib/pricing';

export function PriceMatrix({ locale, tables, dict }: { locale: Locale; tables: PriceTables; dict: Dictionary }) {
  return (
    <div>
      {MARKET_CODES.map((code) => {
        const t = tables[code];
        return (
          <div className="table-wrap" key={code} tabIndex={0} role="region" aria-label={`${dict.plans.matrixTitle} — ${dict.markets[code]}`}>
            <table className="matrix">
              <caption>
                <span className="badge">{t.status === 'approved' ? '✓' : dict.common.illustrative}</span>{' '}
                {MARKETS[code].flag}{' '}
                {fill(dict.plans.matrixCaption, { currency: t.currency, market: dict.markets[code] })}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{dict.plans.duration}</th>
                  {STREAMS.map((s) => <th scope="col" key={s}>{plural(dict.common, 'stream', s)}</th>)}
                </tr>
              </thead>
              <tbody>
                {DURATIONS.map((d) => (
                  <tr key={d}>
                    <th scope="row">{plural(dict.common, 'month', d)}</th>
                    {STREAMS.map((s) => {
                      const v = t.prices[planKey(d, s)];
                      return <td key={s}>{typeof v === 'number' ? formatMoney(v, t.currency, locale) : '—'}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
