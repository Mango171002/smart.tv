import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/http';
import type { Json } from '@/lib/supabase/database.types';
import { getServiceSupabase } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/webhook-signature';

/**
 * Payment provider webhook receiver (provider not chosen yet).
 * 1. Verifies the HMAC signature on the RAW body (timing-safe, 5 min tolerance).
 * 2. Records the event idempotently (unique provider + event id in the database).
 * Fulfilment is intentionally NOT implemented: no activation provider is approved.
 */
export async function POST(req: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return jsonError(503, 'webhooks_not_configured');

  const raw = await req.text();
  if (raw.length > 65_536) return jsonError(413, 'payload_too_large');
  if (!verifyWebhookSignature(secret, raw, req.headers.get('x-webhook-signature'))) {
    return jsonError(401, 'invalid_signature');
  }

  let event: { id?: unknown; type?: unknown };
  try {
    event = JSON.parse(raw);
  } catch {
    return jsonError(400, 'invalid_json');
  }
  if (typeof event.id !== 'string' || typeof event.type !== 'string' || event.id.length > 200 || event.type.length > 120) {
    return jsonError(400, 'invalid_event');
  }

  const db = getServiceSupabase();
  if (!db) return jsonError(503, 'storage_not_configured');

  const { error } = await db.from('payment_webhook_events').insert({
    provider: 'generic',
    provider_event_id: event.id,
    event_type: event.type,
    payload: event as Json,
  });
  if (error) {
    if (error.code === '23505') return NextResponse.json({ ok: true, duplicate: true });
    return jsonError(500, 'storage_failed');
  }
  return NextResponse.json({ ok: true });
}
