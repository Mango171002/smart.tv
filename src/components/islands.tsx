'use client';

import { lazy, Suspense, type ComponentProps } from 'react';

/**
 * Lazy hydration for below-the-fold islands.
 * The server still renders the full HTML (SEO, no layout shift). In the browser,
 * the component's code is only requested — and the HTML hydrated — when the
 * island comes near the viewport, so it does not block the main thread at load.
 */
function whenNear(id: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  return new Promise((resolve) => {
    const el = document.getElementById(id);
    if (!el || !('IntersectionObserver' in window)) return resolve();
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          resolve();
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
  });
}

const LazyFeatured = lazy(() => whenNear('featured').then(() => import('./Featured')).then((m) => ({ default: m.Featured })));
const LazyPlans = lazy(() => whenNear('plans').then(() => import('./PlanConfigurator')).then((m) => ({ default: m.PlanConfigurator })));

export function FeaturedIsland(props: ComponentProps<typeof LazyFeatured>) {
  return (
    <Suspense fallback={null}>
      <LazyFeatured {...props} />
    </Suspense>
  );
}

export function PlansIsland(props: ComponentProps<typeof LazyPlans>) {
  return (
    <Suspense fallback={null}>
      <LazyPlans {...props} />
    </Suspense>
  );
}
