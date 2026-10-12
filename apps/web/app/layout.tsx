import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/* Review canvas: one sans for headings and reading, its mono for labels, frame titles, and commands. */
const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const DESCRIPTION =
  "RYUX is design intelligence for designers and AI coding tools. It reasons before it designs: what it observed, what it inferred, and what it still doesn't know.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ryux.design"),
  title: "RYUX: design intelligence",
  description: DESCRIPTION,
  openGraph: {
    title: "RYUX: design intelligence",
    description: DESCRIPTION,
    url: "https://ryux.design",
    siteName: "RYUX",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
