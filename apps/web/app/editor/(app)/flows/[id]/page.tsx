import { notFound, redirect } from "next/navigation";
import { Review } from "@/components/editor/review";
import { loadReview } from "@/lib/editor/data";
import { currentEditor, editorServerClient } from "@/lib/editor/server";

export default async function FlowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await editorServerClient();
  const [data, editor] = await Promise.all([loadReview(sb, decodeURIComponent(id)), currentEditor(sb)]);
  // The layout guards too, but it renders in parallel: a session that ended meanwhile goes to sign-in here.
  if (!editor) redirect("/editor/login");
  if (!data) notFound();
  return <Review data={data} editorId={editor.id} />;
}
