import { siteConfig } from '@/config/site';
import { contentPagesIndexable } from '@/config/content-pages';
import { buildMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/config';

const abs = (p: string) => `${siteConfig.siteUrl}${p}`;
export const ORG_REF = () => ({ '@type': 'Organization', '@id': `${siteConfig.siteUrl}/#organization`, name: siteConfig.brandName, url: `${siteConfig.siteUrl}/` });
export const WEBSITE_REF = () => ({ '@id': `${siteConfig.siteUrl}/#website` });

/** Metadata of a content page: indexable only once the pages are « live » (never in « preview »). */
export function infoMetadata(locale: Locale, path: string, title: string, description: string) {
  return buildMetadata({ locale, path, title, description, noindex: !contentPagesIndexable() });
}

export function webPageLd(type: 'AboutPage' | 'CollectionPage' | 'WebPage', path: string, name: string, description: string, extra: Record<string, unknown> = {}) {
  return { '@context': 'https://schema.org', '@type': type, '@id': `${abs(path)}#webpage`, url: abs(path), name, description, inLanguage: 'en', isPartOf: WEBSITE_REF(), ...extra };
}
export { abs };
