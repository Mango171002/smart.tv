'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localeOfPath, NOT_FOUND_TEXTS } from '@/i18n/not-found';

export default function NotFound() {
  // Language of the version the visitor was in (« /fr-fr/… » → French); English otherwise.
  const version = localeOfPath(usePathname() ?? '/');
  const t = NOT_FOUND_TEXTS[version.language as keyof typeof NOT_FOUND_TEXTS] ?? NOT_FOUND_TEXTS.en;
  return (
    <div className="wrap page-head" style={{ paddingBottom: 80, textAlign: 'center' }}>
      <div className="eyebrow">404</div>
      <h1 className="page-title">{t.title}</h1>
      <p className="muted">{t.text}</p>
      <Link className="btn" href={version.prefix || '/'}>{t.home}</Link>
    </div>
  );
}
