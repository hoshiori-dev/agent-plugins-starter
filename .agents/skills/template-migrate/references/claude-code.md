# Source: Claude Code plugin

Read when the source has `.claude-plugin/plugin.json` or a `.claude/` setup.

## Manifest field map

| Claude field | Destination |
|---|---|
| `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords` | same field in `plugin.json` (name must match `^[a-z0-9][a-z0-9-]*$`) |
| `displayName` | `extensions.com.openai.interface.displayName` if Codex is kept; otherwise drop |
| `skills` (extra skill paths) | move the directories into `skills/` |
| `agents` | source list for the agent files; see SKILL.md step 5 |
| `commands` | each command file becomes `skills/<command>/SKILL.md` |
| `hooks`, `hooks/hooks.json` | `com.anthropic.claude-code/hooks.json`; add `"hooks": "./com.anthropic.claude-code/hooks.json"` to `scripts/gen.ts`'s Claude manifest output if kept |
| `mcpServers`, `.mcp.json` | `import_mcp.ts --from claude-code` |
| `userConfig`, `lspServers`, `outputStyles`, `settings`, `dependencies` | no portable equivalent; report to the user |

## Files

- `skills/<n>/SKILL.md`: copy. Frontmatter fields outside agentskills.io
  (`allowed-tools`, `model`, `paths`, `hooks`) are Claude-only but harmless to
  other clients; keep or move to a client-specific note.
- `agents/<n>.md`: becomes `com.anthropic.claude-code/agents/<n>.md` unchanged
  (minus `hooks`, `mcpServers`, `permissionMode`, which plugin agents ignore),
  plus the Codex and Antigravity versions.
- `.mcp.json`: `type` values `stdio|http|sse|ws`; `ws` has no spec
  equivalent. Placeholders `${CLAUDE_PLUGIN_ROOT}` → `${PLUGIN_ROOT}`,
  `${CLAUDE_PLUGIN_DATA}` → `${PLUGIN_DATA}`, `${user_config.*}` → report.
- `CLAUDE.md` in the plugin: not loaded by Claude Code; move content into a
  skill or drop it.
