'use client';

import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Pause / play button for the banner videos (WCAG 2.2.2). It also starts them when the
 * browser refused to autoplay (e.g. iPhone Low Power Mode): the first tap plays them.
 */
export function HeroVideoToggle({ pauseLabel, playLabel }: { pauseLabel: string; playLabel: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const stage = ref.current?.closest('.hero')?.querySelector('.hero-stage');
    const videos = Array.from(stage?.querySelectorAll('video') ?? []);
    const sync = () => setPlaying(videos.some((v) => !v.paused));
    videos.forEach((v) => {
      v.addEventListener('play', sync);
      v.addEventListener('pause', sync);
    });
    // Performance: the videos are not downloaded with the page (preload="none", no autoplay), so the
    // poster image paints first. Once the page has loaded and the browser is idle, the first video
    // starts; the next ones are fetched a few seconds later, before their turn in the cross-fade.
    let t2 = 0;
    const startAll = () => {
      const [first, ...rest] = videos;
      if (first) { first.preload = 'auto'; void first.play().catch(() => undefined); }
      t2 = window.setTimeout(
        () =>
          rest.forEach((v) => {
            // Hidden banners get their poster late, so it does not compete with the first paint.
            if (v.dataset.poster && !v.poster) v.poster = v.dataset.poster;
            v.preload = 'auto';
            void v.play().catch(() => undefined);
          }),
        3000,
      );
    };
    const kick = () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(startAll, { timeout: 2500 });
      else setTimeout(startAll, 1200);
    };
    if (document.readyState === 'complete') kick();
    else window.addEventListener('load', kick, { once: true });
    const t = window.setTimeout(sync, 8000); // autoplay refused → show "play"
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      window.removeEventListener('load', kick);
      videos.forEach((v) => {
        v.removeEventListener('play', sync);
        v.removeEventListener('pause', sync);
      });
    };
  }, []);

  const toggle = () => {
    const stage = ref.current?.closest('.hero')?.querySelector('.hero-stage');
    const videos = Array.from(stage?.querySelectorAll('video') ?? []);
    if (playing) {
      videos.forEach((v) => v.pause());
      stage?.classList.add('is-paused');
      setPlaying(false);
    } else {
      videos.forEach((v) => void v.play().catch(() => undefined));
      stage?.classList.remove('is-paused');
      setPlaying(true);
    }
  };

  return (
    <button ref={ref} type="button" className="hero-pause" onClick={toggle} aria-label={playing ? pauseLabel : playLabel}>
      {playing ? <Pause size={18} strokeWidth={2} aria-hidden="true" /> : <Play size={18} strokeWidth={2} aria-hidden="true" />}
    </button>
  );
}
