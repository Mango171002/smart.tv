import { describe, expect, it } from 'vitest';
import { LEGAL_DOCUMENTS } from '@/content/legal';
import { isoDate, lastModifiedOf } from '@/lib/lastmod';
import { LEGAL_DOCS } from '@/lib/routes';

describe('sitemap lastmod (real, verifiable dates only)', () => {
  it('reads the « Last updated » date printed on the page', () => {
    expect(isoDate('16 November 2026')).toBe('2026-11-16');
    expect(isoDate('1 March 2027')).toBe('2027-03-01');
    expect(isoDate('18 novembre 2026', 'fr')).toBe('2026-11-18');
    expect(isoDate('1 février 2027', 'fr')).toBe('2027-02-01');
    expect(isoDate('18 novembre 2026', 'en')).toBeUndefined();
  });

  it('never invents a date', () => {
    expect(isoDate('Novembre 2026')).toBeUndefined();
    expect(isoDate('16 Brumaire 2026')).toBeUndefined();
    expect(lastModifiedOf('')).toBeUndefined();
    expect(lastModifiedOf('/blog')).toBeUndefined();
    expect(lastModifiedOf('/legal/unknown')).toBeUndefined();
  });

  it('every legal page has a lastmod equal to its printed date', () => {
    for (const doc of LEGAL_DOCS) expect(lastModifiedOf(`/legal/${doc}`)).toBe(isoDate(LEGAL_DOCUMENTS[doc].updated));
    for (const doc of LEGAL_DOCS) expect(lastModifiedOf(`/legal/${doc}`)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
