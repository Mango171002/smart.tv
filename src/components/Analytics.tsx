'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { CONSENT_EVENT, startAnalytics, track, trackPageView } from '@/lib/analytics';

/**
 * Starts GA4 + Clarity after consent (once, after the page has loaded), sends one page view per
 * route, and tracks clicks on WhatsApp links. Mounted once in the root layout.
 */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Loads whatever the visitor accepted; safe to call several times (each script loads once).
    const start = () => {
      startAnalytics();
    };
    // Already consented: load after the page is ready, when the browser is idle (never blocks rendering).
    const later = () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(start, { timeout: 3000 });
      else setTimeout(start, 1500);
    };
    if (document.readyState === 'complete') later();
    else window.addEventListener('load', later, { once: true });
    // A choice was just saved: start what it allows immediately.
    const onConsent = () => start();
    window.addEventListener(CONSENT_EVENT, onConsent);
    // WhatsApp contact clicks (chat links and the WhatsApp channel). Only the link type is sent.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      let url: URL;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      if (url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com' || url.hostname.endsWith('whatsapp.com')) {
        track('contact_whatsapp', { link_type: url.pathname.startsWith('/channel') ? 'channel' : 'chat', placement: a.closest('footer') ? 'footer' : 'page' });
      }
    };
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('load', later);
      window.removeEventListener(CONSENT_EVENT, onConsent);
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  // Client-side navigations (not hash links): one page view per new path.
  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return null;
}
