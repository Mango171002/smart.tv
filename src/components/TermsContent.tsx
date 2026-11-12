import Link from 'next/link';
import {
  Activity, Ban, Building2, CalendarClock, Copyright, Gavel, Info, Lock, Mail, MonitorSmartphone,
  PauseCircle, PencilLine, Phone, ReceiptText, Rocket, Scale, Tag, Tv, UserRound, type LucideIcon,
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { TERMS_HIGHLIGHTS, TERMS_SECTIONS, TERMS_UPDATED, type TermsSection } from '@/content/terms';

const ICONS: Record<TermsSection['icon'], LucideIcon> = {
  info: Info, building: Building2, rocket: Rocket, tv: Tv, user: UserRound, tag: Tag, calendar: CalendarClock,
  refund: ReceiptText, devices: MonitorSmartphone, ban: Ban, copyright: Copyright, activity: Activity,
  pause: PauseCircle, scale: Scale, lock: Lock, pencil: PencilLine, gavel: Gavel, mail: Mail,
};
const CATS = ['live', 'sports', 'movies', 'streaming'] as const;

/** Terms of Service page body (charter styling: neon highlights, numbered sections, sticky contents). */
export function TermsContent() {
  const email = siteConfig.supportEmail;
  const phone = siteConfig.supportPhone;
  return (
    <div className="terms">
      <p className="terms-meta">Last updated: {TERMS_UPDATED} · Pre-launch version</p>

      <ul className="terms-highlights">
        {TERMS_HIGHLIGHTS.map((h, i) => {
          const Icon = ICONS[h.icon];
          return (
            <li key={h.title} className={`cat-${CATS[i % CATS.length]}`}>
              <span className="icon-box" aria-hidden="true"><Icon size={22} strokeWidth={1.75} /></span>
              <b>{h.title}</b>
              <small>{h.text}</small>
            </li>
          );
        })}
      </ul>

      <div className="terms-layout">
        <nav className="terms-toc" aria-label="Contents">
          <b>Contents</b>
          <ol>
            {TERMS_SECTIONS.map((s) => (
              <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
            ))}
            <li><a href="#contact">Contact us</a></li>
          </ol>
        </nav>

        <div className="terms-body">
          {TERMS_SECTIONS.map((s, i) => {
            const Icon = ICONS[s.icon];
            return (
              <section key={s.id} id={s.id} className={`terms-section cat-${CATS[i % CATS.length]}`} aria-labelledby={`${s.id}-t`}>
                <h2 id={`${s.id}-t`}>
                  <span className="icon-box sm" aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
                  <span className="terms-num">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </h2>
                {s.body.map((b, j) =>
                  'p' in b ? (
                    <p key={j}>{b.p}</p>
                  ) : (
                    <ul key={j}>{b.list.map((li) => <li key={li}>{li}</li>)}</ul>
                  ),
                )}
              </section>
            );
          })}

          <section id="contact" className="terms-contact" aria-labelledby="contact-t">
            <h2 id="contact-t">Contact us</h2>
            <p>Questions about these Terms or your subscription? Our team is here to help.</p>
            <ul>
              {email && (
                <li>
                  <Mail size={20} strokeWidth={1.75} aria-hidden="true" />
                  <span>Email</span>
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              )}
              {phone && (
                <li>
                  <Phone size={20} strokeWidth={1.75} aria-hidden="true" />
                  <span>Phone</span>
                  <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
                </li>
              )}
            </ul>
            <p className="terms-related">
              See also our <Link href="/legal/privacy">Privacy policy</Link>, <Link href="/legal/refunds">Refunds &amp; cancellations</Link> and{' '}
              <Link href="/legal/imprint">Legal notice</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
