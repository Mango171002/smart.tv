import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { lastModifiedOf } from '@/lib/lastmod';
import { ALL_PATHS } from '@/lib/routes';

/** Clean public URLs (no language prefix). */
export default function sitemap(): MetadataRoute.Sitemap {
  return ALL_PATHS.map((path) => {
    const lastModified = lastModifiedOf(path);
    return {
      url: `${siteConfig.siteUrl}${path || '/'}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.6,
    };
  });
}
