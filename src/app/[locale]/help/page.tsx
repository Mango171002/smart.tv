import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { HelpActions } from '@/components/HelpActions';
import { INFO_ICONS, InfoContent } from '@/components/InfoContent';
import { JsonLd } from '@/components/JsonLd';
import { contentPagesEnabled } from '@/config/content-pages';
import { HELP_HUB, HELP_TOPICS, INFO_REVIEWED, OWNER_FACTS as F } from '@/content/en/info';
import { isLocale } from '@/i18n/config';
import { abs, infoMetadata, webPageLd } from '@/lib/info-pages';
import s from '@/components/info.module.css';

type Params = Promise<{ locale: string }>;
const ACCENTS = ['var(--color-cyan)', 'var(--color-lime)', 'var(--color-magenta)', 'var(--color-violet)'];

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
      <header className={s.hero}>
        <div className="eyebrow">Support</div>
        <h1 className="page-title">{HELP_HUB.title}</h1>
        <p className={s.lead}>{HELP_HUB.intro}</p>
      </header>

      <section className={s.popular} aria-labelledby="popular-t">
        <h2 id="popular-t">Popular questions</h2>
        <ul>
          {HELP_HUB.popular.map((p) => (
            <li key={p.href}><Link href={p.href}><ArrowRight size={16} strokeWidth={2} aria-hidden="true" />{p.q}</Link></li>
          ))}
        </ul>
      </section>

      <ul className={s.topicGrid} aria-label="Help topics">
        {HELP_TOPICS.map((t, i) => {
          const Icon = INFO_ICONS[t.icon];
          return (
            <li key={t.slug}>
              <Link className={s.card} href={`/help/${t.slug}`} style={{ ['--accent' as string]: ACCENTS[i % ACCENTS.length] }}>
                <span className="icon-box sm" aria-hidden="true"><Icon className={s.accent} size={18} strokeWidth={1.75} /></span>
                <span><strong>{t.name}</strong><span className="text">{t.summary}</span></span>
              </Link>
            </li>
          );
        })}
      </ul>

      <dl className={s.facts} aria-label="Support at a glance">
        {[
          { k: 'Availability', v: F.supportHours, small: 'Email and WhatsApp', accent: 'var(--color-lime)' },
          { k: 'Usual reply time', v: `Under an hour`, small: 'Usual time, not a guarantee', accent: 'var(--color-cyan)' },
          { k: 'Languages', v: String(F.languages.length), small: F.languages.join(' · '), accent: 'var(--color-magenta)' },
          { k: 'Activation', v: 'Usually < 1 hour', small: 'After payment is confirmed', accent: 'var(--color-violet)' },
        ].map((f) => (
          <div key={f.k} className={s.fact} style={{ ['--accent' as string]: f.accent }}>
            <dt>{f.k}</dt>
            <dd>{f.v}<small>{f.small}</small></dd>
          </div>
        ))}
      </dl>

      <InfoContent sections={[]} reviewed={INFO_REVIEWED} contactIntro="Can’t find your answer? Write to us — tell us your device and, if you have one, your order reference." related={[{ href: '/about', label: 'About us' }, { href: '/#faq', label: 'FAQ' }, { href: '/legal/refunds', label: 'Refunds & cancellations' }, { href: '/legal/terms', label: 'Terms of Service' }]}>
        <HelpActions />
      </InfoContent>
      <JsonLd
        data={webPageLd('CollectionPage', '/help', HELP_HUB.title, HELP_HUB.description, {
          hasPart: HELP_TOPICS.map((t) => ({ '@type': 'WebPage', '@id': `${abs(`/help/${t.slug}`)}#webpage`, url: abs(`/help/${t.slug}`), name: t.title })),
        })}
      />
    </div>
  );
}
