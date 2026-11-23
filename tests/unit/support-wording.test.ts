import { describe, expect, it } from 'vitest';
import en, { type Dictionary } from '@/i18n/dictionaries/en';
import fr from '@/i18n/dictionaries/fr';
import de from '@/i18n/dictionaries/de';
import es from '@/i18n/dictionaries/es';
import it_ from '@/i18n/dictionaries/it';
import nl from '@/i18n/dictionaries/nl';
import sv from '@/i18n/dictionaries/sv';
import nb from '@/i18n/dictionaries/nb';
import { getInfo, type InfoContentSet } from '@/content/info';

/**
 * Phase 11 — support wording (owner decisions, 23/11/2026):
 * - « 24/7 » is the automated assistant, with human support when needed (approved sentence, kept in all 8 languages);
 *   no human team announced as available 24/7, no immediate or guaranteed reply, no language claim for the assistant.
 * - Customers browsing in Dutch, Swedish and Norwegian Bokmål get human help in English (the team's six languages
 *   are English, French, Arabic, German, Spanish, Italian); the other languages never say « English only ».
 */
type Lang = 'en' | 'fr' | 'de' | 'es' | 'it' | 'nl' | 'sv' | 'nb';
const DICTS: Record<Lang, Dictionary> = { en, fr, de, es, it: it_, nl, sv, nb };
const LANGS = Object.keys(DICTS) as Lang[];

const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
const sentences = (v: unknown) => strings(v).flatMap((s) => s.split(/(?<=[.!?;:])\s+/));

const info = (lang: Lang): InfoContentSet => getInfo(lang);
const aboutSupport = (lang: Lang) => info(lang).about.sections.find((s) => s.id === 'support')!;
const contactTopic = (lang: Lang) => info(lang).topics.find((t) => t.slug === 'contact-support')!;
const contactSection = (lang: Lang, id: string) => contactTopic(lang).sections.find((s) => s.id === id)!;
const aboutNote = (lang: Lang) => strings(aboutSupport(lang).body.filter((b) => 'note' in b)).join(' ');
const aboutText = (lang: Lang) => strings(aboutSupport(lang).body.filter((b) => 'p' in b)).join(' ');
const availability = (lang: Lang) => strings(contactSection(lang, 'availability').body).join(' ');
const languagesSection = (lang: Lang) => strings(contactSection(lang, 'languages').body.filter((b) => !('chips' in b))).join(' ');

/** The approved sentence: « Our automated assistant is available 24/7, with human support when needed. » */
const ASSISTANT_24_7: Record<Lang, RegExp> = {
  en: /^Our automated assistant is available 24\/7, with human support when needed\./,
  fr: /^Notre assistant automatisé est disponible 24\/7, avec une assistance humaine si nécessaire\./,
  de: /^Unser automatischer Assistent ist 24\/7 erreichbar, bei Bedarf mit persönlicher Unterstützung durch unser Team\./,
  es: /^Nuestro asistente automático está disponible 24\/7, con atención humana cuando sea necesario\./,
  it: /^Il nostro assistente automatico è disponibile 24\/7, con assistenza umana quando serve\./,
  nl: /^Onze automatische assistent is 24\/7 beschikbaar, met hulp van een medewerker wanneer dat nodig is\./,
  sv: /^Vår automatiska assistent finns tillgänglig 24\/7, med personlig hjälp när det behövs\./,
  nb: /^Den automatiske assistenten vår er tilgjengelig 24\/7, med personlig hjelp ved behov\./,
};
const ASSISTANT = /assistant|assistent|asistente|assistente/i;
/** Whole words, Unicode-aware (`\\b` ignores accented letters). */
const words = (alts: string, tail = '') => new RegExp(`(?<!\\p{L})(${alts})(?!\\p{L})${tail}`, 'iu');
const HUMAN = words('team|teamet|équipe|equipo|squadra|staff|agents?|human|humaine?|humana|umana|persönliche?[nrsm]?|personlig|personal|persoonlijke?|medewerkers?|medarbeidere?|medarbeiderne|mitarbeiter\\p{L}*|mensch\\p{L}*|mennesker');
const LANGUAGE_WORD = /languages|langues|sprachen|idiomas|lingue|talen|språk/i;
/** Immediate or guaranteed replies, per language. */
const NO_PROMISE: Record<Lang, RegExp> = {
  en: /\b(immediate|instant)\w* (reply|answer|response)|guaranteed (reply|response)|reply (immediately|instantly)/i,
  fr: /réponse (immédiate|instantanée|garantie)|répond\w* (immédiatement|instantanément)/i,
  de: /(sofortige|garantierte) Antwort|antworten (sofort|umgehend)/i,
  es: /respuesta (inmediata|instantánea|garantizada)|respondemos (al instante|de inmediato|inmediatamente)/i,
  it: /risposta (immediata|istantanea|garantita)|rispondiamo (subito|immediatamente)/i,
  nl: /(directe|onmiddellijke|gegarandeerde) (antwoord|reactie)|antwoorden (direct|meteen|onmiddellijk)/i,
  sv: /(omedelbart|direkt|garanterat) svar|svarar (direkt|omedelbart)/i,
  nb: /(umiddelbart|øyeblikkelig|garantert) svar|svarer (umiddelbart|med en gang)/i,
};

describe('nl / sv / nb: human support in English', () => {
  const ENGLISH = { nl: /Engels/, sv: /engelska/, nb: /engelsk/ } as const;
  for (const [lang, re] of Object.entries(ENGLISH) as Array<['nl' | 'sv' | 'nb', RegExp]>) {
    it(`${lang}: order window, request forms, prelaunch note, About note and Contact-support languages say so`, () => {
      const d = DICTS[lang];
      for (const [key, text] of [
        ['checkout.phoneHint', d.checkout.phoneHint],
        ['checkout.doneText', d.checkout.doneText],
        ['request.successText', d.request.successText],
        // Prelaunch window note (phase 12): the general-questions e-mail is answered by people, in English.
        ['prelaunch.contactNote', d.prelaunch.contactNote],
        ['About support note', aboutNote(lang)],
        ['Contact support › availability', availability(lang)],
        ['Contact support › languages', languagesSection(lang)],
      ] as const) {
        expect(text, key).toMatch(re);
        // Said of people (the team), not of the assistant.
        expect(sentences(text).some((s) => re.test(s) && HUMAN.test(s) && !ASSISTANT.test(s)), key).toBe(true);
      }
      // Placeholders kept.
      expect(d.checkout.doneText).toContain('{email}');
      expect(d.request.successText).toContain('{name}');
    });
  }
});

describe.each(LANGS)('%s: automated assistant 24/7, human support when needed', (lang) => {
  it('About and Contact-support availability start with the approved sentence', () => {
    expect(aboutText(lang)).toMatch(ASSISTANT_24_7[lang]);
    expect(availability(lang)).toMatch(ASSISTANT_24_7[lang]);
  });

  it('the usual reply time stays « usually », not a contractual guarantee', () => {
    for (const t of [aboutText(lang), availability(lang)]) expect(t).toMatch(/under an hour|moins d’une heure|weniger als einer Stunde|menos de una hora|meno di un’ora|binnen een uur|under en timm?e/);
  });

  const all = () => sentences([DICTS[lang], info(lang)]);

  it('no human team announced as available 24/7', () => {
    const bad = all().filter((s) => /24\/7/.test(s) && HUMAN.test(s) && !ASSISTANT.test(s));
    expect(bad).toEqual([]);
  });

  it('no immediate or guaranteed reply', () => {
    expect(all().filter((s) => NO_PROMISE[lang].test(s))).toEqual([]);
  });

  it('no language claim for the automated assistant', () => {
    expect(all().filter((s) => ASSISTANT.test(s) && LANGUAGE_WORD.test(s))).toEqual([]);
  });
});

describe('en / fr / de / es / it: no « English only » human support', () => {
  const ENGLISH_ONLY: Partial<Record<Lang, RegExp>> = {
    en: words('only|human|personal|staff|team', '[^.]*English'),
    fr: words('uniquement|seulement|humaine|personnelle|équipe', '[^.]*anglais'),
    de: words('nur|ausschließlich|persönliche?[nrsm]?|Team|Mitarbeiter\\p{L}*', '[^.]*Englisch'),
    es: words('solo|solamente|únicamente|humana|personal|equipo', '[^.]*inglés'),
    it: words('solo|soltanto|unicamente|umana|personale|team', '[^.]*inglese'),
  };
  /** Sentences about the legal documents (which are in English) are not about support. */
  const LEGAL = /legal|juridique|Rechts|legales?|legali|privacy|confidentialité|Datenschutz|privacidad|refund|rembours|Erstattung|reembolso|rimborso/i;
  for (const [lang, re] of Object.entries(ENGLISH_ONLY) as Array<[Lang, RegExp]>) {
    it(lang, () => {
      const d = DICTS[lang];
      const focus = [d.checkout.phoneHint, d.checkout.doneText, d.request.successText, aboutNote(lang), availability(lang), languagesSection(lang)];
      expect(sentences(focus).filter((s) => !LEGAL.test(s) && re.test(s))).toEqual([]);
      expect(sentences([d, info(lang)]).filter((s) => !LEGAL.test(s) && re.test(s))).toEqual([]);
    });
  }
});
