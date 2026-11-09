import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TallScreen, WideScreen } from '@/components/visuals/AppScreen';
import { CategoryArt, DeviceIllustration } from '@/components/visuals/Devices';

const normalise = (svg: string) => {
  let s = svg.replace(/ (class|aria-hidden|focusable)="[^"]*"/g, '');
  if (!s.includes('xmlns=')) s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  return s + '\n';
};

describe('static illustrations', () => {
  const cases: Array<[string, ReturnType<typeof createElement>]> = [
    ['screen-wide.svg', createElement(WideScreen, { id: 'w' })],
    ['screen-tall.svg', createElement(TallScreen, { id: 't' })],
    ...[0, 1, 2, 3].map((k) => [`device-${k}.svg`, createElement(DeviceIllustration, { kind: k as 0 | 1 | 2 | 3 })] as [string, ReturnType<typeof createElement>]),
    ...[0, 1, 2, 3, 4, 5].map((i) => [`category-${i}.svg`, createElement(CategoryArt, { index: i })] as [string, ReturnType<typeof createElement>]),
  ];
  it.each(cases)('public/visuals/%s is up to date (run `npm run visuals`)', (file, el) => {
    expect(readFileSync(`public/visuals/${file}`, 'utf8')).toBe(normalise(renderToStaticMarkup(el)));
  });
});
