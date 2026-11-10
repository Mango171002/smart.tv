-- =============================================================================
-- New offer structure: 3 tiers (starter / plus / ultra) x 4 terms
-- (12m / 24m / 36m / lifetime) x 1-4 simultaneous streams, planned prices in USD.
-- Previous plans (duration x streams) are DEACTIVATED and their prices RETIRED:
-- nothing is deleted.
-- =============================================================================

create table public.plan_tiers (
  code       text primary key check (code in ('starter', 'plus', 'ultra')),
  sort_order smallint not null unique,
  max_quality text not null check (max_quality in ('hd', 'fhd', 'uhd')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.plan_tiers is 'Commercial tiers. Features are described in the app (i18n); channel counts are not stored until verified.';

-- plans: a plan is now tier + term + streams. Legacy rows keep their duration/streams.
alter table public.plans drop constraint plans_duration_streams_key;
alter table public.plans alter column duration_months drop not null;
alter table public.plans
  add column tier_code text references public.plan_tiers (code) on update cascade on delete restrict,
  add column term text check (term in ('12m', '24m', '36m', 'lifetime'));

-- Exactly one of: legacy plan (duration+streams) or tiered plan (tier+term).
alter table public.plans add constraint plans_shape_check check (
  (tier_code is null and term is null and duration_months is not null)
  or (tier_code is not null and term is not null and
      ((term = 'lifetime' and duration_months is null) or (term <> 'lifetime' and duration_months is not null)))
);
create unique index plans_legacy_key on public.plans (duration_months, streams) where tier_code is null;
create unique index plans_tier_term_streams_key on public.plans (tier_code, term, streams) where tier_code is not null;
create index plans_tier_code_idx on public.plans (tier_code);

-- Retire the previous offer (kept for history).
update public.plans set is_active = false where tier_code is null and is_active;
update public.prices set status = 'retired', valid_to = now()
 where status <> 'retired' and valid_to is null
   and plan_id in (select id from public.plans where tier_code is null);

-- Pre-registrations may record the tier/term of interest.
alter table public.contact_requests
  add column interest_tier text check (interest_tier in ('starter', 'plus', 'ultra')),
  add column interest_term text check (interest_term in ('12m', '24m', '36m', 'lifetime'));

-- ---------------------------------------------------------------------------
-- Explicit privileges (no automatic exposure) + RLS
-- ---------------------------------------------------------------------------
alter table public.plan_tiers enable row level security;
revoke all on public.plan_tiers from anon, authenticated, service_role, public;
grant select on public.plan_tiers to anon, authenticated;
grant select, insert, update on public.plan_tiers to service_role;
create policy "plan_tiers: public read active"
  on public.plan_tiers for select to anon, authenticated
  using (is_active);

grant insert (interest_tier, interest_term) on public.contact_requests to anon, authenticated;
