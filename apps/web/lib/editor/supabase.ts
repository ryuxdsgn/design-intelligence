import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser client for the editor. Signs in as a staff account; every read and write goes through RLS
 * (public.is_staff), never the service role. The session lives in cookies so the server and the
 * middleware see it too.
 */
export function editorBrowserClient(): SupabaseClient {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
