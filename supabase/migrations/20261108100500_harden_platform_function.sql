-- =============================================================================
-- Hardening of the platform-provided `public.rls_auto_enable()` event-trigger
-- function (created with the project, it auto-enables RLS on new tables).
--
-- The protection itself is KEPT. We only remove the EXECUTE privilege from the
-- Data API roles (advisor lints 0028/0029). Event triggers do not check EXECUTE,
-- so the `ensure_rls` event trigger keeps working.
-- Guarded so the migration also runs on databases without that function.
-- =============================================================================
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
