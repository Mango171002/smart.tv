/** Languages released in the build under test (E2E_RELEASED=fr or fr,de,es,…; empty = none). */
export const RELEASED_LANGS = (process.env.E2E_RELEASED ?? '').split(',').map((s) => s.trim()).filter(Boolean);
/** Expected hreflang set of a translated page (released languages + English + x-default), as paths. */
export function expectedSet(path: string): Record<string, string> {
  const out: Record<string, string> = { en: path || '/' };
  for (const l of ['fr', 'de', 'es', 'it', 'nl', 'sv', 'nb']) if (RELEASED_LANGS.includes(l)) out[l] = path ? `/${l}${path}` : `/${l}`;
  out['x-default'] = path || '/';
  return out;
}

/**
 * Indexing of the build under test. Default: indexable (production rules, strictly checked). E2E_ALLOW_INDEXING=false
 * for the private staging build (NEXT_PUBLIC_ALLOW_INDEXING=false): robots.txt must block everything and advertise no
 * sitemap — the opposite expectation, checked just as strictly.
 */
export const INDEXABLE = process.env.E2E_ALLOW_INDEXING !== 'false';
export const PRIVATE_ROBOTS = /^User-Agent: \*\s*\nDisallow: \/\s*$/;
