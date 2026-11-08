import Link from 'next/link';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

const BENEFIT_SYMBOLS = ['◎', '▣', '◇', '☏'];
const CATEGORY_SYMBOLS = ['▣', '▤', '▷', '◉', '◈', '♡'];
const DEVICE_SYMBOLS = ['▣', '▭', '▯', '▱'];

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const h = dict.hero;
  return (
    <div className="wrap hero">
      <div className="hero-grid">
        <div>
          <div className="eyebrow">{h.eyebrow}</div>
          <h1>
            {h.titleA}
            <br />
            <span className="gold">{h.titleB}</span>
          </h1>
          <p className="lead">{h.lead}</p>
          <div className="actions">
            <Link className="btn" href={`/${locale}#plans`}>{h.ctaPrimary} <span aria-hidden="true">→</span></Link>
            <Link className="btn ghost" href={`/${locale}#how`}>{h.ctaSecondary} <span aria-hidden="true">▷</span></Link>
          </div>
          <ul className="checks">
            {h.checks.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
        <div className="tvscene" role="img" aria-label={h.visualLabel}>
          <div className="tv"><div className="tvtext" aria-hidden="true">{siteConfig.brandName}</div></div>
          <div className="stand" />
          <span className="demo-stamp">{h.stamp}</span>
        </div>
      </div>
    </div>
  );
}

export function Benefits({ dict }: { dict: Dictionary }) {
  return (
    <ul className="wrap benefits" style={{ listStyle: 'none' }}>
      {dict.benefits.map((b, i) => (
        <li className="benefit" key={b.title}>
          <span className="symbol" aria-hidden="true">{BENEFIT_SYMBOLS[i]}</span>
          <div><b>{b.title}</b><small>{b.text}</small></div>
        </li>
      ))}
    </ul>
  );
}

export function ContentCategories({ dict, headingLevel = 2 }: { dict: Dictionary; headingLevel?: 1 | 2 }) {
  const c = dict.content;
  const H = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <section id="content" aria-labelledby="content-title">
      <div className="wrap">
        <div className="eyebrow">{c.eyebrow}</div>
        <H id="content-title" className="section-title">{c.title}</H>
        <p className="sub">{c.sub}</p>
        <ul className="content-grid">
          {c.categories.map((name, i) => (
            <li className="tile" key={name}>
              <span aria-hidden="true">{CATEGORY_SYMBOLS[i]}</span>
              <b>{name}</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function DeviceGrid({ dict, headingLevel = 2 }: { dict: Dictionary; headingLevel?: 1 | 2 }) {
  const d = dict.devices;
  const H = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <section id="devices" aria-labelledby="devices-title">
      <div className="wrap">
        <div className="eyebrow">{d.eyebrow}</div>
        <H id="devices-title" className={headingLevel === 1 ? 'page-title' : 'section-title'}>{d.title}</H>
        <p className="sub">{d.sub}</p>
        <ul className="devices">
          {d.items.map((item, i) => (
            <li className="card device" key={item.title}>
              <div className="symbol" aria-hidden="true">{DEVICE_SYMBOLS[i]}</div>
              <b>{item.title}</b>
              <small>{item.text}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const h = dict.how;
  return (
    <section id="how" aria-labelledby="how-title">
      <div className="wrap">
        <div className="eyebrow">{h.eyebrow}</div>
        <h2 id="how-title" className="section-title">{h.title}</h2>
        <ol className="steps">
          {h.steps.map((s, i) => (
            <li className="card step" key={s.title}>
              <div className="num" aria-hidden="true">{i + 1}</div>
              <b>{s.title}</b>
              <small>{s.text}</small>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Faq({ dict, limit }: { dict: Dictionary; limit?: number }) {
  const f = dict.faq;
  const items = limit ? f.items.slice(0, limit) : f.items;
  return (
    <section id="faq" aria-labelledby="faq-title">
      <div className="wrap faq-layout">
        <div>
          <div className="eyebrow">{f.eyebrow}</div>
          <h2 id="faq-title" className="section-title">{f.title}</h2>
          <p className="sub">{f.sub}</p>
        </div>
        <div className="faq">
          {items.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HelpCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section aria-labelledby="help-cta-title">
      <div className="wrap">
        <div className="card help">
          <div>
            <h2 id="help-cta-title">{dict.helpCta.title}</h2>
            <div className="muted">{dict.helpCta.text}</div>
          </div>
          <Link className="btn ghost" href={`/${locale}/help`}>{dict.helpCta.button} <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
