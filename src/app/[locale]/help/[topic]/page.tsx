import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { HelpActions } from '@/components/HelpActions';
import { InfoContent } from '@/components/InfoContent';
import { JsonLd } from '@/components/JsonLd';
import { contentPagesEnabled } from '@/config/content-pages';
import { HELP_HUB, HELP_SLUGS, HELP_TOPICS, INFO_REVIEWED, OWNER_FACTS as F, helpTopic } from '@/content/en/info';
import { LOCALES, isLocale } from '@/i18n/config';
import { abs, infoMetadata, webPageLd } from '@/lib/info-pages';
import s from '@/components/info.module.css';

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

/** Calls to action that fit each topic. */
const CTA: Record<string, { trial: boolean; plans: boolean }> = {
  'getting-started': { trial: true, plans: true },
  devices: { trial: true, plans: false },
  'free-trial': { trial: true, plans: false },
  'ordering-payment': { trial: false, plans: true },
  troubleshooting: { trial: false, plans: false },
  'contact-support': { trial: false, plans: false },
  refunds: { trial: false, plans: false },
};

export default async function HelpTopicPage({ params }: { params: Params }) {
  const { locale, topic } = await params;
  const t = helpTopic(topic);
  if (!contentPagesEnabled() || !isLocale(locale) || !t) notFound();
  const i = HELP_TOPICS.indexOf(t);
  const prev = HELP_TOPICS[i - 1];
  const next = HELP_TOPICS[i + 1];
  const extra = t.slug === 'refunds' ? [{ href: '/legal/refunds', label: 'Full refund policy' }] : t.slug === 'ordering-payment' ? [{ href: '/legal/terms', label: 'Terms of Service' }] : [];
  const cta = CTA[t.slug] ?? { trial: false, plans: false };
  return (
    <div className="wrap page-head" style={{ paddingBottom: 60 }}>
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: HELP_HUB.name, path: '/help' }, { name: t.name, path: `/help/${t.slug}` }]} />
      <div className="eyebrow">{HELP_HUB.name}</div>
      <h1 className="page-title">{t.title}</h1>
      <p className="sub">{t.intro}</p>
      <InfoContent sections={t.sections} reviewed={INFO_REVIEWED} toc contactIntro={`Still need help? Our team answers by email and on WhatsApp, ${F.supportHours}.`} related={[...extra, { href: '/help', label: 'All help topics' }]}>
        <HelpActions trial={cta.trial} plans={cta.plans} />
      </InfoContent>
      <nav className={s.pager} aria-label="Help topics">
        {prev && <Link href={`/help/${prev.slug}`}><small>Previous topic</small>{prev.name}</Link>}
        {next && <Link className={s.next} href={`/help/${next.slug}`}><small>Next topic</small>{next.name}</Link>}
      </nav>
      <JsonLd data={webPageLd('WebPage', `/help/${t.slug}`, t.title, t.description, { isPartOf: { '@id': `${abs('/help')}#webpage` } })} />
    </div>
  );
}
