'use client';

import { Headset } from 'lucide-react';
import type { Dictionary } from '@/i18n/dictionaries';
import { openRequest } from './RequestHost';

/** Floating support button (bottom-right, fixed, lime): opens the support request window. */
export function SupportButton({ nav }: { nav: Dictionary['nav'] }) {
  return (
    <button type="button" className="support-fab" aria-label={nav.supportLabel} aria-haspopup="dialog" onClick={() => openRequest('support')}>
      <Headset size={22} strokeWidth={1.75} aria-hidden="true" />
      <span>{nav.support}</span>
    </button>
  );
}
