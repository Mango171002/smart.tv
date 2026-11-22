/**
 * Language switcher logic (phase 9). Pure functions, safe in client components (no dictionary import).
 *
 * - Lists exactly the languages BUILT by this build (enabled + released; preview languages only in the private
 *   preview environment). Production today builds English only: the switcher is not rendered at all, so no link to
 *   an unpublished or disabled language can ever appear on the production site.
 * - Keeps the current page when it exists in the target language; otherwise the target language's home page.
 *   Legal documents exist in English only (src/lib/seo.ts PAGE_AVAILABILITY): another language → its home page.
 */
import { contentPagesEnabled } from '@/config/content-pages';
import { HELP_TOPIC_SLUGS } from '@/content/help-slugs';
import type { Locale } from './config';
import { builtLanguages, prefixedPath, type SiteLanguage } from './locales';

export interface SwitcherLanguage {
  code: Locale;
  nativeName: string;
  hreflang: string;
  htmlLang: string;
  prefix: SiteLanguage['prefix'];
}

/** Languages offered by the switcher, in registry order (English first). */
export function switcherLanguages(registry?: readonly SiteLanguage[], preview?: boolean): SwitcherLanguage[] {
  // Same list as LOCALES (src/i18n/config.ts) in a real build; parameters for tests.
  return builtLanguages(registry, preview).map((l) => ({ code: l.code as Locale, nativeName: l.nativeName, hreflang: l.hreflang, htmlLang: l.htmlLang, prefix: l.prefix }));
}

/** « Language » in each language: button and mobile-section label. */
export const LANGUAGE_LABEL: Readonly<Record<string, string>> = {
  en: 'Language', fr: 'Langue', de: 'Sprache', es: 'Idioma', it: 'Lingua', nl: 'Taal', sv: 'Språk', nb: 'Språk',
};

const LEGAL = /^\/legal\/[a-z-]+$/;

/** Page path (without language prefix) if it is a page that exists in `target`; null otherwise. */
export function translatedPath(path: string, target: string, contentPages = contentPagesEnabled()): string | null {
  const p = path.replace(/\/+$/, '');
  if (p === '' || p === '/blog') return p;
  if (contentPages && (p === '/about' || p === '/help')) return p;
  if (contentPages && p.startsWith('/help/') && (HELP_TOPIC_SLUGS as readonly string[]).includes(p.slice(6))) return p;
  if (LEGAL.test(p)) return target === 'en' ? p : null;
  return null;
}

/**
 * Destination of the switcher link from `pathname` (public path, e.g. /de/help/devices) to `target`.
 * `kept` is false when the page does not exist in the target language (link to its home page).
 */
export function switchHref(pathname: string, target: SwitcherLanguage, languages: readonly SwitcherLanguage[], contentPages?: boolean): { href: string; kept: boolean } {
  const [, first = '', ...rest] = (pathname.split('?')[0] ?? '').split('/');
  // English pages are served from the internal route /en/* (rewritten from /*): usePathname() may return either form.
  const current = languages.find((l) => l.code === first);
  const path = current ? (rest.length ? `/${rest.join('/')}` : '') : pathname === '/' ? '' : pathname;
  const kept = translatedPath(path, target.code, contentPages);
  return kept === null ? { href: prefixedPath(target.prefix), kept: false } : { href: prefixedPath(target.prefix, kept), kept: true };
}
