import { Play } from 'lucide-react';
import { siteConfig } from '@/config/site';

/** Renders the (placeholder) brand. A trailing "+" is highlighted in gold. */
export function Brand({ name = siteConfig.brandName }: { name?: string }) {
  const hasPlus = name.endsWith('+');
  return (
    <span className="brand">
      <span className="logo" aria-hidden="true"><Play size={15} strokeWidth={2.25} /></span>
      {hasPlus ? name.slice(0, -1) : name}
      {hasPlus && <span className="accent">+</span>}
    </span>
  );
}
