import Anthropic from "@anthropic-ai/sdk";
import { DETAILS_SYSTEM, detailsSchema, type DetailsSuggestion } from "@ryux/core/knowledge";
import { NextResponse } from "next/server";
import { currentEditor, editorServerClient } from "@/lib/editor/server";

// Suggests a new flow's details from its first screens, before upload. The browser sends up to three
// scaled-down JPEGs; the editor fills only empty fields and marks them as suggested for a person to check.
const MODEL = process.env.RYUX_TAG_MODEL ?? "claude-opus-5-5";
export const maxDuration = 60;

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const sb = await editorServerClient();
  if (!(await currentEditor(sb))) return fail(401, "Sign in with an editor account.");
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return fail(503, "Suggestions need the AI, which isn't set up here (no ANTHROPIC_API_KEY).");
  const { images } = (await req.json().catch(() => ({}))) as { images?: string[] };
  if (!images?.length || images.length > 3) return fail(400, "Send one to three screens as base64 JPEG.");

  try {
    const response = await new Anthropic().beta.messages.create({
      model: MODEL,
      max_tokens: 1000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: detailsSchema() } },
      system: DETAILS_SYSTEM,
      messages: [{
        role: "user",
        content: [
          ...images.map((data) => ({ type: "image" as const, source: { type: "base64" as const, media_type: "image/jpeg" as const, data } })),
          { type: "text", text: `Suggest the details for this flow (${images.length} of its first screens, in order).` },
        ],
      }],
    } as Anthropic.Beta.MessageCreateParamsNonStreaming);
    if (response.stop_reason === "refusal") return fail(422, "The model declined these screens. Fill in the details by hand.");
    const text = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")?.text ?? "{}";
    return NextResponse.json(JSON.parse(text) as DetailsSuggestion);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return fail(429, "The AI is rate limited. Fill in the details by hand, or try again in a minute.");
    if (err instanceof Anthropic.APIError) return fail(502, `The AI request failed (${err.status ?? "network"}).`);
    return fail(500, err instanceof Error ? err.message : String(err));
  }
}
