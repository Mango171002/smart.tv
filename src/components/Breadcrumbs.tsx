import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { JsonLd } from './JsonLd';
import s from './info.module.css';

export interface Crumb { name: string; path: string }

/** Visible breadcrumb trail + BreadcrumbList structured data (same items, absolute URLs). */
export function Breadcrumbs({ items, label = 'Breadcrumb' }: { items: Crumb[]; label?: string }) {
  const abs = (p: string) => `${siteConfig.siteUrl}${p === '/' ? '/' : p}`;
  return (
    <>
      <nav className={s.crumbs} aria-label={label}>
        <ol>
          {items.map((c, i) => (
            <li key={c.path}>
              {i < items.length - 1 ? <Link href={c.path}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
        }}
      />
    </>
  );
}
