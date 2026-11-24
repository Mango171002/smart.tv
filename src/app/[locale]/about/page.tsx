import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { HelpActions } from '@/components/HelpActions';
import { InfoContent } from '@/components/InfoContent';
import { JsonLd } from '@/components/JsonLd';
import { PrelaunchBanner } from '@/components/PrelaunchBanner';
import { contentPagesEnabled } from '@/config/content-pages';
import { infoFor } from '@/content/info';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { isContactFormEnabled } from '@/lib/features';
import { infoMetadata, ORG_REF, webPageLd } from '@/lib/info-pages';
import { localizedPath } from '@/lib/routes';
import s from '@/components/info.module.css';

type Params = Promise<{ locale: string }>;
const ACCENTS = ['var(--color-lime)', 'var(--color-cyan)', 'var(--color-magenta)', 'var(--color-violet)'];

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  if (!contentPagesEnabled() || !isLocale(locale)) return {};
  const { about } = infoFor(locale, isContactFormEnabled());
  return infoMetadata(locale, '/about', about.metaTitle, about.description);
}

export default async function AboutPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!contentPagesEnabled() || !isLocale(locale)) notFound();
  const ordersOpen = isContactFormEnabled();
  const { about, reviewed, ui } = infoFor(locale, ordersOpen);
  const prelaunch = getDictionary(locale).prelaunch;
  const path = localizedPath(locale, '/about');
  return (
    <div className="wrap page-head" style={{ paddingBottom: 60 }}>
      <Breadcrumbs label={ui.breadcrumb} items={[{ name: ui.home, path: localizedPath(locale) }, { name: about.name, path }]} />
      {!ordersOpen && <PrelaunchBanner title={prelaunch.pagesTitle} text={prelaunch.pagesText} plans={{ label: ui.actions.plans, href: ui.actions.plansHref }} />}
      <header className={s.hero}>
        <div className="eyebrow">{about.name}</div>
        <h1 className="page-title">{about.title}</h1>
        <p className={s.lead}>{about.intro}</p>
        <dl className={s.facts}>
          {ui.aboutFacts.map((f, i) => (
            <div key={f.k} className={s.fact} style={{ ['--accent' as string]: ACCENTS[i % ACCENTS.length] }}>
              <dt>{f.k}</dt>
              <dd>{f.v}{f.small && <small>{f.small}</small>}</dd>
            </div>
          ))}
        </dl>
      </header>
      <InfoContent lang={locale} phone={ordersOpen} sections={about.sections} reviewed={reviewed} labels={ui.content} toc contactIntro={ui.aboutContact}>
        <HelpActions labels={ui.actions} />
      </InfoContent>
      <JsonLd data={webPageLd('AboutPage', path, about.title, about.description, { about: ORG_REF(), mainEntity: ORG_REF() }, locale)} />
    </div>
  );
}
