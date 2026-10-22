import type { ButtonHTMLAttributes, ReactNode } from "react";

/* Editor primitives on the site's board tokens: teal is the action, coral marks a problem and nothing else. */

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Button({ kind = "secondary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { kind?: "primary" | "secondary" | "quiet" }) {
  const look = {
    primary: "bg-accent text-paper hover:bg-accent/90 font-medium",
    secondary: "border border-hair text-ink hover:bg-panel",
    quiet: "text-ink-2 hover:text-ink hover:bg-panel",
  }[kind];
  return <button className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${look} ${focus} ${className}`} {...props} />;
}

export const inputClass = `w-full rounded-md border border-hair bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted/70 ${focus}`;

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
  const look = status === "published" ? "border-accent/40 text-accent" : "border-hair text-ink-2";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-xs ${look}`}>{status === "in_review" ? "in review" : status}</span>;
}

export function Problems({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div role="alert" className="rounded-md border border-mark/50 bg-mark/10 p-3 text-sm text-ink">
      <p className="font-medium text-mark">{title}</p>
      <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-ink-2">{items.map((p) => <li key={p}>{p}</li>)}</ul>
    </div>
  );
}
