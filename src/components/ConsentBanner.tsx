'use client';

import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { useEffect, useState } from 'react';
import { analyticsHostAllowed, OPEN_CONSENT_EVENT, readConsentState, saveConsent, type ConsentState } from '@/lib/analytics';
import type { Dictionary } from '@/i18n/dictionaries';

/**
 * Cookie consent with two independent choices: Analytics (GA4, Clarity) and Marketing (advertising
 * measurement through Google Tag Manager). « Accept all » and « Decline all » have the same weight;
 * « Customize » sets each choice. The footer « Cookie settings » button reopens the settings.
 */
export function ConsentBanner({ dict }: { dict: Dictionary['consent'] }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Shown after the first paint, only where analytics can run and no choice was made yet.
    const timer = setTimeout(() => {
      if (analyticsHostAllowed() && readConsentState() === null) setOpen(true);
    }, 0);
    const reopen = () => {
      const s = readConsentState();
      setAnalytics(s?.analytics === 'granted');
      setMarketing(s?.marketing === 'granted');
      setCustom(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
    };
  }, []);

  if (!open) return null;
  const save = (state: ConsentState) => {
    setOpen(false);
    setCustom(false);
    saveConsent(state);
  };
  const all = (c: 'granted' | 'denied') => save({ analytics: c, marketing: c });

  return (
    <section className="consent-banner" role="region" aria-labelledby="consent-title" data-testid="consent-banner">
      <div className="consent-text">
        <Cookie size={22} strokeWidth={1.75} aria-hidden="true" />
        <div>
          <h2 id="consent-title">{dict.title}</h2>
          {/* The detailed choices replace the intro text in the « Customize » view (shorter on phones). */}
          <p>
            {custom ? null : <>{dict.text} </>}
            <Link href="/legal/cookies">{dict.policy}</Link>
          </p>
        </div>
      </div>

      {custom && (
        <fieldset className="consent-options">
          <legend className="sr-only">{dict.customize}</legend>
          <label className="consent-option">
            <input type="checkbox" checked disabled />
            <span>
              <b>{dict.necessaryTitle}</b>
              <small>{dict.necessaryText}</small>
            </span>
          </label>
          <label className="consent-option">
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
            <span>
              <b>{dict.analyticsTitle}</b>
              <small>{dict.analyticsText}</small>
            </span>
          </label>
          <label className="consent-option">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            <span>
              <b>{dict.marketingTitle}</b>
              <small>{dict.marketingText}</small>
            </span>
          </label>
        </fieldset>
      )}

      <div className="consent-actions">
        <button type="button" className="btn ghost" onClick={() => all('denied')}>{dict.declineAll}</button>
        <button type="button" className="btn btn-lime" onClick={() => all('granted')}>{dict.acceptAll}</button>
      </div>
      {custom ? (
        <button type="button" className="consent-link" onClick={() => save({ analytics: analytics ? 'granted' : 'denied', marketing: marketing ? 'granted' : 'denied' })}>
          {dict.save}
        </button>
      ) : (
        <button type="button" className="consent-link" aria-expanded={false} onClick={() => setCustom(true)}>
          {dict.customize}
        </button>
      )}
    </section>
  );
}

/** Footer button: reopens the consent settings. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" className="footer-link-btn" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT))}>
      {label}
    </button>
  );
}
