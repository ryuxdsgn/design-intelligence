import Anthropic from "@anthropic-ai/sdk";
import { PII_KINDS, PII_SYSTEM, piiSchema, type PiiKind } from "@ryux/core/knowledge";
import { NextResponse } from "next/server";
import { currentEditor, editorServerClient } from "@/lib/editor/server";

// Marks personal data on one screenshot so the editor can replace it. The image comes from the browser
// (it may not be uploaded yet), scaled down there to stay small; the boxes are fractions, so they fit
// the full-size image. A person checks every box: the model can miss some or mark too much.
const MODEL = process.env.RYUX_TAG_MODEL ?? "claude-opus-5-5";
export const maxDuration = 60;

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });
const MEDIA = ["image/jpeg", "image/png", "image/webp"] as const;
const clamp = (v: number) => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));

export async function POST(req: Request) {
  const sb = await editorServerClient();
  if (!(await currentEditor(sb))) return fail(401, "Sign in with an editor account.");
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return fail(503, "Finding personal data needs the AI, which isn't set up here (no ANTHROPIC_API_KEY). Mark the areas by hand.");
  }
  const { image, mediaType } = (await req.json().catch(() => ({}))) as { image?: string; mediaType?: string };
  if (!image || !MEDIA.includes(mediaType as (typeof MEDIA)[number])) return fail(400, "Send one image as base64 JPEG, PNG, or WebP.");

  try {
    const response = await new Anthropic().beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: piiSchema() } },
      system: PII_SYSTEM,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType as (typeof MEDIA)[number], data: image } },
          { type: "text", text: "Mark the personal data on this screen." },
        ],
      }],
    } as Anthropic.Beta.MessageCreateParamsNonStreaming);

    if (response.stop_reason === "refusal") return fail(422, "The model declined this screen. Mark the areas by hand.");
    const text = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")?.text ?? "{}";
    const { areas = [] } = JSON.parse(text) as { areas?: { kind: PiiKind; x: number; y: number; w: number; h: number }[] };
    const boxes = areas
      .filter((a) => PII_KINDS.includes(a.kind))
      .map((a) => { const x = clamp(a.x), y = clamp(a.y); return { kind: a.kind, x, y, w: Math.min(clamp(a.w), 1 - x), h: Math.min(clamp(a.h), 1 - y) }; })
      .filter((a) => a.w > 0.005 && a.h > 0.005);
    return NextResponse.json({ areas: boxes });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return fail(429, "The AI is rate limited. Wait a minute, then try again.");
    if (err instanceof Anthropic.APIError) return fail(502, `The AI request failed (${err.status ?? "network"}). Try again, or mark the areas by hand.`);
    return fail(500, err instanceof Error ? err.message : String(err));
  }
}
