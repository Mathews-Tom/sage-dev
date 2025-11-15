/**
 * Test coverage standards and rules
 * Enforces minimum coverage thresholds and test quality
 */

/**
 * Default minimum coverage threshold
 */
export const DEFAULT_COVERAGE_THRESHOLD = 80;

/**
 * Minimum acceptable coverage threshold
 */
export const MIN_COVERAGE_THRESHOLD = 0;

/**
 * Maximum coverage threshold
 */
export const MAX_COVERAGE_THRESHOLD = 100;

/**
 * Test coverage rules
 */
export interface TestRule {
  id: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  autoFixable: boolean;
}

/**
 * All test coverage enforcement rules
 */
export const TEST_RULES: TestRule[] = [
  {
    id: 'require-minimum-coverage',
    description: 'Code must meet minimum coverage threshold',
    severity: 'error',
    autoFixable: false,
  },
  {
    id: 'no-untested-functions',
    description: 'All functions must have test coverage',
    severity: 'error',
    autoFixable: false,
  },
  {
    id: 'no-untested-classes',
    description: 'All classes must have test coverage',
    severity: 'error',
    autoFixable: false,
  },
  {
    id: 'require-edge-case-tests',
    description: 'Tests must cover edge cases and error conditions',
    severity: 'warning',
    autoFixable: false,
  },
  {
    id: 'no-mock-tests',
    description: 'Avoid excessive mocking; test with production pipeline',
    severity: 'warning',
    autoFixable: false,
  },
  {
    id: 'require-integration-tests',
    description: 'Critical paths must have integration tests',
    severity: 'info',
    autoFixable: false,
  },
];

/**
 * Validates coverage threshold
 * @param threshold - Coverage threshold to validate
 * @throws Error if threshold is invalid
 */
export function validateCoverageThreshold(threshold: number): void {
  if (threshold < MIN_COVERAGE_THRESHOLD || threshold > MAX_COVERAGE_THRESHOLD) {
    throw new Error(
      `Coverage threshold must be between ${MIN_COVERAGE_THRESHOLD} and ${MAX_COVERAGE_THRESHOLD}, got ${threshold}`
    );
  }
}

/**
 * Calculates coverage percentage from line counts
 * @param coveredLines - Number of covered lines
 * @param totalLines - Total number of lines
 * @returns Coverage percentage (0-100)
 */
export function calculateCoveragePercentage(coveredLines: number, totalLines: number): number {
  if (totalLines === 0) {
    return 100;
  }

  return Math.round((coveredLines / totalLines) * 100);
}

/**
 * Checks if coverage meets threshold
 * @param coverage - Coverage percentage
 * @param threshold - Minimum threshold
 * @returns True if coverage meets threshold
 */
export function meetsCoverageThreshold(coverage: number, threshold: number): boolean {
  return coverage >= threshold;
}

/**
 * Gets a test rule by ID
 * @param ruleId - Rule identifier
 * @returns Test rule or undefined if not found
 */
export function getTestRule(ruleId: string): TestRule | undefined {
  return TEST_RULES.find(rule => rule.id === ruleId);
}

/**
 * Identifies uncovered line ranges
 * @param uncoveredLines - Array of uncovered line numbers
 * @returns Array of line ranges [start, end]
 */
export function getUncoveredRanges(uncoveredLines: number[]): [number, number][] {
  if (uncoveredLines.length === 0) {
    return [];
  }

  const sorted = [...uncoveredLines].sort((a, b) => a - b);
  const ranges: [number, number][] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push([start, end]);
      start = sorted[i];
      end = sorted[i];
    }
  }

  ranges.push([start, end]);
  return ranges;
}
