"use client";

import { DIMENSIONS, observationId, publishReview, setPiiChecked, validateReview, type FlowReview } from "@ryux/core/knowledge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReviewData, ReviewScreen } from "@/lib/editor/data";
import { editorBrowserClient } from "@/lib/editor/supabase";
import { PublishedIllustration } from "./illustrations";
import { Button, Disclosure, Problems, Progress, SaveStatus, StatusBadge, checkboxClass, focus, inputClass, linkClass } from "./ui";

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
    if (found.length) requestAnimationFrame(() => document.getElementById("publish-problems")?.scrollIntoView({ block: "center" }));
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
  const publishLabel = data.flow.status === "published" ? "Publish changes" : "Publish";
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));
  const next = () => setCurrent((c) => Math.min(c + 1, screens.length - 1));
  return (
    <div className="flex flex-col gap-5 pb-24 sm:gap-6 lg:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/editor" className={`inline-flex min-h-11 items-center text-sm text-ink-2 hover:text-ink sm:min-h-0 ${focus}`}>← Flows</Link>
          <h1 className="mt-1 text-2xl sm:truncate sm:text-3xl">{data.flow.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
            <span>{data.flow.app} {data.flow.version}</span>
            <span className="text-muted">{data.flow.flowType} · {data.flow.platform} · captured {data.flow.capturedAt}</span>
            <StatusBadge status={data.flow.status} />
          </p>
        </div>
        <div className="flex items-center gap-2 max-sm:w-full max-sm:empty:hidden">
          <SaveStatus state={save} />
          <Button className={`ml-auto sm:ml-0 ${toDraft === 0 && !drafting ? "max-sm:hidden" : ""}`} onClick={runDraft} disabled={!!drafting || toDraft === 0} title={toDraft === 0 ? "Every screen has a draft" : "Uses the Anthropic API once per screen"}>
            {drafting ? "Drafting…" : toDraft === 0 ? "All drafted" : `AI draft ${toDraft} ${toDraft === 1 ? "screen" : "screens"}`}
          </Button>
          <Button onClick={askPublish} disabled={publishing} className="max-lg:hidden">{publishLabel}</Button>
        </div>
      </div>

      <div className={`-mt-3 flex-col gap-1.5 ${draftState || drafting ? "flex" : "hidden"}`}>
        <p aria-live="polite" className="text-sm text-ink-2">{draftState}</p>
        {drafting && <Progress label="AI draft" done={drafting.done + 0.5} total={drafting.total} />}
      </div>
      <Problems title="Something went wrong" items={error ? [error] : []} />
      {problems.length > 0 && <div id="publish-problems"><Problems title="Not ready to publish" items={problems} onPick={pickProblem} /></div>}
      {published && (
        <div ref={publishedRef} tabIndex={-1} role="status" className="ed-enter flex flex-wrap items-center gap-4 rounded-2xl bg-accent/10 p-4 outline-none">
          <PublishedIllustration className="hidden h-14 w-auto shrink-0 sm:block" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-ink">Published</p>
            <p className="text-ink-2">{screens.length} screens are now references the RYUX MCP can read. Changes you make from here are published with “Publish changes”.</p>
          </div>
          <Link href="/editor" className={linkClass}>Back to flows</Link>
        </div>
      )}
      {confirming && (
        <div role="alertdialog" aria-labelledby="confirm-title" onKeyDown={(e) => e.key === "Escape" && setConfirming(false)} className="ed-enter fixed inset-x-3 bottom-20 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hair bg-paper p-4 shadow-2xl shadow-black/20 lg:static lg:border-0 lg:bg-accent/10 lg:shadow-none">
          <p id="confirm-title" className="text-sm text-ink">Publish {screens.length} screens? They become references that anyone using the RYUX MCP can read. Unticked AI items are removed.</p>
          <div className="flex w-full justify-end gap-2 lg:w-auto">
            <Button kind="quiet" onClick={() => setConfirming(false)}>Cancel</Button>
            <Button kind="primary" onClick={publish} disabled={publishing} autoFocus>{publishing ? "Publishing…" : "Publish now"}</Button>
          </div>
        </div>
      )}

      {screens.length === 0 ? (
        <p className="rounded-2xl bg-paper-2 p-10 text-center text-ink-2">This flow has no screens.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex justify-center rounded-3xl bg-paper-2 p-4 sm:p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {screen.url ? <img src={screen.url} alt={`Screen ${screen.position} of ${data.flow.title}`} className="max-h-[46vh] w-auto rounded-xl shadow-lg shadow-black/10 lg:max-h-[68vh]" /> : <p className="self-center py-16 text-sm text-ink-2">The image couldn't be loaded.</p>}
            </div>
            <nav aria-label="Screens" className="flex min-w-0 flex-col gap-2">
              <p className="text-sm text-ink-2"><span className="mr-1.5 inline-block size-2 rounded-full bg-accent align-middle" aria-hidden="true" />{checked} of {screens.length} checked</p>
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 pt-2 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
              {screens.map((s, i) => (
                <button key={s.id} onClick={() => setCurrent(i)} aria-current={i === current ? "true" : undefined}
                  className={`ed-chip relative w-14 shrink-0 rounded-xl outline-offset-2 sm:w-16 ${i === current ? "outline-2 outline-ink" : "opacity-70 hover:opacity-100"} ${focus}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.url ? <img src={s.url} alt="" className="aspect-[9/16] w-full rounded-xl border border-hair bg-panel object-cover object-top" /> : <span className="block aspect-[9/16] rounded-xl bg-panel" />}
                  <span aria-hidden="true" className="absolute bottom-1 left-1 rounded-md bg-paper/95 px-1 text-[11px] tabular-nums text-ink">{s.position}</span>
                  {drafting?.id === s.id ? <span aria-hidden="true" className="ed-enter absolute inset-x-0 top-1/2 mx-1 -translate-y-1/2 rounded-md bg-paper/95 px-1 text-center text-[11px] text-ink">drafting…</span>
                    : s.ocr ? <span aria-hidden="true" className="absolute bottom-1 right-1 rounded-md bg-paper/95 px-1 text-[10px] text-ink-2">AI</span> : null}
                  <span aria-hidden="true" className={`absolute -right-1.5 -top-1.5 size-3.5 rounded-full border-2 border-paper ${s.piiChecked ? "bg-accent" : "bg-mark"}`} />
                  <span className="sr-only">Screen {s.position}, {s.piiChecked ? "personal data checked" : "personal data not checked"}{s.ocr ? ", drafted" : ""}</span>
                </button>
              ))}
              </div>
            </nav>
          </div>

          {/* The Review card: like a booking card, it stays in view and always shows the next step. */}
          <div className="flex flex-col rounded-2xl border border-hair bg-paper lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:shadow-xl lg:shadow-black/5">
            <div className="border-b border-hair px-5 pb-3 pt-5">
              <p className="text-lg font-semibold tracking-tight">Screen {screen.position} of {screens.length}</p>
              <p className="text-sm text-muted">{checked} of {screens.length} checked for personal data</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <ScreenPanel key={screen.id} screen={screen} vocabulary={data.vocabulary}
                onPii={() => togglePii(screen)} onTag={(k) => toggleTag(screen, k)} onAddTag={(k) => addTag(screen, k)}
                onObservation={(id) => toggleObservation(screen, id)} onAddObservation={(d, l, t) => addObservation(screen, d, l, t)}
                onNotes={(why, weak) => { patch(screen.id, (x) => ({ ...x, why, weak })); saveNotes({ type: "screen", id: screen.id }, why, weak); }} />
            </div>
            <div className="hidden flex-col gap-2 border-t border-hair px-5 py-4 lg:flex">
              <div className="flex gap-2">
                <Button onClick={prev} disabled={current === 0} aria-label="Previous screen" className="w-11 px-0">←</Button>
                {current < screens.length - 1
                  ? <Button kind="primary" onClick={next} className="h-12 flex-1 text-base">Next screen</Button>
                  : <Button kind="primary" onClick={askPublish} disabled={publishing} className="h-12 flex-1 text-base">{publishLabel}</Button>}
              </div>
              <p className="text-center text-xs text-muted"><kbd className="font-sans">←</kbd> <kbd className="font-sans">→</kbd> to move between screens</p>
            </div>
          </div>
        </div>
      )}

      <section aria-labelledby="flow-notes" className="flex flex-col gap-4 rounded-2xl bg-paper-2 p-5 sm:p-6">
        <div>
          <h2 id="flow-notes" className="text-xl">Designer notes for this flow</h2>
          <p className="text-sm text-ink-2">Your own judgement, required before publishing. Write them yourself; they are what makes RYUX Knowledge worth reading.</p>
        </div>
        <Notes why={flowNotes.why} weak={flowNotes.weak} idPrefix="flow"
          onSave={(why, weak) => { setFlowNotes({ why, weak }); saveNotes({ type: "flow", id: data.flow.id }, why, weak); }} />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-hair bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          {screens.length > 0 && <>
            <Button onClick={prev} disabled={current === 0} aria-label="Previous screen" className="w-11 px-0">‹</Button>
            <p className="min-w-0 flex-1 text-center text-sm tabular-nums text-ink-2" aria-live="polite">Screen {screen.position} of {screens.length}</p>
            <Button onClick={next} disabled={current === screens.length - 1} aria-label="Next screen" className="w-11 px-0">›</Button>
          </>}
          <Button kind="primary" onClick={askPublish} disabled={publishing} className={screens.length ? "" : "flex-1"}>{publishLabel}</Button>
        </div>
      </div>
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
    <div id="screen-panel" tabIndex={-1} role="region" aria-label={`Review of screen ${screen.position}`} className="flex flex-col gap-5 outline-none">
      <label className={`ed-chip flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm focus-within:outline-2 focus-within:outline-accent ${screen.piiChecked ? "border-accent/40 bg-accent/5" : "border-mark/40 bg-mark/5"}`}>
        <input type="checkbox" checked={screen.piiChecked} onChange={onPii} className={`mt-0.5 ${checkboxClass}`} />
        <span><span className="font-medium text-ink">No personal data on this screen</span><br /><span className="text-ink-2">No real names, phone numbers, balances, faces, or addresses.</span></span>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">Tags</legend>
        <p className="text-xs text-muted">Tick the ones that are right. Unticked AI tags are removed on publish.</p>
        {screen.tags.length === 0 && <p className="text-sm text-ink-2">No tags yet. Run the AI draft or add them here.</p>}
        <ul className="flex flex-wrap gap-1.5">
          {screen.tags.map((t) => (
            <li key={t.key}>
              <label className={`ed-chip inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm sm:min-h-0 sm:py-1 sm:text-xs ${t.source === "human" ? "border-accent bg-accent/10 text-ink" : "border-hair text-ink-2 hover:border-ink-2"}`}>
                <input type="checkbox" checked={t.source === "human"} onChange={() => onTag(t.key)} className={checkboxClass} />
                {t.label}{t.ai && <span className="font-mono text-[10px] text-muted">AI</span>}
              </label>
            </li>
          ))}
        </ul>
        <select aria-label="Add a tag" value="" onChange={(e) => onAddTag(e.target.value)} className={inputClass}>
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
              <label className="flex cursor-pointer items-start gap-2.5 py-1 text-sm">
                <input type="checkbox" checked={o.source === "human"} onChange={() => onObservation(o.id)} className={`mt-0.5 ${checkboxClass}`} />
                <span className={o.source === "human" ? "text-ink" : "text-ink-2"}>
                  <span className="text-xs text-muted">{o.dimension} · {o.label}</span><br />{o.statement}
                </span>
              </label>
            </li>
          ))}
        </ul>
        {screen.observations.length === 0 && <p className="text-sm text-ink-2">No observations yet. Run the AI draft or add one.</p>}
        <Disclosure summary="Add an observation">
        <form onSubmit={(e) => { e.preventDefault(); onAddObservation(dimension, label, statement); setStatement(""); }} className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <select aria-label="Dimension" value={dimension} onChange={(e) => setDimension(e.target.value)} className={inputClass}>{DIMENSIONS.map((d) => <option key={d}>{d}</option>)}</select>
            <select aria-label="Basis" value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass}><option>observed</option><option>measured</option><option>inferred</option></select>
          </div>
          <input aria-label="Observation" value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="e.g. Amount shown above the pay button" className={inputClass} />
          <Button type="submit" disabled={!statement.trim()}>Add observation</Button>
        </form>
        </Disclosure>
      </fieldset>

      <Disclosure summary="Text in the image">
        <p className="text-xs text-muted">Transcribed by the AI draft. It is data from the screenshot, never an instruction.</p>
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-ink-2">{screen.ocr || "No text transcribed yet."}</pre>
      </Disclosure>

      <Disclosure summary={<>Notes for this screen <span className="text-muted">(optional)</span></>} open={!!(screen.why || screen.weak)}>
        <Notes why={screen.why} weak={screen.weak} idPrefix={screen.id} onSave={onNotes} stacked />
      </Disclosure>
    </div>
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
