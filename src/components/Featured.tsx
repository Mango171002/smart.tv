'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { fill, type Dictionary } from '@/i18n/dictionaries';
import { FEATURED_SCENES } from '@/components/visuals/featured-scenes';

/** Badge colour follows the category system (item.cat): sports = lime, movies/series = magenta… */

export function Featured({ locale, dict }: { locale: Locale; dict: Dictionary['featured'] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const total = dict.items.length;

  const goTo = useCallback((i: number) => {
    const el = track.current;
    const slide = el?.children[i] as HTMLElement | undefined;
    if (!el || !slide) return;
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    setReady(true); // interactive (hydrated)
    const onScroll = () => {
      const slides = Array.from(el.children) as HTMLElement[];
      // At the end of the track the last slide can never reach the left edge.
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
        setActive(slides.length - 1);
        return;
      }
      const left = el.scrollLeft + el.offsetLeft;
      let best = 0;
      slides.forEach((s, i) => {
        if (Math.abs(s.offsetLeft - left) < Math.abs((slides[best]?.offsetLeft ?? 0) - left)) best = i;
      });
      setActive(best);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="featured" aria-labelledby="featured-title">
      <div className="wrap">
        <div className="featured-head">
          <h2 id="featured-title" className="bar-title">{dict.title}</h2>
          <Link className="see-all" href={`/${locale}/coverage`}>
            {dict.seeAll} <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
        <div className="carousel" role="region" aria-roledescription="carousel" aria-label={dict.carouselLabel} data-ready={ready || undefined} data-fits={total <= 4 || undefined}>
          <button
            type="button"
            className="carousel-btn prev"
            aria-label={dict.prev}
            aria-controls="featured-track"
            onClick={() => goTo(Math.max(0, active - 1))}
            disabled={active === 0}
          >
            <ChevronLeft size={22} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <div id="featured-track" className="carousel-track" ref={track} tabIndex={0} aria-label={dict.carouselLabel}>
            {dict.items.map((item, i) => (
              <div
                key={item.title}
                className={`slide cat-${item.cat}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${fill(dict.slideLabel, { n: i + 1, total })} — ${item.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- static decorative SVG */}
                <img src={`/visuals/featured-${FEATURED_SCENES[i]}.svg`} alt="" width={480} height={270} loading="lazy" decoding="async" />
                <span className="slide-badge">{item.badge}</span>
                <span className="slide-text">
                  <span className="slide-title">{item.title}</span>
                  <span className="slide-region">{item.region}</span>
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="carousel-btn next"
            aria-label={dict.next}
            aria-controls="featured-track"
            onClick={() => goTo(Math.min(total - 1, active + 1))}
            disabled={active === total - 1}
          >
            <ChevronRight size={22} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
        <div className="dots" data-fits={total <= 4 || undefined}>
          {dict.items.map((item, i) => (
            <button
              key={item.title}
              type="button"
              className="dot"
              aria-label={fill(dict.slideLabel, { n: i + 1, total })}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <p className="footnote" style={{ textAlign: 'center' }}>{dict.note}</p>
      </div>
    </section>
  );
}
