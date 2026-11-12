'use client';

import type { ReactNode } from 'react';
import { openRequest } from './RequestHost';
import type { RequestMode } from './RequestDialog';

/** Button that opens the trial / support request window (usable from server components). */
export function RequestButton({ mode, className, children }: { mode: RequestMode; className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} aria-haspopup="dialog" onClick={() => openRequest(mode)}>
      {children}
    </button>
  );
}
