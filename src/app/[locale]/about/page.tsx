import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InfoContent } from '@/components/InfoContent';
import { JsonLd } from '@/components/JsonLd';
import { contentPagesEnabled } from '@/config/content-pages';
import { ABOUT, INFO_REVIEWED } from '@/content/en/info';
import { isLocale } from '@/i18n/config';
import { infoMetadata, ORG_REF, webPageLd } from '@/lib/info-pages';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  if (!contentPagesEnabled() || !isLocale(locale)) return {};
  return infoMetadata(locale, '/about', ABOUT.metaTitle, ABOUT.description);
}

export default async function AboutPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!contentPagesEnabled() || !isLocale(locale)) notFound();
  return (
    <div className="wrap page-head" style={{ paddingBottom: 60 }}>
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: ABOUT.name, path: '/about' }]} />
      <div className="eyebrow">{ABOUT.name}</div>
      <h1 className="page-title">{ABOUT.title}</h1>
      <p className="sub">{ABOUT.intro}</p>
      <InfoContent
        sections={ABOUT.sections}
        reviewed={INFO_REVIEWED}
        contactIntro="Questions about SYGMA TV+? Our team is here to help."
        related={[{ href: '/help', label: 'Help center' }, { href: '/#plans', label: 'Plans' }, { href: '/legal/imprint', label: 'Legal notice' }, { href: '/legal/terms', label: 'Terms of Service' }]}
      />
      <JsonLd data={webPageLd('AboutPage', '/about', ABOUT.title, ABOUT.description, { about: ORG_REF(), mainEntity: ORG_REF() })} />
    </div>
  );
}
