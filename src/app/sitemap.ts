import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { ALL_PATHS } from '@/lib/routes';

/** Clean public URLs (no language prefix). */
export default function sitemap(): MetadataRoute.Sitemap {
  return ALL_PATHS.map((path) => ({
    url: `${siteConfig.siteUrl}${path || '/'}`,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.6,
  }));
}
