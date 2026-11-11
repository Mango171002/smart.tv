'use client';

import { Headset } from 'lucide-react';
import { siteConfig } from '@/config/site';
import type { Dictionary } from '@/i18n/dictionaries';
import { openRequest } from './RequestHost';

/**
 * Floating support button (bottom-right, fixed). Opens WhatsApp once a number is set in
 * src/config/site.ts (supportWhatsApp); until then it opens the support request window.
 */
export function SupportButton({ nav }: { nav: Dictionary['nav'] }) {
  const wa = siteConfig.supportWhatsApp;
  const content = (
    <>
      <Headset size={22} strokeWidth={1.75} aria-hidden="true" />
      <span>{nav.support}</span>
    </>
  );
  return wa ? (
    <a className="support-fab" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label={nav.supportLabel}>
      {content}
    </a>
  ) : (
    <button type="button" className="support-fab" aria-label={nav.supportLabel} aria-haspopup="dialog" onClick={() => openRequest('support')}>
      {content}
    </button>
  );
}
