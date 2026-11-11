/**
 * Original illustrations for the home page (ELECTRIC FUSION NEON palette).
 * Everything is drawn here: no photos, no people, no logos, no third-party titles.
 * Rendered to static files in /public/visuals by `npm run visuals`.
 */
import type { ReactElement } from 'react';
import { FEATURED_SCENES, type FeaturedScene } from './featured-scenes';

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




/** Shared backdrop: dark gradient with a coloured glow. */
function Glow({ id, w, h, col, cx = 0.5, cy = 0.3, top = C.bg, bottom = C.bg }: { id: string; w: number; h: number; col: string; cx?: number; cy?: number; top?: string; bottom?: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <radialGradient id={`${id}-gl`} cx={cx} cy={cy} r="0.7">
          <stop offset="0" stopColor={col} stopOpacity="0.5" />
          <stop offset="1" stopColor={col} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}-bg)`} />
      <rect width={w} height={h} fill={`url(#${id}-gl)`} />
    </>
  );
}


/** "Most watched" carousel artwork — original genre scenes (no teams, logos or titles). */
export function FeaturedArt({ scene }: { scene: FeaturedScene }) {
  const w = 480;
  const h = 270;
  let art: ReactElement;
  switch (scene) {
    case 'football':
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
      break;
    case 'american-football':
      art = (
        <>
          <Stadium id="f4" w={w} h={h} />
          {/* goal post */}
          <g fill="none" stroke={C.lime} strokeWidth="4" strokeLinecap="round">
            <path d={`M${w * 0.72} ${h * 0.92} V${h * 0.6} M${w * 0.62} ${h * 0.6} H${w * 0.82} M${w * 0.62} ${h * 0.6} V${h * 0.3} M${w * 0.82} ${h * 0.6} V${h * 0.3}`} />
          </g>
          {/* oval ball */}
          <g transform={`translate(${w * 0.36} ${h * 0.68}) rotate(-28)`}>
            <ellipse rx="42" ry="24" fill="#3a2a1c" stroke={C.ink} strokeWidth="2.5" />
            <path d="M-16 0 H16 M-10 -5 V5 M-3 -5 V5 M4 -5 V5 M11 -5 V5" stroke={C.ink} strokeWidth="2" />
          </g>
        </>
      );
      break;
    case 'hockey':
      art = (
        <>
          <Glow id="f5" w={w} h={h} col={C.cyan} top="#0a1830" bottom="#0d2a3f" />
          {/* ice rink */}
          <path d={`M0 ${h} L${w * 0.14} ${h * 0.52} L${w * 0.86} ${h * 0.52} L${w} ${h} Z`} fill="#cfe9f5" opacity="0.12" />
          <g fill="none" stroke={C.cyan} strokeOpacity="0.7" strokeWidth="2">
            <path d={`M${w * 0.5} ${h * 0.52} L${w * 0.5} ${h}`} stroke={C.magenta} />
            <ellipse cx={w * 0.5} cy={h * 0.78} rx={w * 0.13} ry={h * 0.08} />
            <path d={`M${w * 0.3} ${h * 0.52} L${w * 0.24} ${h}`} />
            <path d={`M${w * 0.7} ${h * 0.52} L${w * 0.76} ${h}`} />
          </g>
          {/* stick + puck */}
          <path d={`M${w * 0.62} ${h * 0.18} L${w * 0.5} ${h * 0.74} q-2 10 -30 8`} fill="none" stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
          <ellipse cx={w * 0.36} cy={h * 0.84} rx="18" ry="6" fill={C.bg} stroke={C.ink} strokeWidth="2" />
          <path d={`M${w * 0.22} ${h * 0.84} h-40 M${w * 0.22} ${h * 0.8} h-28 M${w * 0.22} ${h * 0.88} h-28`} stroke={C.cyan} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </>
      );
      break;
    case 'basketball':
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
          <rect x={w * 0.62} y={h * 0.12} width="90" height="60" rx="4" fill="none" stroke={C.ink} strokeWidth="2.5" opacity="0.85" />
          <rect x={w * 0.62 + 30} y={h * 0.12 + 22} width="30" height="22" fill="none" stroke={C.ink} strokeWidth="2" opacity="0.85" />
          <ellipse cx={w * 0.62 + 45} cy={h * 0.12 + 66} rx="22" ry="6" fill="none" stroke={C.magenta} strokeWidth="3" />
          <path d={`M${w * 0.62 + 23} ${h * 0.12 + 66} L${w * 0.62 + 32} ${h * 0.12 + 96} L${w * 0.62 + 58} ${h * 0.12 + 96} L${w * 0.62 + 67} ${h * 0.12 + 66}`} fill="none" stroke={C.ink} strokeWidth="1.5" opacity="0.6" />
          <g transform={`translate(${w * 0.36} ${h * 0.5})`} fill="none" stroke={C.lime} strokeWidth="2.5">
            <circle r="30" fill="#1a1530" />
            <path d="M-30 0 H30 M0 -30 V30 M-21 -21 Q0 0 -21 21 M21 -21 Q0 0 21 21" />
          </g>
        </>
      );
      break;
    case 'adventure':
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
      break;
    case 'crime':
      art = (
        <>
          <Glow id="f6" w={w} h={h} col={C.magenta} cx={0.75} cy={0.2} top="#0b0a1c" bottom={C.bg} />
          {/* city skyline */}
          <path
            d={`M0 ${h} V${h * 0.62} h40 v-40 h30 v60 h26 v-90 h36 v70 h30 v-50 h44 v80 h28 v-110 h40 v100 h34 v-60 h30 v40 h46 v-30 h30 V${h} Z`}
            fill="#0d1428"
          />
          {[...Array(26)].map((_, i) => (
            <rect key={i} x={20 + ((i * 53) % (w - 40))} y={h * 0.5 + ((i * 37) % 80)} width="5" height="7" fill={i % 3 ? C.violet : C.lime} opacity="0.55" />
          ))}
          {/* magnifying glass */}
          <g transform={`translate(${w * 0.32} ${h * 0.36})`} fill="none" stroke={C.ink} strokeWidth="5" strokeLinecap="round">
            <circle r="34" fill={C.magenta} fillOpacity="0.12" stroke={C.magenta} />
            <path d="M24 24 L52 52" />
          </g>
          {/* police light bar */}
          <rect x={w * 0.64} y={h * 0.82} width="38" height="10" rx="3" fill={C.cyan} />
          <rect x={w * 0.64 + 40} y={h * 0.82} width="38" height="10" rx="3" fill={C.magenta} />
        </>
      );
      break;
    case 'fantasy':
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
      break;
    case 'comedy':
      art = (
        <>
          <Glow id="f7" w={w} h={h} col={C.magenta} cy={0.25} top="#1a0b22" bottom={C.bg} />
          {/* spotlight cone + stage */}
          <path d={`M${w * 0.5} 0 L${w * 0.72} ${h * 0.86} L${w * 0.28} ${h * 0.86} Z`} fill={C.ink} opacity="0.06" />
          <ellipse cx={w * 0.5} cy={h * 0.88} rx={w * 0.26} ry="16" fill={C.magenta} opacity="0.3" />
          {/* curtains */}
          <path d={`M0 0 H${w * 0.2} Q${w * 0.14} ${h * 0.5} ${w * 0.2} ${h} H0 Z`} fill="#3a0f33" />
          <path d={`M${w} 0 H${w * 0.8} Q${w * 0.86} ${h * 0.5} ${w * 0.8} ${h} H${w} Z`} fill="#3a0f33" />
          {/* microphone on stand */}
          <g stroke={C.ink} strokeWidth="4" strokeLinecap="round" fill="none">
            <path d={`M${w * 0.5} ${h * 0.42} V${h * 0.86} M${w * 0.44} ${h * 0.86} H${w * 0.56}`} />
          </g>
          <rect x={w * 0.5 - 12} y={h * 0.24} width="24" height="40" rx="12" fill={C.lime} />
          <path d={`M${w * 0.5 - 12} ${h * 0.34} h24 M${w * 0.5 - 12} ${h * 0.4} h24`} stroke={C.bg} strokeWidth="2" opacity="0.5" />
        </>
      );
      break;
    case 'tennis':
      art = (
        <>
          <Glow id="f8" w={w} h={h} col={C.lime} cy={0.15} top="#0b1a24" bottom="#0a2a2a" />
          {/* court */}
          <path d={`M${w * 0.1} ${h} L${w * 0.3} ${h * 0.45} L${w * 0.7} ${h * 0.45} L${w * 0.9} ${h} Z`} fill="#123a3a" />
          <g fill="none" stroke={C.ink} strokeOpacity="0.75" strokeWidth="2">
            <path d={`M${w * 0.1} ${h} L${w * 0.3} ${h * 0.45} L${w * 0.7} ${h * 0.45} L${w * 0.9} ${h}`} />
            <path d={`M${w * 0.5} ${h * 0.45} V${h}`} />
            <path d={`M${w * 0.22} ${h * 0.66} H${w * 0.78}`} />
          </g>
          {/* net */}
          <rect x={w * 0.17} y={h * 0.6} width={w * 0.66} height="16" fill={C.bg} opacity="0.6" />
          <path d={`M${w * 0.17} ${h * 0.6} H${w * 0.83}`} stroke={C.ink} strokeWidth="3" />
          {/* ball with motion trail */}
          <path d={`M${w * 0.15} ${h * 0.4} Q${w * 0.4} ${h * 0.05} ${w * 0.66} ${h * 0.26}`} fill="none" stroke={C.lime} strokeOpacity="0.4" strokeWidth="3" strokeDasharray="6 8" />
          <circle cx={w * 0.68} cy={h * 0.27} r="15" fill={C.lime} />
          <path d={`M${w * 0.68 - 15} ${h * 0.27} q15 -10 30 0`} fill="none" stroke={C.bg} strokeWidth="2" opacity="0.5" />
        </>
      );
      break;
    case 'motorsport':
      art = (
        <>
          <Glow id="f9" w={w} h={h} col={C.violet} cy={0.2} />
          {/* track with curbs */}
          <path d={`M0 ${h * 0.75} Q${w * 0.5} ${h * 0.45} ${w} ${h * 0.7} L${w} ${h} L0 ${h} Z`} fill="#151b2b" />
          <path d={`M0 ${h * 0.75} Q${w * 0.5} ${h * 0.45} ${w} ${h * 0.7}`} fill="none" stroke={C.ink} strokeWidth="6" strokeDasharray="18 18" opacity="0.7" />
          {/* speed lines */}
          {[0.3, 0.38, 0.46].map((y, i) => (
            <path key={y} d={`M${w * 0.08} ${h * y} H${w * (0.36 - i * 0.05)}`} stroke={i === 1 ? C.lime : C.cyan} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          ))}
          {/* generic race car silhouette */}
          <g transform={`translate(${w * 0.42} ${h * 0.5})`}>
            <path d="M0 26 L18 10 H70 L96 2 H150 L168 14 L196 18 V30 H0 Z" fill={C.magenta} />
            <path d="M84 2 L100 -10 H128 L136 2 Z" fill={C.bg} stroke={C.ink} strokeWidth="1.5" />
            <circle cx="40" cy="32" r="13" fill={C.bg} stroke={C.ink} strokeWidth="3" />
            <circle cx="160" cy="32" r="13" fill={C.bg} stroke={C.ink} strokeWidth="3" />
          </g>
          {/* chequered flag */}
          <g transform={`translate(${w * 0.82} ${h * 0.1})`}>
            <path d="M0 0 V70" stroke={C.ink} strokeWidth="3" />
            {[...Array(12)].map((_, i) => (
              <rect key={i} x={(i % 4) * 10} y={Math.floor(i / 4) * 10} width="10" height="10" fill={(i + Math.floor(i / 4)) % 2 ? C.bg : C.ink} />
            ))}
          </g>
        </>
      );
      break;
    case 'family':
      art = (
        <>
          <Glow id="f10" w={w} h={h} col={C.violet} cy={0.3} top="#101436" bottom={C.bg} />
          {/* stars */}
          {[...Array(24)].map((_, i) => (
            <circle key={i} cx={(i * 83) % w} cy={(i * 47) % (h * 0.55)} r={i % 4 ? 1.4 : 2.4} fill={C.ink} opacity="0.7" />
          ))}
          <circle cx={w * 0.78} cy={h * 0.24} r="26" fill={C.lime} opacity="0.85" />
          <circle cx={w * 0.8 + 10} cy={h * 0.2} r="24" fill="#101436" />
          {/* hills */}
          <path d={`M0 ${h * 0.8} Q${w * 0.25} ${h * 0.55} ${w * 0.55} ${h * 0.78} T${w} ${h * 0.72} V${h} H0 Z`} fill="#1c2252" />
          {/* friendly rocket */}
          <g transform={`translate(${w * 0.36} ${h * 0.5}) rotate(35)`}>
            <path d="M0 -50 Q22 -20 18 30 H-18 Q-22 -20 0 -50 Z" fill={C.ink} />
            <circle cy="-8" r="9" fill={C.cyan} stroke={C.violet} strokeWidth="3" />
            <path d="M-18 14 L-32 38 L-18 30 Z M18 14 L32 38 L18 30 Z" fill={C.magenta} />
            <path d="M-10 32 Q0 62 10 32 Z" fill={C.lime} />
          </g>
        </>
      );
      break;
    default:
      // Documentaries: mountains, northern lights and a wildlife silhouette
      art = (
        <>
          <Glow id="f11" w={w} h={h} col={C.cyan} cy={0.2} top="#081627" bottom={C.bg} />
          <path d={`M0 ${h * 0.3} Q${w * 0.3} ${h * 0.1} ${w * 0.55} ${h * 0.3} T${w} ${h * 0.22}`} fill="none" stroke={C.lime} strokeWidth="14" opacity="0.18" />
          <path d={`M0 ${h * 0.36} Q${w * 0.3} ${h * 0.16} ${w * 0.55} ${h * 0.36} T${w} ${h * 0.28}`} fill="none" stroke={C.cyan} strokeWidth="10" opacity="0.25" />
          <path d={`M0 ${h * 0.82} L${w * 0.2} ${h * 0.46} L${w * 0.34} ${h * 0.62} L${w * 0.52} ${h * 0.36} L${w * 0.74} ${h * 0.66} L${w * 0.86} ${h * 0.52} L${w} ${h * 0.7} V${h} H0 Z`} fill="#13243a" />
          <path d={`M${w * 0.47} ${h * 0.43} L${w * 0.52} ${h * 0.36} L${w * 0.57} ${h * 0.43} L${w * 0.53} ${h * 0.41} Z`} fill={C.ink} opacity="0.8" />
          <path d={`M0 ${h * 0.9} Q${w * 0.5} ${h * 0.78} ${w} ${h * 0.88} V${h} H0 Z`} fill={C.bg} />
          {/* deer silhouette */}
          <g transform={`translate(${w * 0.68} ${h * 0.68})`} fill={C.bg}>
            <path d="M0 0 h40 l6 -6 v-14 l6 -2 l2 6 v14 l-4 4 v26 h-5 v-22 h-30 v22 h-5 v-24 Z" />
            <path d="M48 -22 l-6 -14 m6 14 l4 -16 m-4 16" stroke={C.bg} strokeWidth="3" fill="none" />
          </g>
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
  ...Object.fromEntries(FEATURED_SCENES.map((scene) => [`featured-${scene}.svg`, () => <FeaturedArt scene={scene} />])),
  'cat-sports.svg': () => <CategoryArt category="sports" />,
  'cat-movies.svg': () => <CategoryArt category="movies" />,
  'cat-live.svg': () => <CategoryArt category="live" />,
  'cat-streaming.svg': () => <CategoryArt category="streaming" />,
};
