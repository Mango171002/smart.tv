'use client';

import { Menu } from 'lucide-react';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { Brand } from './Brand';

export function Header({ locale, nav }: { locale: Locale; nav: Dictionary['nav'] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // One-page site: the menu scrolls to sections of the home page.
  const links = [
    { href: `/${locale}#plans`, label: nav.plans },
    { href: `/${locale}#how`, label: nav.how },
    { href: `/${locale}#faq`, label: nav.help },
  ];

  return (
    <header className="header">
      <div className="wrap nav">
        <Link href={`/${locale}`} title={nav.home}>
          <Brand />
        </Link>
        <nav id="navlinks" className={`links${open ? ' open' : ''}`} aria-label={nav.label}>
          {/* Plain anchors: native in-page scrolling + hashchange (used by the trial form pre-fill) */}
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <span className="nav-ctas">
            <a className="btn btn-sm" href={`/${locale}#trial`} onClick={() => setOpen(false)}>
              {nav.trial}
            </a>
            <a className="btn btn-sm btn-lime" href={`/${locale}#plans`} onClick={() => setOpen(false)}>
              {nav.getStarted}
            </a>
          </span>
        </nav>
        <button
          type="button"
          className="mobile-menu"
          aria-label={nav.toggleMenu}
          aria-expanded={open}
          aria-controls="navlinks"
          onClick={() => setOpen((o) => !o)}
        >
          <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
