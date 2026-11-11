import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';
import { checkSameOrigin, clientIp, jsonError, readJson } from '@/lib/http';
import { isContactFormEnabled } from '@/lib/features';
import { createRateLimiter } from '@/lib/rate-limit';
import { getPublicSupabase } from '@/lib/supabase/server';
import { contactSchema } from '@/lib/validation';

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

/**
 * Stores a support request / pre-registration (launch waitlist) in Supabase using the
 * publishable key: the `anon` role may only INSERT specific columns, cannot read
 * anything back, and is throttled again inside the database.
 */
export async function POST(req: Request) {
  if (!checkSameOrigin(req)) return jsonError(403, 'forbidden_origin');
  if (!isContactFormEnabled()) return jsonError(503, 'contact_unavailable');
  const rl = limiter.check(`contact:${clientIp(req)}`);
  if (!rl.allowed) return jsonError(429, 'rate_limited', {}, { 'Retry-After': String(rl.retryAfterSeconds) });

  let body: unknown;
  try {
    body = await readJson(req, 8192);
  } catch {
    return jsonError(400, 'invalid_json');
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, 'invalid_input', { fields: [...new Set(parsed.error.issues.map((i) => String(i.path[0])))] });
  }
  const input = parsed.data;
  // Honeypot filled: pretend success, store nothing.
  if (input.website) return NextResponse.json({ ok: true });

  const supabase = getPublicSupabase();
  if (!supabase) return jsonError(503, 'contact_unavailable');

  const { error } = await supabase.from('contact_requests').insert({
    kind: input.kind,
    email: input.email,
    name: input.name ?? null,
    phone: input.kind === 'launch_waitlist' ? null : (input.phone ?? null),
    locale: input.locale,
    market_code: input.market ?? null,
    subject: input.kind === 'support' ? input.subject : null,
    message: input.kind === 'support' ? input.message : null,
    interest_tier: input.kind === 'launch_waitlist' ? (input.tier ?? null) : null,
    interest_term: input.kind === 'launch_waitlist' ? (input.term ?? null) : null,
    interest_streams: input.kind === 'launch_waitlist' ? (input.streams ?? null) : null,
    preferred_device: input.kind === 'launch_waitlist' ? (input.device ?? null) : null,
    consent_given: true,
    consent_text_version: siteConfig.consentTextVersion,
  });

  if (error) {
    // Duplicate waitlist entry: answer success to avoid revealing who is registered.
    if (error.code === '23505') return NextResponse.json({ ok: true });
    if (error.code === 'PT429') return jsonError(429, 'rate_limited');
    console.error('[contact] insert failed', error.code);
    return jsonError(502, 'storage_failed');
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
