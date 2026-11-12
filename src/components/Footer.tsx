import Link from 'next/link';
import { MonitorSmartphone, ShieldCheck, Zap } from 'lucide-react';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { LEGAL_DOCS } from '@/lib/routes';
import { Brand } from './Brand';
import { BackToTop, ContactLink } from './FooterClient';

/** Simple monochrome social glyphs (paths), shown only for configured accounts. */
const SOCIAL_ICONS: Record<keyof typeof siteConfig.social, { label: string; path: string }> = {
  youtube: { label: 'YouTube', path: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3Z' },
  instagram: { label: 'Instagram', path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z' },
  x: { label: 'X', path: 'M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L2 3h6.4l4.4 5.8Zm-1.1 16.2h1.7L7.4 4.7H5.6Z' },
  telegram: { label: 'Telegram', path: 'M21.9 4.3 18.8 19c-.2 1-.8 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.2.2-.5.5-1 .5l.3-4.8 8.8-7.9c.4-.3-.1-.5-.6-.2L6.8 13l-4.7-1.5c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3Z' },
};

const CHIP_ICONS = [MonitorSmartphone, Zap, ShieldCheck];

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const f = dict.footer;
  const socials = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).filter((k) => siteConfig.social[k]);
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Brand />
          <p className="footer-tagline">{f.tagline}</p>
          {socials.length > 0 && (
            <ul className="footer-social" aria-label={f.social}>
              {socials.map((k) => (
                <li key={k}>
                  <a href={siteConfig.social[k]!} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_ICONS[k].label}>
                    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                      <path d={SOCIAL_ICONS[k].path} fill="currentColor" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="footer-about">
          <b className="footer-title">{f.aboutTitle}</b>
          <p>{f.about}</p>
          <ul className="footer-chips">
            {f.chips.map((c, i) => {
              const Icon = CHIP_ICONS[i] ?? Zap;
              return (
                <li key={c}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" /> {c}
                </li>
              );
            })}
          </ul>
        </div>
        <nav aria-label={f.linksTitle} className="footer-col">
          <b className="footer-title">{f.linksTitle}</b>
          <ul>
            <li><Link href={`/${locale}#plans`}>{dict.nav.plans}</Link></li>
            <li><Link href={`/${locale}#how`}>{dict.nav.how}</Link></li>
            <li><Link href={`/${locale}#faq`}>{f.helpFaq}</Link></li>
            <li><Link href={`/${locale}/blog`}>{dict.nav.blog}</Link></li>
            <li><ContactLink label={f.contact} /></li>
          </ul>
        </nav>
        <nav aria-label={f.legalTitle} className="footer-col">
          <b className="footer-title">{f.legalTitle}</b>
          <ul>
            {LEGAL_DOCS.map((d) => (
              <li key={d}><Link href={`/${locale}/legal/${d}`}>{dict.legal.docs[d].title}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="footer-top">
          <BackToTop label={f.backToTop} />
        </div>
      </div>
    </footer>
  );
}
