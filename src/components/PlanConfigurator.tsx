'use client';

import dynamic from 'next/dynamic';
import { ArrowRight, Check } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { fill, plural, type Dictionary } from '@/i18n/dictionaries';
import { computeQuote, formatMoney, STREAMS, TERMS, TERM_MONTHS, TIERS, type PriceTable, type StreamCount, type Term, type Tier } from '@/lib/pricing';

const loadDialog = () => import('./CheckoutDialog').then((m) => m.CheckoutDialog);
// Downloaded on demand (prefetched on hover/focus of the button) to keep the initial JS small.
const CheckoutDialog = dynamic(loadDialog, { ssr: false });

export interface ConfiguratorProps {
  locale: Locale;
  table: PriceTable;
  dict: Pick<Dictionary, 'plans' | 'common' | 'markets' | 'checkout'>;
}

export function PlanConfigurator({ locale, table, dict }: ConfiguratorProps) {
  const [tier, setTier] = useState<Tier>('plus');
  const [term, setTerm] = useState<Term>('12m');
  const [streams, setStreams] = useState<StreamCount>(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const simulatorRef = useRef<HTMLDivElement>(null);

  const p = dict.plans;
  const money = (minor: number) => formatMoney(minor, table.currency, locale);
  const quote = computeQuote(table, { tier, term, streams });
  const tierName = p.tiers[tier].name;
  // Claims shown next to the simulator are computed from the price list, so they stay true.
  const bestPct = Math.max(...TIERS.map((t) => computeQuote(table, { tier: t, term: '36m', streams: 1 }).savingsPercent));
  const lowestMonthly = Math.min(...TIERS.map((t) => computeQuote(table, { tier: t, term: '36m', streams: 1 }).monthlyEquivalentMinor ?? Infinity));
  const selectionLabel = `${tierName} · ${p.terms[term]} · ${plural(dict.common, 'device', streams)}`;

  function choose(t: Tier) {
    setTier(t);
    simulatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    simulatorRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className="offers">
      {/* 1. The three yearly plans */}
      <ul className="tier-grid">
        {TIERS.map((t) => {
          const yearly = computeQuote(table, { tier: t, term: '12m', streams: 1 });
          const info = p.tiers[t];
          return (
            <li key={t} className={`tier-card${t === 'plus' ? ' is-recommended' : ''}`} data-tier={t}>
              {t === 'plus' && <span className="tier-badge">{p.recommended}</span>}
              <h3 className="tier-name">{info.name}</h3>
              <p className="tier-tagline">{info.tagline}</p>
              <p className="tier-price">
                <span data-testid={`tier-price-${t}`}>{money(yearly.amountMinor)}</span> <small>{p.perYear}</small>
              </p>
              <ul className="tier-features">
                {info.features.map((f) => (
                  <li key={f}><Check size={16} strokeWidth={2} aria-hidden="true" /> {f}</li>
                ))}
              </ul>
              <button type="button" className="btn block" onClick={() => choose(t)}>
                {fill(p.choose, { plan: info.name })}
              </button>
            </li>
          );
        })}
      </ul>

      {/* 2. Simulator: text on the left (40%), card on the right (60%) */}
      <div className="sim-layout" ref={simulatorRef} tabIndex={-1}>
        <div className="sim-intro">
          <div className="eyebrow">{p.simulatorEyebrow}</div>
          <h3 id="simulator-title" className="sim-title">
            {p.simulatorTitleA} <span className="hl">{fill(p.simulatorTitleB, { pct: bestPct })}</span>
          </h3>
          <p className="sim-sub">{p.simulatorSub}</p>
          <ul className="list-check sim-points">
            <li>{fill(p.simulatorPoints[0]!, { pct: bestPct })}</li>
            <li>{fill(p.simulatorPoints[1]!, { price: money(lowestMonthly) })}</li>
            <li>{p.simulatorPoints[2]}</li>
            <li>{p.simulatorPoints[3]}</li>
          </ul>
        </div>
      <div className="card config simulator" data-testid="configurator" aria-labelledby="simulator-title">

        <div className="field-title" id="tier-label">{p.tierLabel}</div>
        <div className="choices choices-3" role="group" aria-labelledby="tier-label">
          {TIERS.map((t) => (
            <button key={t} type="button" className="choice" data-tier={t} aria-pressed={t === tier} onClick={() => setTier(t)}>
              {p.tiers[t].name}
            </button>
          ))}
        </div>

        <div className="field-title" id="term-label">{p.termLabel}</div>
        <div className="choices" role="group" aria-labelledby="term-label">
          {TERMS.map((tm) => {
            const q = computeQuote(table, { tier, term: tm, streams });
            return (
              <button key={tm} type="button" className="choice choice-term" data-term={tm} aria-pressed={tm === term} onClick={() => setTerm(tm)}>
                <span>{p.terms[tm]}</span>
                {q.savingsPercent > 0 && <span className="choice-badge">{fill(p.savePct, { pct: q.savingsPercent })}</span>}
                {tm === 'lifetime' && <span className="choice-note">{p.oneTime}</span>}
              </button>
            );
          })}
        </div>

        <div className="field-title" id="streams-label">{p.streamsLabel}</div>
        <div className="choices" role="group" aria-labelledby="streams-label">
          {STREAMS.map((n) => {
            const extra = computeQuote(table, { tier, term, streams: n }).amountMinor - computeQuote(table, { tier, term, streams: 1 }).amountMinor;
            return (
              <button key={n} type="button" className="choice choice-term" data-stream={n} aria-pressed={n === streams} onClick={() => setStreams(n)}>
                <span>{plural(dict.common, 'device', n)}</span>
                <span className="choice-note">{n === 1 ? p.included : `+${money(extra)}`}</span>
              </button>
            );
          })}
        </div>

        <div className="summary">
          <div>
            <small className="label">{p.summaryLabel}</small>
            <strong data-testid="selection">{selectionLabel}</strong>
            <small>{p.notAnOffer}</small>
            {quote.referenceMinor && quote.savingsMinor > 0 && (
              <small className="savings" data-testid="savings">
                {fill(p.savings, { amount: money(quote.savingsMinor), n: (TERM_MONTHS[term] ?? 12) / 12 })}
              </small>
            )}
          </div>
          <div>
            <div className="price" data-testid="price" aria-live="polite">{money(quote.amountMinor)}</div>
            <span className="price-sub">
              {quote.monthlyEquivalentMinor !== null
                ? fill(dict.common.perMonth, { price: money(quote.monthlyEquivalentMinor) })
                : p.oneTime}
            </span>
            <button
              ref={openerRef}
              type="button"
              className="btn"
              onClick={() => setCheckoutOpen(true)}
              onPointerEnter={() => void loadDialog()}
              onFocus={() => void loadDialog()}
              aria-haspopup="dialog"
            >
              {p.previewCheckout} <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      </div>

      {checkoutOpen && (
        <CheckoutDialog
          locale={locale}
          dict={dict}
          selection={{ tier, term, streams }}
          clientPrice={money(quote.amountMinor)}
          onClose={() => {
            setCheckoutOpen(false);
            requestAnimationFrame(() => openerRef.current?.focus());
          }}
        />
      )}
    </div>
  );
}
