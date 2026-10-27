# Platform Settings Register

Read when configuring a repository created from this template, when a check is
"not running" rather than failing, or before changing a remote setting. These
are account-side settings no checkout can recreate; the template ships them as
conventions until the owner enables them.

| Setting | Intended value | Tier | Readback |
|---|---|---|---|
| Ruleset on `main` | require a PR; required checks `checks / gate`, `secrets / scan`, and `checks / pr`; no bypass actors | convention until enabled (public repo: free) | `gh api repos/{owner}/{repo}/rulesets` |
| Merge methods | squash only; delete head branch on merge | convention | `gh repo view --json squashMergeAllowed,deleteBranchOnMerge` |
| Secret scanning + push protection | enabled | convention (free on public repositories) | `gh api repos/{owner}/{repo} --jq .security_and_analysis` |
| Actions default token | read-only; workflows request `contents: write` per job | convention | Settings → Actions → General |
| Template repository | enabled on the template itself, off on repositories created from it | convention | `gh repo view --json isTemplate` |
| Labels | `.github/labels.json` applied | `just labels` reports drift | `gh label list` |

Secrets and variables: none required. The release workflow uses the
workflow's own `GITHUB_TOKEN`.

Update trigger: when a row changes tier (a setting is enabled), record the
date and the readback result in this table.
