import { useCallback, useEffect, useState } from "react";
import { getMembers, type Member } from "../api/members";
import { Badge, Banner, Button, Card, EmptyState, Skeleton, Table, type Column } from "../components";

type State = { status: "loading" } | { status: "error" } | { status: "ready"; members: Member[] };

const columns: Column<Member>[] = [
  { key: "name", header: "Name", render: (m) => m.name },
  { key: "email", header: "Email", render: (m) => m.email },
  { key: "role", header: "Role", render: (m) => m.role },
  { key: "status", header: "Status", render: (m) => (m.status === "active" ? <Badge tone="success">Active</Badge> : <Badge>Invited</Badge>) },
];

export function Members() {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(() => {
    setState({ status: "loading" });
    getMembers().then(
      (members) => setState({ status: "ready", members }),
      () => setState({ status: "error" }),
    );
  }, []);

  useEffect(load, [load]);

  return (
    <div className="stack">
      <h1 className="page-title">Members</h1>
      {state.status === "error" && (
        <Banner tone="danger" title="Members couldn't load" action={<Button variant="secondary" onClick={load}>Try again</Button>}>
          Check your connection and try again.
        </Banner>
      )}
      <Card title="People in this workspace">
        {state.status === "loading" && (
          <div className="stack" aria-label="Loading members">
            <Skeleton /><Skeleton /><Skeleton />
          </div>
        )}
        {state.status === "ready" && state.members.length === 0 && (
          <EmptyState title="No members yet">Invite people to work in this workspace.</EmptyState>
        )}
        {state.status === "ready" && state.members.length > 0 && (
          <Table caption="Members" columns={columns} rows={state.members} rowKey={(m) => m.id} />
        )}
      </Card>
    </div>
  );
}
