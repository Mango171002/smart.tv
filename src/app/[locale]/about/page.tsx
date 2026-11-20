import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { HelpActions } from '@/components/HelpActions';
import { InfoContent } from '@/components/InfoContent';
import { JsonLd } from '@/components/JsonLd';
import { contentPagesEnabled } from '@/config/content-pages';
import { siteConfig } from '@/config/site';
import { ABOUT, INFO_REVIEWED, OWNER_FACTS as F } from '@/content/en/info';
import { isLocale } from '@/i18n/config';
import { infoMetadata, ORG_REF, webPageLd } from '@/lib/info-pages';
import s from '@/components/info.module.css';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  if (!contentPagesEnabled() || !isLocale(locale)) return {};
  return infoMetadata(locale, '/about', ABOUT.metaTitle, ABOUT.description);
}

const FACTS: Array<{ k: string; v: string; small?: string; accent: string }> = [
  { k: 'Established', v: F.established, small: F.basedIn, accent: 'var(--color-lime)' },
  { k: 'Company', v: siteConfig.legalEntity ?? '', small: 'New Mexico, USA', accent: 'var(--color-cyan)' },
  { k: 'Support', v: F.supportHours, small: `Usually replies in ${F.usualReply}`, accent: 'var(--color-magenta)' },
  { k: 'Support languages', v: String(F.languages.length), small: F.languages.join(' · '), accent: 'var(--color-violet)' },
];

export default async function AboutPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!contentPagesEnabled() || !isLocale(locale)) notFound();
  return (
    <div className="wrap page-head" style={{ paddingBottom: 60 }}>
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: ABOUT.name, path: '/about' }]} />
      <header className={s.hero}>
        <div className="eyebrow">{ABOUT.name}</div>
        <h1 className="page-title">{ABOUT.title}</h1>
        <p className={s.lead}>{ABOUT.intro}</p>
        <dl className={s.facts}>
          {FACTS.map((f) => (
            <div key={f.k} className={s.fact} style={{ ['--accent' as string]: f.accent }}>
              <dt>{f.k}</dt>
              <dd>{f.v}{f.small && <small>{f.small}</small>}</dd>
            </div>
          ))}
        </dl>
      </header>
      <InfoContent sections={ABOUT.sections} reviewed={INFO_REVIEWED} toc contactIntro={`Questions about SYGMA TV+? Our team is available ${F.supportHours}.`}>
        <HelpActions />
      </InfoContent>
      <JsonLd data={webPageLd('AboutPage', '/about', ABOUT.title, ABOUT.description, { about: ORG_REF(), mainEntity: ORG_REF() })} />
    </div>
  );
}
