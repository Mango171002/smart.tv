'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MARKETS, type DurationMonths, type MarketCode, type StreamCount } from '@/config/markets';
import type { Locale } from '@/i18n/config';
import { plural, type Dictionary } from '@/i18n/dictionaries';
import { formatMoney } from '@/lib/pricing';

type Step = 1 | 2 | 3;

interface ServerQuote {
  amountMinor: number;
  currency: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CheckoutDialog({
  locale,
  dict,
  selection,
  clientPrice,
  onClose,
}: {
  locale: Locale;
  dict: Pick<Dictionary, 'checkout' | 'common' | 'markets'>;
  selection: { market: MarketCode; durationMonths: DurationMonths; streams: StreamCount };
  clientPrice: string;
  onClose: () => void;
}) {
  const c = dict.checkout;
  const [step, setStep] = useState<Step>(1);
  const [quote, setQuote] = useState<ServerQuote | null>(null);
  const [quoteState, setQuoteState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Focus management: move focus into the dialog, trap Tab, close on Escape.
  useEffect(() => {
    const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (step > 1) titleRef.current?.focus();
  }, [step]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === titleRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  async function review() {
    setStep(2);
    setQuoteState('loading');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(selection),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { quote: ServerQuote };
      setQuote(data.quote);
      setQuoteState('ok');
    } catch {
      setQuoteState('error');
    }
  }

  const regionLabel = `${MARKETS[selection.market].flag} ${dict.markets[selection.market]} · ${MARKETS[selection.market].currency}`;
  const planLabel = `${plural(dict.common, 'month', selection.durationMonths)} · ${plural(dict.common, 'stream', selection.streams)}`;
  const subtotal = quote ? `${formatMoney(quote.amountMinor, quote.currency, locale)} ${quote.currency}` : clientPrice;

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onKeyDown={onKeyDown}
        data-testid="checkout-dialog"
      >
        <div className="modalhead">
          <h2 id="checkout-title" ref={titleRef} tabIndex={-1}>
            {step === 3 ? c.doneTitle : c.title}
          </h2>
          <button type="button" className="close" aria-label={dict.common.close} onClick={onClose}>✕</button>
        </div>
        <ol className="progress" aria-label={c.title}>
          {c.steps.map((label, i) => (
            <li key={label} data-on={i < step} aria-current={i === step - 1 ? 'step' : undefined}>
              {i + 1} · {label}
            </li>
          ))}
        </ol>

        {step === 1 && (
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              void review();
            }}
          >
            <p className="muted">{c.intro}</p>
            <label htmlFor="demoemail">{c.emailLabel}</label>
            {/* Not named and never sent anywhere: this is a pure UI demonstration. */}
            <input className="input" id="demoemail" type="email" autoComplete="off" placeholder="you@example.com" />
            <label htmlFor="demodevice">{c.deviceLabel}</label>
            <select className="input" id="demodevice">
              {c.deviceOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
            <button type="submit" className="btn block">{c.review} <span aria-hidden="true">→</span></button>
          </form>
        )}

        {step === 2 && (
          <div>
            <p className="muted">{c.reviewIntro}</p>
            <div className="orderline"><span>{c.region}</span><b data-testid="review-region">{regionLabel}</b></div>
            <div className="orderline"><span>{c.plan}</span><b data-testid="review-plan">{planLabel}</b></div>
            <div className="orderline"><span>{c.subtotal}</span><b data-testid="review-price">{subtotal}</b></div>
            <div className="orderline"><span>{c.taxes}</span><b>{dict.common.notCalculated}</b></div>
            <p className="footnote" role="status" data-testid="quote-status">
              {quoteState === 'loading' && c.verifying}
              {quoteState === 'ok' && `✓ ${c.verified}`}
              {quoteState === 'error' && c.quoteError}
            </p>
            <p className="footnote">{c.productionNote}</p>
            <button type="button" className="btn block" onClick={() => setStep(3)} disabled={quoteState === 'loading'}>
              {c.finish} <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="btn ghost block" style={{ marginTop: 10 }} onClick={() => setStep(1)}>
              <span aria-hidden="true">←</span> {dict.common.back}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="success">
            <div className="checkmark" aria-hidden="true">✓</div>
            <p className="muted">{c.doneText}</p>
            <button type="button" className="btn" onClick={onClose}>{c.returnToSite}</button>
          </div>
        )}
      </div>
    </div>
  );
}
