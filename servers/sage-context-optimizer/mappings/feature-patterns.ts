import { Feature } from '../schemas/task-context.js';

export interface FeaturePatternPriority {
  securityPatterns: boolean;
  validationPatterns: boolean;
  persistencePatterns: boolean;
  uiPatterns: boolean;
  testPatterns: boolean;
  infraPatterns: boolean;
}

export const FEATURE_PATTERNS: Record<Feature, FeaturePatternPriority> = {
  auth: {
    securityPatterns: true,
    validationPatterns: true,
    persistencePatterns: false,
    uiPatterns: false,
    testPatterns: false,
    infraPatterns: false,
  },
  api: {
    securityPatterns: false,
    validationPatterns: true,
    persistencePatterns: true,
    uiPatterns: false,
    testPatterns: false,
    infraPatterns: false,
  },
  ui: {
    securityPatterns: false,
    validationPatterns: true,
    persistencePatterns: false,
    uiPatterns: true,
    testPatterns: false,
    infraPatterns: false,
  },
  data: {
    securityPatterns: false,
    validationPatterns: true,
    persistencePatterns: true,
    uiPatterns: false,
    testPatterns: false,
    infraPatterns: false,
  },
  testing: {
    securityPatterns: false,
    validationPatterns: false,
    persistencePatterns: false,
    uiPatterns: false,
    testPatterns: true,
    infraPatterns: false,
  },
  infrastructure: {
    securityPatterns: true,
    validationPatterns: false,
    persistencePatterns: false,
    uiPatterns: false,
    testPatterns: false,
    infraPatterns: true,
  },
  unknown: {
    securityPatterns: false,
    validationPatterns: false,
    persistencePatterns: false,
    uiPatterns: false,
    testPatterns: false,
    infraPatterns: false,
  },
};

export function getRelevantPatternsForFeature(feature: Feature): string[] {
  const priorities = FEATURE_PATTERNS[feature];
  const patterns: string[] = [];

  if (priorities.securityPatterns) patterns.push('security');
  if (priorities.validationPatterns) patterns.push('validation');
  if (priorities.persistencePatterns) patterns.push('persistence');
  if (priorities.uiPatterns) patterns.push('ui');
  if (priorities.testPatterns) patterns.push('testing');
  if (priorities.infraPatterns) patterns.push('infrastructure');

  return patterns;
}
