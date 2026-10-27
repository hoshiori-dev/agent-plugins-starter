# Compatibility Watch

Read at every reclamation run, after any client or OpenSpec upgrade, when a
client starts behaving differently from `client-matrix.md`, and before
removing a workaround. This file is the one list of known limitations, the
workarounds built for them, and the condition under which each workaround
goes away. `client-matrix.md` describes how things work today and points
here for why.

## Versions these facts were verified against

| Component | Version | Verified | Re-check with |
|---|---|---|---|
| Agent Plugins specification | 1.0.0 (1.1.0 is a draft) | 2026-10-27 | `scripts/lib/plugin.ts` `SPEC_VERSION`; `just schemas-update` then `git diff scripts/schemas/` |
| agentskills.io SKILL.md format | current page | 2026-10-27 | `SKILL_NAME_RE` and the 1024-character limit in `scripts/lib/plugin.ts` |
| Claude Code | 2.1.311 | 2026-10-27 | `claude --version` |
| Codex CLI | 0.164.0 | 2026-10-27 | `codex --version` |
| Antigravity CLI (`agy`) | 1.4.7 (build 2026-10-24) | 2026-10-27 | `agy changelog` (first line) |
| OpenSpec | 1.15.0 | 2026-10-27 | `openspec --version` |

`just versions` prints the installed versions for the log.

## Watch list

Each row is a workaround the harness carries today. When the resolving
condition is true, apply the disposition in one change, update the matrix,
and delete the row.

| ID | Limitation | Workaround in this repository | Re-check how | Resolved when | Then |
|---|---|---|---|---|---|
| W1 | Antigravity reads `mcp.json` only behind the `enable-agent-plugins-spec` flag (off by default) | generated `com.google.antigravity/mcp_config.json` | `agy plugin validate .` no longer notes the flag, or the Antigravity changelog says the flag is default | the flag is on by default in the release every team member runs | drop `mcp_config.json` generation for Antigravity in `scripts/gen.ts` (keep it as an overlay only if a server needs fields `mcp.json` cannot express), update `client-matrix.md`, re-run `agy --print` smoke check |
| W2 | Antigravity reads `agents/` only at the plugin root, never under `com.google.antigravity/` as a namespace of the root plugin | `com.google.antigravity/` is a complete native package with its own `plugin.json`, `skills`/`mcp` links | `agy plugin validate .` counts `agents` from the namespace directory; Antigravity docs on plugins | the root plugin loads `com.google.antigravity/agents/*.md` | delete the package manifest and links, keep `agents/`, point the workspace link at the root instead, update `scripts/lib/clients.ts` and `client-matrix.md` |
| W3 | Antigravity `mcp_config.json` has no plugin-root placeholder | generator rewrites `${PLUGIN_ROOT}/x` to the package-relative `x`; `com.google.antigravity/mcp -> ../mcp` link | Antigravity MCP docs for a `${...}` variable | a placeholder exists | map `${PLUGIN_ROOT}` to it in `antigravityServer()` and drop the `mcp` link |
| W4 | Antigravity `.agents/plugins.json` registration did not take effect in the CLI session | symlink `.agents/plugins/<name> -> ../../com.google.antigravity` | create the JSON registration in a scratch copy and run the `agy --print` smoke check | the registration loads the package | either mechanism is fine; keep the symlink unless a platform without symlinks matters |
| W5 | `agy plugin install` of the bare repository URL reads the repository root, so it yields skills only | README and the skill point users at the subdirectory URL `https://github.com/hoshiori-dev/agent-plugins-starter/tree/main/com.google.antigravity` | `agy plugin install https://github.com/hoshiori-dev/agent-plugins-starter` in a scratch home, then `agy plugin list --json` | the root install lists agents and MCP servers (follows from W1 and W2) | drop the subdirectory URL from README, `client-matrix.md`, and `skills/example-skill/references/troubleshooting.md` |
| W6 | Claude Code reads project skills from `.claude/skills/` only | one symlink per project skill, enforced by the `claude-skill-link` rule in `scripts/check_harness.ts` | Claude Code skills docs for `.agents/skills` | `.agents/skills/` is a documented project location | delete the symlinks and the rule, update `AGENTS.md`'s project map and `.devcontainer/setup.sh` |
| W7 | Claude Code has no Agent Plugins support and its MCP format differs | generated `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `com.anthropic.claude-code/mcp.json` | Claude Code plugin docs mention `agent-plugins.org`, or `claude plugin validate` accepts a root `plugin.json` | Claude Code loads the root manifest and `mcp.json` | stop generating the pointer manifest and MCP file; keep `agents/` under the namespace |
| W8 | `claude plugin validate --strict` fails on this repository because the root `CLAUDE.md` is flagged (it is the development entrypoint, not plugin context) | `just clients-validate` runs the Claude validator non-strict | run it with `--strict` | the validator exempts a repository that is both plugin and workspace, or Claude Code reads `AGENTS.md` natively (then delete `CLAUDE.md`) | switch the recipe back to `--strict` |
| W9 | Codex plugins have no agents component | `com.openai/agents/*.toml` plus `[agents.<n>]` tables in `.codex/config.toml`; shipped to nobody outside this workspace | Codex plugin docs for an `agents` component | plugins can bundle agent roles | move the files to the component location, drop the `config.toml` tables and the `codex-agent-wiring` rule, update `openspec/specs/agent/spec.md` |
| W10 | `com.anthropic.claude-code` is a self-chosen namespace | directory name and `scripts/lib/clients.ts` entry | Claude Code docs or the Agent Plugins compatible-clients list name an official namespace | an official value exists | rename the directory and the registry entry, regenerate |
| W11 | Agent Plugins 1.1.0 is a draft; agents, hooks, and commands are outside the spec | per-client agent files under namespace directories; vendored 1.0.0 schemas | spec repository releases; `just schemas-update` | a release adds a component this plugin ships, or publishes 1.1.0 | bump `SPEC_VERSION` and the `$schema` values, run `just schemas-update`, move the component to its portable location, archive an OpenSpec change describing the new layout |
| W12 | OpenSpec writes Antigravity workflows (deprecated by Antigravity on 2026-10-19) and rewrites skills for every detected tool on `update` | `openspec init --tools agents --force` only; `openspec-target` rule in `scripts/check_harness.ts` | release notes of OpenSpec | `openspec update` respects a single configured tool and emits no workflows | allow `openspec update` in `spec-workflow.md` and `template-adjust` |
| W13 | `betterleaks git --pre-commit --staged` fails in this dev container (git reports no repository to the subprocess) | the pre-commit hook scans staged files with `betterleaks dir` | run the git mode from the container | the git mode works | optional: switch the hook back; the file scan is also correct |

## Adding a row

Add a row whenever a check, generator branch, or document exists only because
a client or specification cannot do something yet. Name the file that carries
the workaround so the disposition can be executed without rediscovery.
