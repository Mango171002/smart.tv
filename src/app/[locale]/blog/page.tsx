import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { getDictionary } from '@/i18n/dictionaries';
import { buildMetadata, resolveLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const b = getDictionary(locale).blog;
  return buildMetadata({ locale, path: '/blog', title: b.metaTitle, description: b.metaDescription });
}

/** Blog index. No articles yet: nothing is invented, the page says so. */
export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const b = getDictionary(locale).blog;
  return (
    <div className="wrap page-head blog-page">
      <div className="eyebrow">{b.eyebrow}</div>
      <h1 className="page-title">{b.title}</h1>
      <p className="sub">{b.sub}</p>
      <div className="card blog-empty">
        <BookOpen size={32} strokeWidth={1.75} aria-hidden="true" />
        <p>{b.empty}</p>
        <Link className="btn btn-lime" href={`/${locale}`}>{b.back}</Link>
      </div>
    </div>
  );
}
