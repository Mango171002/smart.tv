import { LEGAL_DOCUMENTS } from '@/content/legal';
import { LEGAL_DOCS, type LegalDoc } from '@/lib/routes';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** « 16 November 2026 » → « 2026-11-16 »; undefined when the date cannot be read (then no lastmod). */
export function isoDate(d: string): string | undefined {
  const m = /^(\d{1,2}) ([A-Z][a-z]+) (\d{4})$/.exec(d.trim());
  if (!m) return undefined;
  const [, day = '', name = '', year = ''] = m;
  const month = MONTHS.indexOf(name) + 1;
  if (month === 0) return undefined;
  return `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * lastmod only where the date is real and verifiable: a legal page carries the « Last updated » date
 * printed on the page itself. The home page has no such date, so it has no lastmod.
 */
export function lastModifiedOf(path: string): string | undefined {
  const doc = path.startsWith('/legal/') ? path.slice('/legal/'.length) : null;
  return doc && (LEGAL_DOCS as readonly string[]).includes(doc) ? isoDate(LEGAL_DOCUMENTS[doc as LegalDoc].updated) : undefined;
}
