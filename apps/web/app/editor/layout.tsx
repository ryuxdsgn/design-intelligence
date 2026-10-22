import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RYUX Editor",
  robots: { index: false, follow: false },
};

export default function EditorRoot({ children }: { children: React.ReactNode }) {
  return <div className="ed-light min-h-dvh bg-paper text-ink">{children}</div>;
}
