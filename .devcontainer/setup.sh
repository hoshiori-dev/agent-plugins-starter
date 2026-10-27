#!/usr/bin/env bash
# Runs once after the dev container is created.
set -euo pipefail

pre-commit install --install-hooks
deno cache --quiet scripts/*.ts scripts/lib/*.ts mcp/*/*.ts

# Claude Code reads project skills from .claude/skills only; the repository
# keeps them under .agents/skills with one symlink per skill.
for skill in .agents/skills/*/; do
  name="$(basename "$skill")"
  [[ "$name" == meta-* ]] && continue
  [[ -L ".claude/skills/$name" ]] || echo "warning: .claude/skills/$name symlink missing; run: just harness-check"
done
echo "setup complete; run 'just check'"
