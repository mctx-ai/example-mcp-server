/**
 * Hello World MCP Server
 *
 * A minimal Model Context Protocol (MCP) server implementation for the mctx platform.
 * Demonstrates the core JSON-RPC 2.0 protocol handling required for MCP servers.
 *
 * This server runs as a Cloudflare Worker and provides a single "hello" tool.
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept POST requests for JSON-RPC
    if (request.method !== 'POST') {
      return jsonRpcError(-32600, 'Invalid Request - Only POST allowed', null, 405);
    }

    // Parse JSON-RPC request
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return jsonRpcError(-32700, 'Parse error - Invalid JSON', null, 400);
    }

    const { method, params, id } = body;

    // Route to appropriate handler based on JSON-RPC method
    switch (method) {
      case 'tools/list':
        return jsonRpcResponse({
          tools: [
            {
              name: 'hello',
              description: 'Get a friendly greeting from the server',
              inputSchema: {
                type: 'object',
                properties: {},
              },
            },
          ],
        }, id);

      case 'tools/call':
        // Extract tool name from params
        const toolName = params?.name;

        if (toolName !== 'hello') {
          return jsonRpcError(-32601, `Unknown tool: ${toolName}`, id, 400);
        }

        // Get greeting from environment variable or use default
        const greeting = env.GREETING || 'Hello';

        return jsonRpcResponse({
          content: [
            {
              type: 'text',
              text: `${greeting}, World!`,
            },
          ],
        }, id);

      case 'notifications/cancelled':
        // Standard MCP notification - return empty result
        return jsonRpcResponse({}, id);

      default:
        return jsonRpcError(-32601, `Method not found: ${method}`, id, 400);
    }
  },
};

/**
 * Create a successful JSON-RPC 2.0 response
 */
function jsonRpcResponse(result, id) {
  return new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      result,
      id,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'MCP-Protocol-Version': '2025-11-25',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

/**
 * Create a JSON-RPC 2.0 error response
 */
function jsonRpcError(code, message, id, httpStatus = 400) {
  return new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      error: {
        code,
        message,
      },
      id,
    }),
    {
      status: httpStatus,
      headers: {
        'Content-Type': 'application/json',
        'MCP-Protocol-Version': '2025-11-25',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
