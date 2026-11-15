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
import { getDictionary } from '@/i18n/dictionaries';
import { OG_IMAGE } from '@/lib/seo';

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
    robots: siteConfig.allowIndexing ? undefined : { index: false, follow: false },
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
    <html lang={locale} suppressHydrationWarning>
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
        <RequestHost locale={locale} dict={{ request: dict.request, forms: dict.forms, common: dict.common }} />
      </body>
    </html>
  );
}
