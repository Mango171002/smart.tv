import { legalDocuments } from '@/content/legal';
import type { Language } from '@/i18n/locales';
import { LEGAL_DOCS, type LegalDoc } from '@/lib/routes';

/** Month names as printed in the « Last updated » line of each language. */
const MONTHS: Record<string, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
};

/** « 16 November 2026 » / « 18 novembre 2026 » → « 2026-11-16 »; undefined when the date cannot be read (then no lastmod). */
export function isoDate(d: string, language: Language = 'en'): string | undefined {
  const m = /^(\d{1,2}) (\p{L}+) (\d{4})$/u.exec(d.trim());
  if (!m) return undefined;
  const [, day = '', name = '', year = ''] = m;
  const month = (MONTHS[language] ?? []).indexOf(name) + 1;
  if (month === 0) return undefined;
  return `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * lastmod only where the date is real and verifiable: a legal page carries the « Last updated » date
 * printed on the page itself. Pages without a printed date (home, FAQ, guides) have no lastmod.
 */
export function lastModifiedOf(path: string, language: Language = 'en'): string | undefined {
  const doc = path.startsWith('/legal/') ? path.slice('/legal/'.length) : null;
  return doc && (LEGAL_DOCS as readonly string[]).includes(doc) ? isoDate(legalDocuments(language)[doc as LegalDoc].updated, language) : undefined;
}
