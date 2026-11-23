import en from '../../src/i18n/dictionaries/en';

/**
 * Online requests (orders, free trials, support form) in the build under test. Default: closed, as in production
 * (FEATURE_CONTACT_FORM=false, prelaunch hotfix). ORDERS_OPEN=true (or E2E_ORDERS_OPEN=true) for a build made — and
 * started — with FEATURE_CONTACT_FORM=true: the tests that fill the forms run there, unchanged.
 */
export const ORDERS_OPEN = process.env.ORDERS_OPEN === 'true' || process.env.E2E_ORDERS_OPEN === 'true';

/** English label of the simulator's order button in the build under test (« Orders opening soon » while closed). */
export const ORDER_LABEL = ORDERS_OPEN ? en.plans.previewCheckout : `${en.prelaunch.orderTitleA} ${en.prelaunch.orderTitleHl}`;
/** Accessible name of that button (the label, then an arrow icon). */
export const ORDER_BUTTON = new RegExp(`^${ORDER_LABEL}`);
/** English label of the free-trial button of the closing banner in the build under test. */
export const TRIAL_LABEL = ORDERS_OPEN ? en.cta.trial : `${en.prelaunch.trialTitleA} ${en.prelaunch.trialTitleHl}`;
