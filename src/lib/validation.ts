import { z } from 'zod';
import { MARKET_CODES } from '@/config/markets';
import { DEVICE_DETAIL_KEYS } from '@/config/devices';
export { DEVICE_DETAILS, DEVICE_DETAIL_KEYS, type DeviceDetail } from '@/config/devices';
import { STREAMS, TERMS, TIERS } from '@/lib/pricing';
import { LOCALES } from '@/i18n/config';

/**
 * Terms actually offered (B11): yearly plans of 12, 24 or 36 months. `lifetime` still exists in the price table
 * (src/lib/pricing.ts TERMS) but is not offered: every API (quote, order / pre-registration, checkout) refuses it.
 */
export const OFFERED_TERMS = ['12m', '24m', '36m'] as const satisfies readonly (typeof TERMS)[number][];
export type OfferedTerm = (typeof OFFERED_TERMS)[number];
/** Device counts actually offered (B11): 1 included, up to 4. */
export const OFFERED_STREAMS = STREAMS;

const streamCount = z.number().int().refine((v): v is (typeof OFFERED_STREAMS)[number] => (OFFERED_STREAMS as readonly number[]).includes(v), 'invalid value');
const offeredTerm = z.enum(OFFERED_TERMS);

export const planSelectionSchema = z.object({
  tier: z.enum(TIERS),
  term: offeredTerm,
  streams: streamCount,
});

const email = z.string().trim().toLowerCase().max(254).pipe(z.email());

const contactBase = {
  email,
  locale: z.enum(LOCALES),
  market: z.enum(MARKET_CODES).optional(),
  /** Exact country (ISO 3166-1 alpha-2). */
  country: z.string().regex(/^[A-Z]{2}$/).optional(),
  consent: z.literal(true),
  /** Optional, separate consent to receive offers and news. */
  marketing: z.boolean().optional(),
  /** Honeypot field: must stay empty. */
  website: z.string().max(0).optional(),
};

/** International phone number, E.164 (e.g. +14155550123). */
export const phone = z.string().trim().regex(/^\+[1-9]\d{6,14}$/);

export const DEVICE_KEYS = ['smart_tv', 'streaming_device', 'mobile', 'computer'] as const;

export const contactSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('support'),
    name: z.string().trim().min(1).max(120),
    phone: phone.optional(),
    subject: z.string().trim().min(1).max(150),
    message: z.string().trim().min(10).max(4000),
    ...contactBase,
  }),
  z.object({
    kind: z.literal('trial_request'),
    name: z.string().trim().min(1).max(120),
    phone,
    ...contactBase,
  }),
  z.object({
    kind: z.literal('launch_waitlist'),
    name: z.string().trim().max(120).optional(),
    /** Pre-registration: plan and device of interest (no commitment, no payment). */
    tier: z.enum(TIERS).optional(),
    term: offeredTerm.optional(),
    streams: streamCount.optional(),
    /** WhatsApp number (E.164) so the team can contact the customer. */
    phone: phone.optional(),
    device: z.enum(DEVICE_KEYS).optional(),
    deviceDetail: z.enum(DEVICE_DETAIL_KEYS).optional(),
    ...contactBase,
  }),
]);

export type ContactInput = z.infer<typeof contactSchema>;

export const checkoutSchema = planSelectionSchema.extend({
  email,
  acceptTerms: z.literal(true),
  idempotencyKey: z.string().min(16).max(128).regex(/^[A-Za-z0-9_-]+$/),
});

/**
 * B9 territory gate for order and free-trial requests (kinds `launch_waitlist` and `trial_request`).
 * A request is accepted only when at least one country is known (the form's `country` field and/or Cloudflare's
 * `cf-ipcountry` header) and EVERY known country is in `licensed` (siteConfig.licensedTerritories). With an empty list
 * every order / trial is refused. Unknown or pseudo codes (`XX` unknown, `T1` Tor) do not count as a known country.
 * Support requests are never territory-gated.
 */
export function isOrderTerritoryAllowed(licensed: readonly string[], formCountry?: string | null, ipCountry?: string | null): boolean {
  if (licensed.length === 0) return false;
  const known = [formCountry, ipCountry]
    .map((c) => (c ?? '').trim().toUpperCase())
    .filter((c) => /^[A-Z]{2}$/.test(c) && c !== 'XX' && c !== 'T1');
  if (known.length === 0) return false;
  const allowed = new Set(licensed.map((c) => c.toUpperCase()));
  return known.every((c) => allowed.has(c));
}

/** Request kinds that are orders / trials (territory-gated), as opposed to support. */
export const ORDER_KINDS = ['launch_waitlist', 'trial_request'] as const;
