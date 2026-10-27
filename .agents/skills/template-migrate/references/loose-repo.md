# Source: a repository's loose agent setup

Read when the source is not a plugin but a working repository with scattered
agent files: `.agents/skills/`, `.claude/skills/`, `.claude/agents/`,
`.codex/agents/`, `.agents/agents/`, `.mcp.json`, `.agents/mcp_config.json`,
`.codex/config.toml`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules`.

## Decide what is product and what is harness

- **Product** (ships in the plugin): skills written for users of the plugin,
  MCP servers the plugin provides, agents meant to run inside other projects.
  These move into `skills/`, `mcp.json` + `mcp/`, and `com.*/agents/`.
- **Harness** (stays in the repository): skills that help develop this
  repository, rules about this codebase, MCP servers used only while
  developing. These go to `.agents/skills/` (with `.claude/skills/<n>`
  symlinks), `AGENTS.md`, `.agents/knowledge/`, and the developer's own client
  configuration, not the plugin.

Ask the user per item when the audience is unclear; a skill that mentions
"this repository" is harness.

## Mechanics

- Skills: directory copy; deduplicate when `.claude/skills` and
  `.agents/skills` hold copies (keep one, link the other).
- MCP: `import_mcp.ts` with the source's client as `--from`.
- Agents: per `SKILL.md` step 5; project-only agents stay out of the plugin
  and may live in the client's native project location instead.
- Rules: `AGENTS.md` stays within 120 lines; everything conditional becomes a
  knowledge file with a when-to-read row.
