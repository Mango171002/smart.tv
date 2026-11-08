-- =============================================================================
-- Contact / support requests and launch waitlist.
-- The public may only INSERT (no read-back). Database-level throttling protects
-- against abuse even if the Data API is called directly with the publishable key.
-- =============================================================================

create type public.contact_kind as enum ('support', 'launch_waitlist');

create table public.contact_requests (
  id                   uuid primary key default gen_random_uuid(),
  kind                 public.contact_kind not null,
  name                 text check (char_length(name) between 1 and 120),
  email                text not null
                       check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  locale               text not null default 'en' check (locale in ('en', 'fr')),
  market_code          text references public.markets (code) on update cascade on delete set null,
  subject              text check (char_length(subject) between 1 and 150),
  message              text check (char_length(message) <= 4000),
  consent_given        boolean not null,
  consent_text_version text not null check (char_length(consent_text_version) between 1 and 40),
  status               text not null default 'new' check (status in ('new', 'in_progress', 'closed', 'spam')),
  created_at           timestamptz not null default now(),
  constraint contact_requests_consent_required check (consent_given),
  constraint contact_requests_support_has_message
    check (kind <> 'support' or (message is not null and char_length(message) >= 10 and subject is not null))
);

comment on table public.contact_requests is
  'Personal data. Retention policy to be confirmed by counsel (proposed: 12 months).';

create index contact_requests_email_created_idx on public.contact_requests (lower(email), created_at desc);
create index contact_requests_created_idx on public.contact_requests (created_at desc);
create index contact_requests_market_code_idx on public.contact_requests (market_code);
create unique index contact_requests_waitlist_once
  on public.contact_requests (lower(email)) where kind = 'launch_waitlist';

-- PT429 makes PostgREST answer HTTP 429.
-- Throttle: max 5 requests per email per hour and 120 requests per minute globally.
create or replace function private.contact_requests_throttle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  per_email integer;
  global_recent integer;
begin
  select count(*) into per_email
    from public.contact_requests c
   where lower(c.email) = lower(new.email)
     and c.created_at > now() - interval '1 hour';
  if per_email >= 5 then
    raise exception 'too many requests' using errcode = 'PT429';
  end if;

  select count(*) into global_recent
    from public.contact_requests c
   where c.created_at > now() - interval '1 minute';
  if global_recent >= 120 then
    raise exception 'too many requests' using errcode = 'PT429';
  end if;

  -- Never trust client-supplied server fields.
  new.status := 'new';
  new.created_at := now();
  return new;
end;
$$;
revoke all on function private.contact_requests_throttle() from public;

create trigger contact_requests_throttle
  before insert on public.contact_requests
  for each row execute function private.contact_requests_throttle();
