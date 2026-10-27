# com.google.antigravity

Antigravity-specific files, namespaced as the Agent Plugins specification
requires. Antigravity reads the plugin itself from the root: `plugin.json`
(it recognises the Agent Plugins `$schema`), `skills/`, and, until its Agent
Plugins flag is on by default, the generated root `mcp_config.json` instead of
`mcp.json`. This directory is also the switch that enables Antigravity support
in the management scripts (`scripts/lib/clients.ts`).

Antigravity loads plugin agents only from the plugin root `agents/`, which the
specification reserves for portable components, so this plugin ships no
agents to Antigravity and this directory holds no `agents/`; `just validate`
rejects one. A plugin that must carry Antigravity agents is a client-specific
plugin in its own repository. See `.agents/knowledge/compatibility-watch.md`, W2.

Nothing in this directory is generated.
