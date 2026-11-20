import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { INFO_ICONS, InfoContent } from '@/components/InfoContent';
import { JsonLd } from '@/components/JsonLd';
import { contentPagesEnabled } from '@/config/content-pages';
import { HELP_HUB, HELP_TOPICS, INFO_REVIEWED } from '@/content/en/info';
import { isLocale } from '@/i18n/config';
import { abs, infoMetadata, webPageLd } from '@/lib/info-pages';
import s from '@/components/info.module.css';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  if (!contentPagesEnabled() || !isLocale(locale)) return {};
  return infoMetadata(locale, '/help', HELP_HUB.metaTitle, HELP_HUB.description);
}

export default async function HelpCenter({ params }: { params: Params }) {
  const { locale } = await params;
  if (!contentPagesEnabled() || !isLocale(locale)) notFound();
  return (
    <div className="wrap page-head" style={{ paddingBottom: 60 }}>
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: HELP_HUB.name, path: '/help' }]} />
      <div className="eyebrow">Support</div>
      <h1 className="page-title">{HELP_HUB.title}</h1>
      <p className="sub">{HELP_HUB.intro}</p>
      <ul className={s.grid}>
        {HELP_TOPICS.map((t) => {
          const Icon = INFO_ICONS[t.icon];
          return (
            <li key={t.slug}>
              <Link className={s.card} href={`/help/${t.slug}`}>
                <span className="icon-box sm" aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
                <span><strong>{t.name}</strong><span className="text">{t.summary}</span></span>
              </Link>
            </li>
          );
        })}
      </ul>
      <InfoContent sections={[]} reviewed={INFO_REVIEWED} contactIntro="Can’t find your answer? Write to us — tell us your device and, if you have one, your order reference." related={[{ href: '/about', label: 'About us' }, { href: '/#faq', label: 'FAQ' }, { href: '/legal/refunds', label: 'Refunds & cancellations' }]} />
      <JsonLd
        data={webPageLd('CollectionPage', '/help', HELP_HUB.title, HELP_HUB.description, {
          hasPart: HELP_TOPICS.map((t) => ({ '@type': 'WebPage', '@id': `${abs(`/help/${t.slug}`)}#webpage`, url: abs(`/help/${t.slug}`), name: t.title })),
        })}
      />
    </div>
  );
}
