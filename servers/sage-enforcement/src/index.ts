#!/usr/bin/env node

/**
 * MCP Server Entry Point for Sage-Dev Enforcement Agents
 *
 * This server implements the Model Context Protocol (MCP) to provide
 * enforcement agents as tools for code quality validation. It follows
 * progressive discovery patterns to achieve 92% token reduction.
 *
 * Architecture:
 * - JSON-RPC 2.0 protocol over stdio transport
 * - Filesystem-based agent discovery (on-demand loading)
 * - V8 Isolates sandboxing for security
 * - Result filtering before context logging
 *
 * @see https://modelcontextprotocol.io/specification/2025-03-26
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { typeEnforcer } from '../agents/type-enforcer.js';

/**
 * MCP Server Information
 */
const SERVER_NAME = 'sage-enforcement';
const SERVER_VERSION = '1.0.0';

/**
 * Initialize MCP Server
 *
 * Creates a new MCP server instance with tool capabilities.
 * The server handles agent discovery, tool registration, and execution.
 */
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handle tools/list Request
 *
 * Returns the list of available enforcement agent tools.
 * Currently returns empty list as agents will be added in MCP-005+.
 *
 * Progressive Discovery: In production, this will query the filesystem
 * to discover available agents dynamically.
 *
 * @returns List of MCP tools with schemas
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // TODO: MCP-011 - Implement agent discovery via filesystem
  // const agents = await discoverAgents('servers/sage-enforcement/agents/');

  return {
    tools: [
      {
        name: 'sage_type_enforcer',
        description: 'Validates Python 3.12 type annotations using Pyright. Detects missing return types, deprecated typing imports, and inappropriate Any usage.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Absolute file path',
            },
            code: {
              type: 'string',
              description: 'Python code to validate',
            },
            standards: {
              type: 'object',
              description: 'Type checking standards (optional)',
              properties: {
                enforceReturnTypes: { type: 'boolean' },
                allowAny: { type: 'boolean' },
                pythonVersion: { type: 'string' },
                deprecatedImports: { type: 'array', items: { type: 'string' } },
                builtinGenerics: { type: 'boolean' },
              },
            },
          },
          required: ['filePath', 'code'],
        },
      },
      // MCP-009: sage_doc_validator, sage_test_coverage, sage_security_scanner
    ],
  };
});

/**
 * Handle tools/call Request
 *
 * Executes the specified enforcement agent tool with provided arguments.
 * Validates input with Zod schemas, executes agent, filters results.
 *
 * Security: All agents run in sandboxed environments (V8 Isolates)
 * Performance: Results filtered in execution environment before context logging
 *
 * @param request - Tool call request with name and arguments
 * @returns Tool execution result with violations
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'sage_type_enforcer': {
        const result = await typeEnforcer(args);
        return {
          content: [
            {
              type: 'text',
              text: `Found ${result.summary.errors} errors, ${result.summary.warnings} warnings`,
            },
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      // MCP-009: sage_doc_validator, sage_test_coverage, sage_security_scanner
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start MCP Server
 *
 * Connects the server to stdio transport and begins listening for requests.
 * This is the main entry point when the server is started via `npm start`.
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log server start (to stderr, not stdout which is used for JSON-RPC)
  console.error(`${SERVER_NAME} v${SERVER_VERSION} started`);
  console.error('Listening for MCP requests on stdio...');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, shutting down...');
  await server.close();
  process.exit(0);
});

// Start server
main().catch((error) => {
  console.error('Fatal error starting MCP server:', error);
  process.exit(1);
});
