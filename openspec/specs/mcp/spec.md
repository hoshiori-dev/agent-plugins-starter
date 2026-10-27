# MCP Catalog

## Purpose
Rules shared by every MCP server declared in `mcp.json`, the portable MCP
component of Agent Plugins v1.0.0. Codex reads `mcp.json` directly; Claude
Code reads the generated `com.anthropic.claude-code/mcp.json`; Antigravity
reads the generated root `mcp_config.json` until its Agent Plugins flag makes
it read `mcp.json`. Each server has its own spec at `openspec/specs/mcp/<name>/spec.md`.

## Requirements

### Requirement: Portable declaration
Every server SHALL be declared once, in `mcp.json`, with a `type` of `stdio`,
`streamable-http`, or `sse`, and SHALL use the placeholders `${PLUGIN_ROOT}`
and `${PLUGIN_DATA}` only in `args`, `env` values, and `cwd`. A remote server
SHALL be declared as, for example,
`{"type": "streamable-http", "url": "https://example.com/mcp"}`.

#### Scenario: Placeholder in a disallowed field
- **WHEN** a server's `command` or `url` contains `${PLUGIN_ROOT}`
- **THEN** `just validate` fails naming the server and the field

### Requirement: Client files are derived, never edited
The Claude Code and Antigravity MCP files SHALL be produced by `just gen` from
`mcp.json`, and a server feature that a client cannot express SHALL make
generation fail with the server name and the fix, rather than be dropped.

#### Scenario: Unsupported feature for a client
- **WHEN** `mcp.json` declares `cwd` on a stdio server, or an `sse` server while Antigravity is enabled
- **THEN** `just gen` exits with an error naming the server, the feature, and the client

#### Scenario: Hand-edited generated file
- **WHEN** a generated MCP file differs from what `mcp.json` produces
- **THEN** `just gen --check` fails and names the file

### Requirement: Bundled servers are self-contained
A stdio server whose code ships in the plugin SHALL reference that code only
through `${PLUGIN_ROOT}`, SHALL start with a bare `command` available on the
user's machine (documented in the README), and SHALL answer `tools/list` when
started with the declared command.

#### Scenario: Smoke test from the declaration
- **WHEN** the test suite starts a bundled server with the exact command and arguments from `mcp.json`, `${PLUGIN_ROOT}` replaced by the repository path
- **THEN** the server answers `tools/list` and each listed tool can be called
