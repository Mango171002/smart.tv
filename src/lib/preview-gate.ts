/**
 * Gate of the private preview Worker (SITE_MODE = "preview", see worker.ts and wrangler.preview.jsonc):
 * password (HTTP Basic, secret PREVIEW_PASSWORD, fail-closed), no /api/* except /api/health
 * (no order, trial, support request, quote, webhook or cron), X-Robots-Tag noindex on every response.
 * Runs before the site: the decision never depends on what the browser sends.
 */
export interface PreviewEnv {
  PREVIEW_PASSWORD?: string;
}

/** Constant-time comparison of two strings. */
function same(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const NOINDEX = 'noindex, nofollow, noarchive';

function previewResponse(status: number, body: string, extra: Record<string, string> = {}): Response {
  return new Response(body, { status, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': NOINDEX, ...extra } });
}

export async function previewFetch<E extends PreviewEnv, C>(req: Request, env: E, ctx: C, next: (req: Request, env: E, ctx: C) => Promise<Response>): Promise<Response> {
  const password = env.PREVIEW_PASSWORD;
  if (!password) return previewResponse(503, 'Preview locked.');
  const auth = req.headers.get('authorization') ?? '';
  let given = '';
  if (auth.startsWith('Basic ')) {
    try {
      given = atob(auth.slice(6)).split(':').slice(1).join(':');
    } catch {
      given = '';
    }
  }
  if (!same(given, password)) return previewResponse(401, 'Authentication required.', { 'www-authenticate': 'Basic realm="SYGMA TV+ preview", charset="UTF-8"' });
  const path = new URL(req.url).pathname;
  if (path.startsWith('/api/') && path !== '/api/health') return previewResponse(403, 'Disabled in the preview.');
  const res = await next(req, env, ctx);
  const out = new Response(res.body, res);
  out.headers.set('x-robots-tag', NOINDEX);
  out.headers.set('cache-control', 'private, no-store');
  return out;
}

