import Link from 'next/link';
import { preload } from 'react-dom';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { Check, Play, CircleHelp, BadgeCheck, UserPlus, Minus, Infinity as InfinityIcon, AppWindow, ArrowRight, CirclePlay, Flame, Headset, Laptop, MonitorSmartphone, Plus, RefreshCcw, ShieldCheck, Smartphone, Tv, TvMinimalPlay, Zap, type LucideIcon } from 'lucide-react';
import { RequestButton } from './RequestButton';
import { BENEFIT_ICONS, CATEGORIES, ICON_STROKE } from './icons';

/** Hero banner: responsive files generated from assets/hero/hero-source.png by `npm run hero`. */
const HERO_WIDTHS = [640, 1080, 1440, 1920];
const HERO_EXTRA_SLIDES = ['baseball', 'savanna'];
const HERO_SIZES = '(max-width: 900px) 100vw, 92vw';
const heroSrcSet = (ext: 'avif' | 'webp', name = 'hero') => HERO_WIDTHS.map((w) => `/images/${name}-${w}.${ext} ${w}w`).join(', ');

/** Icons of the hero feature bar (Lucide, lime). */
const HERO_BAR_ICONS: LucideIcon[] = [Zap, ShieldCheck, MonitorSmartphone, InfinityIcon, Headset];

export function Hero({ locale: _locale, dict }: { locale: Locale; dict: Dictionary }) {
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
            <Link className="btn btn-lime" href={`/#plans`}>
              {h.ctaPrimary} <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
            <Link className="btn ghost" href={`/#how`}>
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
          {/* Extra banners (baseball, savanna): cross-fade in turn every few seconds (CSS only) */}
          {HERO_EXTRA_SLIDES.map((name) => (
            <picture key={name} className="hero-slide">
              <source type="image/avif" srcSet={heroSrcSet('avif', `hero-${name}`)} sizes={HERO_SIZES} />
              <source type="image/webp" srcSet={heroSrcSet('webp', `hero-${name}`)} sizes={HERO_SIZES} />
              <img src={`/images/hero-${name}-1080.webp`} alt="" width={1920} height={819} fetchPriority="low" decoding="async" />
            </picture>
          ))}
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
  locale: _locale,
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
        <ul className="cat-grid" data-reveal suppressHydrationWarning>
          {c.categories.map((item, i) => {
            const { key, icon: Icon } = CATEGORIES[i]!;
            return (
              <li key={item.title}>
                <Link className={`cat-card cat-${key}`} href={`/#featured`} data-category={key}>
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

export function HowItWorks({ locale: _locale, dict }: { locale: Locale; dict: Dictionary }) {
  const h = dict.how;
  return (
    <section id="how" className="how-v3" aria-labelledby="how-title">
      <div className="wrap">
        <div className="how3-head">
          <p className="how3-eyebrow">{h.eyebrow}</p>
          <h2 id="how-title" className="how3-title">
            {h.titleA} <span>{h.titleHl}</span>
          </h2>
          <p className="how3-sub">{h.sub}</p>
        </div>
        <ol className="how3-steps">
          {h.steps.map((s, i) => (
            <li key={s.title} className={i === 0 ? 'is-first' : undefined}>
              <span className="how3-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <b>{s.title}</b>
              <small>{s.text}</small>
            </li>
          ))}
        </ol>
        <div className="how3-actions">
          <Link className="btn btn-lime how3-cta" href="/#plans">
            {h.cta} <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
          <p className="how3-note">{h.note}</p>
        </div>
      </div>
    </section>
  );
}

const FAQ_HIGHLIGHTS: { Icon: LucideIcon; cat: string }[] = [
  { Icon: Zap, cat: 'sports' },
  { Icon: MonitorSmartphone, cat: 'live' },
  { Icon: ShieldCheck, cat: 'streaming' },
];

export function Faq({ dict, limit }: { dict: Dictionary; limit?: number }) {
  const f = dict.faq;
  const items = limit ? f.items.slice(0, limit) : f.items;
  return (
    <section id="faq" aria-labelledby="faq-title">
      <div className="wrap faq-layout">
        <div className="faq-intro">
          <div className="eyebrow eyebrow-lime">
            <CircleHelp size={15} strokeWidth={2.25} aria-hidden="true" /> {f.eyebrow}
          </div>
          <h2 id="faq-title" className="section-title faq-title">
            {f.titleA} <span className="faq-hl">{f.titleHl}</span>
          </h2>
          <p className="sub">{f.sub}</p>
          <ul className="faq-highlights">
            {f.highlights.map((label, i) => {
              const { Icon, cat } = FAQ_HIGHLIGHTS[i] ?? FAQ_HIGHLIGHTS[0]!;
              return (
                <li key={label} className={`cat-${cat}`}>
                  <span className="icon-box lg" aria-hidden="true">
                    <Icon size={28} strokeWidth={1.75} />
                  </span>
                  <b>{label}</b>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="faq" data-reveal suppressHydrationWarning>
          {items.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>
                <span>{item.q}</span>
                <span className="faq-toggle" aria-hidden="true">
                  <Plus className="faq-plus" size={16} strokeWidth={2.25} />
                  <Minus className="faq-minus" size={16} strokeWidth={2.25} />
                </span>
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
export function CtaBanner({ locale: _locale, dict, fromMonthly }: { locale: Locale; dict: Dictionary; fromMonthly: string }) {
  const c = dict.cta;
  return (
    <section className="cta-section" aria-labelledby="cta-title">
      <div className="wrap">
        <div className="cta-banner">
          <picture>
            <source type="image/avif" srcSet="/images/cta-earth-640.avif 640w, /images/cta-earth-1200.avif 1200w" sizes="(max-width: 640px) 100vw, 60vw" />
            <source type="image/webp" srcSet="/images/cta-earth-640.webp 640w, /images/cta-earth-1200.webp 1200w" sizes="(max-width: 640px) 100vw, 60vw" />
            { }
            <img className="cta-globe" src="/images/cta-earth-640.webp" alt="" width={1672} height={941} loading="lazy" decoding="async" />
          </picture>
          <span className="cta-waves" aria-hidden="true" />
          <h2 id="cta-title">
            {c.titleA} <span className="cta-hl">{c.titleHl}</span>
          </h2>
          <p className="cta-text">{c.text.replace('{price}', fromMonthly)}</p>
          <p className="cta-text2">{c.text2}</p>
          <div className="cta-actions">
            <Link className="btn cta-outline" href={`/#plans`}>
              <Play size={20} strokeWidth={2} aria-hidden="true" /> {c.choose}
            </Link>
            <RequestButton mode="trial" className="btn btn-lime">
              <UserPlus size={20} strokeWidth={2} aria-hidden="true" /> {c.trial}
            </RequestButton>
          </div>
          <ul className="cta-trust">
            {c.trust.map((t) => (
              <li key={t}>
                <Check size={18} strokeWidth={2.5} aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
