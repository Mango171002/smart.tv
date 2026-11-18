import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { LOCALES, type Locale } from '@/i18n/config';
import { isLive, SITE_LOCALES, type SiteLocale } from '@/i18n/locales';
import { href } from '@/lib/routes';

/** Social sharing image (1200×630). */
export const OG_IMAGE = { url: '/brand/og-image.jpg', width: 1200, height: 630, alt: 'SYGMA TV+ — One World. Endless Entertainment.' };

/**
 * hreflang alternates of a page: every LIVE version of it, plus x-default (the English home « / »).
 * Nothing while only one version is live (today: « / » alone, exactly as before the international
 * versions). Preview versions never appear here, nor in the sitemap.
 */
/** Main version of each language, used for the language-only hreflang (« fr » → /fr-fr). */
const LANGUAGE_HOME: Record<string, string> = { en: 'en', fr: 'fr-fr', de: 'de-de', es: 'es-es', nl: 'nl-be' };

/**
 * hreflang alternates of a page: every LIVE version where the page exists (`exists`), a language-only
 * entry (« fr ») pointing to the main version of the language — so that French speakers of countries
 * without their own version (Belgium, Switzerland, Morocco…) land on it — and x-default (the English home).
 * Nothing while the page exists in only one live version (today: « / » alone, exactly as before).
 */
export function hreflangAlternates(
  path: string,
  registry: Record<string, SiteLocale> = SITE_LOCALES,
  exists: (id: string) => boolean = () => true,
): Record<string, string> | undefined {
  const live = Object.values(registry).filter((l) => l.status === 'live' && exists(l.id));
  if (live.length < 2) return undefined;
  const withPrefix = (l: SiteLocale) => (path ? (path.startsWith('#') ? `${l.prefix || '/'}${path}` : `${l.prefix}${path}`) : l.prefix || '/');
  const languages: Record<string, string> = {};
  for (const l of live) languages[l.hreflang] = withPrefix(l);
  for (const lang of new Set(live.map((l) => l.language))) {
    if (languages[lang]) continue;
    const home = live.find((l) => l.id === LANGUAGE_HOME[lang]) ?? live.find((l) => l.language === lang)!;
    languages[lang] = withPrefix(home);
  }
  const def = live.find((l) => l.prefix === '') ?? live[0]!;
  languages['x-default'] = withPrefix(def);
  return languages;
}

/**
 * Page metadata: unique title + description, canonical URL (each version points to itself), hreflang
 * between live versions, Open Graph and X cards. A version that is not live is never indexable.
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
  noindex = false,
  existsIn,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** The home page title already contains the brand: no « | SYGMA TV+ » suffix. */
  absoluteTitle?: boolean;
  /** Pages without content yet (kept out of search results and of the sitemap). */
  noindex?: boolean;
  /** Versions where this page exists (hreflang); default: every version. */
  existsIn?: (id: string) => boolean;
}): Metadata {
  const url = href(locale, path);
  const fullTitle = absoluteTitle ? title : `${title} | ${siteConfig.brandName}`;
  const indexable = siteConfig.allowIndexing && !noindex && isLive(locale);
  const languages = isLive(locale) ? hreflangAlternates(path, SITE_LOCALES, existsIn) : undefined;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: languages ? { canonical: url, languages } : { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      locale: SITE_LOCALES[locale].ogLocale,
      type: 'website',
      siteName: siteConfig.brandName,
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [OG_IMAGE.url] },
    robots: indexable ? { index: true, follow: true } : isLive(locale) ? { index: false, follow: true } : { index: false, follow: false },
  };
}

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  return (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : 'en';
}
