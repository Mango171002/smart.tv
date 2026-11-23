/**
 * About / Help center content per language. English is the source (src/content/en/info.ts); French (phase 7B)
 * and German, Spanish, Italian, Dutch, Swedish, Norwegian Bokmål (phase 8) are preview translations. Slugs are identical in every language.
 */
import { ABOUT, HELP_HUB, HELP_TOPICS, INFO_REVIEWED, INFO_UI, OWNER_FACTS, type InfoContentSet, type InfoPage } from '@/content/en/info';
export type { InfoContentSet };
import { ABOUT_FR, HELP_HUB_FR, HELP_TOPICS_FR, INFO_REVIEWED_FR, INFO_UI_FR, OWNER_FACTS_FR } from '@/content/fr/info';
import { INFO as INFO_DE } from '@/content/de/info';
import { INFO as INFO_ES } from '@/content/es/info';
import { INFO as INFO_IT } from '@/content/it/info';
import { INFO as INFO_NL } from '@/content/nl/info';
import { INFO as INFO_SV } from '@/content/sv/info';
import { INFO as INFO_NB } from '@/content/nb/info';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { prelaunchTrialLabel } from '@/lib/prelaunch-copy';


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

/** A language's content as written (the open state). Pages use infoFor(), which knows whether requests are open. */
export const getInfo = (locale: Locale): InfoContentSet => SETS[locale];

/** A page with its prelaunch variants applied (description, intro, and the sections listed in `prelaunch.sections`). */
function prelaunchPage(page: InfoPage): InfoPage {
  const o = page.prelaunch;
  if (!o) return page;
  return {
    ...page,
    description: o.description ?? page.description,
    intro: o.intro ?? page.intro,
    sections: page.sections.map((s) => (o.sections?.[s.id] ? { ...s, ...o.sections[s.id] } : s)),
  };
}

/**
 * The content of the About and Help center pages for the current state of online requests (pass
 * isContactFormEnabled()). Open: exactly the written content. Closed (prelaunch): each page's `prelaunch` variants,
 * and the free-trial button reads « Free trials opening soon » (it opens the prelaunch trial window).
 */
export function infoFor(locale: Locale, ordersOpen: boolean): InfoContentSet {
  const set = SETS[locale];
  if (ordersOpen) return set;
  const trial = prelaunchTrialLabel(getDictionary(locale).prelaunch);
  return { ...set, about: prelaunchPage(set.about), topics: set.topics.map(prelaunchPage), ui: { ...set.ui, actions: { ...set.ui.actions, trial } } };
}
export const helpTopicFor = (locale: Locale, slug: string, ordersOpen: boolean) => infoFor(locale, ordersOpen).topics.find((t) => t.slug === slug);
