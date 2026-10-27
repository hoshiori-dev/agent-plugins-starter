# Checks

Read when a check is red or when adding, renaming, or removing a recipe or job.
Every CI job runs a `just` recipe that also runs locally; the recipe is the
source of truth and this table is the map.

| Job name (required-check name) | Workflow and trigger | Recipe | What a healthy run shows |
|---|---|---|---|
| `push / check-fast` | `push`: every push to a branch other than `main` | `just check-fast` | `deno fmt --check`, `deno lint`, `deno check`, the tests, and each check script end clean |
| `checks / lint` | `checks`: pull requests, push to `main` | `just pre-commit` | every hook `Passed`, including `just gen --check` and betterleaks on the whole tree |
| `checks / test` | `checks` | `just test` | Deno tests pass, including the MCP smoke test that starts the server from `mcp.json` |
| `checks / plugin` | `checks` | `just gen --check`, `just validate`, `just harness-check` | each ends with `...: ok` |
| `checks / spec` | `checks` | `just spec-check` | `openspec validate --all --strict` lists every spec and change as passed |
| `checks / gate` | `checks` | none (aggregator) | success when every `checks /` job above succeeded; required by the ruleset |
| `secrets / scan` | `secrets`: every push and every pull request | `just secrets-commits <range>` | betterleaks reports `no leaks found` for the commits the push or pull request added; required by the ruleset |
| `checks / pr` | `pr`: pull request opened, edited, synchronized, reopened, ready for review | `deno run scripts/check_pr.ts` | `check_pr: ok`; required by the ruleset |
| `release / publish` | `release`: tag `v*` | `just check`, `just dist --tag` | a published release with `dist/<name>-<version>.zip` attached |

## Workflows

- `push` is the fast lane: one job, the Deno-only subset, no openspec,
  pre-commit, or betterleaks install. On a branch with an open pull request
  it runs beside `checks`; the overlap is accepted for the quick signal.
- `checks` is the full suite. A pull request runs it on the merge result of
  its latest commit and a newer push cancels the older run, so only the last
  commit of a pull request is ever fully checked. The push to `main` after a
  squash merge runs it once more on the merged commit.
- `secrets` is separate so that a change to it stands out in review and so
  the ruleset requires it on its own. It scans the commits a push adds
  (`before..HEAD`; the whole history when the branch is new or force-pushed)
  or a pull request adds (`base..HEAD`). Push runs are never cancelled: each
  covers only its own commits. The working tree is still scanned by the
  betterleaks pre-commit hook inside `checks / lint` and by `just secrets`
  inside `just check`.
- `pr` reruns on title and body edits without rerunning the suite, which is
  why it is not folded into `checks`.

Not in CI: `just clients-validate` needs the client CLIs (Claude Code, Codex,
Antigravity) and runs in the dev container only.

Toolchain versions for CI live in `.github/actions/setup-tools/action.yml`;
the dev container pins its own in `.devcontainer/devcontainer.json`. When one
changes, check the other.
