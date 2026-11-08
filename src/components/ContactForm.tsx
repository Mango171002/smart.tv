'use client';

import { useId, useState } from 'react';
import { MARKETS, MARKET_CODES, type MarketCode } from '@/config/markets';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

type Kind = 'support' | 'launch_waitlist';
type FieldErrors = Partial<Record<'name' | 'email' | 'subject' | 'message' | 'consent', string>>;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function ContactForm({
  kind,
  locale,
  dict,
}: {
  kind: Kind;
  locale: Locale;
  dict: Pick<Dictionary, 'forms' | 'markets'>;
}) {
  const f = dict.forms;
  const id = useId();
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(data: FormData): FieldErrors {
    const e: FieldErrors = {};
    const email = String(data.get('email') ?? '').trim();
    if (!EMAIL_RE.test(email)) e.email = f.errors.emailInvalid;
    if (kind === 'support') {
      if (!String(data.get('name') ?? '').trim()) e.name = f.errors.required;
      if (!String(data.get('subject') ?? '').trim()) e.subject = f.errors.required;
      if (String(data.get('message') ?? '').trim().length < 10) e.message = f.errors.messageShort;
    }
    if (data.get('consent') !== 'on') e.consent = f.errors.consentRequired;
    return e;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const fieldErrors = validate(data);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) {
      setStatus('error');
      setMessage(f.errors.invalid);
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    setStatus('sending');
    const payload: Record<string, unknown> = {
      kind,
      email: data.get('email'),
      locale,
      consent: true,
      website: data.get('website') || undefined,
    };
    const market = data.get('market');
    if (market) payload.market = market as MarketCode;
    const name = String(data.get('name') ?? '').trim();
    if (name) payload.name = name;
    if (kind === 'support') {
      payload.subject = data.get('subject');
      payload.message = data.get('message');
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus('ok');
        setMessage(kind === 'support' ? f.successSupport : f.successWaitlist);
        form.reset();
        return;
      }
      setStatus('error');
      setMessage(
        res.status === 429 ? f.errors.rateLimited : res.status === 503 ? f.errors.unavailable : res.status === 400 ? f.errors.invalid : f.errors.generic,
      );
    } catch {
      setStatus('error');
      setMessage(f.errors.generic);
    }
  }

  const field = (name: keyof FieldErrors) => ({
    id: `${id}-${name}`,
    name,
    'aria-invalid': errors[name] ? (true as const) : undefined,
    'aria-describedby': errors[name] ? `${id}-${name}-err` : undefined,
  });
  const err = (name: keyof FieldErrors) =>
    errors[name] ? <span id={`${id}-${name}-err`} className="error">{errors[name]}</span> : null;

  return (
    <form className="form" noValidate onSubmit={onSubmit} data-testid={`form-${kind}`}>
      <div className="hp" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label htmlFor={`${id}-name`}>{kind === 'support' ? f.name : f.nameOptional}</label>
      <input className="input" autoComplete="name" maxLength={120} {...field('name')} />
      {err('name')}

      <label htmlFor={`${id}-email`}>{f.email}</label>
      <input className="input" type="email" autoComplete="email" maxLength={254} required {...field('email')} />
      {err('email')}

      <label htmlFor={`${id}-market`}>{f.region}</label>
      <select className="input" id={`${id}-market`} name="market" defaultValue="">
        <option value="">—</option>
        {MARKET_CODES.map((c) => (
          <option key={c} value={c}>{MARKETS[c].flag} {dict.markets[c]}</option>
        ))}
      </select>

      {kind === 'support' && (
        <>
          <label htmlFor={`${id}-subject`}>{f.subject}</label>
          <input className="input" maxLength={150} required {...field('subject')} />
          {err('subject')}

          <label htmlFor={`${id}-message`}>{f.message}</label>
          <textarea className="input" maxLength={4000} required {...field('message')} />
          <span className="hint">{f.messageHint}</span>
          {err('message')}
        </>
      )}

      <label className="consent" htmlFor={`${id}-consent`}>
        <input type="checkbox" {...field('consent')} />
        <span>{f.consent}</span>
      </label>
      {err('consent')}

      <div aria-live="polite" role="status">
        {(status === 'ok' || status === 'error') && message && (
          <div className={`alert ${status === 'ok' ? 'ok' : 'err'}`}>{message}</div>
        )}
      </div>

      <button type="submit" className="btn" disabled={status === 'sending'}>
        {status === 'sending' ? f.sending : kind === 'support' ? f.send : f.join}
      </button>
    </form>
  );
}
