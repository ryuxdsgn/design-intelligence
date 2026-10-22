import { NewFlow } from "@/components/editor/new-flow";

export default function NewFlowPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl">New flow</h1>
        <p className="mt-1 text-sm text-ink-2">One flow is one journey for one goal, such as paying with QRIS. Add its screens in the order a user sees them.</p>
      </div>
      <NewFlow />
    </div>
  );
}
