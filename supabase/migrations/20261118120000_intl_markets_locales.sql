-- ⚠️ PRÉPARÉE, NON APPLIQUÉE SUR LA BASE DE PRODUCTION (SEO international, phase 3A — 18/11/2026).
-- À appliquer seulement sur accord du propriétaire, AVANT de déployer le code qui écrit `price_market`
-- ou une version de site (« fr-fr »…) dans `contact_requests.locale`. Testée sur une base locale jetable
-- (npm run db:test). Non destructive : aucune donnée existante modifiée, aucun prix créé.
--
-- 1. Marchés de prix manquants (Royaume-Uni, Suisse, Maroc) : SANS prix (aucun tarif inventé), non licenciés,
--    ventes fermées. `tax_inclusive_pricing` reprend l'affichage prévu (TVA comprise au R-U et en Suisse) —
--    à confirmer par le conseil fiscal ; Maroc à décider (false par défaut).
insert into public.markets (code, name, currency, default_locale, licensed, sales_enabled, tax_inclusive_pricing, is_active)
values ('GB', 'United Kingdom', 'GBP', 'en', false, false, true, true),
       ('CH', 'Switzerland', 'CHF', 'fr', false, false, true, true),
       ('MA', 'Morocco', 'MAD', 'fr', false, false, false, true)
on conflict (code) do nothing;

-- 2. Version du site dans les demandes : « en » (anglais, `/`), « fr » (ancien), ou une version « fr-fr », « en-gb »…
alter table public.contact_requests drop constraint if exists contact_requests_locale_check;
alter table public.contact_requests add constraint contact_requests_locale_check
  check (locale ~ '^[a-z]{2}(-[a-z]{2})?$');

-- 3. Marché de prix de la commande, fixé par le serveur d'après la version du site (pas par le navigateur).
--    NULL = demandes existantes et version anglaise `/` : marché US (comportement actuel inchangé).
--    Le montant n'est PAS stocké ici : la facture le recalcule toujours depuis la grille officielle du marché.
alter table public.contact_requests
  add column if not exists price_market text references public.markets (code) on update cascade on delete restrict;
comment on column public.contact_requests.price_market is 'Price market of the site version (server-side); NULL = US (English home, legacy rows).';
create index if not exists contact_requests_price_market_idx on public.contact_requests (price_market);
-- Privilège explicite, par colonne (insertion seule, aucune lecture), comme les autres colonnes du formulaire.
grant insert (price_market) on public.contact_requests to anon, authenticated;

-- 4. Bot : la fiche connaît la version du site et le marché de prix (langue et devise des e-mails, facture).
create or replace function private.ops_card_json(p_request uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'request', jsonb_build_object(
      'id', r.id, 'kind', r.kind, 'name', r.name, 'email', r.email, 'phone', r.phone,
      'market', r.market_code, 'country', r.country_code, 'subject', r.subject, 'message', r.message,
      'tier', r.interest_tier, 'term', r.interest_term, 'streams', r.interest_streams,
      'device', r.preferred_device, 'device_detail', r.device_detail,
      'marketing', r.marketing_opt_in, 'created_at', r.created_at,
      'locale', r.locale, 'price_market', r.price_market),
    'card', jsonb_build_object(
      'flow', c.flow, 'status', c.status, 'version', c.version,
      'chat_id', c.chat_id, 'thread_id', c.thread_id, 'message_id', c.message_id),
    'events', coalesce((
      select jsonb_agg(e order by e.id) from (
        select ev.id, ev.action, ev.from_status, ev.to_status, ev.actor_name, ev.reason, ev.undoes, ev.created_at,
               exists (select 1 from private.ops_events u where u.undoes = ev.id) as undone
          from private.ops_events ev where ev.request_id = r.id order by ev.id desc limit 8
      ) e), '[]'::jsonb)
  )
  from public.contact_requests r join private.ops_cards c on c.request_id = r.id
  where r.id = p_request
$$;
revoke all on function private.ops_card_json(uuid) from public, anon, authenticated;

-- 5. E-mails automatiques (avis Trustpilot, suivi d'essai) : la langue suit la version du site.
create or replace function public.ops_review_claim_due(p_after interval default interval '3 days', p_limit integer default 25)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v jsonb;
begin
  with due as (
    select r.id
      from public.contact_requests r
      join private.ops_cards c on c.request_id = r.id
     where c.status = 'converted'
       and r.review_invite_sent_at is null
       and r.kind <> 'support'
       and exists (
         select 1 from private.ops_events e
          where e.request_id = r.id and e.action = 'convert'
            and e.created_at <= now() - p_after
            and e.created_at > now() - interval '30 days'
            and not exists (select 1 from private.ops_events u where u.undoes = e.id))
     order by r.created_at
     limit greatest(1, least(p_limit, 100))
     for update of r skip locked
  ), claimed as (
    update public.contact_requests r set review_invite_sent_at = now()
      from due where r.id = due.id
    returning r.id, r.email, r.name, r.locale
  )
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'email', email, 'name', name, 'locale', locale)), '[]'::jsonb) into v from claimed;
  return v;
end;
$$;

create or replace function public.ops_trial_followup_claim_due(p_after interval default interval '24 hours', p_limit integer default 25)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v jsonb;
begin
  with due as (
    select r.id
      from public.contact_requests r
      join private.ops_cards c on c.request_id = r.id
     where r.kind = 'trial_request'
       and c.status = 'contacted'
       and r.trial_followup_sent_at is null
       and exists (
         select 1 from private.ops_events e
          where e.request_id = r.id and e.action = 'contact'
            and e.created_at <= now() - p_after
            and e.created_at > now() - interval '7 days'
            and not exists (select 1 from private.ops_events u where u.undoes = e.id))
     order by r.created_at
     limit greatest(1, least(p_limit, 100))
     for update of r skip locked
  ), claimed as (
    update public.contact_requests r set trial_followup_sent_at = now()
      from due where r.id = due.id
    returning r.id, r.email, r.name, r.locale
  )
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'email', email, 'name', name, 'locale', locale)), '[]'::jsonb) into v from claimed;
  return v;
end;
$$;

revoke all on function public.ops_review_claim_due(interval, integer), public.ops_trial_followup_claim_due(interval, integer) from public, anon, authenticated;
grant execute on function public.ops_review_claim_due(interval, integer), public.ops_trial_followup_claim_due(interval, integer) to service_role;
