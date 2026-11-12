import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { LEGAL_DOCS } from '@/lib/routes';
import { Brand } from './Brand';

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const f = dict.footer;
  return (
    <footer className="footer">
      <div className="wrap footergrid">
        <div>
          <Brand />
          <p>{f.concept}</p>
        </div>
        <div>
          <b>{f.complianceTitle}</b>
          <p>
            {f.compliance}
            <br />
            {f.compliance2}
          </p>
        </div>
        <nav aria-label={f.siteTitle}>
          <b>{f.siteTitle}</b>
          <ul>
            <li><Link href={`/${locale}#plans`}>{dict.nav.plans}</Link></li>
            <li><Link href={`/${locale}#content`}>{dict.nav.content}</Link></li>
            <li><Link href={`/${locale}#how`}>{dict.nav.how}</Link></li>
            <li><Link href={`/${locale}#faq`}>{dict.nav.help}</Link></li>
            <li><Link href={`/${locale}/blog`}>{dict.nav.blog}</Link></li>
          </ul>
        </nav>
        <nav aria-label={f.legalTitle}>
          <b>{f.legalTitle}</b>
          <ul>
            {LEGAL_DOCS.map((d) => (
              <li key={d}><Link href={`/${locale}/legal/${d}`}>{dict.legal.docs[d].title}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
