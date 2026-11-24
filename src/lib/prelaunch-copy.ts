import type { Dictionary } from '@/i18n/dictionaries';
import { faqItems } from '@/lib/faq';

/** Label of the buttons that open the (prelaunch) order window while online orders are closed. */
export const prelaunchOrderLabel = (p: Dictionary['prelaunch']) => `${p.orderTitleA} ${p.orderTitleHl}`;
/** Label of the buttons that open the (prelaunch) free-trial window while free trials are closed. */
export const prelaunchTrialLabel = (p: Dictionary['prelaunch']) => `${p.trialTitleA} ${p.trialTitleHl}`;

/**
 * Site copy for the current state of online requests (FEATURE_CONTACT_FORM, read server-side by
 * isContactFormEnabled()). Open: the dictionary itself, unchanged. Closed (prelaunch): the same dictionary with the
 * texts that present ordering, free trials or activation as available now replaced by their `prelaunch` variants —
 * home meta description, hero lead, benefits, simulator button and point, « How it works », closing banner and the
 * FAQ answers (src/lib/faq.ts) — and WhatsApp is not offered as a contact channel (support benefit, guided-setup item of
 * the plans trust bar, « Support » row of the comparison table: e-mail only). Applied once, server-side, before the
 * dictionary is passed to any component, so client components only ever receive resolved strings; refund, price and
 * legal wording is never touched.
 */
export function prelaunchCopy<D extends Dictionary>(dict: D, ordersOpen: boolean): D {
  if (ordersOpen) return dict;
  const p = dict.prelaunch;
  const h = p.home;
  const at = <T>(list: readonly T[], i: number, fn: (v: T) => T) => list.map((v, j) => (j === i ? fn(v) : v));
  return {
    ...dict,
    meta: { ...dict.meta, homeDescription: p.metaDescription },
    hero: { ...dict.hero, lead: h.heroLead },
    benefits: at(at(at(dict.benefits, 0, () => ({ title: h.orderBenefitTitle, text: h.orderBenefitText })), 3, (b) => ({ ...b, text: h.trialBenefitText })), 4, (b) => ({ ...b, text: h.supportBenefitText })),
    plans: {
      ...dict.plans,
      previewCheckout: prelaunchOrderLabel(p),
      simulatorPoints: at(dict.plans.simulatorPoints, 3, () => h.trialGuarantee),
      trust: at(dict.plans.trust, 0, (t) => ({ ...t, text: h.setupText })),
      compare: {
        ...dict.plans.compare,
        // The « Support » row is the only one whose values are all texts (the others are ticks).
        rows: dict.plans.compare.rows.map((r) => (r.values.every((v) => typeof v === 'string') ? { ...r, values: r.values.map(() => h.compareSupport) } : r)) as D['plans']['compare']['rows'],
      },
    },
    how: {
      ...dict.how,
      steps: at(at(dict.how.steps, 1, (s) => ({ ...s, text: h.orderStepText })), 2, (s) => ({ ...s, text: h.activationStepText })),
      note: h.howNote,
    },
    cta: { ...dict.cta, trial: prelaunchTrialLabel(p), text2: h.trialGuarantee },
    faq: { ...dict.faq, items: faqItems(dict, false) },
  };
}
