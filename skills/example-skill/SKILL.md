---
name: example-skill
description: Verifies that the agent-plugins-starter plugin is loaded in the current client by calling its example MCP tool and checking which plugin components are visible. Use when the user asks to test, verify, or smoke-check the plugin installation, or asks whether the example plugin works here.
license: Apache-2.0
metadata:
  author: hoshiori-dev
---

# Plugin smoke check

Confirm that the three plugin components reached this client, then report what is missing and how to
fix it.

## Workflow

1. **Skills.** This file loaded, so the skills component works. Note which client you are running in
   (Claude Code, Codex, Antigravity, or another Agent Plugins client); the fixes below differ per
   client.
2. **MCP.** Call the `echo` tool of the `example-server` MCP server with `text: "ping"`. Expected
   result: `example-server: ping`. If the tool is absent, read
   [references/troubleshooting.md](references/troubleshooting.md) and follow the section for your
   client.
3. **Agents.** Check whether a subagent named `example-agent` is available. Only Claude Code lists
   plugin subagents; Codex and Antigravity plugins carry none, so report "not shipped" rather than
   "broken" there (the troubleshooting reference says which).
4. **Report** one line per component: `skills: ok`, `mcp: ok | missing (<fix>)`,
   `agents: ok | not shipped | missing (<fix>)`. For a local checkout you may also run
   [scripts/list_components.sh](scripts/list_components.sh) to print what the package declares.

## Gotchas

- The MCP server runs with `deno`; a missing `deno` binary on the user's machine shows up as a
  server start failure, not as a missing tool.
- Antigravity reads `mcp_config.json`, not `mcp.json`, until its Agent Plugins flag is on; the file
  is generated from `mcp.json`. Neither it nor Codex loads this plugin's agents; only Claude Code
  does.
