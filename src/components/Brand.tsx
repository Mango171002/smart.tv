import { siteConfig } from '@/config/site';

/** Official SYGMA TV+ logo (vector, public/brand/sygma-logo.svg — traced from the approved artwork). */
export const LOGO_RATIO = 1362.7 / 177.3;

export function Brand({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static vector logo, no optimisation needed
    <img
      className={`brand-logo${className ? ` ${className}` : ''}`}
      src="/brand/sygma-logo.svg"
      alt={siteConfig.brandName}
      width={308}
      height={40}
      decoding="async"
    />
  );
}
