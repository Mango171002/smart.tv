import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { LOCALES, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { LEGAL_DOCS, type LegalDoc } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => LEGAL_DOCS.map((doc) => ({ locale, doc })));
}

type Params = Promise<{ locale: string; doc: string }>;

const isDoc = (d: string): d is LegalDoc => (LEGAL_DOCS as readonly string[]).includes(d);

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, doc } = await params;
  if (!isLocale(locale) || !isDoc(doc)) return {};
  const dict = getDictionary(locale);
  const d = dict.legal.docs[doc];
  return buildMetadata({ locale, path: `/legal/${doc}`, title: d.title, description: d.intro });
}

export default async function LegalPage({ params }: { params: Params }) {
  const { locale, doc } = await params;
  if (!isLocale(locale) || !isDoc(doc)) notFound();
  const dict = getDictionary(locale);
  const d = dict.legal.docs[doc];
  const facts: Array<[string, string | null]> = [
    [dict.legal.facts.entity, siteConfig.legalEntity],
    [dict.legal.facts.address, siteConfig.legalAddress],
    [dict.legal.facts.support, siteConfig.supportEmail],
  ];
  return (
    <div className="wrap page-head" style={{ paddingBottom: 60 }}>
      <div className="eyebrow">{dict.legal.eyebrow}</div>
      <h1 className="page-title">{d.title}</h1>
      <p className="legal-banner" role="note">{dict.legal.draftBanner}</p>
      <nav className="legal-nav" aria-label={dict.footer.legalTitle}>
        {LEGAL_DOCS.map((x) => (
          <Link key={x} href={`/${locale}/legal/${x}`} aria-current={x === doc ? 'page' : undefined}>
            {dict.legal.docs[x].title}
          </Link>
        ))}
      </nav>
      <p className="sub">{d.intro}</p>
      <div className="card panel-pad" style={{ marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>{dict.legal.pendingItems}</h2>
        <ul className="list-check">
          {d.items.map((i) => <li key={i}>{i}</li>)}
        </ul>
        {doc === 'imprint' && (
          <dl style={{ marginTop: 18 }}>
            {facts.map(([k, v]) => (
              <div key={k} className="orderline"><dt>{k}</dt><dd style={{ margin: 0 }}>{v ?? dict.common.pending}</dd></div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
