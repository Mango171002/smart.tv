'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { commerceOpen } from '@/i18n/locales';
import type { Dictionary } from '@/i18n/dictionaries';
import type { RequestMode } from './RequestDialog';

const RequestDialog = dynamic(() => import('./RequestDialog').then((m) => m.RequestDialog), { ssr: false });

/** Opens the trial / support request window from anywhere: window.dispatchEvent(new CustomEvent('open-request', { detail: 'trial' })). */
export function openRequest(mode: RequestMode) {
  window.dispatchEvent(new CustomEvent<RequestMode>('open-request', { detail: mode }));
}

/**
 * On a version that is not open yet (preview), no request window opens: a short notice says the
 * country is coming soon. The server refuses such requests anyway (src/lib/validation.ts, worker.ts).
 */
export function RequestHost({
  locale,
  dict,
  closed,
}: {
  locale: Locale;
  dict: Pick<Dictionary, 'request' | 'forms' | 'common'>;
  /** Texts of the « coming soon » notice — only given on versions that are not open. */
  closed?: { title: string; text: string; close: string };
}) {
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
  const close = () => {
    setMode(null);
    requestAnimationFrame(() => opener.current?.focus());
  };
  if (!commerceOpen(locale)) return <ClosedNotice texts={closed} onClose={close} />;
  return (
    <RequestDialog
      mode={mode}
      locale={locale}
      dict={dict}
      onClose={() => {
        setMode(null);
        requestAnimationFrame(() => opener.current?.focus());
      }}
    />
  );
}

function ClosedNotice({ texts, onClose }: { texts?: { title: string; text: string; close: string }; onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-neon closed-notice" role="dialog" aria-modal="true" aria-labelledby="closed-title" data-testid="closed-notice">
        <h2 id="closed-title">{texts?.title ?? 'Coming soon'}</h2>
        <p className="muted">{texts?.text}</p>
        <button ref={ref} type="button" className="btn btn-lime" onClick={onClose}>{texts?.close ?? 'Close'}</button>
      </div>
    </div>
  );
}
