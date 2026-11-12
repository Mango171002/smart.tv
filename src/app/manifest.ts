import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/** Web app manifest: app icon = official SYGMA TV+ symbol. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.brandName,
    short_name: siteConfig.brandName,
    start_url: '/en',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#070d17',
    icons: [
      { src: '/brand/sygma-symbol-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/sygma-symbol-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
