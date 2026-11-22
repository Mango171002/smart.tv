/**
 * About / Help center content per language. English is the source (src/content/en/info.ts); French (phase 7B)
 * and German, Spanish, Italian, Dutch, Swedish, Norwegian Bokmål (phase 8) are preview translations. Slugs are identical in every language.
 */
import { ABOUT, HELP_HUB, HELP_TOPICS, INFO_REVIEWED, INFO_UI, OWNER_FACTS, type InfoContentSet } from '@/content/en/info';
export type { InfoContentSet };
import { ABOUT_FR, HELP_HUB_FR, HELP_TOPICS_FR, INFO_REVIEWED_FR, INFO_UI_FR, OWNER_FACTS_FR } from '@/content/fr/info';
import { INFO as INFO_DE } from '@/content/de/info';
import { INFO as INFO_ES } from '@/content/es/info';
import { INFO as INFO_IT } from '@/content/it/info';
import { INFO as INFO_NL } from '@/content/nl/info';
import { INFO as INFO_SV } from '@/content/sv/info';
import { INFO as INFO_NB } from '@/content/nb/info';
import type { Locale } from '@/i18n/config';


const SETS: Record<Locale, InfoContentSet> = {
  en: { about: ABOUT, hub: HELP_HUB, topics: HELP_TOPICS, reviewed: INFO_REVIEWED, supportHours: OWNER_FACTS.supportHours, ui: INFO_UI },
  fr: { about: ABOUT_FR, hub: HELP_HUB_FR, topics: HELP_TOPICS_FR, reviewed: INFO_REVIEWED_FR, supportHours: OWNER_FACTS_FR.supportHours, ui: INFO_UI_FR },
  de: INFO_DE,
  es: INFO_ES,
  it: INFO_IT,
  nl: INFO_NL,
  sv: INFO_SV,
  nb: INFO_NB,
};

export const getInfo = (locale: Locale): InfoContentSet => SETS[locale];
export const helpTopicFor = (locale: Locale, slug: string) => SETS[locale].topics.find((t) => t.slug === slug);
