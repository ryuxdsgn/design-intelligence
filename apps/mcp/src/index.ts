import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  PLAN,
  appNames,
  auditCopyTool,
  auditUiTool,
  charge,
  compareAppsTool,
  deliveryGateTool,
  extractDesignDirectionTool,
  getFlowTool,
  getLocalPatternTool,
  heuristicEvalTool,
  HEURISTIC_EVAL_CREDITS,
  searchScreensTool,
  setData,
} from "@ryux/core";
import { loadFromSupabase, type SupabaseEnv } from "./db";

// ryux MCP server: just transport wiring + per-session quota state.
// Each tool's data and logic live in @ryux/core.
export class RyuxMCP extends McpAgent<SupabaseEnv> {
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
        reset_on: "the 1st of next month",
        plans_url: "https://ryux.design/pricing",
      }),
    };
  }

  async init() {
    try {
      const data = await loadFromSupabase(this.env);
      if (data && data.screens.length > 0) setData(data.screens, data.patterns);
    } catch {
      // Supabase unavailable -> keep using the @ryux/core sample data.
    }

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
      compareAppsTool.name,
      compareAppsTool.description,
      compareAppsTool.input,
      async (args) => {
        const charged = charge(this.used, 1);
        if (!charged.ok) return this.quotaError(charged.remaining);
        this.used = charged.used;

        const comparison = compareAppsTool.run(args);
        if (comparison.apps.length === 0) {
          return {
            isError: true,
            ...this.reply({
              error: "apps_not_found",
              requested: comparison.not_found,
              available: appNames(),
            }),
          };
        }

        return this.reply({
          ...comparison,
          usage: { credits_used: 1, credits_remaining: charged.remaining, plan: PLAN },
        });
      },
    );

    this.server.tool(
      extractDesignDirectionTool.name,
      extractDesignDirectionTool.description,
      extractDesignDirectionTool.input,
      async (args) => {
        const charged = charge(this.used, 1);
        if (!charged.ok) return this.quotaError(charged.remaining);
        this.used = charged.used;

        const direction = extractDesignDirectionTool.run(args);
        if (direction.based_on.length === 0) {
          return {
            isError: true,
            ...this.reply({
              error: "no_reference_found",
              hint: "Perluas brief atau lepas filter category/pattern.",
            }),
          };
        }

        return this.reply({
          ...direction,
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

    this.server.tool(
      auditUiTool.name,
      auditUiTool.description,
      auditUiTool.input,
      async (args) => {
        return this.reply({
          ...auditUiTool.run(args),
          usage: { credits_used: 0, plan: PLAN },
        });
      },
    );

    this.server.tool(
      auditCopyTool.name,
      auditCopyTool.description,
      auditCopyTool.input,
      async (args) => {
        return this.reply({
          ...auditCopyTool.run(args),
          usage: { credits_used: 0, plan: PLAN },
        });
      },
    );

    this.server.tool(
      heuristicEvalTool.name,
      heuristicEvalTool.description,
      heuristicEvalTool.input,
      async (args) => {
        const charged = charge(this.used, HEURISTIC_EVAL_CREDITS);
        if (!charged.ok) return this.quotaError(charged.remaining);
        this.used = charged.used;

        return this.reply({
          ...heuristicEvalTool.run(args),
          usage: { credits_used: HEURISTIC_EVAL_CREDITS, credits_remaining: charged.remaining, plan: PLAN },
        });
      },
    );
  }
}

// Endpoint Streamable HTTP: http://localhost:8787/mcp
export default RyuxMCP.serve("/mcp");
