import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import nextConfig from '../../next.config';
import { readJson } from '@/lib/http';
import { withdrawnStorageKeys } from '@/lib/analytics';

/** Phase 13 (security audit D13): body size cap, static-asset headers, storage cleanup on consent withdrawal. */

const jsonReq = (body: BodyInit, headers: Record<string, string> = {}) =>
  new Request('http://shop.test/api/quote', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body, duplex: 'half' } as RequestInit);

describe('readJson: the body is never buffered without bound', () => {
  it('refuses a declared Content-Length above the cap before reading anything', async () => {
    let pulled = false;
    const stream = new ReadableStream<Uint8Array>(
      {
        pull() {
          pulled = true;
        },
      },
      { highWaterMark: 0 },
    );
    await expect(readJson(jsonReq(stream, { 'content-length': String(4 * 2048 + 1) }), 2048)).rejects.toThrow('payload_too_large');
    expect(pulled).toBe(false);
  });

  it('stops reading a streamed body (no Content-Length) as soon as it exceeds the cap', async () => {
    let chunks = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(c) {
        chunks++;
        c.enqueue(new Uint8Array(1024).fill(0x20));
        if (chunks > 10_000) c.close();
      },
    });
    await expect(readJson(jsonReq(stream), 2048)).rejects.toThrow('payload_too_large');
    expect(chunks).toBeLessThan(20);
  });

  it('keeps the character limit unchanged: non-ASCII text within the limit is accepted', async () => {
    const message = 'é'.repeat(2000); // 2 000 characters, 4 000 bytes in UTF-8
    await expect(readJson(jsonReq(JSON.stringify({ message })), 2048)).resolves.toEqual({ message });
    await expect(readJson(jsonReq(JSON.stringify({ message: 'a'.repeat(2048) })), 2048)).rejects.toThrow('payload_too_large');
  });

  it('still parses ordinary bodies and rejects bad JSON', async () => {
    await expect(readJson(jsonReq('{"tier":"plus"}'))).resolves.toEqual({ tier: 'plus' });
    await expect(readJson(jsonReq('{bad'))).rejects.toThrow();
  });
});

describe('POST /api/quote with an oversized body', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', '');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('answers 400 invalid_json (unchanged contract)', async () => {
    const { POST } = await import('@/app/api/quote/route');
    const res = await POST(jsonReq(JSON.stringify({ pad: 'x'.repeat(1_000_000) }), { host: 'shop.test', origin: 'http://shop.test', 'x-forwarded-for': '10.9.9.9' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid_json');
  });
});

describe('static assets (Cloudflare Workers Assets, public/_headers)', () => {
  const rules = new Map<string, Record<string, string>>();
  let current: Record<string, string> | null = null;
  for (const line of readFileSync('public/_headers', 'utf8').split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = {};
      rules.set(line.trim(), current);
    } else if (current) {
      const i = line.indexOf(':');
      current[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
    }
  }

  it('every static file gets the same security headers as the pages', async () => {
    const all = rules.get('/*');
    expect(all).toBeDefined();
    const pageHeaders = Object.fromEntries(
      ((await nextConfig.headers!()).find((h) => h.source === '/:path*')?.headers ?? []).map((h) => [h.key.toLowerCase(), h.value]),
    );
    for (const key of ['x-content-type-options', 'strict-transport-security', 'referrer-policy', 'x-frame-options']) {
      expect(all![key], key).toBe(pageHeaders[key]);
    }
  });

  it('pages (Worker responses) carry COOP same-origin-allow-popups (D13-012); static files do not need it', async () => {
    const page = ((await nextConfig.headers!()).find((h) => h.source === '/:path*')?.headers ?? []).find((h) => h.key === 'Cross-Origin-Opener-Policy');
    expect(page?.value).toBe('same-origin-allow-popups');
  });

  it('the catch-all rule never sets caching (the specific rules keep their Cache-Control)', () => {
    expect(rules.get('/*')!['cache-control']).toBeUndefined();
    expect(rules.get('/_next/static/*')!['cache-control']).toBe('public, max-age=31536000, immutable');
  });
});

describe('consent withdrawal: browser storage of the withdrawn tags is removed', () => {
  // Keys measured on a production-like build (23/11/2026) after « Accept all », plus the site's own keys.
  const keys = ['sygma_consent', 'sygma_analytics_force', '_gcl_ls', '_cltk', 'tt_sessionId', '_fbp', 'other'];

  it('Analytics withdrawn: Clarity storage only', () => {
    expect(withdrawnStorageKeys(keys, { analytics: true, marketing: false })).toEqual(['_cltk']);
  });
  it('Marketing withdrawn: advertising storage only', () => {
    expect(withdrawnStorageKeys(keys, { analytics: false, marketing: true })).toEqual(['_gcl_ls', 'tt_sessionId', '_fbp']);
  });
  it('both withdrawn: never the consent record or any sygma_* key', () => {
    const removed = withdrawnStorageKeys(keys, { analytics: true, marketing: true });
    expect(removed).toEqual(['_gcl_ls', '_cltk', 'tt_sessionId', '_fbp']);
    expect(removed.some((k) => k.startsWith('sygma_'))).toBe(false);
  });
  it('nothing withdrawn: nothing removed', () => {
    expect(withdrawnStorageKeys(keys, { analytics: false, marketing: false })).toEqual([]);
  });
});
