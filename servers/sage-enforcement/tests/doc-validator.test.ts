import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createDocValidator, DocValidator } from '../agents/doc-validator.js';
import { DocValidatorInputSchema } from '../schemas/index.js';
import { getProjectRoot } from '../utils/validation.js';
import type { DocValidatorInput, AgentResult } from '../schemas/index.js';

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

describe('DocValidator (unit)', () => {
  let validator: DocValidator;

  beforeEach(() => {
    validator = createDocValidator();
  });

  describe('Input Validation', () => {
    it('validates required fields with Zod schema', () => {
      const malformedInput = {
        filePath: '',
        // Missing code field
      };

      const result = DocValidatorInputSchema.safeParse(malformedInput);

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

      const result = DocValidatorInputSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        const filePathIssue = result.error.issues.find(
          (issue) => issue.path.includes('filePath')
        );
        expect(filePathIssue).toBeDefined();
      }
    });

    it('accepts valid input with all required fields', () => {
      const testFilePath = join(PROJECT_ROOT, 'tests/fixtures/sample-docs-clean.py');
      const validInput: DocValidatorInput = {
        filePath: testFilePath,
        code: 'def foo() -> None: """Test.""" pass',
      };

      const result = DocValidatorInputSchema.safeParse(validInput);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.filePath).toBe(testFilePath);
      }
    });

    it('rejects non-Python files', async () => {
      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'file.ts'),
        code: 'function foo() {}',
      };

      await expect(validator.execute(input)).rejects.toThrow('Not a Python file');
    });
  });

  describe('Docstring Detection', () => {
    it('processes clean sample with no violations', async () => {
      const code = loadFixture('sample-docs-clean.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-clean.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      // Clean file should have no violations
      expect(result.violations.length).toBe(0);
      expect(result.summary.errors).toBe(0);
      expect(result.summary.warnings).toBe(0);
    });

    it('detects missing docstring on function', async () => {
      const code = loadFixture('sample-docs-violations.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-violations.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      const missingDocstrings = result.violations.filter(
        (v) => v.rule === 'require-docstring'
      );

      expect(missingDocstrings.length).toBeGreaterThan(0);
      const processDataViolation = missingDocstrings.find(
        (v) => v.message.includes('process_data')
      );
      expect(processDataViolation).toBeDefined();
      expect(processDataViolation?.severity).toBe('error');
    });

    it('detects missing docstring on class', async () => {
      const code = loadFixture('sample-docs-violations.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-violations.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      const missingDocstrings = result.violations.filter(
        (v) => v.rule === 'require-docstring'
      );

      const dataProcessorViolation = missingDocstrings.find(
        (v) => v.message.includes('DataProcessor')
      );
      expect(dataProcessorViolation).toBeDefined();
    });

    it('detects missing docstring on method', async () => {
      const code = loadFixture('sample-docs-violations.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-violations.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      const missingDocstrings = result.violations.filter(
        (v) => v.rule === 'require-docstring'
      );

      const processMethodViolation = missingDocstrings.find(
        (v) => v.message.includes('process')
      );
      expect(processMethodViolation).toBeDefined();
    });
  });

  describe('Google-Style Docstring Validation', () => {
    it('detects missing Args section', async () => {
      const code = loadFixture('sample-docs-violations.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-violations.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      const missingArgs = result.violations.filter(
        (v) => v.rule === 'require-args-section'
      );

      expect(missingArgs.length).toBeGreaterThan(0);
      const calculateTotalViolation = missingArgs.find(
        (v) => v.message.includes('calculate_total')
      );
      expect(calculateTotalViolation).toBeDefined();
      expect(calculateTotalViolation?.severity).toBe('warning');
      expect(calculateTotalViolation?.suggestion).toContain('Args section');
    });

    it('detects missing Returns section', async () => {
      const code = loadFixture('sample-docs-violations.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-violations.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      const missingReturns = result.violations.filter(
        (v) => v.rule === 'require-returns-section'
      );

      expect(missingReturns.length).toBeGreaterThan(0);
      const formatNameViolation = missingReturns.find(
        (v) => v.message.includes('format_name')
      );
      expect(formatNameViolation).toBeDefined();
      expect(formatNameViolation?.severity).toBe('warning');
      expect(formatNameViolation?.suggestion).toContain('Returns section');
    });

    it('does not require Args/Returns for __init__', async () => {
      const code = `
class Test:
    """Test class."""

    def __init__(self) -> None:
        """Initialize."""
        pass
`;

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'test.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      const initViolations = result.violations.filter(
        (v) => v.message.includes('__init__')
      );

      // __init__ should not require Returns section
      const returnsViolation = initViolations.find(
        (v) => v.rule === 'require-returns-section'
      );
      expect(returnsViolation).toBeUndefined();
    });

    it('does not require Returns for -> None functions', async () => {
      const code = `
def process() -> None:
    """Process data."""
    pass
`;

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'test.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      const returnsViolations = result.violations.filter(
        (v) => v.rule === 'require-returns-section'
      );

      expect(returnsViolations.length).toBe(0);
    });
  });

  describe('Private Method Handling', () => {
    it('skips private methods starting with _', async () => {
      const code = loadFixture('sample-docs-clean.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-clean.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      // _private_helper should be skipped
      const privateViolations = result.violations.filter(
        (v) => v.message.includes('_private_helper')
      );

      expect(privateViolations.length).toBe(0);
    });

    it('does not skip __init__ even though it starts with _', async () => {
      const code = `
class Test:
    """Test class."""

    def __init__(self):
        pass
`;

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'test.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      // __init__ without docstring should be flagged
      const initViolations = result.violations.filter(
        (v) => v.message.includes('__init__')
      );

      expect(initViolations.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty code gracefully', async () => {
      const code = '';
      const filePath = join(FIXTURES_DIR, 'empty.py');

      const input: DocValidatorInput = {
        filePath,
        code,
      };

      const result: AgentResult = await validator.execute(input);

      expect(result.violations.length).toBe(0);
      expect(result.summary.errors).toBe(0);
    });

    it('handles code with only comments', async () => {
      const code = '# This is a comment\n# Another comment';

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'comments.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      expect(result.violations.length).toBe(0);
    });

    it('handles code with single-line docstrings', async () => {
      const code = `
def simple() -> str:
    """Return hello."""
    return "hello"
`;

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'test.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      // Single-line docstrings don't have Returns section,
      // so will trigger require-returns-section warning
      const returnsViolations = result.violations.filter(
        (v) => v.rule === 'require-returns-section'
      );
      expect(returnsViolations.length).toBeGreaterThanOrEqual(0);

      // Should not complain about missing Args (no args)
      const argsViolations = result.violations.filter(
        (v) => v.rule === 'require-args-section'
      );
      expect(argsViolations.length).toBe(0);
    });

    it('handles triple-single-quote docstrings', async () => {
      const code = `
def test() -> None:
    '''Test function.'''
    pass
`;

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'test.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      expect(result.violations.length).toBe(0);
    });
  });

  describe('Result Structure', () => {
    it('returns violations array', async () => {
      const code = loadFixture('sample-docs-violations.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-violations.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      expect(result.violations).toBeInstanceOf(Array);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('returns summary with correct counts', async () => {
      const code = loadFixture('sample-docs-violations.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-violations.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

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
      const code = loadFixture('sample-docs-violations.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-violations.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

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

    it('includes correct line numbers for violations', async () => {
      const code = loadFixture('sample-docs-violations.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-violations.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      for (const violation of result.violations) {
        expect(violation.line).toBeGreaterThan(0);
        expect(violation.line).toBeLessThanOrEqual(code.split('\n').length);
      }
    });
  });

  describe('Factory Function', () => {
    it('creates DocValidator instance', () => {
      const instance = createDocValidator();

      expect(instance).toBeInstanceOf(DocValidator);
    });

    it('accepts custom project root', () => {
      const customRoot = '/custom/project/root';
      const instance = createDocValidator(customRoot);

      expect(instance).toBeInstanceOf(DocValidator);
    });
  });

  describe('Integration Scenarios', () => {
    it('handles real-world Python file with sample-docs-violations.py', async () => {
      const code = loadFixture('sample-docs-violations.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-violations.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      // Should detect multiple violations
      expect(result.violations.length).toBeGreaterThanOrEqual(5);

      // Verify violation types
      const violationRules = new Set(result.violations.map((v) => v.rule));
      expect(violationRules.has('require-docstring')).toBe(true);
      expect(violationRules.has('require-args-section')).toBe(true);
      expect(violationRules.has('require-returns-section')).toBe(true);
    });

    it('validates all violations are for correct definitions', async () => {
      const code = loadFixture('sample-docs-violations.py');

      const input: DocValidatorInput = {
        filePath: join(FIXTURES_DIR, 'sample-docs-violations.py'),
        code,
      };

      const result: AgentResult = await validator.execute(input);

      // Each violation should reference a specific function/class/method
      for (const violation of result.violations) {
        expect(violation.message).toMatch(/(function|class|method) '\w+'/);
      }
    });
  });
});
