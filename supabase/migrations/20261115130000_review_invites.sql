-- Trustpilot review invitation (owner decision 15/11/2026): one e-mail, 3 days after « Converti »,
-- no reminder. Additive only: one nullable column and two service_role-only functions.
alter table public.contact_requests
  add column if not exists review_invite_sent_at timestamptz;
comment on column public.contact_requests.review_invite_sent_at is 'When the review invitation e-mail was sent (once per request).';
-- No privilege for anon/authenticated on this column (server only).

-- Claims (marks as sent) the requests that are due and returns them. A request is due when its card is
-- « converted », its latest not-undone « convert » is older than p_after (and less than 30 days old),
-- and no invitation was sent yet. Concurrent runs never claim the same request (skip locked).
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
    returning r.id, r.email, r.name
  )
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'email', email, 'name', name)), '[]'::jsonb) into v from claimed;
  return v;
end;
$$;

-- Gives a request back to the queue when its e-mail could not be sent (retried at the next run).
create or replace function public.ops_review_release(p_request uuid) returns void
language sql security definer set search_path = '' as $$
  update public.contact_requests set review_invite_sent_at = null where id = p_request
$$;

revoke all on function public.ops_review_claim_due(interval, integer), public.ops_review_release(uuid) from public, anon, authenticated;
grant execute on function public.ops_review_claim_due(interval, integer), public.ops_review_release(uuid) to service_role;
