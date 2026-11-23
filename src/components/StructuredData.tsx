import { siteConfig } from '@/config/site';
import { OG_IMAGE } from '@/lib/seo';
import { OWNER_FACTS } from '@/content/en/info';
import { DEFAULT_LOCALE, LOCALES, localeSeo, type Locale } from '@/i18n/config';
import en from '@/i18n/dictionaries/en';
import { prelaunchCopy } from '@/lib/prelaunch-copy';

/**
 * Profiles listed in `sameAs`: stable public identities only. A Telegram invite link (t.me/+… or
 * t.me/joinchat/…) is not one — it can be revoked or regenerated — so it stays a « join » link in the footer
 * but is never given to search engines as an identity of the organisation.
 */
export function sameAsProfiles(social: Record<string, string | null>): string[] {
  const invite = /^https:\/\/t\.me\/(?:\+|joinchat\/)/i;
  return Object.values(social).filter((v): v is string => Boolean(v) && !invite.test(v as string));
}

/**
 * Organization and WebSite are ONE entity each (same @id on every language's home page), so they carry one value
 * everywhere: the English description (the open or the prelaunch one, per FEATURE_CONTACT_FORM) and, for the WebSite,
 * every language this build serves. Only the FAQPage node is per page and per language.
 */
export function siteEntityFacts(ordersOpen: boolean) {
  return { description: prelaunchCopy(en, ordersOpen).meta.homeDescription, inLanguage: LOCALES.map((l) => localeSeo(l).htmlLang) };
}

/** JSON-LD (Organization + WebSite) for the home page. Only verified, public facts. */
export function StructuredData({ ordersOpen, locale = DEFAULT_LOCALE, faq }: { ordersOpen: boolean; locale?: Locale; faq?: { items: ReadonlyArray<{ q: string; a: string }>; pageUrl: string } }) {
  const url = siteConfig.siteUrl;
  const { description, inLanguage } = siteEntityFacts(ordersOpen);
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
        foundingDate: OWNER_FACTS.established,
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
            availableLanguage: [...OWNER_FACTS.languages],
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
        inLanguage,
        publisher: { '@id': `${url}/#organization` },
      },
      ...(faq ? [faqJsonLd(faq.items, locale, faq.pageUrl)] : []),
    ],
  };
  // JSON-LD is data, not executed; `<` is escaped so the content cannot close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

/**
 * FAQPage node of a home page's JSON-LD graph (phase 10, GEO): exactly the questions and answers displayed in its FAQ section, in
 * the page language — no extra claim. Search engines no longer show FAQ rich results for most sites; the markup still
 * gives answer engines a clean question → answer structure of content that is visible on the page.
 */
export function faqJsonLd(items: ReadonlyArray<{ q: string; a: string }>, locale: Locale, pageUrl: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    url: pageUrl,
    inLanguage: localeSeo(locale).htmlLang,
    mainEntity: items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })),
  };
}

