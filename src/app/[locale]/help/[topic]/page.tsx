import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InfoContent } from '@/components/InfoContent';
import { JsonLd } from '@/components/JsonLd';
import { contentPagesEnabled } from '@/config/content-pages';
import { HELP_HUB, HELP_SLUGS, HELP_TOPICS, INFO_REVIEWED, helpTopic } from '@/content/en/info';
import { LOCALES, isLocale } from '@/i18n/config';
import { abs, infoMetadata, webPageLd } from '@/lib/info-pages';

export const dynamicParams = false;

export function generateStaticParams() {
  return contentPagesEnabled() ? LOCALES.flatMap((locale) => HELP_SLUGS.map((topic) => ({ locale, topic }))) : [];
}

type Params = Promise<{ locale: string; topic: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, topic } = await params;
  const t = helpTopic(topic);
  if (!contentPagesEnabled() || !isLocale(locale) || !t) return {};
  return infoMetadata(locale, `/help/${t.slug}`, t.metaTitle, t.description);
}

export default async function HelpTopicPage({ params }: { params: Params }) {
  const { locale, topic } = await params;
  const t = helpTopic(topic);
  if (!contentPagesEnabled() || !isLocale(locale) || !t) notFound();
  const others = HELP_TOPICS.filter((x) => x.slug !== t.slug).map((x) => ({ href: `/help/${x.slug}`, label: x.name }));
  const extra = t.slug === 'refunds' ? [{ href: '/legal/refunds', label: 'Full refund policy' }] : t.slug === 'ordering-payment' ? [{ href: '/#plans', label: 'See the plans' }] : [];
  return (
    <div className="wrap page-head" style={{ paddingBottom: 60 }}>
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: HELP_HUB.name, path: '/help' }, { name: t.name, path: `/help/${t.slug}` }]} />
      <div className="eyebrow">{HELP_HUB.name}</div>
      <h1 className="page-title">{t.title}</h1>
      <p className="sub">{t.intro}</p>
      <InfoContent sections={t.sections} reviewed={INFO_REVIEWED} contactIntro="Still need help? Our team answers by email and on WhatsApp." related={[...extra, { href: '/help', label: 'All help topics' }, ...others]} />
      <JsonLd data={webPageLd('WebPage', `/help/${t.slug}`, t.title, t.description, { isPartOf: { '@id': `${abs('/help')}#webpage` } })} />
    </div>
  );
}
