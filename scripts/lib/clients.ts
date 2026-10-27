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
  /** Where this client's hand-written agent files live and their extension. */
  agents: { dir: string; ext: ".md" | ".toml" };
  /** Hand-written wiring files outside the namespace directory. */
  wiringFiles: string[];
  /**
   * Workspace registration link, created as `.agents/plugins/<plugin name>`
   * pointing at the namespace directory (Antigravity discovers plugins there).
   */
  workspaceLink?: { dir: string; target: string };
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
    workspaceLink: { dir: ".agents/plugins", target: "../../com.google.antigravity" },
    generatedFiles: [
      "com.google.antigravity/plugin.json",
      "com.google.antigravity/mcp_config.json",
    ],
    links: [
      { path: "com.google.antigravity/skills", target: "../skills" },
      { path: "com.google.antigravity/mcp", target: "../mcp" },
    ],
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
export function footprint(client: ClientSpec, pluginName: string): string[] {
  const paths = new Set<string>([
    client.namespaceDir,
    ...client.wiringFiles,
    ...client.generatedFiles,
    ...client.links.map((l) => l.path),
  ]);
  if (client.workspaceLink) paths.add(`${client.workspaceLink.dir}/${pluginName}`);
  return [...paths].sort();
}
