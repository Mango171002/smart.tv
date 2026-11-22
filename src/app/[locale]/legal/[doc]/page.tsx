import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LegalContent } from '@/components/LegalContent';
import { imprintComplete } from '@/content/legal';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { LEGAL_DOCS, type LegalDoc } from '@/lib/routes';
import { buildMetadata } from '@/lib/seo';

export const dynamicParams = false;

/**
 * Legal documents exist in English only (validated texts; no translated legal page is published).
 * Other languages link to these English pages; /fr/legal/* redirects to them (next.config.ts).
 */
export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ locale: DEFAULT_LOCALE, doc }));
}

type Params = Promise<{ locale: string; doc: string }>;

const isDoc = (d: string): d is LegalDoc => (LEGAL_DOCS as readonly string[]).includes(d);

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, doc } = await params;
  if (!isLocale(locale) || locale !== DEFAULT_LOCALE || !isDoc(doc)) return {};
  const dict = getDictionary(locale);
  const d = dict.legal.docs[doc];
  return buildMetadata({ locale, path: `/legal/${doc}`, title: d.title, description: d.metaDescription });
}

export default async function LegalPage({ params }: { params: Params }) {
  const { locale, doc } = await params;
  if (!isLocale(locale) || locale !== DEFAULT_LOCALE || !isDoc(doc)) notFound();
  const dict = getDictionary(locale);
  const d = dict.legal.docs[doc];
  return (
    <div className="wrap page-head" style={{ paddingBottom: 60 }}>
      <div className="eyebrow">{dict.legal.eyebrow}</div>
      <h1 className="page-title">{d.title}</h1>
      {doc === 'imprint' && !imprintComplete() && <p className="legal-banner" role="note">{dict.legal.draftBanner}</p>}
      <nav className="legal-nav" aria-label={dict.footer.legalTitle}>
        {LEGAL_DOCS.map((x) => (
          <Link key={x} href={`/legal/${x}`} aria-current={x === doc ? 'page' : undefined}>
            {dict.legal.docs[x].title}
          </Link>
        ))}
      </nav>
      <p className="sub">{d.intro}</p>
      <LegalContent doc={doc} pending={dict.legal.toBePublished} />
    </div>
  );
}
