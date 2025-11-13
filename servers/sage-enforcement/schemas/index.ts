/**
 * Zod Schemas for MCP Enforcement Agent I/O
 *
 * These schemas provide:
 * - Runtime validation with Zod
 * - Automatic JSON Schema generation for MCP protocol
 * - TypeScript type inference via z.infer
 * - Cross-language contract (TypeScript ↔ Python)
 *
 * @see https://zod.dev/ - Zod documentation
 * @see https://modelcontextprotocol.io/ - MCP specification
 */

import { z } from 'zod';

/**
 * Severity Levels for Violations
 *
 * Ordered by priority: error > warning > info
 */
export const SeveritySchema = z.enum(['error', 'warning', 'info']);
export type Severity = z.infer<typeof SeveritySchema>;

/**
 * Violation Entity
 *
 * Represents a single code quality violation detected by an agent.
 * Includes location, severity, rule identifier, message, and optional auto-fix suggestion.
 *
 * Example:
 * ```typescript
 * {
 *   file: "/path/to/file.py",
 *   line: 42,
 *   column: 10,
 *   severity: "error",
 *   rule: "missing-return-type",
 *   message: "Function missing return type annotation",
 *   suggestion: "Add return type: -> int",
 *   autoFixable: true
 * }
 * ```
 */
export const ViolationSchema = z.object({
  file: z.string().describe('Absolute file path'),
  line: z.number().int().positive().describe('Line number (1-indexed)'),
  column: z.number().int().nonnegative().optional().describe('Column number (0-indexed)'),
  severity: SeveritySchema.describe('Violation severity level'),
  rule: z.string().regex(/^[a-z-]+$/).describe('Rule identifier (lowercase-kebab-case)'),
  message: z.string().min(1).describe('Human-readable violation description'),
  suggestion: z.string().optional().describe('Auto-fix suggestion'),
  autoFixable: z.boolean().describe('Whether auto-fix is available'),
});
export type Violation = z.infer<typeof ViolationSchema>;

/**
 * Agent Result Summary
 *
 * Aggregated statistics for violations returned by an agent.
 */
export const AgentSummarySchema = z.object({
  errors: z.number().int().nonnegative().describe('Count of error-level violations'),
  warnings: z.number().int().nonnegative().describe('Count of warning-level violations'),
  info: z.number().int().nonnegative().describe('Count of info-level violations'),
});
export type AgentSummary = z.infer<typeof AgentSummarySchema>;

/**
 * Agent Result Entity
 *
 * Complete result from an agent execution including violations and metadata.
 *
 * Example:
 * ```typescript
 * {
 *   agent: "type-enforcer",
 *   executionTime: 1234,
 *   tokensUsed: 5000,
 *   violations: [...],
 *   summary: { errors: 2, warnings: 1, info: 0 }
 * }
 * ```
 */
export const AgentResultSchema = z.object({
  agent: z.string().describe('Agent identifier (e.g., "type-enforcer")'),
  executionTime: z.number().nonnegative().describe('Execution time in milliseconds'),
  tokensUsed: z.number().int().nonnegative().describe('Approximate token count'),
  violations: z.array(ViolationSchema).describe('Array of violations'),
  summary: AgentSummarySchema.describe('Aggregated violation statistics'),
});
export type AgentResult = z.infer<typeof AgentResultSchema>;

/**
 * Typing Standards Configuration
 *
 * Defines Python 3.12 type annotation standards (PEP 585, 604, 698).
 *
 * Example:
 * ```typescript
 * {
 *   enforceReturnTypes: true,
 *   allowAny: false,
 *   pythonVersion: "3.12",
 *   deprecatedImports: ["typing.List", "typing.Dict", "typing.Optional"],
 *   builtinGenerics: true
 * }
 * ```
 */
export const TypingStandardsSchema = z.object({
  enforceReturnTypes: z.boolean().default(true).describe('Require return type annotations'),
  allowAny: z.boolean().default(false).describe('Allow typing.Any usage'),
  pythonVersion: z.string().default('3.12').describe('Target Python version'),
  deprecatedImports: z.array(z.string()).default([
    'typing.List',
    'typing.Dict',
    'typing.Optional',
    'typing.Union',
    'typing.Tuple',
  ]).describe('Deprecated typing imports to flag'),
  builtinGenerics: z.boolean().default(true).describe('Require built-in generics (list, dict)'),
});
export type TypingStandards = z.infer<typeof TypingStandardsSchema>;

/**
 * Test Standards Configuration
 *
 * Defines test coverage and quality standards.
 *
 * Example:
 * ```typescript
 * {
 *   minCoverage: 80,
 *   blockCommitBelowThreshold: true,
 *   requireFunctionCoverage: true
 * }
 * ```
 */
export const TestStandardsSchema = z.object({
  minCoverage: z.number().min(0).max(100).default(80).describe('Minimum coverage percentage'),
  blockCommitBelowThreshold: z.boolean().default(true).describe('Block commits if coverage too low'),
  requireFunctionCoverage: z.boolean().default(true).describe('Require per-function coverage'),
});
export type TestStandards = z.infer<typeof TestStandardsSchema>;

/**
 * Security Standards Configuration
 *
 * Defines OWASP Top 10 rules and security patterns.
 *
 * Example:
 * ```typescript
 * {
 *   owaspRules: ["sql-injection", "xss", "hardcoded-secrets"],
 *   insecureFunctions: ["eval", "exec", "pickle.loads"]
 * }
 * ```
 */
export const SecurityStandardsSchema = z.object({
  owaspRules: z.array(z.string()).default([
    'sql-injection',
    'xss',
    'csrf',
    'hardcoded-secrets',
    'insecure-deserialization',
    'unsafe-eval',
  ]).describe('OWASP rules to enforce'),
  insecureFunctions: z.array(z.string()).default([
    'eval',
    'exec',
    'pickle.loads',
    'yaml.unsafe_load',
  ]).describe('Functions to flag as insecure'),
});
export type SecurityStandards = z.infer<typeof SecurityStandardsSchema>;

/**
 * Type Check Input
 *
 * Input parameters for type enforcement agent.
 *
 * Example:
 * ```typescript
 * {
 *   filePath: "/path/to/file.py",
 *   code: "def foo(x: int): return x * 2",
 *   standards: { enforceReturnTypes: true }
 * }
 * ```
 */
export const TypeCheckInputSchema = z.object({
  filePath: z.string().describe('Absolute file path'),
  code: z.string().describe('Python code to validate'),
  standards: TypingStandardsSchema.optional().describe('Type checking standards'),
});
export type TypeCheckInput = z.infer<typeof TypeCheckInputSchema>;

/**
 * Doc Validation Input
 *
 * Input parameters for documentation validation agent.
 *
 * Example:
 * ```typescript
 * {
 *   filePath: "/path/to/file.py",
 *   code: "def calculate(a: int, b: int) -> int:\n    \"\"\"Calculates.\"\"\"\n    return a + b"
 * }
 * ```
 */
export const DocValidationInputSchema = z.object({
  filePath: z.string().describe('Absolute file path'),
  code: z.string().describe('Python code to validate'),
});
export type DocValidationInput = z.infer<typeof DocValidationInputSchema>;

/**
 * Test Coverage Input
 *
 * Input parameters for test coverage agent.
 *
 * Example:
 * ```typescript
 * {
 *   filePath: "/path/to/file.py",
 *   threshold: 80
 * }
 * ```
 */
export const TestCoverageInputSchema = z.object({
  filePath: z.string().describe('Absolute file path'),
  threshold: z.number().min(0).max(100).default(80).describe('Minimum coverage percentage'),
});
export type TestCoverageInput = z.infer<typeof TestCoverageInputSchema>;

/**
 * Security Scan Input
 *
 * Input parameters for security scanner agent.
 *
 * Example:
 * ```typescript
 * {
 *   filePath: "/path/to/file.py",
 *   code: "query = f\"SELECT * FROM users WHERE id = {user_id}\""
 * }
 * ```
 */
export const SecurityScanInputSchema = z.object({
  filePath: z.string().describe('Absolute file path'),
  code: z.string().describe('Python code to scan'),
  standards: SecurityStandardsSchema.optional().describe('Security standards'),
});
export type SecurityScanInput = z.infer<typeof SecurityScanInputSchema>;

/**
 * Helper: Convert Zod Schema to JSON Schema
 *
 * Utility function to generate JSON Schema for MCP protocol registration.
 * MCP requires JSON Schema format for tool input validation.
 *
 * @param schema - Zod schema to convert
 * @returns JSON Schema object
 */
export function zodToJsonSchema(_schema: z.ZodTypeAny): object {
  // Zod doesn't have built-in JSON Schema generation
  // We'll need to use zod-to-json-schema package in production
  // For now, return a placeholder to satisfy TypeScript
  // TODO: MCP-005 - Install zod-to-json-schema package
  return {
    type: 'object',
    description: 'Generated from Zod schema',
    // Full implementation will use: zodToJsonSchema(_schema) from zod-to-json-schema
  };
}
