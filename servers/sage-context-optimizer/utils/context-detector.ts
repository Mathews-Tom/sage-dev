import { extname } from 'path';
import {
  FileType,
  Feature,
  Domain,
  TaskContext,
} from '../schemas/task-context.js';
import { getRelevantPatternsForFileType } from '../mappings/file-type-patterns.js';
import { getRelevantPatternsForFeature } from '../mappings/feature-patterns.js';

const EXTENSION_MAP: Record<string, FileType> = {
  '.py': 'python',
  '.pyw': 'python',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
};

const FEATURE_PATTERNS: Array<{ pattern: RegExp; feature: Feature }> = [
  { pattern: /[/\\](auth|authentication|login|signup)[/\\]/i, feature: 'auth' },
  { pattern: /[/\\](api|rest|graphql|endpoints)[/\\]/i, feature: 'api' },
  { pattern: /[/\\](ui|components|views|pages|frontend)[/\\]/i, feature: 'ui' },
  { pattern: /[/\\](data|models|schemas|database|db)[/\\]/i, feature: 'data' },
  { pattern: /[/\\](test|tests|__tests__|spec|specs)[/\\]/i, feature: 'testing' },
  { pattern: /[/\\](infra|infrastructure|deploy|ci|cd)[/\\]/i, feature: 'infrastructure' },
  { pattern: /\.(test|spec)\.(ts|js|py)$/i, feature: 'testing' },
];

const DOMAIN_PATTERNS: Array<{ pattern: RegExp; domain: Domain }> = [
  { pattern: /[/\\](frontend|client|ui|web|app)[/\\]/i, domain: 'frontend' },
  { pattern: /[/\\](backend|server|api|services)[/\\]/i, domain: 'backend' },
  { pattern: /[/\\](infra|infrastructure|deploy|k8s|terraform)[/\\]/i, domain: 'infra' },
  { pattern: /[/\\](shared|common|lib|utils)[/\\]/i, domain: 'shared' },
  { pattern: /[/\\]src[/\\]/i, domain: 'backend' },
];

export function detectFileType(filePath: string): FileType {
  const ext = extname(filePath).toLowerCase();
  return EXTENSION_MAP[ext] || 'unknown';
}

export function detectFeature(filePath: string): Feature {
  const normalizedPath = filePath.replace(/\\/g, '/');

  for (const { pattern, feature } of FEATURE_PATTERNS) {
    if (pattern.test(normalizedPath)) {
      return feature;
    }
  }

  return 'unknown';
}

export function detectDomain(filePath: string): Domain {
  const normalizedPath = filePath.replace(/\\/g, '/');

  for (const { pattern, domain } of DOMAIN_PATTERNS) {
    if (pattern.test(normalizedPath)) {
      return domain;
    }
  }

  return 'unknown';
}

export function detectContext(filePath: string): TaskContext {
  const fileType = detectFileType(filePath);
  const feature = detectFeature(filePath);
  const domain = detectDomain(filePath);

  const fileTypePatterns = getRelevantPatternsForFileType(fileType);
  const featurePatterns = getRelevantPatternsForFeature(feature);

  const allPatterns = [...new Set([...fileTypePatterns, ...featurePatterns])];

  return {
    fileType,
    feature,
    domain,
    filePath,
    patterns: allPatterns,
  };
}

export function filterPatternsByContext(
  patterns: Record<string, unknown>,
  context: TaskContext
): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};

  for (const patternName of context.patterns) {
    if (patterns[patternName]) {
      filtered[patternName] = patterns[patternName];
    }
  }

  return filtered;
}

export function calculateReductionPercentage(
  originalSize: number,
  filteredSize: number
): number {
  if (originalSize === 0) return 0;
  return ((originalSize - filteredSize) / originalSize) * 100;
}
