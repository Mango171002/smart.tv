import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { LOCALES, type Locale } from '@/i18n/config';

export function buildMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `/${l}${path}`])) as Record<string, string>;
  languages['x-default'] = `/en${path}`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}${path}`, languages },
    openGraph: {
      title: `${title} | ${siteConfig.brandName}`,
      description,
      locale: 'en_US',
      type: 'website',
      siteName: siteConfig.brandName,
    },
    robots: siteConfig.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  return (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : 'en';
}
