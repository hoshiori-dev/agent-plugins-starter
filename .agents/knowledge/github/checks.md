# Checks

Read when a check is red or when adding, renaming, or removing a recipe or job.
Every CI job runs a `just` recipe that also runs locally; the recipe is the
source of truth and this table is the map.

| Job name (required-check name) | Recipe | What a healthy run shows |
|---|---|---|
| `checks / lint` | `just pre-commit` | every hook `Passed`, including `just gen --check` and betterleaks on the staged tree |
| `checks / test` | `just test` | Deno tests pass, including the MCP smoke test that starts the server from `mcp.json` |
| `checks / plugin` | `just gen --check`, `just validate`, `just harness-check` | each ends with `...: ok` |
| `checks / spec` | `just spec-check` | `openspec validate --all --strict` lists every spec and change as passed |
| `checks / secrets` | `just secrets` | betterleaks reports `no leaks found` |
| `checks / gate` | none (aggregator) | success when every job above succeeded; the only job a ruleset must require |
| `checks / pr` (workflow `pr`) | `deno run scripts/check_pr.ts` | `check_pr: ok` |
| `release / publish` (workflow `release`, tag `v*`) | `just check`, `just dist --tag` | a published release with `dist/<name>-<version>.zip` attached |

Not in CI: `just clients-validate` needs the client CLIs (Claude Code, Codex,
Antigravity) and runs in the dev container only.

Toolchain versions for CI live in `.github/actions/setup-tools/action.yml`;
the dev container pins its own in `.devcontainer/devcontainer.json`. When one
changes, check the other.
