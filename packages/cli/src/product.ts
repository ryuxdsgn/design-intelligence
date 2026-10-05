// Product metadata. The version has one source of truth: this package's package.json.
import { createRequire } from "node:module";

const pkg = createRequire(import.meta.url)("../package.json") as { version: string };

/** The RYUX product version (npm package, skill, plugins, and rules share it). */
export const VERSION: string = pkg.version;
export const MCP_NAME = "ryux";
export const MCP_URL = "https://mcp.ryux.design/mcp";
export const MCP_ADD_CMD = `claude mcp add --transport http ${MCP_NAME} ${MCP_URL}`;
export const CLI_CMD = "npx @ryuxdsgn/ryux";
export const MARK_START = "<!-- ryux-rules:start -->";
export const MARK_END = "<!-- ryux-rules:end -->";
export const CONTEXT_START = "<!-- ryux-context:start -->";
export const CONTEXT_END = "<!-- ryux-context:end -->";
export const CONTEXT_FILE = "DESIGN.md";
