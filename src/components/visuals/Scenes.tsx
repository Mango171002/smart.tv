/**
 * Original illustrations for the home page (ELECTRIC FUSION NEON palette).
 * Everything is drawn here: no photos, no people, no logos, no third-party titles.
 * Rendered to static files in /public/visuals by `npm run visuals`.
 */
import type { ReactElement } from 'react';

const C = {
  bg: '#070d17',
  surface: '#121e2d',
  cyan: '#19d3f3',
  lime: '#d1fe17',
  magenta: '#f044c4',
  violet: '#6878ff',
  ink: '#f5f8ff',
  muted: '#9dadc3',
};

/** Night stadium: sky glow, floodlights, stands and pitch lines (shared by several scenes). */
function Stadium({ id, w, h }: { id: string; w: number; h: number }) {
  const horizon = h * 0.55;
  const lights = Array.from({ length: 14 }, (_, i) => i);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.bg} />
          <stop offset="0.55" stopColor="#1a1f4a" />
          <stop offset="1" stopColor={C.bg} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.35" r="0.6">
          <stop offset="0" stopColor={C.violet} stopOpacity="0.55" />
          <stop offset="0.5" stopColor={C.magenta} stopOpacity="0.12" />
          <stop offset="1" stopColor={C.bg} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-pitch`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f3a1c" />
          <stop offset="1" stopColor="#0d1a12" />
        </linearGradient>
        <radialGradient id={`${id}-lamp`}>
          <stop offset="0" stopColor={C.ink} />
          <stop offset="0.3" stopColor={C.cyan} stopOpacity="0.8" />
          <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}-sky)`} />
      <rect width={w} height={h} fill={`url(#${id}-glow)`} />
      {/* floodlight rows */}
      {lights.map((i) => {
        const x = (w / 13) * i;
        const y = h * 0.16 + Math.sin(i * 1.3) * h * 0.03;
        return <circle key={i} cx={x} cy={y} r={h * 0.035} fill={`url(#${id}-lamp)`} />;
      })}
      {/* light beams */}
      <path d={`M${w * 0.15} ${h * 0.16} L${w * 0.32} ${horizon} L${w * 0.2} ${horizon} Z`} fill={C.ink} opacity="0.05" />
      <path d={`M${w * 0.85} ${h * 0.16} L${w * 0.68} ${horizon} L${w * 0.8} ${horizon} Z`} fill={C.ink} opacity="0.05" />
      {/* stands with crowd dots */}
      <path d={`M0 ${h * 0.34} Q${w / 2} ${h * 0.24} ${w} ${h * 0.34} L${w} ${horizon} L0 ${horizon} Z`} fill="#0b1224" />
      {/* crowd: 90 dots drawn as 4 paths (one per colour) to keep the DOM small */}
      {[C.cyan, C.magenta, C.violet, C.muted].map((col, k) => {
        const r = h * 0.004 + 0.4;
        let d = '';
        for (let i = k; i < 90; i += 4) {
          const x = (((i * 37) % 100) / 100) * w;
          const y = h * 0.36 + (((i * 53) % 100) / 100) * (horizon - h * 0.38);
          d += `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(2 * r).toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-2 * r).toFixed(2)} 0`;
        }
        return <path key={col} d={d} fill={col} opacity="0.55" />;
      })}
      {/* pitch */}
      <path d={`M${-w * 0.1} ${h} L${w * 0.18} ${horizon} L${w * 0.82} ${horizon} L${w * 1.1} ${h} Z`} fill={`url(#${id}-pitch)`} />
      <g fill="none" stroke={C.lime} strokeOpacity="0.45" strokeWidth={h * 0.006}>
        <path d={`M${w * 0.5} ${horizon} L${w * 0.5} ${h}`} />
        <ellipse cx={w * 0.5} cy={h * 0.8} rx={w * 0.12} ry={h * 0.06} />
        <path d={`M${w * 0.18} ${horizon} L${w * 0.82} ${horizon}`} />
      </g>
    </g>
  );
}




/** "Featured" carousel artwork — four original genre scenes. */
export function FeaturedArt({ index }: { index: number }) {
  const w = 480;
  const h = 270;
  let art: ReactElement;
  if (index === 0) {
    // Football night match
    art = (
      <>
        <Stadium id="f0" w={w} h={h} />
        <g transform={`translate(${w / 2} ${h * 0.7})`} fill="none" stroke={C.ink} strokeWidth="2.5">
          <circle r="26" fill={C.bg} fillOpacity="0.4" />
          <path d="M0 -10 L10 -3 L6 9 L-6 9 L-10 -3 Z" fill={C.ink} />
          <path d="M0 -10 L0 -26 M10 -3 L24 -9 M6 9 L15 21 M-6 9 L-15 21 M-10 -3 L-24 -9" />
        </g>
      </>
    );
  } else if (index === 1) {
    // Basketball arena
    art = (
      <>
        <defs>
          <radialGradient id="f1g" cx="0.5" cy="0.2" r="0.8">
            <stop offset="0" stopColor={C.violet} stopOpacity="0.5" />
            <stop offset="1" stopColor={C.bg} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={w} height={h} fill={C.bg} />
        <rect width={w} height={h} fill="url(#f1g)" />
        <path d={`M0 ${h} L${w * 0.2} ${h * 0.6} L${w * 0.8} ${h * 0.6} L${w} ${h} Z`} fill="#1a1530" />
        <g fill="none" stroke={C.magenta} strokeOpacity="0.6" strokeWidth="2">
          <path d={`M${w * 0.35} ${h * 0.6} L${w * 0.3} ${h} M${w * 0.65} ${h * 0.6} L${w * 0.7} ${h}`} />
          <ellipse cx={w / 2} cy={h * 0.82} rx="70" ry="22" />
        </g>
        {/* backboard + hoop */}
        <rect x={w * 0.62} y={h * 0.12} width="90" height="60" rx="4" fill="none" stroke={C.ink} strokeWidth="2.5" opacity="0.85" />
        <rect x={w * 0.62 + 30} y={h * 0.12 + 22} width="30" height="22" fill="none" stroke={C.ink} strokeWidth="2" opacity="0.85" />
        <ellipse cx={w * 0.62 + 45} cy={h * 0.12 + 66} rx="22" ry="6" fill="none" stroke={C.magenta} strokeWidth="3" />
        <path d={`M${w * 0.62 + 23} ${h * 0.12 + 66} L${w * 0.62 + 32} ${h * 0.12 + 96} L${w * 0.62 + 58} ${h * 0.12 + 96} L${w * 0.62 + 67} ${h * 0.12 + 66}`} fill="none" stroke={C.ink} strokeWidth="1.5" opacity="0.6" />
        {/* ball */}
        <g transform={`translate(${w * 0.36} ${h * 0.5})`} fill="none" stroke={C.lime} strokeWidth="2.5">
          <circle r="30" fill="#1a1530" />
          <path d="M-30 0 H30 M0 -30 V30 M-21 -21 Q0 0 -21 21 M21 -21 Q0 0 21 21" />
        </g>
      </>
    );
  } else if (index === 2) {
    // Adventure film: alien ocean world at dusk
    art = (
      <>
        <defs>
          <linearGradient id="f2s" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a1a3a" />
            <stop offset="0.6" stopColor="#11407a" />
            <stop offset="1" stopColor={C.bg} />
          </linearGradient>
        </defs>
        <rect width={w} height={h} fill="url(#f2s)" />
        <circle cx={w * 0.72} cy={h * 0.3} r="46" fill={C.cyan} opacity="0.25" />
        <circle cx={w * 0.72} cy={h * 0.3} r="28" fill={C.cyan} opacity="0.5" />
        <path d={`M0 ${h * 0.68} Q${w * 0.25} ${h * 0.55} ${w * 0.5} ${h * 0.66} T${w} ${h * 0.62} L${w} ${h} L0 ${h} Z`} fill="#06233f" />
        <path d={`M0 ${h * 0.8} Q${w * 0.3} ${h * 0.7} ${w * 0.6} ${h * 0.8} T${w} ${h * 0.78} L${w} ${h} L0 ${h} Z`} fill={C.bg} />
        {[...Array(30)].map((_, i) => (
          <circle key={i} cx={(i * 61) % w} cy={h * 0.62 + ((i * 29) % 60)} r="1.6" fill={C.cyan} opacity="0.7" />
        ))}
        <path d={`M${w * 0.2} ${h * 0.35} q20 -14 40 0 q-20 -4 -40 0 Z`} fill={C.ink} opacity="0.75" />
      </>
    );
  } else {
    // Fantasy series: glowing dragon eye
    art = (
      <>
        <defs>
          <radialGradient id="f3e" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={C.lime} />
            <stop offset="0.35" stopColor={C.magenta} />
            <stop offset="1" stopColor="#2a0f2a" />
          </radialGradient>
        </defs>
        <rect width={w} height={h} fill="#120a18" />
        {[...Array(40)].map((_, i) => (
          <path
            key={i}
            d={`M${(i % 8) * 64 - 10} ${Math.floor(i / 8) * 60} l30 18 l-30 18 l-30 -18 Z`}
            fill="none"
            stroke={C.magenta}
            strokeOpacity="0.18"
          />
        ))}
        <path d={`M${w * 0.25} ${h * 0.5} Q${w * 0.5} ${h * 0.15} ${w * 0.75} ${h * 0.5} Q${w * 0.5} ${h * 0.85} ${w * 0.25} ${h * 0.5} Z`} fill="url(#f3e)" />
        <ellipse cx={w * 0.5} cy={h * 0.5} rx="9" ry="44" fill="#070d17" />
        <path d={`M${w * 0.25} ${h * 0.5} Q${w * 0.5} ${h * 0.15} ${w * 0.75} ${h * 0.5}`} fill="none" stroke={C.ink} strokeOpacity="0.4" strokeWidth="2" />
      </>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w} ${h}`}>
      {art}
    </svg>
  );
}

/** Right-side artwork for the four category cards. */
export function CategoryArt({ category }: { category: 'sports' | 'movies' | 'live' | 'streaming' }) {
  const w = 240;
  const h = 160;
  let art: ReactElement;
  if (category === 'sports') {
    art = <Stadium id="cs" w={w} h={h} />;
  } else if (category === 'movies') {
    art = (
      <g transform="rotate(-18 150 70)" fill="none" stroke={C.magenta} strokeWidth="3" strokeOpacity="0.85">
        <rect x="60" y="30" width="200" height="70" rx="4" fill={C.magenta} fillOpacity="0.08" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <g key={i}>
            <rect x={68 + i * 24} y="36" width="12" height="8" rx="2" />
            <rect x={68 + i * 24} y="86" width="12" height="8" rx="2" />
          </g>
        ))}
        <rect x="74" y="50" width="52" height="30" rx="3" />
        <rect x="134" y="50" width="52" height="30" rx="3" />
        <rect x="194" y="50" width="52" height="30" rx="3" />
      </g>
    );
  } else if (category === 'live') {
    art = (
      <g>
        <defs>
          <radialGradient id="cl" cx="0.4" cy="0.4" r="0.7">
            <stop offset="0" stopColor={C.cyan} stopOpacity="0.35" />
            <stop offset="1" stopColor={C.bg} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="170" cy="70" r="62" fill="url(#cl)" />
        <g fill="none" stroke={C.cyan} strokeOpacity="0.7" strokeWidth="1.5">
          <circle cx="170" cy="70" r="56" />
          <ellipse cx="170" cy="70" rx="22" ry="56" />
          <ellipse cx="170" cy="70" rx="42" ry="56" />
          <path d="M114 70 H226 M122 42 H218 M122 98 H218" />
        </g>
        {[...Array(18)].map((_, i) => (
          <circle key={i} cx={140 + ((i * 23) % 60)} cy={40 + ((i * 17) % 60)} r="1.6" fill={C.ink} opacity="0.8" />
        ))}
      </g>
    );
  } else {
    art = (
      <g fill="none" strokeWidth="3">
        <rect x="120" y="22" width="80" height="112" rx="10" transform="rotate(14 160 78)" stroke={C.violet} fill={C.violet} fillOpacity="0.12" />
        <rect x="186" y="56" width="44" height="86" rx="9" transform="rotate(14 208 99)" stroke={C.cyan} fill={C.cyan} fillOpacity="0.1" />
      </g>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w} ${h}`}>
      {art}
    </svg>
  );
}

/** Every static visual file, generated by `npm run visuals` and checked by unit tests. */
export const SCENE_FILES: Record<string, () => ReactElement> = {
  'featured-0.svg': () => <FeaturedArt index={0} />,
  'featured-1.svg': () => <FeaturedArt index={1} />,
  'featured-2.svg': () => <FeaturedArt index={2} />,
  'featured-3.svg': () => <FeaturedArt index={3} />,
  'cat-sports.svg': () => <CategoryArt category="sports" />,
  'cat-movies.svg': () => <CategoryArt category="movies" />,
  'cat-live.svg': () => <CategoryArt category="live" />,
  'cat-streaming.svg': () => <CategoryArt category="streaming" />,
};
