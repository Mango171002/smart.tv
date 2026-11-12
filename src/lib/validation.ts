import { z } from 'zod';
import { MARKET_CODES } from '@/config/markets';
import { STREAMS, TERMS, TIERS } from '@/lib/pricing';
import { LOCALES } from '@/i18n/config';

const streamCount = z.number().int().refine((v): v is (typeof STREAMS)[number] => (STREAMS as readonly number[]).includes(v), 'invalid value');

export const planSelectionSchema = z.object({
  tier: z.enum(TIERS),
  term: z.enum(TERMS),
  streams: streamCount,
});

const email = z.string().trim().toLowerCase().max(254).pipe(z.email());

const contactBase = {
  email,
  locale: z.enum(LOCALES),
  market: z.enum(MARKET_CODES).optional(),
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
    term: z.enum(TERMS).optional(),
    streams: streamCount.optional(),
    device: z.enum(DEVICE_KEYS).optional(),
    ...contactBase,
  }),
]);

export type ContactInput = z.infer<typeof contactSchema>;

export const checkoutSchema = planSelectionSchema.extend({
  email,
  acceptTerms: z.literal(true),
  idempotencyKey: z.string().min(16).max(128).regex(/^[A-Za-z0-9_-]+$/),
});
