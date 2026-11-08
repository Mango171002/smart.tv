'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import en from '@/i18n/dictionaries/en';
import fr from '@/i18n/dictionaries/fr';

export default function NotFound() {
  const pathname = usePathname() ?? '';
  const locale = pathname.startsWith('/fr') ? 'fr' : 'en';
  const t = (locale === 'fr' ? fr : en).notFound;
  return (
    <div className="wrap page-head" style={{ paddingBottom: 80, textAlign: 'center' }}>
      <div className="eyebrow">404</div>
      <h1 className="page-title">{t.title}</h1>
      <p className="muted">{t.text}</p>
      <Link className="btn" href={`/${locale}`}>{t.home}</Link>
    </div>
  );
}
