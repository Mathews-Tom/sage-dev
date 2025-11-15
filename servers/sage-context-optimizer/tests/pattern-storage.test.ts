import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile } from 'fs/promises';
import { join } from 'path';
import { savePatterns, loadPatterns } from '../utils/pattern-storage.js';
import {
  RepositoryPatterns,
  createEmptyPatterns,
  mergePatterns,
} from '../schemas/repository-patterns.js';

const TEST_DIR = '/tmp/sage-pattern-storage-test';

describe('Pattern Storage', () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it('saves patterns as TypeScript file', async () => {
    const patterns = createTestPatterns();
    const filePath = await savePatterns(patterns, TEST_DIR);

    expect(filePath).toContain('repository-patterns.ts');

    const content = await readFile(filePath, 'utf-8');
    expect(content).toContain('REPOSITORY_PATTERNS');
    expect(content).toContain('export const');
    expect(content).toContain(patterns.metadata.name);
  });

  it('generates valid TypeScript syntax', async () => {
    const patterns = createTestPatterns();
    const filePath = await savePatterns(patterns, TEST_DIR);

    const content = await readFile(filePath, 'utf-8');
    expect(content).toContain('import type');
    expect(content).toContain('export const REPOSITORY_PATTERNS');
    expect(content).toContain('export default REPOSITORY_PATTERNS');
  });

  it('loads patterns from TypeScript file', async () => {
    const patterns = createTestPatterns();
    await savePatterns(patterns, TEST_DIR);

    const loaded = await loadPatterns(TEST_DIR);

    expect(loaded).not.toBeNull();
    expect(loaded?.metadata.name).toBe(patterns.metadata.name);
    expect(loaded?.primaryLanguage).toBe(patterns.primaryLanguage);
    expect(loaded?.overallConfidence).toBe(patterns.overallConfidence);
  });

  it('returns null for non-existent patterns file', async () => {
    const loaded = await loadPatterns(TEST_DIR);
    expect(loaded).toBeNull();
  });

  it('validates patterns on save', async () => {
    const invalidPatterns = {
      metadata: { name: 'test' },
    } as unknown as RepositoryPatterns;

    await expect(savePatterns(invalidPatterns, TEST_DIR)).rejects.toThrow();
  });

  it('validates patterns on load', async () => {
    const patterns = createTestPatterns();
    await savePatterns(patterns, TEST_DIR);

    const loaded = await loadPatterns(TEST_DIR);
    expect(loaded?.metadata).toBeDefined();
    expect(loaded?.languages).toBeDefined();
    expect(loaded?.overallConfidence).toBeGreaterThanOrEqual(0);
    expect(loaded?.overallConfidence).toBeLessThanOrEqual(1);
  });
});

describe('Pattern Merging', () => {
  it('merges patterns with higher confidence', () => {
    const base = createTestPatterns();
    base.overallConfidence = 0.5;

    const update = createTestPatterns();
    update.overallConfidence = 0.8;

    const merged = mergePatterns(base, update);
    expect(merged.overallConfidence).toBe(0.8);
  });

  it('preserves base patterns when update is empty', () => {
    const base = createTestPatterns();
    const merged = mergePatterns(base, {});

    expect(merged.metadata.name).toBe(base.metadata.name);
    expect(merged.primaryLanguage).toBe(base.primaryLanguage);
  });

  it('updates extractedAt timestamp on merge', async () => {
    const base = createTestPatterns();
    const oldTimestamp = base.metadata.extractedAt;

    await new Promise((resolve) => setTimeout(resolve, 10));

    const merged = mergePatterns(base, {});
    expect(merged.metadata.extractedAt).not.toBe(oldTimestamp);
  });

  it('creates empty patterns correctly', () => {
    const patterns = createEmptyPatterns('/test/repo', 'test-repo');

    expect(patterns.metadata.name).toBe('test-repo');
    expect(patterns.metadata.path).toBe('/test/repo');
    expect(patterns.overallConfidence).toBe(0);
    expect(patterns.primaryLanguage).toBe('unknown');
    expect(patterns.languages).toEqual({});
  });
});

function createTestPatterns(): RepositoryPatterns {
  return {
    metadata: {
      name: 'test-repository',
      path: '/test/path',
      extractedAt: new Date().toISOString(),
      totalFiles: 100,
      analyzedFiles: 50,
      samplingRate: 50,
    },
    languages: {
      python: {
        language: 'python',
        extractedAt: new Date().toISOString(),
        filesAnalyzed: 25,
        totalFiles: 50,
        samplingRate: 50,
        naming: {
          functions: { pattern: 'snake_case', count: 100, percentage: 95 },
          classes: { pattern: 'PascalCase', count: 20, percentage: 100 },
          constants: { pattern: 'UPPER_SNAKE_CASE', count: 10, percentage: 90 },
          variables: { pattern: 'snake_case', count: 200, percentage: 85 },
        },
        types: {
          unionSyntax: 'pipe',
          genericsSyntax: 'builtin',
          typeHintCoverage: 75,
          commonTypes: ['str', 'int', 'bool'],
        },
        testing: {
          framework: 'pytest',
          fileNaming: 'test_prefix',
          fixtureUsage: true,
          mockPatterns: ['unittest.mock'],
          coverageIntegration: true,
        },
        errorHandling: {
          tryExceptUsage: 60,
          commonExceptions: ['ValueError', 'TypeError'],
          customExceptions: ['CustomError'],
          loggingFramework: 'logging',
          errorPropagation: 'raise',
        },
        confidence: {
          overall: 0.8,
          naming: 0.9,
          types: 0.75,
          testing: 0.8,
          errorHandling: 0.6,
        },
      },
    },
    overallConfidence: 0.8,
    primaryLanguage: 'python',
  };
}
