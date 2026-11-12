'use client';

import { openRequest } from './RequestHost';

export function ContactLink({ label }: { label: string }) {
  return (
    <button type="button" className="footer-link-btn" aria-haspopup="dialog" onClick={() => openRequest('support')}>
      {label}
    </button>
  );
}
