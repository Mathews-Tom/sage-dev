/**
 * Sage Enforcement MCP Server
 *
 * Model Context Protocol server for code quality enforcement agents.
 * Provides on-demand tool discovery and progressive disclosure for token efficiency.
 *
 * Agents:
 * - type-enforcer: Python 3.12 type annotation validation
 * - doc-validator: Google-style docstring validation
 * - test-coverage: pytest-cov integration for coverage enforcement
 * - security-scanner: OWASP Top 10 vulnerability detection
 *
 * Performance Target: ≤12K tokens per operation (92% reduction from 150K baseline)
 *
 * @see https://modelcontextprotocol.io/ - MCP Specification
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

// Import agents
import { typeEnforcer } from './agents/type-enforcer.js';
import { docValidator } from './agents/doc-validator.js';
import { testCoverage } from './agents/test-coverage.js';
import { securityScanner } from './agents/security-scanner.js';

// Import schemas for JSON Schema generation
import {
  TypeCheckInputSchema,
  DocValidationInputSchema,
  TestCoverageInputSchema,
  SecurityScanInputSchema,
  AgentResultSchema,
} from './schemas/index.js';

/**
 * Tool Definitions for MCP Protocol
 *
 * Each agent is exposed as an MCP tool with JSON Schema for input validation.
 */
const TOOLS: Tool[] = [
  {
    name: 'sage_type_enforcer',
    description: 'Validates Python 3.12 type annotations using Pyright. Detects missing return types, deprecated typing imports, and inappropriate Any usage. Returns top 10 errors + warnings.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Absolute path to Python file',
        },
        code: {
          type: 'string',
          description: 'Python code to validate',
        },
        standards: {
          type: 'object',
          description: 'Optional type checking standards',
          properties: {
            enforceReturnTypes: { type: 'boolean', default: true },
            allowAny: { type: 'boolean', default: false },
            pythonVersion: { type: 'string', default: '3.12' },
            deprecatedImports: { type: 'array', items: { type: 'string' } },
            builtinGenerics: { type: 'boolean', default: true },
          },
        },
      },
      required: ['filePath', 'code'],
    },
  },
  {
    name: 'sage_doc_validator',
    description: 'Validates Google-style docstrings for Python functions and classes. Detects missing Args, Returns, and Raises sections. Returns top 10 errors + warnings.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Absolute path to Python file',
        },
        code: {
          type: 'string',
          description: 'Python code to validate',
        },
      },
      required: ['filePath', 'code'],
    },
  },
  {
    name: 'sage_test_coverage',
    description: 'Validates test coverage using pytest-cov. Enforces minimum coverage threshold (default: 80%). Returns violations for uncovered lines and coverage below threshold.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Absolute path to Python file',
        },
        threshold: {
          type: 'number',
          description: 'Minimum coverage percentage (0-100)',
          default: 80,
          minimum: 0,
          maximum: 100,
        },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'sage_security_scanner',
    description: 'Scans for OWASP Top 10 vulnerabilities, hardcoded secrets, and insecure coding patterns. Returns critical violations with remediation guidance.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Absolute path to Python file',
        },
        code: {
          type: 'string',
          description: 'Python code to scan',
        },
        standards: {
          type: 'object',
          description: 'Optional security standards',
          properties: {
            owaspRules: { type: 'array', items: { type: 'string' } },
            insecureFunctions: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      required: ['filePath', 'code'],
    },
  },
];

/**
 * Agent Executor Map
 *
 * Maps tool names to agent execution functions.
 */
const AGENT_EXECUTORS: Record<string, (input: unknown) => Promise<unknown>> = {
  sage_type_enforcer: typeEnforcer,
  sage_doc_validator: docValidator,
  sage_test_coverage: testCoverage,
  sage_security_scanner: securityScanner,
};

/**
 * Create and Configure MCP Server
 */
const server = new Server(
  {
    name: 'sage-enforcement',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handle: tools/list
 *
 * Returns available enforcement agents as MCP tools.
 * Implements progressive disclosure: only returns tool definitions, not full agent context.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

/**
 * Handle: tools/call
 *
 * Executes enforcement agent and returns filtered results.
 * Implements context optimization: filters violations in execution environment.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Validate tool exists
  const executor = AGENT_EXECUTORS[name];
  if (!executor) {
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    // Execute agent
    const result = await executor(args);

    // Return result as MCP tool response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    // Return error details
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
            agent: name,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start MCP Server
 *
 * Initializes stdio transport and begins listening for requests.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log server start (to stderr to avoid interfering with stdio protocol)
  console.error('Sage Enforcement MCP Server started');
  console.error('Agents available: type-enforcer, doc-validator, test-coverage, security-scanner');
  console.error('Protocol: JSON-RPC 2.0 over stdio');
}

// Start server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
