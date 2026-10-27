# Agent Authority Policy

Read before marking work ready, requesting review, approving, merging,
releasing, or changing a remote setting, and whenever unsure whether an action
is yours to take.

Level: H0 (agents prepare, humans admit and integrate), set by the template
author on 2026-10-27. A repository created from this template keeps H0 until
its owner edits this file.

## What agents may do

Take issues; propose OpenSpec changes; implement; run `just check` and
`just clients-validate`; create and update draft pull requests; fix review
findings; archive a change on the branch after the maintainer approved it;
prepare release notes.

## What agents may not do without a human

Mark a draft ready; request review; approve; merge; push tags; create or edit
releases; change labels on the gate (`spec: approved`); change remote
settings; move or weaken any gate in this file or in the checks.

## Gates

| Gate | Meaning | Owner |
|---|---|---|
| Proposal approval | the maintainer closes the proposal discussion on the PR and adds `spec: approved` | maintainer |
| Review admission | the draft becomes ready and review is requested | maintainer, on the agent's report that checks are green and the checklist is complete |
| Integration | squash merge into `main` | maintainer |
| Release | tag `vX.Y.Z` pushed | maintainer |

## Escalation: stop and hand to a human when

- the change needs a file outside the issue's scope, or touches a check,
  hook, workflow, or this policy;
- acceptance criteria cannot be judged from the spec and the issue;
- a required check is unavailable or flaky;
- a client behaves differently from `.agents/knowledge/client-matrix.md`;
- there is no rollback path (anything published outside the repository).

No self-escalation: an agent never raises its own level or waives a gate; a
change to this file is itself a gated change.
