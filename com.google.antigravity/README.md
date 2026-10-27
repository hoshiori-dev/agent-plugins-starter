# com.google.antigravity

Antigravity-specific files, namespaced as the Agent Plugins specification
requires. Antigravity reads the plugin itself from the root: `plugin.json`
(it recognises the Agent Plugins `$schema`), `skills/`, and, until its Agent
Plugins flag is on by default, the generated root `mcp_config.json` instead of
`mcp.json`.

- `agents/*.md` — Antigravity subagents (hand-written). Antigravity plugins
  carry agents only from the plugin root, which the specification reserves
  for portable components, so these are not shipped with the plugin. Inside
  this repository the symlinks under `.agents/agents/` register them for the
  workspace; another project can copy them into its own `.agents/agents/`.

Nothing in this directory is generated.
