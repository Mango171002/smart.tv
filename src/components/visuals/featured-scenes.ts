/** Order of the "Most watched" artwork files (public/visuals/featured-<scene>.svg), matching dict.featured.items. */
export const FEATURED_SCENES = [
  'football',
  'american-football',
  'hockey',
  'basketball',
  'adventure',
  'crime',
  'fantasy',
  'comedy',
  'tennis',
  'motorsport',
  'family',
  'docs',
] as const;
export type FeaturedScene = (typeof FEATURED_SCENES)[number];
