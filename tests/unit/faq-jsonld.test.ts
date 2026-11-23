import { describe, expect, it } from 'vitest';
import { faqJsonLd } from '@/components/StructuredData';
import en from '@/i18n/dictionaries/en';
import fr from '@/i18n/dictionaries/fr';
import de from '@/i18n/dictionaries/de';
import es from '@/i18n/dictionaries/es';
import it_ from '@/i18n/dictionaries/it';
import nl from '@/i18n/dictionaries/nl';
import sv from '@/i18n/dictionaries/sv';
import nb from '@/i18n/dictionaries/nb';

const DICTS = { en, fr, de, es, it: it_, nl, sv, nb } as const;

describe('FAQPage JSON-LD (phase 10)', () => {
  for (const [lang, d] of Object.entries(DICTS)) {
    it(`${lang}: exactly the visible FAQ items, in the page language, nothing added`, () => {
      const ld = faqJsonLd(d.faq.items, lang as keyof typeof DICTS, `https://sygmatv.com/${lang}`);
      expect(ld['@type']).toBe('FAQPage');
      expect(ld.inLanguage).toBe(lang);
      expect(ld.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(d.faq.items.map((i) => [i.q, i.a]));
      // Only FAQPage / Question / Answer nodes: no rating, review, product or offer markup.
      expect([...JSON.stringify(ld).matchAll(/"@type":"([^"]+)"/g)].map((m) => m[1])).toEqual(['FAQPage', ...d.faq.items.flatMap(() => ['Question', 'Answer'])]);
    });
  }
});
