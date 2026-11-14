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
    const t = window.setTimeout(sync, 1500); // autoplay refused → show "play"
    return () => {
      window.clearTimeout(t);
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
