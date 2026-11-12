-- Optional marketing consent (owner request): separate from the mandatory contact consent (GDPR).
-- Non-destructive: new column with a safe default; existing rows are untouched.
alter table public.contact_requests
  add column if not exists marketing_opt_in boolean not null default false;

comment on column public.contact_requests.marketing_opt_in is 'Optional, separate consent to receive offers and news by email.';

-- Explicit, column-level privilege (no automatic exposure).
grant insert (marketing_opt_in) on public.contact_requests to anon, authenticated;
