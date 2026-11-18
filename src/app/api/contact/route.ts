import { after, NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';
import { checkSameOrigin, clientIp, jsonError, readJson } from '@/lib/http';
import { isContactFormEnabled } from '@/lib/features';
import { createRateLimiter } from '@/lib/rate-limit';
import { getPublicSupabase } from '@/lib/supabase/server';
import { contactSchema, DEVICE_DETAILS } from '@/lib/validation';
import { notifyNewRequest } from '@/lib/telegram/ops';
import { sendCustomerEmail } from '@/lib/email/send';
import { storedPriceMarket } from '@/lib/market';

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
  const priceMarket = storedPriceMarket(input.locale);

  const { error } = await supabase.from('contact_requests').insert({
    kind: input.kind,
    email: input.email,
    name: input.name ?? null,
    phone: input.phone ?? null,
    locale: input.locale,
    market_code: input.market ?? null,
    country_code: input.country ?? null,
    subject: input.kind === 'support' ? input.subject : null,
    message: input.kind === 'support' ? input.message : null,
    interest_tier: input.kind === 'launch_waitlist' ? (input.tier ?? null) : null,
    interest_term: input.kind === 'launch_waitlist' ? (input.term ?? null) : null,
    interest_streams: input.kind === 'launch_waitlist' ? (input.streams ?? null) : null,
    // The category always follows the precise device when one is given.
    preferred_device: input.kind === 'launch_waitlist' ? (input.deviceDetail ? DEVICE_DETAILS[input.deviceDetail] : (input.device ?? null)) : null,
    device_detail: input.kind === 'launch_waitlist' ? (input.deviceDetail ?? null) : null,
    marketing_opt_in: input.marketing === true,
    consent_given: true,
    consent_text_version: siteConfig.consentTextVersion,
    // Price market of the site version, decided by the server (absent for « / »: US, as before).
    ...(priceMarket ? { price_market: priceMarket } : {}),
  });

  if (error) {
    // Duplicate waitlist entry: answer success to avoid revealing who is registered.
    if (error.code === '23505') {
      // Still tell the team: the card of the existing pre-registration gets a "repeat" notice.
      const planLabel = input.kind === 'launch_waitlist' ? [input.tier, input.term, input.streams ? `${input.streams} device(s)` : null].filter(Boolean).join(' · ') : null;
      after(() => notifyNewRequest(input.kind, input.email, { repeat: true, planLabel }).catch((e) => console.warn('[contact] telegram', (e as Error).message)));
      return NextResponse.json({ ok: true });
    }
    if (error.code === 'PT429') return jsonError(429, 'rate_limited');
    console.error('[contact] insert failed', error.code);
    return jsonError(502, 'storage_failed');
  }
  // Operations bot: post a live card in the team's Telegram group, after the response is sent.
  after(() => notifyNewRequest(input.kind, input.email).catch((e) => console.warn('[contact] telegram', (e as Error).message)));
  // Acknowledgement e-mail to the customer (trial request / pre-registration; support answers come from the team),
  // in the language of the site version (English e-mails unchanged for « / »).
  const lang = input.locale === 'en' ? {} : { locale: input.locale };
  if (input.kind === 'trial_request') {
    after(() => sendCustomerEmail('trial_received', input.email, { name: input.name, phone: input.phone, ...lang }).then(() => undefined));
  } else if (input.kind === 'launch_waitlist') {
    after(() =>
      sendCustomerEmail('preregistration_received', input.email, { name: input.name, tier: input.tier, term: input.term, streams: input.streams, ...lang }).then(() => undefined),
    );
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
