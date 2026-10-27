# Task runner for the agent-plugins-starter repository. Every documented
# command is a recipe here; CI jobs run the same recipes.

set shell := ["bash", "-euo", "pipefail", "-c"]
set positional-arguments

export OPENSPEC_NO_UPDATE_CHECK := "1"
export OPENSPEC_TELEMETRY := "0"
export PAGER := "cat"
export GIT_PAGER := "cat"

# List recipes.
default:
    @just --list

# Generate client-specific files from plugin.json, mcp.json, and the agents directories (`--check`: report drift only).
gen *flags:
    deno run --allow-read --allow-write --allow-run=git scripts/gen.ts "$@"

# Format scripts and the MCP server.
fmt:
    deno fmt

# Formatting, lint, and type checks for all Deno code.
lint:
    deno fmt --check
    deno lint
    deno check scripts/*.ts scripts/lib/*.ts mcp/*/*.ts

# Unit tests and the MCP smoke test.
test:
    deno test --allow-read --allow-write --allow-run --allow-env --allow-net

# Plugin package and client wiring consistency.
validate:
    deno run --allow-read --allow-run=git scripts/check_plugin.ts

# Harness integrity: links, recipes, budgets, skill frontmatter, symlinks.
harness-check:
    deno run --allow-read --allow-run=git,just scripts/check_harness.ts

# OpenSpec specs and changes, strict mode.
spec-check:
    openspec validate --all --strict --no-interactive

# Secret scan of the working tree.
secrets:
    betterleaks dir . --no-banner --redact

# Every pre-commit hook on every file.
pre-commit:
    pre-commit run --all-files

# Everything CI runs.
check: (gen "--check") lint validate harness-check spec-check test secrets

# Validate the package with the installed client CLIs (local only; CI has no clients). Claude runs non-strict: this repository's root CLAUDE.md draws a warning.
clients-validate:
    claude plugin validate .
    ~/.gemini/bin/agy plugin validate .
    ~/.gemini/bin/agy plugin install . >/dev/null
    ~/.gemini/bin/agy plugin list --json | grep -F '"example-server"'
    ~/.gemini/bin/agy plugin uninstall agent-plugins-starter >/dev/null
    codex plugin marketplace add . >/dev/null
    codex plugin list | grep -F "agent-plugins-starter@agent-plugins-starter"
    codex plugin marketplace remove agent-plugins-starter >/dev/null

# Print the versions of the clients and tools the compatibility watch is verified against.
versions:
    deno --version | head -1
    openspec --version
    claude --version
    codex --version
    ~/.gemini/bin/agy changelog 2>/dev/null | awk 'NR == 1 { print "agy " $0 }'
    betterleaks version

# Files that belong to one client (codex | claude-code | antigravity).
client-footprint id:
    deno run --allow-read --allow-run=git scripts/check_plugin.ts --footprint "$1"

# Build the release archive into dist/ (`--tag vX.Y.Z` checks it against plugin.json).
dist *flags:
    deno run --allow-read --allow-write --allow-run=git scripts/dist.ts "$@"

# Compare .github/labels.json with the repository's labels (`--apply` writes).
labels *flags:
    deno run --allow-read --allow-run=gh scripts/sync_labels.ts "$@"

# Refresh the vendored Agent Plugins schemas.
schemas-update:
    for f in plugin mcp; do curl -sfL "https://agent-plugins.org/schemas/1.0.0/$f.schema.json" -o "scripts/schemas/agent-plugins/1.0.0/$f.schema.json"; done

# Remove build output.
clean:
    rm -rf dist
