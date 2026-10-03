import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { required } from "./env.js";

// Signs in as the editor account. Writes go through RLS (public.is_staff), never the service role.
export async function editorClient(): Promise<SupabaseClient> {
  const sb = createClient(required("SUPABASE_URL"), required("SUPABASE_ANON_KEY"), {
    auth: { persistSession: false },
  });
  const { error } = await sb.auth.signInWithPassword({
    email: required("RYUX_EDITOR_EMAIL"),
    password: required("RYUX_EDITOR_PASSWORD"),
  });
  if (error) throw new Error(`Editor sign-in failed: ${error.message}`);
  const { data: staff, error: staffErr } = await sb.rpc("is_staff");
  if (staffErr) throw new Error(`Could not check editor role: ${staffErr.message}`);
  if (!staff) throw new Error("This account is not an editor. Set its accounts.role to 'reviewer' or 'admin' (see DEPLOY.md).");
  return sb;
}

export function check<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data;
}
