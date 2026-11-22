import { describe, expect, it } from 'vitest';
import { HELP_SLUGS } from '@/content/en/info';
import { HELP_TOPIC_SLUGS } from '@/content/help-slugs';
import { SITE_LANGUAGES, applyRelease, type SiteLanguage } from '@/i18n/locales';
import { LANGUAGE_LABEL, switchHref, switcherLanguages, translatedPath } from '@/i18n/switcher';

const REGISTRY = Object.values(SITE_LANGUAGES) as readonly SiteLanguage[];
const ALL8 = switcherLanguages(REGISTRY, true);
const lang = (c: string) => ALL8.find((l) => l.code === c)!;
const go = (from: string, to: string, content = true) => switchHref(from, lang(to), ALL8, content);

describe('language switcher — which languages are offered', () => {
  it('production build (no preview, nothing released): English only → the switcher is not rendered', () => {
    expect(switcherLanguages(REGISTRY, false).map((l) => l.code)).toEqual(['en']);
  });
  it('private preview: the 8 languages, English first, native names, no flags', () => {
    expect(ALL8.map((l) => [l.code, l.nativeName])).toEqual([
      ['en', 'English'], ['fr', 'Français'], ['de', 'Deutsch'], ['es', 'Español'], ['it', 'Italiano'], ['nl', 'Nederlands'], ['sv', 'Svenska'], ['nb', 'Norsk bokmål'],
    ]);
    for (const l of ALL8) expect(l.nativeName).not.toMatch(/\p{Regional_Indicator}/u);
  });
  it('release flag respected: production with French released offers English + French only', () => {
    expect(switcherLanguages(applyRelease(REGISTRY, ['fr']), false).map((l) => l.code)).toEqual(['en', 'fr']);
  });
  it('a disabled language is never offered, even in preview', () => {
    const reg = [...REGISTRY, { ...SITE_LANGUAGES.de, code: 'pl', prefix: '/pl', status: 'disabled' } as SiteLanguage];
    expect(switcherLanguages(applyRelease(reg, ['pl']), true).map((l) => l.code)).not.toContain('pl');
  });
  it('labels exist for every language', () => {
    for (const l of ALL8) expect(LANGUAGE_LABEL[l.code], l.code).toBeTruthy();
  });
});

describe('language switcher — destination of each link', () => {
  it('help topic slugs used by the switcher = the Help centre topics', () => {
    expect([...HELP_TOPIC_SLUGS]).toEqual(HELP_SLUGS);
  });
  it('keeps the current page when it exists in the target language', () => {
    expect(go('/', 'de')).toEqual({ href: '/de', kept: true });
    expect(go('/de', 'en')).toEqual({ href: '/', kept: true });
    expect(go('/de/help/devices', 'fr')).toEqual({ href: '/fr/help/devices', kept: true });
    expect(go('/nb/help/devices', 'en')).toEqual({ href: '/help/devices', kept: true });
    expect(go('/about', 'nl')).toEqual({ href: '/nl/about', kept: true });
    expect(go('/sv/help', 'it')).toEqual({ href: '/it/help', kept: true });
    expect(go('/blog', 'es')).toEqual({ href: '/es/blog', kept: true });
    expect(go('/de/help/', 'es')).toEqual({ href: '/es/help', kept: true });
  });
  it('falls back to the destination home page when the page does not exist there', () => {
    expect(go('/legal/privacy', 'de')).toEqual({ href: '/de', kept: false });
    expect(go('/legal/privacy', 'en')).toEqual({ href: '/legal/privacy', kept: true });
    expect(go('/nope', 'fr')).toEqual({ href: '/fr', kept: false });
    expect(go('/de/nope', 'en')).toEqual({ href: '/', kept: false });
    expect(go('/de/help/unknown-topic', 'it')).toEqual({ href: '/it', kept: false });
    expect(go('/about', 'de', false)).toEqual({ href: '/de', kept: false });
  });
  it('an unknown first segment is an English path, not a language', () => {
    expect(translatedPath('/pl', 'de')).toBeNull();
    expect(go('/pl/help', 'de')).toEqual({ href: '/de', kept: false });
  });
});

describe('language switcher — internal English route', () => {
  it('/en/* (internal route of the English pages) is understood as the English page', () => {
    expect(go('/en/help/devices', 'de')).toEqual({ href: '/de/help/devices', kept: true });
    expect(go('/en', 'fr')).toEqual({ href: '/fr', kept: true });
    expect(go('/en/legal/terms', 'en')).toEqual({ href: '/legal/terms', kept: true });
  });
});
