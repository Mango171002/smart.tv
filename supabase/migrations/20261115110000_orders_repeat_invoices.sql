-- Owner approval 15/11/2026:
-- 1) A customer may place several pre-registrations (orders): each one is a new row, a full new
--    Telegram card and a new confirmation e-mail. The "one pre-registration per e-mail" unique
--    index is removed; the throttle (5 requests per e-mail per hour, 120/min globally) stays.
--    No data is deleted.
drop index if exists public.contact_requests_waitlist_once;

-- 2) Invoice numbers for the confirmation e-mail sent when the team marks a request « Converti »:
--    sequential (SYG-2026-0001, 0002…), given once per request (an undo + new convert keeps it).
create sequence if not exists private.invoice_seq as integer start 1;
revoke all on sequence private.invoice_seq from public, anon, authenticated;

alter table public.contact_requests
  add column if not exists invoice_number text unique,
  add column if not exists invoice_issued_at timestamptz;
comment on column public.contact_requests.invoice_number is 'Sequential invoice number, set by the operations bot on « Converti ».';
-- No privilege for anon/authenticated on these two columns (server only).

create or replace function public.ops_invoice(p_request uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_number text;
  v_at timestamptz;
  v_new boolean := false;
begin
  select invoice_number, invoice_issued_at into v_number, v_at
    from public.contact_requests where id = p_request for update;
  if not found then return jsonb_build_object('ok', false, 'code', 'not_found'); end if;
  if v_number is null then
    v_at := now();
    v_number := 'SYG-' || to_char(v_at at time zone 'UTC', 'YYYY') || '-' || lpad(nextval('private.invoice_seq')::text, 4, '0');
    update public.contact_requests set invoice_number = v_number, invoice_issued_at = v_at where id = p_request;
    v_new := true;
  end if;
  return jsonb_build_object('ok', true, 'number', v_number, 'issued_at', v_at, 'new', v_new);
end;
$$;
revoke all on function public.ops_invoice(uuid) from public, anon, authenticated;
grant execute on function public.ops_invoice(uuid) to service_role;
