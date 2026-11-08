'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LOCALES, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { Brand } from './Brand';

export function Header({ locale, nav }: { locale: Locale; nav: Dictionary['nav'] }) {
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const rest = pathname.replace(/^\/(en|fr)(?=\/|$)/, '');
  const links = [
    { href: `/${locale}/plans`, label: nav.plans },
    { href: `/${locale}/coverage`, label: nav.content },
    { href: `/${locale}/devices`, label: nav.devices },
    { href: `/${locale}#how`, label: nav.how },
    { href: `/${locale}/help`, label: nav.help },
  ];

  return (
    <header className="header">
      <div className="wrap nav">
        <Link href={`/${locale}`} title={nav.home}>
          <Brand />
        </Link>
        <nav id="navlinks" className={`links${open ? ' open' : ''}`} aria-label={nav.label}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="lang" role="group" aria-label={nav.language}>
          {LOCALES.map((l) => (
            <Link key={l} href={`/${l}${rest}`} hrefLang={l} lang={l} aria-current={l === locale ? 'true' : undefined}>
              {l.toUpperCase()}
            </Link>
          ))}
        </div>
        <button
          type="button"
          className="mobile-menu"
          aria-label={nav.toggleMenu}
          aria-expanded={open}
          aria-controls="navlinks"
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>
      </div>
    </header>
  );
}
