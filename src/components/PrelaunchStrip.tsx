/**
 * Page-wide prelaunch strip (D-1, phase 15): one discreet line under the header on every page while online orders and
 * free trials are closed (FEATURE_CONTACT_FORM=false — the layout renders it only then). Same text as the title of the
 * Help / About banner (prelaunch.pagesTitle), a link to the plans, no date. Not sticky: it scrolls away with the page.
 * A plain <a> for the link (native in-page scrolling on the home page, like the header menu).
 */
export function PrelaunchStrip({ text, plans }: { text: string; plans: { label: string; href: string } }) {
  return (
    <aside className="prelaunch-strip" aria-labelledby="prelaunch-strip-t" data-testid="prelaunch-strip">
      <div className="wrap prelaunch-strip-in">
        <span className="prelaunch-strip-dot" aria-hidden="true" />
        <span id="prelaunch-strip-t" className="prelaunch-strip-text">{text}</span>
        <a className="prelaunch-strip-link" href={plans.href}>{plans.label}</a>
      </div>
    </aside>
  );
}
