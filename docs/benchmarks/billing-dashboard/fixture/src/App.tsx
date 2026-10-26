import { useEffect, useState } from "react";
import { Members } from "./pages/Members";
import { Overview } from "./pages/Overview";

const routes = [
  { path: "#/", label: "Overview", page: Overview },
  { path: "#/members", label: "Members", page: Members },
];

function useHash() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const on = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash;
}

export function App() {
  const hash = useHash();
  const route = routes.find((r) => r.path === hash) ?? routes[0];
  const Page = route.page;
  return (
    <div className="shell">
      <nav className="shell-nav" aria-label="Main">
        <strong>Workspace</strong>
        {routes.map((r) => (
          <a key={r.path} href={r.path} aria-current={r === route ? "page" : undefined}>{r.label}</a>
        ))}
      </nav>
      <main className="shell-main">
        <Page />
      </main>
    </div>
  );
}
