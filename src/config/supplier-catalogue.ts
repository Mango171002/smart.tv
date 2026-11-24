/**
 * Supplier-confirmed OVERALL catalogue specifications — PROPOSAL (not released; owner decision 24/11/2026,
 * docs/release/phase13/decision-register.md D6 « Owner update », docs/release/final/supplier-specs-proposal.md).
 *
 * - These are the supplier's whole-catalogue totals. They are NOT per-plan figures (the per-plan switch is
 *   src/config/catalogue.ts and stays all `null`) and NOT evidence of broadcasting rights in any country.
 * - Shown once on the home page, as one qualified sentence under the plans comparison (`plans.compare.supplierCatalogue`),
 *   never in the page title, meta description or JSON-LD (search snippets would drop the qualifier).
 * - Set to `null` to hide the sentence everywhere (revert path).
 */
export const SUPPLIER_CATALOGUE: { channels: number; vod: number } | null = {
  channels: 35000,
  vod: 200000,
};
