import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/config';
import { SITE_LOCALES } from '@/i18n/locales';
import { href } from '@/lib/routes';
import { OG_IMAGE } from '@/lib/seo';

/**
 * JSON-LD (Organization + WebSite) for the home page of a version. Only verified, public facts.
 * One Organization (Sygma TV LLC) shared by every version; one WebSite per version, in its language.
 */
export function StructuredData({ description, locale = 'en' }: { description: string; locale?: Locale }) {
  const url = siteConfig.siteUrl;
  const home = href(locale);
  const site = home === '/' ? `${url}/` : `${url}${home}`;
  const siteId = home === '/' ? `${url}/#website` : `${url}${home}#website`;
  const sameAs = Object.values(siteConfig.social).filter((v): v is string => Boolean(v));
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${url}/#organization`,
        name: siteConfig.brandName,
        url: `${url}/`,
        // Square symbol: Google asks for a logo of at least 112×112 px (the wordmark is 512×67).
        logo: { '@type': 'ImageObject', url: `${url}/brand/sygma-symbol-512.png`, width: 512, height: 512 },
        image: `${url}${OG_IMAGE.url}`,
        slogan: 'One World. Endless Entertainment.',
        description,
        ...(siteConfig.legalEntity ? { legalName: siteConfig.legalEntity } : {}),
        ...(siteConfig.supportEmail ? { email: siteConfig.supportEmail } : {}),
        address: {
          '@type': 'PostalAddress',
          streetAddress: '1209 Mountain Road Pl NE, Ste H',
          addressLocality: 'Albuquerque',
          addressRegion: 'NM',
          postalCode: '87110',
          addressCountry: 'US',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            ...(siteConfig.supportEmail ? { email: siteConfig.supportEmail } : {}),
            ...(siteConfig.supportPhone ? { telephone: siteConfig.supportPhone.replace(/\s+/g, '') } : {}),
            availableLanguage: ['English'],
          },
        ],
        sameAs,
      },
      {
        '@type': 'WebSite',
        '@id': siteId,
        url: site,
        name: siteConfig.brandName,
        description,
        inLanguage: SITE_LOCALES[locale].htmlLang,
        publisher: { '@id': `${url}/#organization` },
      },
    ],
  };
  // JSON-LD is data, not executed; `<` is escaped so the content cannot close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
