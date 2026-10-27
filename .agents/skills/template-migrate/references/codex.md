# Source: Codex plugin or configuration

Read when the source has `.codex-plugin/plugin.json`, a root `plugin.json`
with `extensions.com.openai`, or a `config.toml` with `[mcp_servers.*]` or
`[agents.*]`.

## Manifest field map

| Codex field | Destination |
|---|---|
| root `plugin.json` (already Agent Plugins) | copy as is; verify `$schema` is 1.0.0 |
| `.codex-plugin/plugin.json` `name`, `version`, `description` | `plugin.json` |
| `.codex-plugin/plugin.json` `skills: "./skills/"` | default location, drop the field |
| `interface`, `apps`, `onboardingSkill`, `hooks` | `plugin.json#extensions.com.openai` |
| `.app.json` | keep at the root only if the plugin targets ChatGPT apps; otherwise drop |
| `.mcp.json` (scaffold) | `import_mcp.ts --from claude-code` (same shape), then add `type` |

## Files

- `skills/<n>/SKILL.md`: copy; an `agents/openai.yaml` beside it is Codex UI
  metadata and may stay.
- `config.toml` `[mcp_servers.<n>]`: `import_mcp.ts --from codex`. Fields
  `command/args/env/cwd` → stdio; `url`, `http_headers` → streamable-http
  with headers; `bearer_token_env_var`, `env_http_headers`, `enabled`,
  `required`, `*_timeout_sec`, `enabled_tools`, `disabled_tools`, approval
  modes → reported as unmapped (policy, not declaration).
- `.codex/agents/<n>.toml` or `[agents.<n>] config_file`: not plugin content
  in Codex. When Claude Code is a supported client, write
  `com.anthropic.claude-code/agents/<n>.md` from `developer_instructions`;
  otherwise leave the role in the user's own `.codex/config.toml` and report
  it as unmapped.
- `AGENTS.md`: Codex reads it directly; merge rules into this repository's
  `AGENTS.md` under the budget, moving detail to `.agents/knowledge/`.
