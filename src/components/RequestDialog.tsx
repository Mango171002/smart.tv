'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Mail, MessageSquareText, Phone, ShieldCheck, UserRound, Zap, X } from 'lucide-react';
import { Brand } from './Brand';
import countries from '@/config/countries.json';
import type { Locale } from '@/i18n/config';
import { fill, type Dictionary } from '@/i18n/dictionaries';

export type RequestMode = 'trial' | 'support';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const EU = new Set(['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE']);
const flag = (code: string) => String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

/** Builds an E.164 number (+<calling code><national number without trunk 0>). */
export function toE164(dial: string, national: string): string | null {
  const digits = national.replace(/\D/g, '').replace(/^0+/, '');
  const full = `${dial}${digits}`;
  return /^[1-9]\d{6,14}$/.test(full) ? `+${full}` : null;
}

function guessCountry(): string {
  if (typeof navigator === 'undefined') return 'US';
  const region = navigator.language?.split('-')[1]?.toUpperCase();
  return region && countries.some((c) => c.code === region) ? region : 'US';
}

export function RequestDialog({
  mode,
  locale,
  dict,
  onClose,
}: {
  mode: RequestMode;
  locale: Locale;
  dict: Pick<Dictionary, 'request' | 'forms' | 'common'>;
  onClose: () => void;
}) {
  const r = dict.request;
  const [country, setCountry] = useState(guessCountry);
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'phone' | 'message' | 'consent', string>>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const [doneName, setDoneName] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const dial = useMemo(() => countries.find((c) => c.code === country)?.dial ?? '1', [country]);

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>('input')?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // After sending, keep the keyboard focus inside the window (on its Close button).
  useEffect(() => {
    if (state === 'done') dialogRef.current?.querySelector<HTMLElement>('.success .btn')?.focus();
  }, [state]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const phone = toE164(dial, String(data.get('phone') ?? ''));
    const message = String(data.get('message') ?? '').trim();
    const e: typeof errors = {};
    if (!name) e.name = r.errors.name;
    if (!EMAIL_RE.test(email)) e.email = r.errors.email;
    if (!phone) e.phone = r.errors.phone;
    if (mode === 'support' && message.length < 10) e.message = r.errors.message;
    if (data.get('consent') !== 'on') e.consent = r.errors.consent;
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setState('sending');
    setServerError('');
    const market = country === 'US' || country === 'CA' ? country : EU.has(country) ? 'EU' : undefined;
    const payload =
      mode === 'trial'
        ? { kind: 'trial_request', name, email, phone, locale, market, consent: true, website: data.get('website') || undefined }
        : { kind: 'support', name, email, phone, subject: r.supportSubject, message, locale, market, consent: true, website: data.get('website') || undefined };
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setDoneName(name);
        setState('done');
        return;
      }
      setState('error');
      setServerError(res.status === 429 ? r.errors.rateLimited : r.errors.generic);
    } catch {
      setState('error');
      setServerError(r.errors.generic);
    }
  }

  const field = (name: keyof typeof errors) => ({
    id: `req-${name}`,
    name,
    'aria-invalid': errors[name] ? (true as const) : undefined,
    'aria-describedby': errors[name] ? `req-${name}-err` : undefined,
  });
  const err = (name: keyof typeof errors) =>
    errors[name] ? <span id={`req-${name}-err`} className="error">{errors[name]}</span> : null;
  const title = mode === 'trial' ? r.trialTitle : r.supportTitle;

  return createPortal(
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className="modal request-modal modal-neon" role="dialog" aria-modal="true" aria-labelledby="request-title" onKeyDown={onKeyDown} data-testid="request-dialog">
        <div className="modalhead neon-head">
          <Brand className="modal-logo" />
          <button type="button" className="close" aria-label={dict.common.close} onClick={onClose}>
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
        <h2 id="request-title" className="neon-title" aria-label={state === 'done' ? r.successTitle : title}>
          {state === 'done' ? r.successTitle : mode === 'trial' ? <>{r.trialHeadA} <span>{r.trialHeadHl}</span></> : <>{r.supportHeadA} <span>{r.supportHeadHl}</span></>}
        </h2>

        {state === 'done' ? (
          <div className="success" role="status">
            <span className="checkmark"><CheckCircle2 size={44} strokeWidth={1.75} aria-hidden="true" /></span>
            <p>{fill(r.successText, { name: doneName })}</p>
            <button type="button" className="btn" onClick={onClose}>{dict.common.close}</button>
          </div>
        ) : (
          <form className="form" noValidate onSubmit={onSubmit}>
            <p className="neon-sub">{mode === 'trial' ? r.trialIntro : r.supportIntro}</p>
            <div className="hp" aria-hidden="true">
              <label htmlFor="req-website">Website</label>
              <input id="req-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="req-name">{r.nameLabel} <span className="req" aria-hidden="true">*</span></label>
                <div className="input-icon">
                  <UserRound size={20} strokeWidth={1.75} aria-hidden="true" />
                  <input className="input" autoComplete="name" maxLength={120} placeholder={r.namePlaceholder} {...field('name')} />
                </div>
                {err('name')}
              </div>
              <div className="field">
                <label htmlFor="req-email">{r.emailLabel} <span className="req" aria-hidden="true">*</span></label>
                <div className="input-icon">
                  <Mail size={20} strokeWidth={1.75} aria-hidden="true" />
                  <input className="input" type="email" autoComplete="email" maxLength={254} placeholder={r.emailPlaceholder} {...field('email')} />
                </div>
                {err('email')}
              </div>
            </div>

            <label htmlFor="req-phone">{r.phoneLabel} <span className="req" aria-hidden="true">*</span></label>
            <div className="phone-row">
              <select className="input" aria-label={r.countryLabel} value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="tel-country-code">
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {flag(c.code)} {c.name} (+{c.dial})
                  </option>
                ))}
              </select>
              <div className="phone-input">
                <Phone className="phone-icon" size={18} strokeWidth={1.75} aria-hidden="true" />
                <span aria-hidden="true">+{dial}</span>
                <input className="input" type="tel" inputMode="tel" autoComplete="tel-national" maxLength={20} placeholder={r.phonePlaceholder} {...field('phone')} />
              </div>
            </div>
            {err('phone')}

            {mode === 'support' && (
              <>
                <label htmlFor="req-message">{r.messageLabel}</label>
                <div className="input-icon textarea-icon">
                  <MessageSquareText size={20} strokeWidth={1.75} aria-hidden="true" />
                  <textarea className="input" maxLength={4000} rows={4} placeholder={r.messagePlaceholder} {...field('message')} />
                </div>
                {err('message')}
              </>
            )}

            <label className="consent neon-check" htmlFor="req-consent">
              <input type="checkbox" {...field('consent')} />
              <span>{dict.forms.consent}</span>
            </label>
            {err('consent')}

            <div aria-live="polite" role="status">{state === 'error' && serverError && <div className="alert err">{serverError}</div>}</div>

            <button type="submit" className="btn btn-lime block neon-cta" disabled={state === 'sending'}>
              {state === 'sending' ? r.sending : r.send}
            </button>
            <ul className="neon-trust">
              {r.trust.map((t, i) => {
                const Icon = [ShieldCheck, Mail, Zap][i] ?? ShieldCheck;
                return (
                  <li key={t}>
                    <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                );
              })}
            </ul>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
