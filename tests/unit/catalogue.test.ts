import { describe, expect, it } from 'vitest';
import { CATALOGUE } from '@/config/catalogue';
import { TIERS } from '@/lib/pricing';
import en from '@/i18n/dictionaries/en';


describe('catalogue counts', () => {
  it('are either unset (hidden) or positive whole numbers', () => {
    for (const t of TIERS) {
      for (const v of [CATALOGUE[t].channels, CATALOGUE[t].vod]) {
        if (v !== null) expect(Number.isInteger(v) && v > 0).toBe(true);
      }
    }
  });
  it('never decrease from Starter to Ultra once set', () => {
    for (const k of ['channels', 'vod'] as const) {
      const vals = TIERS.map((t) => CATALOGUE[t][k]).filter((v): v is number => v !== null);
      expect([...vals].sort((a, b) => a - b)).toEqual(vals);
    }
  });
  it('have wording in both languages', () => {
    for (const d of [en]) {
      expect(d.plans.catalogueChannels).toContain('{n}');
      expect(d.plans.catalogueVod).toContain('{n}');
    }
  });
});
