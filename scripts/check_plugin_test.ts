import { assertEquals, assertStringIncludes } from "@std/assert";
import { join } from "@std/path";
import { fixturePlugin, makeTree, runScript, writeTree } from "./lib/testing.ts";

Deno.test("check_plugin passes on the fixture plugin", () => {
  const root = makeTree(fixturePlugin());
  const result = runScript("check_plugin.ts", [], root);
  assertEquals(result.code, 0, result.output);
});

Deno.test("check_plugin reports layout and wiring findings", () => {
  const root = makeTree(fixturePlugin());
  writeTree(root, {
    "skills/beta/SKILL.md": "---\nname: Beta\ndescription: x\n---\n",
    ".agents/skills/alpha/SKILL.md": "---\nname: alpha\ndescription: project skill\n---\n",
    "com.anthropic.claude-code/agents/extra.md": "---\nname: extra\ndescription: Only here.\n---\n",
    "openspec/specs/mcp/ghost/spec.md": "# ghost\n",
  });
  Deno.removeSync(join(root, "openspec/specs/skill/alpha/spec.md"));
  const result = runScript("check_plugin.ts", [], root);
  assertEquals(result.code, 1);
  for (
    const expected of [
      "skills/beta/SKILL.md: skill-name",
      "skills/alpha/SKILL.md: skill-name-collision",
      "com.openai/agents/extra.toml: agent-parity",
      "com.google.antigravity/agents/extra.md: agent-parity",
      "openspec/specs/skill/alpha/spec.md: catalog-missing-spec",
      "openspec/specs/mcp/ghost/spec.md: catalog-orphan-spec",
      "openspec/specs/skill/beta/spec.md: catalog-missing-spec",
    ]
  ) assertStringIncludes(result.output, expected);
});

Deno.test("check_plugin ties the Codex directory to the extension block and config", () => {
  const files = fixturePlugin();
  files[".codex/config.toml"] = '[plugins."fixture-plugin@fixture-plugin"]\nenabled = false\n';
  const root = makeTree(files);
  const result = runScript("check_plugin.ts", [], root);
  assertEquals(result.code, 1);
  assertStringIncludes(result.output, ".codex/config.toml: codex-plugin-enabled");
  assertStringIncludes(result.output, ".codex/config.toml: codex-agent-wiring");

  Deno.removeSync(join(root, "com.openai"), { recursive: true });
  const noDir = runScript("check_plugin.ts", [], root);
  assertStringIncludes(noDir.output, "com.openai: codex-switch");
});

Deno.test("check_plugin skips catalogs loudly when openspec is absent", () => {
  const root = makeTree(fixturePlugin());
  Deno.removeSync(join(root, "openspec"), { recursive: true });
  const result = runScript("check_plugin.ts", [], root);
  assertEquals(result.code, 0, result.output);
  assertStringIncludes(result.output, "openspec/specs is absent; catalog checks skipped");
});

Deno.test("check_plugin --footprint lists a client's files", () => {
  const root = makeTree(fixturePlugin());
  const result = runScript("check_plugin.ts", ["--footprint", "antigravity"], root);
  assertEquals(result.code, 0);
  assertEquals(result.output.trim().split("\n"), [
    ".agents/plugins/fixture-plugin",
    "com.google.antigravity",
    "com.google.antigravity/mcp",
    "com.google.antigravity/mcp_config.json",
    "com.google.antigravity/plugin.json",
    "com.google.antigravity/skills",
  ]);
});
