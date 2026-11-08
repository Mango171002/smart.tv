-- =============================================================================
-- Explicit Data API privileges + Row Level Security (least privilege).
--
--   anon / authenticated : read published catalogue, submit contact requests
--   authenticated        : read own customer profile, orders and order events;
--                          update a few profile columns
--   service_role         : server-side writes (orders, webhooks, catalogue admin)
--                          — never exposed to the browser
-- =============================================================================

-- Start from zero on every table (defensive, in case defaults were applied).
revoke all on table
  public.markets, public.plans, public.prices,
  public.customers, public.orders, public.order_events,
  public.payment_webhook_events, public.contact_requests
from anon, authenticated, service_role, public;

-- Enable RLS everywhere.
alter table public.markets                enable row level security;
alter table public.plans                  enable row level security;
alter table public.prices                 enable row level security;
alter table public.customers              enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_events           enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.contact_requests       enable row level security;

-- ---------------------------------------------------------------------------
-- Catalogue (public read-only)
-- ---------------------------------------------------------------------------
grant select on public.markets, public.plans, public.prices to anon, authenticated;

create policy "markets: public read active"
  on public.markets for select to anon, authenticated
  using (is_active);

create policy "plans: public read active"
  on public.plans for select to anon, authenticated
  using (is_active);

create policy "prices: public read current"
  on public.prices for select to anon, authenticated
  using (
    status <> 'retired'
    and valid_from <= now()
    and (valid_to is null or valid_to > now())
  );

-- ---------------------------------------------------------------------------
-- Contact requests (insert-only, column-restricted, no read-back)
-- ---------------------------------------------------------------------------
grant insert (kind, name, email, locale, market_code, subject, message, consent_given, consent_text_version)
  on public.contact_requests to anon, authenticated;

create policy "contact_requests: public insert with consent"
  on public.contact_requests for insert to anon, authenticated
  with check (consent_given and status = 'new');

-- ---------------------------------------------------------------------------
-- Customers (own row only)
-- ---------------------------------------------------------------------------
grant select on public.customers to authenticated;
grant update (full_name, country_code, preferred_locale, marketing_consent)
  on public.customers to authenticated;

create policy "customers: read own"
  on public.customers for select to authenticated
  using (id = (select auth.uid()));

create policy "customers: update own"
  on public.customers for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Orders & order events (read own only; writes are server-side)
-- ---------------------------------------------------------------------------
grant select on public.orders, public.order_events to authenticated;

create policy "orders: read own"
  on public.orders for select to authenticated
  using (customer_id = (select auth.uid()));

create policy "order_events: read own"
  on public.order_events for select to authenticated
  using (exists (
    select 1 from public.orders o
     where o.id = order_events.order_id
       and o.customer_id = (select auth.uid())
  ));

-- payment_webhook_events: RLS enabled, no policy => invisible to anon/authenticated.

-- ---------------------------------------------------------------------------
-- service_role: explicit, minimal server-side privileges (no DELETE, no TRUNCATE).
-- ---------------------------------------------------------------------------
grant select, insert, update on public.markets, public.prices to service_role;
grant select, insert, update on public.plans to service_role;
grant usage on sequence public.plans_id_seq to service_role;
grant select, update on public.customers to service_role;
grant select, insert, update on public.orders to service_role;
grant select on public.order_events to service_role;
grant select, insert, update on public.payment_webhook_events to service_role;
grant select, insert, update on public.contact_requests to service_role;
