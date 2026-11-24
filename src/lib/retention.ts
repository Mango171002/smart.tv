/**
 * Personal-data retention helpers for /api/cron/retention (docs/release/final/data-retention.md).
 * No database access here: the purge itself is the SQL function public.retention_purge (service_role only).
 */

/** Rows per table per run (the database refuses more than 5000). */
export const RETENTION_BATCH = 500;

/** Real purge only when RETENTION_PURGE_ENABLED is exactly 'true'. Unset everywhere today: every call is a dry run. */
export function retentionPurgeEnabled(): boolean {
  return process.env.RETENTION_PURGE_ENABLED === 'true';
}

export type RetentionCounts = Record<string, number | Record<string, number>>;

const KEY = /^[a-z_]{1,40}$/;
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Keeps the numeric counters only (one level of nesting, for « kept »): never an id, an e-mail or free text. */
export function countsOnly(value: unknown): RetentionCounts {
  const out: RetentionCounts = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (!KEY.test(k)) continue;
    if (isCount(v)) out[k] = v;
    else if (v && typeof v === 'object' && !Array.isArray(v)) {
      const inner: Record<string, number> = {};
      for (const [ik, iv] of Object.entries(v as Record<string, unknown>)) if (KEY.test(ik) && isCount(iv)) inner[ik] = iv;
      out[k] = inner;
    }
  }
  return out;
}
