# Agent Catalog

## Purpose
Rules shared by every agent this plugin ships. Agents are outside the Agent
Plugins v1.0.0 specification, so each agent exists as one hand-written file per
enabled client under that client's namespace directory: Claude Code
(`com.anthropic.claude-code/agents/<name>.md`, listed in the generated
`.claude-plugin/plugin.json`), Codex (`com.openai/agents/<name>.toml`, declared
in `.codex/config.toml`; Codex plugins do not ship agents, so this version is
workspace-only), and Antigravity (`com.google.antigravity/agents/<name>.md`
inside the package). Each agent has its own spec at
`openspec/specs/agent/<name>/spec.md`.

## Requirements

### Requirement: One version per enabled client
Every agent SHALL have a file for each enabled client, named `<name>` plus the
client's extension, whose `name` field equals `<name>` and whose
`description` text is identical across clients.

#### Scenario: Agent missing for one client
- **WHEN** `<name>` exists for some enabled clients but not all
- **THEN** `just validate` fails naming the missing file

#### Scenario: Descriptions diverge
- **WHEN** two client versions of `<name>` carry different descriptions
- **THEN** `just validate` fails naming the agent

### Requirement: Client fields stay in the client file
Client-specific fields (tool names, model identifiers, permission modes) SHALL
appear only in that client's file; the instructions body SHALL describe the
same behaviour in every version so the agent acts the same wherever it runs.

#### Scenario: Same task in two clients
- **WHEN** the same request is delegated to `<name>` in two clients
- **THEN** both versions follow the same steps and produce the same report format

### Requirement: Read-only by default
An agent SHALL request only read tools unless its spec states why it must
write.

#### Scenario: Agent spec without a write justification
- **WHEN** an agent's spec names no write operation
- **THEN** every client version lists read-only tools
