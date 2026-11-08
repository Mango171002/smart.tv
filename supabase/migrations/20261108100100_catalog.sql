-- =============================================================================
-- Commercial catalogue: markets, plans and market-specific price tables.
-- Prices are stored per market in minor units (cents). There is NO currency
-- conversion: each market needs its own approved price table.
-- =============================================================================

create type public.price_status as enum ('illustrative', 'approved', 'retired');

create table public.markets (
  code                  text primary key check (code ~ '^[A-Z]{2}$'),
  name                  text not null check (char_length(name) between 2 and 80),
  currency              char(3) not null check (currency ~ '^[A-Z]{3}$'),
  default_locale        text not null default 'en' check (default_locale in ('en', 'fr')),
  -- Must stay false until written supplier authorisation for this territory is verified.
  licensed              boolean not null default false,
  -- Hard launch gate. Cannot be true unless the territory is licensed.
  sales_enabled         boolean not null default false,
  tax_inclusive_pricing boolean not null default false,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint markets_sales_require_license check (not sales_enabled or licensed)
);

comment on column public.markets.licensed is
  'Territorial redistribution rights verified in writing. Default false.';
comment on column public.markets.sales_enabled is
  'Launch gate: orders cannot reach pending_payment while false.';

create table public.plans (
  id              smallint generated always as identity primary key,
  duration_months smallint not null check (duration_months between 1 and 36),
  streams         smallint not null check (streams between 1 and 10),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  constraint plans_duration_streams_key unique (duration_months, streams)
);

create table public.prices (
  id           uuid primary key default gen_random_uuid(),
  market_code  text not null references public.markets (code) on update cascade on delete restrict,
  plan_id      smallint not null references public.plans (id) on delete restrict,
  currency     char(3) not null,
  amount_minor integer not null check (amount_minor > 0 and amount_minor < 10000000),
  status       public.price_status not null default 'illustrative',
  valid_from   timestamptz not null default now(),
  valid_to     timestamptz,
  created_at   timestamptz not null default now(),
  constraint prices_validity_range check (valid_to is null or valid_to > valid_from)
);

comment on column public.prices.status is
  'illustrative = prototype value, never chargeable. approved = signed-off commercial price.';

-- One open (current) price per market and plan.
create unique index prices_one_open_per_market_plan
  on public.prices (market_code, plan_id)
  where valid_to is null and status <> 'retired';
create index prices_plan_id_idx on public.prices (plan_id);

-- The price currency must always match the market currency.
create or replace function private.enforce_price_currency()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  market_currency char(3);
begin
  select m.currency into market_currency from public.markets m where m.code = new.market_code;
  if market_currency is null or market_currency <> new.currency then
    raise exception 'price currency % does not match market % currency %',
      new.currency, new.market_code, market_currency
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_price_currency() from public;

create trigger prices_enforce_currency
  before insert or update of currency, market_code on public.prices
  for each row execute function private.enforce_price_currency();

create trigger markets_set_updated_at
  before update on public.markets
  for each row execute function private.set_updated_at();
