'use client';

import { ArrowLeft } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Return link on the English legal pages (D-4, phase 15). Legal documents exist in English only: a visitor who comes
 * from another language gets a small « ← Back to the <language> site » link, in that language, above the title.
 * No link when the visitor comes from English or from outside the site.
 *
 * Referring language, first match wins:
 * 1. `?from=<code>` on the link (footer legal links of the translated pages);
 * 2. the last non-legal page seen in this tab, kept in memory only (client-side navigation, e.g. the cookie-banner link);
 * 3. `document.referrer` when it is a page of this site (full page load).
 * Nothing is stored (no cookie, no storage). The link is rendered client-side only: the static HTML and the canonical
 * URL of the legal page are the same whatever `from` says, so no indexable duplicate is created.
 */
let lastPage: { locale: string; path: string } | null = null;

const isLegal = (path: string) => /^(\/[a-z]{2})?\/legal(\/|$)/.test(path);

/** Mounted once in the layout: remembers the language (and page) of the last non-legal page viewed in this tab. */
export function LegalReturnMemory({ locale }: { locale: string }) {
  const pathname = usePathname() ?? '/';
  useEffect(() => {
    if (isLegal(pathname)) return;
    // English pages may be reported as /en/… (internal route): public path without it.
    lastPage = { locale, path: pathname.replace(/^\/en(?=\/|$)/, '') || '/' };
  }, [locale, pathname]);
  return null;
}

export interface LegalReturnTarget {
  label: string;
  /** Home page of that language (public path, e.g. /fr). */
  home: string;
  /** Public prefix, e.g. /fr. */
  prefix: string;
  htmlLang: string;
}

function fromReferrer(targets: Record<string, LegalReturnTarget>): { code: string; path: string } | null {
  try {
    if (!document.referrer) return null;
    const url = new URL(document.referrer);
    if (url.origin !== window.location.origin || isLegal(url.pathname)) return null;
    const code = Object.keys(targets).find((c) => url.pathname === targets[c]!.prefix || url.pathname.startsWith(`${targets[c]!.prefix}/`));
    // A page of this site in no other language: English, no link.
    return code ? { code, path: url.pathname } : { code: 'en', path: url.pathname };
  } catch {
    return null;
  }
}

/** The link itself (legal page). `targets`: the languages of this build other than English (none in production today). */
export function LegalReturn({ targets }: { targets: Record<string, LegalReturnTarget> }) {
  const params = useSearchParams();
  const [back, setBack] = useState<{ code: string; href: string } | null>(null);
  const from = params?.get('from') ?? null;

  useEffect(() => {
    const pick = (code: string, path?: string) => {
      const t = targets[code];
      if (!t) return null;
      const keep = path && (path === t.prefix || path.startsWith(`${t.prefix}/`)) ? path : t.home;
      return { code, href: keep };
    };
    let next: { code: string; href: string } | null = null;
    if (from) next = pick(from);
    else if (lastPage) next = pick(lastPage.locale, lastPage.path);
    else {
      const r = fromReferrer(targets);
      next = r ? pick(r.code, r.path) : null;
    }
    // Client-only state derived from the URL, the tab's history and the referrer (unknown during the static render).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBack(next);
  }, [from, targets]);

  if (!back) return null;
  const t = targets[back.code]!;
  return (
    <p className="legal-return" data-testid="legal-return">
      <a href={back.href} hrefLang={t.htmlLang} lang={t.htmlLang}>
        <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" />
        <span>{t.label}</span>
      </a>
    </p>
  );
}
