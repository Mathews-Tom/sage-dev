import type { Violation } from './schemas/index.js';

/**
 * Filtered violations result with metadata
 */
export interface FilteredResult {
  violations: Violation[];
  metadata: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
    filtered: number;
  };
}

/**
 * Violation sorting comparator
 * Prioritizes: errors > warnings > info, then by line number
 */
function compareViolations(a: Violation, b: Violation): number {
  const severityOrder = { error: 0, warning: 1, info: 2 };

  // Sort by severity first
  const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
  if (severityDiff !== 0) return severityDiff;

  // Then by line number
  return a.line - b.line;
}

/**
 * Sorts violations by severity and line number
 * @param violations - Violations to sort
 * @returns Sorted violations array
 */
export function sortViolations(violations: Violation[]): Violation[] {
  return [...violations].sort(compareViolations);
}

/**
 * Filters violations to top N per severity level
 * This is the core token reduction mechanism:
 * - 1000 violations → 30 violations (10 per severity)
 * - 97% reduction in result size
 * @param violations - Violations to filter
 * @param limitPerSeverity - Maximum violations per severity level
 * @returns Filtered violations with metadata
 */
export function filterViolations(
  violations: Violation[],
  limitPerSeverity: number = 10
): FilteredResult {
  const sorted = sortViolations(violations);

  const errors = sorted.filter(v => v.severity === 'error').slice(0, limitPerSeverity);
  const warnings = sorted.filter(v => v.severity === 'warning').slice(0, limitPerSeverity);
  const info = sorted.filter(v => v.severity === 'info').slice(0, limitPerSeverity);

  const filtered = [...errors, ...warnings, ...info];

  return {
    violations: filtered,
    metadata: {
      total: violations.length,
      errors: sorted.filter(v => v.severity === 'error').length,
      warnings: sorted.filter(v => v.severity === 'warning').length,
      info: sorted.filter(v => v.severity === 'info').length,
      filtered: violations.length - filtered.length,
    },
  };
}

/**
 * Streams violations in batches
 * Useful for large result sets to avoid memory pressure
 * @param violations - Violations to stream
 * @param batchSize - Batch size
 */
export async function* streamViolations(
  violations: Violation[],
  batchSize: number = 10
): AsyncGenerator<Violation[]> {
  const sorted = sortViolations(violations);

  for (let i = 0; i < sorted.length; i += batchSize) {
    yield sorted.slice(i, i + batchSize);
  }
}

/**
 * Groups violations by file
 * @param violations - Violations to group
 * @returns Map of file path to violations
 */
export function groupViolationsByFile(
  violations: Violation[]
): Map<string, Violation[]> {
  const grouped = new Map<string, Violation[]>();

  for (const violation of violations) {
    const existing = grouped.get(violation.file) || [];
    existing.push(violation);
    grouped.set(violation.file, existing);
  }

  return grouped;
}

/**
 * Groups violations by severity
 * @param violations - Violations to group
 * @returns Map of severity to violations
 */
export function groupViolationsBySeverity(
  violations: Violation[]
): Map<'error' | 'warning' | 'info', Violation[]> {
  const grouped = new Map<'error' | 'warning' | 'info', Violation[]>();

  grouped.set('error', violations.filter(v => v.severity === 'error'));
  grouped.set('warning', violations.filter(v => v.severity === 'warning'));
  grouped.set('info', violations.filter(v => v.severity === 'info'));

  return grouped;
}

/**
 * Filters violations by rule ID
 * @param violations - Violations to filter
 * @param ruleIds - Rule IDs to include
 * @returns Filtered violations
 */
export function filterByRule(violations: Violation[], ruleIds: string[]): Violation[] {
  return violations.filter(v => ruleIds.includes(v.rule));
}

/**
 * Filters violations by severity
 * @param violations - Violations to filter
 * @param severities - Severities to include
 * @returns Filtered violations
 */
export function filterBySeverity(
  violations: Violation[],
  severities: Array<'error' | 'warning' | 'info'>
): Violation[] {
  return violations.filter(v => severities.includes(v.severity));
}

/**
 * Calculates violation statistics
 * @param violations - Violations to analyze
 * @returns Statistics object
 */
export function calculateStatistics(violations: Violation[]): {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  autoFixable: number;
  uniqueFiles: number;
  uniqueRules: number;
} {
  const uniqueFiles = new Set(violations.map(v => v.file)).size;
  const uniqueRules = new Set(violations.map(v => v.rule)).size;

  return {
    total: violations.length,
    errors: violations.filter(v => v.severity === 'error').length,
    warnings: violations.filter(v => v.severity === 'warning').length,
    info: violations.filter(v => v.severity === 'info').length,
    autoFixable: violations.filter(v => v.autoFixable).length,
    uniqueFiles,
    uniqueRules,
  };
}
