/**
 * New content pages (About us, Help center) — phase 5C, owner approval required before publication.
 *
 * NEXT_PUBLIC_CONTENT_PAGES (read at build time):
 * - unset (production today): the pages do not exist (404), /help keeps redirecting to /#faq, nothing in
 *   the sitemap, no new link: the site is byte-identical to before.
 * - 'preview': pages rendered for review with `noindex`, never in the sitemap (private previews and tests).
 * - 'live': published — indexable, in the sitemap, linked from the header and the footer.
 */
const mode = process.env.NEXT_PUBLIC_CONTENT_PAGES;
export const CONTENT_PAGES: 'off' | 'preview' | 'live' = mode === 'live' ? 'live' : mode === 'preview' ? 'preview' : 'off';
export const contentPagesEnabled = () => CONTENT_PAGES !== 'off';
export const contentPagesIndexable = () => CONTENT_PAGES === 'live';
