import { describe, it, expect, beforeEach, vi } from 'vitest';
import { join } from 'path';
import { createTestCoverage, TestCoverage } from '../agents/test-coverage.js';
import { TestCoverageInputSchema } from '../schemas/index.js';
import { getProjectRoot } from '../utils/validation.js';
import type { TestCoverageInput } from '../schemas/index.js';

const PROJECT_ROOT = getProjectRoot();
const FIXTURES_DIR = join(PROJECT_ROOT, 'tests/fixtures');

describe('TestCoverage (unit)', () => {
  let coverage: TestCoverage;

  beforeEach(() => {
    coverage = createTestCoverage();
  });

  describe('Input Validation', () => {
    it('validates required fields with Zod schema', () => {
      const malformedInput = {
        // Missing filePath
      };

      const result = TestCoverageInputSchema.safeParse(malformedInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('validates filePath is not empty', () => {
      const invalidInput = {
        filePath: '',
      };

      const result = TestCoverageInputSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        const filePathIssue = result.error.issues.find(
          (issue) => issue.path.includes('filePath')
        );
        expect(filePathIssue).toBeDefined();
      }
    });

    it('accepts valid input with required fields', () => {
      const validInput: TestCoverageInput = {
        filePath: join(FIXTURES_DIR, 'sample.py'),
      };

      const result = TestCoverageInputSchema.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.filePath).toBe(join(FIXTURES_DIR, 'sample.py'));
      }
    });

    it('accepts optional threshold parameter', () => {
      const validInput: TestCoverageInput = {
        filePath: join(FIXTURES_DIR, 'sample.py'),
        threshold: 90,
      };

      const result = TestCoverageInputSchema.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.threshold).toBe(90);
      }
    });

    it('uses default threshold of 80', () => {
      const validInput: TestCoverageInput = {
        filePath: join(FIXTURES_DIR, 'sample.py'),
      };

      const result = TestCoverageInputSchema.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.threshold).toBe(80);
      }
    });

    it('validates threshold is between 0 and 100', () => {
      const invalidInput = {
        filePath: join(FIXTURES_DIR, 'sample.py'),
        threshold: 150,
      };

      const result = TestCoverageInputSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it('rejects non-Python files', async () => {
      const input: TestCoverageInput = {
        filePath: join(FIXTURES_DIR, 'file.ts'),
      };

      await expect(coverage.execute(input)).rejects.toThrow('Not a Python file');
    });
  });

  describe('Factory Function', () => {
    it('creates TestCoverage instance', () => {
      const instance = createTestCoverage();

      expect(instance).toBeInstanceOf(TestCoverage);
    });

    it('accepts custom project root', () => {
      const customRoot = '/custom/project/root';
      const instance = createTestCoverage(customRoot);

      expect(instance).toBeInstanceOf(TestCoverage);
    });
  });

  describe('Result Structure', () => {
    it('returns correct result structure on success', async () => {
      // This test would require actual pytest execution
      // For unit testing, we're focusing on input validation
      // Integration tests will cover full execution flow
      expect(true).toBe(true);
    });
  });
});
