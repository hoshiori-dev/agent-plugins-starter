# example-skill

## Purpose

A smoke-check skill that proves the plugin reached the current client. It ships to every client
(Claude Code, Codex, Antigravity, and other Agent Plugins clients) because skills are portable. It
exists to demonstrate the skill layout and is removed by the template tailoring procedure.

## Requirements

### Requirement: Component report

When invoked, the skill SHALL make the agent report the state of the three plugin components in the
current client: skills, MCP, and agents, one line per component.

#### Scenario: Everything is loaded

- **WHEN** the client exposes the `echo` tool of `example-server` and an `example-agent` subagent
- **THEN** the report reads `skills: ok`, `mcp: ok`, `agents: ok`

#### Scenario: MCP tool is missing

- **WHEN** the `echo` tool is not available
- **THEN** the report marks `mcp` as missing and names the client-specific fix from the skill's
  troubleshooting reference

#### Scenario: Client does not ship agents

- **WHEN** the client is Codex or another client whose plugins carry no agents
- **THEN** the report marks `agents` as `not shipped`, not as missing

### Requirement: Echo round trip

The skill SHALL verify MCP by calling `echo` with the text `ping` and expecting
`example-server: ping`.

#### Scenario: Echo answers

- **WHEN** `echo` is called with `text: "ping"`
- **THEN** the skill treats the exact reply `example-server: ping` as success and any other reply as
  a failure to report
