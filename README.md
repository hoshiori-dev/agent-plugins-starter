# agent-plugins-starter

A GitHub template for building an [Agent Plugins](https://agent-plugins.org) v1.0.0 plugin that
works as a first-class citizen in **Claude Code**, **OpenAI Codex**, and **Google Antigravity**. The
repository root is the plugin. It ships three example components, one per kind the template
supports:

| Kind       | Example                                                    | Where it lives                                                                                            |
| ---------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Skill      | `example-skill`, a smoke check of the plugin itself        | `skills/example-skill/` (portable, every client)                                                          |
| MCP server | `example-server`, a Deno stdio server with one `echo` tool | `mcp.json` + `mcp/example-server/` (portable; converted for Claude Code and Antigravity)                  |
| Agent      | `example-agent`, a read-only package reviewer              | `com.anthropic.claude-code/agents/` (Claude Code only: the one client whose plugin system carries agents) |

Agents are not part of the specification. A client whose plugin system carries agents gets a
hand-written version under its reverse-domain directory (Claude Code today); a client whose plugin
system does not (Codex, Antigravity) gets none, and the limitation is recorded in
`.agents/knowledge/compatibility-watch.md`. Everything else follows the spec and is either read
natively (Codex, Antigravity) or derived by `just gen` (Claude Code's pointer manifest and MCP file,
Antigravity's transitional `mcp_config.json`).

## Use the template

1. Click **Use this template** on GitHub and clone your new repository.
2. Open it in the dev container (VS Code or Codespaces); it installs deno, uv, just, pre-commit,
   betterleaks, openspec, and the three client CLIs.
3. Ask your coding agent to run the `template-tailor` skill. It removes the examples, the clients
   and catalogs you do not need, renames the plugin, and leaves `just check` green. Have existing
   plugin content? Ask for `template-migrate` first.
4. Enable the repository settings listed in `.agents/knowledge/github/platform-settings.md` and run
   `just labels --apply`.

Everything an agent needs to work in the repository starts at `AGENTS.md`.

## Load the plugin in each client

| Client      | Local development                                                                                    | Distribution                                                                                                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Codex       | `codex plugin marketplace add .` then `codex plugin add agent-plugins-starter@agent-plugins-starter` | the repository is a marketplace (`.agents/plugins/marketplace.json`)                                                                                                                                     |
| Claude Code | `claude --plugin-dir .`                                                                              | `/plugin marketplace add hoshiori-dev/agent-plugins-starter`, then `/plugin install agent-plugins-starter@agent-plugins-starter` (the repository is a marketplace via `.claude-plugin/marketplace.json`) |
| Antigravity | `agy plugin install .` (then `agy plugin uninstall agent-plugins-starter`)                           | `agy plugin install https://github.com/hoshiori-dev/agent-plugins-starter`                                                                                                                               |

The example MCP server needs [Deno](https://deno.com) on the user's machine. Details, verified
dates, and known limitations per client are in `.agents/knowledge/client-matrix.md`.

## Develop

```bash
just gen        # regenerate client files from plugin.json, mcp.json, com.*/agents/
just check      # everything CI runs: lint, tests, plugin and harness checks, specs, secrets
just check-fast # the Deno-only subset that runs on every push
just clients-validate   # validate with the installed client CLIs (dev container only)
```

Changes to shipped behaviour go through [OpenSpec](https://github.com/Fission-AI/OpenSpec) changes
under `openspec/`. Specs are organised in three catalogs, `skill`, `mcp`, and `agent`:
`openspec/specs/<catalog>/spec.md` holds the rules of the catalog and
`openspec/specs/<catalog>/<name>/spec.md` describes each shipped entry. See `CONTRIBUTING.md` for
the pull-request flow.

## Release

Bump `version` in `plugin.json`, merge, tag `v<version>` on `main`, push the tag. The release
workflow verifies the tag against the manifest, builds `dist/<name>-<version>.zip`, and publishes a
GitHub release with generated notes.

## License

Apache-2.0. See `LICENSE`.
