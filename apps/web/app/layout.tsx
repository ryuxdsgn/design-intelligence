import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
