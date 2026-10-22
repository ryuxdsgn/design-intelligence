import { redirect } from "next/navigation";
import { LoginForm } from "@/components/editor/login-form";
import { currentEditor, editorServerClient } from "@/lib/editor/server";

export default async function LoginPage() {
  if (await currentEditor(await editorServerClient())) redirect("/editor");
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4 sm:px-6">
      <div>
        <p className="text-sm font-semibold tracking-tight text-ink">RYUX <span className="font-normal text-ink-2">Editor</span></p>
        <h1 className="mt-1 text-2xl">Sign in</h1>
        <p className="mt-2 text-sm text-ink-2">For staff who curate RYUX Knowledge. Use your editor account.</p>
      </div>
      <LoginForm />
    </main>
  );
}
