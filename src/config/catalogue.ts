import type { Tier } from '@/lib/pricing';

/**
 * Number of live channels and of movies & series per plan.
 *
 * MUST come from the licensed catalogue (provider contract / rights per territory).
 * Leave `null` until the figure is confirmed in writing: a line is only shown on the
 * site when its value is set. Never estimate or round up.
 */
export const CATALOGUE: Record<Tier, { channels: number | null; vod: number | null }> = {
  // Hidden (phase 6A, 20/11/2026): the figures given on 11/11/2026 (12,000–35,000 channels, 100,000–200,000
  // movies & series) are not backed by a provider contract or rights per territory (docs/DECISIONS.md D34).
  // Set them again only once confirmed in writing.
  starter: { channels: null, vod: null },
  plus: { channels: null, vod: null },
  ultra: { channels: null, vod: null },
};
