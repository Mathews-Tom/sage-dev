import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { extractPythonPatterns } from './pattern-extractor-python.js';
import { extractTypeScriptPatterns } from './pattern-extractor-typescript.js';
import {
  savePatterns,
  loadPatterns,
  formatPatternsForDisplay,
} from './utils/pattern-storage.js';
import {
  createEmptyPatterns,
  mergePatterns,
} from './schemas/repository-patterns.js';
import { basename } from 'path';
import { ProgressiveLoader } from './progressive-loader.js';

const DEFAULT_PATTERNS_DIR = '.sage/agent/examples';

const ExtractPatternsSchema = z.object({
  repoPath: z.string(),
  outputDir: z.string().default(DEFAULT_PATTERNS_DIR),
  samplePercentage: z.number().min(1).max(100).default(50),
  maxFiles: z.number().min(1).max(10000).default(1000),
});

const LoadPatternsSchema = z.object({
  patternsDir: z.string().default(DEFAULT_PATTERNS_DIR),
});

const LoadProgressiveSchema = z.object({
  filePath: z.string(),
  level: z.enum(['critical', 'core', 'extended']).default('core'),
  patternsDir: z.string().default(DEFAULT_PATTERNS_DIR),
});

const server = new Server(
  {
    name: 'sage-context-optimizer',
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
        name: 'extract_patterns',
        description: 'Extract coding patterns from a repository using AST analysis. Analyzes Python and TypeScript files to detect naming conventions, type patterns, testing frameworks, and architecture patterns.',
        inputSchema: {
          type: 'object',
          properties: {
            repoPath: {
              type: 'string',
              description: 'Path to the repository to analyze',
            },
            outputDir: {
              type: 'string',
              description: 'Directory to save extracted patterns',
              default: DEFAULT_PATTERNS_DIR,
            },
            samplePercentage: {
              type: 'number',
              description: 'Percentage of files to sample (1-100)',
              default: 50,
            },
            maxFiles: {
              type: 'number',
              description: 'Maximum number of files to analyze per language',
              default: 1000,
            },
          },
          required: ['repoPath'],
        },
      },
      {
        name: 'load_patterns',
        description: 'Load previously extracted patterns from the patterns directory.',
        inputSchema: {
          type: 'object',
          properties: {
            patternsDir: {
              type: 'string',
              description: 'Directory containing the patterns file',
              default: DEFAULT_PATTERNS_DIR,
            },
          },
        },
      },
      {
        name: 'display_patterns',
        description: 'Display extracted patterns in human-readable format.',
        inputSchema: {
          type: 'object',
          properties: {
            patternsDir: {
              type: 'string',
              description: 'Directory containing the patterns file',
              default: DEFAULT_PATTERNS_DIR,
            },
          },
        },
      },
      {
        name: 'load_patterns_progressive',
        description: 'Load patterns progressively based on task context. Filters patterns by file type, feature area, and loading level to reduce token usage by 90%+.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file being worked on (used to detect context)',
            },
            level: {
              type: 'string',
              enum: ['critical', 'core', 'extended'],
              description: 'Loading level: critical (minimal), core (standard), extended (all)',
              default: 'core',
            },
            patternsDir: {
              type: 'string',
              description: 'Directory containing the patterns file',
              default: DEFAULT_PATTERNS_DIR,
            },
          },
          required: ['filePath'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'extract_patterns': {
      const { repoPath, outputDir, samplePercentage, maxFiles } =
        ExtractPatternsSchema.parse(args);

      const repoName = basename(repoPath);
      let patterns = createEmptyPatterns(repoPath, repoName);

      try {
        const pythonPatterns = await extractPythonPatterns(repoPath, {
          samplePercentage,
          maxFiles,
        });

        patterns = mergePatterns(patterns, {
          languages: { python: pythonPatterns },
        });
      } catch (error) {
        console.error('Python extraction failed:', error);
      }

      try {
        const tsPatterns = await extractTypeScriptPatterns(repoPath, {
          samplePercentage,
          maxFiles,
        });

        patterns = mergePatterns(patterns, {
          languages: { typescript: tsPatterns },
        });
      } catch (error) {
        console.error('TypeScript extraction failed:', error);
      }

      const pythonFiles = patterns.languages.python?.filesAnalyzed || 0;
      const tsFiles = patterns.languages.typescript?.filesAnalyzed || 0;
      patterns.metadata.analyzedFiles = pythonFiles + tsFiles;

      if (pythonFiles > tsFiles * 2) {
        patterns.primaryLanguage = 'python';
      } else if (tsFiles > pythonFiles * 2) {
        patterns.primaryLanguage = 'typescript';
      } else if (pythonFiles > 0 && tsFiles > 0) {
        patterns.primaryLanguage = 'mixed';
      } else {
        patterns.primaryLanguage = 'unknown';
      }

      const savedPath = await savePatterns(patterns, outputDir);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              repoName,
              savedPath,
              filesAnalyzed: patterns.metadata.analyzedFiles,
              primaryLanguage: patterns.primaryLanguage,
              overallConfidence: `${(patterns.overallConfidence * 100).toFixed(1)}%`,
              pythonPatterns: patterns.languages.python
                ? {
                    files: patterns.languages.python.filesAnalyzed,
                    confidence: `${(patterns.languages.python.confidence.overall * 100).toFixed(1)}%`,
                  }
                : null,
              typescriptPatterns: patterns.languages.typescript
                ? {
                    files: patterns.languages.typescript.filesAnalyzed,
                    confidence: `${(patterns.languages.typescript.confidence.overall * 100).toFixed(1)}%`,
                  }
                : null,
            }),
          },
        ],
      };
    }

    case 'load_patterns': {
      const { patternsDir } = LoadPatternsSchema.parse(args);
      const patterns = await loadPatterns(patternsDir);

      if (!patterns) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                message: 'No patterns file found. Run extract_patterns first.',
              }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              patterns,
            }),
          },
        ],
      };
    }

    case 'display_patterns': {
      const { patternsDir } = LoadPatternsSchema.parse(args);
      const patterns = await loadPatterns(patternsDir);

      if (!patterns) {
        return {
          content: [
            {
              type: 'text',
              text: 'No patterns file found. Run extract_patterns first.',
            },
          ],
        };
      }

      const display = formatPatternsForDisplay(patterns);

      return {
        content: [
          {
            type: 'text',
            text: display,
          },
        ],
      };
    }

    case 'load_patterns_progressive': {
      const { filePath, level, patternsDir } = LoadProgressiveSchema.parse(args);
      const loader = new ProgressiveLoader({ patternsDir });
      const result = await loader.loadForContext(filePath, level);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              filePath: result.context.filePath,
              detectedContext: {
                fileType: result.context.fileType,
                feature: result.context.feature,
                domain: result.context.domain,
              },
              loadingLevel: result.level,
              tokenCount: result.tokenCount,
              reductionPercentage: `${result.reductionPercentage.toFixed(1)}%`,
              loadTimeMs: result.loadTimeMs,
              patterns: result.patterns,
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Sage Context Optimizer MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
