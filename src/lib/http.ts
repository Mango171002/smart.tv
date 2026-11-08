import { NextResponse } from 'next/server';

/** Client IP (first X-Forwarded-For hop — only trustworthy behind your own proxy/CDN). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * CSRF protection for JSON APIs: same-origin Origin header (or Sec-Fetch-Site) and a
 * JSON content type, which browsers cannot send cross-site without a CORS preflight.
 */
export function checkSameOrigin(req: Request): boolean {
  const ct = req.headers.get('content-type') ?? '';
  if (!ct.toLowerCase().startsWith('application/json')) return false;
  const site = req.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return false;
  const origin = req.headers.get('origin');
  if (!origin) return site === 'same-origin';
  try {
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? new URL(req.url).host;
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function jsonError(status: number, error: string, extra: Record<string, unknown> = {}, headers?: HeadersInit) {
  return NextResponse.json({ ok: false, error, ...extra }, { status, headers });
}

export async function readJson(req: Request, maxBytes = 16_384): Promise<unknown> {
  const text = await req.text();
  if (text.length > maxBytes) throw new Error('payload_too_large');
  return JSON.parse(text);
}
