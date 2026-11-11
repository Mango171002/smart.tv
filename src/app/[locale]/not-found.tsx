'use client';

import Link from 'next/link';
import en from '@/i18n/dictionaries/en';

export default function NotFound() {
  const locale = 'en';
  const t = en.notFound;
  return (
    <div className="wrap page-head" style={{ paddingBottom: 80, textAlign: 'center' }}>
      <div className="eyebrow">404</div>
      <h1 className="page-title">{t.title}</h1>
      <p className="muted">{t.text}</p>
      <Link className="btn" href={`/${locale}`}>{t.home}</Link>
    </div>
  );
}
