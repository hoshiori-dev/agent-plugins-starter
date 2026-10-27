#!/usr/bin/env -S deno run --allow-read --allow-write
// Converts a client-specific MCP declaration into Agent Plugins 1.0.0
// `mcp.json` entries. Prints the converted `mcpServers` map; with --write,
// merges it into ./mcp.json (refusing to overwrite an existing server unless
// --force). Fields the spec cannot express are listed on stderr, never dropped
// silently.
//
//   import_mcp.ts --from <claude-code|codex|antigravity> <file> [--write] [--force]
import { parse as parseToml } from "jsr:@std/toml@1";

type Server = Record<string, unknown>;
const SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";

const args = [...Deno.args];
const write = take("--write");
const force = take("--force");
const fromIndex = args.indexOf("--from");
const from = fromIndex === -1 ? undefined : args.splice(fromIndex, 2)[1];
const file = args[0];
if (!from || !file || args.length !== 1) {
  console.error(
    "usage: import_mcp.ts --from <claude-code|codex|antigravity> <file> [--write] [--force]",
  );
  Deno.exit(2);
}

const unmapped: string[] = [];
const servers = convert(from, await Deno.readTextFile(file));
const output = { $schema: SCHEMA, mcpServers: servers };

if (write) {
  let current: { $schema?: string; mcpServers?: Record<string, Server> } = {
    $schema: SCHEMA,
    mcpServers: {},
  };
  try {
    current = JSON.parse(await Deno.readTextFile("mcp.json"));
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }
  const merged = { ...(current.mcpServers ?? {}) };
  for (const [name, server] of Object.entries(servers)) {
    if (name in merged && !force) {
      console.error(`mcp.json already has a server named "${name}"; pass --force to replace it`);
      Deno.exit(1);
    }
    merged[name] = server;
  }
  await Deno.writeTextFile(
    "mcp.json",
    JSON.stringify({ $schema: SCHEMA, mcpServers: merged }, null, 2) + "\n",
  );
  console.log(`merged ${Object.keys(servers).length} server(s) into mcp.json`);
} else {
  console.log(JSON.stringify(output, null, 2));
}
if (unmapped.length > 0) {
  console.error("unmapped fields (decide by hand):");
  for (const u of unmapped) console.error(`  ${u}`);
}

function take(flag: string): boolean {
  const i = args.indexOf(flag);
  if (i === -1) return false;
  args.splice(i, 1);
  return true;
}

function convert(from: string, text: string): Record<string, Server> {
  switch (from) {
    case "claude-code":
      return mapAll(JSON.parse(text).mcpServers ?? {}, fromClaude);
    case "antigravity":
      return mapAll(JSON.parse(text).mcpServers ?? {}, fromAntigravity);
    case "codex":
      return mapAll(
        (parseToml(text) as { mcp_servers?: Record<string, Server> }).mcp_servers ?? {},
        fromCodex,
      );
    default:
      console.error(`unknown source "${from}"; use claude-code, codex, or antigravity`);
      Deno.exit(2);
  }
}

/** Converts every server; a converter returns null for a server the spec cannot express, which is then left out. */
function mapAll(
  input: Record<string, Server>,
  fn: (name: string, s: Server) => Server | null,
): Record<string, Server> {
  const out: Record<string, Server> = {};
  for (const name of Object.keys(input).sort()) {
    const converted = fn(name, input[name]);
    if (converted !== null) out[name] = converted;
  }
  return out;
}

function placeholders(s: string): string {
  return s.replaceAll("${CLAUDE_PLUGIN_ROOT}", "${PLUGIN_ROOT}").replaceAll(
    "${CLAUDE_PLUGIN_DATA}",
    "${PLUGIN_DATA}",
  );
}

function stdio(name: string, s: Server, known: string[], pathFix: (v: string) => string): Server {
  const out: Server = { type: "stdio", command: pathFix(String(s.command)) };
  if (Array.isArray(s.args)) out.args = s.args.map((a) => pathFix(String(a)));
  if (s.env && typeof s.env === "object") {
    // TOML and JSON sources may carry numbers or booleans, which become strings;
    // a table or array has no string form and is reported instead.
    const env = Object.entries(s.env as Record<string, unknown>);
    for (const [k, v] of env) {
      if (typeof v === "object" && v !== null) {
        unmapped.push(`${name}.env.${k} = ${JSON.stringify(v)} (not a string)`);
      }
    }
    out.env = Object.fromEntries(
      env.filter(([, v]) => typeof v !== "object" || v === null).map((
        [k, v],
      ) => [k, pathFix(String(v))]),
    );
  }
  if (typeof s.cwd === "string") out.cwd = pathFix(s.cwd);
  report(name, s, [...known, "command", "args", "env", "cwd"]);
  return out;
}

function remote(name: string, s: Server, url: string, headers: unknown, known: string[]): Server {
  const out: Server = { type: "streamable-http", url };
  if (headers && typeof headers === "object") out.headers = headers;
  report(name, s, known);
  return out;
}

function report(name: string, s: Server, known: string[]) {
  for (const key of Object.keys(s)) {
    if (!known.includes(key)) unmapped.push(`${name}.${key} = ${JSON.stringify(s[key])}`);
  }
}

function fromClaude(name: string, s: Server): Server | null {
  const type = s.type ?? (s.command ? "stdio" : "http");
  if (type === "stdio") return stdio(name, s, ["type"], placeholders);
  if (type === "http") {
    return remote(name, s, placeholders(String(s.url)), s.headers, ["type", "url", "headers"]);
  }
  if (type === "sse") {
    const out = remote(name, s, placeholders(String(s.url)), s.headers, ["type", "url", "headers"]);
    out.type = "sse";
    return out;
  }
  unmapped.push(`${name}.type = ${JSON.stringify(type)} (no spec equivalent; server skipped)`);
  return null;
}

function fromAntigravity(name: string, s: Server): Server {
  const relative = (
    v: string,
  ) => (/^(\.\/|[a-z0-9_-]+\/)/i.test(v) && !v.startsWith("/")
    ? `\${PLUGIN_ROOT}/${v.replace(/^\.\//, "")}`
    : v);
  if (s.command) return stdio(name, s, [], relative);
  const url = s.url ?? s.serverUrl;
  return remote(name, s, String(url), s.headers, ["url", "serverUrl", "headers"]);
}

function fromCodex(name: string, s: Server): Server {
  if (s.command) return stdio(name, s, [], (v) => v);
  return remote(name, s, String(s.url), s.http_headers, ["url", "http_headers"]);
}
