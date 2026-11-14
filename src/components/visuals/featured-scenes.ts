/** Display order of the "Most watched" cards (colours mixed); artwork files (public/visuals/featured-<scene>.svg), matching dict.featured.items. */
export const FEATURED_SCENES = [
  'football',
  'adventure',
  'hockey',
  'family',
  'american-football',
  'crime',
  'basketball',
  'docs',
  'tennis',
  'fantasy',
  'motorsport',
  'comedy',
  'animation',
  'anime',
  'family-fantasy',
] as const;
export type FeaturedScene = (typeof FEATURED_SCENES)[number];
