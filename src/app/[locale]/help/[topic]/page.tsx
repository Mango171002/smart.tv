import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { HelpActions } from '@/components/HelpActions';
import { InfoContent } from '@/components/InfoContent';
import { JsonLd } from '@/components/JsonLd';
import { contentPagesEnabled } from '@/config/content-pages';
import { HELP_SLUGS } from '@/content/en/info';
import { getInfo, helpTopicFor } from '@/content/info';
import { LOCALES, isLocale } from '@/i18n/config';
import { abs, infoMetadata, webPageLd } from '@/lib/info-pages';
import { localizedPath } from '@/lib/routes';
import s from '@/components/info.module.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return contentPagesEnabled() ? LOCALES.flatMap((locale) => HELP_SLUGS.map((topic) => ({ locale, topic }))) : [];
}

type Params = Promise<{ locale: string; topic: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, topic } = await params;
  if (!contentPagesEnabled() || !isLocale(locale)) return {};
  const t = helpTopicFor(locale, topic);
  if (!t) return {};
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
  if (!contentPagesEnabled() || !isLocale(locale)) notFound();
  const t = helpTopicFor(locale, topic);
  if (!t) notFound();
  const { hub, topics, reviewed, ui } = getInfo(locale);
  const i = topics.indexOf(t);
  const prev = topics[i - 1];
  const next = topics[i + 1];
  const extra = t.slug === 'refunds' ? [ui.refundPolicy] : t.slug === 'ordering-payment' ? [ui.terms] : [];
  const cta = CTA[t.slug] ?? { trial: false, plans: false };
  const hubPath = localizedPath(locale, '/help');
  const path = localizedPath(locale, `/help/${t.slug}`);
  return (
    <div className="wrap page-head" style={{ paddingBottom: 60 }}>
      <Breadcrumbs label={ui.breadcrumb} items={[{ name: ui.home, path: localizedPath(locale) }, { name: hub.name, path: hubPath }, { name: t.name, path }]} />
      <div className="eyebrow">{hub.name}</div>
      <h1 className="page-title">{t.title}</h1>
      <p className="sub">{t.intro}</p>
      <InfoContent lang={locale} sections={t.sections} reviewed={reviewed} labels={ui.content} toc contactIntro={ui.topicContact} related={[...extra, { href: hubPath, label: ui.allTopics }]}>
        <HelpActions trial={cta.trial} plans={cta.plans} {...(locale === 'en' ? {} : { labels: ui.actions })} />
      </InfoContent>
      <nav className={s.pager} aria-label={ui.topics}>
        {prev && <Link href={localizedPath(locale, `/help/${prev.slug}`)}><small>{ui.prevTopic}</small>{prev.name}</Link>}
        {next && <Link className={s.next} href={localizedPath(locale, `/help/${next.slug}`)}><small>{ui.nextTopic}</small>{next.name}</Link>}
      </nav>
      <JsonLd data={webPageLd('WebPage', path, t.title, t.description, { isPartOf: { '@id': `${abs(hubPath)}#webpage` } }, locale)} />
    </div>
  );
}
