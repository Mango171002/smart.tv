import { siteConfig, type SiteConfig } from './site';

/**
 * Launch gate: real sales can only be enabled when EVERY blocker is resolved AND
 * the operator explicitly sets SALES_ENABLED=true. The database enforces the same
 * rule independently (markets.licensed / sales_enabled, prices.status = 'approved').
 */
export type LaunchBlocker =
  | 'brand_not_decided'
  | 'domain_not_decided'
  | 'no_licensed_territory'
  | 'legal_entity_missing'
  | 'support_contact_missing'
  | 'payment_provider_missing'
  | 'refund_policy_missing'
  | 'activation_provider_missing'
  | 'tax_rules_missing'
  | 'sales_flag_off';

export function getLaunchBlockers(
  config: Pick<
    SiteConfig,
    | 'brandIsPlaceholder'
    | 'domain'
    | 'licensedTerritories'
    | 'legalEntity'
    | 'legalAddress'
    | 'supportEmail'
    | 'paymentProvider'
    | 'refundPolicy'
    | 'activationProvider'
    | 'taxRules'
  > = siteConfig,
  salesFlag: string | undefined = process.env.SALES_ENABLED,
): LaunchBlocker[] {
  const blockers: LaunchBlocker[] = [];
  if (config.brandIsPlaceholder) blockers.push('brand_not_decided');
  if (!config.domain) blockers.push('domain_not_decided');
  if (config.licensedTerritories.length === 0) blockers.push('no_licensed_territory');
  if (!config.legalEntity || !config.legalAddress) blockers.push('legal_entity_missing');
  if (!config.supportEmail) blockers.push('support_contact_missing');
  if (!config.paymentProvider) blockers.push('payment_provider_missing');
  if (!config.refundPolicy) blockers.push('refund_policy_missing');
  if (!config.activationProvider) blockers.push('activation_provider_missing');
  if (!config.taxRules) blockers.push('tax_rules_missing');
  if (salesFlag !== 'true') blockers.push('sales_flag_off');
  return blockers;
}

export function isSalesEnabled(...args: Parameters<typeof getLaunchBlockers>): boolean {
  return getLaunchBlockers(...args).length === 0;
}
