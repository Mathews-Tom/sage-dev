/**
 * Test Coverage Standards
 *
 * Defines test coverage and quality standards conforming to:
 * - pytest-cov coverage metrics
 * - Industry best practices (80% minimum coverage)
 * - Function-level coverage requirements
 *
 * Configurable strictness levels: strict, moderate, lenient
 * Supports project-specific coverage thresholds
 *
 * @see https://pytest-cov.readthedocs.io/ - pytest-cov documentation
 */

/**
 * Test Standards Configuration
 *
 * Defines which test coverage rules to enforce during validation.
 */
export interface TestStandards {
  /** Minimum coverage percentage (0-100) */
  minCoverage: number;

  /** Block commits if coverage falls below threshold */
  blockCommitBelowThreshold: boolean;

  /** Require per-function coverage tracking */
  requireFunctionCoverage: boolean;

  /** Require branch coverage (not just line coverage) */
  requireBranchCoverage?: boolean;

  /** Excluded paths from coverage requirements */
  excludePaths?: string[];
}

/**
 * Strictness Levels
 *
 * Predefined configurations for different enforcement levels.
 */
export type StrictnessLevel = 'strict' | 'moderate' | 'lenient';

/**
 * Strict Test Standards
 *
 * Enforces rigorous test coverage requirements:
 * - 90% minimum coverage
 * - Block commits below threshold
 * - Require function-level coverage
 * - Require branch coverage
 * - No exclusions
 *
 * Recommended for: production code, libraries, critical systems
 */
export const STRICT_STANDARDS: TestStandards = {
  minCoverage: 90,
  blockCommitBelowThreshold: true,
  requireFunctionCoverage: true,
  requireBranchCoverage: true,
  excludePaths: [],
};

/**
 * Moderate Test Standards
 *
 * Balanced coverage enforcement:
 * - 80% minimum coverage (industry standard)
 * - Block commits below threshold
 * - Require function-level coverage
 * - Branch coverage optional
 * - Exclude test utilities
 *
 * Recommended for: most projects, internal tools, APIs
 */
export const MODERATE_STANDARDS: TestStandards = {
  minCoverage: 80,
  blockCommitBelowThreshold: true,
  requireFunctionCoverage: true,
  requireBranchCoverage: false,
  excludePaths: ['tests/utils/*', 'tests/fixtures/*'],
};

/**
 * Lenient Test Standards
 *
 * Minimal coverage enforcement:
 * - 60% minimum coverage
 * - Warn but don't block commits
 * - Function-level coverage optional
 * - No branch coverage requirement
 * - Exclude tests and scripts
 *
 * Recommended for: legacy code, prototypes, exploratory work
 */
export const LENIENT_STANDARDS: TestStandards = {
  minCoverage: 60,
  blockCommitBelowThreshold: false,
  requireFunctionCoverage: false,
  requireBranchCoverage: false,
  excludePaths: ['tests/*', 'scripts/*', 'examples/*'],
};

/**
 * Default Test Standards
 *
 * Defaults to MODERATE_STANDARDS for balanced enforcement.
 * Override with STRICT_STANDARDS or LENIENT_STANDARDS as needed.
 */
export const DEFAULT_STANDARDS: TestStandards = MODERATE_STANDARDS;

/**
 * TEST_STANDARDS Object
 *
 * Main export providing access to all standard configurations.
 *
 * Usage:
 * ```typescript
 * import { TEST_STANDARDS } from './rules/test-standards.js';
 *
 * const standards = TEST_STANDARDS.strict;
 * const result = await testCoverage({
 *   filePath: '/path/to/file.py',
 *   threshold: standards.minCoverage
 * });
 * ```
 */
export const TEST_STANDARDS = {
  strict: STRICT_STANDARDS,
  moderate: MODERATE_STANDARDS,
  lenient: LENIENT_STANDARDS,
  default: DEFAULT_STANDARDS,
} as const;

/**
 * Get Test Standards by Level
 *
 * Helper function to retrieve standards by strictness level.
 *
 * @param level - Strictness level (strict, moderate, lenient)
 * @returns Test standards configuration
 *
 * @example
 * ```typescript
 * const standards = getTestStandards('strict');
 * // Returns STRICT_STANDARDS
 * ```
 */
export function getTestStandards(level: StrictnessLevel): TestStandards {
  switch (level) {
    case 'strict':
      return STRICT_STANDARDS;
    case 'moderate':
      return MODERATE_STANDARDS;
    case 'lenient':
      return LENIENT_STANDARDS;
    default:
      throw new Error(`Invalid strictness level: ${level}`);
  }
}

/**
 * Create Custom Test Standards
 *
 * Factory function to create custom standards by extending a base level.
 *
 * @param base - Base strictness level to extend
 * @param overrides - Custom overrides to apply
 * @returns Custom test standards configuration
 *
 * @example
 * ```typescript
 * const customStandards = createCustomStandards('moderate', {
 *   minCoverage: 85,
 *   excludePaths: ['legacy/*']
 * });
 * ```
 */
export function createCustomStandards(
  base: StrictnessLevel,
  overrides: Partial<TestStandards>
): TestStandards {
  const baseStandards = getTestStandards(base);
  return {
    ...baseStandards,
    ...overrides,
  };
}

/**
 * Validate Test Standards
 *
 * Ensures standards configuration is valid and consistent.
 *
 * @param standards - Standards to validate
 * @throws Error if standards are invalid
 *
 * @example
 * ```typescript
 * validateTestStandards(STRICT_STANDARDS); // OK
 * validateTestStandards({ minCoverage: 150 }); // Throws
 * ```
 */
export function validateTestStandards(standards: Partial<TestStandards>): void {
  // Validate coverage percentage
  if (standards.minCoverage !== undefined) {
    if (standards.minCoverage < 0 || standards.minCoverage > 100) {
      throw new Error(
        `Invalid minCoverage: ${standards.minCoverage}. Must be between 0 and 100.`
      );
    }
    if (standards.minCoverage < 60) {
      console.warn(
        `Low coverage threshold: ${standards.minCoverage}%. Industry standard is 80%+.`
      );
    }
  }

  // Validate consistency: blockCommitBelowThreshold with low coverage
  if (
    standards.blockCommitBelowThreshold &&
    standards.minCoverage !== undefined &&
    standards.minCoverage < 50
  ) {
    console.warn(
      `Blocking commits with ${standards.minCoverage}% threshold may be too strict. Consider raising threshold or disabling blocking.`
    );
  }
}
