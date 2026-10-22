import Link from "next/link";
import { FlowIllustration } from "@/components/editor/illustrations";
import { StatusBadge } from "@/components/editor/ui";
import { listFlows } from "@/lib/editor/data";
import { editorServerClient } from "@/lib/editor/server";

const FILTERS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

export default async function FlowList({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "" } = await searchParams;
  const all = await listFlows(await editorServerClient());
  const flows = status ? all.filter((f) => f.status === status) : all;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">Flows</h1>
          <p className="mt-1 text-sm text-ink-2">Screens become references for the RYUX MCP only after a person reviews and publishes them.</p>
        </div>
        <Link href="/editor/new" className="tactile inline-flex min-h-11 items-center rounded-lg bg-accent px-3.5 text-sm font-medium text-paper hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-9">New flow</Link>
      </div>

      <nav aria-label="Filter by status" className="flex gap-1">
        {FILTERS.map((f) => {
          const count = f.value ? all.filter((x) => x.status === f.value).length : all.length;
          const active = f.value === status;
          return (
            <Link key={f.label} href={f.value ? `/editor?status=${f.value}` : "/editor"} aria-current={active ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm ${active ? "bg-panel text-ink" : "text-ink-2 hover:text-ink"}`}>
              {f.label} <span className="font-mono text-xs text-muted">{count}</span>
            </Link>
          );
        })}
      </nav>

      {flows.length === 0 ? (
        <div className="ed-enter flex flex-col items-center gap-3 rounded-lg border border-dashed border-hair px-6 py-10 text-center">
          {all.length === 0 && <FlowIllustration className="h-20 w-auto" />}
          <p className="text-ink">{all.length === 0 ? "No flows yet" : `No ${status} flows`}</p>
          <p className="max-w-md text-sm text-ink-2">
            {all.length === 0
              ? "A flow is the screens of one journey, in order. Upload them, run the AI draft, review every screen, and publish."
              : "Every flow has another status. Show all flows to see them."}
          </p>
          {all.length === 0 ? (
            <Link href="/editor/new" className="tactile mt-1 inline-flex min-h-9 items-center rounded-md bg-accent px-3.5 text-sm font-medium text-paper hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">New flow</Link>
          ) : (
            <Link href="/editor" className="text-sm text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent">Show all flows</Link>
          )}
        </div>
      ) : (
        <>
        <ul className="flex flex-col gap-2 sm:hidden">
          {flows.map((f) => (
            <li key={f.id}>
              <Link href={`/editor/flows/${f.id}`} className="tactile flex items-center gap-3 rounded-xl border border-hair bg-paper-2 p-4 focus-visible:outline-2 focus-visible:outline-accent">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{f.title || f.id}</span>
                  <span className="mt-0.5 block truncate text-sm text-ink-2">{f.app} {f.version} · {f.steps} {f.steps === 1 ? "screen" : "screens"}</span>
                </span>
                <StatusBadge status={f.status} />
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto rounded-xl border border-hair sm:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-2 text-xs text-muted">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">App</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Flow</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Version</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Screens</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {flows.map((f) => (
                <tr key={f.id} className="border-t border-hair hover:bg-paper-2">
                  <td className="px-4 py-3 text-ink">{f.app}</td>
                  <td className="px-4 py-3">
                    <Link href={`/editor/flows/${f.id}`} className="text-ink hover:text-accent focus-visible:outline-2 focus-visible:outline-accent">{f.title || f.id}</Link>
                    <span className="ml-2 font-mono text-xs text-muted">{f.flowType}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-2">{f.version}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-ink-2">{f.steps}</td>
                  <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
