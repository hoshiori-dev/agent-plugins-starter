# com.openai

Codex-specific files, namespaced as the Agent Plugins specification requires.
Codex reads the plugin itself from the root `plugin.json`, `mcp.json`, and
`skills/`; the `extensions.com.openai` block in `plugin.json` holds its
presentation metadata. This directory is also the switch that enables Codex
support in the management scripts (`scripts/lib/clients.ts`).

Codex plugins carry no agents, so this plugin ships none to Codex and this
directory holds no `agents/`; `just validate` rejects one. Custom Codex
agents are workspace configuration (`[agents.<name>]` in a `.codex/config.toml`),
not plugin content. See `.agents/knowledge/compatibility-watch.md`, W9.

Nothing in this directory is generated.
