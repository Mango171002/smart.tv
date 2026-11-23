import Link from 'next/link';
import { Clock } from 'lucide-react';

/**
 * Prelaunch banner (online orders and free trials closed, FEATURE_CONTACT_FORM=false) at the top of the About and
 * Help center pages: they explain how ordering and trials work, so the reader is told first that both are not open
 * yet. Same look as the windows' prelaunch notice (src/components/PrelaunchNotice.tsx); no form, no request button.
 */
export function PrelaunchBanner({ title, text, plans }: { title: string; text: string; plans: { label: string; href: string } }) {
  return (
    <div className="prelaunch prelaunch-banner" role="note" aria-labelledby="prelaunch-banner-t" data-testid="prelaunch-banner">
      <p id="prelaunch-banner-t" className="prelaunch-banner-title">
        <Clock size={20} strokeWidth={1.75} aria-hidden="true" />
        <span>{title}</span>
      </p>
      <p className="prelaunch-text">{text}</p>
      <p className="prelaunch-note"><Link href={plans.href}>{plans.label}</Link></p>
    </div>
  );
}
