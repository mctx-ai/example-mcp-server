/**
 * Example MCP Server
 *
 * Built with @mctx-ai/mcp-server — a lightweight framework that handles
 * JSON-RPC 2.0 protocol, routing, and serialization automatically.
 *
 * Demonstrates: tools, progress generators, sampling, static + dynamic
 * resources, single + multi-message prompts, and structured logging.
 */

import { createServer, T, conversation, createProgress, log } from '@mctx-ai/mcp-server';

const app = createServer();

// ─── Tools ──────────────────────────────────────────────────────────

// Basic tool — string return
const greet = ({ name }) => {
  log.info(`Greeting ${name}`);
  return `Hello, ${name}!`;
};
greet.description = 'Greets a person by name';
greet.input = {
  name: T.string({ required: true, description: 'Name to greet' }),
};
app.tool('greet', greet);

// Tool — object return (auto-serialized to JSON)
const calculate = ({ operation, a, b }) => {
  const ops = { add: a + b, subtract: a - b, multiply: a * b, divide: a / b };
  if (operation === 'divide' && b === 0) {
    throw new Error('Division by zero');
  }
  return { operation, a, b, result: ops[operation] };
};
calculate.description = 'Performs arithmetic operations';
calculate.input = {
  operation: T.string({ required: true, enum: ['add', 'subtract', 'multiply', 'divide'] }),
  a: T.number({ required: true, description: 'First operand' }),
  b: T.number({ required: true, description: 'Second operand' }),
};
app.tool('calculate', calculate);

// Generator tool — progress notifications via yield
const analyze = function* ({ topic }) {
  const step = createProgress(3);
  yield step(); // progress 1/3
  // ... research work would happen here
  yield step(); // progress 2/3
  // ... analysis work would happen here
  yield step(); // progress 3/3
  return `Analysis of "${topic}" complete. Found 42 insights across 7 categories.`;
};
analyze.description = 'Analyzes a topic with progress updates';
analyze.input = {
  topic: T.string({ required: true, description: 'Topic to analyze' }),
};
app.tool('analyze', analyze);

// Sampling tool — asks the LLM for clarification via 2nd parameter
const smartAnswer = async ({ question }, ask) => {
  if (ask) {
    const clarification = await ask('What additional context would help me answer this better?');
    return `Question: ${question}\nContext: ${clarification}\nAnswer: With the additional context, here is a comprehensive answer.`;
  }
  return `Answer to: ${question}`;
};
smartAnswer.description = 'Answers questions, optionally asking the LLM for clarification';
smartAnswer.input = {
  question: T.string({ required: true, description: 'Question to answer' }),
};
app.tool('smart-answer', smartAnswer);

// ─── Resources ──────────────────────────────────────────────────────

// Static resource — exact URI
const readme = () => 'Welcome to the example MCP server built with @mctx-ai/mcp-server. This server demonstrates tools, resources, prompts, progress tracking, and sampling.';
readme.description = 'Server documentation';
readme.mimeType = 'text/plain';
app.resource('docs://readme', readme);

// Dynamic resource — URI template with parameter extraction
const userProfile = ({ userId }) => JSON.stringify({
  id: userId,
  name: `User ${userId}`,
  joined: '2024-01-01',
  plan: 'pro',
});
userProfile.description = 'User profile by ID';
userProfile.mimeType = 'application/json';
app.resource('user://{userId}', userProfile);

// ─── Prompts ────────────────────────────────────────────────────────

// Single-message prompt — string return becomes one user message
const codeReview = ({ code, language }) =>
  `Please review this ${language || 'code'} for bugs, security issues, and improvements:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;
codeReview.description = 'Code review prompt';
codeReview.input = {
  code: T.string({ required: true, description: 'Code to review' }),
  language: T.string({ description: 'Programming language' }),
};
app.prompt('code-review', codeReview);

// Multi-message prompt — conversation() builds structured dialogue
const debug = ({ error, context }) =>
  conversation(({ user, ai }) => [
    user.say(`I'm seeing this error: ${error}`),
    ...(context ? [user.attach(context, 'text/plain')] : []),
    ai.say('I will analyze the error and provide step-by-step debugging guidance.'),
  ]);
debug.description = 'Debug assistance prompt with structured dialogue';
debug.input = {
  error: T.string({ required: true, description: 'Error message or description' }),
  context: T.string({ description: 'Additional context, stack trace, or logs' }),
};
app.prompt('debug', debug);

// ─── Export ─────────────────────────────────────────────────────────

export default { fetch: app.fetch };
