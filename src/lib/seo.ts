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
export function hreflangAlternates(path: string, registry: Record<string, SiteLocale> = SITE_LOCALES): Record<string, string> | undefined {
  const live = Object.values(registry).filter((l) => l.status === 'live');
  if (live.length < 2) return undefined;
  const withPrefix = (l: SiteLocale) => (path ? (path.startsWith('#') ? `${l.prefix || '/'}${path}` : `${l.prefix}${path}`) : l.prefix || '/');
  const languages: Record<string, string> = {};
  for (const l of live) languages[l.hreflang] = withPrefix(l);
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
  const url = href(locale, path);
  const fullTitle = absoluteTitle ? title : `${title} | ${siteConfig.brandName}`;
  const indexable = siteConfig.allowIndexing && !noindex && isLive(locale);
  const languages = isLive(locale) ? hreflangAlternates(path) : undefined;
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
