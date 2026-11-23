import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/i18n/dictionaries';
import { DEFAULT_LOCALE, LOCALES, isLocale } from '@/i18n/config';
import LanguageNotFoundContent from '../not-found';

/**
 * 404 page of a built language other than English (phase 7C). Unknown URLs under its prefix (/fr/anything) are
 * rewritten here as a last resort (next.config.ts, `fallback` rewrites): HTTP 404, text of that language inside its
 * layout. English is not concerned: unknown English URLs keep the global 404 page.
 *
 * Server-rendered 404 (phase 13): the page renders the language 404 content itself and calls notFound() only inside
 * a Suspense boundary. Next.js 16 then keeps the prerendered document (<html lang>, header, localized H1, title and
 * noindex — readable without JavaScript) and still answers HTTP 404. Calling notFound() at the top of the page
 * instead made the server HTML an empty error shell (no <html lang>, home title), completed only in the browser.
 * In the browser the same boundary throws again and ./not-found.tsx renders the identical content.
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

/** Sets the HTTP status (404) without discarding the server-rendered content around it. */
async function NotFoundStatus(): Promise<null> {
  notFound();
}

export default async function LanguageNotFound({ params }: { params: Params }) {
  await params;
  return (
    <>
      <LanguageNotFoundContent />
      <Suspense fallback={null}>
        <NotFoundStatus />
      </Suspense>
    </>
  );
}
