/**
 * Colours used inside the SVG illustrations — ELECTRIC FUSION NEON.
 * Official colours only; dark tints are mixes of an official colour with the
 * official Surface/Background (computed, not new brand colours).
 */
export const P = {
  accent: '#19d3f3', // Primary Cyan
  accentBright: '#19d3f3',
  beam: '#19d3f3',
  screenBg: '#070d17', // Background
  barStrong: '#f5f8ff', // Soft White
  barMuted: '#9dadc3', // Muted Text
  barDim: '#435062',
  line: '#2b3848',
  live: '#19d3f3', // Live TV = cyan
  heroStops: ['#121e2d', '#6878ff', '#19d3f3', '#070d17'] as const,
  ridge: '#131a33',
  ridgeDark: '#0c1223',
  tiles: [
    ['#145164', '#081924'],
    ['#502957', '#151021'],
    ['#475d27', '#131b17'],
    ['#2a3768', '#0d1325'],
    ['#145164', '#081924'],
    ['#502957', '#151021'],
  ] as Array<[string, string]>,
};
