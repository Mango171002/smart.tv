import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

// The browser only talks to this origin: Supabase is called from the server.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
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
  async redirects() {
    const former = Object.entries(FORMER_PAGES).flatMap(([path, anchor]) => [
      { source: `/:locale(en|fr)${path}`, destination: `/en${anchor}`, permanent: true },
      { source: path, destination: `/en${anchor}`, permanent: true },
    ]);
    return [
      ...former,
      { source: '/', destination: '/en', permanent: false },
      { source: '/legal/:doc', destination: '/en/legal/:doc', permanent: false },
      { source: '/blog', destination: '/en/blog', permanent: false },
      { source: '/fr', destination: '/en', permanent: true },
      { source: '/fr/:path*', destination: '/en/:path*', permanent: true },
    ];
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
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
};

export default nextConfig;
