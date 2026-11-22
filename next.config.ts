import type { NextConfig } from 'next';
import { formerPagePrefixes, legacyLanguageRedirects } from './src/i18n/locales';

const isDev = process.env.NODE_ENV !== 'production';

// The browser only talks to this origin (Supabase is called from the server), plus:
// - Cloudflare Web Analytics (cookie-less, owner decision 14/11/2026);
// - Google Analytics 4 and Microsoft Clarity, loaded only after Analytics consent;
// - Google Tag Manager and the advertising platforms it will load (Google Ads, Meta, TikTok — configured
//   in GTM, phase 2), loaded only after Marketing consent. Allowed here so that phase 2 needs no deploy.
// GA4 hits go to www.google-analytics.com, region1.google-analytics.com… and, when ad consent is granted,
// to analytics.google.com itself (a wildcard does not cover the bare domain).
const GA = ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://analytics.google.com', 'https://*.analytics.google.com'];
const CLARITY = ['https://www.clarity.ms', 'https://*.clarity.ms', 'https://c.bing.com'];
const ADS_SCRIPTS = ['https://www.googleadservices.com', 'https://googleads.g.doubleclick.net', 'https://connect.facebook.net', 'https://analytics.tiktok.com'];
const ADS_HITS = [
  'https://www.googleadservices.com', 'https://googleads.g.doubleclick.net', 'https://*.doubleclick.net', 'https://www.google.com',
  'https://pagead2.googlesyndication.com', 'https://www.facebook.com', 'https://connect.facebook.net', 'https://analytics.tiktok.com', 'https://*.tiktok.com',
];
// Google Tag Manager preview / Tag Assistant (debugging the container).
const GTM_PREVIEW = ['https://tagassistant.google.com'];
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms ${[...ADS_SCRIPTS, ...GTM_PREVIEW].join(' ')}${isDev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline' ${GTM_PREVIEW.join(' ')}`,
  // Images: any https source (owner decision 17/11/2026). Google Ads remarketing pixels redirect to the
  // visitor's local Google domain (www.google.fr, www.google.co.uk…), which no fixed list can cover.
  // Images cannot run code; scripts and network calls keep their strict lists below.
  "img-src 'self' data: https:",
  "font-src 'self'",
  `connect-src 'self' https://cloudflareinsights.com ${[...GA, ...CLARITY, ...ADS_HITS, ...GTM_PREVIEW].join(' ')}`,
  `frame-src https://td.doubleclick.net https://www.googletagmanager.com ${GTM_PREVIEW.join(' ')}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

// English only (owner decision): unprefixed URLs go to /en, the former French URLs to their English version.
// Former pages (one-page site) point to their section of the home page.
const FORMER_PAGES: Record<string, string> = { '/plans': '#plans', '/devices': '#content', '/coverage': '#content', '/help': '#faq' };
// Phase 5C content pages (About us, Help center): built only when NEXT_PUBLIC_CONTENT_PAGES is « preview » or
// « live » (src/config/content-pages.ts). Unset (production today): no route, /help still redirects to /#faq.
const CONTENT_PAGES = ['preview', 'live'].includes(process.env.NEXT_PUBLIC_CONTENT_PAGES ?? '');
if (CONTENT_PAGES) delete FORMER_PAGES['/help'];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // The root layout is the dynamic segment app/[locale]: an unknown first segment (/nope) fails the locale
  // check, so no layout-level not-found page can render it. app/global-not-found.tsx is Next.js's answer
  // for this case: one branded 404 page (HTTP 404, noindex) for every unmatched URL.
  experimental: { globalNotFound: true },
  // Clean URLs (owner request): the site is served at / (no /en prefix). /en/* is the internal route.
  async redirects() {
    const former = Object.entries(FORMER_PAGES).flatMap(([path, anchor]) => [
      { source: `/:locale(${formerPagePrefixes().join('|')})${path}`, destination: `/${anchor}`, permanent: true },
      { source: path, destination: `/${anchor}`, permanent: true },
    ]);
    return [
      // One canonical host: www.sygmatv.com → sygmatv.com (same path and query).
      { source: '/:path*', has: [{ type: 'host', value: 'www.sygmatv.com' }], destination: 'https://sygmatv.com/:path*', permanent: true },
      ...former,
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path+', destination: '/:path+', permanent: true },
      // Former French URLs → English page, while French is disabled (generated from src/i18n/locales.ts).
      // /de, /es, /it, /nl, /sv and /nb were never published: no redirect, they stay a 404 until their language is enabled.
      ...legacyLanguageRedirects(),
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/en' },
        { source: '/blog', destination: '/en/blog' },
        { source: '/legal/:doc', destination: '/en/legal/:doc' },
        ...(CONTENT_PAGES
          ? [
              { source: '/about', destination: '/en/about' },
              { source: '/help', destination: '/en/help' },
              { source: '/help/:topic', destination: '/en/help/:topic' },
            ]
          : []),
      ],
      // Unknown paths are no longer rewritten into /en: they match no route and get the branded
      // app/global-not-found.tsx page (HTTP 404, noindex).
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
