import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.allowIndexing) {
    // Prototype: keep the whole site out of search engines.
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return { rules: { userAgent: '*', allow: '/', disallow: '/api/' }, sitemap: `${siteConfig.siteUrl}/sitemap.xml` };
}
