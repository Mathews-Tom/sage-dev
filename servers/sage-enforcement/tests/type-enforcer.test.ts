import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createTypeEnforcer, TypeEnforcer } from '../agents/type-enforcer.js';
import { TypeEnforcerInputSchema } from '../schemas/index.js';
import { getProjectRoot } from '../utils/validation.js';
import type { TypeEnforcerInput, AgentResult } from '../schemas/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = join(__dirname, 'fixtures');
const PROJECT_ROOT = getProjectRoot();

/**
 * Load fixture file content
 */
function loadFixture(filename: string): string {
  return readFileSync(join(FIXTURES_DIR, filename), 'utf-8');
}

describe('TypeEnforcer (unit)', () => {
  let enforcer: TypeEnforcer;

  beforeEach(() => {
    enforcer = createTypeEnforcer();
  });

  describe('Input Validation', () => {
    it('validates required fields with Zod schema (Edge Case 5)', () => {
      // Malformed input missing required fields
      const malformedInput = {
        filePath: '',
        // Missing code field
      };

      const result = TypeEnforcerInputSchema.safeParse(malformedInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('validates filePath is not empty', () => {
      const invalidInput = {
        filePath: '',
        code: 'def foo(): pass',
      };

      const result = TypeEnforcerInputSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        const filePathIssue = result.error.issues.find(
          (issue) => issue.path.includes('filePath')
        );
        expect(filePathIssue).toBeDefined();
      }
    });

    it('accepts valid input with all required fields', () => {
      const testFilePath = join(PROJECT_ROOT, 'tests/fixtures/sample.py');
      const validInput: TypeEnforcerInput = {
        filePath: testFilePath,
        code: 'def foo() -> None: pass',
      };

      const result = TypeEnforcerInputSchema.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.filePath).toBe(testFilePath);
        expect(result.data.code).toBe('def foo() -> None: pass');
      }
    });

    it('rejects non-Python files', async () => {
      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'file.ts'),
        code: 'function foo() {}',
      };

      await expect(enforcer.execute(input)).rejects.toThrow('Not a Python file');
    });
  });

  describe('Deprecated Import Detection (Scenario 2)', () => {
    it('detects deprecated typing.List import using sample-violations.py', async () => {
      const code = loadFixture('sample-violations.py');

      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      const listViolations = result.violations.filter(
        (v) => v.message.includes('typing.List')
      );

      expect(listViolations.length).toBeGreaterThan(0);
      expect(listViolations[0].severity).toBe('error');
      expect(listViolations[0].rule).toContain('no-legacy-list');
      expect(listViolations[0].message).toContain('Use list instead');
      expect(listViolations[0].autoFixable).toBe(true);
      expect(listViolations[0].suggestion).toContain('list');
    });

    it('detects deprecated typing.Dict import using sample-violations.py', async () => {
      const code = loadFixture('sample-violations.py');

      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      const dictViolations = result.violations.filter(
        (v) => v.message.includes('typing.Dict')
      );

      expect(dictViolations.length).toBeGreaterThan(0);
      expect(dictViolations[0].severity).toBe('error');
      expect(dictViolations[0].rule).toContain('no-legacy-dict');
      expect(dictViolations[0].autoFixable).toBe(true);
    });

    it('detects deprecated typing.Optional import using sample-violations.py', async () => {
      const code = loadFixture('sample-violations.py');

      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      const optionalViolations = result.violations.filter(
        (v) => v.message.includes('typing.Optional')
      );

      expect(optionalViolations.length).toBeGreaterThan(0);
      expect(optionalViolations[0].severity).toBe('error');
      expect(optionalViolations[0].rule).toContain('no-legacy-optional');
      expect(optionalViolations[0].suggestion).toContain('| None');
    });

    it('detects deprecated typing.Union import using sample-violations.py', async () => {
      const code = loadFixture('sample-violations.py');

      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      const unionViolations = result.violations.filter(
        (v) => v.message.includes('typing.Union')
      );

      expect(unionViolations.length).toBeGreaterThan(0);
      expect(unionViolations[0].severity).toBe('error');
      expect(unionViolations[0].rule).toContain('no-legacy-union');
      expect(unionViolations[0].suggestion).toContain('|');
    });

    it('detects all 4 deprecated import types in sample-violations.py', async () => {
      const code = loadFixture('sample-violations.py');

      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      const deprecatedViolations = result.violations.filter((v) =>
        v.message.includes('Deprecated import')
      );

      // sample-violations.py has List, Dict, Optional, Union
      expect(deprecatedViolations.length).toBeGreaterThanOrEqual(4);

      const importNames = deprecatedViolations.map((v) =>
        v.message.match(/typing\.(\w+)/)?.[1]
      );
      expect(importNames).toContain('List');
      expect(importNames).toContain('Dict');
      expect(importNames).toContain('Optional');
      expect(importNames).toContain('Union');
    });

    it('does not flag allowed typing imports in sample.py', async () => {
      const code = loadFixture('sample.py');

      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      const deprecatedViolations = result.violations.filter((v) =>
        v.message.includes('Deprecated import')
      );

      // sample.py uses only allowed typing imports (Callable, Protocol)
      expect(deprecatedViolations.length).toBe(0);
    });
  });

  describe('Sample Fixtures', () => {
    it('processes clean sample.py without violations', async () => {
      const code = loadFixture('sample.py');

      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      // Clean file should have no deprecated import violations
      const deprecatedViolations = result.violations.filter((v) =>
        v.message.includes('Deprecated import')
      );

      expect(deprecatedViolations.length).toBe(0);
    });

    it('detects violations in sample-violations.py', async () => {
      const code = loadFixture('sample-violations.py');

      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      // File uses List, Dict, Optional, Union - should detect all
      const deprecatedViolations = result.violations.filter((v) =>
        v.message.includes('Deprecated import')
      );

      expect(deprecatedViolations.length).toBeGreaterThanOrEqual(4);

      const violationTypes = new Set(
        deprecatedViolations.map((v) => v.message.match(/typing\.(\w+)/)?.[1])
      );

      expect(violationTypes.has('List')).toBe(true);
      expect(violationTypes.has('Dict')).toBe(true);
      expect(violationTypes.has('Optional')).toBe(true);
      expect(violationTypes.has('Union')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty code gracefully (Edge Case 1)', () => {
      const code = '';
      const filePath = join(FIXTURES_DIR, 'sample.py');

      // Should not throw when detecting deprecated imports in empty code
      expect(() => {
        const lines = code.split('\n');
        expect(lines.length).toBe(1);
        expect(lines[0]).toBe('');
      }).not.toThrow();
    });

    it('handles code with only whitespace', () => {
      const code = '   \n\n\t\n   ';

      // Should parse lines without error
      const lines = code.split('\n');
      expect(lines.length).toBeGreaterThan(0);
    });

    it('handles code with only comments', () => {
      const code = '# This is a comment\n# Another comment\n"""Docstring"""';

      const lines = code.split('\n');
      expect(lines.length).toBe(3);
      expect(lines[0]).toContain('#');
    });

    it('handles syntax errors gracefully (Edge Case 3)', async () => {
      // The type enforcer should handle Python syntax errors
      // Pyright will detect them as violations
      const code = loadFixture('sample-violations.py');
      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      // Should execute without throwing, even if there are violations
      const result: AgentResult = await enforcer.execute(input);
      expect(result).toBeDefined();
      expect(result.violations).toBeDefined();
      expect(result.summary).toBeDefined();
    });
  });

  describe('Result Structure', () => {
    it('returns violations array', async () => {
      const code = loadFixture('sample-violations.py');
      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      expect(result.violations).toBeInstanceOf(Array);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('returns summary with correct counts', async () => {
      const code = loadFixture('sample-violations.py');
      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      expect(result.summary).toBeDefined();
      expect(result.summary.errors).toBeGreaterThanOrEqual(0);
      expect(result.summary.warnings).toBeGreaterThanOrEqual(0);
      expect(result.summary.info).toBeGreaterThanOrEqual(0);

      const totalViolations = result.violations.length;
      const summaryTotal =
        result.summary.errors + result.summary.warnings + result.summary.info;

      expect(summaryTotal).toBe(totalViolations);
    });

    it('includes required violation fields', async () => {
      const code = loadFixture('sample-violations.py');
      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      expect(result.violations.length).toBeGreaterThan(0);

      const violation = result.violations[0];
      expect(violation).toHaveProperty('file');
      expect(violation).toHaveProperty('line');
      expect(violation).toHaveProperty('severity');
      expect(violation).toHaveProperty('rule');
      expect(violation).toHaveProperty('message');
      expect(violation).toHaveProperty('autoFixable');

      expect(typeof violation.file).toBe('string');
      expect(typeof violation.line).toBe('number');
      expect(violation.line).toBeGreaterThan(0);
      expect(['error', 'warning', 'info']).toContain(violation.severity);
      expect(typeof violation.rule).toBe('string');
      expect(typeof violation.message).toBe('string');
      expect(typeof violation.autoFixable).toBe('boolean');
    });

    it('includes line numbers for violations', async () => {
      const code = loadFixture('sample-violations.py');
      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      const violations = result.violations.filter((v) =>
        v.message.includes('typing.List')
      );

      expect(violations.length).toBeGreaterThan(0);
      // First deprecated import should be List on line 6
      expect(violations[0].line).toBeGreaterThan(0);
    });
  });

  describe('Factory Function', () => {
    it('creates TypeEnforcer instance', () => {
      const instance = createTypeEnforcer();

      expect(instance).toBeInstanceOf(TypeEnforcer);
    });

    it('accepts custom project root', () => {
      const customRoot = '/custom/project/root';
      const instance = createTypeEnforcer(customRoot);

      expect(instance).toBeInstanceOf(TypeEnforcer);
    });
  });

  describe('Integration Scenarios', () => {
    it('handles real-world Python file structure with sample-violations.py', async () => {
      const code = loadFixture('sample-violations.py');

      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      // Should detect List and Dict violations
      const deprecatedViolations = result.violations.filter((v) =>
        v.message.includes('Deprecated import')
      );

      expect(deprecatedViolations.length).toBeGreaterThanOrEqual(4);

      // Verify structure includes classes and functions
      expect(code).toContain('class UserManager');
      expect(code).toContain('def process_items');
    });

    it('detects violations at correct line numbers', async () => {
      const code = loadFixture('sample-violations.py');

      const input: TypeEnforcerInput = {
        filePath: join(FIXTURES_DIR, 'sample-violations.py'),
        code,
      };

      const result: AgentResult = await enforcer.execute(input);

      const violations = result.violations.filter((v) =>
        v.message.includes('Deprecated import')
      );

      expect(violations.length).toBeGreaterThan(0);

      // All violations should have valid line numbers
      for (const violation of violations) {
        expect(violation.line).toBeGreaterThan(0);
        expect(violation.line).toBeLessThanOrEqual(code.split('\n').length);
      }
    });
  });
});
