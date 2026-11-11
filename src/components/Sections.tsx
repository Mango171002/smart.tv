import Link from 'next/link';
import { preload } from 'react-dom';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { AppWindow, ArrowRight, CirclePlay, Flame, Globe, Headset, Laptop, MonitorSmartphone, Plus, RefreshCcw, ShieldCheck, Smartphone, Tv, TvMinimalPlay, Zap, type LucideIcon } from 'lucide-react';
import { BENEFIT_ICONS, CATEGORIES, ICON_STROKE } from './icons';

/** Hero banner: responsive files generated from assets/hero/hero-source.png by `npm run hero`. */
const HERO_WIDTHS = [480, 768, 1080, 1440];
const HERO_SIZES = '(max-width: 900px) 100vw, 48vw';
const heroSrcSet = (ext: 'avif' | 'webp') => HERO_WIDTHS.map((w) => `/images/hero-${w}.${ext} ${w}w`).join(', ');

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const h = dict.hero;
  // Start downloading the banner (largest element on screen) as early as possible.
  preload('/images/hero-1080.avif', { as: 'image', type: 'image/avif', imageSrcSet: heroSrcSet('avif'), imageSizes: HERO_SIZES, fetchPriority: 'high' });
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
        <div className="hero-stage">
          <picture>
            <source type="image/avif" srcSet={heroSrcSet('avif')} sizes={HERO_SIZES} />
            <source type="image/webp" srcSet={heroSrcSet('webp')} sizes={HERO_SIZES} />
            <img
              src="/images/hero-1080.webp"
              alt={h.visualLabel}
              width={1480}
              height={833}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
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
/** Generated category artwork (npm run hero → public/images/cat-<key>-<w>.avif|webp). */
const CAT_SIZES = '(max-width: 900px) 50vw, 20vw';
const catSrcSet = (key: string, ext: 'avif' | 'webp') => `/images/cat-${key}-400.${ext} 400w, /images/cat-${key}-800.${ext} 800w`;

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
                <Link className={`cat-card cat-${key}`} href={`/${locale}#featured`} data-category={key}>
                  <picture>
                    <source type="image/avif" srcSet={catSrcSet(key, 'avif')} sizes={CAT_SIZES} />
                    <source type="image/webp" srcSet={catSrcSet(key, 'webp')} sizes={CAT_SIZES} />
                    { }
                    <img className="cat-art" src={`/images/cat-${key}-400.webp`} alt="" width={1536} height={1024} loading="lazy" decoding="async" />
                  </picture>
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

/** Accent colour of each step (official category colours). */
const STEP_CATS = ['live', 'movies', 'sports'] as const;

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const h = dict.how;
  return (
    <section id="how" aria-labelledby="how-title">
      <div className="wrap">
        <div className="eyebrow">{h.eyebrow}</div>
        <h2 id="how-title" className="section-title">{h.title}</h2>
        <ol className="steps">
          {h.steps.map((s, i) => (
            <li className={`card step cat-${STEP_CATS[i % STEP_CATS.length]}`} key={s.title}>
              <div className="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
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
              <summary>
                <span>{item.q}</span>
                <Plus className="faq-icon" size={18} strokeWidth={2} aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Generated device images (npm run hero → public/images/screen-<device>-<w>.avif|webp). */
const DEVICE_SHOTS = {
  tv: { widths: [640, 1280], w: 1672, h: 941, sizes: '(max-width: 900px) 92vw, 40vw' },
  laptop: { widths: [520, 1040], w: 1448, h: 1086, sizes: '(max-width: 900px) 46vw, 30vw' },
  phone: { widths: [240, 480], w: 940, h: 1672, sizes: '(max-width: 900px) 30vw, 11vw' },
} as const;

function DeviceShot({ device }: { device: keyof typeof DEVICE_SHOTS }) {
  const d = DEVICE_SHOTS[device];
  const set = (ext: string) => d.widths.map((w) => `/images/screen-${device}-${w}.${ext} ${w}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={d.sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={d.sizes} />
      <img className="device-shot" src={`/images/screen-${device}-${d.widths[0]}.webp`} alt="" width={d.w} height={d.h} loading="lazy" decoding="async" />
    </picture>
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
            <DeviceShot device="tv" />
            <figcaption>{p.labels[0]}</figcaption>
          </figure>
          <figure className="preview-item preview-laptop">
            <DeviceShot device="laptop" />
            <figcaption>{p.labels[1]}</figcaption>
          </figure>
          <figure className="preview-item preview-phone">
            <DeviceShot device="phone" />
            <figcaption>{p.labels[2]}</figcaption>
          </figure>
        </div>
        <p className="footnote" style={{ textAlign: 'center' }}>{p.caption}</p>
      </div>
    </section>
  );
}

const PLATFORM_ICONS: LucideIcon[] = [Tv, TvMinimalPlay, Flame, AppWindow, Smartphone, Laptop];
const TRUST: { Icon: LucideIcon; cat: string }[] = [
  { Icon: Zap, cat: 'sports' },
  { Icon: ShieldCheck, cat: 'live' },
  { Icon: Headset, cat: 'movies' },
  { Icon: RefreshCcw, cat: 'streaming' },
];

/** Below the plan cards: platforms bar + reassurance bar (text only, no third-party logos). */
export function PlanExtras({ dict }: { dict: Dictionary }) {
  const p = dict.plans;
  return (
    <div className="plan-extras">
      <div className="platforms-bar">
        <p className="platforms-title">
          <MonitorSmartphone size={34} strokeWidth={ICON_STROKE} aria-hidden="true" />
          <span>{p.devicesBar.title}</span>
        </p>
        <ul>
          {p.devicesBar.items.map((name, i) => {
            const Icon = PLATFORM_ICONS[i] ?? Tv;
            return (
              <li key={name}>
                <Icon size={26} strokeWidth={ICON_STROKE} aria-hidden="true" />
                <span>{name}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <ul className="trust-bar">
        {p.trust.map((item, i) => {
          const { Icon, cat } = TRUST[i % TRUST.length]!;
          return (
            <li key={item.title} className={`cat-${cat}`}>
              <Icon size={30} strokeWidth={ICON_STROKE} aria-hidden="true" />
              <span>
                <b>{item.title}</b>
                <small>{item.text}</small>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
