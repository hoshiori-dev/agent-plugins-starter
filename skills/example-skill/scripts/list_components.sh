#!/usr/bin/env bash
# Prints the components this plugin declares, from the package files alone.
# Usage: scripts/list_components.sh [plugin-root]   (default: the skill's plugin root)
set -euo pipefail
root="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)}"
echo "plugin: $(sed -n 's/^  "name": "\(.*\)",$/\1/p' "$root/plugin.json")"
echo "skills:"; for d in "$root"/skills/*/; do [ -f "$d/SKILL.md" ] && echo "  - $(basename "$d")"; done
echo "mcp servers:"; sed -n 's/^    "\([^"]*\)": {$/  - \1/p' "$root/mcp.json"
echo "agents per client:"
for ns in "$root"/com.* ; do
  [ -d "$ns/agents" ] || continue
  echo "  $(basename "$ns"): $(ls "$ns/agents" | sed 's/\.[a-z]*$//' | tr '\n' ' ')"
done
