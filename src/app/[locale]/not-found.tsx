'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import en from '@/i18n/dictionaries/en';
import { frNotFound } from '@/i18n/dictionaries/fr';

/** 404 inside a language version (notFound() in a page): text in that language, link to its home page. */
export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const fr = params?.locale === 'fr';
  const t = fr ? frNotFound : en.notFound;
  return (
    <div className="wrap page-head" style={{ paddingBottom: 80, textAlign: 'center' }}>
      <div className="eyebrow">404</div>
      <h1 className="page-title">{t.title}</h1>
      <p className="muted">{t.text}</p>
      <Link className="btn" href={fr ? '/fr' : '/'}>{t.home}</Link>
    </div>
  );
}
