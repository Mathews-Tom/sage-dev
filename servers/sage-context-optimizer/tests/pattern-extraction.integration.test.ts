import { describe, it, expect, beforeAll } from 'vitest';
import { extractPythonPatterns } from '../pattern-extractor-python.js';
import { extractTypeScriptPatterns } from '../pattern-extractor-typescript.js';
import { savePatterns, loadPatterns } from '../utils/pattern-storage.js';
import {
  RepositoryPatterns,
  createEmptyPatterns,
} from '../schemas/repository-patterns.js';
import { mkdir, rm } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_OUTPUT_DIR = '/tmp/sage-pattern-extraction-test';
const SAGE_DEV_ROOT = join(__dirname, '..', '..', '..');

describe('Pattern Extraction Integration', () => {
  beforeAll(async () => {
    await mkdir(TEST_OUTPUT_DIR, { recursive: true });
  });

  describe('TypeScript Pattern Extraction', () => {
    it('extracts patterns from sage-dev codebase', async () => {
      const patterns = await extractTypeScriptPatterns(SAGE_DEV_ROOT, {
        samplePercentage: 25,
        maxFiles: 100,
      });

      expect(patterns.language).toBe('typescript');
      expect(patterns.filesAnalyzed).toBeGreaterThan(0);
      expect(patterns.confidence.overall).toBeGreaterThan(0);

      console.log('TypeScript Extraction Results:');
      console.log(`  Files analyzed: ${patterns.filesAnalyzed}`);
      console.log(`  Functions found: ${patterns.naming.functions.count}`);
      console.log(`  Classes found: ${patterns.naming.classes.count}`);
      console.log(`  Interfaces found: ${patterns.naming.interfaces.count}`);
      console.log(`  Module system: ${patterns.architecture.moduleSystem}`);
      console.log(`  Test framework: ${patterns.testing.framework}`);
      console.log(`  Overall confidence: ${(patterns.confidence.overall * 100).toFixed(1)}%`);
    }, 60000);

    it('detects naming conventions correctly', async () => {
      const patterns = await extractTypeScriptPatterns(SAGE_DEV_ROOT, {
        samplePercentage: 10,
        maxFiles: 50,
      });

      expect(patterns.naming.functions.pattern).toBe('camelCase');
      expect(patterns.naming.classes.pattern).toBe('PascalCase');
    }, 30000);

    it('identifies test framework', async () => {
      const patterns = await extractTypeScriptPatterns(SAGE_DEV_ROOT, {
        samplePercentage: 10,
        maxFiles: 50,
      });

      expect(['vitest', 'jest', 'mocha']).toContain(patterns.testing.framework);
    }, 30000);
  });

  describe('End-to-End Pattern Storage', () => {
    it('saves and loads extracted patterns', async () => {
      const tsPatterns = await extractTypeScriptPatterns(SAGE_DEV_ROOT, {
        samplePercentage: 10,
        maxFiles: 50,
      });

      const repoPatterns: RepositoryPatterns = {
        metadata: {
          name: 'sage-dev',
          path: SAGE_DEV_ROOT,
          extractedAt: new Date().toISOString(),
          totalFiles: tsPatterns.totalFiles,
          analyzedFiles: tsPatterns.filesAnalyzed,
          samplingRate: tsPatterns.samplingRate,
        },
        languages: {
          typescript: tsPatterns,
        },
        overallConfidence: tsPatterns.confidence.overall,
        primaryLanguage: 'typescript',
      };

      const filePath = await savePatterns(repoPatterns, TEST_OUTPUT_DIR);
      expect(filePath).toContain('repository-patterns.ts');

      const loaded = await loadPatterns(TEST_OUTPUT_DIR);
      expect(loaded).not.toBeNull();
      expect(loaded?.metadata.name).toBe('sage-dev');
      expect(loaded?.languages.typescript).toBeDefined();
    }, 60000);
  });

  describe('Performance Benchmarks', () => {
    it('extracts TypeScript patterns in reasonable time', async () => {
      const startTime = Date.now();

      await extractTypeScriptPatterns(SAGE_DEV_ROOT, {
        samplePercentage: 50,
        maxFiles: 500,
      });

      const elapsed = Date.now() - startTime;
      console.log(`TypeScript extraction time: ${elapsed}ms`);

      expect(elapsed).toBeLessThan(120000);
    }, 120000);
  });

  describe('Confidence Scoring', () => {
    it('assigns confidence scores based on consistency', async () => {
      const patterns = await extractTypeScriptPatterns(SAGE_DEV_ROOT, {
        samplePercentage: 25,
        maxFiles: 100,
      });

      expect(patterns.confidence.naming).toBeGreaterThanOrEqual(0);
      expect(patterns.confidence.naming).toBeLessThanOrEqual(1);

      expect(patterns.confidence.types).toBeGreaterThanOrEqual(0);
      expect(patterns.confidence.types).toBeLessThanOrEqual(1);

      expect(patterns.confidence.testing).toBeGreaterThanOrEqual(0);
      expect(patterns.confidence.testing).toBeLessThanOrEqual(1);

      expect(patterns.confidence.architecture).toBeGreaterThanOrEqual(0);
      expect(patterns.confidence.architecture).toBeLessThanOrEqual(1);

      console.log('Confidence Scores:');
      console.log(`  Naming: ${(patterns.confidence.naming * 100).toFixed(1)}%`);
      console.log(`  Types: ${(patterns.confidence.types * 100).toFixed(1)}%`);
      console.log(`  Testing: ${(patterns.confidence.testing * 100).toFixed(1)}%`);
      console.log(`  Architecture: ${(patterns.confidence.architecture * 100).toFixed(1)}%`);
      console.log(`  Overall: ${(patterns.confidence.overall * 100).toFixed(1)}%`);
    }, 60000);
  });
});
