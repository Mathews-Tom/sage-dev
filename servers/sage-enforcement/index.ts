#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadAgentsForFile, discoverAgents, getApplicableAgents } from './discovery.js';
import { filterViolations, calculateStatistics } from './filters.js';
import { validatePath, getProjectRoot } from './utils/validation.js';
import type { Violation } from './schemas/index.js';

/**
 * Sage-Dev MCP Enforcement Server
 * 
 * Provides progressive tool discovery for code enforcement agents:
 * - type-enforcer: Python 3.12 type checking via Pyright
 * - doc-validator: Python docstring validation (Google-style)
 * - test-coverage: Pytest coverage enforcement
 * - security-scanner: Security vulnerability and secret detection
 * 
 * Architecture:
 * - On-demand agent loading (4 agents for .py, 1 agent for .ts)
 * - Result filtering (1000 violations → 30 violations = 97% reduction)
 * - Session-based caching (<100ms discovery latency)
 * 
 * Target: 92% token reduction (150K → 12K tokens)
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
 * Lists available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'enforce-file',
        description:
          'Enforce code quality standards on a file using applicable agents. ' +
          'Python files (.py) use 4 agents: type-enforcer, doc-validator, test-coverage, security-scanner. ' +
          'TypeScript/JavaScript files (.ts, .js) use 1 agent: security-scanner. ' +
          'Results are filtered to top 10 violations per severity level (error, warning, info).',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Absolute path to file to enforce',
            },
            code: {
              type: 'string',
              description: 'Source code content',
            },
            limitPerSeverity: {
              type: 'number',
              description: 'Maximum violations per severity level (default: 10)',
              default: 10,
            },
          },
          required: ['filePath', 'code'],
        },
      },
      {
        name: 'list-agents',
        description:
          'List all available enforcement agents and their applicable file types. ' +
          'Useful for discovering which agents will run for a given file type.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get-applicable-agents',
        description:
          'Get list of agents applicable to a specific file. ' +
          'Returns agent names that will be loaded for the file type.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'File path to check',
            },
          },
          required: ['filePath'],
        },
      },
    ],
  };
});

/**
 * Handles tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'enforce-file': {
        const { filePath, code, limitPerSeverity = 10 } = args as {
          filePath: string;
          code: string;
          limitPerSeverity?: number;
        };

        // Validate file path
        const projectRoot = getProjectRoot();
        const validatedPath = validatePath(filePath, projectRoot);

        // Load applicable agents (on-demand loading)
        const agents = await loadAgentsForFile(validatedPath);

        if (agents.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    message: 'No applicable agents for file type',
                    filePath: validatedPath,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // Execute agents in parallel
        const results = await Promise.all(
          agents.map(async (agent) => {
            try {
              return await agent.execute({ filePath: validatedPath, code });
            } catch (error) {
              return {
                violations: [],
                summary: { errors: 0, warnings: 0, info: 0 },
                error: error instanceof Error ? error.message : 'Unknown error',
              };
            }
          })
        );

        // Aggregate violations from all agents
        const allViolations: Violation[] = [];
        for (const result of results) {
          if (typeof result === 'object' && result !== null && 'violations' in result && Array.isArray(result.violations)) {
            allViolations.push(...(result.violations as Violation[]));
          }
        }

        // Filter violations (token reduction)
        const filtered = filterViolations(allViolations, limitPerSeverity);
        const stats = calculateStatistics(allViolations);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  filePath: validatedPath,
                  agentsExecuted: agents.length,
                  statistics: stats,
                  filtered: {
                    shown: filtered.violations.length,
                    total: filtered.metadata.total,
                    reduction: `${Math.round((filtered.metadata.filtered / filtered.metadata.total) * 100)}%`,
                  },
                  violations: filtered.violations,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'list-agents': {
        const agents = discoverAgents();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  totalAgents: agents.length,
                  agents: agents.map((agent) => ({
                    name: agent.name,
                    description: agent.description,
                    applicableFileTypes: agent.applicableFileTypes,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get-applicable-agents': {
        const { filePath } = args as { filePath: string };
        const applicableAgents = getApplicableAgents(filePath);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  filePath,
                  applicableAgents,
                  count: applicableAgents.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: error instanceof Error ? error.message : 'Unknown error',
              tool: name,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start MCP server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Sage-Dev MCP Enforcement Server started');
  console.error('Available agents:');
  const agents = discoverAgents();
  for (const agent of agents) {
    console.error(`  - ${agent.name}: ${agent.description}`);
  }
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
