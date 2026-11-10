/**
 * Page-level illustrations, served as static SVG files from /public/visuals.
 * The files are generated from the SVG components in AppScreen.tsx / Devices.tsx
 * with `npm run visuals` (a unit test fails if they are out of date).
 */

type Loading = 'eager' | 'lazy';

function Screen({ kind, loading }: { kind: 'wide' | 'tall'; loading: Loading }) {
  const size = kind === 'wide' ? { width: 320, height: 180 } : { width: 100, height: 210 };
  // eslint-disable-next-line @next/next/no-img-element -- static decorative SVG, no optimisation needed
  return <img src={`/visuals/screen-${kind}.svg`} alt="" {...size} loading={loading} decoding="async" className="screen-svg" />;
}

export function TvFrame({ label, loading = 'lazy' }: { label?: string; loading?: Loading }) {
  return (
    <div className="mock-tv">
      <div className="mock-tv-screen">
        <Screen kind="wide" loading={loading} />
        {label && <span className="mock-tv-label">{label}</span>}
      </div>
      <div className="mock-tv-foot" />
    </div>
  );
}

export function LaptopFrame({ loading = 'lazy' }: { loading?: Loading }) {
  return (
    <div className="mock-laptop">
      <div className="mock-laptop-screen">
        <Screen kind="wide" loading={loading} />
      </div>
      <div className="mock-laptop-base" />
    </div>
  );
}

export function PhoneFrame({ loading = 'lazy' }: { loading?: Loading }) {
  return (
    <div className="mock-phone">
      <div className="mock-phone-screen">
        <Screen kind="tall" loading={loading} />
      </div>
    </div>
  );
}
