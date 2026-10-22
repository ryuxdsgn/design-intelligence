"use client";

import { DIMENSIONS, observationId, publishReview, setPiiChecked, validateReview, type FlowReview } from "@ryux/core/knowledge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReviewData, ReviewScreen } from "@/lib/editor/data";
import { editorBrowserClient } from "@/lib/editor/supabase";
import { PublishedIllustration } from "./illustrations";
import { Button, Problems, SaveStatus, StatusBadge, inputClass } from "./ui";

/* One flow: every screen gets a personal-data check and tag and observation decisions; the flow gets
   designer notes written by a person. Publish runs the same checks as the CLI. AI items stay
   unconfirmed (source ai) until ticked; unticked ones are removed when the flow is published. */

export function Review({ data, editorId }: { data: ReviewData; editorId: string }) {
  const router = useRouter();
  const sb = useMemo(() => editorBrowserClient(), []);
  const [screens, setScreens] = useState(data.screens);
  const [current, setCurrent] = useState(0);
  const [flowNotes, setFlowNotes] = useState({ why: data.why, weak: data.weak });
  const [error, setError] = useState("");
  const [draftState, setDraftState] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [drafting, setDrafting] = useState<{ id: string; done: number; total: number } | null>(null);
  const [published, setPublished] = useState(false);
  const publishedRef = useRef<HTMLDivElement>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tagIds = useMemo(() => new Map(data.vocabulary.map((t) => [t.key, t.id])), [data.vocabulary]);
  // A refresh (after the AI draft or publish) brings new server data; show it.
  useEffect(() => setScreens(data.screens), [data.screens]);
  useEffect(() => setFlowNotes({ why: data.why, weak: data.weak }), [data.why, data.weak]);
  // Reviewers move through many screens: ← and → switch screens when no field has focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.altKey || e.metaKey || e.ctrlKey || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      if (e.key === "ArrowRight") setCurrent((c) => Math.min(c + 1, screens.length - 1));
      if (e.key === "ArrowLeft") setCurrent((c) => Math.max(c - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screens.length]);
  useEffect(() => { if (published) publishedRef.current?.focus(); }, [published]);

  // Any change makes the last publish check stale.
  useEffect(() => { setProblems([]); setConfirming(false); }, [screens, flowNotes]);
  const screen = screens[current];

  const patch = (id: string, change: (s: ReviewScreen) => ReviewScreen) => setScreens((all) => all.map((s) => (s.id === id ? change(s) : s)));
  const run = async (what: string, fn: () => Promise<void>) => {
    setError("");
    setSave("saving");
    clearTimeout(savedTimer.current);
    try {
      await fn();
      setSave("saved");
      savedTimer.current = setTimeout(() => setSave("idle"), 1600);
    } catch (err) {
      setSave("error");
      setError(`${what}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  const ok = (res: { error: { message: string } | null }) => { if (res.error) throw new Error(res.error.message); };

  // ── Screen decisions: shown at once, saved in the background, undone with a message if the save fails ──
  const optimistic = (what: string, id: string, change: (s: ReviewScreen) => ReviewScreen, save: () => Promise<void>) => {
    const before = screens.find((s) => s.id === id)!;
    patch(id, change);
    run(what, async () => {
      try { await save(); } catch (err) { patch(id, () => before); throw err; }
    });
  };

  const togglePii = (s: ReviewScreen) =>
    optimistic("Couldn't save the check", s.id, (x) => ({ ...x, piiChecked: !s.piiChecked }), () => setPiiChecked(sb, s.id, !s.piiChecked, editorId));

  const toggleTag = (s: ReviewScreen, key: string) => {
    const tag = s.tags.find((t) => t.key === key)!;
    const confirm = tag.source !== "human";
    const keepRow = confirm || tag.ai;
    optimistic("Couldn't save the tag", s.id,
      (x) => ({ ...x, tags: keepRow ? x.tags.map((t) => (t.key === key ? { ...t, source: confirm ? "human" : "ai" } : t)) : x.tags.filter((t) => t.key !== key) }),
      async () => {
        const q = sb.from("screen_tags");
        ok(keepRow ? await q.update({ source: confirm ? "human" : "ai" }).eq("screen_id", s.id).eq("tag_id", tagIds.get(key)!) : await q.delete().eq("screen_id", s.id).eq("tag_id", tagIds.get(key)!));
      });
  };

  const addTag = (s: ReviewScreen, key: string) => run("Couldn't add the tag", async () => {
    if (!key || s.tags.some((t) => t.key === key)) return;
    ok(await sb.from("screen_tags").upsert({ screen_id: s.id, tag_id: tagIds.get(key)!, source: "human" }, { onConflict: "screen_id,tag_id" }));
    const label = data.vocabulary.find((t) => t.key === key)?.label ?? key;
    patch(s.id, (x) => ({ ...x, tags: [...x.tags, { key, label, source: "human", ai: false }] }));
  });

  const toggleObservation = (s: ReviewScreen, id: string) => {
    const source = s.observations.find((x) => x.id === id)!.source === "human" ? "ai" : "human";
    optimistic("Couldn't save the observation", s.id,
      (x) => ({ ...x, observations: x.observations.map((y) => (y.id === id ? { ...y, source } : y)) }),
      async () => ok(await sb.from("observations").update({ source }).eq("id", id)));
  };

  const addObservation = (s: ReviewScreen, dimension: string, label: string, statement: string) => run("Couldn't add the observation", async () => {
    const text = statement.trim();
    if (!text) return;
    const id = await observationId(s.id, dimension, text);
    ok(await sb.from("observations").upsert({ id, target_type: "screen", target_id: s.id, dimension, label, statement: text, source: "human", status: "draft" }, { onConflict: "id" }));
    patch(s.id, (x) => ({ ...x, observations: [...x.observations.filter((y) => y.id !== id), { id, dimension, label, source: "human", statement: text }] }));
  });

  const saveNotes = (target: { type: "flow" | "screen"; id: string }, why: string, weak: string) => run("Couldn't save the notes", async () => {
    ok(await sb.from("designer_notes").upsert({ id: `dn_${target.id}`, target_type: target.type, target_id: target.id, why_it_works: why.trim() || null, weaknesses: weak.trim() || null }, { onConflict: "id" }));
  });

  // ── AI draft: one request per screen, so progress is visible and nothing runs long ──
  async function runDraft() {
    setError("");
    const todo = screens.filter((s) => !s.ocr);
    if (!todo.length) { setDraftState("Every screen already has a draft."); return; }
    let failed = 0;
    for (const [i, s] of todo.entries()) {
      setDrafting({ id: s.id, done: i, total: todo.length });
      setDraftState(`Drafting screen ${s.position} (${i + 1} of ${todo.length})…`);
      const res = await fetch("/api/editor/draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ screenId: s.id }) });
      if (!res.ok) {
        failed++;
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(`Screen ${s.position}: ${body.error ?? `request failed (${res.status})`}`);
        if (res.status === 401 || res.status === 503 || res.status === 429) break;
      }
    }
    setDrafting(null);
    setDraftState(failed ? `Draft finished with ${failed} screen${failed > 1 ? "s" : ""} not drafted.` : "Draft finished. Review every item before publishing.");
    router.refresh();
  }

  // ── Publish: the same checks as the CLI, then a confirmation, because published screens are public ──
  const review = (): FlowReview => ({
    flowId: data.flow.id,
    why: flowNotes.why.trim(),
    weak: flowNotes.weak.trim(),
    screens: screens.map((s) => ({
      screenId: s.id,
      piiChecked: s.piiChecked,
      tags: s.tags.map((t) => ({ key: t.key, keep: t.source === "human", source: t.source })),
      observations: s.observations.map((o) => ({ dimension: o.dimension, label: o.label, source: o.source, statement: o.statement, keep: o.source === "human" })),
      why: s.why.trim(),
      weak: s.weak.trim(),
    })),
  });

  function askPublish() {
    const found = validateReview(review(), data.flow.id, screens.map((s) => s.id), tagIds).map((p) => {
      const pos = screens.find((s) => p.startsWith(s.id))?.position;
      return pos ? p.replace(/^scr_[a-z0-9]+/, `Screen ${pos}`) : p.replace("flow notes:", "Flow notes:").replace("write both why_it_works and weaknesses", "write both why it works and its weaknesses");
    });
    setProblems(found);
    setConfirming(found.length === 0);
  }

  async function publish() {
    setPublishing(true);
    await run("Publish stopped", async () => {
      await publishReview(sb, review(), { appId: data.flow.appId, flowId: data.flow.id, screenIds: screens.map((s) => s.id) }, tagIds);
      setConfirming(false);
      setPublished(true);
      router.refresh();
    });
    setPublishing(false);
  }

  const pickProblem = (p: string) => {
    const n = p.match(/^Screen (\d+)/)?.[1];
    if (n) { setCurrent(Number(n) - 1); document.getElementById("screen-panel")?.focus(); return; }
    if (p.startsWith("Flow notes")) document.getElementById("flow-why")?.focus();
  };
  const toDraft = screens.filter((s) => !s.ocr).length;
  const checked = screens.filter((s) => s.piiChecked).length;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/editor" className="text-sm text-ink-2 hover:text-ink">← Flows</Link>
          <h1 className="mt-1 truncate text-2xl">{data.flow.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-2">
            <span>{data.flow.app} {data.flow.version}</span>
            <span className="font-mono text-xs text-muted">{data.flow.flowType} · {data.flow.platform} · captured {data.flow.capturedAt}</span>
            <StatusBadge status={data.flow.status} />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SaveStatus state={save} />
          <Button onClick={runDraft} disabled={!!drafting || toDraft === 0} title={toDraft === 0 ? "Every screen has a draft" : "Uses the Anthropic API once per screen"}>
            {drafting ? "Drafting…" : toDraft === 0 ? "All drafted" : `AI draft ${toDraft} ${toDraft === 1 ? "screen" : "screens"}`}
          </Button>
          <Button kind="primary" onClick={askPublish} disabled={publishing}>{data.flow.status === "published" ? "Publish changes" : "Publish"}</Button>
        </div>
      </div>

      <div className="-mt-3 flex min-h-5 flex-col gap-1.5">
        <p aria-live="polite" className="text-sm text-ink-2">{draftState}</p>
        {drafting && (
          <div className="h-1 overflow-hidden rounded-full bg-panel" role="progressbar" aria-label="AI draft" aria-valuemin={0} aria-valuemax={drafting.total} aria-valuenow={drafting.done}>
            <div className="ed-progress h-full bg-accent" style={{ transform: `scaleX(${(drafting.done + 0.5) / drafting.total})` }} />
          </div>
        )}
      </div>
      <Problems title="Something went wrong" items={error ? [error] : []} />
      <Problems title="Not ready to publish" items={problems} onPick={pickProblem} />
      {published && (
        <div ref={publishedRef} tabIndex={-1} role="status" className="ed-enter flex items-center gap-4 rounded-md border border-accent/50 bg-accent/10 p-3 outline-none">
          <PublishedIllustration className="hidden h-14 w-auto shrink-0 sm:block" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-ink">Published</p>
            <p className="text-ink-2">{screens.length} screens are now references the RYUX MCP can read. Changes you make from here are published with “Publish changes”.</p>
          </div>
          <Link href="/editor" className="text-sm text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent">Back to flows</Link>
        </div>
      )}
      {confirming && (
        <div role="alertdialog" aria-labelledby="confirm-title" onKeyDown={(e) => e.key === "Escape" && setConfirming(false)} className="ed-enter flex flex-wrap items-center justify-between gap-3 rounded-md border border-accent/50 bg-accent/10 p-3">
          <p id="confirm-title" className="text-sm text-ink">Publish {screens.length} screens? They become references that anyone using the RYUX MCP can read. Unticked AI items are removed.</p>
          <div className="flex gap-2">
            <Button kind="quiet" onClick={() => setConfirming(false)}>Cancel</Button>
            <Button kind="primary" onClick={publish} disabled={publishing} autoFocus>{publishing ? "Publishing…" : "Publish now"}</Button>
          </div>
        </div>
      )}

      {screens.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hair p-10 text-center text-ink-2">This flow has no screens.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[7.5rem_minmax(0,1fr)_minmax(0,24rem)]">
          <nav aria-label="Screens" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            <p className="hidden text-xs text-muted lg:block">{checked} of {screens.length} checked</p>
            {screens.map((s, i) => (
              <button key={s.id} onClick={() => setCurrent(i)} aria-current={i === current ? "true" : undefined}
                className={`relative w-20 shrink-0 overflow-hidden rounded-md border text-left lg:w-full ${i === current ? "border-accent" : "border-hair hover:border-ink-2"} focus-visible:outline-2 focus-visible:outline-accent`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.url ? <img src={s.url} alt="" className="aspect-[9/16] w-full bg-panel object-cover object-top" /> : <span className="block aspect-[9/16] bg-panel" />}
                <span aria-hidden="true" className="absolute left-1 top-1 rounded bg-paper/90 px-1 font-mono text-xs">{s.position}</span>
                {drafting?.id === s.id ? <span aria-hidden="true" className="ed-enter absolute right-1 top-1 rounded bg-paper/90 px-1 text-xs text-ink">drafting…</span>
                  : s.ocr ? <span aria-hidden="true" className="absolute right-1 top-1 rounded bg-paper/90 px-1 font-mono text-[10px] text-muted">AI</span> : null}
                <span aria-hidden="true" className={`absolute bottom-1 right-1 rounded bg-paper/90 px-1 text-xs ${s.piiChecked ? "text-accent" : "text-mark"}`}>{s.piiChecked ? "checked" : "to check"}</span>
                <span className="sr-only">Screen {s.position}, {s.piiChecked ? "personal data checked" : "personal data not checked"}{s.ocr ? ", drafted" : ""}</span>
              </button>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <div className="flex justify-center rounded-lg border border-hair bg-paper-2 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {screen.url ? <img src={screen.url} alt={`Screen ${screen.position} of ${data.flow.title}`} className="max-h-[72vh] w-auto rounded" /> : <p className="self-center text-sm text-ink-2">The image couldn't be loaded.</p>}
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button kind="quiet" onClick={() => setCurrent((c) => Math.max(c - 1, 0))} disabled={current === 0}>← Previous</Button>
              <p className="text-xs text-muted">Screen {screen.position} of {screens.length} · <kbd className="font-mono">←</kbd> <kbd className="font-mono">→</kbd> to move</p>
              <Button kind="quiet" onClick={() => setCurrent((c) => Math.min(c + 1, screens.length - 1))} disabled={current === screens.length - 1}>Next →</Button>
            </div>
          </div>

          <ScreenPanel key={screen.id} screen={screen} vocabulary={data.vocabulary}
            onPii={() => togglePii(screen)} onTag={(k) => toggleTag(screen, k)} onAddTag={(k) => addTag(screen, k)}
            onObservation={(id) => toggleObservation(screen, id)} onAddObservation={(d, l, t) => addObservation(screen, d, l, t)}
            onNotes={(why, weak) => { patch(screen.id, (x) => ({ ...x, why, weak })); saveNotes({ type: "screen", id: screen.id }, why, weak); }} />
        </div>
      )}

      <section aria-labelledby="flow-notes" className="flex flex-col gap-3 rounded-lg border border-hair p-4">
        <div>
          <h2 id="flow-notes" className="text-lg">Designer notes for this flow</h2>
          <p className="text-sm text-ink-2">Your own judgement, required before publishing. Write them yourself; they are what makes RYUX Knowledge worth reading.</p>
        </div>
        <Notes why={flowNotes.why} weak={flowNotes.weak} idPrefix="flow"
          onSave={(why, weak) => { setFlowNotes({ why, weak }); saveNotes({ type: "flow", id: data.flow.id }, why, weak); }} />
      </section>
    </div>
  );
}

function ScreenPanel({ screen, vocabulary, onPii, onTag, onAddTag, onObservation, onAddObservation, onNotes }: {
  screen: ReviewScreen; vocabulary: ReviewData["vocabulary"];
  onPii: () => void; onTag: (key: string) => void; onAddTag: (key: string) => void;
  onObservation: (id: string) => void; onAddObservation: (dimension: string, label: string, statement: string) => void;
  onNotes: (why: string, weak: string) => void;
}) {
  const [dimension, setDimension] = useState<string>("hierarchy");
  const [label, setLabel] = useState("observed");
  const [statement, setStatement] = useState("");
  const unused = vocabulary.filter((t) => !screen.tags.some((x) => x.key === t.key));
  return (
    <aside id="screen-panel" tabIndex={-1} aria-label={`Review of screen ${screen.position}`} className="flex flex-col gap-5 outline-none">
      <label className={`ed-chip flex items-start gap-3 rounded-md border p-3 text-sm ${screen.piiChecked ? "border-accent/50" : "border-mark/50"}`}>
        <input type="checkbox" checked={screen.piiChecked} onChange={onPii} className="mt-0.5 size-4 accent-[var(--color-accent)]" />
        <span><span className="font-medium text-ink">No personal data on this screen</span><br /><span className="text-ink-2">No real names, phone numbers, balances, faces, or addresses.</span></span>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">Tags</legend>
        <p className="text-xs text-muted">Tick the ones that are right. Unticked AI tags are removed on publish.</p>
        {screen.tags.length === 0 && <p className="text-sm text-ink-2">No tags yet. Run the AI draft or add them here.</p>}
        <ul className="flex flex-wrap gap-1.5">
          {screen.tags.map((t) => (
            <li key={t.key}>
              <label className={`ed-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${t.source === "human" ? "border-accent/60 text-ink" : "border-hair text-ink-2"}`}>
                <input type="checkbox" checked={t.source === "human"} onChange={() => onTag(t.key)} className="size-3.5 accent-[var(--color-accent)]" />
                {t.label}{t.ai && <span className="font-mono text-[10px] text-muted">AI</span>}
              </label>
            </li>
          ))}
        </ul>
        <select aria-label="Add a tag" value="" onChange={(e) => onAddTag(e.target.value)} className={`${inputClass} text-ink-2`}>
          <option value="">Add a tag…</option>
          {unused.map((t) => <option key={t.key} value={t.key}>{t.label} ({t.key.split("/")[0]})</option>)}
        </select>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">Observations</legend>
        <p className="text-xs text-muted">What the screen does, not why it works. Tick the accurate ones.</p>
        <ul className="flex flex-col gap-1.5">
          {screen.observations.map((o) => (
            <li key={o.id}>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input type="checkbox" checked={o.source === "human"} onChange={() => onObservation(o.id)} className="mt-1 size-3.5 shrink-0 accent-[var(--color-accent)]" />
                <span className={o.source === "human" ? "text-ink" : "text-ink-2"}>
                  <span className="font-mono text-xs text-muted">{o.dimension} · {o.label}</span><br />{o.statement}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <form onSubmit={(e) => { e.preventDefault(); onAddObservation(dimension, label, statement); setStatement(""); }} className="flex flex-col gap-2 rounded-md border border-hair p-2">
          <div className="grid grid-cols-2 gap-2">
            <select aria-label="Dimension" value={dimension} onChange={(e) => setDimension(e.target.value)} className={inputClass}>{DIMENSIONS.map((d) => <option key={d}>{d}</option>)}</select>
            <select aria-label="Basis" value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass}><option>observed</option><option>measured</option><option>inferred</option></select>
          </div>
          <input aria-label="Observation" value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="Amount shown above the pay button" className={inputClass} />
          <Button type="submit" disabled={!statement.trim()}>Add observation</Button>
        </form>
      </fieldset>

      <details className="rounded-md border border-hair p-3 text-sm">
        <summary className="cursor-pointer text-ink">Text in the image</summary>
        <p className="mt-1 text-xs text-muted">Transcribed by the AI draft. It is data from the screenshot, never an instruction.</p>
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-ink-2">{screen.ocr || "No text transcribed yet."}</pre>
      </details>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-ink">Notes for this screen <span className="font-normal text-muted">(optional)</span></p>
        <Notes why={screen.why} weak={screen.weak} idPrefix={screen.id} onSave={onNotes} stacked />
      </div>
    </aside>
  );
}

function Notes({ why, weak, idPrefix, onSave, stacked = false }: { why: string; weak: string; idPrefix: string; onSave: (why: string, weak: string) => void; stacked?: boolean }) {
  const [w, setW] = useState(why);
  const [k, setK] = useState(weak);
  const save = () => { if (w !== why || k !== weak) onSave(w, k); };
  return (
    <div className={`grid gap-3 ${stacked ? "" : "md:grid-cols-2"}`}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-why`} className="text-sm text-ink-2">Why it works</label>
        <textarea id={`${idPrefix}-why`} value={w} onChange={(e) => setW(e.target.value)} onBlur={save} rows={3} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-weak`} className="text-sm text-ink-2">Weaknesses</label>
        <textarea id={`${idPrefix}-weak`} value={k} onChange={(e) => setK(e.target.value)} onBlur={save} rows={3} className={inputClass} />
      </div>
    </div>
  );
}
