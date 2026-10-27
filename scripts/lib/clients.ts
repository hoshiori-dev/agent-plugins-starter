// The client registry: the one place that knows which coding-agent clients
// this plugin supports, where each keeps its files, and what `gen.ts`
// produces for it. A client is enabled when its namespace directory exists;
// deleting that directory (and the files `footprint` lists) removes the
// client from the template.
import { join } from "@std/path";
import { isDirectory } from "./findings.ts";

export type ClientId = "codex" | "claude-code" | "antigravity";

export interface ClientSpec {
  id: ClientId;
  /** Reverse-domain namespace directory at the plugin root (Agent Plugins §8). */
  namespaceDir: string;
  /**
   * Where this client's hand-written agent files live and their extension.
   * Absent when the client's plugin system carries no agents: the plugin then
   * ships none to it and `check_plugin.ts` rejects an agents directory under
   * its namespace (compatibility watch W2, W9).
   */
  agents?: { dir: string; ext: ".md" | ".toml" };
  /** Hand-written wiring files outside the namespace directory. */
  wiringFiles: string[];
  /** Files `gen.ts` writes for this client. */
  generatedFiles: string[];
  /** Symlinks inside the namespace directory, as `link -> target`. */
  links: { path: string; target: string }[];
}

export const CLIENTS: readonly ClientSpec[] = [
  {
    id: "codex",
    namespaceDir: "com.openai",
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
    wiringFiles: [],
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
export function footprint(client: ClientSpec, _root: string): string[] {
  const paths = new Set<string>([
    client.namespaceDir,
    ...client.wiringFiles,
    ...client.generatedFiles,
    ...client.links.map((l) => l.path),
  ]);
  return [...paths].sort();
}
