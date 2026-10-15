// Product metadata. The version has one source of truth: this package's package.json.
import { createRequire } from "node:module";

const pkg = createRequire(import.meta.url)("../package.json") as { version: string };

/** The RYUX product version (npm package, skill, plugins, and rules share it). */
export const VERSION: string = pkg.version;
export const MCP_NAME = "ryux";
/** Until the hosted MCP is live, every surface says so. No connect URL is printed or written into files
 *  the agent reads: self-hosting steps live only in apps/mcp/README.md. */
export const MCP_STATUS =
  "The hosted ryux MCP is not live yet. RYUX works without it and rates evidence None. " +
  "To run the server yourself, see https://github.com/ryuxdsgn/design-intelligence/tree/main/apps/mcp.";
export const CLI_CMD = "npx @ryuxdsgn/design-intelligence";
export const MARK_START = "<!-- ryux-rules:start -->";
export const MARK_END = "<!-- ryux-rules:end -->";
export const CONTEXT_START = "<!-- ryux-context:start -->";
export const CONTEXT_END = "<!-- ryux-context:end -->";
export const CONTEXT_FILE = "DESIGN.md";
