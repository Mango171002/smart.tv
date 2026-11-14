/** Display order of the "Most watched" cards (mixed genres); artwork files public/images/featured-<scene>-<w>.avif|webp, matching dict.featured.items. */
export const FEATURED_SCENES = [
  'football',
  'anime',
  'basketball',
  'family-fantasy',
  'comedy',
  'american-football',
  'animation',
  'crime',
  'hockey',
  'fantasy',
  'motorsport',
  'docs',
  'tennis',
  'adventure',
  'family',
] as const;
export type FeaturedScene = (typeof FEATURED_SCENES)[number];
