import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { P } from '@/components/visuals/palette';

/** ELECTRIC FUSION NEON — the only colours allowed in the styles and illustrations. */
const OFFICIAL = {
  background: '#070d17',
  surface: '#121e2d',
  cyan: '#19d3f3',
  lime: '#d1fe17',
  magenta: '#f044c4',
  violet: '#6878ff',
  ink: '#f5f8ff',
  muted: '#9dadc3',
};
// Non-brand exceptions: semantic error colour for form validation, and pure black for shadows/bezels.
const ALLOWED_EXTRA = ['#ff8a8a', '#000', '#0009', '#000c', '#000b', '#000d'];

const hexes = (text: string) => [...text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0].toLowerCase());

describe('Electric Fusion Neon design tokens', () => {
  const css = readFileSync('src/app/globals.css', 'utf8');

  it('declares every official token with its exact HEX value', () => {
    for (const [name, hex] of Object.entries({
      bg: OFFICIAL.background, surface: OFFICIAL.surface, cyan: OFFICIAL.cyan, lime: OFFICIAL.lime,
      magenta: OFFICIAL.magenta, violet: OFFICIAL.violet, ink: OFFICIAL.ink, muted: OFFICIAL.muted,
    })) {
      expect(css).toMatch(new RegExp(`--color-${name}: ${hex};`, 'i'));
    }
  });

  it('uses no colour outside the official palette in the stylesheet', () => {
    const allowed = new Set([...Object.values(OFFICIAL), ...ALLOWED_EXTRA]);
    expect(hexes(css).filter((h) => !allowed.has(h))).toEqual([]);
  });

  it('never uses the rejected lime #B8F34B', () => {
    expect(css.toLowerCase()).not.toContain('#b8f34b');
    expect(JSON.stringify(P).toLowerCase()).not.toContain('#b8f34b');
  });

  it('maps each category to its official colour', () => {
    expect(css).toMatch(/\.cat-sports \{ --cat: var\(--color-lime\); \}/);
    expect(css).toMatch(/\.cat-movies \{ --cat: var\(--color-magenta\); \}/);
    expect(css).toMatch(/\.cat-live \{ --cat: var\(--color-cyan\); \}/);
    expect(css).toMatch(/\.cat-streaming \{ --cat: var\(--color-violet\); \}/);
  });

  it('illustration palette only uses official colours or tints derived from them', () => {
    const official = new Set(Object.values(OFFICIAL));
    expect(official.has(P.accent) && official.has(P.screenBg) && official.has(P.barStrong) && official.has(P.barMuted)).toBe(true);
    for (const stop of P.heroStops) expect(official.has(stop)).toBe(true);
  });
});
