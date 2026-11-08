/**
 * Original, illustrative interface mock-ups drawn in SVG.
 * No third-party content: abstract artwork only (no channel names, logos, posters or titles).
 */

const TILE_GRADIENTS: Array<[string, string]> = [
  ['#253d60', '#101a2a'],
  ['#5d3c2c', '#1b1f2a'],
  ['#284f48', '#111a2a'],
  ['#3c315d', '#111a2a'],
  ['#494a30', '#111a2a'],
  ['#60424d', '#111a2a'],
];

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-hero`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1d3d69" />
        <stop offset="0.5" stopColor="#a65968" />
        <stop offset="0.68" stopColor="#f3a86a" />
        <stop offset="0.82" stopColor="#142b43" />
      </linearGradient>
      <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#0b1425" stopOpacity="0.95" />
        <stop offset="0.55" stopColor="#0b1425" stopOpacity="0" />
      </linearGradient>
      {TILE_GRADIENTS.map(([a, b], i) => (
        <linearGradient key={i} id={`${id}-t${i}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      ))}
    </defs>
  );
}

/** Wide layout (16:9) — TV and computer screens. */
export function WideScreen({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" className="screen-svg">
      <Defs id={id} />
      <rect width="320" height="180" fill="#0b1425" />
      {/* top bar */}
      <rect x="12" y="8" width="9" height="9" rx="2.5" fill="#d9b76f" />
      <path d="M15.5 10.5 L19 12.5 L15.5 14.5 Z" fill="#0b1425" />
      {[28, 52, 74, 98].map((x, i) => (
        <rect key={x} x={x} y="11" width={i === 0 ? 18 : 16} height="3" rx="1.5" fill={i === 0 ? '#d9b76f' : '#5d6f8a'} />
      ))}
      <circle cx="300" cy="12.5" r="4" fill="#16253c" stroke="#3b4f6b" strokeWidth="0.8" />
      {/* hero banner */}
      <g>
        <rect x="12" y="24" width="296" height="72" rx="6" fill={`url(#${id}-hero)`} />
        <path d="M12 82 L70 54 L104 74 L150 46 L206 76 L250 58 L308 80 L308 90 Q308 96 302 96 L18 96 Q12 96 12 90 Z" fill="#132640" />
        <path d="M12 90 L80 70 L140 86 L210 66 L308 88 L308 90 Q308 96 302 96 L18 96 Q12 96 12 90 Z" fill="#0c1a2e" />
        <rect x="12" y="24" width="296" height="72" rx="6" fill={`url(#${id}-fade)`} />
        <rect x="24" y="44" width="74" height="7" rx="2" fill="#f7f8fb" />
        <rect x="24" y="56" width="104" height="3" rx="1.5" fill="#a7b5ca" />
        <rect x="24" y="62" width="88" height="3" rx="1.5" fill="#a7b5ca" />
        <rect x="24" y="73" width="34" height="11" rx="3" fill="#d9b76f" />
        <path d="M37 76 L42 78.5 L37 81 Z" fill="#151718" />
        <rect x="62" y="73" width="28" height="11" rx="3" fill="#111b2b" stroke="#6d7b91" strokeWidth="0.8" />
      </g>
      {/* row 1: continue watching */}
      <rect x="12" y="104" width="42" height="3" rx="1.5" fill="#d7e0ea" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={12 + i * 60} y="111" width="54" height="30" rx="4" fill={`url(#${id}-t${i})`} stroke={i === 0 ? '#d9b76f' : '#33465e'} strokeWidth={i === 0 ? 1.2 : 0.6} />
          <rect x={16 + i * 60} y="135" width="46" height="2" rx="1" fill="#2b3d57" />
          <rect x={16 + i * 60} y="135" width={[30, 12, 40, 22, 8][i]} height="2" rx="1" fill="#d9b76f" />
        </g>
      ))}
      {/* row 2: live cards */}
      <rect x="12" y="149" width="30" height="3" rx="1.5" fill="#d7e0ea" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={12 + i * 75} y="156" width="70" height="20" rx="4" fill="#13233b" stroke="#2b3d57" strokeWidth="0.6" />
          <circle cx={20 + i * 75} cy="163" r="2" fill="#ff6b6b" />
          <rect x={25 + i * 75} y="161.5" width="20" height="3" rx="1.5" fill="#a7b5ca" />
          <rect x={18 + i * 75} y="169" width="58" height="2" rx="1" fill="#2b3d57" />
          <rect x={18 + i * 75} y="169" width={[34, 20, 46, 28][i]} height="2" rx="1" fill="#e6e9ef" />
        </g>
      ))}
    </svg>
  );
}

/** Tall layout (9:19) — phone player screen. */
export function TallScreen({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 100 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" className="screen-svg">
      <Defs id={id} />
      <rect width="100" height="210" fill="#0b1425" />
      <rect x="0" y="16" width="100" height="58" fill={`url(#${id}-hero)`} />
      <path d="M0 62 L22 48 L40 58 L60 42 L84 56 L100 50 L100 74 L0 74 Z" fill="#132640" />
      <circle cx="50" cy="45" r="10" fill="#080d18" fillOpacity="0.55" stroke="#f7f8fb" strokeWidth="1" />
      <path d="M47 40 L55 45 L47 50 Z" fill="#f7f8fb" />
      <rect x="6" y="79" width="88" height="2" rx="1" fill="#2b3d57" />
      <rect x="6" y="79" width="52" height="2" rx="1" fill="#d9b76f" />
      <circle cx="58" cy="80" r="2.6" fill="#d9b76f" />
      <rect x="6" y="90" width="60" height="5" rx="2" fill="#f7f8fb" />
      <rect x="6" y="99" width="78" height="2.5" rx="1.2" fill="#a7b5ca" />
      <rect x="6" y="104" width="64" height="2.5" rx="1.2" fill="#a7b5ca" />
      <rect x="6" y="112" width="26" height="9" rx="3" fill="#d9b76f" />
      <rect x="36" y="112" width="26" height="9" rx="3" fill="#111b2b" stroke="#6d7b91" strokeWidth="0.6" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="6" y={130 + i * 19} width="30" height="15" rx="3" fill={`url(#${id}-t${i + 1})`} />
          <rect x="41" y={133 + i * 19} width="40" height="3" rx="1.5" fill="#d7e0ea" />
          <rect x="41" y={139 + i * 19} width="28" height="2.5" rx="1.2" fill="#5d6f8a" />
        </g>
      ))}
    </svg>
  );
}
