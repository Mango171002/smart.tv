'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import type { RequestMode } from './RequestDialog';

const RequestDialog = dynamic(() => import('./RequestDialog').then((m) => m.RequestDialog), { ssr: false });

/** Opens the trial / support request window from anywhere: window.dispatchEvent(new CustomEvent('open-request', { detail: 'trial' })). */
export function openRequest(mode: RequestMode) {
  window.dispatchEvent(new CustomEvent<RequestMode>('open-request', { detail: mode }));
}

const shown = (el: Element | null | undefined): el is HTMLElement =>
  el instanceof HTMLElement && el !== document.body && el.isConnected && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';

/**
 * Focus back where the window was opened (WCAG 2.4.3). The opener may be gone or hidden by then — e.g. « Free trial » in the
 * phone menu, which closes as the window opens: the menu button then gets the focus, else the main content.
 */
function returnFocus(opener: HTMLElement | null) {
  const target = [opener, document.querySelector('.mobile-menu'), document.getElementById('main')].find(shown);
  target?.focus();
}

export function RequestHost({ locale, dict, ordersOpen = true }: { locale: Locale; dict: Pick<Dictionary, 'request' | 'forms' | 'common' | 'prelaunch'>; ordersOpen?: boolean }) {
  const [mode, setMode] = useState<RequestMode | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      opener.current = document.activeElement as HTMLElement | null;
      setMode((e as CustomEvent<RequestMode>).detail);
    };
    window.addEventListener('open-request', onOpen);
    return () => window.removeEventListener('open-request', onOpen);
  }, []);

  if (!mode) return null;
  return (
    <RequestDialog
      mode={mode}
      locale={locale}
      dict={dict}
      ordersOpen={ordersOpen}
      onClose={() => {
        setMode(null);
        requestAnimationFrame(() => returnFocus(opener.current));
      }}
    />
  );
}
