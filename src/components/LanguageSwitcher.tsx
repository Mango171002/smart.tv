'use client';

import { Check, ChevronDown, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { Locale } from '@/i18n/config';
import { LANGUAGE_LABEL, switchHref, switcherLanguages } from '@/i18n/switcher';

/**
 * Language switcher (phase 9): globe + current language in the header (desktop dropdown), a « Language » section
 * in the mobile menu. Native language names, no flags (a language is not a country). Plain links (full page load:
 * <html lang>, metadata and history stay correct), each marked with hreflang + lang for search engines and screen
 * readers. Rendered only when this build has at least two languages: never in production today (English only).
 */
const LANGUAGES = switcherLanguages();

/**
 * Header layout with the switcher: '' = single-language build (header unchanged); 'none' = full desktop header from
 * 901 px; 'xl' = the menu button is also used from 901 to 1359 px, for languages whose header labels are too long to fit
 * next to the switcher (measured with the widest fallback fonts; checked by tests/e2e/language-switcher.spec.ts).
 */
const NAV_COLLAPSE: Readonly<Record<string, 'none' | 'xl'>> = { en: 'none', fr: 'xl', de: 'xl', es: 'none', it: 'none', nl: 'xl', sv: 'none', nb: 'xl' };
export function navCollapse(locale: Locale): '' | 'none' | 'xl' {
  return LANGUAGES.length < 2 ? '' : NAV_COLLAPSE[locale] ?? 'xl';
}

function useLinks(locale: Locale) {
  const pathname = usePathname() ?? '/';
  return LANGUAGES.map((l) => ({ ...l, ...switchHref(pathname, l, LANGUAGES), active: l.code === locale }));
}

/** Same page in another language: keep the section anchor (#plans, #faq…), whose ids are identical in every language. */
function keepHash(e: MouseEvent<HTMLAnchorElement>, kept: boolean) {
  if (!kept || !window.location.hash || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  window.location.assign(e.currentTarget.getAttribute('href') + window.location.hash);
}

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const links = useLinks(locale);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const label = LANGUAGE_LABEL[locale] ?? LANGUAGE_LABEL.en;
  const current = links.find((l) => l.active) ?? links[0];

  const items = () => [...(root.current?.querySelectorAll<HTMLAnchorElement>('[data-lang-item]') ?? [])];
  const focusItem = (which: 'active' | 'first' | 'last') => {
    const all = items();
    const target = which === 'first' ? all[0] : which === 'last' ? all[all.length - 1] : all.find((a) => a.getAttribute('aria-current')) ?? all[0];
    target?.focus();
  };
  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const onButtonKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    setOpen(true);
    requestAnimationFrame(() => focusItem(e.key === 'ArrowUp' ? 'last' : 'active'));
  };
  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const all = items();
    const i = all.indexOf(document.activeElement as HTMLAnchorElement);
    const move: Record<string, number | undefined> = { ArrowDown: (i + 1) % all.length, ArrowUp: (i - 1 + all.length) % all.length, Home: 0, End: all.length - 1 };
    if (move[e.key] !== undefined) {
      e.preventDefault();
      all[move[e.key]!]?.focus();
    }
  };

  if (links.length < 2 || !current) return null;
  return (
    <div
      className="lang-switch"
      ref={root}
      data-lang-switcher=""
      onKeyDown={(e) => {
        if (e.key !== 'Escape' || !open) return;
        e.preventDefault();
        e.stopPropagation();
        close(true);
      }}
      onBlur={(e) => !root.current?.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <button
        ref={button}
        type="button"
        className="lang-switch-btn"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKey}
      >
        <Globe size={17} strokeWidth={1.75} aria-hidden="true" />
        <span className="lang-switch-code">{current.code.toUpperCase()}</span>
        <span className="lang-sr">
          , {label}: <span lang={current.htmlLang}>{current.nativeName}</span>
        </span>
        <ChevronDown className="lang-switch-chevron" size={15} strokeWidth={2} aria-hidden="true" />
      </button>
      <ul id={listId} className="lang-switch-list" hidden={!open} aria-label={label} onKeyDown={onListKey}>
        {links.map((l) => (
          <li key={l.code}>
            <a
              data-lang-item=""
              href={l.href}
              hrefLang={l.hreflang}
              lang={l.htmlLang}
              aria-current={l.active ? 'true' : undefined}
              onClick={(e) => keepHash(e, l.kept)}
            >
              <span>{l.nativeName}</span>
              {l.active ? <Check size={16} strokeWidth={2.25} aria-hidden="true" /> : <span className="lang-switch-tag" aria-hidden="true">{l.code.toUpperCase()}</span>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Mobile menu section: every language as a large touch target (two columns), the current one highlighted. */
export function LanguageSwitcherMobile({ locale }: { locale: Locale }) {
  const links = useLinks(locale);
  const titleId = useId();
  if (links.length < 2) return null;
  const label = LANGUAGE_LABEL[locale] ?? LANGUAGE_LABEL.en;
  return (
    <div className="lang-mobile" role="group" aria-labelledby={titleId} data-lang-switcher="">
      <p id={titleId} className="lang-mobile-title">
        <Globe size={16} strokeWidth={1.75} aria-hidden="true" />
        {label}
      </p>
      <ul className="lang-mobile-list">
        {links.map((l) => (
          <li key={l.code}>
            <a href={l.href} hrefLang={l.hreflang} lang={l.htmlLang} aria-current={l.active ? 'true' : undefined} onClick={(e) => keepHash(e, l.kept)}>
              <span>{l.nativeName}</span>
              {l.active && <Check size={16} strokeWidth={2.25} aria-hidden="true" />}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
