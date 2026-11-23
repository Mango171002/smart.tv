import { Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { siteConfig } from '@/config/site';
import type { Dictionary } from '@/i18n/dictionaries';

/**
 * Prelaunch state (phase 11B), shown inside the order, free-trial and support windows while online requests are
 * closed (FEATURE_CONTACT_FORM=false): an explanation, optional content (the order summary), the e-mail for general
 * questions only, and one button to leave. No form and nothing is sent, so nothing can fail at submission.
 */
export function PrelaunchNotice({
  text,
  dict,
  action,
  onAction,
  children,
}: {
  text: string;
  dict: Dictionary['prelaunch'];
  action: string;
  onAction: () => void;
  children?: ReactNode;
}) {
  const email = siteConfig.supportEmail;
  return (
    <div className="prelaunch" data-testid="prelaunch-notice">
      <p className="prelaunch-text">{text}</p>
      {children}
      {email && (
        <p className="prelaunch-contact">
          <Mail size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>
            {dict.contactLead} <a href={`mailto:${email}`}>{email}</a>
          </span>
        </p>
      )}
      <p className="prelaunch-note">{dict.contactNote}</p>
      <button type="button" className="btn btn-lime prelaunch-action" onClick={onAction} data-testid="prelaunch-action">
        {action}
      </button>
    </div>
  );
}
