import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

export function AnnounceBar({ locale, dict }: { locale: Locale; dict: Dictionary['announce'] }) {
  return (
    <div className="announce" role="note">
      <div className="wrap announce-in">
        <Zap className="announce-zap" size={15} strokeWidth={2} aria-hidden="true" />
        <b>{dict.lead}</b>
        <span className="announce-sep" aria-hidden="true">|</span>
        <span className="announce-text">{dict.text}</span>
        <Link className="announce-cta" href={`/${locale}/help#prereg`}>
          {dict.cta} <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
