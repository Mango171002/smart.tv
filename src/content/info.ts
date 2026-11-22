/**
 * About / Help center content per language. English is the source (src/content/en/info.ts); French is a
 * preview translation (src/content/fr/info.ts, phase 7B). Slugs are identical in every language.
 */
import { ABOUT, HELP_HUB, HELP_TOPICS, INFO_REVIEWED, INFO_UI, OWNER_FACTS, type InfoPage, type InfoUi } from '@/content/en/info';
import { ABOUT_FR, HELP_HUB_FR, HELP_TOPICS_FR, INFO_REVIEWED_FR, INFO_UI_FR, OWNER_FACTS_FR } from '@/content/fr/info';
import type { Locale } from '@/i18n/config';

export interface InfoContentSet {
  about: InfoPage;
  hub: { name: string; title: string; metaTitle: string; description: string; intro: string; popular: ReadonlyArray<{ q: string; href: string }> };
  topics: InfoPage[];
  reviewed: string;
  supportHours: string;
  ui: InfoUi;
}

const SETS: Record<Locale, InfoContentSet> = {
  en: { about: ABOUT, hub: HELP_HUB, topics: HELP_TOPICS, reviewed: INFO_REVIEWED, supportHours: OWNER_FACTS.supportHours, ui: INFO_UI },
  fr: { about: ABOUT_FR, hub: HELP_HUB_FR, topics: HELP_TOPICS_FR, reviewed: INFO_REVIEWED_FR, supportHours: OWNER_FACTS_FR.supportHours, ui: INFO_UI_FR },
};

export const getInfo = (locale: Locale): InfoContentSet => SETS[locale];
export const helpTopicFor = (locale: Locale, slug: string) => SETS[locale].topics.find((t) => t.slug === slug);
