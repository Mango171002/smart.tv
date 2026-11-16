import Link from 'next/link';
import {
  Activity, Ban, Building2, CalendarClock, CircleCheck, Clock, Cookie, Copyright, CreditCard, Database, Gavel, Globe,
  Info, Lock, Mail, MonitorSmartphone, PauseCircle, PencilLine, Phone, ReceiptText, Rocket, Scale, Server, ShieldCheck,
  Tag, Tv, UserRound, UsersRound, type LucideIcon,
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { LEGAL_DOCUMENTS, type LegalSection } from '@/content/legal';
import type { LegalDoc } from '@/lib/routes';

const ICONS: Record<LegalSection['icon'], LucideIcon> = {
  info: Info, building: Building2, rocket: Rocket, tv: Tv, user: UserRound, tag: Tag, calendar: CalendarClock,
  refund: ReceiptText, devices: MonitorSmartphone, ban: Ban, copyright: Copyright, activity: Activity,
  pause: PauseCircle, scale: Scale, lock: Lock, pencil: PencilLine, gavel: Gavel, mail: Mail,
  shield: ShieldCheck, cookie: Cookie, database: Database, globe: Globe, clock: Clock, server: Server,
  check: CircleCheck, card: CreditCard, users: UsersRound,
};
const CATS = ['live', 'sports', 'movies', 'streaming'] as const;

const RELATED: Array<[LegalDoc, string]> = [
  ['terms', 'Terms of Service'], ['privacy', 'Privacy policy'], ['cookies', 'Cookie policy'],
  ['refunds', 'Refunds & cancellations'], ['imprint', 'Legal notice'],
];

/** Legal page body (charter styling: neon highlights, numbered sections). */
export function LegalContent({ doc, pending }: { doc: LegalDoc; pending: string }) {
  const { updated, edition, sections, contactIntro } = LEGAL_DOCUMENTS[doc];
  const email = siteConfig.supportEmail;
  const phone = siteConfig.supportPhone;
  const related = RELATED.filter(([d]) => d !== doc);
  return (
    <div className="terms">
      <p className="terms-meta">Last updated: {updated}{edition ? ` · ${edition}` : ''}</p>

      <div className="terms-body">
        {sections.map((s, i) => {
          const Icon = ICONS[s.icon];
          return (
            <section key={s.id} id={s.id} className={`terms-section cat-${CATS[i % CATS.length]}`} aria-labelledby={`${s.id}-t`}>
              <h2 id={`${s.id}-t`}>
                <span className="icon-box sm" aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
                <span className="terms-num">{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </h2>
              {s.body.map((b, j) => {
                if ('p' in b) return <p key={j}>{b.p}</p>;
                if ('list' in b) return <ul key={j}>{b.list.map((li) => <li key={li}>{li}</li>)}</ul>;
                if ('facts' in b) {
                  return (
                    <dl key={j} className="legal-facts">
                      {b.facts.map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd className={v ? undefined : 'is-pending'}>{v ?? pending}</dd>
                        </div>
                      ))}
                    </dl>
                  );
                }
                return (
                  <div key={j} className="legal-table-wrap">
                    <table className="legal-table">
                      <thead><tr>{b.table.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                      <tbody>
                        {b.table.rows.map((r) => (
                          <tr key={r.join('|')}>
                            {r.map((c, k) => <td key={k} data-label={b.table.head[k]}>{c}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </section>
          );
        })}

        <section id="contact" className="terms-contact" aria-labelledby="contact-t">
          <h2 id="contact-t">Contact us</h2>
          <p>{contactIntro}</p>
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
            See also our{' '}
            {related.map(([d, label], i) => (
              <span key={d}>
                <Link href={`/legal/${d}`}>{label}</Link>
                {i < related.length - 2 ? ', ' : i === related.length - 2 ? ' and ' : '.'}
              </span>
            ))}
          </p>
        </section>
      </div>
    </div>
  );
}
