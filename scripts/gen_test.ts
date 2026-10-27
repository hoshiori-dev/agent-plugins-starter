import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { join } from "@std/path";
import { fixturePlugin, makeTree, MCP, runScript, writeTree } from "./lib/testing.ts";

Deno.test("gen writes every client file, is deterministic, and --check passes afterwards", () => {
  const root = makeTree(fixturePlugin());
  const first = runScript("gen.ts", [], root);
  assertEquals(first.code, 0, first.output);
  const read = (p: string) => Deno.readTextFileSync(join(root, p));
  const snapshot = [
    ".claude-plugin/plugin.json",
    "com.anthropic.claude-code/mcp.json",
    "com.google.antigravity/plugin.json",
    "com.google.antigravity/mcp_config.json",
    ".agents/plugins/marketplace.json",
  ].map(read);
  const second = runScript("gen.ts", [], root);
  assertEquals(second.code, 0, second.output);
  assertEquals(second.output.includes("wrote"), false, "second run must write nothing");
  const check = runScript("gen.ts", ["--check"], root);
  assertEquals(check.code, 0, check.output);

  const claude = JSON.parse(snapshot[0]);
  assertEquals(claude.agents, ["./com.anthropic.claude-code/agents/reviewer.md"]);
  assertEquals(claude.mcpServers, "./com.anthropic.claude-code/mcp.json");
  assertEquals(claude.$schema, undefined, "Claude manifest must not carry the spec $schema");
  const claudeMcp = JSON.parse(snapshot[1]).mcpServers;
  assertEquals(claudeMcp.local.args[1], "${CLAUDE_PLUGIN_ROOT}/mcp/local/server.ts");
  assertEquals(claudeMcp.local.env.CONFIG, "${CLAUDE_PLUGIN_ROOT}/config.json");
  assertEquals(claudeMcp.remote.type, "http");
  const agy = JSON.parse(snapshot[2]);
  assertEquals(agy.$schema, "https://antigravity.google/schemas/v1/plugin.json");
  assertEquals(agy.name, "fixture-plugin");
  const agyMcp = JSON.parse(snapshot[3]).mcpServers;
  assertEquals(agyMcp.local.args, ["run", "mcp/local/server.ts"]);
  assertEquals(agyMcp.remote, { url: "https://example.com/mcp", headers: { "X-Tenant": "t" } });
  const claudeMarket = JSON.parse(read(".claude-plugin/marketplace.json"));
  assertEquals(claudeMarket.plugins[0].source, "./");
  assertEquals(claudeMarket.owner, { name: "Fixture Team" });
  const market = JSON.parse(snapshot[4]);
  assertEquals(market.plugins[0].source, { source: "local", path: "./" });
  assertEquals(market.plugins[0].category, "Productivity");
});

Deno.test("gen --check reports stale, missing, and orphan files", () => {
  const root = makeTree(fixturePlugin());
  assertEquals(runScript("gen.ts", [], root).code, 0);
  Deno.writeTextFileSync(join(root, "com.anthropic.claude-code/mcp.json"), "{}\n");
  Deno.removeSync(join(root, ".agents/plugins/marketplace.json"));
  const check = runScript("gen.ts", ["--check"], root);
  assertEquals(check.code, 1);
  assertStringIncludes(check.output, "com.anthropic.claude-code/mcp.json: gen-stale");
  assertStringIncludes(check.output, ".agents/plugins/marketplace.json: gen-missing");

  // Disabling a client leaves its generated files behind: orphans.
  Deno.removeSync(join(root, "com.anthropic.claude-code"), { recursive: true });
  const orphan = runScript("gen.ts", ["--check"], root);
  assertEquals(orphan.code, 1);
  assertStringIncludes(orphan.output, ".claude-plugin/plugin.json: gen-orphan");
  assertStringIncludes(orphan.output, "client claude-code is disabled");
});

Deno.test("gen only generates for enabled clients", () => {
  const files = fixturePlugin();
  delete files["com.google.antigravity/agents/reviewer.md"];
  delete files["com.google.antigravity/skills"];
  delete files["com.google.antigravity/mcp"];
  const root = makeTree(files);
  const list = runScript("gen.ts", ["--list"], root);
  assertEquals(list.code, 0, list.output);
  assert(!list.output.includes("com.google.antigravity"), list.output);
  assertStringIncludes(list.output, ".claude-plugin/plugin.json");
});

Deno.test("gen fails fast on features a client cannot express", () => {
  const withCwd = structuredClone(MCP) as typeof MCP & { mcpServers: Record<string, unknown> };
  (withCwd.mcpServers.local as Record<string, unknown>).cwd = "${PLUGIN_ROOT}";
  const root = makeTree(fixturePlugin());
  writeTree(root, { "mcp.json": JSON.stringify(withCwd) + "\n" });
  const result = runScript("gen.ts", [], root);
  assertEquals(result.code, 2);
  assertStringIncludes(result.output, "mcpServers.local uses cwd");

  const withSse = structuredClone(MCP) as typeof MCP & { mcpServers: Record<string, unknown> };
  withSse.mcpServers.legacy = { type: "sse", url: "https://example.com/sse" };
  writeTree(root, { "mcp.json": JSON.stringify(withSse) + "\n" });
  const sse = runScript("gen.ts", [], root);
  assertEquals(sse.code, 2);
  assertStringIncludes(sse.output, 'uses type "sse", which has no antigravity equivalent');
});

Deno.test("gen rejects a manifest that violates the schema", () => {
  const root = makeTree({
    ...fixturePlugin(),
    "plugin.json": JSON.stringify({ ...structuredClone(MCP), name: "x" }),
  });
  const result = runScript("gen.ts", [], root);
  assertEquals(result.code, 2);
  assertStringIncludes(result.output, "plugin.json violates the Agent Plugins schema");
});
