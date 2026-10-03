import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface TaxonomyTag {
  layer: "pattern" | "component";
  slug: string;
  label: string;
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
  const rows = (text: string): { slug: string; label: string }[] =>
    [...text.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|\s*([^|]+?)\s*\|/gm)].map((m) => ({ slug: m[1], label: m[2] }));
  return [
    ...rows(section("Local patterns")).map((r) => ({ layer: "pattern" as const, ...r })),
    ...rows(section("Components")).map((r) => ({ layer: "component" as const, ...r })),
  ];
}

export const tagId = (t: { layer: string; slug: string }): string => `tag_${t.layer}_${t.slug}`.replace(/-/g, "_");
