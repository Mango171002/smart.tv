import { NextResponse } from 'next/server';
import { cronSecret } from '@/lib/cron';
import { countsOnly, RETENTION_BATCH, retentionPurgeEnabled } from '@/lib/retention';
import { getServiceSupabase } from '@/lib/supabase/server';
import { safeEqual } from '@/lib/telegram/api';

export const dynamic = 'force-dynamic';

/**
 * Personal-data retention (privacy policy: 12 months). PROPOSAL: not scheduled, no cron trigger calls this route.
 * Same authentication as the other internal routes (x-cron-secret derived from SUPABASE_SECRET_KEY).
 * Calls public.retention_purge (service_role only) in DRY-RUN unless RETENTION_PURGE_ENABLED === 'true'.
 * Answers and logs counts only (docs/release/final/data-retention.md).
 */
export async function POST(req: Request) {
  const expected = await cronSecret();
  const given = req.headers.get('x-cron-secret') ?? '';
  if (!expected) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  if (!safeEqual(given, expected)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const db = getServiceSupabase();
  if (!db) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });

  const dryRun = !retentionPurgeEnabled();
  const { data, error } = await db.rpc('retention_purge' as never, { p_dry_run: dryRun, p_max_rows: RETENTION_BATCH } as never);
  if (error) {
    // The error code only: a database message can quote row values.
    console.warn('[cron] retention failed', String((error as { code?: unknown }).code ?? 'unknown').slice(0, 8));
    return NextResponse.json({ ok: false, error: 'db' }, { status: 502 });
  }
  const result = (data ?? {}) as { ok?: unknown; code?: unknown; dry_run?: unknown; counts?: unknown };
  if (result.ok !== true) {
    const code = result.code === 'busy' ? 'busy' : 'refused';
    console.warn('[cron] retention', code);
    return NextResponse.json({ ok: false, error: code }, { status: 409 });
  }
  const summary = { ok: true, dryRun: result.dry_run !== false, counts: countsOnly(result.counts) };
  console.log('[cron] retention', JSON.stringify(summary));
  return NextResponse.json(summary);
}
