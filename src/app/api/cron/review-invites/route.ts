import { NextResponse } from 'next/server';
import { cronSecret } from '@/lib/cron';
import { sendCustomerEmail } from '@/lib/email/send';
import { getServiceSupabase } from '@/lib/supabase/server';
import { safeEqual } from '@/lib/telegram/api';

/**
 * Trustpilot review invitations: one e-mail 3 days after « Converti », no reminder.
 * Called every hour by the Cloudflare cron trigger (worker.ts), never by browsers.
 */
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
  return NextResponse.json({ ok: true, due: due.length, sent, failed });
}
