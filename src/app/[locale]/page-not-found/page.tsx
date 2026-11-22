import { notFound } from 'next/navigation';
import { getDictionary } from '@/i18n/dictionaries';
import { DEFAULT_LOCALE, LOCALES, isLocale } from '@/i18n/config';

/**
 * 404 page of a built language other than English (phase 7C). Unknown URLs under its prefix (/fr/anything) are
 * rewritten here as a last resort (next.config.ts, `fallback` rewrites): HTTP 404, French text inside the French
 * layout (./not-found.tsx). English is not concerned: unknown English URLs keep the global 404 page.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).notFound;
  return { title: t.metaTitle, description: t.text, robots: { index: false, follow: false } };
}

export default async function LanguageNotFound({ params }: { params: Params }) {
  await params;
  notFound();
}
