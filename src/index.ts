/**
 * Example MCP Server
 *
 * A complete reference implementation built with @mctx-ai/mcp-server.
 * Read top-to-bottom to learn every framework capability:
 *
 *   1. Server setup and configuration
 *   2. Tools — sync handlers, object returns, generators, and LLM sampling
 *   3. Resources — static URIs and dynamic URI templates
 *   4. Prompts — single-message strings and multi-message conversations
 *   5. Export — the fetch handler that ties it all together
 */

import {
  createServer,
  T,
  conversation,
  createProgress,
  log,
  type ToolHandler,
  type GeneratorToolHandler,
  type ResourceHandler,
  type PromptHandler,
} from '@mctx-ai/mcp-server';

// ─── Server ──────────────────────────────────────────────────────────
//
// createServer() returns an MCP server instance. The `instructions` field
// tells LLM clients what this server offers and how to use it.

const server = createServer({
  instructions: `An example MCP server showcasing all framework features. Use 'greet' for a hello (customizable via GREETING env var), 'calculate' for math, 'analyze' for progress-tracked analysis, and 'smart-answer' for LLM-assisted Q&A. Resources include docs://readme and user://{userId}. Prompts include 'code-review' and 'debug'.`,
});

// ─── Tools ───────────────────────────────────────────────────────────
//
// Tools are functions that LLM clients can invoke. Each tool gets a handler
// function, a description, and an input schema built with the T type system.
//
// The framework supports four handler patterns:
//   - Sync handler returning a string
//   - Sync handler returning an object (auto-serialized to JSON)
//   - Generator handler yielding progress notifications
//   - Async handler using `ask` for LLM sampling

/**
 * Simplest tool pattern: receive args, return a string.
 * Demonstrates environment variable usage via GREETING env var.
 * Set GREETING in the mctx dashboard to customize the greeting message.
 */
const greet: ToolHandler = (args) => {
  const { name } = args as { name: string };
  const greeting = process.env.GREETING || 'Hello';

  log.info(`Greeting ${name} with: ${greeting}`);

  return `${greeting}, ${name}!`;
};
greet.description = 'Greets a person by name using the GREETING environment variable (default: "Hello")';
greet.input = {
  name: T.string({
    required: true,
    description: 'Name to greet',
    minLength: 1,
    maxLength: 100,
  }),
};
server.tool('greet', greet);

/** Object returns are auto-serialized to JSON. Throw errors to signal failure. */
const calculate: ToolHandler = (args) => {
  const { operation, a, b } = args as {
    operation: string;
    a: number;
    b: number;
  };

  // Guard clause: check for invalid input before doing any work
  if (operation === 'divide' && b === 0) {
    log.error({ error: 'Division by zero attempted', operation, a, b });
    throw new Error('Division by zero');
  }

  const ops: Record<string, number> = {
    add: a + b,
    subtract: a - b,
    multiply: a * b,
    divide: a / b,
  };

  log.debug({ operation, a, b, result: ops[operation] });

  return { operation, a, b, result: ops[operation] };
};
calculate.description = 'Performs arithmetic operations';
calculate.input = {
  operation: T.string({
    required: true,
    enum: ['add', 'subtract', 'multiply', 'divide'],
    description: 'Arithmetic operation to perform',
  }),
  a: T.number({ required: true, description: 'First operand' }),
  b: T.number({ required: true, description: 'Second operand' }),
};
server.tool('calculate', calculate);

/**
 * Generator tools yield progress notifications so clients can show status.
 * createProgress(total) returns a step function that auto-increments 1/total, 2/total, etc.
 */
const analyze: GeneratorToolHandler = function* (args) {
  const { topic } = args as { topic: string };

  log.info(`Starting analysis of topic: ${topic}`);

  const step = createProgress(3);

  yield step(); // 1/3
  log.debug('Phase 1: Research complete');

  yield step(); // 2/3
  log.debug('Phase 2: Analysis complete');

  yield step(); // 3/3
  log.notice('Phase 3: Synthesis complete');

  const result = `Analysis of "${topic}" complete. Found 42 insights across 7 categories.`;
  log.info({ topic, result: 'success', insights: 42, categories: 7 });

  return result;
};
analyze.description = 'Analyzes a topic with progress updates';
analyze.input = {
  topic: T.string({
    required: true,
    description: 'Topic to analyze',
    minLength: 3,
    maxLength: 200,
  }),
};
server.tool('analyze', analyze);

/**
 * The `ask` parameter enables LLM sampling -- your tool can ask the client's
 * LLM for help mid-execution. It may be null if the client doesn't support it,
 * so always check before calling.
 */
const smartAnswer: ToolHandler = async (args, ask?) => {
  const { question } = args as { question: string };

  log.info(`Processing question: ${question}`);

  if (!ask) {
    log.warning('Sampling not available, providing basic answer');
    return `Answer to: ${question}`;
  }

  log.debug('Sampling enabled, requesting clarification from LLM');
  const clarification = await ask(
    'What additional context would help me answer this better?',
  );
  log.debug({ clarification });

  return `Question: ${question}\nContext: ${clarification}\nAnswer: With the additional context, here is a comprehensive answer.`;
};
smartAnswer.description =
  'Answers questions, optionally asking the LLM for clarification';
smartAnswer.input = {
  question: T.string({
    required: true,
    description: 'Question to answer',
    minLength: 5,
  }),
};
server.tool('smart-answer', smartAnswer);

// ─── Resources ───────────────────────────────────────────────────────
//
// Resources expose data via URIs that LLM clients can read.
//   - Static resources use exact URIs (e.g., docs://readme)
//   - Dynamic resources use URI templates with {param} placeholders

/** Static resource: exact URI, no parameters. */
const readme: ResourceHandler = () =>
  'Welcome to the example MCP server built with @mctx-ai/mcp-server. This server demonstrates tools, resources, prompts, progress tracking, and sampling.';
readme.description = 'Server documentation';
readme.mimeType = 'text/plain';
server.resource('docs://readme', readme);

/** Dynamic resource: URI template extracts params automatically. */
const userProfile: ResourceHandler = (params) => {
  const { userId } = params as { userId: string };

  return JSON.stringify({
    id: userId,
    name: `User ${userId}`,
    joined: '2024-01-01',
    plan: 'pro',
  });
};
userProfile.description = 'User profile by ID';
userProfile.mimeType = 'application/json';
server.resource('user://{userId}', userProfile);

// ─── Prompts ─────────────────────────────────────────────────────────
//
// Prompts are reusable message templates that pre-fill LLM conversations.
//   - Return a string for a single user message
//   - Return conversation() for multi-role dialogue

/** Single-message prompt: a string return becomes one user message. */
const codeReview: PromptHandler = (args) => {
  const { code, language } = args as { code: string; language?: string };

  return `Please review this ${language || 'code'} for bugs, security issues, and improvements:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;
};
codeReview.description = 'Code review prompt';
codeReview.input = {
  code: T.string({ required: true, description: 'Code to review' }),
  language: T.string({ description: 'Programming language' }),
};
server.prompt('code-review', codeReview);

/** Multi-message prompt: conversation() builds structured user/assistant dialogue. */
const debug: PromptHandler = (args) => {
  const { error, context } = args as { error: string; context?: string };

  return conversation(({ user, ai }) => [
    user.say(`I'm seeing this error: ${error}`),
    ...(context ? [user.say(`Context:\n${context}`)] : []),
    ai.say(
      'I will analyze the error and provide step-by-step debugging guidance.',
    ),
  ]);
};
debug.description = 'Debug assistance prompt with structured dialogue';
debug.input = {
  error: T.string({
    required: true,
    description: 'Error message or description',
    minLength: 1,
  }),
  context: T.string({
    description: 'Additional context, stack trace, or logs',
    maxLength: 5000,
  }),
};
server.prompt('debug', debug);

// ─── Export ──────────────────────────────────────────────────────────
//
// The server's fetch handler processes JSON-RPC 2.0 requests over HTTP.
// This export format is compatible with Cloudflare Workers and mctx hosting.

export default { fetch: server.fetch };
