# Troubleshooting the plugin per client

Read when step 2 or 3 of the smoke check fails. Each section names the file
the client reads and the command that loads it. In every client, a missing
`deno` binary makes the server fail to start, which the client shows as a
server error or as no tools at all; check `deno --version` before anything
else.

## Claude Code

- Loads `.claude-plugin/plugin.json`, which points at
  `com.anthropic.claude-code/mcp.json` and `com.anthropic.claude-code/agents/`.
- Local test: `claude --plugin-dir <repo>`. Validate: `claude plugin validate --strict <repo>`.
- Agents: shipped (`example-agent`). Missing agent means the manifest's
  `agents` list is stale; run `just gen` in the repository.

## Codex

- Loads the root `plugin.json`, `mcp.json`, and `skills/` through a
  marketplace: `codex plugin marketplace add <repo>` then
  `codex plugin add agent-plugins-starter@agent-plugins-starter`.
- Agents: not shipped by plugins, so report `not shipped` outside this
  repository. Inside the repository the role is declared in
  `.codex/config.toml` (`[agents.example-agent]`) and may be reported `ok`;
  elsewhere copy `com.openai/agents/example-agent.toml` and declare it in
  your own config.

## Antigravity

- Loads the native package `com.google.antigravity/` (`plugin.json`,
  `mcp_config.json`, `agents/`, `skills` link). Install from GitHub with the
  package subdirectory URL:
  `agy plugin install https://github.com/<owner>/<repo>/tree/<branch>/com.google.antigravity`,
  or from a clone: `agy plugin install <clone>/com.google.antigravity`. Inside
  the repository the package is registered by the symlink
  `.agents/plugins/<plugin name>`.
- Installing the bare repository URL yields skills only, because the
  installer reads `mcp_config.json` and `agents/` from the plugin root.
- Agents: shipped (`example-agent`).

## Other Agent Plugins clients

- Skills and MCP come from the specification files at the root. Agents are
  outside the specification and are not shipped.
