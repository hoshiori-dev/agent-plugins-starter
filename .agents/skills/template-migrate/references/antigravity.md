# Source: Antigravity native plugin

Read when the source has a `plugin.json` with
`$schema: https://antigravity.google/schemas/v1/plugin.json`,
`.antigravity-plugin/`, `.gemini-plugin/`, or a `.agents/` customization root
with `mcp_config.json`, `agents/`, `rules/`, `workflows/`, `hooks.json`.

## Manifest field map

| Antigravity field | Destination |
|---|---|
| `name` (`^[a-zA-Z0-9-_]+$`) | `plugin.json#name`, lower-cased with `_` → `-` if needed |
| `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords` | same field in `plugin.json` |
| `displayName`, `logo`, `suggestedPrompts`, `disabled` | no portable field; `displayName` may go to `extensions.com.openai.interface.displayName`; report the rest |
| `skills` (path list) | move the directories into `skills/` |

## Files

- `skills/<n>/SKILL.md`: copy; Antigravity's `name` is optional, so add it
  when missing (equal to the directory).
- `mcp_config.json`: `import_mcp.ts --from antigravity`. `command/args/env` →
  stdio with relative paths rewritten to `${PLUGIN_ROOT}/...`; `url` or
  `serverUrl` (+ `headers`) → streamable-http; `disabled`, `disabledTools` →
  reported.
- `agents/<n>.md`: becomes `com.google.antigravity/agents/<n>.md` unchanged;
  write the Claude Code and Codex versions from its body. Tool names are
  Antigravity's (`view_file`, `grep_search`, ...); translate for Claude Code
  (`Read`, `Grep`, ...) and drop for Codex.
- `rules/*.md`, `GEMINI.md`: fold into `AGENTS.md` or `.agents/knowledge/`;
  frontmatter triggers (`always_on`, `glob`) tell you which.
- `workflows/*.md`: deprecated in Antigravity; each becomes a skill.
- `hooks.json`: Antigravity-only; keep in `com.google.antigravity/hooks.json`
  only if still needed (the installer reads it from the package root).
