'use client';

import { ArrowLeft, ArrowRight, Check, CircleCheck, X } from 'lucide-react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MARKETS, MARKET_CODES, type MarketCode } from '@/config/markets';
import type { Locale } from '@/i18n/config';
import { fill, plural, type Dictionary } from '@/i18n/dictionaries';
import { formatMoney, type PlanSelection } from '@/lib/pricing';

type Step = 1 | 2 | 3;

const DEVICE_KEYS = ['smart_tv', 'streaming_device', 'mobile', 'computer'] as const;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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
  dict: Pick<Dictionary, 'checkout' | 'common' | 'markets' | 'plans'>;
  selection: PlanSelection;
  clientPrice: string;
  onClose: () => void;
}) {
  const c = dict.checkout;
  const [step, setStep] = useState<Step>(1);
  const [quote, setQuote] = useState<ServerQuote | null>(null);
  const [quoteState, setQuoteState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [email, setEmail] = useState('');
  const [device, setDevice] = useState<(typeof DEVICE_KEYS)[number]>('smart_tv');
  const [market, setMarket] = useState<MarketCode | ''>('');
  const [consent, setConsent] = useState(false);
  const [fieldError, setFieldError] = useState<{ email?: string; region?: string; consent?: string }>({});
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
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

  async function confirm() {
    setSubmitState('sending');
    setSubmitError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'launch_waitlist',
          email: email.trim(),
          locale,
          market,
          tier: selection.tier,
          term: selection.term,
          streams: selection.streams,
          device,
          consent: true,
        }),
      });
      if (res.ok) {
        setSubmitState('idle');
        setStep(3);
        return;
      }
      setSubmitState('error');
      setSubmitError(res.status === 429 ? c.errors.rateLimited : res.status === 503 ? c.errors.unavailable : c.errors.generic);
    } catch {
      setSubmitState('error');
      setSubmitError(c.errors.generic);
    }
  }

  async function review() {
    const errors: { email?: string; region?: string; consent?: string } = {};
    if (!EMAIL_RE.test(email.trim())) errors.email = c.errors.email;
    if (!market) errors.region = c.errors.region;
    if (!consent) errors.consent = c.errors.consent;
    setFieldError(errors);
    if (Object.keys(errors).length) {
      dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
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

  const regionLabel = market ? `${MARKETS[market].flag} ${dict.markets[market]}` : '';
  const planLabel = `${dict.plans.tiers[selection.tier].name} · ${dict.plans.terms[selection.term]} · ${plural(dict.common, 'device', selection.streams)}`;
  const subtotal = quote ? `${formatMoney(quote.amountMinor, quote.currency, locale)} ${quote.currency}` : clientPrice;

  // Rendered in <body> through a portal: a transformed ancestor (e.g. a card's hover
  // lift) would otherwise become the containing block of this fixed overlay.
  return createPortal(
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
          <button type="button" className="close" aria-label={dict.common.close} onClick={onClose}>
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
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
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void review();
            }}
          >
            <p className="muted">{c.intro}</p>
            <label htmlFor="prereg-email">{c.emailLabel}</label>
            <input
              className="input"
              id="prereg-email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={fieldError.email ? true : undefined}
              aria-describedby={fieldError.email ? 'prereg-email-err' : undefined}
            />
            {fieldError.email && <span id="prereg-email-err" className="error">{fieldError.email}</span>}
            <label htmlFor="prereg-region">{c.regionLabel}</label>
            <select
              className="input"
              id="prereg-region"
              value={market}
              onChange={(e) => setMarket(e.target.value as MarketCode | '')}
              aria-invalid={fieldError.region ? true : undefined}
              aria-describedby={fieldError.region ? 'prereg-region-err' : undefined}
            >
              <option value="">—</option>
              {MARKET_CODES.map((code) => (
                <option key={code} value={code}>{MARKETS[code].flag} {dict.markets[code]}</option>
              ))}
            </select>
            {fieldError.region && <span id="prereg-region-err" className="error">{fieldError.region}</span>}
            <label htmlFor="prereg-device">{c.deviceLabel}</label>
            <select
              className="input"
              id="prereg-device"
              value={device}
              onChange={(e) => setDevice(e.target.value as (typeof DEVICE_KEYS)[number])}
            >
              {c.deviceOptions.map((o, i) => <option key={o} value={DEVICE_KEYS[i]}>{o}</option>)}
            </select>
            <label className="consent" htmlFor="prereg-consent">
              <input
                id="prereg-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                aria-invalid={fieldError.consent ? true : undefined}
                aria-describedby={fieldError.consent ? 'prereg-consent-err' : undefined}
              />
              <span>{c.consentLabel}</span>
            </label>
            {fieldError.consent && <span id="prereg-consent-err" className="error">{fieldError.consent}</span>}
            <button type="submit" className="btn block">{c.review} <ArrowRight size={18} strokeWidth={2} aria-hidden="true" /></button>
          </form>
        )}

        {step === 2 && (
          <div>
            <p className="muted">{c.reviewIntro}</p>
            <div className="orderline"><span>{c.region}</span><b data-testid="review-region">{regionLabel}</b></div>
            <div className="orderline"><span>{c.plan}</span><b data-testid="review-plan">{planLabel}</b></div>
            <div className="orderline"><span>{c.subtotal}</span><b data-testid="review-price">{subtotal}</b></div>
            <div className="orderline"><span>{c.taxes}</span><b>{c.taxesValue}</b></div>
            <p className="footnote" role="status" data-testid="quote-status">
              {quoteState === 'loading' && c.verifying}
              {quoteState === 'ok' && <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Check size={14} strokeWidth={2} aria-hidden="true" /> {c.verified}</span>}
              {quoteState === 'error' && c.quoteError}
            </p>
            <p className="footnote">{c.productionNote}</p>
            {submitState === 'error' && <div className="alert err" role="alert">{submitError}</div>}
            <button
              type="button"
              className="btn block"
              onClick={() => void confirm()}
              disabled={quoteState === 'loading' || submitState === 'sending'}
            >
              {submitState === 'sending' ? c.sending : c.finish} <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </button>
            <button type="button" className="btn ghost block" style={{ marginTop: 10 }} onClick={() => setStep(1)}>
              <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" /> {dict.common.back}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="success">
            <div className="checkmark" aria-hidden="true"><CircleCheck size={56} strokeWidth={1.75} /></div>
            <p className="muted">{fill(c.doneText, { email: email.trim() })}</p>
            <button type="button" className="btn" onClick={onClose}>{c.returnToSite}</button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
