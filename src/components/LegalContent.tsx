import Link from 'next/link';
import {
  Activity, Ban, Building2, CalendarClock, CircleCheck, Clock, Cookie, Copyright, CreditCard, Database, Gavel, Globe,
  Info, Lock, Mail, MonitorSmartphone, PauseCircle, PencilLine, Phone, ReceiptText, Rocket, Scale, Server, ShieldCheck,
  Tag, Tv, UserRound, UsersRound, type LucideIcon,
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { legalDocuments, type LegalSection } from '@/content/legal';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { SITE_LOCALES } from '@/i18n/locales';
import { href, LEGAL_DOCS, type LegalDoc } from '@/lib/routes';

const ICONS: Record<LegalSection['icon'], LucideIcon> = {
  info: Info, building: Building2, rocket: Rocket, tv: Tv, user: UserRound, tag: Tag, calendar: CalendarClock,
  refund: ReceiptText, devices: MonitorSmartphone, ban: Ban, copyright: Copyright, activity: Activity,
  pause: PauseCircle, scale: Scale, lock: Lock, pencil: PencilLine, gavel: Gavel, mail: Mail,
  shield: ShieldCheck, cookie: Cookie, database: Database, globe: Globe, clock: Clock, server: Server,
  check: CircleCheck, card: CreditCard, users: UsersRound,
};
const CATS = ['live', 'sports', 'movies', 'streaming'] as const;


/** Legal page body (charter styling: neon highlights, numbered sections). */
export function LegalContent({ doc, locale, dict }: { doc: LegalDoc; locale: Locale; dict: Dictionary['legal'] }) {
  const { updated, edition, sections, contactIntro } = legalDocuments(SITE_LOCALES[locale].language)[doc];
  const pending = dict.toBePublished;
  const email = siteConfig.supportEmail;
  const phone = siteConfig.supportPhone;
  const related = LEGAL_DOCS.filter((d) => d !== doc);
  return (
    <div className="terms">
      <p className="terms-meta">{`${dict.lastUpdated} `}{updated}{edition ? ` · ${edition}` : ''}</p>

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
          <h2 id="contact-t">{dict.contactTitle}</h2>
          <p>{contactIntro}</p>
          <ul>
            {email && (
              <li>
                <Mail size={20} strokeWidth={1.75} aria-hidden="true" />
                <span>{dict.email}</span>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            )}
            {phone && (
              <li>
                <Phone size={20} strokeWidth={1.75} aria-hidden="true" />
                <span>{dict.phone}</span>
                <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
              </li>
            )}
          </ul>
          <p className="terms-related">
            {dict.seeAlso}{' '}
            {related.map((d, i) => (
              <span key={d}>
                <Link href={href(locale, `/legal/${d}`)}>{dict.docs[d].title}</Link>
                {i < related.length - 2 ? ', ' : i === related.length - 2 ? dict.and : '.'}
              </span>
            ))}
          </p>
        </section>
      </div>
    </div>
  );
}
