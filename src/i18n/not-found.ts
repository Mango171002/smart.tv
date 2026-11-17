import { SITE_LOCALES, type SiteLocale } from './locales';

/**
 * Texts of the 404 page, per language. The 404 page is a client component: it only ships these few
 * strings, not whole dictionaries. Kept equal to dictionaries[language].notFound (unit test).
 */
export const NOT_FOUND_TEXTS = {
  en: { title: 'This page does not exist.', text: 'The page you are looking for may have moved.', home: 'Back to home' },
  fr: { title: 'Cette page n’existe pas.', text: 'La page que vous cherchez a peut-être été déplacée.', home: 'Retour à l’accueil' },
} as const;

/** Version of a path (« /fr-fr/xyz » → fr-fr), the English home otherwise. */
export function localeOfPath(pathname: string): SiteLocale {
  const seg = pathname.split('/')[1] ?? '';
  const l = (SITE_LOCALES as Record<string, SiteLocale>)[seg];
  return l && l.prefix ? l : SITE_LOCALES.en;
}
