import Link from 'next/link';
import { MonitorSmartphone, ShieldCheck, Zap } from 'lucide-react';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { Brand } from './Brand';
import { ContactLink } from './FooterClient';

/** Simple monochrome social glyphs (paths), shown only for configured accounts. */
const SOCIAL_ICONS: Record<keyof typeof siteConfig.social, { label: string; path: string }> = {
  facebook: { label: 'Facebook', path: 'M14 8.5V6.6c0-.8.2-1.3 1.4-1.3H17V2.2A21 21 0 0 0 14.6 2C12.2 2 10.6 3.5 10.6 6.1v2.4H8v3.5h2.6V22H14v-10h2.7l.4-3.5Z' },
  instagram: { label: 'Instagram', path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z' },
  tiktok: { label: 'TikTok', path: 'M16.6 2h-3.3v13.6a2.9 2.9 0 1 1-2-2.8V9.4a6.3 6.3 0 1 0 5.3 6.2V8.8a7.9 7.9 0 0 0 4.6 1.5V7a4.6 4.6 0 0 1-4.6-4.6Z' },
  telegram: { label: 'Telegram', path: 'M21.9 4.3 18.8 19c-.2 1-.8 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.2.2-.5.5-1 .5l.3-4.8 8.8-7.9c.4-.3-.1-.5-.6-.2L6.8 13l-4.7-1.5c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3Z' },
};

const WHATSAPP_PATH = 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z';

/** Legal documents shown in the footer, in the owner's order. */
const FOOTER_LEGAL = ['terms', 'privacy', 'cookies', 'imprint'] as const;

const CHIP_ICONS = [MonitorSmartphone, Zap, ShieldCheck];

export function Footer({ locale: _locale, dict }: { locale: Locale; dict: Dictionary }) {
  const f = dict.footer;
  const socials = [
    ...(Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).map((k) => ({ key: k, ...SOCIAL_ICONS[k], href: siteConfig.social[k] })),
    { key: 'whatsapp', label: 'WhatsApp', path: WHATSAPP_PATH, href: siteConfig.supportWhatsApp ? `https://wa.me/${siteConfig.supportWhatsApp}` : null },
  ];
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Brand className="brand-logo-footer" />
          <p className="footer-tagline">{f.tagline}</p>
          <ul className="footer-social" aria-label={f.social}>
            {socials.map((s) => {
              const icon = (
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d={s.path} fill="currentColor" />
                </svg>
              );
              return (
                <li key={s.key}>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>{icon}</a>
                  ) : (
                    // No official account yet: shown, but not clickable.
                    <span role="img" aria-label={f.socialSoon.replace('{name}', s.label)} title={f.socialSoon.replace('{name}', s.label)}>{icon}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="footer-about">
          <b className="footer-title">{f.aboutTitle.replace('{brand}', siteConfig.brandName)}</b>
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
            <li><Link href={`/#plans`}>{dict.nav.plans}</Link></li>
            <li><Link href={`/#how`}>{dict.nav.how}</Link></li>
            <li><Link href={`/#faq`}>{f.helpFaq}</Link></li>
            <li><ContactLink label={f.contact} /></li>
          </ul>
        </nav>
        <nav aria-label={f.legalTitle} className="footer-col">
          <b className="footer-title">{f.legalTitle}</b>
          <ul>
            {FOOTER_LEGAL.map((d) => (
              <li key={d}><Link href={`/legal/${d}`}>{f.legalLinks[d]}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
