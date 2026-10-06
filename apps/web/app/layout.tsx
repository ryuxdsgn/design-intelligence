import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

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
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}>
      <body className="bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
