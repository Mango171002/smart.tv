'use client';

import { ArrowLeft, ArrowRight, Check, CircleCheck, Gift, Mail, MapPin, Monitor, ShieldCheck, Zap, X } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { Brand } from './Brand';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CountryPicker, countryByCode, countryFlag } from './CountryPicker';
import type { MarketCode } from '@/config/markets';
import type { Locale } from '@/i18n/config';
import { fill, plural, type Dictionary } from '@/i18n/dictionaries';
import { formatMoney, type PlanSelection } from '@/lib/pricing';

type Step = 1 | 2 | 3;

/** Device choices (most used first) and the stored category of each — same order as dict.checkout.deviceOptions. */
const DEVICE_CHOICES = [
  ['smart_tv', 'smart_tv'],
  ['android_tv', 'streaming_device'],
  ['fire_tv', 'streaming_device'],
  ['apple_tv', 'streaming_device'],
  ['tv_box', 'streaming_device'],
  ['android_mobile', 'mobile'],
  ['ios_mobile', 'mobile'],
  ['computer', 'computer'],
  ['browser', 'computer'],
] as const;
type DeviceChoice = (typeof DEVICE_CHOICES)[number][0];
const EU = new Set(['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE']);
/** Stored market of a country (prices are in USD everywhere; the region only helps the team). */
const marketOf = (code: string): MarketCode | undefined => (code === 'US' || code === 'CA' ? code : EU.has(code) ? 'EU' : undefined);
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
  const [device, setDevice] = useState<DeviceChoice>('smart_tv');
  const [country, setCountry] = useState('');
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
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
          market: marketOf(country),
          tier: selection.tier,
          term: selection.term,
          streams: selection.streams,
          device: DEVICE_CHOICES.find(([k]) => k === device)?.[1],
          consent: true,
          marketing,
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
    if (!country) errors.region = c.errors.region;
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

  const countryName = countryByCode(country)?.name;
  const regionLabel = countryName ? `${countryFlag(country)} ${countryName}` : '';
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
        className="modal modal-neon"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onKeyDown={onKeyDown}
        data-testid="checkout-dialog"
      >
        <div className="modalhead neon-head">
          <Brand className="modal-logo" />
          <button type="button" className="close" aria-label={dict.common.close} onClick={onClose}>
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
        <h2 id="checkout-title" className="neon-title" ref={titleRef} tabIndex={-1}>
          {step === 3 ? c.doneTitle : <>{c.headA} <span>{c.headHl}</span></>}
        </h2>
        {step !== 3 && <p className="neon-sub">{c.headSub}</p>}
        <ol className="stepper" aria-label={c.title}>
          {c.steps.map((label, i) => (
            <li key={label} data-on={i < step} aria-current={i === step - 1 ? 'step' : undefined}>
              <span className="stepper-num" aria-hidden="true">{i + 1}</span>
              <span className="stepper-label">{label}</span>
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
            <div className="offer-banner">
              <Gift size={30} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <b>{c.offerTitle}</b>
                <span>{c.offerText}</span>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="prereg-email">{c.emailLabel} <span className="req" aria-hidden="true">*</span></label>
                <div className="input-icon">
                  <Mail size={20} strokeWidth={1.75} aria-hidden="true" />
                  <input
                    className="input"
                    id="prereg-email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    placeholder={c.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={fieldError.email ? true : undefined}
                    aria-describedby={fieldError.email ? 'prereg-email-err' : undefined}
                  />
                </div>
                {fieldError.email && <span id="prereg-email-err" className="error">{fieldError.email}</span>}
              </div>
              <div className="field">
                <label htmlFor="prereg-region">{c.regionLabel} <span className="req" aria-hidden="true">*</span></label>
                <CountryPicker
                  id="prereg-region"
                  value={country}
                  onChange={setCountry}
                  placeholder={c.regionPlaceholder}
                  searchLabel={dict.common.countrySearch}
                  noResult={dict.common.countryNoResult}
                  listLabel={dict.common.countryList}
                  icon={<MapPin size={20} strokeWidth={1.75} aria-hidden="true" />}
                  invalid={!!fieldError.region}
                  describedBy={fieldError.region ? 'prereg-region-err' : undefined}
                />
                {fieldError.region && <span id="prereg-region-err" className="error">{fieldError.region}</span>}
              </div>
            </div>
            <div className="field">
              <label htmlFor="prereg-device">{c.deviceLabel} <span className="opt">{c.optional}</span></label>
              <div className="input-icon">
                <Monitor size={20} strokeWidth={1.75} aria-hidden="true" />
                <select
                  className="input"
                  id="prereg-device"
                  value={device}
                  onChange={(e) => setDevice(e.target.value as DeviceChoice)}
                >
                  {c.deviceOptions.map((o, i) => <option key={o} value={DEVICE_CHOICES[i]?.[0]}>{o}</option>)}
                </select>
              </div>
            </div>
            <label className="consent neon-check" htmlFor="prereg-consent">
              <input
                id="prereg-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                aria-invalid={fieldError.consent ? true : undefined}
                aria-describedby={fieldError.consent ? 'prereg-consent-err' : undefined}
              />
              <span>
                {c.consentMain}
                <small>{c.consentSub}</small>
              </span>
            </label>
            {fieldError.consent && <span id="prereg-consent-err" className="error">{fieldError.consent}</span>}
            <label className="consent neon-check" htmlFor="prereg-marketing">
              <input id="prereg-marketing" type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
              <span className="muted">{c.marketingLabel.replace('{brand}', siteConfig.brandName)}</span>
            </label>
            <button type="submit" className="btn btn-lime block neon-cta">{c.review} <ArrowRight size={20} strokeWidth={2} aria-hidden="true" /></button>
            <ul className="neon-trust">
              {c.trust.map((t, i) => {
                const Icon = [ShieldCheck, Zap, Mail][i] ?? ShieldCheck;
                return (
                  <li key={t}>
                    <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                );
              })}
            </ul>
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
            <p className="footnote production-note">{c.productionNote}</p>
            {submitState === 'error' && <div className="alert err" role="alert">{submitError}</div>}
            <button
              type="button"
              className="btn btn-lime block neon-cta"
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
            <button type="button" className="btn btn-lime" onClick={onClose}>{c.returnToSite}</button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
