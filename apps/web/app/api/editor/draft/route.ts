import Anthropic from "@anthropic-ai/sdk";
import { BUCKET, DRAFT_SYSTEM, draftSchema, draftUserText, loadTagIds, mediaTypeFor, saveDraft, type DraftResult } from "@ryux/core/knowledge";
import { NextResponse } from "next/server";
import { currentEditor, editorServerClient } from "@/lib/editor/server";

// One screen per request: the editor calls this once per screen and shows progress, so no request
// runs long. The draft is marked source: ai; a person confirms or removes every item in review.
const MODEL = process.env.RYUX_TAG_MODEL ?? "claude-opus-5-5";
export const maxDuration = 120;

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const sb = await editorServerClient();
  if (!(await currentEditor(sb))) return fail(401, "Sign in with an editor account.");
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return fail(503, "The AI draft isn't set up here (no ANTHROPIC_API_KEY). Add tags and observations by hand.");
  }

  const { screenId, force } = (await req.json().catch(() => ({}))) as { screenId?: string; force?: boolean };
  if (!screenId) return fail(400, "Missing screenId.");

  type ScreenRow = { id: string; position: number; image_path: string; ocr_text: string | null; flows: { flow_type: string; app_versions: { apps: { name: string; category: string | null } | null } | null } | null };
  const { data: screen, error } = await sb
    .from("screens")
    .select("id, position, image_path, ocr_text, flows(flow_type, app_versions(apps(name, category)))")
    .eq("id", screenId)
    .maybeSingle<ScreenRow>();
  if (error) return fail(500, error.message);
  if (!screen) return fail(404, "That screen doesn't exist.");
  // A draft costs an API call; drafting a screen twice needs an explicit force.
  if (screen.ocr_text && !force) return NextResponse.json({ skipped: true });

  const image = await sb.storage.from(BUCKET).download(screen.image_path);
  if (image.error) return fail(500, `Couldn't read the image: ${image.error.message}`);
  const data = Buffer.from(await image.data.arrayBuffer()).toString("base64");

  const tagIds = await loadTagIds(sb);
  const meta = { app: screen.flows?.app_versions?.apps?.name ?? "", category: screen.flows?.app_versions?.apps?.category ?? "", flow_type: screen.flows?.flow_type ?? "" };

  try {
    const response = await new Anthropic().beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: draftSchema([...tagIds.keys()]) } },
      system: DRAFT_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaTypeFor(screen.image_path), data } },
            { type: "text", text: draftUserText(meta, screen.position) },
          ],
        },
      ],
    } as Anthropic.Beta.MessageCreateParamsNonStreaming);

    if (response.stop_reason === "refusal") return fail(422, "The model declined to describe this screen. Add its tags by hand.");
    const text = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")?.text ?? "{}";
    const draft = JSON.parse(text) as DraftResult;
    await saveDraft(sb, screen.id, draft, tagIds);
    return NextResponse.json({ tags: draft.tags.length, observations: draft.observations.length });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return fail(429, "The AI is rate limited. Wait a minute, then run the draft again.");
    if (err instanceof Anthropic.APIError) return fail(502, `The AI request failed (${err.status ?? "network"}). Try again.`);
    return fail(500, err instanceof Error ? err.message : String(err));
  }
}
