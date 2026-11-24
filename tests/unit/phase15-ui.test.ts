import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import en from '../../src/i18n/dictionaries/en';
import fr from '../../src/i18n/dictionaries/fr';
import de from '../../src/i18n/dictionaries/de';
import es from '../../src/i18n/dictionaries/es';
import it_ from '../../src/i18n/dictionaries/it';
import nl from '../../src/i18n/dictionaries/nl';
import sv from '../../src/i18n/dictionaries/sv';
import nb from '../../src/i18n/dictionaries/nb';

/** Phase 15 UI decisions: new strings (8 languages) and the self-hosted Inter font (D-6). */
const DICTS = { en, fr, de, es, it: it_, nl, sv, nb };

describe('prelaunch.ui strings', () => {
  for (const [l, d] of Object.entries(DICTS)) {
    it(`${l}: strip link and legal return link, translated, no date`, () => {
      for (const v of [d.prelaunch.ui.stripPlans, d.prelaunch.ui.legalBack, d.prelaunch.pagesTitle]) {
        expect(v.trim().length).toBeGreaterThan(3);
        expect(v).not.toMatch(/\d/);
      }
      if (l !== 'en') {
        expect(d.prelaunch.ui.stripPlans).not.toBe(en.prelaunch.ui.stripPlans);
        expect(d.prelaunch.ui.legalBack).not.toBe(en.prelaunch.ui.legalBack);
      }
    });
  }
});

describe('self-hosted Inter (D-6)', () => {
  const css = readFileSync('src/app/globals.css', 'utf8');
  it('two WOFF2 subsets (≤ 140 KB together, Latin ≤ 60 KB) and the OFL licence', () => {
    const latin = statSync('public/fonts/inter/inter-latin-wght-normal.v5.3.0.woff2').size;
    const ext = statSync('public/fonts/inter/inter-latin-ext-wght-normal.v5.3.0.woff2').size;
    expect(latin).toBeLessThanOrEqual(60_000);
    expect(latin + ext).toBeLessThanOrEqual(140_000);
    expect(readFileSync('public/fonts/inter/OFL.txt', 'utf8')).toContain('SIL Open Font License, Version 1.1');
  });
  it('@font-face: swap, unicode-range per subset, metric-matched fallback, former stack kept', () => {
    const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
    const inter = faces.filter((f) => f.includes("'Inter Variable'"));
    expect(inter).toHaveLength(2);
    for (const f of inter) {
      expect(f).toContain('font-display: swap');
      expect(f).toMatch(/unicode-range: U\+/);
      expect(f).toMatch(/url\('\/fonts\/inter\/inter-latin(-ext)?-wght-normal\.v5\.3\.0\.woff2'\) format\('woff2'\)/);
    }
    expect(faces.find((f) => f.includes("'Inter Fallback'"))).toMatch(/size-adjust: 107\.12%/);
    expect(css).toContain("--font-sans: 'Inter Variable', Inter, 'Inter Fallback', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;");
  });
  it('fonts are cached for a year on Cloudflare (versioned file names)', () => {
    expect(readFileSync('public/_headers', 'utf8')).toMatch(/\/fonts\/\*\n {2}Cache-Control: public, max-age=31536000, immutable/);
  });
});
