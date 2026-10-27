// Smoke test: start the server exactly as mcp.json declares it, with
// ${PLUGIN_ROOT} replaced by this repository, then list and call its tool.
import { Client } from "npm:@modelcontextprotocol/sdk@1.32.2/client/index.js";
import { StdioClientTransport } from "npm:@modelcontextprotocol/sdk@1.32.2/client/stdio.js";
import { assertEquals } from "jsr:@std/assert@1";
import { dirname, fromFileUrl, resolve } from "jsr:@std/path@1";

const pluginRoot = resolve(dirname(fromFileUrl(import.meta.url)), "../..");

Deno.test("example-server answers tools/list and echo through mcp.json's command", async () => {
  const mcp = JSON.parse(await Deno.readTextFile(resolve(pluginRoot, "mcp.json")));
  const declared = mcp.mcpServers["example-server"];
  const args = declared.args.map((a: string) => a.replaceAll("${PLUGIN_ROOT}", pluginRoot));
  const client = new Client({ name: "server_test", version: "0.0.0" });
  const transport = new StdioClientTransport({ command: declared.command, args, cwd: pluginRoot });
  await client.connect(transport);
  try {
    const tools = await client.listTools();
    assertEquals(tools.tools.map((t: { name: string }) => t.name), ["echo"]);
    const result = await client.callTool({ name: "echo", arguments: { text: "ping" } });
    assertEquals(result.content, [{ type: "text", text: "example-server: ping" }]);
  } finally {
    await client.close();
  }
});
