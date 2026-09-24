import { createClient } from "@supabase/supabase-js";
import type { LocalPattern, Screen } from "@ryux/core";

export interface SupabaseEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

/**
 * Muat data konten dari Supabase (view datar yang menghormati RLS: hanya 'published').
 * Kembalikan null bila env belum diisi -> pemanggil tetap memakai data contoh @ryux/core.
 */
export async function loadFromSupabase(
  env: SupabaseEnv,
): Promise<{ screens: Screen[]; patterns: Record<string, LocalPattern> } | null> {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const [sc, lp] = await Promise.all([
    sb.from("screens_flat").select("*"),
    sb.from("local_patterns_flat").select("*"),
  ]);
  if (sc.error) throw new Error(`screens_flat: ${sc.error.message}`);
  if (lp.error) throw new Error(`local_patterns_flat: ${lp.error.message}`);

  const screens: Screen[] = (sc.data ?? []).map((r: any) => ({
    screen_id: r.screen_id,
    app: { name: r.app_name, category: r.app_category },
    version: r.version ?? "",
    captured_at: r.captured_at ?? "",
    flow: { id: r.flow_id, type: r.flow_type, position: r.position },
    tags: r.tags ?? [],
    image_url: r.image_url ?? "",
    designer_notes: { why_it_works: r.why_it_works ?? "", weaknesses: r.weaknesses ?? "" },
    reviewed: Boolean(r.reviewed),
    untrusted_text: { ocr: r.ocr ?? "" },
  }));

  const patterns: Record<string, LocalPattern> = {};
  for (const r of (lp.data ?? []) as any[]) {
    patterns[r.slug] = {
      name: r.name,
      description: r.description ?? "",
      user_behavior_notes: r.user_behavior_notes ?? "",
      example_screen_ids: r.example_screen_ids ?? [],
    };
  }

  return { screens, patterns };
}
