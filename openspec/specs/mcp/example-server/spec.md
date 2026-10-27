# example-server

## Purpose
A minimal stdio MCP server bundled with the plugin to prove MCP wiring in each
client. It ships to Codex (via `mcp.json`), Claude Code (via the generated
Claude MCP file), and Antigravity (via the generated package MCP file). It
runs on Deno, which users must have installed. It exists to demonstrate the
MCP layout and is removed by the template tailoring procedure.

## Requirements

### Requirement: Single echo tool
The server SHALL expose exactly one tool, `echo`, taking a required string
`text` and returning one text content block `example-server: <text>`.

#### Scenario: Tool listing
- **WHEN** a client requests `tools/list`
- **THEN** the only tool returned is `echo` with a required `text` string argument

#### Scenario: Echo call
- **WHEN** `echo` is called with `text: "ping"`
- **THEN** the result's single text content is `example-server: ping`

### Requirement: Read-only sandbox
The server SHALL be started with read access limited to the plugin root and
no network, write, or environment permissions.

#### Scenario: Declared permissions
- **WHEN** the server is started as `mcp.json` declares
- **THEN** its Deno permission flags grant read access to `${PLUGIN_ROOT}` only
