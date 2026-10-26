import { Card } from "../components";

export function Overview() {
  return (
    <div className="stack">
      <h1 className="page-title">Overview</h1>
      <Card title="Welcome">
        <p>Manage your workspace's members and settings from the menu.</p>
      </Card>
    </div>
  );
}
