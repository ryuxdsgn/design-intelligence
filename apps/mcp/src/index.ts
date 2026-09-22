import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  PLAN,
  charge,
  deliveryGateTool,
  getFlowTool,
  getLocalPatternTool,
  searchScreensTool,
} from "@ryux/core";

// Server MCP ryux: hanya wiring transport + state kuota per-sesi.
// Data dan logika tiap tool ada di @ryux/core.
export class RyuxMCP extends McpAgent {
  server = new McpServer({ name: "ryux", version: "0.1.0" });
  private used = 0;

  private reply(payload: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }] };
  }

  private quotaError(remaining: number) {
    return {
      isError: true,
      ...this.reply({
        error: "quota_exceeded",
        credits_remaining: remaining,
        reset_on: "tanggal 1 bulan depan",
        plans_url: "https://ryux.design/harga",
      }),
    };
  }

  async init() {
    this.server.tool(
      searchScreensTool.name,
      searchScreensTool.description,
      searchScreensTool.input,
      async (args) => {
        const charged = charge(this.used, 1);
        if (!charged.ok) return this.quotaError(charged.remaining);
        this.used = charged.used;

        return this.reply({
          results: searchScreensTool.run(args),
          usage: { credits_used: 1, credits_remaining: charged.remaining, plan: PLAN },
        });
      },
    );

    this.server.tool(
      getFlowTool.name,
      getFlowTool.description,
      getFlowTool.input,
      async ({ flow_id }) => {
        const charged = charge(this.used, 1);
        if (!charged.ok) return this.quotaError(charged.remaining);
        this.used = charged.used;

        const flow = getFlowTool.run(flow_id);
        if (!flow.ok) {
          return {
            isError: true,
            ...this.reply({ error: "flow_not_found", available: flow.available }),
          };
        }

        return this.reply({
          flow_id: flow.flow_id,
          type: flow.type,
          app: flow.app,
          steps: flow.steps,
          usage: { credits_used: 1, credits_remaining: charged.remaining, plan: PLAN },
        });
      },
    );

    this.server.tool(
      getLocalPatternTool.name,
      getLocalPatternTool.description,
      getLocalPatternTool.input,
      async ({ slug }) => {
        const charged = charge(this.used, 1);
        if (!charged.ok) return this.quotaError(charged.remaining);
        this.used = charged.used;

        const found = getLocalPatternTool.run(slug);
        if (!found.ok) {
          return {
            isError: true,
            ...this.reply({ error: "pattern_not_found", available: found.available }),
          };
        }

        return this.reply({
          slug: found.slug,
          ...found.pattern,
          usage: { credits_used: 1, credits_remaining: charged.remaining, plan: PLAN },
        });
      },
    );

    this.server.tool(
      deliveryGateTool.name,
      deliveryGateTool.description,
      deliveryGateTool.input,
      async (args) => {
        return this.reply({
          ...deliveryGateTool.run(args),
          usage: { credits_used: 0, plan: PLAN },
        });
      },
    );
  }
}

// Endpoint Streamable HTTP: http://localhost:8787/mcp
export default RyuxMCP.serve("/mcp");
