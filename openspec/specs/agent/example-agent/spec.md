# example-agent

## Purpose
A read-only reviewer that audits an Agent Plugins package against the v1.0.0
specification. It ships to Claude Code through the plugin; for Codex and
Antigravity it is available only inside this workspace (`.codex/config.toml`
and the `.agents/agents/` symlink), because neither client loads agents from a
plugin's namespace directory. It exists to demonstrate the per-client agent
layout and is removed by the template tailoring procedure.

## Requirements

### Requirement: Layout audit
Given a package directory, the agent SHALL check the manifest fields and
name, every skill's frontmatter, the MCP declaration's types and placeholder
placement, and the location of client-specific files, reading files only.

#### Scenario: Conforming package
- **WHEN** the package follows the specification
- **THEN** the agent reports no findings and ends with `PASS`

#### Scenario: Root-level client files
- **WHEN** the package has an `agents/` or `hooks/` directory at its root
- **THEN** the agent reports it as a finding with the fix of moving it under a reverse-domain directory

### Requirement: Finding format
Each finding SHALL be reported as `<file>: <problem>. Fix: <action>`, and the
report SHALL end with `FAIL (<count>)` when findings exist.

#### Scenario: Two violations
- **WHEN** the package has an invalid `name` and a skill whose frontmatter name differs from its directory
- **THEN** the report lists two findings in that format and ends with `FAIL (2)`

### Requirement: No modifications
The agent SHALL NOT create, edit, or delete files.

#### Scenario: Fix requested
- **WHEN** the caller asks the agent to fix what it found
- **THEN** the agent reports the fixes as findings and leaves the files unchanged
