import Link from "next/link";
import { Icon } from "@/components/editor/icons";
import { FlowIllustration } from "@/components/editor/illustrations";
import { StatusBadge, buttonClass, focus, linkClass } from "@/components/editor/ui";
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
          <h1 className="text-3xl">Flows</h1>
          <p className="mt-1 text-sm text-ink-2">Screens become references for the RYUX MCP only after a person reviews and publishes them.</p>
        </div>
        <Link href="/editor/new" className={buttonClass("primary")}><Icon name="add" />New flow</Link>
      </div>

      <nav aria-label="Filter by status" className="-mt-2 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.value ? all.filter((x) => x.status === f.value).length : all.length;
          const active = f.value === status;
          return (
            <Link key={f.label} href={f.value ? `/editor?status=${f.value}` : "/editor"} aria-current={active ? "page" : undefined}
              className={`ed-chip inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm sm:min-h-9 ${active ? "border-ink bg-ink text-paper" : "border-hair text-ink-2 hover:border-ink-2 hover:text-ink"} ${focus}`}>
              {f.label} <span className={active ? "text-paper/70" : "text-muted"}>{count}</span>
            </Link>
          );
        })}
      </nav>

      {flows.length === 0 ? (
        <div className="ed-enter flex flex-col items-center gap-3 rounded-2xl bg-paper-2 px-6 py-12 text-center">
          {all.length === 0 && <FlowIllustration className="h-20 w-auto" />}
          <p className="font-medium text-ink">{all.length === 0 ? "No flows yet" : `No ${status} flows`}</p>
          <p className="max-w-md text-sm text-ink-2">
            {all.length === 0
              ? "A flow is the screens of one journey, in order. Upload them, run the AI draft, review every screen, and publish."
              : "Every flow has another status. Show all flows to see them."}
          </p>
          {all.length === 0 ? (
            <Link href="/editor/new" className={`${buttonClass("primary")} mt-1`}><Icon name="add" />New flow</Link>
          ) : (
            <Link href="/editor" className={linkClass}>Show all flows</Link>
          )}
        </div>
      ) : (
        <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {flows.map((f) => (
            <li key={f.id}>
              <Link href={`/editor/flows/${f.id}`} className={`group block rounded-2xl ${focus}`}>
                <span className="flex aspect-[4/3] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-paper-2 p-4">
                  {f.covers.length ? f.covers.map((u, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={u} alt="" className="h-full w-[30%] rounded-lg object-cover object-top shadow-sm transition-transform duration-[var(--dur-2)] ease-[var(--ease-out)] group-hover:-translate-y-1 motion-reduce:transition-none" />
                  )) : <span className="text-sm text-muted">{f.steps ? "Preview unavailable" : "No screens yet"}</span>}
                </span>
                <span className="mt-3 flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink group-hover:underline">{f.title || f.id}</span>
                    <span className="mt-0.5 block truncate text-sm text-ink-2">{f.app} {f.version} · {f.steps} {f.steps === 1 ? "screen" : "screens"}</span>
                    <span className="block truncate text-sm text-muted">{f.flowType} · {f.platform}</span>
                  </span>
                  <StatusBadge status={f.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
