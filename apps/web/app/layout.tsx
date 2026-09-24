import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://ryux.design"),
  title: "ryux: evidence-based UI references for AI agents",
  description:
    "UI and flow references from real Indonesian apps, served to AI agents over MCP, with an open-source anti-slop ruleset. Your agent designs from proof and has to cite it.",
  openGraph: {
    title: "ryux: evidence-based UI references for AI agents",
    description:
      "Curated screens and flows over MCP, plus an open-source anti-slop ruleset. Design from proof, not generic patterns.",
    url: "https://ryux.design",
    siteName: "ryux",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-paper text-ink font-sans">{children}</body>
    </html>
  );
}
