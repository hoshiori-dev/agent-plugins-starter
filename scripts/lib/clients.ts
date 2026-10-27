// The client registry: the one place that knows which coding-agent clients
// this plugin supports, where each keeps its files, and what `gen.ts`
// produces for it. A client is enabled when its namespace directory exists;
// deleting that directory (and the files `footprint` lists) removes the
// client from the template.
import { join } from "@std/path";
import { isDirectory, listDir } from "./findings.ts";

export type ClientId = "codex" | "claude-code" | "antigravity";

export interface ClientSpec {
  id: ClientId;
  /** Reverse-domain namespace directory at the plugin root (Agent Plugins §8). */
  namespaceDir: string;
  /** Where this client's hand-written agent files live and their extension. */
  agents: { dir: string; ext: ".md" | ".toml" };
  /** Hand-written wiring files outside the namespace directory. */
  wiringFiles: string[];
  /**
   * Workspace agent links: the client reads agents from `dir`, so each file in
   * `agents.dir` gets a symlink `<dir>/<file>` pointing back at it.
   */
  agentLinks?: { dir: string; targetPrefix: string };
  /** Files `gen.ts` writes for this client. */
  generatedFiles: string[];
  /** Symlinks inside the namespace directory, as `link -> target`. */
  links: { path: string; target: string }[];
}

export const CLIENTS: readonly ClientSpec[] = [
  {
    id: "codex",
    namespaceDir: "com.openai",
    agents: { dir: "com.openai/agents", ext: ".toml" },
    wiringFiles: [".codex/config.toml"],
    generatedFiles: [".agents/plugins/marketplace.json"],
    links: [],
  },
  {
    id: "claude-code",
    namespaceDir: "com.anthropic.claude-code",
    agents: { dir: "com.anthropic.claude-code/agents", ext: ".md" },
    wiringFiles: [],
    generatedFiles: [
      ".claude-plugin/plugin.json",
      ".claude-plugin/marketplace.json",
      "com.anthropic.claude-code/mcp.json",
    ],
    links: [],
  },
  {
    id: "antigravity",
    namespaceDir: "com.google.antigravity",
    agents: { dir: "com.google.antigravity/agents", ext: ".md" },
    wiringFiles: [],
    agentLinks: { dir: ".agents/agents", targetPrefix: "../../com.google.antigravity/agents" },
    // Transitional: Antigravity reads mcp.json only behind its Agent Plugins
    // flag; until then it reads mcp_config.json at the plugin root (watch W1).
    generatedFiles: ["mcp_config.json"],
    links: [],
  },
];

export function clientById(id: string): ClientSpec {
  const client = CLIENTS.find((c) => c.id === id);
  if (!client) {
    throw new Error(`unknown client "${id}"; known: ${CLIENTS.map((c) => c.id).join(", ")}`);
  }
  return client;
}

export function isEnabled(root: string, client: ClientSpec): boolean {
  return isDirectory(join(root, client.namespaceDir));
}

export function enabledClients(root: string): ClientSpec[] {
  return CLIENTS.filter((c) => isEnabled(root, c));
}

/** Every path that belongs to a client: what removing the client deletes. */
export function footprint(client: ClientSpec, root: string): string[] {
  const paths = new Set<string>([
    client.namespaceDir,
    ...client.wiringFiles,
    ...client.generatedFiles,
    ...client.links.map((l) => l.path),
  ]);
  if (client.agentLinks) {
    for (const name of agentFileNames(root, client)) paths.add(`${client.agentLinks.dir}/${name}`);
  }
  return [...paths].sort();
}

/** File names in the client's agents directory, sorted; empty when absent. */
export function agentFileNames(root: string, client: ClientSpec): string[] {
  const dir = join(root, client.agents.dir);
  if (!isDirectory(dir)) return [];
  return listDir(dir).filter((e) => e.isFile && e.name.endsWith(client.agents.ext)).map((e) =>
    e.name
  );
}
