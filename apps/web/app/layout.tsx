import type { Metadata } from "next";
import { Anybody, Fragment_Mono, Mona_Sans } from "next/font/google";
import "./globals.css";

/* Redline spec: a wide display face for headings, a plain sans for reading, a mono for measurements. */
const display = Anybody({ subsets: ["latin"], variable: "--font-anybody", axes: ["wdth"], display: "swap" });
const sans = Mona_Sans({ subsets: ["latin"], variable: "--font-mona", display: "swap" });
const mono = Fragment_Mono({ subsets: ["latin"], weight: "400", variable: "--font-fragment", display: "swap" });

const DESCRIPTION =
  "RYUX is design intelligence for AI agents and designers. It makes AI reason before it designs: what it observed, what it inferred, and what it still doesn't know.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ryux.design"),
  title: "RYUX: design intelligence for AI",
  description: DESCRIPTION,
  openGraph: {
    title: "RYUX: design intelligence for AI",
    description: DESCRIPTION,
    url: "https://ryux.design",
    siteName: "RYUX",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
