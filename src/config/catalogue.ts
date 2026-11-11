import type { Tier } from '@/lib/pricing';

/**
 * Number of live channels and of movies & series per plan.
 *
 * MUST come from the licensed catalogue (provider contract / rights per territory).
 * Leave `null` until the figure is confirmed in writing: a line is only shown on the
 * site when its value is set. Never estimate or round up.
 */
export const CATALOGUE: Record<Tier, { channels: number | null; vod: number | null }> = {
  starter: { channels: null, vod: null },
  plus: { channels: null, vod: null },
  ultra: { channels: null, vod: null },
};
