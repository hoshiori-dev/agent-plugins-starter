#!/usr/bin/env -S deno run --quiet --allow-read=.
// Example MCP server shipped with the plugin. It speaks stdio and exposes one
// tool so every client can prove that the plugin's MCP wiring works.
//
// Imports use full specifiers on purpose: clients spawn this file from an
// arbitrary working directory, where deno.json is not discovered.
import { McpServer } from "npm:@modelcontextprotocol/sdk@1.32.2/server/mcp.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk@1.32.2/server/stdio.js";
import { z } from "npm:zod@4.6.7";

const server = new McpServer({
  name: "example-server",
  version: "0.1.0",
});

server.registerTool(
  "echo",
  {
    title: "Echo",
    description:
      "Returns the given text unchanged, prefixed with the server name. Use it to confirm that the agent-plugins-starter MCP server is reachable.",
    inputSchema: { text: z.string().describe("Text to echo back") },
  },
  ({ text }: { text: string }) => ({
    content: [{ type: "text", text: `example-server: ${text}` }],
  }),
);

await server.connect(new StdioServerTransport());
