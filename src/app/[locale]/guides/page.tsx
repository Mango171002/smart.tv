import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { GuideIcon } from '@/components/GuideIcon';
import { guidesFor } from '@/content/intl';
import { LOCALES, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { href } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo';

export const dynamicParams = false;

/** One guides section per language, on the language's main version (French: /fr-fr/guides). */
export function generateStaticParams() {
  return LOCALES.filter((locale) => guidesFor(locale)).map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const g = isLocale(locale) ? guidesFor(locale) : null;
  if (!g) return {};
  return buildMetadata({ locale: locale as never, path: '/guides', title: g.intro.metaTitle, description: g.intro.description, existsIn: (id) => Boolean(guidesFor(id as never)) });
}

export default async function GuidesIndex({ params }: { params: Params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const g = guidesFor(locale);
  if (!g) notFound();
  const t = getDictionary(locale).intl;
  const s = g.intro.shared;
  return (
    <div className="wrap page-head guides-page" style={{ paddingBottom: 60 }}>
      <Breadcrumbs label={t.breadcrumbHome} items={[{ name: t.breadcrumbHome, href: href(locale) }, { name: g.intro.title, href: href(locale, '/guides') }]} />
      <div className="eyebrow">{t.navGuides}</div>
      <h1 className="page-title">{g.intro.title}</h1>
      <p className="sub">{g.intro.lead}</p>
      <ul className="guide-grid">
        {g.guides.map((guide) => (
          <li key={guide.slug}>
            <Link className="guide-card" href={href(locale, `/guides/${guide.slug}`)}>
              <span className="icon-box" aria-hidden="true"><GuideIcon name={guide.icon} /></span>
              <span className="guide-card-text">
                <b>{guide.device}</b>
                <small>{guide.description}</small>
                <span className="guide-card-cta">{s.read} →</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <section className="terms-section guide-note" aria-labelledby="access-t">
        <h2 id="access-t">{s.accessTitle}</h2>
        <p>{s.access}</p>
      </section>
    </div>
  );
}
