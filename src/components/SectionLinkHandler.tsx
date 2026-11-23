'use client';

import { useEffect } from 'react';

/**
 * In-page links (/#plans, /#how…) must scroll even when the address already
 * ends with the same #hash (the browser/router would otherwise do nothing).
 */
export function SectionLinkHandler() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth';
      target.scrollIntoView({ behavior, block: 'start' });
      // A focusable target (the skip link's <main tabindex="-1">) takes the focus, as the browser would without
      // preventDefault(): the next Tab then continues from the content, not from the header (WCAG 2.4.1, A-004).
      if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
      // Content above can change height during the smooth scroll (images, entrance animations):
      // once the scroll ends, land exactly on the section (one correction at most).
      const settle = () => {
        window.removeEventListener('scrollend', settle);
        clearTimeout(timer);
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        const off = target.getBoundingClientRect().top - margin;
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (Math.abs(off) > 8 && !(off > 0 && atBottom)) target.scrollIntoView({ behavior, block: 'start' });
      };
      const timer = setTimeout(settle, 1500);
      window.addEventListener('scrollend', settle);
      if (location.hash !== url.hash) history.pushState(null, '', url.hash);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}
