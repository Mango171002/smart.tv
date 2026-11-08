import { TallScreen, WideScreen } from './AppScreen';
import { P } from './palette';

/** Device frames wrapping the illustrative interface (pure CSS + SVG). */

export function TvFrame({ id, label }: { id: string; label?: string }) {
  return (
    <div className="mock-tv">
      <div className="mock-tv-screen">
        <WideScreen id={id} />
        {label && <span className="mock-tv-label">{label}</span>}
      </div>
      <div className="mock-tv-foot" />
    </div>
  );
}

export function LaptopFrame({ id }: { id: string }) {
  return (
    <div className="mock-laptop">
      <div className="mock-laptop-screen">
        <WideScreen id={id} />
      </div>
      <div className="mock-laptop-base" />
    </div>
  );
}

export function PhoneFrame({ id }: { id: string }) {
  return (
    <div className="mock-phone">
      <div className="mock-phone-screen">
        <TallScreen id={id} />
      </div>
    </div>
  );
}

/** Small line illustrations for the device category cards. */
export function DeviceIllustration({ kind }: { kind: 0 | 1 | 2 | 3 }) {
  const stroke = P.accent;
  const common = { fill: 'none', stroke, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 96 64" className="device-art" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`dv-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={P.heroStops[0]} />
          <stop offset="0.6" stopColor={P.heroStops[1]} />
          <stop offset="1" stopColor={P.heroStops[2]} />
        </linearGradient>
      </defs>
      {kind === 0 && (
        <>
          <rect x="10" y="6" width="76" height="44" rx="3" fill={`url(#dv-${kind})`} opacity="0.55" />
          <rect x="10" y="6" width="76" height="44" rx="3" {...common} />
          <path d="M38 58 h20 M48 50 v8" {...common} />
        </>
      )}
      {kind === 1 && (
        <>
          <rect x="12" y="22" width="44" height="14" rx="4" fill={`url(#dv-${kind})`} opacity="0.45" />
          <rect x="12" y="22" width="44" height="14" rx="4" {...common} />
          <circle cx="20" cy="29" r="1.6" fill={stroke} />
          <rect x="66" y="8" width="16" height="48" rx="8" {...common} />
          <circle cx="74" cy="20" r="4" {...common} />
          <path d="M71 34 h6 M71 40 h6 M71 46 h6" {...common} />
        </>
      )}
      {kind === 2 && (
        <>
          <rect x="14" y="8" width="40" height="50" rx="5" fill={`url(#dv-${kind})`} opacity="0.4" />
          <rect x="14" y="8" width="40" height="50" rx="5" {...common} />
          <rect x="60" y="16" width="22" height="42" rx="5" fill={`url(#dv-${kind})`} opacity="0.55" />
          <rect x="60" y="16" width="22" height="42" rx="5" {...common} />
          <path d="M68 20 h6" {...common} />
        </>
      )}
      {kind === 3 && (
        <>
          <rect x="18" y="8" width="60" height="38" rx="3" fill={`url(#dv-${kind})`} opacity="0.5" />
          <rect x="18" y="8" width="60" height="38" rx="3" {...common} />
          <path d="M8 54 h80 l-6 -8 h-68 z" {...common} />
        </>
      )}
    </svg>
  );
}

/** Abstract artwork for each content category (no titles, logos or rights-bearing imagery). */
export function CategoryArt({ index }: { index: number }) {
  const gold = P.accent;
  return (
    <svg viewBox="0 0 160 100" className="tile-art" aria-hidden="true" focusable="false" preserveAspectRatio="xMaxYMin slice">
      {index === 0 && (
        // Live TV — broadcast waves
        <g fill="none" stroke={gold} strokeLinecap="round">
          <circle cx="128" cy="30" r="5" fill={gold} stroke="none" />
          <path d="M116 18 a17 17 0 0 0 0 24 M140 18 a17 17 0 0 1 0 24" strokeWidth="2.5" opacity="0.8" />
          <path d="M106 8 a31 31 0 0 0 0 44 M150 8 a31 31 0 0 1 0 44" strokeWidth="2" opacity="0.5" />
          <path d="M96 -2 a45 45 0 0 0 0 64 M160 -2 a45 45 0 0 1 0 64" strokeWidth="1.5" opacity="0.25" />
        </g>
      )}
      {index === 1 && (
        // Movies — film strip + projector beam
        <g>
          <path d="M160 0 L70 70 L160 70 Z" fill={P.beam} opacity="0.08" />
          <g transform="rotate(-14 120 30)">
            <rect x="78" y="14" width="96" height="30" fill={P.screenBg} opacity="0.75" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <g key={i}>
                <rect x={82 + i * 12} y="17" width="6" height="4" rx="1" fill={gold} opacity="0.7" />
                <rect x={82 + i * 12} y="37" width="6" height="4" rx="1" fill={gold} opacity="0.7" />
              </g>
            ))}
            {[0, 1, 2].map((i) => (
              <rect key={i} x={84 + i * 30} y="23" width="26" height="12" rx="1.5" fill={P.heroStops[1]} opacity={0.5 + i * 0.15} />
            ))}
          </g>
        </g>
      )}
      {index === 2 && (
        // Series — stacked episodes
        <g>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={92 + i * 9} y={10 + i * 9} width="52" height="30" rx="4" fill="#0f4c5c" stroke={gold} strokeOpacity={0.25 + i * 0.2} opacity={0.5 + i * 0.15} />
          ))}
          <path d="M131 51 L141 57 L131 63 Z" fill={gold} />
        </g>
      )}
      {index === 3 && (
        // Sports — field lines + stadium lights
        <g fill="none" stroke={gold} strokeLinecap="round">
          <path d="M70 90 L100 40 L160 40" strokeWidth="1.5" opacity="0.35" />
          <ellipse cx="128" cy="60" rx="18" ry="8" strokeWidth="1.5" opacity="0.35" />
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={0.9 - i * 0.2}>
              <path d={`M${104 + i * 20} 2 v14`} strokeWidth="1.5" />
              <rect x={98 + i * 20} y="0" width="12" height="6" rx="1.5" fill={gold} stroke="none" />
            </g>
          ))}
          <path d="M100 6 L80 60 M124 6 L120 60 M144 6 L160 50" stroke={P.beam} strokeWidth="6" opacity="0.07" />
        </g>
      )}
      {index === 4 && (
        // Documentaries — globe + mountains
        <g fill="none" stroke={gold} strokeLinecap="round">
          <circle cx="128" cy="34" r="24" strokeWidth="1.5" opacity="0.7" />
          <ellipse cx="128" cy="34" rx="10" ry="24" strokeWidth="1.2" opacity="0.5" />
          <path d="M104 34 h48 M108 22 h40 M108 46 h40" strokeWidth="1.2" opacity="0.5" />
          <path d="M84 80 L104 58 L116 70 L132 52 L160 80" fill="#164a7a" stroke="none" opacity="0.6" />
        </g>
      )}
      {index === 5 && (
        // Family — soft stars and shapes
        <g fill={gold}>
          {[
            [120, 18, 1],
            [142, 34, 0.7],
            [104, 40, 0.55],
            [134, 56, 0.45],
          ].map(([x, y, o], i) => (
            <path
              key={i}
              transform={`translate(${x} ${y}) scale(${0.8 + (o as number) * 0.4})`}
              d="M0 -8 L2.2 -2.4 L8 -2.4 L3.3 1.2 L5 7 L0 3.6 L-5 7 L-3.3 1.2 L-8 -2.4 L-2.2 -2.4 Z"
              opacity={o as number}
            />
          ))}
          <circle cx="150" cy="10" r="3" opacity="0.4" />
          <circle cx="98" cy="20" r="2" opacity="0.4" />
        </g>
      )}
    </svg>
  );
}
