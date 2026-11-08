import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Server-side Supabase clients. The browser never receives Supabase credentials:
 * every database call goes through our own API routes / server components.
 */

let publicClient: SupabaseClient<Database> | null | undefined;

/** Client using the PUBLISHABLE key — limited by RLS + explicit grants (anon role). */
export function getPublicSupabase(): SupabaseClient<Database> | null {
  if (publicClient !== undefined) return publicClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  publicClient =
    url && key
      ? createClient<Database>(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { 'x-client-info': 'iptv-international-web' } },
        })
      : null;
  return publicClient;
}

/**
 * Client using the SECRET key (service_role). Only for trusted server work such as
 * verified payment webhooks. Returns null when not configured (prototype default).
 */
export function getServiceSupabase(): SupabaseClient<Database> | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
