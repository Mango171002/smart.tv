import type { Tier } from '@/lib/pricing';

/**
 * Number of live channels and of movies & series per plan.
 *
 * MUST come from the licensed catalogue (provider contract / rights per territory).
 * Leave `null` until the figure is confirmed in writing: a line is only shown on the
 * site when its value is set. Never estimate or round up.
 */
export const CATALOGUE: Record<Tier, { channels: number | null; vod: number | null }> = {
  // Figures provided by the owner on 11/11/2026 — NOT yet backed by a provider contract
  // (see docs/DECISIONS.md D34). Must be confirmed per territory before sales open.
  starter: { channels: 12000, vod: 100000 },
  plus: { channels: 25000, vod: 150000 },
  ultra: { channels: 35000, vod: 200000 },
};
