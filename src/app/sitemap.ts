import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { faqFor, guidesFor } from '@/content/intl';
import { liveLocales, SITE_LOCALES, type LocaleId } from '@/i18n/locales';
import { lastModifiedOf } from '@/lib/lastmod';
import { ALL_PATHS, href } from '@/lib/routes';
import { hreflangAlternates } from '@/lib/seo';

/** Pages of a version, with the versions where each one exists (for hreflang). */
function pagesOf(locale: LocaleId): Array<{ path: string; exists: (id: string) => boolean }> {
  const all = (_id: string) => true;
  const pages: Array<{ path: string; exists: (id: string) => boolean }> = ALL_PATHS.map((path) => ({ path, exists: all }));
  if (faqFor(locale)) pages.push({ path: '/faq', exists: (id) => Boolean(faqFor(id as LocaleId)) });
  const g = guidesFor(locale);
  if (g) {
    const hosts = (id: string) => Boolean(guidesFor(id as LocaleId));
    pages.push({ path: '/guides', exists: hosts });
    for (const guide of g.guides) pages.push({ path: `/guides/${guide.slug}`, exists: hosts });
  }
  return pages;
}

/**
 * Every indexable page of every LIVE version (preview versions never appear). When a page exists in
 * several live versions, each entry lists its alternates (xhtml:link hreflang), as Google and Bing expect.
 * lastmod only on pages that print their « Last updated » date (legal pages), in every version.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const abs = (p: string) => `${siteConfig.siteUrl}${p}`;
  return liveLocales().flatMap((id) => {
    const locale = id as LocaleId;
    return pagesOf(locale).map(({ path, exists }) => {
      const languages = hreflangAlternates(path, undefined, exists);
      const lastModified = lastModifiedOf(path, SITE_LOCALES[locale].language);
      return {
        url: abs(href(locale, path)),
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'monthly' as const,
        priority: path === '' ? 1 : 0.6,
        ...(languages ? { alternates: { languages: Object.fromEntries(Object.entries(languages).map(([k, v]) => [k, abs(v)])) } } : {}),
      };
    });
  });
}
