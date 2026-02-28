<img src="https://mctx.ai/brand/logo-purple.png" alt="mctx" width="120">

**Free MCP Hosting. Set Your Price. Get Paid.**

# Example MCP Server

A complete reference implementation built with [`@mctx-ai/mcp-server`](https://github.com/mctx-ai/mcp-server). Every framework capability in one file — clone it, study it, make it yours.

---

## What This Server Does

Demonstrates all four MCP capability types in a single, well-commented file (`src/index.ts`):

| Capability | What's Covered |
|---|---|
| **Tools** | Sync string return, object return, generator with progress, LLM sampling |
| **Resources** | Static URI, dynamic URI template with parameter extraction |
| **Prompts** | Single-message string, multi-message `conversation()` |
| **Infrastructure** | Structured logging, environment variables, error handling — [configurable from the mctx.ai dashboard](https://mctx.ai) when deployed |

---

## Tools

### `greet`

Greets a person by name. Uses the `GREETING` environment variable (default: `"Hello"`).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Name to greet (1–100 characters) |

```
greet(name: "Alice")
→ "Hello, Alice!"
```

Set `GREETING=Howdy` to get `"Howdy, Alice!"` instead.

> In production, configure environment variables from the [mctx.ai dashboard](https://mctx.ai) — changes trigger a seamless automatic redeploy.

---

### `calculate`

Performs basic arithmetic and returns a structured result object.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `operation` | string | yes | One of: `add`, `subtract`, `multiply`, `divide` |
| `a` | number | yes | First operand |
| `b` | number | yes | Second operand |

```
calculate(operation: "multiply", a: 6, b: 7)
→ { "operation": "multiply", "a": 6, "b": 7, "result": 42 }
```

Throws a descriptive error on division by zero.

---

### `analyze`

Analyzes a topic and streams progress notifications as it works through three phases.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `topic` | string | yes | Topic to analyze (3–200 characters) |

```
analyze(topic: "quantum computing")
→ [progress: 1/3] → [progress: 2/3] → [progress: 3/3]
→ "Analysis of "quantum computing" complete. Found 42 insights across 7 categories."
```

Demonstrates `GeneratorToolHandler` with `createProgress()`.

---

### `smart-answer`

Answers questions by delegating to the client's LLM via the sampling API. Falls back gracefully when sampling is unavailable (HTTP transport).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `question` | string | yes | Question to answer (minimum 5 characters) |

```
smart-answer(question: "What is the capital of France?")
→ "Question: What is the capital of France?\n\nAnswer: Paris."
```

Demonstrates the `ask` parameter and bidirectional transport pattern.

This pattern — letting the MCP client supply the LLM — means your server stays stateless and cheap to host. The client brings the model; mctx brings the infrastructure.

---

## Resources

### `docs://readme`

Static resource. Returns plain-text server documentation.

```
Read URI: docs://readme
→ "Welcome to the example MCP server built with @mctx-ai/mcp-server..."
```

---

### `user://{userId}`

Dynamic resource. Returns a JSON user profile for the given ID.

```
Read URI: user://42
→ { "id": "42", "name": "User 42", "joined": "2024-01-01", "plan": "pro" }
```

Demonstrates URI templates with automatic parameter extraction.

---

## Prompts

### `code-review`

Generates a code review request as a single user message.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `code` | string | yes | Code to review |
| `language` | string | no | Programming language label |

```
code-review(code: "const x = eval(input)", language: "javascript")
→ "Please review this javascript for bugs, security issues, and improvements:..."
```

---

### `debug`

Builds a structured multi-turn conversation to guide debugging.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `error` | string | yes | Error message or description |
| `context` | string | no | Stack trace or additional logs (max 5,000 characters) |

```
debug(error: "TypeError: Cannot read properties of undefined")
→ [user] "I'm seeing this error: TypeError: Cannot read..."
→ [assistant] "I will analyze the error and provide step-by-step debugging guidance."
```

Demonstrates `conversation()` for multi-role dialogue.

---

## Quick Start

```bash
git clone https://github.com/mctx-ai/example-mcp-server.git
cd example-mcp-server
npm install
npm run dev
```

The dev server runs esbuild in watch mode and hot-reloads via `mctx-dev` on every rebuild.

**Test an environment variable locally:**

```bash
GREETING="Howdy" npm run dev
```

**Deploy to [mctx.ai](https://mctx.ai):**

1. Visit [mctx.ai](https://mctx.ai) and connect your repository
2. Set any environment variables (e.g., `GREETING`) in the dashboard
3. Deploy — mctx reads `package.json` for server configuration

mctx handles TLS, scaling, and uptime. You keep the code. Set your price and get paid when other developers use your server.

---

## Prompt Ideas

Use these with any MCP client connected to this server:

- **"Greet the whole team"** — Call `greet` in a loop with each team member's name
- **"Check my math"** — Use `calculate` to verify arithmetic in a document or spreadsheet
- **"Deep-dive on a topic"** — Call `analyze` and watch real-time progress stream in
- **"Ask anything"** — Use `smart-answer` to route questions through the client's LLM
- **"Review my PR diff"** — Pass a code snippet to `code-review` with the language set
- **"Help me fix this stack trace"** — Feed an error and logs into `debug` for guided triage
- **"Look up a user"** — Read `user://{id}` to fetch a profile by ID

---

## Learn More

- [`@mctx-ai/mcp-server`](https://github.com/mctx-ai/mcp-server) — Framework documentation and API reference
- [docs.mctx.ai](https://docs.mctx.ai) — Platform guides for deploying and managing MCP servers
- [mctx.ai](https://mctx.ai) — Host your MCP server for free
- [MCP Specification](https://modelcontextprotocol.io) — The protocol spec this server implements
