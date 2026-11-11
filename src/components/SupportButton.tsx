import { Headset } from 'lucide-react';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

/**
 * Floating support button (bottom-right). Opens WhatsApp once a number is set in
 * src/config/site.ts (supportWhatsApp); until then it goes to the support form.
 */
export function SupportButton({ locale, nav }: { locale: Locale; nav: Dictionary['nav'] }) {
  const wa = siteConfig.supportWhatsApp;
  const content = (
    <>
      <Headset size={22} strokeWidth={1.75} aria-hidden="true" />
      <span>{nav.support}</span>
    </>
  );
  return wa ? (
    <a className="support-fab" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label={nav.supportLabel}>
      {content}
    </a>
  ) : (
    // Plain anchor: native in-page scroll to the support form.
    <a className="support-fab" href={`/${locale}#support`} aria-label={nav.supportLabel}>
      {content}
    </a>
  );
}
