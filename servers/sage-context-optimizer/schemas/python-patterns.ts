import { z } from 'zod';

export const NamingConventionSchema = z.object({
  pattern: z.enum(['snake_case', 'camelCase', 'PascalCase', 'UPPER_SNAKE_CASE']),
  count: z.number().min(0),
  percentage: z.number().min(0).max(100),
});

export const PythonNamingPatternsSchema = z.object({
  functions: NamingConventionSchema,
  classes: NamingConventionSchema,
  constants: NamingConventionSchema,
  variables: NamingConventionSchema,
});

export const TypePatternSchema = z.object({
  unionSyntax: z.enum(['pipe', 'Union', 'mixed']),
  genericsSyntax: z.enum(['builtin', 'typing', 'mixed']),
  typeHintCoverage: z.number().min(0).max(100),
  commonTypes: z.array(z.string()),
});

export const TestingPatternSchema = z.object({
  framework: z.enum(['pytest', 'unittest', 'nose', 'unknown']),
  fileNaming: z.enum(['test_prefix', 'test_suffix', 'mixed']),
  fixtureUsage: z.boolean(),
  mockPatterns: z.array(z.string()),
  coverageIntegration: z.boolean(),
});

export const ErrorHandlingPatternSchema = z.object({
  tryExceptUsage: z.number().min(0).max(100),
  commonExceptions: z.array(z.string()),
  customExceptions: z.array(z.string()),
  loggingFramework: z.enum(['logging', 'loguru', 'structlog', 'none']),
  errorPropagation: z.enum(['raise', 'return', 'mixed']),
});

export const PythonPatternsSchema = z.object({
  language: z.literal('python'),
  version: z.string().optional(),
  extractedAt: z.string().datetime(),
  filesAnalyzed: z.number().min(0),
  totalFiles: z.number().min(0),
  samplingRate: z.number().min(0).max(100),
  naming: PythonNamingPatternsSchema,
  types: TypePatternSchema,
  testing: TestingPatternSchema,
  errorHandling: ErrorHandlingPatternSchema,
  confidence: z.object({
    overall: z.number().min(0).max(1),
    naming: z.number().min(0).max(1),
    types: z.number().min(0).max(1),
    testing: z.number().min(0).max(1),
    errorHandling: z.number().min(0).max(1),
  }),
});

export type PythonPatterns = z.infer<typeof PythonPatternsSchema>;
export type NamingConvention = z.infer<typeof NamingConventionSchema>;
export type TypePattern = z.infer<typeof TypePatternSchema>;
export type TestingPattern = z.infer<typeof TestingPatternSchema>;
export type ErrorHandlingPattern = z.infer<typeof ErrorHandlingPatternSchema>;
