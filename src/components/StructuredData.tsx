import { siteConfig } from '@/config/site';
import { OG_IMAGE } from '@/lib/seo';

/** JSON-LD (Organization + WebSite) for the home page. Only verified, public facts. */
export function StructuredData({ description }: { description: string }) {
  const url = siteConfig.siteUrl;
  const sameAs = Object.values(siteConfig.social).filter((v): v is string => Boolean(v));
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${url}/#organization`,
        name: siteConfig.brandName,
        url: `${url}/`,
        logo: { '@type': 'ImageObject', url: `${url}/brand/sygma-logo-512.png`, width: 512, height: 67 },
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
        '@id': `${url}/#website`,
        url: `${url}/`,
        name: siteConfig.brandName,
        description,
        inLanguage: 'en',
        publisher: { '@id': `${url}/#organization` },
      },
    ],
  };
  // JSON-LD is data, not executed; `<` is escaped so the content cannot close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
