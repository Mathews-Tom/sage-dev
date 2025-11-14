/**
 * Documentation Validator Agent
 *
 * Validates Google-style docstrings for Python functions and classes.
 * Detects missing Args, Returns, and Raises sections.
 *
 * Standards: Google Python Style Guide
 * Method: AST parsing via Python subprocess
 *
 * @see https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings
 */

import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  DocValidationInputSchema,
  AgentResultSchema,
  ViolationSchema,
  type DocValidationInput,
  type AgentResult,
  type Violation,
} from '../schemas/index.js';

/**
 * Docstring Analysis Result from Python AST Parser
 *
 * Structure returned by our Python AST analysis script
 */
interface DocstringAnalysis {
  file: string;
  functions: Array<{
    name: string;
    line: number;
    params: string[];
    returns: boolean;
    raises: string[];
    docstring: {
      exists: boolean;
      hasArgs: boolean;
      hasReturns: boolean;
      hasRaises: boolean;
      documentedParams: string[];
      missingParams: string[];
    };
  }>;
  classes: Array<{
    name: string;
    line: number;
    docstring: {
      exists: boolean;
    };
  }>;
}

/**
 * Python AST Parser Script
 *
 * Embedded Python script to analyze docstrings using AST module.
 * This avoids external dependencies and keeps the agent self-contained.
 */
const PYTHON_AST_PARSER = `
import ast
import sys
import json

def analyze_docstring(docstring, params, returns_value):
    """Analyze a Google-style docstring for completeness."""
    if not docstring:
        return {
            "exists": False,
            "hasArgs": False,
            "hasReturns": False,
            "hasRaises": False,
            "documentedParams": [],
            "missingParams": params
        }

    has_args = "Args:" in docstring
    has_returns = "Returns:" in docstring
    has_raises = "Raises:" in docstring

    # Extract documented parameters
    documented_params = []
    if has_args:
        lines = docstring.split("\\n")
        in_args = False
        for line in lines:
            if "Args:" in line:
                in_args = True
                continue
            if in_args:
                if line.strip() and line.strip()[0].isalpha():
                    param_name = line.strip().split(":")[0].strip().split()[0]
                    documented_params.append(param_name)
                elif not line.strip() or line.strip().startswith(("Returns:", "Raises:")):
                    break

    missing_params = [p for p in params if p not in documented_params and p != 'self' and p != 'cls']

    return {
        "exists": True,
        "hasArgs": has_args,
        "hasReturns": has_returns,
        "hasRaises": has_raises,
        "documentedParams": documented_params,
        "missingParams": missing_params
    }

def analyze_file(code):
    """Analyze Python file for docstring compliance."""
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return {
            "error": f"Syntax error: {e}",
            "functions": [],
            "classes": []
        }

    functions = []
    classes = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            docstring = ast.get_docstring(node)
            params = [arg.arg for arg in node.args.args]
            returns_value = any(isinstance(n, ast.Return) and n.value is not None for n in ast.walk(node))

            doc_analysis = analyze_docstring(docstring, params, returns_value)

            functions.append({
                "name": node.name,
                "line": node.lineno,
                "params": params,
                "returns": returns_value,
                "raises": [],
                "docstring": doc_analysis
            })

        elif isinstance(node, ast.ClassDef):
            docstring = ast.get_docstring(node)
            classes.append({
                "name": node.name,
                "line": node.lineno,
                "docstring": {
                    "exists": docstring is not None
                }
            })

    return {
        "file": sys.argv[1] if len(sys.argv) > 1 else "unknown",
        "functions": functions,
        "classes": classes
    }

if __name__ == "__main__":
    code = sys.stdin.read()
    result = analyze_file(code)
    print(json.dumps(result))
`;

/**
 * Execute Python AST Parser
 *
 * Spawns Python subprocess with embedded AST analysis script.
 *
 * @param filePath - Absolute path to Python file
 * @param code - Python code to analyze
 * @returns Docstring analysis results
 */
async function executePythonParser(filePath: string, code: string): Promise<DocstringAnalysis> {
  // Write Python parser script to temporary file
  const parserScript = join(tmpdir(), `sage-doc-parser-${Date.now()}.py`);
  writeFileSync(parserScript, PYTHON_AST_PARSER, 'utf-8');

  try {
    return await new Promise((resolve, reject) => {
      const python = spawn('python3', [parserScript, filePath]);

      let stdout = '';
      let stderr = '';

      // Feed code via stdin
      python.stdin.write(code);
      python.stdin.end();

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python parser failed: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout) as DocstringAnalysis;
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${stderr || stdout}`));
        }
      });

      python.on('error', (error) => {
        reject(new Error(`Failed to spawn Python: ${error.message}`));
      });
    });
  } finally {
    // Cleanup temporary script
    try {
      unlinkSync(parserScript);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Convert Analysis Result to Violations
 *
 * Transforms AST analysis results into structured violations.
 *
 * @param analysis - Docstring analysis from Python
 * @param filePath - Original file path
 * @returns Array of violations
 */
function analysisToViolations(analysis: DocstringAnalysis, filePath: string): Violation[] {
  const violations: Violation[] = [];

  // Check if analysis had errors
  if ('error' in analysis) {
    violations.push(
      ViolationSchema.parse({
        file: filePath,
        line: 1,
        column: 0,
        severity: 'error',
        rule: 'syntax-error',
        message: (analysis as unknown as { error: string }).error,
        suggestion: 'Fix syntax errors before docstring validation',
        autoFixable: false,
      })
    );
    return violations;
  }

  // Check functions
  for (const func of analysis.functions) {
    const { name, line, params, returns, docstring } = func;

    // Missing docstring entirely
    if (!docstring.exists) {
      violations.push(
        ViolationSchema.parse({
          file: filePath,
          line,
          column: 0,
          severity: 'error',
          rule: 'missing-docstring',
          message: `Function '${name}' missing docstring`,
          suggestion: `Add Google-style docstring to function '${name}'`,
          autoFixable: false,
        })
      );
      continue;
    }

    // Missing Args section when function has parameters
    const hasParams = params.length > 0 && params.some(p => p !== 'self' && p !== 'cls');
    if (hasParams && !docstring.hasArgs) {
      violations.push(
        ViolationSchema.parse({
          file: filePath,
          line,
          column: 0,
          severity: 'warning',
          rule: 'missing-args-section',
          message: `Function '${name}' missing Args section in docstring`,
          suggestion: `Add 'Args:' section documenting parameters: ${params.filter(p => p !== 'self' && p !== 'cls').join(', ')}`,
          autoFixable: false,
        })
      );
    }

    // Missing Returns section when function returns a value
    if (returns && !docstring.hasReturns) {
      violations.push(
        ViolationSchema.parse({
          file: filePath,
          line,
          column: 0,
          severity: 'warning',
          rule: 'missing-returns-section',
          message: `Function '${name}' missing Returns section in docstring`,
          suggestion: `Add 'Returns:' section describing return value`,
          autoFixable: false,
        })
      );
    }

    // Undocumented parameters
    if (docstring.missingParams.length > 0) {
      violations.push(
        ViolationSchema.parse({
          file: filePath,
          line,
          column: 0,
          severity: 'warning',
          rule: 'incomplete-args',
          message: `Function '${name}' has undocumented parameters: ${docstring.missingParams.join(', ')}`,
          suggestion: `Document all parameters in Args section`,
          autoFixable: false,
        })
      );
    }
  }

  // Check classes
  for (const cls of analysis.classes) {
    if (!cls.docstring.exists) {
      violations.push(
        ViolationSchema.parse({
          file: filePath,
          line: cls.line,
          column: 0,
          severity: 'warning',
          rule: 'missing-class-docstring',
          message: `Class '${cls.name}' missing docstring`,
          suggestion: `Add Google-style docstring to class '${cls.name}'`,
          autoFixable: false,
        })
      );
    }
  }

  return violations;
}

/**
 * Documentation Validator Agent
 *
 * Validates Google-style docstrings using Python AST parsing.
 * Returns top 10 error violations, then warnings (filtered in agent).
 *
 * Example usage:
 * ```typescript
 * const result = await docValidator({
 *   filePath: '/path/to/file.py',
 *   code: 'def foo(x, y):\n    return x + y'
 * });
 * ```
 *
 * @param input - Documentation validation parameters
 * @returns Agent result with violations
 */
export async function docValidator(input: unknown): Promise<AgentResult> {
  const startTime = Date.now();

  // Validate input with Zod schema
  const validated = DocValidationInputSchema.parse(input) as DocValidationInput;

  try {
    // Execute Python AST parser
    const analysis = await executePythonParser(validated.filePath, validated.code);

    // Convert analysis to violations
    const allViolations = analysisToViolations(analysis, validated.filePath);

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

    // Estimate tokens used
    const tokensUsed = violations.length * 50;

    // Count violations by severity
    const errors = allViolations.filter((v) => v.severity === 'error').length;
    const warnings = allViolations.filter((v) => v.severity === 'warning').length;
    const info = allViolations.filter((v) => v.severity === 'info').length;

    // Build result
    const result: AgentResult = {
      agent: 'doc-validator',
      executionTime,
      tokensUsed,
      violations,
      summary: {
        errors,
        warnings,
        info,
      },
    };

    return AgentResultSchema.parse(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to spawn Python')) {
        throw new Error(
          'Python 3 not found. Ensure python3 is installed and in PATH'
        );
      }
      throw error;
    }
    throw new Error('Unknown error during docstring validation');
  }
}
