-- /setup typed in the group's general chat (no topic): store the thread as JSON null
-- (cards then go to the general chat) instead of failing.
create or replace function public.ops_set_topic(p_actor bigint, p_topic text, p_chat bigint, p_thread integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if private.ops_role(p_actor) is distinct from 'admin' then return jsonb_build_object('ok', false, 'code', 'forbidden'); end if;
  if p_topic not in ('commandes', 'paiements', 'livraisons', 'support', 'alertes') then
    return jsonb_build_object('ok', false, 'code', 'unknown_topic');
  end if;
  insert into private.ops_settings (key, value) values ('chat_id', to_jsonb(p_chat))
    on conflict (key) do update set value = excluded.value, updated_at = now();
  insert into private.ops_settings (key, value) values ('thread_' || p_topic, coalesce(to_jsonb(p_thread), 'null'::jsonb))
    on conflict (key) do update set value = excluded.value, updated_at = now();
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.ops_set_topic(bigint, text, bigint, integer) from public, anon, authenticated;
grant execute on function public.ops_set_topic(bigint, text, bigint, integer) to service_role;
