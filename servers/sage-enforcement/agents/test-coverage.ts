import { executePytestCoverage, createSandboxConfig } from '../utils/sandbox.js';
import { validatePath, getProjectRoot, isPythonFile } from '../utils/validation.js';
import {
  validateCoverageThreshold,
  meetsCoverageThreshold,
  getUncoveredRanges,
  DEFAULT_COVERAGE_THRESHOLD,
} from '../rules/test-standards.js';
import type { TestCoverageResult, TestCoverageInput, Violation } from '../schemas/index.js';
import { TestCoverageInputSchema } from '../schemas/index.js';

/**
 * Pytest coverage JSON output format
 */
interface PytestCoverageOutput {
  meta: {
    version: string;
    timestamp: string;
    branch_coverage: boolean;
  };
  files: {
    [filePath: string]: {
      executed_lines: number[];
      missing_lines: number[];
      excluded_lines: number[];
      summary: {
        covered_lines: number;
        num_statements: number;
        percent_covered: number;
        missing_lines: number;
      };
    };
  };
  totals: {
    covered_lines: number;
    num_statements: number;
    percent_covered: number;
    missing_lines: number;
  };
}

/**
 * Test coverage agent - enforces minimum test coverage thresholds
 * Validates test quality and ensures production code is adequately tested
 */
export class TestCoverage {
  private projectRoot: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || getProjectRoot();
  }

  /**
   * Validates input parameters
   * @param input - Test coverage input
   * @throws Error if validation fails
   */
  private validateInput(input: TestCoverageInput): void {
    const result = TestCoverageInputSchema.safeParse(input);

    if (!result.success) {
      throw new Error(`Invalid input: ${result.error.message}`);
    }

    if (!isPythonFile(input.filePath)) {
      throw new Error(`Not a Python file: ${input.filePath}`);
    }

    const validatedPath = validatePath(input.filePath, this.projectRoot);
    if (!validatedPath) {
      throw new Error(`Invalid file path: ${input.filePath}`);
    }

    validateCoverageThreshold(input.threshold);
  }

  /**
   * Parses pytest coverage JSON output
   * @param jsonOutput - JSON output from pytest --cov-report=json
   * @param filePath - File path being analyzed
   * @returns Coverage data
   */
  private parseCoverageOutput(
    jsonOutput: string,
    filePath: string
  ): {
    percentage: number;
    uncoveredLines: number[];
  } {
    try {
      const coverage: PytestCoverageOutput = JSON.parse(jsonOutput);

      // Find coverage data for the specific file
      const fileData = coverage.files[filePath];

      if (!fileData) {
        throw new Error(`No coverage data found for ${filePath}`);
      }

      return {
        percentage: Math.round(fileData.summary.percent_covered),
        uncoveredLines: fileData.missing_lines,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse coverage output: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Creates violations for uncovered code sections
   * @param filePath - File path
   * @param uncoveredLines - Array of uncovered line numbers
   * @param threshold - Coverage threshold
   * @param actualCoverage - Actual coverage percentage
   * @returns Array of violations
   */
  private createCoverageViolations(
    filePath: string,
    uncoveredLines: number[],
    threshold: number,
    actualCoverage: number
  ): Violation[] {
    const violations: Violation[] = [];

    // Check if coverage meets threshold
    if (!meetsCoverageThreshold(actualCoverage, threshold)) {
      violations.push({
        file: filePath,
        line: 1,
        column: 0,
        severity: 'error',
        rule: 'require-minimum-coverage',
        message: `Coverage ${actualCoverage}% below threshold ${threshold}%`,
        suggestion: `Add tests to increase coverage to at least ${threshold}%`,
        autoFixable: false,
      });
    }

    // Create violations for uncovered line ranges
    const ranges = getUncoveredRanges(uncoveredLines);

    for (const [start, end] of ranges) {
      const rangeText = start === end ? `line ${start}` : `lines ${start}-${end}`;
      violations.push({
        file: filePath,
        line: start,
        column: 0,
        severity: 'warning',
        rule: 'no-untested-functions',
        message: `Uncovered code: ${rangeText}`,
        suggestion: 'Add test coverage for this code section',
        autoFixable: false,
      });
    }

    return violations;
  }

  /**
   * Executes test coverage analysis for a Python file
   * @param input - Test coverage input
   * @returns Test coverage result with violations
   */
  async execute(input: TestCoverageInput): Promise<TestCoverageResult> {
    this.validateInput(input);

    const threshold = input.threshold ?? DEFAULT_COVERAGE_THRESHOLD;
    const violations: Violation[] = [];

    try {
      const sandboxConfig = createSandboxConfig({
        timeoutMs: 30000, // 30 seconds for test execution
        workingDirectory: this.projectRoot,
      });

      const result = await executePytestCoverage(input.filePath, threshold, sandboxConfig);

      // Parse coverage output
      let coverageData: { percentage: number; uncoveredLines: number[] };

      try {
        coverageData = this.parseCoverageOutput(result.stdout, input.filePath);
      } catch (parseError) {
        // If parsing fails, coverage might be 0%
        coverageData = {
          percentage: 0,
          uncoveredLines: [],
        };

        violations.push({
          file: input.filePath,
          line: 1,
          column: 0,
          severity: 'error',
          rule: 'require-minimum-coverage',
          message: 'No coverage data found - tests may be missing',
          suggestion: 'Create test file and add test coverage',
          autoFixable: false,
        });
      }

      // Create violations for coverage issues
      if (coverageData.percentage < threshold || coverageData.uncoveredLines.length > 0) {
        const coverageViolations = this.createCoverageViolations(
          input.filePath,
          coverageData.uncoveredLines,
          threshold,
          coverageData.percentage
        );
        violations.push(...coverageViolations);
      }

      // Calculate summary
      const summary = {
        errors: violations.filter(v => v.severity === 'error').length,
        warnings: violations.filter(v => v.severity === 'warning').length,
        info: violations.filter(v => v.severity === 'info').length,
      };

      return {
        violations,
        summary,
        coverage: {
          percentage: coverageData.percentage,
          uncoveredLines: coverageData.uncoveredLines,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Test coverage analysis failed: ${error.message}`);
      }
      throw error;
    }
  }
}

/**
 * Factory function to create test coverage instance
 * @param projectRoot - Optional project root directory
 * @returns Test coverage instance
 */
export function createTestCoverage(projectRoot?: string): TestCoverage {
  return new TestCoverage(projectRoot);
}
