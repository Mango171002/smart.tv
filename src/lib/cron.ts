import 'server-only';

/**
 * Secret of the internal scheduled routes, derived from the Supabase secret key (no extra secret to store).
 * worker.ts (Cloudflare cron trigger) sends it with the same derivation.
 */
export async function cronSecret(): Promise<string | null> {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) return null;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${key}:sygma-cron`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 48);
}
