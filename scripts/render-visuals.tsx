// Renders the illustration components to static SVG files in public/visuals.
// Static files keep the HTML small (inline SVG was also duplicated in the RSC
// payload) and are cached by the browser/CDN. Run: npm run visuals
import { mkdirSync, writeFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { TallScreen, WideScreen } from '../src/components/visuals/AppScreen';

const out = new URL('../public/visuals/', import.meta.url);
mkdirSync(out, { recursive: true });

const files: Record<string, React.ReactElement> = {
  'screen-wide.svg': <WideScreen id="w" />,
  'screen-tall.svg': <TallScreen id="t" />,
};

for (const [name, el] of Object.entries(files)) {
  let svg = renderToStaticMarkup(el);
  // Standalone files need the namespace and must not carry page-only attributes.
  svg = svg.replace(/ (class|aria-hidden|focusable)="[^"]*"/g, '');
  if (!svg.includes('xmlns=')) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  writeFileSync(new URL(name, out), svg + '\n');
}
console.log('Rendered', Object.keys(files).length, 'SVG files to public/visuals');
