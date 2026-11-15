import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { LOCALES, type Locale } from '@/i18n/config';

/** Social sharing image (1200×630). */
export const OG_IMAGE = { url: '/brand/og-image.jpg', width: 1200, height: 630, alt: 'SYGMA TV+ — One World. Endless Entertainment.' };

/**
 * Page metadata: unique title + description, canonical URL (no language prefix), Open Graph and X
 * cards. English only: no hreflang alternates (there are no translated pages).
 */
export function buildMetadata({
  locale: _locale,
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
  const url = path || '/';
  const fullTitle = absoluteTitle ? title : `${title} | ${siteConfig.brandName}`;
  const indexable = siteConfig.allowIndexing && !noindex;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      locale: 'en_US',
      type: 'website',
      siteName: siteConfig.brandName,
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [OG_IMAGE.url] },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  return (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : 'en';
}
