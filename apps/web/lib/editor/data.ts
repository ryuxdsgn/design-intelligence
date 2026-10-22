import { BUCKET, check, loadPiiChecked } from "@ryux/core/knowledge";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface FlowRow {
  id: string;
  title: string;
  flowType: string;
  status: string;
  steps: number;
  app: string;
  appId: string;
  category: string;
  platform: string;
  version: string;
  capturedAt: string;
  device: string;
}

type FlowQuery = {
  id: string; title: string | null; flow_type: string; status: string; step_count: number | null;
  app_versions: { version: string; captured_at: string; device: string | null; apps: { id: string; name: string; category: string | null; platform: string | null } | null } | null;
};

const FLOW_SELECT = "id, title, flow_type, status, step_count, app_versions(version, captured_at, device, apps(id, name, category, platform))";

const toFlow = (f: FlowQuery): FlowRow => ({
  id: f.id, title: f.title ?? "", flowType: f.flow_type, status: f.status, steps: f.step_count ?? 0,
  app: f.app_versions?.apps?.name ?? "", appId: f.app_versions?.apps?.id ?? "", category: f.app_versions?.apps?.category ?? "",
  platform: f.app_versions?.apps?.platform ?? "", version: f.app_versions?.version ?? "", capturedAt: f.app_versions?.captured_at ?? "",
  device: f.app_versions?.device ?? "",
});

export async function listFlows(sb: SupabaseClient): Promise<FlowRow[]> {
  const rows = check(await sb.from("flows").select(FLOW_SELECT).order("created_at", { ascending: false }), "read flows") as unknown as FlowQuery[];
  return rows.map(toFlow);
}

export interface ReviewScreen {
  id: string;
  position: number;
  url: string | null;
  ocr: string;
  piiChecked: boolean;
  tags: { key: string; label: string; source: string; ai: boolean }[];
  observations: { id: string; dimension: string; label: string; source: string; statement: string }[];
  why: string;
  weak: string;
}

export interface ReviewData {
  flow: FlowRow;
  screens: ReviewScreen[];
  why: string;
  weak: string;
  vocabulary: { key: string; label: string; id: string }[];
}

export async function loadReview(sb: SupabaseClient, flowId: string): Promise<ReviewData | null> {
  const flowRes = await sb.from("flows").select(FLOW_SELECT).eq("id", flowId).maybeSingle();
  if (flowRes.error) throw new Error(`read flow: ${flowRes.error.message}`);
  if (!flowRes.data) return null;
  const flow = toFlow(flowRes.data as unknown as FlowQuery);

  const screens = check(await sb.from("screens").select("id, position, image_path, ocr_text").eq("flow_id", flowId).order("position"), "read screens") as { id: string; position: number; image_path: string; ocr_text: string | null }[];
  const ids = screens.map((s) => s.id);
  const signed = ids.length ? await sb.storage.from(BUCKET).createSignedUrls(screens.map((s) => s.image_path), 3600) : { data: [] };
  const urls = new Map((signed.data ?? []).map((u, i) => [screens[i].id, u.signedUrl ?? null]));

  type TagRow = { screen_id: string; source: string; confidence: number | null; tags: { layer: string; slug: string; label: string } | null };
  const tagRows = ids.length ? (check(await sb.from("screen_tags").select("screen_id, source, confidence, tags(layer, slug, label)").in("screen_id", ids), "read tags") as unknown as TagRow[]) : [];
  type ObsRow = { id: string; target_id: string; dimension: string; label: string; source: string; statement: string };
  const obsRows = ids.length ? (check(await sb.from("observations").select("id, target_id, dimension, label, source, statement").eq("target_type", "screen").in("target_id", ids).order("dimension"), "read observations") as ObsRow[]) : [];
  type NoteRow = { id: string; why_it_works: string | null; weaknesses: string | null };
  const notes = check(await sb.from("designer_notes").select("id, why_it_works, weaknesses").in("id", [`dn_${flowId}`, ...ids.map((i) => `dn_${i}`)]), "read notes") as NoteRow[];
  const note = (id: string) => notes.find((n) => n.id === id);
  const pii = ids.length ? await loadPiiChecked(sb, ids) : new Set<string>();
  const vocab = check(await sb.from("tags").select("id, layer, slug, label").order("layer").order("slug"), "read vocabulary") as { id: string; layer: string; slug: string; label: string }[];

  return {
    flow,
    why: note(`dn_${flowId}`)?.why_it_works ?? "",
    weak: note(`dn_${flowId}`)?.weaknesses ?? "",
    vocabulary: vocab.map((t) => ({ key: `${t.layer}/${t.slug}`, label: t.label, id: t.id })),
    screens: screens.map((s) => ({
      id: s.id,
      position: s.position,
      url: urls.get(s.id) ?? null,
      ocr: s.ocr_text ?? "",
      piiChecked: pii.has(s.id),
      tags: tagRows.filter((t) => t.screen_id === s.id && t.tags).map((t) => ({ key: `${t.tags!.layer}/${t.tags!.slug}`, label: t.tags!.label, source: t.source, ai: t.confidence !== null })),
      observations: obsRows.filter((o) => o.target_id === s.id).map(({ id, dimension, label, source, statement }) => ({ id, dimension, label, source, statement })),
      why: note(`dn_${s.id}`)?.why_it_works ?? "",
      weak: note(`dn_${s.id}`)?.weaknesses ?? "",
    })),
  };
}
