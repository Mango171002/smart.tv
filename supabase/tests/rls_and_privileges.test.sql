-- =============================================================================
-- Security & integrity tests for the Smart TV schema.
-- Pure SQL (no psql meta-commands) so it can run locally AND on the remote
-- development project. Everything runs inside a transaction that is ROLLED BACK:
-- no data is left behind. Any failed assertion raises and aborts.
-- =============================================================================
begin;

create temporary table _t (name text primary key, ok boolean not null);
grant all on _t to anon, authenticated, service_role;

create or replace function pg_temp.expect_error(sql text, expected_state text, label text)
returns void language plpgsql as $$
begin
  begin
    execute sql;
  exception when others then
    if sqlstate = expected_state or expected_state is null then
      insert into _t values (label, true);
      return;
    end if;
    raise exception 'TEST FAILED [%]: expected SQLSTATE %, got % (%)', label, expected_state, sqlstate, sqlerrm;
  end;
  raise exception 'TEST FAILED [%]: statement succeeded but should have failed', label;
end $$;

create or replace function pg_temp.check(cond boolean, label text)
returns void language plpgsql as $$
begin
  if not coalesce(cond, false) then
    raise exception 'TEST FAILED [%]', label;
  end if;
  insert into _t values (label, true);
end $$;
grant execute on function pg_temp.expect_error(text, text, text), pg_temp.check(boolean, text)
  to anon, authenticated, service_role;

-- ---------- Structure: RLS enabled everywhere, no automatic exposure ----------
select pg_temp.check(
  (select bool_and(c.relrowsecurity) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'), 'rls enabled on every public table');

select pg_temp.check(
  not exists (select 1 from information_schema.role_table_grants
               where table_schema = 'public' and grantee in ('anon', 'authenticated')
                 and privilege_type in ('DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')),
  'no delete/truncate/references/trigger for API roles');

select pg_temp.check(
  not exists (select 1 from information_schema.role_table_grants
               where table_schema = 'public' and grantee = 'anon'
                 and table_name in ('customers', 'orders', 'order_events', 'payment_webhook_events')),
  'anon has no privilege on customer/order/webhook tables');

select pg_temp.check(
  not has_schema_privilege('anon', 'private', 'USAGE')
  and not has_schema_privilege('authenticated', 'private', 'USAGE'),
  'private schema not usable by API roles');

-- A table created after the baseline is NOT exposed automatically.
create table public._exposure_probe (id int);
select pg_temp.check(
  not has_table_privilege('anon', 'public._exposure_probe', 'SELECT')
  and not has_table_privilege('authenticated', 'public._exposure_probe', 'SELECT')
  and not has_table_privilege('service_role', 'public._exposure_probe', 'SELECT'),
  'new tables are not auto-exposed');
drop table public._exposure_probe;

-- ---------- Seed sanity ----------
select pg_temp.check((select count(*) = 3 from public.markets), 'three markets seeded');
select pg_temp.check((select count(*) = 3 from public.plan_tiers), 'three tiers seeded');
select pg_temp.check((select count(*) = 48 from public.plans where tier_code is not null and is_active), '48 tier/term/stream plans active');
select pg_temp.check((select count(*) = 16 from public.plans where tier_code is null and not is_active), 'legacy plans kept but inactive');
select pg_temp.check((select count(*) = 48 from public.prices where status = 'illustrative' and valid_to is null), '48 current planned prices');
select pg_temp.check((select count(*) = 48 from public.prices where status = 'retired' and valid_to is not null), 'legacy prices retired, not deleted');
select pg_temp.check((select bool_and(duration_months is null) from public.plans where term = 'lifetime'), 'lifetime plans have no duration');
select pg_temp.expect_error($$insert into public.plans (tier_code, term, duration_months, streams) values ('plus', '12m', 12, 2)$$,
  '23505', 'one plan per tier, term and streams');
select pg_temp.expect_error($$insert into public.plans (tier_code, term, duration_months, streams) values ('plus', 'lifetime', 12, 2)$$,
  '23514', 'lifetime plan cannot have a duration');
select pg_temp.check(not exists (select 1 from public.markets where licensed or sales_enabled), 'no market licensed or selling');
select pg_temp.check(not exists (select 1 from public.prices where status = 'approved'), 'no approved prices');
select pg_temp.check(
  (select amount_minor from public.prices pr join public.plans p on p.id = pr.plan_id
    where pr.market_code = 'US' and p.tier_code = 'starter' and p.term = '12m' and p.streams = 1 and pr.valid_to is null) = 4900,
  'Starter 12 months, 1 screen = 49.00 USD');
select pg_temp.check(
  (select amount_minor from public.prices pr join public.plans p on p.id = pr.plan_id
    where pr.market_code = 'US' and p.tier_code = 'ultra' and p.term = 'lifetime' and p.streams = 1 and pr.valid_to is null) = 19900,
  'Ultra lifetime, 1 screen = 199.00 USD');
select pg_temp.check(
  (select amount_minor from public.prices pr join public.plans p on p.id = pr.plan_id
    where pr.market_code = 'US' and p.tier_code = 'ultra' and p.term = 'lifetime' and p.streams = 4 and pr.valid_to is null) = 34900,
  'Ultra lifetime, 4 screens = 349.00 USD');

-- ---------- Integrity constraints ----------
select pg_temp.expect_error($$update public.markets set sales_enabled = true where code = 'US'$$,
  '23514', 'sales cannot be enabled on unlicensed market');
select pg_temp.expect_error(
  $$insert into public.prices (market_code, plan_id, currency, amount_minor)
    select 'EU', id, 'USD', 100 from public.plans limit 1$$, '23514', 'price currency must match market');

-- ---------- Fixtures (as postgres) ----------
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000000001', 'alice@example.test'),
  ('00000000-0000-4000-8000-000000000002', 'bob@example.test');
select pg_temp.check((select count(*) = 2 from public.customers
  where id in ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002')),
  'auth signup creates customer rows');

-- ---------- service_role: orders lifecycle ----------
set local role service_role;

insert into public.orders (id, customer_id, email, market_code, plan_id, price_id, currency, subtotal_minor, idempotency_key)
select '10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'alice@example.test',
       pr.market_code, pr.plan_id, pr.id, pr.currency, pr.amount_minor, 'test-idempotency-key-0001'
  from public.prices pr join public.plans p on p.id = pr.plan_id
 where pr.market_code = 'US' and p.tier_code = 'starter' and p.term = '12m' and p.streams = 1 and pr.valid_to is null;

select pg_temp.check((select total_minor = 4900 from public.orders where id = '10000000-0000-4000-8000-000000000001'),
  'order total computed by database');
select pg_temp.check((select count(*) = 1 from public.order_events where order_id = '10000000-0000-4000-8000-000000000001'),
  'order creation audited');

select pg_temp.expect_error(
  $$insert into public.orders (customer_id, email, market_code, plan_id, price_id, currency, subtotal_minor, idempotency_key)
    select null, 'x@example.test', pr.market_code, pr.plan_id, pr.id, pr.currency, 1, 'test-idempotency-key-0002'
      from public.prices pr where pr.market_code = 'US' limit 1$$,
  '23514', 'tampered subtotal rejected');

select pg_temp.expect_error(
  $$insert into public.orders (email, market_code, plan_id, price_id, currency, subtotal_minor, idempotency_key)
    select 'x@example.test', 'CA', pr.plan_id, pr.id, pr.currency, pr.amount_minor, 'test-idempotency-key-0003'
      from public.prices pr where pr.market_code = 'US' limit 1$$,
  '23514', 'price from another market rejected');

select pg_temp.expect_error(
  $$insert into public.orders (email, market_code, plan_id, price_id, currency, subtotal_minor, idempotency_key)
    select 'alice@example.test', market_code, plan_id, price_id, currency, subtotal_minor, idempotency_key
      from public.orders where id = '10000000-0000-4000-8000-000000000001'$$,
  '23505', 'duplicate idempotency key rejected');

select pg_temp.expect_error(
  $$update public.orders set status = 'paid' where id = '10000000-0000-4000-8000-000000000001'$$,
  '23514', 'invalid transition draft -> paid rejected');

select pg_temp.expect_error(
  $$update public.orders set status = 'pending_payment', terms_version = 'v0', terms_accepted_at = now()
     where id = '10000000-0000-4000-8000-000000000001'$$,
  '23514', 'launch gate blocks payment on unlicensed market');

update public.orders set status = 'cancelled' where id = '10000000-0000-4000-8000-000000000001';
select pg_temp.check((select count(*) = 2 from public.order_events where order_id = '10000000-0000-4000-8000-000000000001'),
  'status change audited');
select pg_temp.expect_error(
  $$update public.orders set status = 'draft' where id = '10000000-0000-4000-8000-000000000001'$$,
  '23514', 'cancelled is terminal');

select pg_temp.expect_error($$delete from public.orders$$, '42501', 'service_role cannot delete orders');

insert into public.payment_webhook_events (provider, provider_event_id, event_type, payload)
values ('test', 'evt_1', 'payment.succeeded', '{}'::jsonb);
select pg_temp.expect_error(
  $$insert into public.payment_webhook_events (provider, provider_event_id, event_type, payload)
    values ('test', 'evt_1', 'payment.succeeded', '{}'::jsonb)$$, '23505', 'webhook replay rejected');
reset role;

-- ---------- anon ----------
set local role anon;
select pg_temp.check((select count(*) = 3 from public.markets), 'anon reads markets');
select pg_temp.check((select count(*) = 48 from public.prices), 'anon reads only current prices');
select pg_temp.check((select count(*) = 48 from public.plans), 'anon reads only active plans');
select pg_temp.check((select count(*) = 3 from public.plan_tiers), 'anon reads tiers');
select pg_temp.expect_error($$update public.plan_tiers set max_quality = 'hd'$$, '42501', 'anon cannot change tiers');
select pg_temp.expect_error($$select * from public.orders$$, '42501', 'anon cannot read orders');
select pg_temp.expect_error($$select * from public.customers$$, '42501', 'anon cannot read customers');
select pg_temp.expect_error($$select * from public.payment_webhook_events$$, '42501', 'anon cannot read webhooks');
select pg_temp.expect_error($$select * from public.contact_requests$$, '42501', 'anon cannot read contact requests');
select pg_temp.expect_error($$update public.prices set amount_minor = 1$$, '42501', 'anon cannot change prices');
select pg_temp.expect_error($$insert into public.markets (code, name, currency) values ('XX', 'Test', 'USD')$$,
  '42501', 'anon cannot create markets');

insert into public.contact_requests (kind, name, email, locale, market_code, subject, message, consent_given, consent_text_version)
values ('support', 'Alice', 'alice@example.test', 'en', 'US', 'Device help', 'How do I set up my TV?', true, 'v0-draft');
select pg_temp.check(true, 'anon can submit support request');

select pg_temp.expect_error(
  $$insert into public.contact_requests (kind, email, consent_given, consent_text_version)
    values ('launch_waitlist', 'nobody@example.test', false, 'v0-draft')$$, '42501', 'consent is mandatory (RLS)');
select pg_temp.expect_error(
  $$insert into public.contact_requests (kind, email, consent_given, consent_text_version, status)
    values ('launch_waitlist', 'nobody@example.test', true, 'v0-draft', 'closed')$$, '42501', 'anon cannot set status');
select pg_temp.expect_error(
  $$insert into public.contact_requests (kind, email, subject, consent_given, consent_text_version)
    values ('support', 'nobody@example.test', 'x', true, 'v0-draft')$$, '23514', 'support requires a message');

insert into public.contact_requests (kind, email, market_code, interest_duration_months, interest_streams, preferred_device, consent_given, consent_text_version)
values ('launch_waitlist', 'prereg@example.test', 'EU', 12, 2, 'smart_tv', true, 'v0-draft');
insert into public.contact_requests (kind, email, market_code, interest_tier, interest_term, preferred_device, consent_given, consent_text_version)
values ('launch_waitlist', 'prereg-tier@example.test', 'CA', 'ultra', 'lifetime', 'mobile', true, 'v0-draft');
select pg_temp.check(true, 'anon can pre-register with tier and term');
select pg_temp.check(true, 'anon can pre-register with plan interest');
select pg_temp.expect_error(
  $$insert into public.contact_requests (kind, email, preferred_device, consent_given, consent_text_version)
    values ('launch_waitlist', 'bad-device@example.test', 'toaster', true, 'v0-draft')$$, '23514', 'unknown device rejected');
do $$ begin
  for i in 1..5 loop
    insert into public.contact_requests (kind, email, subject, message, consent_given, consent_text_version)
    values ('support', 'flood@example.test', 'Flood', 'Message number ' || i, true, 'v0-draft');
  end loop;
end $$;
select pg_temp.expect_error(
  $$insert into public.contact_requests (kind, email, subject, message, consent_given, consent_text_version)
    values ('support', 'FLOOD@example.test', 'Flood', 'One message too many', true, 'v0-draft')$$,
  'PT429', 'per-email throttle (case-insensitive)');
reset role;

-- ---------- authenticated (Alice) ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select pg_temp.check((select count(*) = 1 from public.customers), 'alice sees only her customer row');
select pg_temp.check((select count(*) = 1 from public.orders), 'alice sees her order');
select pg_temp.check((select count(*) = 2 from public.order_events), 'alice sees her order events');
update public.customers set full_name = 'Alice A.', marketing_consent = true where id = '00000000-0000-4000-8000-000000000001';
select pg_temp.check((select marketing_consent_at is not null from public.customers), 'consent timestamp recorded');
select pg_temp.expect_error($$update public.customers set email = 'evil@example.test'$$, '42501', 'alice cannot change email');
select pg_temp.expect_error($$update public.orders set status = 'paid'$$, '42501', 'alice cannot update orders');
select pg_temp.expect_error(
  $$insert into public.orders (email, market_code, plan_id, price_id, currency, subtotal_minor, idempotency_key)
    select 'a@example.test', market_code, plan_id, id, currency, amount_minor, 'test-idempotency-key-0009' from public.prices limit 1$$,
  '42501', 'alice cannot create orders directly');

-- ---------- authenticated (Bob) ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
select pg_temp.check((select count(*) = 0 from public.orders), 'bob cannot see alice orders');
select pg_temp.check((select count(*) = 0 from public.order_events), 'bob cannot see alice order events');
update public.customers set full_name = 'Hacked' where id = '00000000-0000-4000-8000-000000000001';
reset role;
select pg_temp.check((select full_name = 'Alice A.' from public.customers where id = '00000000-0000-4000-8000-000000000001'),
  'bob cannot update alice profile');

select 'PASSED: ' || count(*) || ' assertions' as result from _t;
rollback;
