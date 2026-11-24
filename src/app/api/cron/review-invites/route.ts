import { NextResponse } from 'next/server';
import { cronSecret } from '@/lib/cron';
import { sendCustomerEmail } from '@/lib/email/send';
import { emailPlans } from '@/lib/email/plans';
import { areCustomerEmailsEnabled } from '@/lib/features';
import { getServiceSupabase } from '@/lib/supabase/server';
import { safeEqual } from '@/lib/telegram/api';

/**
 * Hourly customer e-mails, called by the Cloudflare cron trigger (worker.ts), never by browsers:
 * - Trustpilot review invitation: one e-mail 3 days after « Converti », no reminder;
 * - trial follow-up: one e-mail 24 h after « Essai envoyé » (the three plans), unless converted or lost.
 * Prelaunch (A6 / B11): while online requests are closed nothing is claimed or sent — the queues stay untouched
 * (no row is marked as sent) and only a count line is logged.
 */
export async function POST(req: Request) {
  const expected = await cronSecret();
  const given = req.headers.get('x-cron-secret') ?? '';
  if (!expected) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  if (!safeEqual(given, expected)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  if (!areCustomerEmailsEnabled()) {
    console.log('[cron] prelaunch: customer e-mails disabled — review invitations sent 0, trial follow-ups sent 0 (queues untouched)');
    return NextResponse.json({ ok: true, skipped: 'prelaunch', sent: 0, trialFollowups: { sent: 0 } });
  }

  const db = getServiceSupabase();
  if (!db) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  const { data, error } = await db.rpc('ops_review_claim_due' as never, { p_after: '3 days', p_limit: 25 } as never);
  if (error) {
    console.warn('[cron] review claim', error.message);
    return NextResponse.json({ ok: false, error: 'db' }, { status: 502 });
  }
  const due = (data ?? []) as unknown as { id: string; email: string; name: string | null }[];
  let sent = 0;
  let failed = 0;
  for (const r of due) {
    const result = await sendCustomerEmail('review_invite', r.email, { name: r.name });
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
  const followDue = f.error ? [] : ((f.data ?? []) as unknown as { id: string; email: string; name: string | null }[]);
  if (f.error) console.warn('[cron] trial follow-up claim', f.error.message);
  let followSent = 0;
  let followFailed = 0;
  if (followDue.length) {
    const plans = await emailPlans();
    for (const r of followDue) {
      const result = await sendCustomerEmail('trial_followup', r.email, { name: r.name, plans });
      if (result === 'sent') followSent++;
      else {
        followFailed++;
        await db.rpc('ops_trial_followup_release' as never, { p_request: r.id } as never);
      }
    }
  }
  return NextResponse.json({ ok: true, due: due.length, sent, failed, trialFollowups: { due: followDue.length, sent: followSent, failed: followFailed } });
}
