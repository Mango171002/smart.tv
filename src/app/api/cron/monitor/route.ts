import { NextResponse } from 'next/server';
import { cronSecret } from '@/lib/cron';
import { formatChecks, localHour, runChecks } from '@/lib/monitor';
import { getServiceSupabase } from '@/lib/supabase/server';
import { safeEqual, tg } from '@/lib/telegram/api';

export const dynamic = 'force-dynamic';

/** Hour of the daily « all good » summary, in the bot's time zone. */
const DAILY_SUMMARY_HOUR = 9;

/**
 * Hourly health check, called by the « Monitor » GitHub workflow (never by browsers).
 * Sends an alert to the Telegram « alertes » topic when something is wrong, and a short
 * summary once a day. `?test=1` always sends the current summary (used to try the setup).
 */
export async function POST(req: Request) {
  const expected = await cronSecret();
  const given = req.headers.get('x-cron-secret') ?? '';
  if (!expected) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  if (!safeEqual(given, expected)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const checks = await runChecks();
  const healthy = checks.every((c) => c.ok);

  const client = getServiceSupabase() as unknown as { rpc: (fn: string) => PromiseLike<{ data: Record<string, unknown> | null }> } | null;
  const settings = client ? ((await client.rpc('ops_get_settings')).data ?? {}) : {};
  const chat = typeof settings.chat_id === 'number' ? settings.chat_id : null;
  const thread = typeof settings.thread_alertes === 'number' ? settings.thread_alertes : undefined;
  const tz = typeof settings.timezone === 'string' ? settings.timezone : 'Europe/London';
  const test = new URL(req.url).searchParams.get('test') === '1';

  let notified = false;
  if (chat && (!healthy || test || localHour(tz) === DAILY_SUMMARY_HOUR)) {
    notified = Boolean(
      await tg('sendMessage', {
        chat_id: chat,
        message_thread_id: thread,
        text: formatChecks(checks),
        parse_mode: 'HTML',
        disable_notification: healthy,
      }),
    );
  }
  return NextResponse.json({ ok: true, healthy, notified, checks });
}
