import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface TaxonomyTag {
  layer: "pattern" | "component";
  slug: string;
  label: string;
  /** Third column of the table (what to look for), when the table has one. */
  description: string;
  /** For patterns: local to Indonesia, or general. */
  scope?: "local" | "general";
}

// docs/taxonomy.md is the admin-owned vocabulary. AI tags outside it are rejected, never created.
export function readTaxonomy(root: string): TaxonomyTag[] {
  const md = readFileSync(join(root, "docs/taxonomy.md"), "utf8");
  const section = (heading: string): string => {
    const start = md.indexOf(`## ${heading}`);
    if (start < 0) return "";
    const next = md.indexOf("\n## ", start + 3);
    return md.slice(start, next < 0 ? undefined : next);
  };
  const rows = (text: string): { slug: string; label: string; description: string }[] =>
    [...text.matchAll(/^\|[ \t]*`([a-z0-9-]+)`[ \t]*\|[ \t]*([^|\n]+?)[ \t]*\|(?:[ \t]*([^|\n]+?)[ \t]*\|)?/gm)].map((m) => ({
      slug: m[1],
      label: m[2],
      description: m[3] ?? "",
    }));
  return [
    ...rows(section("Local patterns")).map((r) => ({ layer: "pattern" as const, scope: "local" as const, ...r })),
    ...rows(section("General patterns")).map((r) => ({ layer: "pattern" as const, scope: "general" as const, ...r })),
    ...rows(section("Components")).map((r) => ({ layer: "component" as const, ...r })),
  ];
}

export const tagId = (t: { layer: string; slug: string }): string => `tag_${t.layer}_${t.slug}`.replace(/-/g, "_");
