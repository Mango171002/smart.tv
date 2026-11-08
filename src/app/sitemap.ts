import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { LOCALES } from '@/i18n/config';
import { ALL_PATHS } from '@/lib/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  return ALL_PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${siteConfig.siteUrl}/${locale}${path}`,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${siteConfig.siteUrl}/${l}${path}`])) },
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.6,
    })),
  );
}
