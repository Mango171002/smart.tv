/**
 * Simple in-memory sliding-window rate limiter.
 * Good enough for a single instance / prototype. For multi-instance production,
 * replace the store with a shared one (e.g. Redis) — the interface stays the same.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();
  return {
    check(key: string, now = Date.now()): RateLimitResult {
      const windowStart = now - windowMs;
      const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);
      if (recent.length >= limit) {
        hits.set(key, recent);
        const retry = Math.ceil(((recent[0] ?? now) + windowMs - now) / 1000);
        return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, retry) };
      }
      recent.push(now);
      hits.set(key, recent);
      if (hits.size > 10_000) {
        // Bound memory: drop the oldest keys.
        for (const k of Array.from(hits.keys()).slice(0, 1000)) hits.delete(k);
      }
      return { allowed: true, remaining: limit - recent.length, retryAfterSeconds: 0 };
    },
    reset() {
      hits.clear();
    },
  };
}
