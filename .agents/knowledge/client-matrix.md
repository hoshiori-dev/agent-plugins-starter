# Client Matrix

Read when adding or changing a skill, MCP server, or agent, when a client does
not load something, or before touching a `com.*` directory or a wiring file.
Facts below were verified on 2026-10-27 with Claude Code 2.1.311, Codex CLI
0.164.0, and Antigravity CLI (`agy`, build 2026-10-24); re-verify when a client
updates and record the date here.

## How each client loads each component

| Component | Codex | Claude Code | Antigravity |
|---|---|---|---|
| Manifest | root `plugin.json` (Agent Plugins 1.0.0) plus `extensions.com.openai` | `.claude-plugin/plugin.json`, generated: metadata mirror plus `agents` and `mcpServers` pointers | `com.google.antigravity/plugin.json`, generated native manifest |
| Skills | root `skills/` (spec) | root `skills/` (default scan) | `com.google.antigravity/skills` → `../skills` symlink, copied on install |
| MCP | root `mcp.json` (spec) | `com.anthropic.claude-code/mcp.json`, generated (`streamable-http`→`http`, `${PLUGIN_ROOT}`→`${CLAUDE_PLUGIN_ROOT}`) | `com.google.antigravity/mcp_config.json`, generated (no `type`, paths relative to the package; `com.google.antigravity/mcp` → `../mcp` symlink) |
| Agents | `com.openai/agents/<n>.toml`, declared in `.codex/config.toml` (workspace only; Codex plugins carry no agents) | `com.anthropic.claude-code/agents/<n>.md`, listed by the generated manifest | `com.google.antigravity/agents/<n>.md` at the package root |
| Local load | `codex plugin marketplace add .` then `codex plugin add agent-plugins-starter@agent-plugins-starter`; marketplace file `.agents/plugins/marketplace.json` (generated) | `claude --plugin-dir .`; GitHub install through the generated `.claude-plugin/marketplace.json` (`/plugin marketplace add <owner>/<repo>`) | the symlink `.agents/plugins/<plugin name>` → `../../com.google.antigravity` registers the package for the workspace; install elsewhere: `agy plugin install <clone>/com.google.antigravity` |
| Validator | `codex plugin marketplace add .` + `codex plugin list` | `claude plugin validate .` (non-strict: the root `CLAUDE.md` of this development repository draws a warning that `--strict` turns into a failure) | `agy plugin validate com.google.antigravity --strict`; root: `agy plugin validate .` (non-strict, see below) |

Decision rule behind the table: spec-defined things use the spec; a client
that cannot read the spec gets a pointer in its own manifest when it has one,
a generated conversion when the format differs mechanically, and a
hand-written client file when fields differ (agents). `scripts/lib/clients.ts`
is the registry of these facts; `just client-footprint <id>` prints a client's
files.

## Known limitations

- **Antigravity spec support is behind a flag.** This `agy` build recognises
  the Agent Plugins `$schema` (`enable-agent-plugins-spec`, off by default)
  and names `com.google.antigravity` as its namespace, but its installer still
  reads `skills/`, `agents/`, and `mcp_config.json` from the plugin root and
  ignores `mcp.json`. Hence the self-contained package in
  `com.google.antigravity/`. `agy plugin validate --strict .` on the root
  warns about this and fails; validate the package strictly and the root
  non-strictly.
- **Antigravity remote install is skills-only.** `agy plugin install <GitHub URL>`
  reads the root, which has no `agents/` or `mcp_config.json`. Users install
  the package directory from a clone.
- **Antigravity MCP paths are relative.** `mcp_config.json` has no plugin-root
  placeholder; generated paths are relative to the package, and Antigravity
  starts the server there (verified through the workspace link; the installed
  copy has the same layout).
- **Codex agents do not ship.** Codex has no plugin agent component; the
  `com.openai/agents/` files are usable only through a `config.toml` that
  declares them, which this repository's `.codex/config.toml` does.
- **`com.anthropic.claude-code` is a self-chosen namespace.** Anthropic has
  published none; `com.openai` and `com.google.antigravity` are the clients'
  own.

## Verification log

| Date | What | Result |
|---|---|---|
| 2026-10-27 | `codex plugin marketplace add .` + `codex plugin add` with `source.path: "./"` | installs root plugin (plugin.json, mcp.json, skills, mcp) |
| 2026-10-27 | `claude plugin validate --strict .` with generated pointer manifest and a root-level `agents/` absent | passes, no warnings |
| 2026-10-27 | `agy plugin validate --strict com.google.antigravity` and `agy plugin install` of the package | skills, agents, mcpServers all processed; symlinks copied |
| 2026-10-27 | workspace registration through the symlink `.agents/plugins/agent-plugins-starter -> ../../com.google.antigravity` | `agy --print` in the repository lists the plugin, the `echo` MCP tool, and the `example-agent` subagent; the relative server path in `mcp_config.json` resolves |
| 2026-10-27 | `.agents/plugins.json` with `{"path": ".", "include_only": [...]}` | not picked up by the CLI session; replaced by the symlink above |
| 2026-10-27 | `agy plugin validate --strict` on the root | fails only because the root `mcp.json`/`$schema` pair is read as the flagged spec mode; the package validates strictly |
