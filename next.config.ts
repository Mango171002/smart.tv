import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

// The browser only talks to this origin (Supabase is called from the server), plus:
// - Cloudflare Web Analytics (cookie-less, owner decision 14/11/2026);
// - Google Analytics 4 and Microsoft Clarity, which the page loads only after cookie consent.
const GA = ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com'];
const CLARITY = ['https://www.clarity.ms', 'https://*.clarity.ms', 'https://c.bing.com'];
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${[...GA, ...CLARITY].join(' ')}`,
  "font-src 'self'",
  `connect-src 'self' https://cloudflareinsights.com ${[...GA, ...CLARITY].join(' ')}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

// English only (owner decision): unprefixed URLs go to /en, the former French URLs to their English version.
// Former pages (one-page site) point to their section of the home page.
const FORMER_PAGES: Record<string, string> = { '/plans': '#plans', '/devices': '#content', '/coverage': '#content', '/help': '#faq' };

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Clean URLs (owner request): the site is served at / (no /en prefix). /en/* is the internal route.
  async redirects() {
    const former = Object.entries(FORMER_PAGES).flatMap(([path, anchor]) => [
      { source: `/:locale(en|fr)${path}`, destination: `/${anchor}`, permanent: true },
      { source: path, destination: `/${anchor}`, permanent: true },
    ]);
    return [
      // One canonical host: www.sygmatv.com → sygmatv.com (same path and query).
      { source: '/:path*', has: [{ type: 'host', value: 'www.sygmatv.com' }], destination: 'https://sygmatv.com/:path*', permanent: true },
      ...former,
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path+', destination: '/:path+', permanent: true },
      { source: '/fr', destination: '/', permanent: true },
      { source: '/fr/:path*', destination: '/:path*', permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/en' },
        { source: '/blog', destination: '/en/blog' },
        { source: '/legal/:doc', destination: '/en/legal/:doc' },
      ],
      // Any other unknown path renders the site's own (styled) 404 page.
      fallback: [{ source: '/:path((?!en(?:/|$)|_next/|api/).*)', destination: '/en/:path' }],
    };
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }, { key: 'X-Robots-Tag', value: 'noindex' }] },
    ];
  },
};

export default nextConfig;
