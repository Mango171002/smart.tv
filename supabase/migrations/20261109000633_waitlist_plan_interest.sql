-- =============================================================================
-- Pre-launch: a pre-registration records the plan and device the visitor is
-- interested in. No payment and no order is created.
-- =============================================================================
alter table public.contact_requests
  add column interest_duration_months smallint check (interest_duration_months between 1 and 36),
  add column interest_streams smallint check (interest_streams between 1 and 10),
  add column preferred_device text check (preferred_device in ('smart_tv', 'streaming_device', 'mobile', 'computer'));

comment on column public.contact_requests.interest_duration_months is 'Pre-registration: plan duration of interest (no commitment).';

-- Explicit column privileges for the new fields (no automatic exposure).
grant insert (interest_duration_months, interest_streams, preferred_device)
  on public.contact_requests to anon, authenticated;
