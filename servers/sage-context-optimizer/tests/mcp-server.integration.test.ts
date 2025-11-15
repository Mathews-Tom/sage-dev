import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { extractPythonPatterns } from '../pattern-extractor-python.js';
import { extractTypeScriptPatterns } from '../pattern-extractor-typescript.js';
import { savePatterns, loadPatterns } from '../utils/pattern-storage.js';
import { createEmptyPatterns, mergePatterns } from '../schemas/repository-patterns.js';
import { ProgressiveLoader } from '../progressive-loader.js';
import { basename, join } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';

const TEST_PATTERNS_DIR = '/tmp/sage-mcp-test-patterns';
const TEST_REPO_DIR = '/tmp/sage-mcp-test-repo';

describe('MCP Server Integration', () => {
  beforeAll(async () => {
    await mkdir(TEST_PATTERNS_DIR, { recursive: true });
    await mkdir(join(TEST_REPO_DIR, 'src', 'auth'), { recursive: true });
    await mkdir(join(TEST_REPO_DIR, 'src', 'api'), { recursive: true });

    await writeFile(
      join(TEST_REPO_DIR, 'src', 'auth', 'service.ts'),
      `
export class AuthService {
  private readonly tokenExpiry: number;

  constructor() {
    this.tokenExpiry = 3600;
  }

  async validateToken(token: string): Promise<boolean> {
    if (!token) {
      throw new Error('Token required');
    }
    return token.length > 0;
  }
}
`
    );

    await writeFile(
      join(TEST_REPO_DIR, 'src', 'api', 'handler.ts'),
      `
import { AuthService } from '../auth/service.js';

export async function handleRequest(req: Request): Promise<Response> {
  const authService = new AuthService();
  const token = req.headers.get('Authorization');

  if (!token) {
    throw new Error('Unauthorized');
  }

  await authService.validateToken(token);
  return new Response('OK');
}
`
    );

    await writeFile(
      join(TEST_REPO_DIR, 'src', 'utils.py'),
      `
def calculate_hash(data: str) -> str:
    if not data:
        raise ValueError("Data required")
    return hash(data)

class DataProcessor:
    def __init__(self) -> None:
        self.processed_count = 0

    def process(self, item: dict[str, str]) -> None:
        if not item:
            raise ValueError("Item required")
        self.processed_count += 1
`
    );
  });

  afterAll(async () => {
    await rm(TEST_PATTERNS_DIR, { recursive: true, force: true });
    await rm(TEST_REPO_DIR, { recursive: true, force: true });
  });

  describe('Pattern Extraction Flow', () => {
    it('extracts TypeScript patterns from test repository', async () => {
      const patterns = await extractTypeScriptPatterns(TEST_REPO_DIR, {
        samplePercentage: 100,
        maxFiles: 10,
      });

      expect(patterns.filesAnalyzed).toBe(2);
      expect(patterns.naming.functions).toBeDefined();
      expect(patterns.naming.classes).toBeDefined();
      expect(patterns.confidence.overall).toBeGreaterThan(0);
    });

    it('extracts Python patterns from test repository', async () => {
      const patterns = await extractPythonPatterns(TEST_REPO_DIR, {
        samplePercentage: 100,
        maxFiles: 10,
      });

      expect(patterns.filesAnalyzed).toBe(1);
      expect(patterns.naming.functions).toBeDefined();
      expect(patterns.confidence.overall).toBeGreaterThan(0);
    });

    it('merges patterns and saves to disk', async () => {
      const repoName = basename(TEST_REPO_DIR);
      let patterns = createEmptyPatterns(TEST_REPO_DIR, repoName);

      const pythonPatterns = await extractPythonPatterns(TEST_REPO_DIR, {
        samplePercentage: 100,
        maxFiles: 10,
      });
      patterns = mergePatterns(patterns, { languages: { python: pythonPatterns } });

      const tsPatterns = await extractTypeScriptPatterns(TEST_REPO_DIR, {
        samplePercentage: 100,
        maxFiles: 10,
      });
      patterns = mergePatterns(patterns, { languages: { typescript: tsPatterns } });

      patterns.metadata.analyzedFiles = pythonPatterns.filesAnalyzed + tsPatterns.filesAnalyzed;
      patterns.primaryLanguage = 'typescript';

      const savedPath = await savePatterns(patterns, TEST_PATTERNS_DIR);
      expect(savedPath).toContain('patterns.ts');

      const loaded = await loadPatterns(TEST_PATTERNS_DIR);
      expect(loaded).not.toBeNull();
      expect(loaded?.metadata.name).toBe(repoName);
      expect(loaded?.languages.python).toBeDefined();
      expect(loaded?.languages.typescript).toBeDefined();
    });
  });

  describe('Progressive Loading Flow', () => {
    it('loads patterns for TypeScript auth context', async () => {
      const loader = new ProgressiveLoader({ patternsDir: TEST_PATTERNS_DIR });
      const result = await loader.loadForContext('/src/auth/service.ts', 'core');

      expect(result.context.fileType).toBe('typescript');
      expect(result.context.feature).toBe('auth');
      expect(result.context.domain).toBe('backend');
      expect(result.level).toBe('core');
      expect(result.patterns.languages.typescript).toBeDefined();
      expect(result.reductionPercentage).toBeGreaterThan(0);
    });

    it('loads patterns for Python context', async () => {
      const loader = new ProgressiveLoader({ patternsDir: TEST_PATTERNS_DIR });
      const result = await loader.loadForContext('/src/utils.py', 'extended');

      expect(result.context.fileType).toBe('python');
      expect(result.patterns.languages.python).toBeDefined();
    });

    it('applies loading level restrictions', async () => {
      const loader = new ProgressiveLoader({ patternsDir: TEST_PATTERNS_DIR });

      const critical = await loader.loadForContext('/src/file.ts', 'critical');
      const extended = await loader.loadForContext('/src/file.ts', 'extended');

      expect(critical.tokenCount).toBeLessThan(extended.tokenCount);
    });

    it('suggests appropriate loading level based on token budget', async () => {
      const loader = new ProgressiveLoader({ patternsDir: TEST_PATTERNS_DIR });

      expect(loader.suggestLevel(2000)).toBe('critical');
      expect(loader.suggestLevel(8000)).toBe('core');
      expect(loader.suggestLevel(25000)).toBe('extended');
    });
  });

  describe('MCP Tool Schema Validation', () => {
    const ExtractPatternsSchema = z.object({
      repoPath: z.string(),
      outputDir: z.string().default('.sage/agent/examples'),
      samplePercentage: z.number().min(1).max(100).default(50),
      maxFiles: z.number().min(1).max(10000).default(1000),
    });

    const LoadProgressiveSchema = z.object({
      filePath: z.string(),
      level: z.enum(['critical', 'core', 'extended']).default('core'),
      patternsDir: z.string().default('.sage/agent/examples'),
    });

    it('validates extract_patterns arguments', () => {
      const valid = ExtractPatternsSchema.safeParse({
        repoPath: '/path/to/repo',
        samplePercentage: 75,
      });
      expect(valid.success).toBe(true);

      const invalid = ExtractPatternsSchema.safeParse({
        samplePercentage: 150,
      });
      expect(invalid.success).toBe(false);
    });

    it('validates load_patterns_progressive arguments', () => {
      const valid = LoadProgressiveSchema.safeParse({
        filePath: '/src/auth/service.ts',
        level: 'core',
      });
      expect(valid.success).toBe(true);

      const invalid = LoadProgressiveSchema.safeParse({
        filePath: '/src/file.ts',
        level: 'invalid',
      });
      expect(invalid.success).toBe(false);
    });

    it('applies defaults correctly', () => {
      const result = LoadProgressiveSchema.parse({
        filePath: '/src/file.ts',
      });
      expect(result.level).toBe('core');
      expect(result.patternsDir).toBe('.sage/agent/examples');
    });
  });

  describe('End-to-End Token Reduction', () => {
    it('achieves significant token reduction', async () => {
      const loader = new ProgressiveLoader({ patternsDir: TEST_PATTERNS_DIR });

      const fullPatterns = await loadPatterns(TEST_PATTERNS_DIR);
      expect(fullPatterns).not.toBeNull();

      const critical = await loader.loadForContext('/src/auth/service.ts', 'critical');
      const core = await loader.loadForContext('/src/auth/service.ts', 'core');
      const extended = await loader.loadForContext('/src/auth/service.ts', 'extended');

      expect(critical.reductionPercentage).toBeGreaterThan(extended.reductionPercentage);
      expect(core.reductionPercentage).toBeGreaterThan(extended.reductionPercentage);

      console.log('\nToken Reduction Results:');
      console.log(`  Critical: ${critical.reductionPercentage.toFixed(1)}% (${critical.tokenCount} tokens)`);
      console.log(`  Core: ${core.reductionPercentage.toFixed(1)}% (${core.tokenCount} tokens)`);
      console.log(`  Extended: ${extended.reductionPercentage.toFixed(1)}% (${extended.tokenCount} tokens)`);
    });

    it('maintains pattern quality after filtering', async () => {
      const loader = new ProgressiveLoader({ patternsDir: TEST_PATTERNS_DIR });
      const result = await loader.loadForContext('/src/auth/service.ts', 'core');

      expect(result.patterns.languages.typescript).toBeDefined();
      const tsPatterns = result.patterns.languages.typescript;

      if (tsPatterns) {
        expect(tsPatterns.filesAnalyzed).toBeGreaterThan(0);
        expect(tsPatterns.confidence).toBeDefined();
        expect(tsPatterns.confidence.overall).toBeGreaterThan(0);
      }
    });
  });
});
