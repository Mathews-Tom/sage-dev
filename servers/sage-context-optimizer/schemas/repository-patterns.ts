import { z } from 'zod';
import { PythonPatternsSchema } from './python-patterns.js';
import { TypeScriptPatternsSchema } from './typescript-patterns.js';

export const RepositoryMetadataSchema = z.object({
  name: z.string(),
  path: z.string(),
  extractedAt: z.string().datetime(),
  version: z.string().optional(),
  totalFiles: z.number().min(0),
  analyzedFiles: z.number().min(0),
  samplingRate: z.number().min(0).max(100),
});

export const RepositoryPatternsSchema = z.object({
  metadata: RepositoryMetadataSchema,
  languages: z.object({
    python: PythonPatternsSchema.optional(),
    typescript: TypeScriptPatternsSchema.optional(),
  }),
  overallConfidence: z.number().min(0).max(1),
  primaryLanguage: z.enum(['python', 'typescript', 'mixed', 'unknown']),
});

export type RepositoryMetadata = z.infer<typeof RepositoryMetadataSchema>;
export type RepositoryPatterns = z.infer<typeof RepositoryPatternsSchema>;

export function mergePatterns(
  base: RepositoryPatterns,
  update: Partial<RepositoryPatterns>
): RepositoryPatterns {
  const merged: RepositoryPatterns = {
    metadata: {
      ...base.metadata,
      ...(update.metadata || {}),
      extractedAt: new Date().toISOString(),
    },
    languages: {
      python: mergeLanguagePattern(base.languages.python, update.languages?.python),
      typescript: mergeLanguagePattern(base.languages.typescript, update.languages?.typescript),
    },
    overallConfidence: update.overallConfidence ?? base.overallConfidence,
    primaryLanguage: update.primaryLanguage ?? base.primaryLanguage,
  };

  if (merged.languages.python && merged.languages.typescript) {
    const pythonConf = merged.languages.python.confidence.overall;
    const tsConf = merged.languages.typescript.confidence.overall;
    merged.overallConfidence = (pythonConf + tsConf) / 2;
  } else if (merged.languages.python) {
    merged.overallConfidence = merged.languages.python.confidence.overall;
  } else if (merged.languages.typescript) {
    merged.overallConfidence = merged.languages.typescript.confidence.overall;
  }

  return merged;
}

function mergeLanguagePattern<T extends { confidence: { overall: number } }>(
  base: T | undefined,
  update: T | undefined
): T | undefined {
  if (!base && !update) return undefined;
  if (!base) return update;
  if (!update) return base;

  if (update.confidence.overall > base.confidence.overall) {
    return update;
  }
  return base;
}

export function createEmptyPatterns(repoPath: string, repoName: string): RepositoryPatterns {
  return {
    metadata: {
      name: repoName,
      path: repoPath,
      extractedAt: new Date().toISOString(),
      totalFiles: 0,
      analyzedFiles: 0,
      samplingRate: 0,
    },
    languages: {},
    overallConfidence: 0,
    primaryLanguage: 'unknown',
  };
}
