import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { CacheManager } from './cache-manager.js';

const CACHE_DIR = process.env.SAGE_CACHE_DIR || '.sage/agent/research';

const cacheManager = new CacheManager({
  cacheDir: CACHE_DIR,
  maxSizeBytes: 100 * 1024 * 1024,
  ttlDays: 30,
});

const ResearchQuerySchema = z.object({
  topic: z.string().min(1),
});

const ResearchStoreSchema = z.object({
  topic: z.string().min(1),
  findings: z.string().min(1),
  source: z.string().default('web'),
  confidence: z.number().min(0).max(1).default(0.8),
});

const server = new Server(
  {
    name: 'sage-research',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'research_query',
        description: 'Query cached research findings for a topic. Returns cached results if available, otherwise returns null.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'The research topic to query',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'research_store',
        description: 'Store research findings in the cache for future retrieval.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'The research topic',
            },
            findings: {
              type: 'string',
              description: 'The research findings to cache',
            },
            source: {
              type: 'string',
              description: 'Source of the research (e.g., web, documentation)',
              default: 'web',
            },
            confidence: {
              type: 'number',
              description: 'Confidence score of the findings (0-1)',
              default: 0.8,
            },
          },
          required: ['topic', 'findings'],
        },
      },
      {
        name: 'research_invalidate',
        description: 'Invalidate cached research for a specific topic.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'The research topic to invalidate',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'research_stats',
        description: 'Get cache statistics including hit rate, total entries, and storage usage.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'research_cleanup',
        description: 'Remove expired cache entries older than TTL (30 days).',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'research_query': {
      const { topic } = ResearchQuerySchema.parse(args);
      const entry = await cacheManager.get(topic);

      if (!entry) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                cached: false,
                topic,
                message: 'No cached research found for this topic',
              }),
            },
          ],
        };
      }

      const age = cacheManager.formatAge(entry);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              cached: true,
              topic: entry.topic,
              findings: entry.findings,
              age,
              metadata: entry.metadata,
              accessCount: entry.accessCount,
            }),
          },
        ],
      };
    }

    case 'research_store': {
      const { topic, findings, source, confidence } = ResearchStoreSchema.parse(args);

      await cacheManager.set(topic, findings, {
        source,
        confidence,
        lastUpdated: new Date().toISOString(),
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              topic,
              message: `Research cached successfully for topic: ${topic}`,
            }),
          },
        ],
      };
    }

    case 'research_invalidate': {
      const { topic } = ResearchQuerySchema.parse(args);
      const removed = await cacheManager.invalidate(topic);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: removed,
              topic,
              message: removed
                ? `Cache invalidated for topic: ${topic}`
                : `No cache entry found for topic: ${topic}`,
            }),
          },
        ],
      };
    }

    case 'research_stats': {
      const stats = await cacheManager.stats();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              totalEntries: stats.totalEntries,
              totalSize: cacheManager.formatSize(stats.totalSize),
              hitRate: `${stats.hitRate.toFixed(1)}%`,
              oldestEntry: stats.oldestEntry
                ? new Date(stats.oldestEntry).toISOString()
                : null,
              newestEntry: stats.newestEntry
                ? new Date(stats.newestEntry).toISOString()
                : null,
            }),
          },
        ],
      };
    }

    case 'research_cleanup': {
      const removed = await cacheManager.cleanup();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              removedEntries: removed,
              message: `Cleaned up ${removed} expired cache entries`,
            }),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main(): Promise<void> {
  await cacheManager.initialize();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Sage Research Cache MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
