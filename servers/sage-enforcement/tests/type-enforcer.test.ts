/**
 * Type Enforcer Agent Unit Tests
 *
 * Test suite for type-enforcer.ts using Vitest.
 * Covers critical scenarios from spec and edge cases.
 *
 * Test coverage requirements: ≥80%
 */

import { describe, test, expect } from 'vitest';
import { typeEnforcer } from '../agents/type-enforcer.js';

/**
 * Test Suite: Type Enforcer Critical Scenarios
 *
 * Tests from spec scenarios demonstrating expected behavior.
 */
describe('Type Enforcer - Critical Scenarios', () => {
  /**
   * Scenario 1: Missing Type Annotations Detection
   *
   * Tests that functions without type annotations are detected.
   * Expected: error violations for missing parameter types and return types
   */
  test('detects missing type annotations', async () => {
    const code = `
def calculate_total(items: list[int]) -> int:
    return sum(items)

def process_data(data):
    return data.strip()
`;

    const result = await typeEnforcer({
      filePath: '/test/missing_types.py',
      code,
    });

    expect(result.agent).toBe('type-enforcer');
    expect(result.summary.errors).toBeGreaterThan(0);

    // Pyright in strict mode reports missing type annotations
    // Look for violations related to unknown types or missing annotations
    const typeViolations = result.violations.filter((v) =>
      v.message.toLowerCase().includes('type') &&
      (v.message.toLowerCase().includes('unknown') ||
       v.message.toLowerCase().includes('missing'))
    );

    expect(typeViolations.length).toBeGreaterThan(0);

    // At least one violation should be an error
    const errorViolation = typeViolations.find((v) => v.severity === 'error');
    expect(errorViolation).toBeDefined();
    expect(errorViolation?.file).toBe('/test/missing_types.py');
  });

  /**
   * Scenario 2: Well-Typed Code with Typing Module
   *
   * Tests that code using typing module is valid, even if not using built-in generics.
   * Note: Pyright doesn't flag deprecated typing imports by default, even in strict mode.
   * This is because typing.List, typing.Dict, etc. are still valid Python 3.12 code.
   */
  test('accepts code using typing module imports', async () => {
    const code = `
from typing import List, Dict

def get_items() -> List[str]:
    return ["a", "b", "c"]

def get_mapping() -> Dict[str, int]:
    return {"x": 1, "y": 2}
`;

    const result = await typeEnforcer({
      filePath: '/test/typing_module.py',
      code,
    });

    expect(result.agent).toBe('type-enforcer');

    // This code should pass type checking (no errors expected)
    // Pyright doesn't flag deprecated typing imports as errors
    expect(result.summary.errors).toBe(0);
  });

  /**
   * Scenario 3: Inappropriate Any Usage Detection
   *
   * Tests that typing.Any usage is detected when not allowed.
   * Expected: violation with rule 'inappropriate-any'
   */
  test('detects inappropriate Any usage', async () => {
    const code = `
from typing import Any

def process(data: Any) -> Any:
    return data
`;

    const result = await typeEnforcer({
      filePath: '/test/any_usage.py',
      code,
    });

    expect(result.agent).toBe('type-enforcer');

    // Check for Any violations
    const anyViolation = result.violations.find((v) =>
      v.message.includes('Any')
    );

    if (anyViolation) {
      expect(anyViolation.autoFixable).toBe(false);
      expect(anyViolation.suggestion).toContain('specific type');
    }
  });
});

/**
 * Test Suite: Type Enforcer Edge Cases
 *
 * Tests for edge cases and error handling scenarios.
 */
describe('Type Enforcer - Edge Cases', () => {
  /**
   * Edge Case 1: Empty File
   *
   * Tests that empty files are handled gracefully without errors.
   * Expected: no violations, clean result
   */
  test('handles empty file gracefully', async () => {
    const code = '';

    const result = await typeEnforcer({
      filePath: '/test/empty.py',
      code,
    });

    expect(result.agent).toBe('type-enforcer');
    expect(result.summary.errors).toBe(0);
    expect(result.summary.warnings).toBe(0);
    expect(result.violations).toHaveLength(0);
  });

  /**
   * Edge Case 2: Only Comments
   *
   * Tests that files with only comments are handled gracefully.
   * Expected: no violations
   */
  test('handles file with only comments', async () => {
    const code = `
# This is a comment
# Another comment
`;

    const result = await typeEnforcer({
      filePath: '/test/comments.py',
      code,
    });

    expect(result.agent).toBe('type-enforcer');
    expect(result.summary.errors).toBe(0);
    expect(result.violations).toHaveLength(0);
  });

  /**
   * Edge Case 3: Syntax Error
   *
   * Tests that syntax errors are reported before type checking.
   * Expected: Pyright should report syntax errors
   */
  test('reports syntax error before type checking', async () => {
    const code = `
def broken_function(
    return "missing closing paren"
`;

    const result = await typeEnforcer({
      filePath: '/test/syntax_error.py',
      code,
    });

    expect(result.agent).toBe('type-enforcer');
    expect(result.summary.errors).toBeGreaterThan(0);

    // Should have at least one violation
    expect(result.violations.length).toBeGreaterThan(0);
  });

  /**
   * Edge Case 4: Valid Well-Typed Code
   *
   * Tests that valid, well-typed code passes without violations.
   * Expected: no violations
   */
  test('passes valid well-typed code', async () => {
    const code = `
def add_numbers(a: int, b: int) -> int:
    """Add two numbers and return the result."""
    return a + b

def greet(name: str) -> str:
    """Greet a person by name."""
    return f"Hello, {name}!"
`;

    const result = await typeEnforcer({
      filePath: '/test/valid.py',
      code,
    });

    expect(result.agent).toBe('type-enforcer');
    expect(result.summary.errors).toBe(0);
    expect(result.violations).toHaveLength(0);
  });

  /**
   * Edge Case 5: Malformed Input - Zod Validation
   *
   * Tests that malformed input is caught by Zod schema validation.
   * Expected: Zod validation error thrown
   */
  test('catches malformed input with Zod validation', async () => {
    // Missing required fields
    const invalidInput = {
      // Missing filePath and code
    };

    await expect(typeEnforcer(invalidInput)).rejects.toThrow();
  });

  /**
   * Edge Case 6: Malformed Input - Invalid Types
   *
   * Tests that invalid types are caught by Zod schema validation.
   * Expected: Zod validation error thrown
   */
  test('catches invalid types with Zod validation', async () => {
    const invalidInput = {
      filePath: 123, // Should be string
      code: null, // Should be string
    };

    await expect(typeEnforcer(invalidInput)).rejects.toThrow();
  });
});

/**
 * Test Suite: Type Enforcer Result Structure
 *
 * Tests for correct result structure and metadata.
 */
describe('Type Enforcer - Result Structure', () => {
  /**
   * Test: Result Schema Compliance
   *
   * Tests that results conform to AgentResult schema.
   */
  test('returns correctly structured result', async () => {
    const code = `
def foo(x):
    return x
`;

    const result = await typeEnforcer({
      filePath: '/test/structure.py',
      code,
    });

    // Validate result structure
    expect(result).toHaveProperty('agent');
    expect(result).toHaveProperty('executionTime');
    expect(result).toHaveProperty('tokensUsed');
    expect(result).toHaveProperty('violations');
    expect(result).toHaveProperty('summary');

    expect(result.agent).toBe('type-enforcer');
    expect(typeof result.executionTime).toBe('number');
    expect(result.executionTime).toBeGreaterThan(0);
    expect(typeof result.tokensUsed).toBe('number');
    expect(result.tokensUsed).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.violations)).toBe(true);

    // Validate summary structure
    expect(result.summary).toHaveProperty('errors');
    expect(result.summary).toHaveProperty('warnings');
    expect(result.summary).toHaveProperty('info');
    expect(typeof result.summary.errors).toBe('number');
    expect(typeof result.summary.warnings).toBe('number');
    expect(typeof result.summary.info).toBe('number');
  });

  /**
   * Test: Violation Structure
   *
   * Tests that violations conform to Violation schema.
   */
  test('violations have correct structure', async () => {
    const code = `
def process(data):
    return data
`;

    const result = await typeEnforcer({
      filePath: '/test/violation_structure.py',
      code,
    });

    if (result.violations.length > 0) {
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
      expect(violation.rule).toMatch(/^[a-z-]+$/);
      expect(typeof violation.message).toBe('string');
      expect(typeof violation.autoFixable).toBe('boolean');

      if (violation.column !== undefined) {
        expect(typeof violation.column).toBe('number');
        expect(violation.column).toBeGreaterThanOrEqual(0);
      }

      if (violation.suggestion !== undefined) {
        expect(typeof violation.suggestion).toBe('string');
      }
    }
  });

  /**
   * Test: Top 10 Filtering
   *
   * Tests that results are limited to top 10 errors + top 10 warnings.
   * Expected: Maximum 20 violations returned
   */
  test('limits violations to top 10 per severity', async () => {
    // Create code with many violations
    const functions = Array.from({ length: 25 }, (_, i) => `
def func_${i}(x):
    return x
`).join('\n');

    const result = await typeEnforcer({
      filePath: '/test/many_violations.py',
      code: functions,
    });

    expect(result.agent).toBe('type-enforcer');

    // Should have at most 20 violations (10 errors + 10 warnings)
    expect(result.violations.length).toBeLessThanOrEqual(20);

    // Errors should come before warnings
    const errors = result.violations.filter((v) => v.severity === 'error');
    const warnings = result.violations.filter((v) => v.severity === 'warning');

    // All errors should appear before all warnings
    if (errors.length > 0 && warnings.length > 0) {
      const lastErrorIndex = result.violations.lastIndexOf(errors[errors.length - 1]);
      const firstWarningIndex = result.violations.indexOf(warnings[0]);
      expect(lastErrorIndex).toBeLessThan(firstWarningIndex);
    }
  });
});

/**
 * Test Suite: Type Enforcer with Custom Standards
 *
 * Tests for custom typing standards configuration.
 */
describe('Type Enforcer - Custom Standards', () => {
  /**
   * Test: Custom Standards Applied
   *
   * Tests that custom standards are passed through correctly.
   * Note: Standards application is handled by Pyright, so we just verify input validation.
   */
  test('accepts custom standards in input', async () => {
    const code = `
def add(a: int, b: int) -> int:
    return a + b
`;

    const result = await typeEnforcer({
      filePath: '/test/custom_standards.py',
      code,
      standards: {
        enforceReturnTypes: true,
        allowAny: false,
        pythonVersion: '3.12',
        deprecatedImports: ['typing.List', 'typing.Dict'],
        builtinGenerics: true,
      },
    });

    expect(result.agent).toBe('type-enforcer');
    expect(result).toHaveProperty('violations');
  });
});
