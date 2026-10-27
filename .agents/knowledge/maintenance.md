# Harness Maintenance

Read at the reclamation anchor, when `AGENTS.md` passes 120 lines, or when an
agent reports a mismatch between the harness and the repository.

## Realtime rule

Before editing any harness file (`AGENTS.md`, this knowledge base, a project
skill), inspect the artifacts its `Keep In Sync` row names and fix or report
every mismatch found, not only the one that prompted the edit. `just
harness-check` catches broken links, unknown recipes, unreachable knowledge,
budget overruns, and symlink drift; it cannot catch a stale sentence.

## Periodic reclamation

Anchor: every tenth merged pull request, or quarterly, whichever comes first.
Walk every harness component and hunt:

- stale paths and dead commands: run them, do not trust them;
- rules the code or a client now contradicts (re-run `just clients-validate`
  and update the verification log in `client-matrix.md`);
- the same fact stated twice;
- content unreachable from `AGENTS.md`;
- triggers whose subject moved or vanished;
- thickness no longer earned: a check that never fires, a skill nobody loads,
  a knowledge file no task reads.

Dispose of every finding in the same run: update, reconnect, merge, thin, or
delete. Record the run below.

### Standing items

- Antigravity: when `enable-agent-plugins-spec` is on by default, re-evaluate
  whether `com.google.antigravity/` still needs its own `plugin.json`,
  `mcp_config.json`, and links, or shrinks to an overlay.
- Claude Code: if `.agents/skills` becomes a supported project-skill location,
  drop the `.claude/skills` symlinks and the `claude-skill-link` check.
- Codex: if plugins gain an agents component, move `com.openai/agents/` into it
  and drop the `.codex/config.toml` declarations.

### Runs

| Date | Merged PRs since last run | Findings and dispositions |
|---|---|---|
| 2026-10-27 | initial build | none; baseline |
