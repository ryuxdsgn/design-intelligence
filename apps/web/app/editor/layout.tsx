import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RYUX Editor",
  robots: { index: false, follow: false },
};

export default function EditorRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-paper text-ink [color-scheme:dark]">{children}</div>;
}
