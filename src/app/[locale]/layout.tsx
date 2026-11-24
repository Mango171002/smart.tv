import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { preload } from 'react-dom';
import '../globals.css';
import { Footer } from '@/components/Footer';
import { SupportButton } from '@/components/SupportButton';
import { RequestHost } from '@/components/RequestHost';
import { SectionLinkHandler } from '@/components/SectionLinkHandler';
import { RevealScript } from '@/components/RevealScript';
import { Header } from '@/components/Header';
import { PrelaunchStrip } from '@/components/PrelaunchStrip';
import { LegalReturnMemory } from '@/components/LegalReturn';
import { Analytics } from '@/components/Analytics';
import { ConsentBanner } from '@/components/ConsentBanner';
import { siteConfig } from '@/config/site';
import { LOCALES, isLocale, isPublicLocale, localeSeo } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { OG_IMAGE, TWITTER_IMAGE } from '@/lib/seo';
import { CONSENT_DEFAULT_SCRIPT } from '@/lib/consent-default';
import { isContactFormEnabled } from '@/lib/features';
import { prelaunchCopy } from '@/lib/prelaunch-copy';
import { localizedPath } from '@/lib/routes';

/** Self-hosted Inter (D-6): only the Latin subset is preloaded; Latin Extended loads on demand (unicode-range, globals.css). */
const INTER_LATIN = '/fonts/inter/inter-latin-wght-normal.v5.3.0.woff2';

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
  const ordersOpen = isContactFormEnabled();
  // <link rel="preload"> in the document head (React hoists and de-duplicates it).
  preload(INTER_LATIN, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
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
        {/* Orders and free trials closed: one discreet line under the header on every page (D-1). */}
        {!ordersOpen && <PrelaunchStrip text={dict.prelaunch.pagesTitle} plans={{ label: dict.prelaunch.ui.stripPlans, href: localizedPath(locale, '#plans') }} />}
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer locale={locale} dict={dict} />
        <SupportButton nav={dict.nav} />
        <SectionLinkHandler />
        <LegalReturnMemory locale={locale} />
        <ConsentBanner dict={dict.consent} />
        <Analytics />
        {/* Online requests closed (FEATURE_CONTACT_FORM=false): the trial / support windows show the prelaunch message. */}
        <RequestHost locale={locale} dict={{ request: dict.request, forms: dict.forms, common: dict.common, prelaunch: dict.prelaunch }} ordersOpen={ordersOpen} />
      </body>
    </html>
  );
}
