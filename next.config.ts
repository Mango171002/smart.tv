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

// Unprefixed pages: language from the NEXT_LOCALE cookie, then Accept-Language, else EN.
// Implemented as config redirects (not a Proxy) so it runs natively on Cloudflare.
const UNPREFIXED = ['/', '/legal/:doc', '/plans', '/devices', '/coverage', '/help'];
// One-page site: the former pages now point to their section on the home page.
const FORMER_PAGES: Record<string, string> = { '/plans': '#plans', '/devices': '#devices', '/coverage': '#content', '/help': '#faq' };
const target = (locale: string, source: string) =>
  source === '/' ? `/${locale}` : FORMER_PAGES[source] ? `/${locale}${FORMER_PAGES[source]}` : `/${locale}${source}`;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    const former = Object.entries(FORMER_PAGES).map(([path, anchor]) => ({
      source: `/:locale(en|fr)${path}`,
      destination: `/:locale${anchor}`,
      permanent: true,
    }));
    return [...former, ...UNPREFIXED.flatMap((source) => [
      { source, has: [{ type: 'cookie' as const, key: 'NEXT_LOCALE', value: 'fr' }], destination: target('fr', source), permanent: false },
      { source, has: [{ type: 'cookie' as const, key: 'NEXT_LOCALE', value: 'en' }], destination: target('en', source), permanent: false },
      { source, has: [{ type: 'header' as const, key: 'accept-language', value: '^\\s*fr.*' }], destination: target('fr', source), permanent: false },
      { source, destination: target('en', source), permanent: false },
    ])];
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
