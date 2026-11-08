import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Provider-agnostic webhook signature verification.
 * Header format: `t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">`.
 * Adapt to the chosen provider's scheme once a provider is approved.
 */
export function signWebhook(secret: string, body: string, timestamp: number): string {
  const mac = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
  return `t=${timestamp},v1=${mac}`;
}

export function verifyWebhookSignature(
  secret: string,
  body: string,
  header: string | null,
  { toleranceSeconds = 300, now = Math.floor(Date.now() / 1000) } = {},
): boolean {
  if (!secret || !header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  );
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isInteger(t) || !v1 || !/^[0-9a-f]{64}$/.test(v1)) return false;
  if (Math.abs(now - t) > toleranceSeconds) return false;
  const expected = createHmac('sha256', secret).update(`${t}.${body}`).digest();
  const given = Buffer.from(v1, 'hex');
  return given.length === expected.length && timingSafeEqual(given, expected);
}
