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

- Loads the root `plugin.json`, `skills/`, and `mcp_config.json` (the
  generated stand-in for `mcp.json` until Antigravity's Agent Plugins flag is
  on). Install: `agy plugin install https://github.com/<owner>/<repo>` or
  `agy plugin install <clone>`; remove with `agy plugin uninstall <name>`.
- Agents: not shipped. Antigravity reads plugin agents only from the plugin
  root, which this plugin keeps for portable files. Inside the repository the
  symlink `.agents/agents/example-agent.md` makes `example-agent` available;
  elsewhere copy `com.google.antigravity/agents/example-agent.md` into your
  project's `.agents/agents/`.

## Other Agent Plugins clients

- Skills and MCP come from the specification files at the root. Agents are
  outside the specification and are not shipped.
