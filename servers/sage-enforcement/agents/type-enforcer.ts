import { executePyright, createSandboxConfig } from '../utils/sandbox.js';
import { validatePath, getProjectRoot, isPythonFile } from '../utils/validation.js';
import { isDeprecatedImport, getBuiltinReplacement, TYPING_RULES } from '../rules/typing-standards.js';
import type { AgentResult, TypeEnforcerInput, Violation } from '../schemas/index.js';
import { TypeEnforcerInputSchema } from '../schemas/index.js';

/**
 * Pyright diagnostic from JSON output
 */
interface PyrightDiagnostic {
  file: string;
  severity: 'error' | 'warning' | 'information';
  message: string;
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  rule?: string;
}

/**
 * Pyright JSON output format
 */
interface PyrightOutput {
  version: string;
  time: string;
  generalDiagnostics: PyrightDiagnostic[];
  summary: {
    filesAnalyzed: number;
    errorCount: number;
    warningCount: number;
    informationCount: number;
  };
}

/**
 * Type enforcer agent - validates Python type annotations using Pyright
 * Enforces Python 3.12 typing standards and detects deprecated typing imports
 */
export class TypeEnforcer {
  private projectRoot: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || getProjectRoot();
  }

  /**
   * Validates input parameters
   * @param input - Type enforcer input
   * @throws Error if validation fails
   */
  private validateInput(input: TypeEnforcerInput): void {
    const result = TypeEnforcerInputSchema.safeParse(input);

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
  }

  /**
   * Detects deprecated typing imports in code
   * @param code - Python source code
   * @returns Array of violations for deprecated imports
   */
  private detectDeprecatedImports(code: string, filePath: string): Violation[] {
    const violations: Violation[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const importMatch = line.match(/from\s+typing\s+import\s+(.+)/);

      if (!importMatch) continue;

      const imports = importMatch[1].split(',').map(s => s.trim());

      for (const importName of imports) {
        const cleanImport = importName.replace(/\s+as\s+.+/, '').trim();

        if (isDeprecatedImport(cleanImport)) {
          const replacement = getBuiltinReplacement(cleanImport);
          const rule = TYPING_RULES.find(r => r.id === `no-legacy-${cleanImport.toLowerCase()}`);

          violations.push({
            file: filePath,
            line: i + 1,
            column: line.indexOf(cleanImport),
            severity: 'error',
            rule: rule?.id || 'no-legacy-typing',
            message: `Deprecated import: typing.${cleanImport}. Use ${replacement} instead.`,
            suggestion: replacement ? `Replace typing.${cleanImport} with ${replacement}` : undefined,
            autoFixable: true,
          });
        }
      }
    }

    return violations;
  }

  /**
   * Converts Pyright diagnostic to Violation
   * @param diagnostic - Pyright diagnostic
   * @returns Violation object
   */
  private convertDiagnostic(diagnostic: PyrightDiagnostic): Violation {
    const severity = diagnostic.severity === 'error' ? 'error' : 
                     diagnostic.severity === 'warning' ? 'warning' : 'info';

    return {
      file: diagnostic.file,
      line: diagnostic.range.start.line + 1,
      column: diagnostic.range.start.character,
      severity,
      rule: diagnostic.rule || 'type-error',
      message: diagnostic.message,
      autoFixable: false,
    };
  }

  /**
   * Executes type enforcement for a Python file
   * @param input - Type enforcer input
   * @returns Agent result with violations
   */
  async execute(input: TypeEnforcerInput): Promise<AgentResult> {
    this.validateInput(input);

    const violations: Violation[] = [];

    // Step 1: Check for deprecated typing imports
    const deprecatedImports = this.detectDeprecatedImports(input.code, input.filePath);
    violations.push(...deprecatedImports);

    // Step 2: Run Pyright type checker
    try {
      const sandboxConfig = createSandboxConfig({
        timeoutMs: 15000, // 15 seconds for type checking
        workingDirectory: this.projectRoot,
      });

      const result = await executePyright(input.filePath, sandboxConfig);

      if (result.stdout) {
        const pyrightOutput: PyrightOutput = JSON.parse(result.stdout);

        // Convert Pyright diagnostics to violations
        for (const diagnostic of pyrightOutput.generalDiagnostics) {
          violations.push(this.convertDiagnostic(diagnostic));
        }
      }

      if (result.stderr && result.exitCode !== 0) {
        throw new Error(`Pyright execution failed: ${result.stderr}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Type enforcement failed: ${error.message}`);
      }
      throw error;
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
    };
  }
}

/**
 * Factory function to create type enforcer instance
 * @param projectRoot - Optional project root directory
 * @returns Type enforcer instance
 */
export function createTypeEnforcer(projectRoot?: string): TypeEnforcer {
  return new TypeEnforcer(projectRoot);
}
