'use client';

import { useRef, useState } from 'react';
import { DURATIONS, MARKETS, MARKET_CODES, STREAMS, type DurationMonths, type MarketCode, type StreamCount } from '@/config/markets';
import type { Locale } from '@/i18n/config';
import { fill, plural, type Dictionary } from '@/i18n/dictionaries';
import { computeQuote, formatMoney, type PriceTables } from '@/lib/pricing';
import { CheckoutDialog } from './CheckoutDialog';

export interface ConfiguratorProps {
  locale: Locale;
  tables: PriceTables;
  dict: Pick<Dictionary, 'plans' | 'common' | 'markets' | 'checkout'>;
  initial?: { market?: MarketCode; durationMonths?: DurationMonths; streams?: StreamCount };
}

export function PlanConfigurator({ locale, tables, dict, initial }: ConfiguratorProps) {
  const [market, setMarket] = useState<MarketCode>(initial?.market ?? 'US');
  const [durationMonths, setDuration] = useState<DurationMonths>(initial?.durationMonths ?? 12);
  const [streams, setStreams] = useState<StreamCount>(initial?.streams ?? 1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);

  const p = dict.plans;
  const quote = computeQuote(tables, { market, durationMonths, streams });
  const price = formatMoney(quote.amountMinor, quote.currency, locale);
  const perMonth = fill(dict.common.perMonth, { price: formatMoney(quote.monthlyEquivalentMinor, quote.currency, locale) });
  const selectionLabel = `${plural(dict.common, 'month', durationMonths)} · ${plural(dict.common, 'stream', streams)}`;

  return (
    <div className="card config" data-testid="configurator">
      <label className="field-title" htmlFor="region">{p.regionLabel}</label>
      <select id="region" className="fullselect" value={market} onChange={(e) => setMarket(e.target.value as MarketCode)}>
        {MARKET_CODES.map((code) => (
          <option key={code} value={code}>
            {MARKETS[code].flag} {dict.markets[code]} · {MARKETS[code].currency}
          </option>
        ))}
      </select>

      <div className="field-title" id="duration-label">{p.durationLabel}</div>
      <div className="choices" role="group" aria-labelledby="duration-label">
        {DURATIONS.map((d) => (
          <button key={d} type="button" className="choice" data-month={d} aria-pressed={d === durationMonths} onClick={() => setDuration(d)}>
            {plural(dict.common, 'month', d)}
          </button>
        ))}
      </div>

      <div className="field-title" id="streams-label">{p.streamsLabel}</div>
      <div className="choices" role="group" aria-labelledby="streams-label">
        {STREAMS.map((s) => (
          <button key={s} type="button" className="choice" data-stream={s} aria-pressed={s === streams} onClick={() => setStreams(s)}>
            {plural(dict.common, 'device', s)}
          </button>
        ))}
      </div>

      <div className="summary">
        <div>
          <small className="label">{p.summaryLabel}</small>
          <strong data-testid="selection">{selectionLabel}</strong>
          <small>{p.notAnOffer}</small>
        </div>
        <div>
          <div className="price" data-testid="price" aria-live="polite">{price}</div>
          <span className="price-sub">{perMonth}</span>
          <button
            ref={openerRef}
            type="button"
            className="btn"
            onClick={() => setCheckoutOpen(true)}
            aria-haspopup="dialog"
          >
            {p.previewCheckout} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      <div className="footnote">{p.noPayment}</div>

      {checkoutOpen && (
        <CheckoutDialog
          locale={locale}
          dict={dict}
          selection={{ market, durationMonths, streams }}
          clientPrice={price}
          onClose={() => {
            setCheckoutOpen(false);
            requestAnimationFrame(() => openerRef.current?.focus());
          }}
        />
      )}
    </div>
  );
}
