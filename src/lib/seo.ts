import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { LOCALES, type Locale } from '@/i18n/config';

export function buildMetadata({
  locale: _locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = path || '/';
  const languages = { en: url, 'x-default': url } as Record<string, string>;
  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      title: `${title} | ${siteConfig.brandName}`,
      description,
      locale: 'en_US',
      type: 'website',
      siteName: siteConfig.brandName,
      images: [{ url: '/brand/sygma-logo-dark-preview.png', width: 1200, height: 214, alt: siteConfig.brandName }],
    },
    robots: siteConfig.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  return (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : 'en';
}
