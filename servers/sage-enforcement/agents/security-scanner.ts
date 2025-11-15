import { validatePath, getProjectRoot } from '../utils/validation.js';
import {
  scanForSecrets,
  scanForSqlInjection,
  scanForCommandInjection,
} from '../rules/security-standards.js';
import type { SecurityScannerResult, SecurityScannerInput, Violation } from '../schemas/index.js';
import { SecurityScannerInputSchema } from '../schemas/index.js';

/**
 * Security scanner agent - detects hardcoded secrets, API keys, credentials, and security vulnerabilities
 * Prevents credential leaks to version control and enforces secure coding practices
 */
export class SecurityScanner {
  private projectRoot: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || getProjectRoot();
  }

  /**
   * Validates input parameters
   * @param input - Security scanner input
   * @throws Error if validation fails
   */
  private validateInput(input: SecurityScannerInput): void {
    const result = SecurityScannerInputSchema.safeParse(input);

    if (!result.success) {
      throw new Error(`Invalid input: ${result.error.message}`);
    }

    const validatedPath = validatePath(input.filePath, this.projectRoot);
    if (!validatedPath) {
      throw new Error(`Invalid file path: ${input.filePath}`);
    }
  }

  /**
   * Converts security finding to violation
   * @param finding - Security finding
   * @param filePath - File path
   * @param ruleId - Rule identifier
   * @returns Violation object
   */
  private findingToViolation(
    finding: { id: string; description: string; line: number },
    filePath: string,
    ruleId: string
  ): Violation {
    return {
      file: filePath,
      line: finding.line,
      column: 0,
      severity: 'error',
      rule: ruleId,
      message: finding.description,
      suggestion: this.getSuggestionForRule(ruleId),
      autoFixable: false,
    };
  }

  /**
   * Gets security suggestion for a rule
   * @param ruleId - Rule identifier
   * @returns Security fix suggestion
   */
  private getSuggestionForRule(ruleId: string): string {
    const suggestions: Record<string, string> = {
      'no-hardcoded-secrets': 'Move secrets to environment variables or secure credential store',
      'no-sql-injection': 'Use parameterized queries instead of string concatenation',
      'no-command-injection': 'Use subprocess with list arguments instead of shell=True',
      'no-code-injection': 'Avoid eval() and exec() or sanitize input thoroughly',
    };

    return suggestions[ruleId] || 'Review and fix security vulnerability';
  }

  /**
   * Executes security scan for a file
   * @param input - Security scanner input
   * @returns Security scanner result with violations
   */
  async execute(input: SecurityScannerInput): Promise<SecurityScannerResult> {
    this.validateInput(input);

    const violations: Violation[] = [];

    // Step 1: Scan for hardcoded secrets
    const secretFindings = scanForSecrets(input.code);
    for (const finding of secretFindings) {
      violations.push(this.findingToViolation(finding, input.filePath, 'no-hardcoded-secrets'));
    }

    // Step 2: Scan for SQL injection vulnerabilities
    const sqlFindings = scanForSqlInjection(input.code);
    for (const finding of sqlFindings) {
      violations.push(this.findingToViolation(finding, input.filePath, 'no-sql-injection'));
    }

    // Step 3: Scan for command injection vulnerabilities
    const commandFindings = scanForCommandInjection(input.code);
    for (const finding of commandFindings) {
      violations.push(this.findingToViolation(finding, input.filePath, 'no-command-injection'));
    }

    // Calculate summary
    const summary = {
      errors: violations.filter(v => v.severity === 'error').length,
      warnings: violations.filter(v => v.severity === 'warning').length,
      info: violations.filter(v => v.severity === 'info').length,
    };

    // Count critical vulnerabilities (hardcoded secrets)
    const criticalCount = violations.filter(v => v.rule === 'no-hardcoded-secrets').length;

    return {
      violations,
      summary,
      criticalCount,
    };
  }
}

/**
 * Factory function to create security scanner instance
 * @param projectRoot - Optional project root directory
 * @returns Security scanner instance
 */
export function createSecurityScanner(projectRoot?: string): SecurityScanner {
  return new SecurityScanner(projectRoot);
}
