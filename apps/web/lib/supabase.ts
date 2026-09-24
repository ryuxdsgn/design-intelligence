import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for the waitlist insert. Uses the anon key: the
 * `waitlist` table only allows INSERT via RLS (no public SELECT), so the anon
 * key is safe here. Returns null when env is not configured so the app still
 * builds and runs without secrets.
 */
export function waitlistClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
