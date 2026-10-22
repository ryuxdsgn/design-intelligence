"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { editorBrowserClient } from "@/lib/editor/supabase";
import { Button, Field, Problems, inputClass } from "./ui";

export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const sb = editorBrowserClient();
    const { error: signInError } = await sb.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (signInError) {
      setError(signInError.message === "Invalid login credentials" ? "That email and password don't match an account." : signInError.message);
      setBusy(false);
      return;
    }
    const { data: staff } = await sb.rpc("is_staff");
    if (!staff) {
      await sb.auth.signOut();
      setError("This account isn't an editor. Ask an admin to set its role to reviewer or admin.");
      setBusy(false);
      return;
    }
    router.replace("/editor");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="username" required className={inputClass} />
      </Field>
      <Field label="Password" htmlFor="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <Problems title="Couldn't sign in" items={error ? [error] : []} />
      <Button kind="primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}
