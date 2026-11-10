import Link from 'next/link';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { BENEFIT_ICONS, CATEGORIES, DEVICE_ICONS, ICON_STROKE } from './icons';
import { LaptopFrame, PhoneFrame, TvFrame } from './visuals/Images';

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
            <span className="hl">{h.titleB}</span>
          </h1>
          <p className="lead">{h.lead}</p>
          <div className="actions">
            <Link className="btn" href={`/${locale}#plans`}>
              {h.ctaPrimary} <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
            <Link className="btn ghost" href={`/${locale}#how`}>
              {h.ctaSecondary} <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
          <ul className="checks">
            {h.checks.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
        <div className="tvscene" role="img" aria-label={h.visualLabel}>
          <div className="scene-glow" aria-hidden="true" />
          <div className="hero-tv">
            <TvFrame label={siteConfig.brandName} loading="eager" />
          </div>
          <div className="hero-phone">
            <PhoneFrame loading="eager" />
          </div>
          <span className="demo-stamp">{h.stamp}</span>
        </div>
      </div>
    </div>
  );
}

export function Benefits({ dict }: { dict: Dictionary }) {
  return (
    <ul className="wrap benefits">
      {dict.benefits.map((b, i) => {
        const { icon: Icon, cat } = BENEFIT_ICONS[i]!;
        return (
          <li className={`benefit${cat ? ` cat-${cat}` : ''}`} key={b.title}>
            <span className="icon-box sm" aria-hidden="true">
              <Icon size={22} strokeWidth={ICON_STROKE} />
            </span>
            <div><b>{b.title}</b><small>{b.text}</small></div>
          </li>
        );
      })}
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
        <ul className="cat-grid">
          {c.categories.map((item, i) => {
            const { key, icon: Icon, support } = CATEGORIES[i]!;
            return (
              <li className={`cat-card cat-${key}`} key={item.title} data-category={key}>
                <span className="icon-box lg" aria-hidden="true">
                  <Icon size={28} strokeWidth={ICON_STROKE} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                <span className="cat-support" aria-hidden="true">
                  {support.map((S, j) => <S key={j} size={18} strokeWidth={ICON_STROKE} />)}
                </span>
              </li>
            );
          })}
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
          {d.items.map((item, i) => {
            const Icon = DEVICE_ICONS[i]!;
            return (
              <li className="card device cat-streaming" key={item.title}>
                <span className="icon-box" aria-hidden="true">
                  <Icon size={24} strokeWidth={ICON_STROKE} />
                </span>
                <b>{item.title}</b>
                <small>{item.text}</small>
              </li>
            );
          })}
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
          <Link className="btn ghost" href={`/${locale}/help`}>
            {dict.helpCta.button} <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function InterfacePreview({ dict }: { dict: Dictionary }) {
  const p = dict.preview;
  return (
    <section id="preview" aria-labelledby="preview-title">
      <div className="wrap">
        <div className="eyebrow">{p.eyebrow}</div>
        <h2 id="preview-title" className="section-title">{p.title}</h2>
        <p className="sub">{p.sub}</p>
        <div className="preview-stage" role="img" aria-label={`${p.caption}: ${p.labels.join(', ')}`}>
          <figure className="preview-item preview-tv">
            <TvFrame />
            <figcaption>{p.labels[0]}</figcaption>
          </figure>
          <figure className="preview-item preview-laptop">
            <LaptopFrame />
            <figcaption>{p.labels[1]}</figcaption>
          </figure>
          <figure className="preview-item preview-phone">
            <PhoneFrame />
            <figcaption>{p.labels[2]}</figcaption>
          </figure>
        </div>
        <p className="footnote" style={{ textAlign: 'center' }}>{p.caption}</p>
      </div>
    </section>
  );
}
