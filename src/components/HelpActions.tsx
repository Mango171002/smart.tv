'use client';

import Link from 'next/link';
import { openRequest } from './RequestHost';
import s from './info.module.css';

export interface HelpActionLabels { trial: string; support: string; plans: string; plansHref: string }

/** English labels (default). Other languages pass `labels` (src/content/<lang>/info.ts). */
const EN: HelpActionLabels = { trial: 'Request a free trial', support: 'Contact support', plans: 'See the plans', plansHref: '/#plans' };

/** Calls to action of the content pages: the site's existing trial / support windows and the plans. */
export function HelpActions({ trial = true, support = true, plans = true, labels = EN }: { trial?: boolean; support?: boolean; plans?: boolean; labels?: HelpActionLabels }) {
  return (
    <div className={s.actions}>
      {trial && <button type="button" className="btn btn-lime" aria-haspopup="dialog" onClick={() => openRequest('trial')}>{labels.trial}</button>}
      {support && <button type="button" className="btn ghost" aria-haspopup="dialog" onClick={() => openRequest('support')}>{labels.support}</button>}
      {plans && <Link className="btn ghost" href={labels.plansHref}>{labels.plans}</Link>}
    </div>
  );
}
