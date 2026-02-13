<img src="https://mctx.ai/brand/logo-purple.png" alt="mctx" width="120">

# Example MCP Server

A minimal, working MCP server you can clone and deploy to mctx. No framework, no build step, no dependencies. Just JavaScript.

**Free MCP Hosting. Set Your Price. Get Paid.**

---

## What This Is

This repository is a starter template for building MCP servers on the mctx platform. It demonstrates the core structure needed to create a functional server: a single `index.js` file implementing JSON-RPC 2.0 protocol handling, and an `mctx.json` configuration file that tells mctx how to run your server.

Fork this repo, customize it to your needs, and deploy. It just works.

---

## Quick Start

Clone the repository:

```bash
git clone https://github.com/mctx-ai/example-mcp-server.git
cd example-mcp-server
```

Optionally customize `index.js` to add your own tools.

Connect your GitHub repository to mctx and deploy:

1. Visit [mctx.ai](https://mctx.ai)
2. Connect your forked repository
3. Deploy — mctx automatically detects `mctx.json` and runs your server

That's it. Your MCP server is live.

Full platform documentation at [docs.mctx.ai](https://docs.mctx.ai).

---

## How It Works

### `mctx.json`

Configuration file that tells mctx how to run your server. Contains the server name, version, description, entrypoint file, and capabilities.

Bump the `version` field to trigger a new deployment.

### `index.js`

The MCP server itself, written as a Cloudflare Worker. Implements JSON-RPC 2.0 protocol handling for MCP methods:

- `tools/list` — Returns available tools
- `tools/call` — Executes a tool by name
- `notifications/cancelled` — Handles cancellation notifications

This example includes a single `hello` tool that returns a greeting.

### Environment Variables

Configure environment variables via the mctx dashboard. This example uses `GREETING` to customize the hello message. If not set, defaults to "Hello".

Set environment variables in the mctx dashboard under your server's settings.

---

## Customizing

Make this server your own.

**Add tools:**

Extend the `tools/list` handler to advertise your tools, and add cases to the `tools/call` handler to implement them.

```javascript
case 'tools/list':
  return jsonRpcResponse({
    tools: [
      {
        name: 'hello',
        description: 'Get a friendly greeting',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'weather',
        description: 'Get current weather for a location',
        inputSchema: {
          type: 'object',
          properties: {
            location: { type: 'string', description: 'City name' },
          },
          required: ['location'],
        },
      },
    ],
  }, id);
```

**Update metadata:**

Edit `mctx.json` to reflect your server's name, description, and version. Bumping the version triggers a new deployment.

**Test locally:**

Run the server locally with Wrangler (Cloudflare's CLI) before deploying:

```bash
npx wrangler dev index.js
```

---

## Learn More

- [mctx Documentation](https://docs.mctx.ai) — Platform guides and API reference
- [MCP Specification](https://modelcontextprotocol.io) — Model Context Protocol spec
- [mctx Platform](https://mctx.ai) — Create your account and deploy
