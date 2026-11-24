import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { HelpActions } from '@/components/HelpActions';
import { INFO_ICONS, InfoContent } from '@/components/InfoContent';
import { PrelaunchBanner } from '@/components/PrelaunchBanner';
import { JsonLd } from '@/components/JsonLd';
import { contentPagesEnabled } from '@/config/content-pages';
import { infoFor } from '@/content/info';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { isContactFormEnabled } from '@/lib/features';
import { abs, infoMetadata, webPageLd } from '@/lib/info-pages';
import { localizedPath } from '@/lib/routes';
import s from '@/components/info.module.css';

type Params = Promise<{ locale: string }>;
const ACCENTS = ['var(--color-cyan)', 'var(--color-lime)', 'var(--color-magenta)', 'var(--color-violet)'];
const FACT_ACCENTS = ['var(--color-lime)', 'var(--color-cyan)', 'var(--color-magenta)', 'var(--color-violet)'];

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  if (!contentPagesEnabled() || !isLocale(locale)) return {};
  const { hub } = infoFor(locale, isContactFormEnabled());
  return infoMetadata(locale, '/help', hub.metaTitle, hub.description);
}

export default async function HelpCenter({ params }: { params: Params }) {
  const { locale } = await params;
  if (!contentPagesEnabled() || !isLocale(locale)) notFound();
  const ordersOpen = isContactFormEnabled();
  const { hub, topics, reviewed, ui } = infoFor(locale, ordersOpen);
  const prelaunch = getDictionary(locale).prelaunch;
  const path = localizedPath(locale, '/help');
  return (
    <div className="wrap page-head" style={{ paddingBottom: 60 }}>
      <Breadcrumbs label={ui.breadcrumb} items={[{ name: ui.home, path: localizedPath(locale) }, { name: hub.name, path }]} />
      {!ordersOpen && <PrelaunchBanner title={prelaunch.pagesTitle} text={prelaunch.pagesText} plans={{ label: ui.actions.plans, href: ui.actions.plansHref }} />}
      <header className={s.hero}>
        <div className="eyebrow">{ui.support}</div>
        <h1 className="page-title">{hub.title}</h1>
        <p className={s.lead}>{hub.intro}</p>
      </header>

      <section className={s.popular} aria-labelledby="popular-t">
        <h2 id="popular-t">{ui.popular}</h2>
        <ul>
          {hub.popular.map((p) => (
            <li key={p.href}><Link href={p.href}><ArrowRight size={16} strokeWidth={2} aria-hidden="true" />{p.q}</Link></li>
          ))}
        </ul>
      </section>

      <ul className={s.topicGrid} aria-label={ui.topics}>
        {topics.map((t, i) => {
          const Icon = INFO_ICONS[t.icon];
          return (
            <li key={t.slug}>
              <Link className={s.card} href={localizedPath(locale, `/help/${t.slug}`)} style={{ ['--accent' as string]: ACCENTS[i % ACCENTS.length] }}>
                <span className="icon-box sm" aria-hidden="true"><Icon className={s.accent} size={18} strokeWidth={1.75} /></span>
                <span><strong>{t.name}</strong><span className="text">{t.summary}</span></span>
              </Link>
            </li>
          );
        })}
      </ul>

      <dl className={s.facts} aria-label={ui.glance}>
        {ui.helpFacts.map((f, i) => (
          <div key={f.k} className={s.fact} style={{ ['--accent' as string]: FACT_ACCENTS[i % FACT_ACCENTS.length] }}>
            <dt>{f.k}</dt>
            <dd>{f.v}<small>{f.small}</small></dd>
          </div>
        ))}
      </dl>

      <InfoContent lang={locale} phone={ordersOpen} sections={[]} reviewed={reviewed} labels={ui.content} contactIntro={ui.hubContact} related={ui.hubRelated}>
        <HelpActions labels={ui.actions} />
      </InfoContent>
      <JsonLd
        data={webPageLd('CollectionPage', path, hub.title, hub.description, {
          hasPart: topics.map((t) => {
            const url = abs(localizedPath(locale, `/help/${t.slug}`));
            return { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: t.title };
          }),
        }, locale)}
      />
    </div>
  );
}
