'use client';

import dynamic from 'next/dynamic';
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  CircleCheck,
  Monitor,
  Rocket,
  Crown,
  Gem,
  MonitorPlay,
  Star,
  Check,
  Clapperboard,
  Globe,
  Headset,
  History,
  MonitorSmartphone,
  Newspaper,
  ShieldCheck,
  Film,
  RadioTower,
  Trophy,
  Tv,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { fill, plural, type Dictionary } from '@/i18n/dictionaries';
import { CATALOGUE } from '@/config/catalogue';
import { computeQuote, formatMoney, STREAMS, TERMS, TERM_MONTHS, TIERS, type PriceTable, type StreamCount, type Term, type Tier } from '@/lib/pricing';

/** Icon per plan feature (Lucide, Outline Premium). */
const FEATURE_ICONS: Record<string, LucideIcon> = {
  tv: Tv,
  news: Newspaper,
  sport: Trophy,
  globe: Globe,
  film: Clapperboard,
  quality: BadgeCheck,
  shield: ShieldCheck,
  zap: Zap,
  guide: CalendarClock,
  replay: History,
  device: MonitorSmartphone,
  support: Headset,
};

/** Renders "Quality **4K**" with the starred part in bold. */
function richText(text: string) {
  return text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}

/** Channel / movie counts: shown only once confirmed in src/config/catalogue.ts. */
function catalogueLines(tier: Tier, p: Dictionary['plans'], locale: Locale) {
  const c = CATALOGUE[tier];
  const n = (v: number) => new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale).format(v);
  const lines: { key: string; Icon: LucideIcon; text: string }[] = [];
  if (c.channels) lines.push({ key: 'channels', Icon: RadioTower, text: fill(p.catalogueChannels, { n: n(c.channels) }) });
  if (c.vod) lines.push({ key: 'vod', Icon: Film, text: fill(p.catalogueVod, { n: n(c.vod) }) });
  return lines;
}

/** Plan identity: icon + artwork (artwork can be replaced by generated images later). */
const TIER_LOOK: Record<Tier, { Icon: LucideIcon }> = {
  starter: { Icon: MonitorPlay },
  plus: { Icon: Crown },
  ultra: { Icon: Gem },
};
/** Generated plan artwork (npm run hero → public/images/plan-<tier>-<w>.avif|webp). */
const PLAN_ART_SIZES = '(max-width: 900px) 90vw, 30vw';
const planSrcSet = (tier: Tier, ext: 'avif' | 'webp') => `/images/plan-${tier}-480.${ext} 480w, /images/plan-${tier}-960.${ext} 960w`;

/** Left-hand points of the simulator (icon colour = official category colour). */
const SIM_POINTS: { Icon: LucideIcon; cat: string }[] = [
  { Icon: Zap, cat: 'sports' },
  { Icon: MonitorSmartphone, cat: 'live' },
  { Icon: ShieldCheck, cat: 'live' },
  { Icon: Rocket, cat: 'movies' },
];

/** Durations offered in the simulator (Lifetime removed, owner decision 12/11/2026). */
const SIM_TERMS = TERMS.filter((t) => t !== 'lifetime');

const loadDialog = () => import('./CheckoutDialog').then((m) => m.CheckoutDialog);
// Downloaded on demand (prefetched on hover/focus of the button) to keep the initial JS small.
const CheckoutDialog = dynamic(loadDialog, { ssr: false });

export interface ConfiguratorProps {
  locale: Locale;
  table: PriceTable;
  dict: Pick<Dictionary, 'plans' | 'common' | 'markets' | 'checkout'>;
  /** Rendered between the plan cards and the simulator (server-rendered content). */
  children?: ReactNode;
}

export function PlanConfigurator({ locale, table, dict, children }: ConfiguratorProps) {
  const [tier, setTier] = useState<Tier>('plus');
  const [term, setTerm] = useState<Term>('12m');
  const [streams, setStreams] = useState<StreamCount>(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const offersRef = useRef<HTMLDivElement>(null);
  // Marks the island as hydrated (it is hydrated lazily, when near the viewport).
  useEffect(() => offersRef.current?.setAttribute('data-ready', 'true'), []);
  const openerRef = useRef<HTMLButtonElement>(null);
  const simulatorRef = useRef<HTMLDivElement>(null);

  const p = dict.plans;
  const money = (minor: number) => formatMoney(minor, table.currency, locale);
  const quote = computeQuote(table, { tier, term, streams });
  const tierName = p.tiers[tier].name;
  // Claims shown next to the simulator are computed from the price list, so they stay true.
  const bestPct = Math.max(...TIERS.map((t) => computeQuote(table, { tier: t, term: '36m', streams: 1 }).savingsPercent));
  const selectionLabel = `${tierName} · ${p.terms[term]} · ${plural(dict.common, 'device', streams)}`;

  function choose(t: Tier) {
    setTier(t);
    simulatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    simulatorRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className="offers" ref={offersRef}>
      {/* 1. The three yearly plans */}
      <ul className="tier-grid" data-reveal suppressHydrationWarning>
        {TIERS.map((t) => {
          const yearly = computeQuote(table, { tier: t, term: '12m', streams: 1 });
          const info = p.tiers[t];
          const TierIcon = TIER_LOOK[t].Icon;
          return (
            <li key={t} className={`tier-card${t === 'plus' ? ' is-recommended' : ''}`} data-tier={t}>
              {t === 'plus' && (
                <span className="tier-badge">
                  <Star size={13} strokeWidth={2.5} aria-hidden="true" /> {p.recommended}
                </span>
              )}
              <picture>
                <source type="image/avif" srcSet={planSrcSet(t, 'avif')} sizes={PLAN_ART_SIZES} />
                <source type="image/webp" srcSet={planSrcSet(t, 'webp')} sizes={PLAN_ART_SIZES} />
                <img className="tier-art" src={`/images/plan-${t}-480.webp`} alt="" width={1672} height={941} loading="lazy" decoding="async" />
              </picture>
              <div className="tier-head">
                <span className="tier-icon" aria-hidden="true">
                  <TierIcon size={30} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="tier-name">{info.name}</h3>
                  <p className="tier-tagline">{info.tagline}</p>
                </div>
              </div>
              <p className="tier-price">
                <span data-testid={`tier-price-${t}`}>{money(yearly.amountMinor)}</span> <small>{p.perYear}</small>
              </p>
              <div className="tier-pills">
                {yearly.monthlyEquivalentMinor !== null && (
                  <p className="tier-monthly">{fill(dict.common.perMonth, { price: money(yearly.monthlyEquivalentMinor) })}</p>
                )}
                {t !== 'starter' && <span className="tier-bonus">{p.bonus}</span>}
              </div>
              <ul className="tier-features">
                {catalogueLines(t, p, locale).map((line) => (
                  <li key={line.key} className="is-accent" data-testid={`catalogue-${line.key}-${t}`}>
                    <line.Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span>{richText(line.text)}</span>
                  </li>
                ))}
                {info.features.map((f) => {
                  const Icon = FEATURE_ICONS[f.icon] ?? Check;
                  return (
                    <li key={f.text} className={'accent' in f && f.accent ? 'is-accent' : undefined}>
                      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                      <span>{richText(f.text)}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="tier-note">{info.note}</p>
              <button type="button" className="btn block" onClick={() => choose(t)}>
                {fill(p.choose, { plan: info.name })}
              </button>
            </li>
          );
        })}
      </ul>

      {children}

      {/* 2. Simulator: text on the left (40%), card on the right (60%) */}
      <div className="sim-layout" ref={simulatorRef} tabIndex={-1} data-tier={tier}>
        <div className="sim-intro">
          <div className="eyebrow">{p.simulatorEyebrow}</div>
          <h3 id="simulator-title" className="sim-title">
            {p.simulatorTitleA} <span className="hl">{fill(p.simulatorTitleB, { pct: bestPct })}</span>
          </h3>
          <p className="sim-sub">{p.simulatorSub}</p>
          <ul className="sim-points">
            {SIM_POINTS.map(({ Icon, cat }, i) => (
              <li key={i} className={`cat-${cat}`}>
                <span className="icon-box sm" aria-hidden="true">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <span>{fill(p.simulatorPoints[i]!, { pct: bestPct })}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card config simulator" data-testid="configurator" aria-labelledby="simulator-title">
          <div className="field-title" id="tier-label"><span className="step-num" aria-hidden="true">1</span>{p.tierLabel}</div>
          <div className="choices choices-3" role="group" aria-labelledby="tier-label">
            {TIERS.map((t) => {
              const Icon = TIER_LOOK[t].Icon;
              return (
                <button key={t} type="button" className="choice choice-rich" data-tier={t} aria-pressed={t === tier} onClick={() => setTier(t)}>
                  <Icon className="choice-icon" size={28} strokeWidth={1.75} aria-hidden="true" />
                  <span className="choice-text">
                    <b>{p.tiers[t].name}</b>
                    <small>{p.tiers[t].tagline}</small>
                  </span>
                  {t === tier && <CircleCheck className="choice-check" size={22} strokeWidth={2} aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div className="field-title" id="term-label"><span className="step-num" aria-hidden="true">2</span>{p.termLabel}</div>
          <div className="choices choices-terms" role="group" aria-labelledby="term-label">
            {SIM_TERMS.map((tm) => {
              const q = computeQuote(table, { tier, term: tm, streams });
              const Icon = CalendarDays;
              return (
                <button key={tm} type="button" className="choice choice-rich choice-term" data-term={tm} aria-pressed={tm === term} onClick={() => setTerm(tm)}>
                  {q.savingsPercent > 0 && <span className="choice-badge">{fill(p.savePct, { pct: q.savingsPercent })}</span>}
                  <Icon className="choice-icon" size={24} strokeWidth={1.75} aria-hidden="true" />
                  <span className="choice-text">
                    <b>{p.terms[tm]}</b>
                  </span>
                  {tm === term && <CircleCheck className="choice-check" size={20} strokeWidth={2} aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div className="field-title" id="streams-label"><span className="step-num" aria-hidden="true">3</span>{p.streamsLabel}</div>
          <div className="choices" role="group" aria-labelledby="streams-label">
            {STREAMS.map((n) => {
              const extra = computeQuote(table, { tier, term, streams: n }).amountMinor - computeQuote(table, { tier, term, streams: 1 }).amountMinor;
              return (
                <button key={n} type="button" className="choice choice-rich choice-term" data-stream={n} aria-pressed={n === streams} onClick={() => setStreams(n)}>
                  <span className="dev-stack" aria-hidden="true">
                    {Array.from({ length: n }, (_, i) => (
                      <Monitor key={i} size={22} strokeWidth={1.75} />
                    ))}
                  </span>
                  <span className="choice-text">
                    <b>{plural(dict.common, 'device', n)}</b>
                    <small className="choice-note">{n === 1 ? p.included : `+${money(extra)}`}</small>
                  </span>
                  {n === streams && <CircleCheck className="choice-check" size={20} strokeWidth={2} aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div className="summary sim-summary">
            <div className="sum-left">
              <small className="label">{p.summaryLabel}</small>
              <strong data-testid="selection">{selectionLabel}</strong>
              {quote.referenceMinor && quote.savingsMinor > 0 && (
                <small className="savings" data-testid="savings">
                  {fill(p.savings, { amount: money(quote.savingsMinor), pct: quote.savingsPercent, n: (TERM_MONTHS[term] ?? 12) / 12 })}
                </small>
              )}
            </div>
            <div className="sum-price">
              <small className="label">{quote.savingsMinor > 0 ? p.finalPrice : p.totalLabel}</small>
              {quote.referenceMinor !== null && quote.savingsMinor > 0 && (
                <s className="price-was" data-testid="regular-price">
                  <span className="sr-only">{p.regularPrice}: </span>
                  {money(quote.referenceMinor)}
                </s>
              )}
              <div className="price" data-testid="price" aria-live="polite">{money(quote.amountMinor)}</div>
              <span className="price-sub">
                {quote.monthlyEquivalentMinor !== null
                  ? fill(dict.common.perMonth, { price: money(quote.monthlyEquivalentMinor) })
                  : p.oneTime}
              </span>
            </div>
            <button
              ref={openerRef}
              type="button"
              className="btn sim-cta"
              onClick={() => setCheckoutOpen(true)}
              onPointerEnter={() => void loadDialog()}
              onFocus={() => void loadDialog()}
              aria-haspopup="dialog"
            >
              {p.previewCheckout} <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutDialog
          locale={locale}
          dict={dict}
          selection={{ tier, term, streams }}
          clientPrice={money(quote.amountMinor)}
          onClose={() => {
            setCheckoutOpen(false);
            requestAnimationFrame(() => openerRef.current?.focus());
          }}
        />
      )}
    </div>
  );
}
