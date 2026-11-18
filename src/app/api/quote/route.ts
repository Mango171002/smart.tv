import { NextResponse } from 'next/server';
import { getPriceTable, getPriceTableFor } from '@/lib/price-source';
import { isLive } from '@/i18n/locales';
import { priceMarketOfLocale } from '@/lib/market';
import { computeQuote, PricingError } from '@/lib/pricing';
import { checkSameOrigin, clientIp, jsonError, readJson } from '@/lib/http';
import { createRateLimiter } from '@/lib/rate-limit';
import { planSelectionSchema } from '@/lib/validation';

const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

/**
 * Authoritative, server-side quote. The client never decides the price.
 * `locale` (optional, the site version): its price market and currency, decided by the server from
 * src/i18n/locales.ts; only versions open to the public are quoted. Without it: the US grid (« / »).
 */
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

  const rawLocale = (body as { locale?: unknown } | null)?.locale;
  let table;
  let source: string = 'database';
  if (rawLocale === undefined || rawLocale === 'en') {
    ({ table, source } = await getPriceTable());
  } else {
    if (typeof rawLocale !== 'string' || !isLive(rawLocale)) return jsonError(403, 'version_closed');
    table = await getPriceTableFor(priceMarketOfLocale(rawLocale));
    if (!table) return jsonError(422, 'price_unavailable');
  }
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
