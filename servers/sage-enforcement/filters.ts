/**
 * Result Filtering Pipeline
 *
 * Severity-based sorting, pagination, and progressive streaming for violation results.
 * Reduces token usage by returning top N violations per severity level.
 *
 * Performance:
 * - Filtering latency: <10ms for 1000 violations
 * - Memory efficient: O(n) space complexity
 * - Progressive streaming: async generator for large result sets
 *
 * @see https://modelcontextprotocol.io/ - MCP Specification
 */

import type { Violation, Severity } from './schemas/index.js';

/**
 * Severity Priority Mapping
 *
 * Defines sort order: error (0) > warning (1) > info (2)
 */
const SEVERITY_PRIORITY: Record<Severity, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

/**
 * Filtered Result Metadata
 *
 * Provides statistics about filtering operation.
 */
export interface FilterMetadata {
  /** Total violations before filtering */
  total: number;

  /** Number of violations truncated (total - returned) */
  truncated: number;

  /** Breakdown by severity */
  bySeverity: {
    error: { total: number; returned: number; truncated: number };
    warning: { total: number; returned: number; truncated: number };
    info: { total: number; returned: number; truncated: number };
  };
}

/**
 * Filter Violations Result
 *
 * Contains filtered violations and metadata about the filtering operation.
 */
export interface FilteredResult {
  /** Filtered violations (paginated by severity) */
  violations: Violation[];

  /** Metadata about filtering operation */
  metadata: FilterMetadata;
}

/**
 * Filter Violations by Severity and Line Number
 *
 * Sorts violations by severity (error > warning > info) and line number,
 * then paginates to top N violations per severity level.
 *
 * @param violations - Array of violations to filter
 * @param maxPerSeverity - Maximum violations to return per severity (default: 10)
 * @returns Filtered violations with metadata
 *
 * @example
 * ```typescript
 * const result = filterViolations(violations, 10);
 * console.log(`Filtered ${result.metadata.total} to ${result.violations.length}`);
 * console.log(`Truncated: ${result.metadata.truncated}`);
 * ```
 */
export function filterViolations(
  violations: Violation[],
  maxPerSeverity: number = 10
): FilteredResult {
  // Group violations by severity
  const bySeverity: Record<Severity, Violation[]> = {
    error: [],
    warning: [],
    info: [],
  };

  for (const violation of violations) {
    bySeverity[violation.severity].push(violation);
  }

  // Sort each severity group by line number (ascending)
  for (const severity of ['error', 'warning', 'info'] as Severity[]) {
    bySeverity[severity].sort((a, b) => a.line - b.line);
  }

  // Paginate to top N per severity
  const filtered: Violation[] = [];
  const metadata: FilterMetadata = {
    total: violations.length,
    truncated: 0,
    bySeverity: {
      error: {
        total: bySeverity.error.length,
        returned: Math.min(bySeverity.error.length, maxPerSeverity),
        truncated: Math.max(0, bySeverity.error.length - maxPerSeverity),
      },
      warning: {
        total: bySeverity.warning.length,
        returned: Math.min(bySeverity.warning.length, maxPerSeverity),
        truncated: Math.max(0, bySeverity.warning.length - maxPerSeverity),
      },
      info: {
        total: bySeverity.info.length,
        returned: Math.min(bySeverity.info.length, maxPerSeverity),
        truncated: Math.max(0, bySeverity.info.length - maxPerSeverity),
      },
    },
  };

  // Add filtered violations in severity order
  for (const severity of ['error', 'warning', 'info'] as Severity[]) {
    const severityViolations = bySeverity[severity].slice(0, maxPerSeverity);
    filtered.push(...severityViolations);
  }

  // Calculate total truncated
  metadata.truncated =
    metadata.bySeverity.error.truncated +
    metadata.bySeverity.warning.truncated +
    metadata.bySeverity.info.truncated;

  return {
    violations: filtered,
    metadata,
  };
}

/**
 * Stream Violations Progressively
 *
 * Async generator that yields violations in batches by severity.
 * Useful for large result sets to avoid memory pressure.
 *
 * @param violations - Array of violations to stream
 * @param batchSize - Number of violations to yield per batch (default: 10)
 * @yields Batches of violations sorted by severity and line number
 *
 * @example
 * ```typescript
 * for await (const batch of streamViolations(violations, 10)) {
 *   console.log(`Processing batch of ${batch.length} violations`);
 *   await sendToClient(batch);
 * }
 * ```
 */
export async function* streamViolations(
  violations: Violation[],
  batchSize: number = 10
): AsyncGenerator<Violation[], void, undefined> {
  // Group by severity
  const bySeverity: Record<Severity, Violation[]> = {
    error: [],
    warning: [],
    info: [],
  };

  for (const violation of violations) {
    bySeverity[violation.severity].push(violation);
  }

  // Sort each group by line number
  for (const severity of ['error', 'warning', 'info'] as Severity[]) {
    bySeverity[severity].sort((a, b) => a.line - b.line);
  }

  // Stream in batches, severity order
  for (const severity of ['error', 'warning', 'info'] as Severity[]) {
    const severityViolations = bySeverity[severity];

    for (let i = 0; i < severityViolations.length; i += batchSize) {
      const batch = severityViolations.slice(i, i + batchSize);
      yield batch;
    }
  }
}

/**
 * Sort Violations by Severity and Line
 *
 * Utility function to sort violations in-place by severity priority
 * and line number within each severity.
 *
 * @param violations - Array of violations to sort (mutates)
 * @returns Sorted array (same reference)
 *
 * @example
 * ```typescript
 * const sorted = sortViolations(violations);
 * // sorted[0] is highest priority (error, lowest line number)
 * ```
 */
export function sortViolations(violations: Violation[]): Violation[] {
  return violations.sort((a, b) => {
    // Primary: sort by severity priority
    const severityDiff = SEVERITY_PRIORITY[a.severity] - SEVERITY_PRIORITY[b.severity];
    if (severityDiff !== 0) {
      return severityDiff;
    }

    // Secondary: sort by line number (ascending)
    return a.line - b.line;
  });
}

/**
 * Get Violations by Severity
 *
 * Filters violations to only include specified severity levels.
 *
 * @param violations - Array of violations to filter
 * @param severities - Array of severity levels to include
 * @returns Filtered violations
 *
 * @example
 * ```typescript
 * // Get only errors and warnings
 * const critical = getViolationsBySeverity(violations, ['error', 'warning']);
 * ```
 */
export function getViolationsBySeverity(
  violations: Violation[],
  severities: Severity[]
): Violation[] {
  const severitySet = new Set(severities);
  return violations.filter((v) => severitySet.has(v.severity));
}

/**
 * Get Summary Statistics
 *
 * Computes aggregated counts by severity level.
 *
 * @param violations - Array of violations to summarize
 * @returns Counts by severity
 *
 * @example
 * ```typescript
 * const summary = getSummaryStatistics(violations);
 * console.log(`Errors: ${summary.error}, Warnings: ${summary.warning}, Info: ${summary.info}`);
 * ```
 */
export function getSummaryStatistics(violations: Violation[]): Record<Severity, number> {
  const summary: Record<Severity, number> = {
    error: 0,
    warning: 0,
    info: 0,
  };

  for (const violation of violations) {
    summary[violation.severity]++;
  }

  return summary;
}
