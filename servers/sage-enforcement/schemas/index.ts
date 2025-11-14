import { z } from 'zod';

/**
 * Violation severity levels
 */
export const SeveritySchema = z.enum(['error', 'warning', 'info']);
export type Severity = z.infer<typeof SeveritySchema>;

/**
 * Code violation detected by an enforcement agent
 */
export const ViolationSchema = z.object({
  file: z.string().describe('Absolute file path'),
  line: z.number().int().positive().describe('Line number (1-indexed)'),
  column: z.number().int().nonnegative().optional().describe('Column number (0-indexed)'),
  severity: SeveritySchema.describe('Violation severity level'),
  rule: z.string().regex(/^[a-z-]+$/).describe('Rule identifier (kebab-case)'),
  message: z.string().min(1).describe('Human-readable violation description'),
  suggestion: z.string().optional().describe('Auto-fix suggestion'),
  autoFixable: z.boolean().describe('Whether auto-fix is available')
});
export type Violation = z.infer<typeof ViolationSchema>;

/**
 * Type enforcer agent input schema
 */
export const TypeEnforcerInputSchema = z.object({
  filePath: z.string().min(1).describe('Absolute path to Python file'),
  code: z.string().describe('Python source code to analyze'),
  standards: z.object({
    enforceReturnTypes: z.boolean().default(true),
    allowAny: z.boolean().default(false),
    pythonVersion: z.string().default('3.12'),
    deprecatedImports: z.array(z.string()).default(['List', 'Dict', 'Optional', 'Union']),
    builtinGenerics: z.boolean().default(true)
  }).optional()
});
export type TypeEnforcerInput = z.infer<typeof TypeEnforcerInputSchema>;

/**
 * Doc validator agent input schema
 */
export const DocValidatorInputSchema = z.object({
  filePath: z.string().min(1).describe('Absolute path to Python file'),
  code: z.string().describe('Python source code to analyze')
});
export type DocValidatorInput = z.infer<typeof DocValidatorInputSchema>;

/**
 * Test coverage agent input schema
 */
export const TestCoverageInputSchema = z.object({
  filePath: z.string().min(1).describe('Absolute path to Python file'),
  threshold: z.number().min(0).max(100).default(80).describe('Minimum coverage percentage')
});
export type TestCoverageInput = z.infer<typeof TestCoverageInputSchema>;

/**
 * Security scanner agent input schema
 */
export const SecurityScannerInputSchema = z.object({
  filePath: z.string().min(1).describe('Absolute path to file'),
  code: z.string().describe('Source code to analyze')
});
export type SecurityScannerInput = z.infer<typeof SecurityScannerInputSchema>;

/**
 * Agent result summary
 */
export const AgentSummarySchema = z.object({
  errors: z.number().int().nonnegative().describe('Count of error-level violations'),
  warnings: z.number().int().nonnegative().describe('Count of warning-level violations'),
  info: z.number().int().nonnegative().describe('Count of info-level violations')
});
export type AgentSummary = z.infer<typeof AgentSummarySchema>;

/**
 * Agent result schema
 */
export const AgentResultSchema = z.object({
  violations: z.array(ViolationSchema).describe('Array of code violations'),
  summary: AgentSummarySchema.describe('Violation count summary')
});
export type AgentResult = z.infer<typeof AgentResultSchema>;

/**
 * Test coverage result schema
 */
export const TestCoverageResultSchema = z.object({
  violations: z.array(ViolationSchema).describe('Array of coverage violations'),
  summary: AgentSummarySchema.describe('Violation count summary'),
  coverage: z.object({
    percentage: z.number().min(0).max(100).describe('Coverage percentage'),
    uncoveredLines: z.array(z.number().int().positive()).describe('Line numbers without coverage')
  })
});
export type TestCoverageResult = z.infer<typeof TestCoverageResultSchema>;

/**
 * Security scanner result schema
 */
export const SecurityScannerResultSchema = z.object({
  violations: z.array(ViolationSchema).describe('Array of security violations'),
  summary: AgentSummarySchema.describe('Violation count summary'),
  criticalCount: z.number().int().nonnegative().describe('Count of critical vulnerabilities')
});
export type SecurityScannerResult = z.infer<typeof SecurityScannerResultSchema>;
