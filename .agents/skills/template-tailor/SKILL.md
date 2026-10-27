---
name: template-tailor
description: >-
  Template adoption skill. Turns a fresh copy of the agent-plugins-starter
  template into the user's own plugin repository by removing the example
  entries, the clients and catalogs they do not need, and the template's
  identity, then regenerating and checking everything. Use right after a
  repository is created from the template, or when the user asks to prune,
  trim, slim down, or tailor the template. Not for importing existing plugin
  content (template-migrate) or for later changes to the client or catalog
  set (template-adjust).
---

# Template tailoring

Run once, on a fresh repository. The template is deliberately maximal; this
procedure removes what the project will not use and leaves `just check` green.

## Workflow

1. **Inventory.** Read `AGENTS.md`, `.agents/knowledge/client-matrix.md`, and
   the three catalog specs. Run `just check` to confirm the starting point is
   green. List for the user: clients (`codex`, `claude-code`, `antigravity`),
   catalogs (`skill`, `mcp`, `agent`), the `example-*` entries, and the
   GitHub scaffolding (`.github/`).
2. **Ask** in one round, with recommendations: which clients to keep; which
   catalogs to keep; plugin `name`, `description`, `author`, `homepage`,
   `repository`, `license`; whether an existing plugin or repository setup
   should be imported. If yes, run `template-migrate` to completion now,
   while the examples still exist and before step 10 deletes it, then
   continue with step 3.
3. **Remove the examples.** Delete `skills/example-skill/`,
   `mcp/example-server/`, the `example-server` entry in `mcp.json` (delete
   `mcp.json` if empty), every `com.*/agents/example-agent.*`, the
   `.agents/agents/example-agent.md` link, the `[agents.example-agent]` table
   in `.codex/config.toml`, and
   `openspec/specs/{skill/example-skill,mcp/example-server,agent/example-agent}/`.
4. **Remove unused clients.** For each dropped client, `just client-footprint
   <id>` lists its files; delete them all. Dropping Codex also deletes
   `extensions.com.openai` from `plugin.json` and `.codex/`; dropping Claude
   Code deletes `.claude-plugin/`; dropping Antigravity deletes
   the root `mcp_config.json` and the `.agents/agents/*.md` links. Update
   `.agents/knowledge/client-matrix.md`,
   `openspec/specs/agent/spec.md`, `README.md`, and the
   `.devcontainer/devcontainer.json` features for the dropped clients.
5. **Remove unused catalogs.** Delete `openspec/specs/<catalog>/`, the catalog
   entry in `scripts/check_plugin.ts`, and its row in `openspec/config.yaml`
   context; without `mcp` also delete `mcp.json` and `mcp/`; without `agent`
   also delete every `com.*/agents/` and the Codex agent tables.
6. **Rename.** Set the identity fields in `plugin.json` (`name` must satisfy
   `^[a-z0-9][a-z0-9-]*$`), the `[plugins."<name>@<name>"]` key in
   `.codex/config.toml`, the owner in `.github/CODEOWNERS`, and every
   `agent-plugins-starter` or `hoshiori-dev` occurrence in `README.md`,
   `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, and the knowledge base
   (`grep -rn "agent-plugins-starter\|hoshiori-dev" --exclude-dir=.git .`),
   except the upstream template URL in the `template-adjust` skill, which
   must keep pointing at the template. Set `version` to `0.1.0`.
7. **Regenerate and check.** `just gen` (it never deletes: remove orphans it
   reports), then `just check`, then `just clients-validate` for the kept
   clients.
8. **Rewrite the public files.** `README.md`, `CONTRIBUTING.md`, and
   `SECURITY.md` describe the template; make them describe this plugin.
   Update the project map and the client sentence in `AGENTS.md`.
9. **Platform.** Tell the user the remote settings to enable
   (`.agents/knowledge/github/platform-settings.md`) and run
   `just labels --apply` when `gh` is authenticated.
10. **Dispose.** Ask whether to delete `template-migrate` and this skill now
    (they are one-time). On yes: delete `.agents/skills/template-migrate`,
    `.agents/skills/template-tailor`, their `.claude/skills/` symlinks, and
    their rows in `AGENTS.md`; keep `template-adjust`. Run
    `just harness-check` and commit.

## Gotchas

- `just gen --check` reports `gen-orphan` for generated files of a removed
  client; delete them by hand, the generator never deletes.
- Removing a client while keeping agents must remove that client's agent
  files too, or `agent-parity` fails for the remaining clients.
- `.agents/` is shared ground: Codex (`.agents/plugins/marketplace.json`,
  skills), Antigravity (`.agents/agents/*.md` links, skills), and OpenSpec
  (`.agents/skills/openspec-*`). Delete only the dropped client's files.
