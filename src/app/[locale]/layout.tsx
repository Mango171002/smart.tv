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
import { LOCALES, isLocale, isPublicLocale, localeSeo } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { OG_IMAGE, TWITTER_IMAGE } from '@/lib/seo';
import { CONSENT_DEFAULT_SCRIPT } from '@/lib/consent-default';
import { isContactFormEnabled } from '@/lib/features';
import { prelaunchCopy } from '@/lib/prelaunch-copy';

export const dynamicParams = false;

/** Only enabled languages are built (src/i18n/locales.ts); any other first segment is a 404. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: '#070d17', width: 'device-width', initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = prelaunchCopy(getDictionary(isLocale(locale) ? locale : 'en'), isContactFormEnabled());
  // A preview language (phase 7B) is never indexable: default robots for all its pages (each page also sets it).
  const preview = isLocale(locale) && !isPublicLocale(locale);
  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: { default: `${siteConfig.brandName} — ${dict.meta.siteTitle}`, template: `%s | ${siteConfig.brandName}` },
    description: dict.meta.homeDescription,
    robots: siteConfig.allowIndexing && !preview ? undefined : { index: false, follow: false },
    applicationName: siteConfig.brandName,
    openGraph: { siteName: siteConfig.brandName, images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', images: [TWITTER_IMAGE] },
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
    <html lang={localeSeo(locale).htmlLang} suppressHydrationWarning>
      <head>
        {/* Google Consent Mode: everything denied by default, before any Google tag can load.
            The visitor's choice is sent later with gtag('consent', 'update', …) (src/lib/analytics.ts). */}
        <script id="consent-default" dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
      </head>
      <body>
        <RevealScript />
        <a className="skip-link" href="#main">{dict.common.skipToContent}</a>
        <Header locale={locale} nav={dict.nav} />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer locale={locale} dict={dict} />
        <SupportButton nav={dict.nav} />
        <SectionLinkHandler />
        <ConsentBanner dict={dict.consent} />
        <Analytics />
        {/* Online requests closed (FEATURE_CONTACT_FORM=false): the trial / support windows show the prelaunch message. */}
        <RequestHost locale={locale} dict={{ request: dict.request, forms: dict.forms, common: dict.common, prelaunch: dict.prelaunch }} ordersOpen={isContactFormEnabled()} />
      </body>
    </html>
  );
}
