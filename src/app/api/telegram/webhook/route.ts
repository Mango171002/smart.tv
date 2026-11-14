import { NextResponse } from 'next/server';
import { botToken, safeEqual, webhookSecret } from '@/lib/telegram/api';
import { handleUpdate, type TgUpdate } from '@/lib/telegram/ops';

/**
 * Telegram webhook of the SYGMA Operations Bot. Telegram proves the call comes from it with
 * the secret header registered at deploy time; anything else is rejected without detail.
 * Always answers 200 after a valid call so Telegram does not retry a handled update.
 */
export async function POST(req: Request) {
  const token = botToken();
  if (!token) return NextResponse.json({ ok: false }, { status: 503 });
  const given = req.headers.get('x-telegram-bot-api-secret-token') ?? '';
  if (!safeEqual(given, await webhookSecret(token))) return NextResponse.json({ ok: false }, { status: 401 });

  let update: TgUpdate;
  try {
    const raw = await req.text();
    if (raw.length > 65_536) return NextResponse.json({ ok: false }, { status: 413 });
    update = JSON.parse(raw) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }
  try {
    await handleUpdate(update);
  } catch (e) {
    console.error('[telegram] update failed', (e as Error).message);
  }
  return NextResponse.json({ ok: true });
}
