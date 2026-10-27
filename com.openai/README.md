# com.openai

Codex-specific files, namespaced as the Agent Plugins specification requires.
Codex reads the plugin itself from the root `plugin.json`, `mcp.json`, and
`skills/`; the `extensions.com.openai` block in `plugin.json` holds its
presentation metadata.

- `agents/*.toml` — Codex agent roles (hand-written). Codex plugins do not
  ship agents; `.codex/config.toml` at the repository root declares them for
  this workspace.

Nothing in this directory is generated.
