import 'server-only';

/** Thin Telegram Bot API client (fetch only — runs on Cloudflare Workers). */

export function botToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || null;
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Secret Telegram sends back in `X-Telegram-Bot-Api-Secret-Token` on every webhook call.
 * Derived from the bot token, so no extra secret has to be stored. The deploy workflow
 * registers the webhook with the same derivation.
 */
export async function webhookSecret(token: string): Promise<string> {
  return (await sha256Hex(`${token}:sygma-ops-webhook`)).slice(0, 48);
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function tg<T = unknown>(method: string, body: Record<string, unknown>): Promise<T | null> {
  const token = botToken();
  if (!token) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    const json = (await res.json()) as { ok: boolean; result?: T; description?: string };
    if (!json.ok) {
      console.warn('[telegram]', method, json.description);
      return null;
    }
    return json.result ?? null;
  } catch (e) {
    console.warn('[telegram]', method, (e as Error).message);
    return null;
  }
}
