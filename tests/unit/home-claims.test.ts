import { describe, expect, it } from 'vitest';
import en from '@/i18n/dictionaries/en';
import { CATALOGUE } from '@/config/catalogue';
import { TIERS } from '@/lib/pricing';

/** Home page (phase 6A): premium wording without unproven claims; owner-validated facts only. */
const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];

const HOME = [en.meta.homeTitle, en.meta.homeDescription, en.hero, en.benefits, en.featured.title, en.featured.carouselLabel, en.plans, en.content, en.devices, en.how, en.cta, en.faq];
const text = strings(HOME).join('\n');

describe('home page wording (phase 6A)', () => {
  it('title and description fit the search result (≤ 60 / ≤ 155 characters)', () => {
    expect(en.meta.homeTitle.length).toBeLessThanOrEqual(60);
    expect(en.meta.homeDescription.length).toBeGreaterThanOrEqual(70);
    expect(en.meta.homeDescription.length).toBeLessThanOrEqual(155);
  });

  it('makes no unproven volume, replay, superlative, VIP, server or worldwide claim', () => {
    for (const re of [/\d{1,3},\d{3}/, /\d+\s*\+\s/, /\breplay\b/i, /\bbest\b/i, /\bultimate\b/i, /\biptv\b/i, /\bvip\b/i, /priority/i, /premium servers?/i, /stabili[sz]ed|high-stability/i, /around the world/i, /international channels/i, /step-by-step guide per device/i, /help centre/i, /most watched/i])
      expect(text, String(re)).not.toMatch(re);
  });

  it('hero and search snippet do not lead with sports', () => {
    expect(strings([en.meta.homeTitle, en.meta.homeDescription, en.hero]).join(' ')).not.toMatch(/sport/i);
  });

  it('4K / HDR and the TV guide are always qualified « where available »', () => {
    // Sentences: qualified in the sentence itself.
    for (const s of strings([en.plans.sub, en.cta, en.hero]).filter((x) => /4K|HDR/.test(x))) expect(s, s).toMatch(/where available/);
    // Plan cards: short one-line features, qualified by the card note shown right below them.
    for (const [name, tier] of Object.entries(en.plans.tiers)) {
      const features = tier.features.map((f) => f.text).join(' ');
      if (/4K|HDR/.test(features)) expect(tier.note, name).toMatch(/4K[^.]*where available/);
      if (/TV guide/.test(features)) expect(tier.note, name).toMatch(/TV guide where available/);
    }
    expect(en.plans.compare.note).toMatch(/where available/);
  });

  it('per-plan channel and movie counts stay hidden until confirmed in writing', () => {
    for (const t of TIERS) expect(CATALOGUE[t]).toEqual({ channels: null, vod: null });
  });

  it('FAQ: assisted order (activation, then payment) and a link to the refund policy', () => {
    const items = en.faq.items as Array<{ q: string; a: string; link?: { href: string; label: string } }>;
    expect(items.find((i) => i.q === 'Can I subscribe now?')!.a).toMatch(/activates your access, and you pay after activation/);
    expect(items.find((i) => i.q === 'Can I cancel?')!.link).toEqual({ href: '/legal/refunds', label: 'Read our refund policy' });
    expect(items.find((i) => i.q === 'Which countries are available?')!.a).not.toMatch(/United States|Canada|Europe/);
  });

  it('support facts as approved: a 24/7 automated assistant, human help when needed, email & WhatsApp (phase 13, D8)', () => {
    expect(text).toMatch(/24\/7 automated assistant/);
    expect(text).toMatch(/human help when needed/);
    expect(text).toMatch(/WhatsApp/);
    // « 24/7 » always names the assistant, never a support team; no language count on the home page (the six support
    // languages are listed on the About and Contact support pages).
    for (const s of strings(HOME).filter((x) => /24\/7/.test(x))) expect(s, s).toMatch(/assistant/i);
    expect(text).not.toMatch(/24\/7 support|support 24\/7|\b(6|six) languages/i);
  });

  it('order window: activation first, then payment instructions on WhatsApp (phase 6B)', () => {
    expect(en.checkout.productionNote).toMatch(/Nothing is charged on this website/);
    expect(en.checkout.productionNote).toMatch(/activates your access, then sends you the payment instructions/);
    expect(en.checkout.productionNote).not.toMatch(/confirms your order and payment/);
  });
});
