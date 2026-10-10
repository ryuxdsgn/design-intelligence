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
      className={`flex max-w-full items-center gap-3 rounded-md py-2 pr-2 pl-4 font-mono text-[14px] ${
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
        className={`tactile min-h-9 shrink-0 rounded px-3 text-[13px] ${
          night ? "text-night-sub hover:text-night-text" : "text-muted hover:text-ink"
        }`}
      >
        <span aria-live="polite">{label}</span>
      </button>
    </div>
  );
}
