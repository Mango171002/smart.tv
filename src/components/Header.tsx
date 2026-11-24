'use client';

import { Menu } from 'lucide-react';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { Brand } from './Brand';
import { LanguageSwitcher, LanguageSwitcherMobile, navCollapse } from './LanguageSwitcher';
import { openRequest } from './RequestHost';
import { contentPagesEnabled } from '@/config/content-pages';
import { localizedPath } from '@/lib/routes';

export function Header({ locale, nav }: { locale: Locale; nav: Dictionary['nav'] }) {
  const [open, setOpen] = useState(false);
  const collapse = navCollapse(locale);
  const root = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // Escape closes the menu; the focus goes back to the menu button when it was inside the menu (never lost on <body>).
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const inside = root.current?.contains(document.activeElement);
      setOpen(false);
      if (inside) button.current?.focus();
    };
    // A tap or click outside the header closes it (same as the language list).
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    // Tabbing out of the open menu closes it: the next control would otherwise sit under the open panel (A-003).
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && !root.current?.contains(next)) setOpen(false);
    };
    const header = root.current;
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    header?.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      header?.removeEventListener('focusout', onFocusOut);
    };
  }, [open]);

  // One-page site: the menu scrolls to sections of the home page.
  const links = [
    { href: localizedPath(locale, '#plans'), label: nav.plans },
    { href: localizedPath(locale, '#how'), label: nav.how },
    { href: localizedPath(locale, contentPagesEnabled() ? '/help' : '#faq'), label: nav.help },
    // Blog link hidden until the first article is published (owner decision, 18/11/2026); /blog stays noindex.
  ];

  return (
    // Several languages (preview / released builds only): header tuned for longer labels, see globals.css « header-multi ».
    <header ref={root} className={collapse ? 'header header-multi' : 'header'} data-collapse={collapse || undefined}>
      <div className="wrap nav">
        <Link href={localizedPath(locale)} title={nav.home} className="brand-link">
          <Brand />
        </Link>
        {/* The menu button comes BEFORE the menu it opens, so the next Tab enters the open menu (WCAG 2.4.3). Visually nothing
            changes: it is hidden on wide screens and the open menu is an absolutely positioned panel. */}
        {/* Long languages (fr, de, nl, nb): from 901 to 1359 px the links are in the menu; one call to action stays visible
            next to the menu button (D-5). Hidden at every other width (globals.css « nav-cta-xl »). */}
        {collapse === 'xl' && (
          <a className="btn btn-sm btn-lime nav-cta-xl" href={localizedPath(locale, '#plans')} onClick={() => setOpen(false)}>
            {nav.getStarted}
          </a>
        )}
        <button
          type="button"
          ref={button}
          className="mobile-menu"
          aria-label={nav.toggleMenu}
          aria-expanded={open}
          aria-controls="navlinks"
          onClick={() => setOpen((o) => !o)}
        >
          <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <nav id="navlinks" className={`links${open ? ' open' : ''}`} aria-label={nav.label}>
          {/* Plain anchors: native in-page scrolling + hashchange (used by the trial form pre-fill) */}
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          {/* Language switcher (phase 9): dropdown on desktop, section of the menu on mobile; absent with one language. */}
          <LanguageSwitcher locale={locale} />
          <LanguageSwitcherMobile locale={locale} />
          <span className="nav-ctas">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              aria-haspopup="dialog"
              onClick={() => {
                setOpen(false);
                openRequest('trial');
              }}
            >
              {nav.trial}
            </button>
            <a className="btn btn-sm btn-lime" href={localizedPath(locale, '#plans')} onClick={() => setOpen(false)}>
              {nav.getStarted}
            </a>
          </span>
        </nav>
      </div>
    </header>
  );
}
