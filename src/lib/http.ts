import { NextResponse } from 'next/server';

/** Client IP: Cloudflare's `cf-connecting-ip`, else the first X-Forwarded-For hop. */
export function clientIp(req: Request): string {
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
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

/**
 * Reads a JSON body of at most `maxBytes` characters (the limit is unchanged: it applies to the decoded text).
 * The body is never buffered without bound: a declared Content-Length, or a streamed body, larger than what such a
 * text can take in UTF-8 (at most 3 bytes per UTF-16 unit; 4× here for margin) is refused before/while reading.
 */
export async function readJson(req: Request, maxBytes = 16_384): Promise<unknown> {
  const text = await readBodyText(req, maxBytes * 4);
  if (text.length > maxBytes) throw new Error('payload_too_large');
  return JSON.parse(text);
}

async function readBodyText(req: Request, byteCap: number): Promise<string> {
  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > byteCap) throw new Error('payload_too_large');
  if (!req.body) return '';
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > byteCap) {
      await reader.cancel().catch(() => undefined);
      throw new Error('payload_too_large');
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(all);
}
