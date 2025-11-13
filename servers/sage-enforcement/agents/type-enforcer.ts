/**
 * Type Enforcer Agent
 *
 * Validates Python 3.12 type annotations using Pyright static analysis.
 * Detects missing return types, deprecated typing imports, and inappropriate Any usage.
 *
 * Performance: 3-5x faster than mypy
 * Standards: PEP 585 (built-in generics), PEP 604 (union syntax), PEP 698 (override)
 *
 * @see https://github.com/microsoft/pyright - Pyright documentation
 */

import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  TypeCheckInputSchema,
  AgentResultSchema,
  ViolationSchema,
  type TypeCheckInput,
  type AgentResult,
  type Violation,
} from '../schemas/index.js';

/**
 * Pyright Diagnostic from JSON Output
 *
 * Structure returned by `pyright --outputjson`
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

interface PyrightOutput {
  version: string;
  time: string;
  generalDiagnostics: PyrightDiagnostic[];
  summary: {
    filesAnalyzed: number;
    errorCount: number;
    warningCount: number;
    informationCount: number;
    timeInSec: number;
  };
}

/**
 * Execute Pyright Type Checker
 *
 * Spawns Pyright subprocess with --outputjson flag and parses results.
 *
 * @param filePath - Absolute path to Python file
 * @param code - Python code to analyze
 * @returns Pyright output with diagnostics
 */
async function executePyright(_filePath: string, code: string): Promise<PyrightOutput> {
  // Write code to temporary file (Pyright requires a file on disk)
  const tempFile = join(tmpdir(), `sage-enforcement-${Date.now()}.py`);
  writeFileSync(tempFile, code, 'utf-8');

  try {
    return await new Promise((resolve, reject) => {
      const pyright = spawn('pyright', ['--outputjson', tempFile]);

      let stdout = '';
      let stderr = '';

      pyright.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pyright.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pyright.on('close', (_code) => {
        // Pyright returns non-zero exit code if violations found
        // This is expected, not an error
        try {
          const output = JSON.parse(stdout) as PyrightOutput;
          resolve(output);
        } catch (error) {
          reject(new Error(`Failed to parse Pyright output: ${stderr || stdout}`));
        }
      });

      pyright.on('error', (error) => {
        reject(new Error(`Failed to spawn Pyright: ${error.message}`));
      });
    });
  } finally {
    // Cleanup temporary file
    try {
      unlinkSync(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Convert Pyright Diagnostic to Violation
 *
 * Maps Pyright severity levels to our Violation severity enum.
 * Adds auto-fix suggestions for common type violations.
 *
 * @param diagnostic - Pyright diagnostic
 * @param filePath - Original file path (not temp file)
 * @returns Violation object
 */
function pyrightToViolation(diagnostic: PyrightDiagnostic, filePath: string): Violation {
  // Map Pyright severity to our enum
  const severityMap: Record<string, 'error' | 'warning' | 'info'> = {
    error: 'error',
    warning: 'warning',
    information: 'info',
  };

  // Detect rule from message patterns
  let rule = diagnostic.rule || 'type-error';
  let suggestion: string | undefined;
  let autoFixable = false;

  const message = diagnostic.message;

  // Missing return type annotation
  if (message.includes('missing return type annotation')) {
    rule = 'missing-return-type';
    suggestion = 'Add return type annotation: -> <type>';
    autoFixable = true;
  }
  // Deprecated typing imports
  else if (message.includes('List') && message.includes('deprecated')) {
    rule = 'deprecated-typing-list';
    suggestion = 'Use built-in list[] instead of typing.List[]';
    autoFixable = true;
  } else if (message.includes('Dict') && message.includes('deprecated')) {
    rule = 'deprecated-typing-dict';
    suggestion = 'Use built-in dict[] instead of typing.Dict[]';
    autoFixable = true;
  } else if (message.includes('Optional') && message.includes('deprecated')) {
    rule = 'deprecated-typing-optional';
    suggestion = 'Use | None instead of typing.Optional[]';
    autoFixable = true;
  } else if (message.includes('Union') && message.includes('deprecated')) {
    rule = 'deprecated-typing-union';
    suggestion = 'Use | instead of typing.Union[]';
    autoFixable = true;
  }
  // Inappropriate Any usage
  else if (message.includes('Any') || message.includes('type "Any"')) {
    rule = 'inappropriate-any';
    suggestion = 'Replace Any with a more specific type';
    autoFixable = false;
  }

  return ViolationSchema.parse({
    file: filePath,
    line: diagnostic.range.start.line + 1, // Pyright uses 0-indexed, we use 1-indexed
    column: diagnostic.range.start.character,
    severity: severityMap[diagnostic.severity] || 'error',
    rule,
    message,
    suggestion,
    autoFixable,
  });
}

/**
 * Type Enforcer Agent
 *
 * Validates Python 3.12 type annotations using Pyright.
 * Returns top 10 error violations (filtered in agent, not context).
 *
 * Example usage:
 * ```typescript
 * const result = await typeEnforcer({
 *   filePath: '/path/to/file.py',
 *   code: 'def foo(x: int): return x * 2',
 *   standards: { enforceReturnTypes: true }
 * });
 * ```
 *
 * @param input - Type check parameters
 * @returns Agent result with violations
 */
export async function typeEnforcer(input: unknown): Promise<AgentResult> {
  const startTime = Date.now();

  // Validate input with Zod schema
  const validated = TypeCheckInputSchema.parse(input) as TypeCheckInput;

  try {
    // Execute Pyright
    const pyrightOutput = await executePyright(validated.filePath, validated.code);

    // Convert Pyright diagnostics to Violations
    const allViolations = pyrightOutput.generalDiagnostics.map((diagnostic) =>
      pyrightToViolation(diagnostic, validated.filePath)
    );

    // Filter to errors only (top 10)
    const errorViolations = allViolations
      .filter((v) => v.severity === 'error')
      .slice(0, 10);

    // Filter to warnings (top 10)
    const warningViolations = allViolations
      .filter((v) => v.severity === 'warning')
      .slice(0, 10);

    // Combine: errors first, then warnings
    const violations = [...errorViolations, ...warningViolations];

    // Calculate execution time
    const executionTime = Date.now() - startTime;

    // Estimate tokens used (rough approximation)
    const tokensUsed = violations.length * 50; // ~50 tokens per violation

    // Build result
    const result: AgentResult = {
      agent: 'type-enforcer',
      executionTime,
      tokensUsed,
      violations,
      summary: {
        errors: pyrightOutput.summary.errorCount,
        warnings: pyrightOutput.summary.warningCount,
        info: pyrightOutput.summary.informationCount,
      },
    };

    return AgentResultSchema.parse(result);
  } catch (error) {
    // Handle Pyright execution errors
    if (error instanceof Error) {
      if (error.message.includes('Failed to spawn Pyright')) {
        throw new Error(
          'Pyright not found. Install with: npm install -g pyright'
        );
      }
      throw error;
    }
    throw new Error('Unknown error during type checking');
  }
}
