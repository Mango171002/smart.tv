import Link from 'next/link';
import { preload } from 'react-dom';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { BadgeCheck, Minus, Infinity as InfinityIcon, AppWindow, ArrowRight, CirclePlay, Flame, Headset, Laptop, MonitorSmartphone, Plus, RefreshCcw, ShieldCheck, Smartphone, Tv, TvMinimalPlay, Zap, type LucideIcon } from 'lucide-react';
import { RequestButton } from './RequestButton';
import { BENEFIT_ICONS, CATEGORIES, ICON_STROKE } from './icons';

/** Hero banner: responsive files generated from assets/hero/hero-source.png by `npm run hero`. */
const HERO_WIDTHS = [640, 1080, 1440, 1920];
const HERO_SIZES = '(max-width: 900px) 100vw, 92vw';
const heroSrcSet = (ext: 'avif' | 'webp') => HERO_WIDTHS.map((w) => `/images/hero-${w}.${ext} ${w}w`).join(', ');

/** Icons of the hero feature bar (Lucide, lime). */
const HERO_BAR_ICONS: LucideIcon[] = [Zap, ShieldCheck, MonitorSmartphone, InfinityIcon, Headset];

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const h = dict.hero;
  // Start downloading the banner (largest element on screen) as early as possible.
  preload('/images/hero-1080.avif', { as: 'image', type: 'image/avif', imageSrcSet: heroSrcSet('avif'), imageSizes: HERO_SIZES, fetchPriority: 'high' });
  return (
    <div className="wrap hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 className="hero-title">
            <span>{h.titleA}</span>
            <span className="hero-title-hl">{h.titleB}</span>
          </h1>
          <p className="lead">{h.lead}</p>
          <div className="actions">
            <Link className="btn btn-lime" href={`/${locale}#plans`}>
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
              width={1920}
              height={819}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
        <ul className="hero-checks hero-bar">
          {h.checks.map((c, i) => {
            const Icon = HERO_BAR_ICONS[i] ?? Zap;
            return (
              <li key={c}>
                <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                <span>{c}</span>
              </li>
            );
          })}
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
const STEP_CATS = ['live', 'movies', 'sports', 'streaming'] as const;

export function HowItWorks({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const h = dict.how;
  return (
    <section id="how" aria-labelledby="how-title">
      <div className="wrap">
        <div className="how-head">
          <div className="eyebrow">{h.eyebrow}</div>
          <h2 id="how-title" className="section-title">{h.title}</h2>
          <p className="sub">{h.sub}</p>
        </div>
        <ol className="steps steps-4">
          {h.steps.map((s, i) => (
            <li className={`card step cat-${STEP_CATS[i % STEP_CATS.length]}`} key={s.title}>
              <div className="step-top">
                <div className="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
                <span className="step-time">{s.time}</span>
              </div>
              <b>{s.title}</b>
              <small>{s.text}</small>
            </li>
          ))}
        </ol>
        <div className="how-actions">
          <Link className="btn btn-lime" href={`/${locale}#plans`}>
            {h.cta} <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
          <RequestButton mode="support" className="link-btn">{h.help}</RequestButton>
        </div>
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

const PLATFORM_ICONS: LucideIcon[] = [Tv, TvMinimalPlay, Flame, AppWindow, Smartphone, Laptop];
const TRUST: { Icon: LucideIcon; cat: string }[] = [
  { Icon: Zap, cat: 'sports' },
  { Icon: ShieldCheck, cat: 'live' },
  { Icon: Headset, cat: 'movies' },
  { Icon: RefreshCcw, cat: 'streaming' },
];

/** Below the plan cards: comparison table, platforms bar and reassurance bar (text only, no third-party logos). */
export function PlanExtras({ dict }: { dict: Dictionary }) {
  const p = dict.plans;
  return (
    <div className="plan-extras">
      <ComparisonTable dict={dict} />
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

/** Plans comparison table (owner request): features from the plan cards, honest values only. */
function ComparisonTable({ dict }: { dict: Dictionary }) {
  const c = dict.plans.compare;
  const tiers = ['starter', 'plus', 'ultra'] as const;
  return (
    <div className="compare" aria-labelledby="compare-title">
      <h3 id="compare-title" className="compare-title">{c.title}</h3>
      <div className="compare-scroll">
        <table className="compare-table">
          <thead>
            <tr>
              <th scope="col">{c.feature}</th>
              {tiers.map((t) => (
                <th scope="col" key={t} data-tier={t} className={t === 'plus' ? 'is-recommended' : undefined}>
                  {dict.plans.tiers[t].name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.values.map((v, i) => (
                  <td key={tiers[i]} data-tier={tiers[i]} className={tiers[i] === 'plus' ? 'is-recommended' : undefined}>
                    {v === true ? (
                      <BadgeCheck size={22} strokeWidth={2} aria-label={c.included} className="compare-yes" />
                    ) : v === false ? (
                      <Minus size={18} strokeWidth={2} aria-label={c.notIncluded} className="compare-no" />
                    ) : (
                      v
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="footnote">{c.note}</p>
    </div>
  );
}

/** Closing call-to-action after the FAQ (owner mock-up, charter colours, honest claims). */
export function CtaBanner({ locale, dict, fromMonthly }: { locale: Locale; dict: Dictionary; fromMonthly: string }) {
  const c = dict.cta;
  return (
    <section className="cta-section" aria-labelledby="cta-title">
      <div className="wrap">
        <div className="cta-banner">
          <h2 id="cta-title">{c.title}</h2>
          <p>
            {c.text.replace('{price}', fromMonthly)}
            <br />
            {c.text2}
          </p>
          <div className="cta-actions">
            <Link className="btn cta-white" href={`/${locale}#plans`}>
              <Zap size={18} strokeWidth={2} aria-hidden="true" /> {c.choose}
            </Link>
            <RequestButton mode="trial" className="btn btn-lime">
              <CirclePlay size={18} strokeWidth={2} aria-hidden="true" /> {c.trial}
            </RequestButton>
          </div>
          <ul className="cta-trust">
            {c.trust.map((t, i) => {
              const Icon = [ShieldCheck, Zap, Headset][i] ?? ShieldCheck;
              return (
                <li key={t}>
                  <Icon size={15} strokeWidth={2} aria-hidden="true" /> {t}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
