import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { dirname, fromFileUrl, join } from "jsr:@std/path@1";

const script = join(dirname(fromFileUrl(import.meta.url)), "import_mcp.ts");

function run(from: string, content: string, ext: string) {
  const dir = Deno.makeTempDirSync();
  const file = join(dir, `source${ext}`);
  Deno.writeTextFileSync(file, content);
  const result = new Deno.Command(Deno.execPath(), {
    args: ["run", "--quiet", "--allow-read", "--allow-write", script, "--from", from, file],
    cwd: dir,
    stdout: "piped",
    stderr: "piped",
  }).outputSync();
  const decoder = new TextDecoder();
  return {
    code: result.code,
    stdout: decoder.decode(result.stdout),
    stderr: decoder.decode(result.stderr),
  };
}

Deno.test("claude-code: http becomes streamable-http and placeholders are renamed", () => {
  const r = run(
    "claude-code",
    JSON.stringify({
      mcpServers: {
        local: {
          command: "node",
          args: ["${CLAUDE_PLUGIN_ROOT}/server.js"],
          env: { A: "${CLAUDE_PLUGIN_DATA}/x" },
        },
        remote: {
          type: "http",
          url: "https://e.com/mcp",
          headers: { "X": "1" },
          headersHelper: "./h.sh",
        },
      },
    }),
    ".json",
  );
  assertEquals(r.code, 0, r.stderr);
  const out = JSON.parse(r.stdout).mcpServers;
  assertEquals(out.local, {
    type: "stdio",
    command: "node",
    args: ["${PLUGIN_ROOT}/server.js"],
    env: { A: "${PLUGIN_DATA}/x" },
  });
  assertEquals(out.remote, {
    type: "streamable-http",
    url: "https://e.com/mcp",
    headers: { X: "1" },
  });
  assertStringIncludes(r.stderr, "remote.headersHelper");
});

Deno.test("antigravity: relative paths gain ${PLUGIN_ROOT}, policy fields are reported", () => {
  const r = run(
    "antigravity",
    JSON.stringify({
      mcpServers: {
        s: { command: "deno", args: ["run", "mcp/s/server.ts"], disabledTools: ["x"] },
        u: { serverUrl: "https://e.com/mcp" },
      },
    }),
    ".json",
  );
  assertEquals(r.code, 0, r.stderr);
  const out = JSON.parse(r.stdout).mcpServers;
  assertEquals(out.s.args, ["run", "${PLUGIN_ROOT}/mcp/s/server.ts"]);
  assertEquals(out.u, { type: "streamable-http", url: "https://e.com/mcp" });
  assertStringIncludes(r.stderr, "s.disabledTools");
});

Deno.test("codex: config.toml mcp_servers tables convert and policy is reported", () => {
  const r = run(
    "codex",
    '[mcp_servers.a]\ncommand = "npx"\nargs = ["-y", "x"]\nenabled_tools = ["t"]\n\n[mcp_servers.b]\nurl = "https://e.com/mcp"\nbearer_token_env_var = "TOKEN"\n',
    ".toml",
  );
  assertEquals(r.code, 0, r.stderr);
  const out = JSON.parse(r.stdout).mcpServers;
  assertEquals(out.a, { type: "stdio", command: "npx", args: ["-y", "x"] });
  assertEquals(out.b, { type: "streamable-http", url: "https://e.com/mcp" });
  assertStringIncludes(r.stderr, "a.enabled_tools");
  assertStringIncludes(r.stderr, "b.bearer_token_env_var");
});

Deno.test("claude-code: an unsupported server type is skipped, not written as a placeholder", () => {
  const r = run(
    "claude-code",
    JSON.stringify({
      mcpServers: {
        ws: { type: "ws", url: "ws://x" },
        ok: { command: "deno", args: ["run", "s.ts"] },
      },
    }),
    ".json",
  );
  assertEquals(r.code, 0, r.stderr);
  const out = JSON.parse(r.stdout).mcpServers;
  assertEquals(Object.keys(out), ["ok"]);
  assertStringIncludes(r.stderr, "ws.type");
});

Deno.test("codex: non-string env values become strings", () => {
  const r = run(
    "codex",
    '[mcp_servers.s]\ncommand = "deno"\nenv = { DEBUG = true, PORT = 8080 }\n',
    ".toml",
  );
  assertEquals(r.code, 0, r.stderr);
  assertEquals(JSON.parse(r.stdout).mcpServers.s.env, { DEBUG: "true", PORT: "8080" });
});

Deno.test("codex: table and array env values are reported, not stringified", () => {
  const r = run(
    "codex",
    '[mcp_servers.s]\ncommand = "deno"\nenv = { OK = "x", OPTS = { a = 1 }, LIST = ["a", "b"] }\n',
    ".toml",
  );
  assertEquals(r.code, 0, r.stderr);
  assertEquals(JSON.parse(r.stdout).mcpServers.s.env, { OK: "x" });
  assertStringIncludes(r.stderr, "s.env.OPTS");
  assertStringIncludes(r.stderr, "s.env.LIST");
});
