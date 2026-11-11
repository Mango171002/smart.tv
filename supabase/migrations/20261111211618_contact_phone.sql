-- Phone number (international E.164 format, e.g. +14155550123) for trial and support requests.
-- Non-destructive: new nullable column + checks; existing rows are untouched.
alter table public.contact_requests
  add column if not exists phone text
    check (phone ~ '^\+[1-9][0-9]{6,14}$');

comment on column public.contact_requests.phone is 'Personal data. E.164 phone number given for a trial or support request.';

-- A trial request must say who is asking and how to call them back.
alter table public.contact_requests
  add constraint contact_requests_trial_has_contact
    check (kind <> 'trial_request' or (name is not null and phone is not null));

-- Explicit, column-level privilege (no automatic exposure).
grant insert (phone) on public.contact_requests to anon, authenticated;
