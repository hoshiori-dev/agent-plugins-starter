# com.google.antigravity

A complete Antigravity native plugin package. Antigravity's Agent Plugins
support is behind a feature flag that is off by default, and its installer
reads `agents/` and `mcp_config.json` from the plugin root, so this directory
is its root: install it with `agy plugin install <repo>/com.google.antigravity`.
Inside this repository, the symlink `.agents/plugins/agent-plugins-starter` registers it for the workspace.

- `plugin.json` — **generated** native manifest mirroring the root `plugin.json`.
- `mcp_config.json` — **generated** from the root `mcp.json`
  (`type` and `$schema` dropped, `${PLUGIN_ROOT}/x` becomes the relative `x`).
- `agents/*.md` — Antigravity subagents (hand-written).
- `skills` and `mcp` — symlinks to the root directories; `agy plugin install`
  copies their targets, so the installed package is self-contained.

Regenerate with `just gen`; never edit the generated files by hand.
