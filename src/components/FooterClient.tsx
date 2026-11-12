'use client';

import { ArrowUp } from 'lucide-react';
import { openRequest } from './RequestHost';

export function ContactLink({ label }: { label: string }) {
  return (
    <button type="button" className="footer-link-btn" aria-haspopup="dialog" onClick={() => openRequest('support')}>
      {label}
    </button>
  );
}

export function BackToTop({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="back-to-top"
      aria-label={label}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
    >
      <ArrowUp size={24} strokeWidth={2.25} aria-hidden="true" />
    </button>
  );
}
