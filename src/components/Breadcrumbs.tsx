import Link from 'next/link';
import { siteConfig } from '@/config/site';

/** Visible breadcrumb + BreadcrumbList JSON-LD (Google, Bing). `href` values are site paths. */
export function Breadcrumbs({ items, label }: { items: Array<{ name: string; href: string }>; label: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${siteConfig.siteUrl}${it.href}` })),
  };
  return (
    <>
      <nav className="breadcrumbs" aria-label={label}>
        <ol>
          {items.map((it, i) => (
            <li key={it.href}>
              {i < items.length - 1 ? <Link href={it.href}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
    </>
  );
}
