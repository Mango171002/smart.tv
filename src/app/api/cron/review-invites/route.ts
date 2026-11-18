import { NextResponse } from 'next/server';
import { cronSecret } from '@/lib/cron';
import { sendCustomerEmail } from '@/lib/email/send';
import { emailPlans } from '@/lib/email/plans';
import { getServiceSupabase } from '@/lib/supabase/server';
import { safeEqual } from '@/lib/telegram/api';

/**
 * Hourly customer e-mails, called by the Cloudflare cron trigger (worker.ts), never by browsers:
 * - Trustpilot review invitation: one e-mail 3 days after « Converti », no reminder;
 * - trial follow-up: one e-mail 24 h after « Essai envoyé » (the three plans), unless converted or lost.
 */
/** Language of the e-mail: the request's site version (nothing added for the English home). */
const langOf = (locale?: string | null) => (locale && locale !== 'en' ? { locale } : {});

export async function POST(req: Request) {
  const expected = await cronSecret();
  const given = req.headers.get('x-cron-secret') ?? '';
  if (!expected) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  if (!safeEqual(given, expected)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const db = getServiceSupabase();
  if (!db) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  const { data, error } = await db.rpc('ops_review_claim_due' as never, { p_after: '3 days', p_limit: 25 } as never);
  if (error) {
    console.warn('[cron] review claim', error.message);
    return NextResponse.json({ ok: false, error: 'db' }, { status: 502 });
  }
  // `locale` (site version) comes with the phase 3A migration; absent = English home, as before.
  const due = (data ?? []) as unknown as { id: string; email: string; name: string | null; locale?: string | null }[];
  let sent = 0;
  let failed = 0;
  for (const r of due) {
    const result = await sendCustomerEmail('review_invite', r.email, { name: r.name, ...langOf(r.locale) });
    if (result === 'sent') {
      sent++;
    } else {
      failed++;
      // Give it back to the queue: retried at the next run.
      await db.rpc('ops_review_release' as never, { p_request: r.id } as never);
    }
  }

  // Trial follow-ups (24 h after the trial was given).
  const f = await db.rpc('ops_trial_followup_claim_due' as never, { p_after: '24 hours', p_limit: 25 } as never);
  const followDue = f.error ? [] : ((f.data ?? []) as unknown as { id: string; email: string; name: string | null; locale?: string | null }[]);
  if (f.error) console.warn('[cron] trial follow-up claim', f.error.message);
  let followSent = 0;
  let followFailed = 0;
  if (followDue.length) {
    // Plans of each customer's site version, in its own currency (one lookup per version and run).
    const byVersion = new Map<string, Awaited<ReturnType<typeof emailPlans>>>();
    for (const r of followDue) {
      const v = r.locale ?? 'en';
      if (!byVersion.has(v)) byVersion.set(v, await emailPlans(v));
      const ep = byVersion.get(v);
      const result = await sendCustomerEmail('trial_followup', r.email, { name: r.name, ...(ep ? { plans: ep.plans, currency: ep.currency } : {}), ...langOf(r.locale) });
      if (result === 'sent') followSent++;
      else {
        followFailed++;
        await db.rpc('ops_trial_followup_release' as never, { p_request: r.id } as never);
      }
    }
  }
  return NextResponse.json({ ok: true, due: due.length, sent, failed, trialFollowups: { due: followDue.length, sent: followSent, failed: followFailed } });
}
