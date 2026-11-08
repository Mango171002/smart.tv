import { z } from 'zod';
import { DURATIONS, MARKET_CODES, STREAMS } from '@/config/markets';
import { LOCALES } from '@/i18n/config';

const literalUnion = <T extends readonly number[]>(values: T) =>
  z.number().int().refine((v): v is T[number] => (values as readonly number[]).includes(v), 'invalid value');

export const planSelectionSchema = z.object({
  market: z.enum(MARKET_CODES),
  durationMonths: literalUnion(DURATIONS),
  streams: literalUnion(STREAMS),
});

const email = z.string().trim().toLowerCase().max(254).pipe(z.email());

const contactBase = {
  email,
  locale: z.enum(LOCALES),
  market: z.enum(MARKET_CODES).optional(),
  consent: z.literal(true),
  /** Honeypot field: must stay empty. */
  website: z.string().max(0).optional(),
};

export const contactSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('support'),
    name: z.string().trim().min(1).max(120),
    subject: z.string().trim().min(1).max(150),
    message: z.string().trim().min(10).max(4000),
    ...contactBase,
  }),
  z.object({
    kind: z.literal('launch_waitlist'),
    name: z.string().trim().max(120).optional(),
    ...contactBase,
  }),
]);

export type ContactInput = z.infer<typeof contactSchema>;

export const checkoutSchema = planSelectionSchema.extend({
  email,
  acceptTerms: z.literal(true),
  idempotencyKey: z.string().min(16).max(128).regex(/^[A-Za-z0-9_-]+$/),
});
