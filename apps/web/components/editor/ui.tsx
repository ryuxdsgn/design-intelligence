import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { Icon } from "./icons";

/* Editor primitives on the site's board tokens: teal is the action, coral marks a problem and nothing else.
   Every screen builds from these; a look that is needed twice belongs here, not in a page.
   Phones get 44 px targets and 16 px input text (iOS zooms into smaller fields). */

export const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type Kind = "primary" | "secondary" | "quiet";
type Size = "md" | "sm";

/** The button look, for a <button> or a <Link> that acts as one. */
export function buttonClass(kind: Kind = "secondary", size: Size = "md") {
  const look = {
    primary: "bg-accent text-paper hover:bg-accent/90 font-medium [--ic-dot:currentColor]",
    secondary: "border border-hair text-ink hover:bg-panel",
    quiet: "text-ink-2 hover:text-ink hover:bg-panel",
  }[kind];
  const box = size === "md" ? "min-h-11 px-3.5 text-sm sm:min-h-9" : "min-h-11 px-2 text-xs sm:min-h-8";
  return `tactile inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${box} ${look} ${focus}`;
}

export function Button({ kind, size, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { kind?: Kind; size?: Size }) {
  return <button className={`${buttonClass(kind, size)} ${className}`} {...props} />;
}

/** An inline text link. */
export const linkClass = `text-sm text-accent underline-offset-2 hover:underline ${focus}`;

export const inputClass = `w-full rounded-lg border border-hair bg-paper px-3 py-2.5 text-base text-ink placeholder:text-muted/70 sm:py-2 sm:text-sm ${focus}`;

/** A native select (keyboard and mobile pickers stay native) with the set's chevron, inset from the edge. */
export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={`relative block ${className}`}>
      <select className={`${inputClass} cursor-pointer appearance-none pr-10 sm:pr-9`} {...props}>{children}</select>
      <Icon name="dropdown" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-2" />
    </span>
  );
}

export const checkboxClass = "size-4 shrink-0 accent-[var(--color-accent)]";

/** A raised surface on the board: lists, panels, sections. */
export const cardClass = "rounded-2xl border border-hair bg-paper";

export function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const look = status === "published" ? "bg-accent/10 text-accent" : "bg-panel text-ink-2";
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${look}`}>{status === "in_review" ? "in review" : status}</span>;
}

export function Problems({ title, items, onPick }: { title: string; items: string[]; onPick?: (item: string) => void }) {
  if (!items.length) return null;
  return (
    <div role="alert" className="ed-enter rounded-lg border border-mark/50 bg-mark/10 p-3 text-sm text-ink">
      <p className="flex items-center gap-1.5 font-medium text-mark"><Icon name="alert" />{title}</p>
      <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-ink-2">
        {items.map((p) => (
          <li key={p}>{onPick ? <button type="button" onClick={() => onPick(p)} className={`inline text-left underline decoration-hair underline-offset-2 hover:text-ink ${focus}`}>{p}</button> : p}</li>
        ))}
      </ul>
    </div>
  );
}

/** Whether the last change reached the database: shown briefly, so every save is visible (RX-IX-01). */
export function SaveStatus({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  const text = { idle: "", saving: "Saving…", saved: "Saved", error: "Not saved" }[state];
  return (
    <span aria-live="polite" className={`ed-fade inline-flex items-center gap-1 text-xs ${state === "error" ? "text-mark" : "text-muted"} ${state === "idle" ? "opacity-0" : "opacity-100"}`}>
      {state === "saved" && <Icon name="check" />}{state === "error" && <Icon name="alert" />}{text}
    </span>
  );
}

/** Work with a known length (AI draft, frame search). */
export function Progress({ label, done, total }: { label: string; done: number; total: number }) {
  return (
    <div className="h-1 overflow-hidden rounded-full bg-panel" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
      <div className="ed-progress h-full bg-accent" style={{ transform: `scaleX(${total ? done / total : 0})` }} />
    </div>
  );
}

/** A section that stays folded until needed: optional fields and secondary detail. */
export function Disclosure({ summary, open, children }: { summary: ReactNode; open?: boolean; children: ReactNode }) {
  return (
    <details open={open} className="group rounded-xl border border-hair text-sm">
      <summary className={`flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-3 text-ink-2 hover:text-ink sm:min-h-10 ${focus}`}>
        <Icon name="disclose" className="text-muted" />
        {summary}
      </summary>
      <div className="px-3 pb-3">{children}</div>
    </details>
  );
}
