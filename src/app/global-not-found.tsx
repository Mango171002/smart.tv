import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { Brand } from '@/components/Brand';
import { siteConfig } from '@/config/site';
import en from '@/i18n/dictionaries/en';
import { LEGAL_DOCS } from '@/lib/routes';

/**
 * Branded 404 page for every unmatched URL (Next.js `global-not-found`, enabled in next.config.ts).
 * It bypasses the [locale] layout: full HTML document, site styles, English text from the dictionary.
 * Server component only: no client JavaScript, no consent banner and no analytics (as before).
 * HTTP status 404 and `noindex` (added by Next.js; never in the sitemap, no canonical).
 */
export const metadata: Metadata = {
  title: `${en.notFound.metaTitle} | ${siteConfig.brandName}`,
  description: en.notFound.text,
  // No `robots` here: Next.js already adds <meta name="robots" content="noindex"> to not-found pages
  // (declaring it again would print a second robots tag).
};

export const viewport: Viewport = { themeColor: '#070d17', width: 'device-width', initialScale: 1 };

export default function GlobalNotFound() {
  const t = en.notFound;
  const suggestions = [
    { href: '/#plans', label: en.nav.plans },
    { href: '/#how', label: en.nav.how },
    { href: '/#faq', label: en.footer.helpFaq },
  ];
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">{en.common.skipToContent}</a>
        <header className="header">
          <div className="wrap nav">
            <Link href="/" title={en.nav.home} className="brand-link">
              <Brand />
            </Link>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <div className="wrap page-head" style={{ paddingBottom: 80, textAlign: 'center' }}>
            <div className="eyebrow">404</div>
            <h1 className="page-title">{t.title}</h1>
            <p className="muted">{t.text}</p>
            <p style={{ marginTop: 24 }}>
              <Link className="btn btn-lime" href="/">{t.home}</Link>
            </p>
            <nav aria-label={t.suggestionsTitle} style={{ marginTop: 32 }}>
              <h2 className="muted" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>{t.suggestionsTitle}</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '12px 24px', justifyContent: 'center' }}>
                {suggestions.map((s) => (
                  <li key={s.href}><a href={s.href}>{s.label}</a></li>
                ))}
                {siteConfig.supportEmail && (
                  <li><a href={`mailto:${siteConfig.supportEmail}`}>{t.support}</a></li>
                )}
              </ul>
            </nav>
          </div>
        </main>
        <footer className="footer">
          <div className="wrap" style={{ padding: '24px 0' }}>
            <nav aria-label={en.footer.legalTitle}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '8px 20px', justifyContent: 'center' }}>
                {LEGAL_DOCS.map((d) => (
                  <li key={d}><Link href={`/legal/${d}`}>{en.footer.legalLinks[d]}</Link></li>
                ))}
              </ul>
            </nav>
            <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>© {new Date().getFullYear()} {siteConfig.legalEntity ?? siteConfig.brandName}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
