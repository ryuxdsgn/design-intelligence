"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "ok" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }
      setStatus("ok");
      setMessage("You're on the list. We'll email you when the hosted reference library opens.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network hiccup. Check your connection and try again.");
    }
  }

  if (status === "ok") {
    return (
      <p className="flex items-center gap-2 text-[15px] font-medium text-ink" role="status">
        <span aria-hidden>✓</span> {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md" noValidate>
      <label htmlFor="wl-email" className="mb-2 block text-sm font-semibold text-ink">
        Email
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="wl-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-invalid={status === "error"}
          aria-describedby={status === "error" ? "wl-msg" : undefined}
          className="min-h-12 flex-1 rounded-md border border-hair bg-white px-4 text-[15px] text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-ink/20"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="min-h-12 rounded-md bg-ink px-6 text-[15px] font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "loading" ? "Joining…" : "Join the waitlist"}
        </button>
      </div>
      {status === "error" && (
        <p id="wl-msg" className="mt-2 text-sm text-mark" role="alert">
          {message}
        </p>
      )}
      <p className="mt-3 text-[13px] text-muted">
        One email, when the hosted reference library opens. No spam.
      </p>
    </form>
  );
}
