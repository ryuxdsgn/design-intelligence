import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOut } from "@/components/editor/sign-out";
import { currentEditor, editorServerClient } from "@/lib/editor/server";

export default async function EditorApp({ children }: { children: React.ReactNode }) {
  const editor = await currentEditor(await editorServerClient());
  if (!editor) redirect("/editor/login");
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-hair bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/editor" className="text-sm font-semibold tracking-tight text-ink hover:text-accent">RYUX <span className="font-normal text-ink-2">Editor</span></Link>
          <div className="flex items-center gap-3 text-sm text-ink-2">
            <span className="hidden sm:inline">{editor.email}</span>
            <SignOut />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </>
  );
}
