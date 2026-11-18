import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { siteConfig } from '@/config/site';
import { faqFor } from '@/content/intl';
import { LOCALES, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { href } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo';

export const dynamicParams = false;

/** Only the versions that have a FAQ page (none in English: « / » keeps its FAQ section). */
export function generateStaticParams() {
  return LOCALES.filter((locale) => faqFor(locale)).map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  if (!isLocale(locale) || !faqFor(locale)) return {};
  const t = getDictionary(locale).intl;
  return buildMetadata({ locale, path: '/faq', title: t.faqMetaTitle, description: t.faqDescription, existsIn: (id) => Boolean(faqFor(id as never)) });
}

export default async function FaqPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const items = faqFor(locale);
  if (!items) notFound();
  const dict = getDictionary(locale);
  const t = dict.intl;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return (
    <div className="wrap page-head faq-page" style={{ paddingBottom: 60 }}>
      <Breadcrumbs label={t.breadcrumbHome} items={[{ name: t.breadcrumbHome, href: href(locale) }, { name: t.faqTitle, href: href(locale, '/faq') }]} />
      <div className="eyebrow">{dict.faq.eyebrow}</div>
      <h1 className="page-title">{t.faqTitle}</h1>
      <p className="sub">{t.faqSub}</p>
      <div className="faq faq-full">
        {items.map((f, i) => (
          <details key={f.id} id={f.id} open={i === 0}>
            <summary>
              <h2 className="faq-q">{f.q}</h2>
              <span className="faq-toggle" aria-hidden="true">
                <Plus className="faq-plus" size={16} strokeWidth={2.25} />
                <Minus className="faq-minus" size={16} strokeWidth={2.25} />
              </span>
            </summary>
            <p>{f.a}</p>
            {f.links && (
              <p className="faq-links">
                {f.links.map((l) => (
                  <Link key={l.path} href={href(locale, l.path)}>{l.label} →</Link>
                ))}
              </p>
            )}
          </details>
        ))}
      </div>
      <section className="terms-contact faq-contact" aria-labelledby="faq-contact-t">
        <h2 id="faq-contact-t">{t.faqStillQuestions}</h2>
        <p>{t.faqContact}</p>
        <ul>
          {siteConfig.supportEmail && <li><a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a></li>}
          {siteConfig.supportWhatsApp && <li><a href={`https://wa.me/${siteConfig.supportWhatsApp}`} rel="noopener noreferrer" target="_blank">WhatsApp {siteConfig.supportPhone}</a></li>}
        </ul>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
    </div>
  );
}
