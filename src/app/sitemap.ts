import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { contentPagesIndexable } from '@/config/content-pages';
import { HELP_SLUGS, INFO_REVIEWED } from '@/content/en/info';
import { isoDate, lastModifiedOf } from '@/lib/lastmod';
import { ALL_PATHS, absoluteUrl } from '@/lib/routes';
import { hreflangAlternates, pageLocales } from '@/lib/seo';

/** Content pages (About us, Help center): listed only once published (« live »), with their « Last reviewed » date. */
const CONTENT_PATHS = ['/about', '/help', ...HELP_SLUGS.map((s) => `/help/${s}`)];

/**
 * Clean public URLs: one entry per page and per ENABLED language where the page exists (English only today:
 * no language prefix, no alternates). Disabled languages are never listed. Once a second language is enabled,
 * each entry carries its hreflang alternates (xhtml:link), the same set as the page's HTML.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = contentPagesIndexable() ? [...ALL_PATHS, ...CONTENT_PATHS] : ALL_PATHS;
  const reviewed = isoDate(INFO_REVIEWED);
  return paths.flatMap((path) => {
    const lastModified = CONTENT_PATHS.includes(path) ? reviewed : lastModifiedOf(path);
    const locales = pageLocales(path);
    const languages = hreflangAlternates(path, { availableIn: locales, base: siteConfig.siteUrl });
    return locales.map((locale) => ({
      url: absoluteUrl(locale, path),
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.6,
      ...(languages ? { alternates: { languages } } : {}),
    }));
  });
}
