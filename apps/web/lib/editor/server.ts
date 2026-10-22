import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Server client for editor pages and routes, acting as the signed-in editor (cookies from the request). */
export async function editorServerClient(): Promise<SupabaseClient> {
  const store = await cookies();
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        // Server components cannot set cookies; the middleware refreshes the session instead.
        try {
          for (const c of list) store.set(c.name, c.value, c.options);
        } catch {}
      },
    },
  });
}

/** The signed-in staff member, or null when signed out or not staff (accounts.role reviewer or admin). */
export async function currentEditor(sb: SupabaseClient): Promise<{ id: string; email: string } | null> {
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const { data: staff } = await sb.rpc("is_staff");
  return staff ? { id: data.user.id, email: data.user.email ?? "" } : null;
}
