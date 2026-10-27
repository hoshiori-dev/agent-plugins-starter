---
name: template-migrate
description: >-
  Template adoption skill. Imports existing agent setup into this Agent
  Plugins layout: a Claude Code plugin (.claude-plugin), a Codex plugin or
  config.toml, an Antigravity native plugin, or a repository's loose skills,
  MCP configs, agents, and rule files. Use when the user has an existing
  plugin or agent configuration to bring into a repository created from this
  template, or asks to migrate, import, or convert one. Not for pruning the
  template (template-tailor) or for authoring new entries
  (plugin-development).
---

# Template migration

Bring existing content into the portable layout without losing anything
silently: every field that has no home here is listed for the user to decide.

## Workflow

1. **Inventory the source.** Identify its kind and read the matching
   reference: Claude Code plugin →
   [references/claude-code.md](references/claude-code.md); Codex plugin or
   `config.toml` → [references/codex.md](references/codex.md); Antigravity
   native plugin → [references/antigravity.md](references/antigravity.md);
   loose files in a repository →
   [references/loose-repo.md](references/loose-repo.md). List every skill,
   MCP server, agent, rule, hook, and command found.
2. **Manifest.** Merge identity fields into `plugin.json` per the reference's
   field map; keep only spec fields at the top level and put client-only
   presentation data under `extensions.<namespace>`.
3. **MCP.** Convert with the bundled script, which maps types and
   placeholders and lists unmapped fields on stderr:
   `deno run --allow-read --allow-write .agents/skills/template-migrate/scripts/import_mcp.ts --from <claude-code|codex|antigravity> <file> --write`
   (omit `--write` to preview). Bundled server code moves under `mcp/<name>/`
   and its paths become `${PLUGIN_ROOT}/mcp/<name>/...`.
4. **Skills.** Copy each skill directory into `skills/<name>/` unchanged;
   confirm `name` equals the directory and the description is 1-1024
   characters. Claude `commands/*.md` become skills with the same body and a
   description derived from the command's; Antigravity workflows likewise.
5. **Agents.** For each source agent, write the three client versions
   (`.agents/skills/plugin-development/SKILL.md` step 2 lists the files and
   fields); keep the instructions body, translate tool names per client,
   and use the same description everywhere. Add the Codex `[agents.<name>]`
   table to `.codex/config.toml`.
6. **Rules and hooks.** Rules (`rules/`, `CLAUDE.md`, `GEMINI.md`,
   `.cursor/rules`) are not plugin components: fold always-on rules into
   `AGENTS.md` and conditional ones into `.agents/knowledge/` with a
   when-to-read row. Hooks are client-specific; keep them under the client's
   namespace directory and point to them from that client's manifest only if
   the user still needs them.
7. **Specs.** For every imported entry create
   `openspec/specs/<catalog>/<name>/spec.md` through one OpenSpec change
   (`openspec-propose`) describing the behaviour as imported.
8. **Generate and check.** `just gen && just check`, then
   `just clients-validate`. Report what was imported, what was dropped and
   why, and the unmapped fields the user must decide on.

## Gotchas

- Claude's `.mcp.json` type `http` is the spec's `streamable-http`; a bare
  server object without `type` is `stdio`.
- Antigravity `mcp_config.json` has no placeholders; a relative path there
  becomes `${PLUGIN_ROOT}/<path>` here.
- Codex `config.toml` MCP tables carry policy fields (`enabled_tools`,
  approval modes) that the spec cannot express; they are reported, not
  converted.
- A Claude Code `CLAUDE.md` inside a plugin is never loaded as context; its
  content belongs in a skill.
