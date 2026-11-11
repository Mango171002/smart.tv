import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '../globals.css';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { siteConfig } from '@/config/site';
import { LOCALES, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

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
    <html lang={locale}>
      <body>
        <a className="skip-link" href="#main">{dict.common.skipToContent}</a>
        <Header locale={locale} nav={dict.nav} />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer locale={locale} dict={dict} />
      </body>
    </html>
  );
}
