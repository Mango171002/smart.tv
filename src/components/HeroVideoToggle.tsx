'use client';

import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Pause / play button for the banner videos (WCAG 2.2.2). It also starts them when the
 * browser refused to autoplay (e.g. iPhone Low Power Mode): the first tap plays them.
 */
/**
 * Each banner video carries its files as data attributes; only ONE file is fetched, chosen
 * here (phones: the light 960 px MP4; other screens: WebM if supported, else MP4).
 */
function ensureSrc(v: HTMLVideoElement) {
  if (v.getAttribute('src')) return;
  const d = v.dataset;
  const src = window.matchMedia('(max-width: 900px)').matches ? d.srcSm : v.canPlayType('video/webm') ? d.srcWebm : d.srcMp4;
  if (src) v.src = src;
}

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
    let t3 = 0;
    const startAll = () => {
      const [first, ...rest] = videos;
      if (first) { ensureSrc(first); first.preload = 'auto'; void first.play().catch(() => undefined); }
      t2 = window.setTimeout(
        () =>
          rest.forEach((v) => {
            // Hidden banners get their poster late, so it does not compete with the first paint.
            if (v.dataset.poster && !v.poster) v.poster = v.dataset.poster;
            ensureSrc(v);
            v.preload = 'auto';
            void v.play().catch(() => undefined);
          }),
        3000,
      );
    };
    const kick = () => {
      // Wait a little after load: the poster stays on screen while the page settles.
      t3 = window.setTimeout(() => {
        if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(startAll, { timeout: 2000 });
        else startAll();
      }, 2500);
    };
    if (document.readyState === 'complete') kick();
    else window.addEventListener('load', kick, { once: true });
    const t = window.setTimeout(sync, 8000); // autoplay refused → show "play"
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
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
      videos.forEach((v) => {
        ensureSrc(v);
        if (v.dataset.poster && !v.poster) v.poster = v.dataset.poster;
        void v.play().catch(() => undefined);
      });
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
