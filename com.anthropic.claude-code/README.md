# com.anthropic.claude-code

Claude Code-specific files. Claude Code does not read the Agent Plugins
manifest, so `.claude-plugin/plugin.json` (generated) mirrors the root
`plugin.json` and points here.

- `agents/*.md` — Claude Code subagents (hand-written).
- `mcp.json` — **generated** from the root `mcp.json` by `just gen`
  (`streamable-http` becomes `http`, `${PLUGIN_ROOT}` becomes
  `${CLAUDE_PLUGIN_ROOT}`). Do not edit by hand.
