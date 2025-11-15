import { FileType } from '../schemas/task-context.js';

export interface PatternCategory {
  naming: boolean;
  typing: boolean;
  testing: boolean;
  errorHandling: boolean;
  architecture: boolean;
}

export const FILE_TYPE_PATTERNS: Record<FileType, PatternCategory> = {
  python: {
    naming: true,
    typing: true,
    testing: true,
    errorHandling: true,
    architecture: false,
  },
  typescript: {
    naming: true,
    typing: true,
    testing: true,
    errorHandling: false,
    architecture: true,
  },
  javascript: {
    naming: true,
    typing: false,
    testing: true,
    errorHandling: false,
    architecture: true,
  },
  unknown: {
    naming: false,
    typing: false,
    testing: false,
    errorHandling: false,
    architecture: false,
  },
};

export function getRelevantPatternsForFileType(fileType: FileType): string[] {
  const categories = FILE_TYPE_PATTERNS[fileType];
  const patterns: string[] = [];

  if (categories.naming) patterns.push('naming');
  if (categories.typing) patterns.push('typing');
  if (categories.testing) patterns.push('testing');
  if (categories.errorHandling) patterns.push('errorHandling');
  if (categories.architecture) patterns.push('architecture');

  return patterns;
}
