# Specification Workflow

Read before proposing, implementing, or archiving a change to a shipped skill,
MCP server, or agent, and when unsure whether a change needs a spec.

Level: spec-anchored. The specs under `openspec/specs/` are the living
description of what the plugin does; code and client files implement them.
Tool: OpenSpec 1.15.0 (`openspec` CLI, `spec-driven` schema), initialised on
2026-10-27 with `openspec init --tools agents`.

## Artifact map

| Artifact | Path | Owns |
|---|---|---|
| Catalog rules | `openspec/specs/<catalog>/spec.md` for `skill`, `mcp`, `agent` | rules every entry of the catalog follows |
| Entry spec | `openspec/specs/<catalog>/<name>/spec.md` | behaviour of one shipped entry and the clients it ships to |
| Change | `openspec/changes/<id>/` (`proposal.md`, `design.md`, `tasks.md`, `specs/` deltas, `.openspec.yaml`) | one proposed change until archived |
| Archive | `openspec/changes/archive/<date>-<id>/` | the record of a merged change |
| Project rules for artifacts | `openspec/config.yaml` | context and per-artifact rules the OpenSpec skills apply |

Source of truth per fact: behaviour → the entry spec; package metadata →
`plugin.json`; server declaration → `mcp.json`; conventions → this knowledge
base. Nothing restates a spec; `AGENTS.md` and the skills point to it.

## Scope

- A change to any shipped entry carries a delta spec; `just validate` enforces
  that every entry has a spec and every spec an entry.
- A change to the harness, scripts, CI, documentation, or generated files is
  spec-less: `.openspec.yaml` sets `skip_specs: true`, the change ships
  proposal, design, and tasks, and the pull request gets `spec: skipped`.
- Specs describe behaviour the change touches; nothing is back-filled for
  untouched code.

## Lifecycle and gates

1. **Propose**: run the `openspec-propose` skill (or `openspec-explore` first);
   commit the change directory on the issue branch and open a draft pull
   request that carries it (combined shape: one PR holds the change and its
   implementation).
2. **Gate 1, proposal approval**: the maintainer reads proposal, design, and
   delta specs on the PR, discusses in conversation, and adds the label
   `spec: approved`. Tasks are written only after that label.
3. **Implement**: `openspec-apply-change`, one task at a time, `just check`
   green between tasks; `just gen` after any change to `plugin.json`,
   `mcp.json`, or an agents directory.
4. **Gate 2, implementation acceptance**: the agent self-reviews the finished
   change and marks the PR ready (`.agents/knowledge/agent-authority.md`
   sets the bar); the maintainer reviews on the PR per
   `.agents/knowledge/github-workflow.md`.
5. **Freeze**: the implementer archives on the PR branch with
   `openspec-archive-change` after approval and before merge; the archive
   commit is the frozen record. A commit after it reopens the deliberation.
   The `pr` workflow reports the required check `checks / spec-archived` only
   when no unarchived change remains, so the merge is blocked until then
   (`just spec-archived` shows what is still open).

Agents run steps 1, 3, and 4 up to marking ready, and step 5 once the review
approved; gate 1, the review itself, and the merge are human
(`.agents/knowledge/agent-authority.md`).

## Update triggers

- New catalog → add `openspec/specs/<catalog>/spec.md`, extend
  `scripts/check_plugin.ts`'s catalog list, and this map.
- OpenSpec release adopted → regenerate skills with
  `openspec init --tools agents --force` (never `openspec update`), re-run
  `just harness-check`, and update the version above.
