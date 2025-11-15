import { z } from 'zod';

export const NamingConventionSchema = z.object({
  pattern: z.enum(['snake_case', 'camelCase', 'PascalCase', 'UPPER_SNAKE_CASE']),
  count: z.number().min(0),
  percentage: z.number().min(0).max(100),
});

export const TypeScriptNamingPatternsSchema = z.object({
  functions: NamingConventionSchema,
  classes: NamingConventionSchema,
  interfaces: NamingConventionSchema,
  types: NamingConventionSchema,
  constants: NamingConventionSchema,
});

export const TypePatternSchema = z.object({
  unionSyntax: z.enum(['pipe', 'Union', 'mixed']),
  genericsSyntax: z.enum(['builtin', 'legacy', 'mixed']),
  typeAliasUsage: z.number().min(0).max(100),
  interfaceVsType: z.enum(['interface', 'type', 'mixed']),
  strictNullChecks: z.boolean(),
});

export const TestingPatternSchema = z.object({
  framework: z.enum(['jest', 'vitest', 'mocha', 'ava', 'unknown']),
  fileNaming: z.enum(['test_suffix', 'spec_suffix', 'mixed']),
  mockingLibrary: z.enum(['jest-mock', 'sinon', 'vitest-mock', 'none']),
  coverageIntegration: z.boolean(),
});

export const ArchitecturePatternSchema = z.object({
  moduleSystem: z.enum(['esm', 'commonjs', 'mixed']),
  exportPattern: z.enum(['named', 'default', 'mixed']),
  barrelFiles: z.boolean(),
  layeredArchitecture: z.boolean(),
});

export const TypeScriptPatternsSchema = z.object({
  language: z.literal('typescript'),
  version: z.string().optional(),
  extractedAt: z.string().datetime(),
  filesAnalyzed: z.number().min(0),
  totalFiles: z.number().min(0),
  samplingRate: z.number().min(0).max(100),
  naming: TypeScriptNamingPatternsSchema,
  types: TypePatternSchema,
  testing: TestingPatternSchema,
  architecture: ArchitecturePatternSchema,
  confidence: z.object({
    overall: z.number().min(0).max(1),
    naming: z.number().min(0).max(1),
    types: z.number().min(0).max(1),
    testing: z.number().min(0).max(1),
    architecture: z.number().min(0).max(1),
  }),
});

export type TypeScriptPatterns = z.infer<typeof TypeScriptPatternsSchema>;
export type TypeScriptNamingPatterns = z.infer<typeof TypeScriptNamingPatternsSchema>;
export type TypePattern = z.infer<typeof TypePatternSchema>;
export type TestingPattern = z.infer<typeof TestingPatternSchema>;
export type ArchitecturePattern = z.infer<typeof ArchitecturePatternSchema>;
