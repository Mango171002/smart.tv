import { siteConfig } from '@/config/site';

/** Renders the (placeholder) brand. A trailing "+" is highlighted in lime. */
export function Brand({ name = siteConfig.brandName }: { name?: string }) {
  const hasPlus = name.endsWith('+');
  return (
    <span className="brand">
      <span className="logo" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="30" height="30">
          <path d="M9 6.2c0-2.3 2.5-3.7 4.5-2.5l14 8.6c1.9 1.2 1.9 3.9 0 5.1l-14 8.6C11.5 27.2 9 25.8 9 23.5Z" fill="currentColor" />
          <path d="M14 11.6v8.8l7.1-4.4Z" fill="var(--color-bg)" />
        </svg>
      </span>
      {hasPlus ? name.slice(0, -1) : name}
      {hasPlus && <span className="accent">+</span>}
    </span>
  );
}
