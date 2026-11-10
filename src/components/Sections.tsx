import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { ArrowRight, CirclePlay, Globe } from 'lucide-react';
import { BENEFIT_ICONS, CATEGORIES, DEVICE_ICONS, ICON_STROKE } from './icons';
import { LaptopFrame, PhoneFrame, TvFrame } from './visuals/Images';
import { TvScreen } from './visuals/Scenes';

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const h = dict.hero;
  return (
    <div className="wrap hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow has-icon">
            <Globe size={14} strokeWidth={2} aria-hidden="true" /> {h.eyebrow.split(' — ')[0]}
            {h.eyebrow.includes(' — ') && <span className="eyebrow-extra"> — {h.eyebrow.split(' — ')[1]}</span>}
          </div>
          <h1>
            {h.titleA}
            <span className="hl-lime">{h.titleB}</span>
          </h1>
          <p className="lead">{h.lead}</p>
          <div className="actions">
            <Link className="btn" href={`/${locale}#plans`}>
              {h.ctaPrimary} <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
            <Link className="btn ghost" href={`/${locale}#how`}>
              {h.ctaSecondary} <CirclePlay size={18} strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="hero-stage" role="img" aria-label={h.visualLabel}>
          <div className="stage-glow" aria-hidden="true" />
          <div className="stage-tv">
            {/* Inline (not an <img>) so the hero paints without waiting for a download. */}
            <div className="tv-bezel" aria-hidden="true">
              <TvScreen />
            </div>
            <div className="tv-stand" aria-hidden="true" />
          </div>
          <div className="stage-phone">
            <div className="mock-phone">
              <div className="mock-phone-screen">
                {/* eslint-disable-next-line @next/next/no-img-element -- static decorative SVG */}
                <img src="/visuals/scene-phone.svg" alt="" width={200} height={420} decoding="async" className="screen-svg" />
              </div>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- static decorative SVG */}
          <img className="stage-box" src="/visuals/scene-box.svg" alt="" width={320} height={170} decoding="async" />
        </div>
        <ul className="checks hero-checks">
          {h.checks.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>
    </div>
  );
}

/** Features bar (five reassurance items). */
export function Benefits({ dict }: { dict: Dictionary }) {
  return (
    <div className="wrap">
      <ul className="features-bar">
        {dict.benefits.map((b, i) => {
          const Icon = BENEFIT_ICONS[i]!;
          return (
            <li key={b.title}>
              <Icon size={30} strokeWidth={ICON_STROKE} aria-hidden="true" />
              <div><b>{b.title}</b><small>{b.text}</small></div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The four official category cards (neon outline style). */
export function ContentCategories({
  locale,
  dict,
  headingLevel = 2,
  showHeading = true,
}: {
  locale: Locale;
  dict: Dictionary;
  headingLevel?: 1 | 2;
  showHeading?: boolean;
}) {
  const c = dict.content;
  const H = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <section id="content" aria-labelledby="content-title" className={showHeading ? undefined : 'content-tight'}>
      <div className="wrap">
        <div className={showHeading ? undefined : 'sr-only'}>
          <div className="eyebrow">{c.eyebrow}</div>
          <H id="content-title" className="section-title">{c.title}</H>
          <p className="sub">{c.sub}</p>
        </div>
        <ul className="cat-grid">
          {c.categories.map((item, i) => {
            const { key, icon: Icon } = CATEGORIES[i]!;
            return (
              <li key={item.title}>
                <Link className={`cat-card cat-${key}`} href={`/${locale}/coverage`} data-category={key}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static decorative SVG */}
                  <img className="cat-art" src={`/visuals/cat-${key}.svg`} alt="" width={240} height={160} loading="lazy" decoding="async" />
                  <span className="cat-icon" aria-hidden="true">
                    <Icon size={40} strokeWidth={ICON_STROKE} />
                  </span>
                  <ArrowRight className="cat-arrow" size={20} strokeWidth={1.75} aria-hidden="true" />
                  <span className="cat-text">
                    <span className="cat-title">{item.title}</span>
                    <span className="cat-desc">{item.text}</span>
                  </span>
                </Link>
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
