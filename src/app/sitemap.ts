import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { liveLocales, type LocaleId } from '@/i18n/locales';
import { ALL_PATHS, href } from '@/lib/routes';
import { hreflangAlternates } from '@/lib/seo';

/**
 * Every indexable page of every LIVE version (preview versions never appear). When a page exists in
 * several live versions, each entry lists its alternates (xhtml:link hreflang), as Google and Bing expect.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const abs = (p: string) => `${siteConfig.siteUrl}${p}`;
  return liveLocales().flatMap((locale) =>
    ALL_PATHS.map((path) => {
      const languages = hreflangAlternates(path);
      return {
        url: abs(href(locale as LocaleId, path)),
        changeFrequency: 'monthly' as const,
        priority: path === '' ? 1 : 0.6,
        ...(languages ? { alternates: { languages: Object.fromEntries(Object.entries(languages).map(([k, v]) => [k, abs(v)])) } } : {}),
      };
    }),
  );
}
