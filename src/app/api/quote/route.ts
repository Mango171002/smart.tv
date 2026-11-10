import { NextResponse } from 'next/server';
import { getPriceTable } from '@/lib/price-source';
import { computeQuote, PricingError } from '@/lib/pricing';
import { checkSameOrigin, clientIp, jsonError, readJson } from '@/lib/http';
import { createRateLimiter } from '@/lib/rate-limit';
import { planSelectionSchema } from '@/lib/validation';

const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

/** Authoritative, server-side quote. The client never decides the price. */
export async function POST(req: Request) {
  if (!checkSameOrigin(req)) return jsonError(403, 'forbidden_origin');
  const rl = limiter.check(`quote:${clientIp(req)}`);
  if (!rl.allowed) return jsonError(429, 'rate_limited', {}, { 'Retry-After': String(rl.retryAfterSeconds) });

  let body: unknown;
  try {
    body = await readJson(req, 2048);
  } catch {
    return jsonError(400, 'invalid_json');
  }
  const parsed = planSelectionSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, 'invalid_selection');

  const { table, source } = await getPriceTable();
  try {
    const quote = computeQuote(table, parsed.data);
    return NextResponse.json({
      ok: true,
      quote,
      source,
      taxes: { calculated: false, reason: 'tax_rules_not_configured' },
      chargeable: false,
    });
  } catch (e) {
    if (e instanceof PricingError) return jsonError(422, e.code);
    throw e;
  }
}
