import { notFound } from "next/navigation";
import { Review } from "@/components/editor/review";
import { loadReview } from "@/lib/editor/data";
import { currentEditor, editorServerClient } from "@/lib/editor/server";

export default async function FlowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await editorServerClient();
  const [data, editor] = await Promise.all([loadReview(sb, decodeURIComponent(id)), currentEditor(sb)]);
  if (!data) notFound();
  return <Review data={data} editorId={editor!.id} />;
}
