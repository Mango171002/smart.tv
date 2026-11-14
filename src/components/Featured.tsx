'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fill, type Dictionary } from '@/i18n/dictionaries';
import { FEATURED_SCENES } from '@/components/visuals/featured-scenes';

/** Generated artwork (npm run hero → public/images/featured-<scene>-<w>.avif|webp). */
const SLIDE_SIZES = '(max-width: 580px) 90vw, (max-width: 900px) 60vw, 34vw';
/** Portrait "Top 10" cards cut a vertical slice of the 16:9 artwork: horizontal focus per scene. */
const FOCUS: Record<string, string> = {
  football: '59%', adventure: '74%', hockey: '78%', family: '62%', 'american-football': '71%', crime: '93%',
  basketball: '38%', docs: '70%', tennis: '56%', fantasy: '82%', motorsport: '72%', comedy: '47%',
  animation: '80%', anime: '59%', 'family-fantasy': '50%',
};
const slideSrcSet = (scene: string, ext: 'avif' | 'webp') =>
  `/images/featured-${scene}-480.${ext}?v=20261114b 480w, /images/featured-${scene}-960.${ext}?v=20261114b 960w`;

/** Badge colour follows the category system (item.cat): sports = lime, movies/series = magenta… */

export function Featured({ dict }: { dict: Dictionary['featured'] }) {
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
    <section id="featured" className="featured" aria-labelledby="featured-title">
      <div className="wrap">
        <div className="featured-head">
          <h2 id="featured-title" className="bar-title">{dict.title}</h2>
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
                <picture>
                  <source type="image/avif" srcSet={slideSrcSet(FEATURED_SCENES[i]!, 'avif')} sizes={SLIDE_SIZES} />
                  <source type="image/webp" srcSet={slideSrcSet(FEATURED_SCENES[i]!, 'webp')} sizes={SLIDE_SIZES} />
                  { }
                  <img src={`/images/featured-${FEATURED_SCENES[i]}-480.webp?v=20261114b`} alt="" width={480} height={270} loading="lazy" decoding="async" style={{ objectPosition: `${FOCUS[FEATURED_SCENES[i]!] ?? '65%'} 50%` }} />
                </picture>
                {/* eslint-disable-next-line @next/next/no-img-element -- static vector logo */}
                <img className="slide-logo" src="/brand/sygma-logo.svg" alt="" width={308} height={40} loading="lazy" decoding="async" />
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
      </div>
    </section>
  );
}
