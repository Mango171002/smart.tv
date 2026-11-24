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

export function RequestHost({ locale, dict }: { locale: Locale; dict: Pick<Dictionary, 'request' | 'forms' | 'common'> }) {
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
      onClose={() => {
        setMode(null);
        requestAnimationFrame(() => opener.current?.focus());
      }}
    />
  );
}
