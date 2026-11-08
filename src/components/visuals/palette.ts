/** Single source of truth for the colours used inside the SVG illustrations ("tech blue" theme). */
export const P = {
  accent: '#4c9dff',
  accentBright: '#22d3ee',
  beam: '#7dd3fc',
  screenBg: '#070c18',
  barStrong: '#eef4ff',
  barMuted: '#8ea3c4',
  barDim: '#4b5d7e',
  line: '#1c2740',
  live: '#ff5c7a',
  heroStops: ['#0b1f4d', '#1d4ed8', '#22d3ee', '#0a1a3a'] as const,
  ridge: '#0d1d3d',
  ridgeDark: '#081429',
  tiles: [
    ['#1d3a7a', '#0a1222'],
    ['#123f5e', '#0a1222'],
    ['#0f4c5c', '#0a1222'],
    ['#2e2a7a', '#0a1222'],
    ['#164a7a', '#0a1222'],
    ['#3b2f7a', '#0a1222'],
  ] as Array<[string, string]>,
};
