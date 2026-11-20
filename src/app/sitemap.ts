import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { contentPagesIndexable } from '@/config/content-pages';
import { HELP_SLUGS, INFO_REVIEWED } from '@/content/en/info';
import { isoDate, lastModifiedOf } from '@/lib/lastmod';
import { ALL_PATHS } from '@/lib/routes';

/** Content pages (About us, Help center): listed only once published (« live »), with their « Last reviewed » date. */
const CONTENT_PATHS = ['/about', '/help', ...HELP_SLUGS.map((s) => `/help/${s}`)];

/** Clean public URLs (no language prefix). */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = contentPagesIndexable() ? [...ALL_PATHS, ...CONTENT_PATHS] : ALL_PATHS;
  const reviewed = isoDate(INFO_REVIEWED);
  return paths.map((path) => {
    const lastModified = CONTENT_PATHS.includes(path) ? reviewed : lastModifiedOf(path);
    return {
      url: `${siteConfig.siteUrl}${path || '/'}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.6,
    };
  });
}
