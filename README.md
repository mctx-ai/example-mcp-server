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

Use the dev server for hot-reload during development:

```bash
npx mctx-dev dist/index.js
```

---

## Learn More

- [@mctx-ai/mcp-server](https://github.com/mctx-ai/mcp-server) — Framework documentation
- [docs.mctx.ai](https://docs.mctx.ai) — Platform guides
- [MCP Specification](https://modelcontextprotocol.io) — Protocol spec
