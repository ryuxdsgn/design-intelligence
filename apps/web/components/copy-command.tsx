"use client";

import { useRef, useState } from "react";

type Status = "idle" | "copied" | "failed";

/** A shell command with a copy button. If the clipboard is blocked, the text is selected instead. */
export function CopyCommand({ command, night = false, prompt = "$" }: { command: string; night?: boolean; prompt?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const codeRef = useRef<HTMLElement>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setStatus("copied");
    } catch {
      const range = document.createRange();
      if (codeRef.current) range.selectNodeContents(codeRef.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      setStatus("failed");
    }
    setTimeout(() => setStatus("idle"), 2000);
  }

  const label = status === "copied" ? "Copied" : status === "failed" ? "Selected, press ⌘C" : "Copy";

  return (
    <div
      data-status={status}
      className={`copy-row flex max-w-full items-center gap-3 rounded-md py-2 pr-2 pl-4 font-mono text-[14px] ${
        night ? "bg-night-hair/60 text-night-text" : "bg-paper-2 text-ink"
      }`}
    >
      {prompt && (
        <span aria-hidden className={night ? "text-night-sub" : "text-muted"}>
          {prompt}
        </span>
      )}
      <code ref={codeRef} className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-1">
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        className={`tactile inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded px-3 text-[13px] ${
          night ? "text-night-sub hover:text-night-text" : "text-muted hover:text-ink"
        }`}
      >
        {status === "copied" ? (
          <svg key="ok" className="pop" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12 5 5 9-10" />
          </svg>
        ) : (
          <svg key="copy" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V6a2 2 0 0 1 2-2h9" />
          </svg>
        )}
        <span aria-live="polite">{label}</span>
      </button>
    </div>
  );
}
