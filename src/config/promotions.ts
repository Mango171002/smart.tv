/**
 * Promotions shown on the site.
 *
 * `bonusDays` — the « +30 days free » offer on the Plus and Ultra+ plans (badge on the plan cards and « +30 days free »
 * row of the comparison table, text `plans.bonus` in every dictionary). Hidden since owner decision B6 (24/11/2026):
 * its conditions (terms, start and end dates) are not defined yet and counsel has not drafted them
 * (docs/release/phase13/owner-approval.md, B6 and wording annex W9). Set `enabled: true` here — no component change —
 * only once the conditions are written and approved; the badge and the table row then come back as before.
 */
export interface PromotionsConfig {
  bonusDays: { enabled: boolean };
}

export const PROMOTIONS: PromotionsConfig = {
  bonusDays: { enabled: false },
};

/**
 * Rows of the plan comparison table to display: the « +30 days free » row (its label is the dictionary's
 * `plans.bonus`, in every language) only while the bonus-days promotion is enabled.
 */
export function visibleCompareRows<R extends { label: string }>(rows: readonly R[], bonusLabel: string, promotions: PromotionsConfig = PROMOTIONS): R[] {
  return promotions.bonusDays.enabled ? [...rows] : rows.filter((r) => r.label !== bonusLabel);
}
