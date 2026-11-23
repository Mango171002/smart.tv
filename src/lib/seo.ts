import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { DEFAULT_LOCALE, LOCALES, isPublicLocale, localeSeo, type Locale } from '@/i18n/config';
import { DEFAULT_LANGUAGE, enabledLanguages, prefixedPath, type SiteLanguage } from '@/i18n/locales';
import { LEGAL_DOCS, localizedPath } from '@/lib/routes';

/** Social sharing image (1200×630). */
export const OG_IMAGE = { url: '/brand/og-image.jpg', width: 1200, height: 630, alt: 'SYGMA TV+ — One World. Endless Entertainment.' };
/** The same image for X cards, with its text alternative (twitter:image:alt, like og:image:alt). */
export const TWITTER_IMAGE = { url: OG_IMAGE.url, alt: OG_IMAGE.alt };

/**
 * Pages that exist only in some languages. A page not listed here exists in every built language (all pages
 * are served by the [locale] segment). Untranslated paths are listed here so that no hreflang (nor sitemap
 * alternate) points to a missing page. The legal documents are English only (not translated; /fr/legal/*
 * redirects to the English page).
 */
export const PAGE_AVAILABILITY: Readonly<Record<string, readonly Locale[]>> = Object.fromEntries(
  LEGAL_DOCS.map((d) => [`/legal/${d}`, ['en'] as const]),
);

/** Built languages in which a page exists (includes preview languages in the preview environment). */
export function pageLocales(path: string): Locale[] {
  const only = PAGE_AVAILABILITY[path];
  return only ? LOCALES.filter((l) => only.includes(l)) : [...LOCALES];
}

/** Public (enabled) languages in which a page exists: sitemap entries, hreflang and og:locale:alternate. */
export function publicPageLocales(path: string): Locale[] {
  return pageLocales(path).filter(isPublicLocale);
}

/**
 * hreflang set of a page: one generic language code per ENABLED language where the page exists, plus
 * x-default → the English (root) version. Values are paths (relative to metadataBase) unless `base` is given
 * (absolute URLs, for the sitemap). Undefined when fewer than two languages have the page: a single-language
 * page needs no hreflang (today's output, English only). Disabled languages are never included.
 */
export function hreflangAlternates(
  path: string,
  {
    languages = enabledLanguages(),
    availableIn,
    base = '',
  }: { languages?: readonly SiteLanguage[]; availableIn?: readonly string[]; base?: string } = {},
): Record<string, string> | undefined {
  const has = (l: SiteLanguage) => l.status === 'enabled' && (availableIn ? availableIn.includes(l.code) : true);
  const set = languages.filter(has);
  if (set.length < 2) return undefined;
  const out: Record<string, string> = {};
  for (const l of set) out[l.hreflang] = `${base}${prefixedPath(l.prefix, path)}`;
  const def = set.find((l) => l.code === DEFAULT_LANGUAGE);
  if (def) out['x-default'] = `${base}${prefixedPath(def.prefix, path)}`;
  return out;
}

/** Canonical path of a page in a language: always itself (a translation is never canonicalised to English). */
export const canonicalPath = (locale: Locale, path: string) => localizedPath(locale, path);

/**
 * Page metadata: unique title + description, self-referencing canonical, hreflang between the enabled
 * languages where the page exists (none today), Open Graph and X cards.
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
  noindex = false,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** The home page title already contains the brand: no « | SYGMA TV+ » suffix. */
  absoluteTitle?: boolean;
  /** Pages without content yet (kept out of search results and of the sitemap). */
  noindex?: boolean;
}): Metadata {
  const url = canonicalPath(locale, path);
  const fullTitle = absoluteTitle ? title : `${title} | ${siteConfig.brandName}`;
  // A preview language (phase 7B) is never indexable, whatever the environment.
  const publicLocale = isPublicLocale(locale);
  const indexable = siteConfig.allowIndexing && !noindex && publicLocale;
  // A noindex page is not part of the hreflang cluster (an alternate must be an indexable page).
  const languages = indexable ? hreflangAlternates(path, { availableIn: publicPageLocales(path) }) : undefined;
  const seo = localeSeo(locale);
  const alternateLocale = languages
    ? publicPageLocales(path).filter((l) => l !== locale).map((l) => localeSeo(l).ogLocale)
    : [];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: languages ? { canonical: url, languages } : { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      locale: seo.ogLocale,
      ...(alternateLocale.length ? { alternateLocale } : {}),
      type: 'website',
      siteName: siteConfig.brandName,
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [TWITTER_IMAGE] },
    robots: indexable ? { index: true, follow: true } : publicLocale ? { index: false, follow: true } : { index: false, follow: false },
  };
}

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  return (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : DEFAULT_LOCALE;
}
