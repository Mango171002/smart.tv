import { describe, expect, it } from 'vitest';
import en from '@/i18n/dictionaries/en';
import fr from '@/i18n/dictionaries/fr';
import { ABOUT, HELP_HUB, HELP_TOPICS, INFO_UI } from '@/content/en/info';
import { ABOUT_FR, HELP_HUB_FR, HELP_TOPICS_FR, INFO_UI_FR } from '@/content/fr/info';
import { getInfo } from '@/content/info';
import sitemap from '@/app/sitemap';
import { LOCALES, PUBLIC_LOCALES, isPublicLocale } from '@/i18n/config';
import { SITE_LANGUAGES, builtLanguages, legacyLanguageRedirects, prefixedBuiltLanguages, prefixedPath } from '@/i18n/locales';
import { buildMetadata, hreflangAlternates } from '@/lib/seo';

/** Phase 7B: French localisation, preview only. */
const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

/** Same keys, same array lengths, same {placeholders}, same non-text values (booleans, icons, hrefs of FAQ links aside). */
function sameShape(a: unknown, b: unknown, path = ''): void {
  if (typeof a === 'string') {
    expect(typeof b, path).toBe('string');
    expect(placeholders(b as string), path).toEqual(placeholders(a));
    expect((b as string).trim().length, path).toBeGreaterThan(0);
    return;
  }
  if (Array.isArray(a)) {
    expect(Array.isArray(b), path).toBe(true);
    expect((b as unknown[]).length, path).toBe(a.length);
    a.forEach((x, i) => sameShape(x, (b as unknown[])[i], `${path}[${i}]`));
    return;
  }
  if (a && typeof a === 'object') {
    expect(Object.keys(b as object).filter((k) => k !== 'legalLanguageNote').sort(), path).toEqual(Object.keys(a).sort());
    for (const k of Object.keys(a)) sameShape((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`);
    return;
  }
  expect(b, path).toEqual(a);
}

const FR_TEXT = strings([fr, ABOUT_FR, HELP_HUB_FR, HELP_TOPICS_FR, INFO_UI_FR]).join('\n');

describe('French dictionary (complete translation of the validated English)', () => {
  it('has exactly the English structure, placeholders and values', () => sameShape(en, fr));

  it('keeps non-text data identical (icons, categories, comparison table, FAQ links)', () => {
    expect(fr.plans.compare.rows.map((r) => r.values.filter((v) => typeof v === 'boolean'))).toEqual(en.plans.compare.rows.map((r) => r.values.filter((v) => typeof v === 'boolean')));
    expect(fr.featured.items.map((i) => i.cat)).toEqual(en.featured.items.map((i) => i.cat));
    for (const t of ['starter', 'plus', 'ultra'] as const) expect(fr.plans.tiers[t].features.map((f) => f.icon)).toEqual(en.plans.tiers[t].features.map((f) => f.icon));
    const links = (d: typeof en) => (d.faq.items as Array<{ link?: { href: string } }>).map((i) => i.link?.href ?? null);
    expect(links(fr)).toEqual(links(en));
  });

  it('home title and description fit the search result (≤ 60 / 70–155 characters)', () => {
    expect(fr.meta.homeTitle.length).toBeLessThanOrEqual(60);
    expect(fr.meta.homeDescription.length).toBeGreaterThanOrEqual(70);
    expect(fr.meta.homeDescription.length).toBeLessThanOrEqual(155);
  });

  it('makes no claim the English does not make (volumes, replay, VIP, superlatives, IPTV, international channels, live sports)', () => {
    for (const re of [/\d{1,3}[ .  ]\d{3}\b/, /\breplay\b/i, /\bvip\b/i, /prioritaire/i, /\bmeilleur/i, /\bultime\b/i, /\biptv\b/i, /cha[iî]nes internationales/i, /sports? en direct/i, /dans le monde entier|partout dans le monde/i, /les plus regard/i, /serveurs? premium/i])
      expect(FR_TEXT, String(re)).not.toMatch(re);
    expect([fr.meta.homeTitle, fr.meta.homeDescription, ...strings(fr.hero)].join(' ')).not.toMatch(/sport/i);
  });

  it('4K / HDR and the TV guide are always qualified « selon disponibilité », as in English', () => {
    for (const s of strings([fr.plans.sub, fr.cta, fr.hero]).filter((x) => /4K|HDR/.test(x))) expect(s, s).toMatch(/selon disponibilité/);
    for (const [name, tier] of Object.entries(fr.plans.tiers)) {
      const features = tier.features.map((f) => f.text).join(' ');
      if (/4K|HDR/.test(features)) expect(tier.note, name).toMatch(/4K[^.]*selon disponibilité/);
      if (/Guide TV/.test(features)) expect(tier.note, name).toMatch(/[gG]uide TV selon disponibilité/);
    }
    expect(fr.plans.compare.note).toMatch(/selon disponibilité/);
  });

  it('activation BEFORE payment, nothing charged on the website (FAQ, order window, confirmation)', () => {
    const faq = fr.faq.items as Array<{ q: string; a: string }>;
    expect(faq[0]!.a).toMatch(/active votre accès, et vous payez après l’activation/);
    expect(fr.checkout.productionNote).toMatch(/Rien n’est débité sur ce site/);
    expect(fr.checkout.productionNote).toMatch(/active votre accès, puis vous envoie les instructions de paiement/);
    expect(fr.checkout.doneText).toMatch(/activer votre accès/);
    expect(fr.checkout.doneText).not.toMatch(/pay/i);
  });

  it('same refund facts: 7 days from activation, 14-day withdrawal for EU/UK, no automatic renewal', () => {
    const faq = fr.faq.items as Array<{ q: string; a: string }>;
    expect(faq[4]!.a).toMatch(/7 jours suivant l’activation/);
    expect(faq[4]!.a).toMatch(/14 jours/);
    expect(faq[4]!.a).toMatch(/jamais automatiquement/);
  });

  it('uses French typography (non-breaking space before ? ! : ; and inside « »)', () => {
    expect(FR_TEXT).not.toMatch(/ [?!;:»]/);
    expect(FR_TEXT).not.toMatch(/« /);
  });
});

describe('French About and Help center', () => {
  it('same pages, slugs and sections as English, in the same order', () => {
    expect(ABOUT_FR.sections.map((s) => s.id)).toEqual(ABOUT.sections.map((s) => s.id));
    expect(HELP_TOPICS_FR.map((t) => t.slug)).toEqual(HELP_TOPICS.map((t) => t.slug));
    HELP_TOPICS_FR.forEach((t, i) => {
      expect(t.sections.map((s) => s.id)).toEqual(HELP_TOPICS[i]!.sections.map((s) => s.id));
      expect(t.icon).toBe(HELP_TOPICS[i]!.icon);
    });
    expect(HELP_HUB_FR.popular.map((p) => p.href)).toEqual(HELP_HUB.popular.map((p) => `/fr${p.href}`));
    expect(INFO_UI_FR.helpFacts).toHaveLength(INFO_UI.helpFacts.length);
  });

  it('every title ≤ 60 characters with the brand, every description ≤ 155', () => {
    for (const p of [ABOUT_FR, ...HELP_TOPICS_FR, HELP_HUB_FR]) {
      expect(`${p.metaTitle} | SYGMA TV+`.length, p.metaTitle).toBeLessThanOrEqual(60);
      expect(p.description.length, p.metaTitle).toBeLessThanOrEqual(155);
      expect(p.description.length, p.metaTitle).toBeGreaterThanOrEqual(70);
    }
  });

  it('the six ordering steps keep the real order: order, WhatsApp, activation, payment, confirmation', () => {
    const steps = (ABOUT_FR.sections.find((s) => s.id === 'how')!.body.find((b) => 'steps' in b) as { steps: Array<{ title: string }> }).steps.map((s) => s.title);
    expect(steps).toEqual(['Choisissez votre formule', 'Envoyez votre commande', 'Nous vous contactons sur WhatsApp', 'Nous activons votre abonnement', 'Vous payez', 'Paiement confirmé']);
  });

  it('internal links stay in French (/fr…) or point to the English legal pages (/legal/…)', () => {
    const hrefs = [
      ...ABOUT_FR.sections.flatMap((s) => s.body.flatMap((b) => ('links' in b ? b.links.map((l) => l.href) : []))),
      ...INFO_UI_FR.hubRelated.map((l) => l.href), INFO_UI_FR.refundPolicy.href, INFO_UI_FR.terms.href, INFO_UI_FR.actions.plansHref,
      ...HELP_HUB_FR.popular.map((p) => p.href),
    ];
    for (const h of hrefs) expect(h, h).toMatch(/^\/fr(\/|#|$)|^\/legal\//);
    for (const s of strings([ABOUT_FR, HELP_TOPICS_FR]).filter((x) => /\/legal\//.test(x))) expect(s).toMatch(/\/legal\//);
  });

  it('getInfo returns the language set', () => {
    expect(getInfo('en').about).toBe(ABOUT);
    expect(getInfo('fr').about).toBe(ABOUT_FR);
  });
});

describe('French preview mode: never public', () => {
  it('production build (this test run): English only, French not built', () => {
    expect(LOCALES).toEqual(['en']);
    expect(PUBLIC_LOCALES).toEqual(['en']);
    expect(SITE_LANGUAGES.fr.status).toBe('preview');
  });

  it('preview environment builds French, production does not', () => {
    expect(builtLanguages(undefined, true).map((l) => l.code)).toEqual(['en', 'fr', 'de', 'es', 'it', 'nl', 'sv', 'nb']);
    expect(builtLanguages(undefined, false).map((l) => l.code)).toEqual(['en']);
    expect(prefixedBuiltLanguages(undefined, true).map((l) => l.prefix)).toEqual(['/fr', '/de', '/es', '/it', '/nl', '/sv', '/nb']);
  });

  it('French preview pages are noindex, nofollow and outside hreflang', () => {
    expect(isPublicLocale('fr')).toBe(false);
    const m = buildMetadata({ locale: 'fr', path: '/help', title: 'Centre d’aide', description: 'd' });
    expect(m.robots).toEqual({ index: false, follow: false });
    expect(m.alternates).toEqual({ canonical: '/fr/help' });
    expect(m.openGraph).toMatchObject({ locale: 'fr_FR', url: '/fr/help' });
    expect(hreflangAlternates('/help')).toBeUndefined();
  });

  it('no French URL in the sitemap', () => {
    for (const e of sitemap()) expect(new URL(e.url).pathname).not.toMatch(/^\/fr(\/|$)/);
  });

  it('production keeps the /fr redirects; the preview keeps only /fr/legal/* → English legal pages', () => {
    expect(legacyLanguageRedirects(undefined, false)).toEqual([
      { source: '/fr', destination: '/', permanent: true },
      { source: '/fr/:path*', destination: '/:path*', permanent: true },
    ]);
    // Phase 8: every preview language is built in the preview environment; each one's legal URLs go to the English pages.
    expect(legacyLanguageRedirects(undefined, true)).toEqual(['fr', 'de', 'es', 'it', 'nl', 'sv', 'nb'].map((c) => ({ source: `/${c}/legal/:path*`, destination: '/legal/:path*', permanent: false })));
  });

  it('anchors stay on the French home without a trailing slash (/fr#plans)', () => {
    expect(prefixedPath('/fr', '#plans')).toBe('/fr#plans');
    expect(prefixedPath('', '#plans')).toBe('/#plans');
    expect(prefixedPath('/fr')).toBe('/fr');
  });
});
