'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import en from '@/i18n/dictionaries/en';
import { frNotFound } from '@/i18n/dictionaries/fr';
import { notFoundText as de } from '@/i18n/dictionaries/de';
import { notFoundText as es } from '@/i18n/dictionaries/es';
import { notFoundText as it } from '@/i18n/dictionaries/it';
import { notFoundText as nl } from '@/i18n/dictionaries/nl';
import { notFoundText as sv } from '@/i18n/dictionaries/sv';
import { notFoundText as nb } from '@/i18n/dictionaries/nb';

/** 404 texts only (not whole dictionaries) for the browser bundle. */
const TEXTS: Record<string, typeof en.notFound> = { en: en.notFound, fr: frNotFound, de, es, it, nl, sv, nb };

/** 404 inside a language version (notFound() in a page): text in that language, link to its home page. */
export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const lang = params?.locale && params.locale in TEXTS ? params.locale : 'en';
  const t = TEXTS[lang]!;
  return (
    <div className="wrap page-head" style={{ paddingBottom: 80, textAlign: 'center' }}>
      <div className="eyebrow">404</div>
      <h1 className="page-title">{t.title}</h1>
      <p className="muted">{t.text}</p>
      <Link className="btn" href={lang === 'en' ? '/' : `/${lang}`}>{t.home}</Link>
    </div>
  );
}
