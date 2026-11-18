import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
// @ts-expect-error — plain ESM script without type declarations
import * as ix from '../../scripts/indexnow-lib.mjs';

const page = (body: string, extra = '') =>
  `<html><head><title>T</title><meta name="description" content="D"/>${extra}<script src="/_next/static/chunks/abc.js"></script></head><body>${body}<script>self.__next_f.push([1,"${Math.random()}"])</script></body></html>`;

describe('IndexNow', () => {
  it('the key file served at the root holds exactly the key', () => {
    expect(ix.INDEXNOW_KEY).toMatch(/^[a-f0-9]{32}$/);
    expect(readFileSync(`public/${ix.INDEXNOW_KEY}.txt`, 'utf8')).toBe(ix.INDEXNOW_KEY);
    expect(ix.KEY_LOCATION).toBe(`https://sygmatv.com/${ix.INDEXNOW_KEY}.txt`);
  });

  it('never runs from the preview', () => {
    expect(() => ix.assertProductionTarget({ NEXT_PUBLIC_SITE_MODE: 'preview' })).toThrow(/preview/);
    expect(() => ix.assertProductionTarget({ SITE_MODE: 'preview' })).toThrow(/preview/);
    expect(() => ix.assertProductionTarget({ NEXT_PUBLIC_SITE_URL: 'https://preview.sygmatv.com' })).toThrow();
    expect(() => ix.assertProductionTarget({ NEXT_PUBLIC_SITE_URL: 'https://sygmatv.com' })).not.toThrow();
    expect(() => ix.assertProductionTarget({})).not.toThrow();
  });

  it('only production https URLs are accepted', () => {
    expect(ix.isPublicUrl('https://sygmatv.com/legal/terms')).toBe(true);
    for (const u of ['https://preview.sygmatv.com/fr-fr', 'https://www.sygmatv.com/', 'http://sygmatv.com/', 'https://evil.com/?sygmatv.com', 'not a url'])
      expect(ix.isPublicUrl(u), u).toBe(false);
    const xml = '<urlset><url><loc>https://sygmatv.com/</loc></url><url><loc>https://preview.sygmatv.com/fr-fr</loc></url></urlset>';
    expect(ix.sitemapUrls(xml)).toEqual(['https://sygmatv.com/']);
    const body = ix.payload(['https://sygmatv.com/', 'https://sygmatv.com/', 'https://preview.sygmatv.com/x']);
    expect(body).toEqual({ host: 'sygmatv.com', key: ix.INDEXNOW_KEY, keyLocation: ix.KEY_LOCATION, urlList: ['https://sygmatv.com/'] });
    expect(() => ix.payload(['https://preview.sygmatv.com/x'])).toThrow();
  });

  it('fingerprint ignores scripts and build hashes, but sees content and meta changes', () => {
    const a = ix.fingerprint(page('<h1>Hello</h1>'));
    expect(ix.fingerprint(page('<h1>Hello</h1>').replace('abc.js', 'xyz.js'))).toBe(a);
    expect(ix.fingerprint(page('<h1>Hello</h1>'))).toBe(a); // random script payload ignored
    expect(ix.fingerprint(page('<h1>Hello!</h1>'))).not.toBe(a);
    expect(ix.fingerprint(page('<h1>Hello</h1>').replace('content="D"', 'content="D2"'))).not.toBe(a);
    expect(ix.fingerprint(page('<h1>Hello</h1>', '<link rel="canonical" href="https://sygmatv.com/x"/>'))).not.toBe(a);
  });

  it('lists added, changed and removed pages; skips pages it could not read', () => {
    const before = { 'https://sygmatv.com/': 'a', 'https://sygmatv.com/legal/terms': 'b', 'https://sygmatv.com/old': 'c', 'https://sygmatv.com/legal/privacy': null };
    const after = { 'https://sygmatv.com/': 'a', 'https://sygmatv.com/legal/terms': 'B', 'https://sygmatv.com/new': 'n', 'https://sygmatv.com/legal/privacy': 'p', 'https://sygmatv.com/legal/cookies': null };
    expect(ix.changedUrls(before, after).sort()).toEqual(['https://sygmatv.com/legal/terms', 'https://sygmatv.com/new', 'https://sygmatv.com/old']);
    expect(ix.changedUrls(after, after)).toEqual([]);
  });
});
