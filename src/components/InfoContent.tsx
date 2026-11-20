import Link from 'next/link';
import {
  Activity, ArrowRight, Ban, Building2, CalendarClock, CircleCheck, Clock, Cookie, Copyright, CreditCard, Database, Gavel, Globe,
  Info, Lock, Mail, MonitorSmartphone, PauseCircle, PencilLine, Phone, ReceiptText, Rocket, Scale, Server, ShieldCheck,
  Tag, Tv, UserRound, UsersRound, type LucideIcon,
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import type { LegalSection } from '@/content/legal';
import type { InfoSection } from '@/content/en/info';
import s from './info.module.css';

export const INFO_ICONS: Record<LegalSection['icon'], LucideIcon> = {
  info: Info, building: Building2, rocket: Rocket, tv: Tv, user: UserRound, tag: Tag, calendar: CalendarClock,
  refund: ReceiptText, devices: MonitorSmartphone, ban: Ban, copyright: Copyright, activity: Activity,
  pause: PauseCircle, scale: Scale, lock: Lock, pencil: PencilLine, gavel: Gavel, mail: Mail,
  shield: ShieldCheck, cookie: Cookie, database: Database, globe: Globe, clock: Clock, server: Server,
  check: CircleCheck, card: CreditCard, users: UsersRound,
};
const CATS = ['live', 'sports', 'movies', 'streaming'] as const;

function Sections({ sections }: { sections: InfoSection[] }) {
  return (
    <>
      {sections.map((sec, i) => {
        const Icon = INFO_ICONS[sec.icon];
        return (
          <section key={sec.id} id={sec.id} className={`terms-section cat-${CATS[i % CATS.length]}`} aria-labelledby={`${sec.id}-t`}>
            <h2 id={`${sec.id}-t`}>
              <span className="icon-box sm" aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
              <span className="terms-num">{String(i + 1).padStart(2, '0')}</span>
              {sec.title}
            </h2>
            {sec.body.map((b, j) => {
              if ('p' in b) return <p key={j}>{b.p}</p>;
              if ('list' in b) return <ul key={j}>{b.list.map((li) => <li key={li}>{li}</li>)}</ul>;
              if ('note' in b) return <p key={j} className={s.note}>{b.note}</p>;
              if ('steps' in b) {
                return (
                  <ol key={j} className={s.steps}>
                    {b.steps.map((st) => (
                      <li key={st.title}><strong>{st.title}</strong><span>{st.text}</span></li>
                    ))}
                  </ol>
                );
              }
              if ('chips' in b) {
                return (
                  <ul key={j} className={s.chips} aria-label={b.label}>
                    {b.chips.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                );
              }
              if ('links' in b) {
                return (
                  <ul key={j} className={s.linkGrid}>
                    {b.links.map((l) => (
                      <li key={l.href}>
                        <Link className={s.linkCard} href={l.href}>
                          <span><strong>{l.label}</strong><span className={s.linkText}>{l.text}</span></span>
                          <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                );
              }
              if ('facts' in b) {
                return (
                  <dl key={j} className="legal-facts">
                    {b.facts.filter(([, v]) => v).map(([k, v]) => (
                      <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                    ))}
                  </dl>
                );
              }
              return null;
            })}
          </section>
        );
      })}
    </>
  );
}

/** Content-page body: same charter as the legal pages (numbered sections, icons, contact box), optional table of contents. */
export function InfoContent({
  sections, reviewed, related = [], contactIntro, toc = false, children,
}: {
  sections: InfoSection[];
  reviewed: string;
  related?: Array<{ href: string; label: string }>;
  contactIntro: string;
  /** Sticky « On this page » list (desktop), stacked on mobile. */
  toc?: boolean;
  /** Extra block rendered inside the contact box (calls to action). */
  children?: React.ReactNode;
}) {
  const email = siteConfig.supportEmail;
  const phone = siteConfig.supportPhone;
  const body = (
    <div className="terms-body">
      <Sections sections={sections} />
      <section id="contact" className="terms-contact" aria-labelledby="contact-t">
        <h2 id="contact-t">Contact us</h2>
        <p>{contactIntro}</p>
        <ul>
          {email && (<li><Mail size={20} strokeWidth={1.75} aria-hidden="true" /><span>Email</span><a href={`mailto:${email}`}>{email}</a></li>)}
          {phone && (<li><Phone size={20} strokeWidth={1.75} aria-hidden="true" /><span>Phone / WhatsApp</span><a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a></li>)}
        </ul>
        {children}
        {related.length > 0 && (
          <nav className={s.related} aria-label="Related pages">
            {related.map((r) => <Link key={r.href} href={r.href}>{r.label}</Link>)}
          </nav>
        )}
      </section>
    </div>
  );
  return (
    <div className={`terms ${s.info}`}>
      <p className="terms-meta">Last reviewed: {reviewed}</p>
      {toc && sections.length > 1 ? (
        <div className="terms-layout">
          <nav className={`terms-toc ${s.toc}`} aria-label="On this page">
            <b>On this page</b>
            <ol>
              {sections.map((sec) => <li key={sec.id}><a href={`#${sec.id}`}>{sec.title}</a></li>)}
              <li><a href="#contact">Contact us</a></li>
            </ol>
          </nav>
          {body}
        </div>
      ) : body}
    </div>
  );
}
