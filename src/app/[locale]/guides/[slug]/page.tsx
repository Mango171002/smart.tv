import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { GuideIcon } from '@/components/GuideIcon';
import { RequestButton } from '@/components/RequestButton';
import { siteConfig } from '@/config/site';
import { guidesFor } from '@/content/intl';
import { LOCALES, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { href } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => (guidesFor(locale)?.guides ?? []).map((g) => ({ locale, slug: g.slug })));
}

type Params = Promise<{ locale: string; slug: string }>;

function find(locale: string, slug: string) {
  if (!isLocale(locale)) return null;
  const g = guidesFor(locale);
  const guide = g?.guides.find((x) => x.slug === slug);
  return g && guide ? { g, guide, locale } : null;
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const f = find(locale, slug);
  if (!f) return {};
  // The guide titles already contain the brand: no « | SYGMA TV+ » suffix.
  return buildMetadata({ locale: f.locale, path: `/guides/${slug}`, title: f.guide.metaTitle, description: f.guide.description, absoluteTitle: true });
}

export default async function GuidePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const f = find(locale, slug);
  if (!f) notFound();
  const { g, guide } = f;
  const t = getDictionary(f.locale).intl;
  const s = g.intro.shared;
  const others = g.guides.filter((x) => x.slug !== guide.slug);
  return (
    <div className="wrap page-head guide-page" style={{ paddingBottom: 60 }}>
      <Breadcrumbs
        label={t.breadcrumbHome}
        items={[
          { name: t.breadcrumbHome, href: href(f.locale) },
          { name: g.intro.title, href: href(f.locale, '/guides') },
          { name: guide.device, href: href(f.locale, `/guides/${guide.slug}`) },
        ]}
      />
      <div className="eyebrow"><GuideIcon name={guide.icon} size={15} /> {guide.device}</div>
      <h1 className="page-title">{guide.title}</h1>
      <p className="sub">{guide.intro}</p>

      <div className="guide-layout">
        <div className="terms-body">
          <section className="terms-section cat-live" aria-labelledby="before-t">
            <h2 id="before-t">{s.beforeTitle}</h2>
            <ul>{guide.before.map((b) => <li key={b}>{b}</li>)}</ul>
          </section>
          <section className="terms-section cat-sports" aria-labelledby="access-t">
            <h2 id="access-t">{s.accessTitle}</h2>
            <p>{s.access}</p>
          </section>
          <section className="terms-section cat-movies" aria-labelledby="steps-t">
            <h2 id="steps-t">{s.stepsTitle}</h2>
            <ol className="guide-steps">
              {guide.steps.map((st, i) => (
                <li key={st.title}>
                  <span className="guide-step-num" aria-hidden="true">{i + 1}</span>
                  <span><b>{st.title}</b> {st.text}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="terms-section cat-streaming" aria-labelledby="trouble-t">
            <h2 id="trouble-t">{s.troubleTitle}</h2>
            {guide.troubleshooting.map((q) => (
              <div key={q.q} className="guide-trouble">
                <h3>{q.q}</h3>
                <p>{q.a}</p>
              </div>
            ))}
          </section>
          <section className="terms-contact" aria-labelledby="help-t">
            <h2 id="help-t">{s.helpTitle}</h2>
            <p>{s.help}</p>
            <ul>
              {siteConfig.supportEmail && <li><a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a></li>}
              {siteConfig.supportWhatsApp && <li><a href={`https://wa.me/${siteConfig.supportWhatsApp}`} rel="noopener noreferrer" target="_blank">WhatsApp {siteConfig.supportPhone}</a></li>}
            </ul>
            <p><RequestButton mode="trial" className="btn btn-lime">{s.trialCta}</RequestButton></p>
          </section>
        </div>
        <nav className="guide-others" aria-label={s.otherGuides}>
          <b>{s.otherGuides}</b>
          <ul>
            {others.map((o) => (
              <li key={o.slug}><Link href={href(f.locale, `/guides/${o.slug}`)}><GuideIcon name={o.icon} size={18} /> {o.device}</Link></li>
            ))}
          </ul>
          <Link className="guide-all" href={href(f.locale, '/guides')}>{s.allGuides} →</Link>
        </nav>
      </div>
    </div>
  );
}
