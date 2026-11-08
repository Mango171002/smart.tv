-- =============================================================================
-- Customers, orders, auditable order state machine and payment webhooks.
-- Writes happen exclusively server-side (service_role). Customers can only read
-- their own data. No credentials, M3U URLs or activation secrets are stored.
-- =============================================================================

create type public.order_status as enum (
  'draft', 'pending_payment', 'paid', 'fulfilling', 'fulfilled',
  'cancelled', 'refunded', 'failed'
);

create table public.customers (
  id                   uuid primary key references auth.users (id) on delete cascade,
  email                text not null check (char_length(email) <= 254),
  full_name            text check (char_length(full_name) <= 120),
  country_code         text check (country_code ~ '^[A-Z]{2}$'),
  preferred_locale     text not null default 'en' check (preferred_locale in ('en', 'fr')),
  marketing_consent    boolean not null default false,
  marketing_consent_at timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  reference         text not null unique
                    default ('ORD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  customer_id       uuid references public.customers (id) on delete set null,
  email             text not null
                    check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  market_code       text not null references public.markets (code) on update cascade on delete restrict,
  plan_id           smallint not null references public.plans (id) on delete restrict,
  price_id          uuid not null references public.prices (id) on delete restrict,
  currency          char(3) not null,
  subtotal_minor    integer not null check (subtotal_minor >= 0),
  tax_minor         integer not null default 0 check (tax_minor >= 0),
  total_minor       integer generated always as (subtotal_minor + tax_minor) stored,
  status            public.order_status not null default 'draft',
  idempotency_key   text not null unique check (char_length(idempotency_key) between 16 and 128),
  payment_provider  text check (char_length(payment_provider) <= 40),
  payment_reference text check (char_length(payment_reference) <= 200),
  terms_version     text check (char_length(terms_version) <= 40),
  terms_accepted_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint orders_payment_ref_key unique (payment_provider, payment_reference)
);

create index orders_customer_id_idx on public.orders (customer_id);
create index orders_market_code_idx on public.orders (market_code);
create index orders_plan_id_idx on public.orders (plan_id);
create index orders_price_id_idx on public.orders (price_id);
create index orders_status_created_idx on public.orders (status, created_at desc);

create table public.order_events (
  id          bigint generated always as identity primary key,
  order_id    uuid not null references public.orders (id) on delete cascade,
  from_status public.order_status,
  to_status   public.order_status not null,
  actor       text not null,
  note        text check (char_length(note) <= 500),
  created_at  timestamptz not null default now()
);
create index order_events_order_id_idx on public.order_events (order_id, created_at);

create table public.payment_webhook_events (
  id                uuid primary key default gen_random_uuid(),
  provider          text not null check (char_length(provider) <= 40),
  provider_event_id text not null check (char_length(provider_event_id) <= 200),
  event_type        text not null check (char_length(event_type) <= 120),
  order_id          uuid references public.orders (id) on delete set null,
  payload           jsonb not null,
  received_at       timestamptz not null default now(),
  processed_at      timestamptz,
  processing_error  text,
  -- Idempotency: one row per provider event, replays are rejected.
  constraint payment_webhook_events_provider_event_key unique (provider, provider_event_id)
);
create index payment_webhook_events_order_id_idx on public.payment_webhook_events (order_id);
create index payment_webhook_events_unprocessed_idx
  on public.payment_webhook_events (received_at) where processed_at is null;

-- ---------------------------------------------------------------------------
-- Customer profile bootstrap from Supabase Auth.
-- ---------------------------------------------------------------------------
create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.customers (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_auth_user() from public;

create trigger on_auth_user_created_create_customer
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

create or replace function private.customers_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.marketing_consent is distinct from old.marketing_consent then
    new.marketing_consent_at := case when new.marketing_consent then now() else null end;
  end if;
  return new;
end;
$$;
revoke all on function private.customers_before_update() from public;

create trigger customers_before_update
  before update on public.customers
  for each row execute function private.customers_before_update();

-- ---------------------------------------------------------------------------
-- Order state machine, launch gate and immutability.
-- ---------------------------------------------------------------------------
create or replace function private.order_transition_allowed(
  from_status public.order_status,
  to_status public.order_status
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select (from_status, to_status) in (
    ('draft'::public.order_status,           'pending_payment'::public.order_status),
    ('draft'::public.order_status,           'cancelled'::public.order_status),
    ('pending_payment'::public.order_status, 'paid'::public.order_status),
    ('pending_payment'::public.order_status, 'failed'::public.order_status),
    ('pending_payment'::public.order_status, 'cancelled'::public.order_status),
    ('failed'::public.order_status,          'pending_payment'::public.order_status),
    ('failed'::public.order_status,          'cancelled'::public.order_status),
    ('paid'::public.order_status,            'fulfilling'::public.order_status),
    ('paid'::public.order_status,            'refunded'::public.order_status),
    ('fulfilling'::public.order_status,      'fulfilled'::public.order_status),
    ('fulfilling'::public.order_status,      'failed'::public.order_status),
    ('fulfilled'::public.order_status,       'refunded'::public.order_status)
  );
$$;
revoke all on function private.order_transition_allowed(public.order_status, public.order_status) from public;

create or replace function private.orders_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  p record;
  m record;
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft' then
      raise exception 'orders must be created in draft status' using errcode = 'check_violation';
    end if;
  else
    -- Pricing and identity fields are frozen once the order leaves draft.
    if old.status <> 'draft' and (
         new.price_id is distinct from old.price_id
      or new.plan_id is distinct from old.plan_id
      or new.market_code is distinct from old.market_code
      or new.currency is distinct from old.currency
      or new.subtotal_minor is distinct from old.subtotal_minor
      or new.tax_minor is distinct from old.tax_minor
      or new.email is distinct from old.email
      or new.idempotency_key is distinct from old.idempotency_key
    ) then
      raise exception 'order % is frozen (status %)', old.reference, old.status
        using errcode = 'check_violation';
    end if;

    if new.status is distinct from old.status
       and not private.order_transition_allowed(old.status, new.status) then
      raise exception 'invalid order transition % -> %', old.status, new.status
        using errcode = 'check_violation';
    end if;
    new.updated_at := now();
  end if;

  -- Price must belong to the order's market and plan, in the same currency.
  select pr.market_code, pr.plan_id, pr.currency, pr.status, pr.amount_minor
    into p from public.prices pr where pr.id = new.price_id;
  if p is null or p.market_code <> new.market_code or p.plan_id <> new.plan_id
     or p.currency <> new.currency then
    raise exception 'price does not match order market/plan/currency' using errcode = 'check_violation';
  end if;
  if new.subtotal_minor <> p.amount_minor then
    raise exception 'subtotal must equal the server price' using errcode = 'check_violation';
  end if;

  -- LAUNCH GATE: no order may request payment unless the market is licensed,
  -- sales are enabled and the price has been commercially approved.
  if new.status = 'pending_payment' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    select mk.licensed, mk.sales_enabled into m from public.markets mk where mk.code = new.market_code;
    if not coalesce(m.licensed, false) or not coalesce(m.sales_enabled, false) then
      raise exception 'sales are not enabled for market %', new.market_code using errcode = 'check_violation';
    end if;
    if p.status <> 'approved' then
      raise exception 'price is not approved for sale' using errcode = 'check_violation';
    end if;
    if new.terms_accepted_at is null or new.terms_version is null then
      raise exception 'terms must be accepted before payment' using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;
revoke all on function private.orders_guard() from public;

create trigger orders_guard
  before insert or update on public.orders
  for each row execute function private.orders_guard();

-- Who is acting: API role from the JWT when called through the Data API,
-- otherwise the database session user (migrations, SQL console).
create or replace function private.current_actor()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    session_user::text
  );
$$;
revoke all on function private.current_actor() from public;

-- Audit trail: every creation and status change is recorded.
create or replace function private.orders_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_events (order_id, from_status, to_status, actor)
    values (new.id, null, new.status, private.current_actor());
  elsif new.status is distinct from old.status then
    insert into public.order_events (order_id, from_status, to_status, actor)
    values (new.id, old.status, new.status, private.current_actor());
  end if;
  return null;
end;
$$;
revoke all on function private.orders_audit() from public;

create trigger orders_audit
  after insert or update of status on public.orders
  for each row execute function private.orders_audit();
