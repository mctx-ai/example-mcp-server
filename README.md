<img src="https://mctx.ai/brand/logo-purple.png" alt="mctx" width="120">

**Free MCP Hosting. Set Your Price. Get Paid.**

# Example MCP Server

A working MCP server built with [`@mctx-ai/mcp-server`](https://github.com/mctx-ai/mcp-server). Clone, customize, deploy to mctx.

---

## What This Demonstrates

All framework features in one file (`src/index.ts`):

- **Tools** — sync handlers, object returns, error handling, generators with progress, LLM sampling
- **Resources** — static URIs and dynamic URI templates with parameter extraction
- **Prompts** — single-message (string return) and multi-message (`conversation()`)
- **Logging** — structured logging with `log.info()`, `log.error()`, etc.
- **Environment Variables** — configurable behavior via `GREETING` env var (set in mctx dashboard)

---

## Quick Start

```bash
git clone https://github.com/mctx-ai/example-mcp-server.git
cd example-mcp-server
npm install
npm run build
```

Deploy to mctx:

1. Visit [mctx.ai](https://mctx.ai)
2. Connect your repository
3. Deploy — mctx reads `package.json` for server configuration

---

## Project Structure

```
src/index.ts → Server implementation (all features in one file)
package.json → Server metadata (name, version, description, main entrypoint)
```

---

## Local Development

Run the dev server with automatic rebuild and hot-reload:

```bash
npm run dev
```

This runs both esbuild watch (rebuilds on source changes) and `mctx-dev` (hot-reloads the server) in parallel.

### Testing Environment Variables

To test environment variable configuration locally:

```bash
GREETING="Howdy" npm run dev
```

The `greet` tool will use "Howdy" instead of the default "Hello". When deployed to mctx, set `GREETING` in the dashboard to customize the greeting.

---

## Learn More

- [@mctx-ai/mcp-server](https://github.com/mctx-ai/mcp-server) — Framework documentation
- [docs.mctx.ai](https://docs.mctx.ai) — Platform guides
- [MCP Specification](https://modelcontextprotocol.io) — Protocol spec
