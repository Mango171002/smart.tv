import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '../globals.css';
import { Footer } from '@/components/Footer';
import { SupportButton } from '@/components/SupportButton';
import { RequestHost } from '@/components/RequestHost';
import { SectionLinkHandler } from '@/components/SectionLinkHandler';
import { RevealScript } from '@/components/RevealScript';
import { Header } from '@/components/Header';
import { Analytics } from '@/components/Analytics';
import { ConsentBanner } from '@/components/ConsentBanner';
import { siteConfig } from '@/config/site';
import { LOCALES, isLocale } from '@/i18n/config';
import { isLive, SITE_LOCALES } from '@/i18n/locales';
import { fill, getDictionary } from '@/i18n/dictionaries';
import { href } from '@/lib/routes';
import { OG_IMAGE } from '@/lib/seo';
import { CONSENT_DEFAULT_SCRIPT } from '@/lib/consent-default';

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: '#070d17', width: 'device-width', initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : 'en');
  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: { default: `${siteConfig.brandName} — ${dict.meta.siteTitle}`, template: `%s | ${siteConfig.brandName}` },
    description: dict.meta.homeDescription,
    robots: siteConfig.allowIndexing && (!isLocale(locale) || isLive(locale)) ? undefined : { index: false, follow: false },
    applicationName: siteConfig.brandName,
    openGraph: { siteName: siteConfig.brandName, images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', images: [OG_IMAGE.url] },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  return (
    <html lang={SITE_LOCALES[locale].htmlLang} suppressHydrationWarning>
      <head>
        {/* Google Consent Mode: everything denied by default, before any Google tag can load.
            The visitor's choice is sent later with gtag('consent', 'update', …) (src/lib/analytics.ts). */}
        <script id="consent-default" dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
      </head>
      <body>
        <RevealScript />
        {!isLive(locale) && <p className="preview-ribbon" role="note">{dict.intl.previewRibbon}</p>}
        <a className="skip-link" href="#main">{dict.common.skipToContent}</a>
        <Header locale={locale} nav={dict.nav} />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer locale={locale} dict={dict} />
        <SupportButton nav={dict.nav} />
        <SectionLinkHandler />
        {/* The English home keeps its exact markup; other versions link to their own cookie policy. */}
        <ConsentBanner dict={dict.consent} {...(locale === 'en' ? {} : { policyHref: href(locale, '/legal/cookies') })} />
        <Analytics />
        <RequestHost
          locale={locale}
          dict={{ request: dict.request, forms: dict.forms, common: dict.common }}
          {...(isLive(locale) ? {} : { closed: { title: dict.intl.closedTitle, text: fill(dict.intl.closedText, { email: siteConfig.supportEmail ?? '' }), close: dict.intl.close } })}
        />
      </body>
    </html>
  );
}
