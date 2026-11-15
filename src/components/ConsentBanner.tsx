'use client';

import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { useEffect, useState } from 'react';
import { analyticsHostAllowed, OPEN_CONSENT_EVENT, readConsent, saveConsent } from '@/lib/analytics';
import type { Dictionary } from '@/i18n/dictionaries';

/**
 * Cookie consent: analytics (GA4, Clarity) stay off until « Accept ». « Decline » has the same
 * weight. The footer « Cookie settings » button reopens it to change the choice at any time.
 */
export function ConsentBanner({ dict }: { dict: Dictionary['consent'] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Shown after the first paint, only where analytics can run and no choice was made yet.
    const timer = setTimeout(() => {
      if (analyticsHostAllowed() && readConsent() === null) setOpen(true);
    }, 0);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
    };
  }, []);

  if (!open) return null;
  const choose = (choice: 'granted' | 'denied') => {
    saveConsent(choice);
    setOpen(false);
  };
  return (
    <section className="consent-banner" role="region" aria-labelledby="consent-title" data-testid="consent-banner">
      <div className="consent-text">
        <Cookie size={22} strokeWidth={1.75} aria-hidden="true" />
        <div>
          <h2 id="consent-title">{dict.title}</h2>
          <p>
            {dict.text} <Link href="/legal/cookies">{dict.policy}</Link>
          </p>
        </div>
      </div>
      <div className="consent-actions">
        <button type="button" className="btn ghost" onClick={() => choose('denied')}>{dict.decline}</button>
        <button type="button" className="btn btn-lime" onClick={() => choose('granted')}>{dict.accept}</button>
      </div>
    </section>
  );
}

/** Footer button: reopens the consent banner. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" className="footer-link-btn" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT))}>
      {label}
    </button>
  );
}
