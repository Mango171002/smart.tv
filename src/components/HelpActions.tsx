'use client';

import Link from 'next/link';
import { openRequest } from './RequestHost';
import s from './info.module.css';

/** Calls to action of the content pages: the site's existing trial / support windows and the plans. */
export function HelpActions({ trial = true, support = true, plans = true }: { trial?: boolean; support?: boolean; plans?: boolean }) {
  return (
    <div className={s.actions}>
      {trial && <button type="button" className="btn btn-lime" aria-haspopup="dialog" onClick={() => openRequest('trial')}>Request a free trial</button>}
      {support && <button type="button" className="btn ghost" aria-haspopup="dialog" onClick={() => openRequest('support')}>Contact support</button>}
      {plans && <Link className="btn ghost" href="/#plans">See the plans</Link>}
    </div>
  );
}
