import { siteConfig } from '@/config/site';
import { OG_IMAGE } from '@/lib/seo';

/**
 * Profiles listed in `sameAs`: stable public identities only. A Telegram invite link (t.me/+… or
 * t.me/joinchat/…) is not one — it can be revoked or regenerated — so it stays a « join » link in the footer
 * but is never given to search engines as an identity of the organisation.
 */
export function sameAsProfiles(social: Record<string, string | null>): string[] {
  const invite = /^https:\/\/t\.me\/(?:\+|joinchat\/)/i;
  return Object.values(social).filter((v): v is string => Boolean(v) && !invite.test(v as string));
}

/** JSON-LD (Organization + WebSite) for the home page. Only verified, public facts. */
export function StructuredData({ description }: { description: string }) {
  const url = siteConfig.siteUrl;
  const sameAs = sameAsProfiles(siteConfig.social);
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
