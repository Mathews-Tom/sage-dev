import { validatePath, getProjectRoot, isPythonFile } from '../utils/validation.js';
import type { AgentResult, DocValidatorInput, Violation } from '../schemas/index.js';
import { DocValidatorInputSchema } from '../schemas/index.js';

/**
 * Python function/class definition pattern
 */
interface FunctionDefinition {
  name: string;
  line: number;
  type: 'function' | 'class' | 'method';
  hasDocstring: boolean;
  docstring?: string;
}

/**
 * Doc validator agent - validates Python docstring completeness and quality
 * Enforces Google-style docstrings with proper argument, return, and exception documentation
 */
export class DocValidator {
  private projectRoot: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || getProjectRoot();
  }

  /**
   * Validates input parameters
   * @param input - Doc validator input
   * @throws Error if validation fails
   */
  private validateInput(input: DocValidatorInput): void {
    const result = DocValidatorInputSchema.safeParse(input);

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
   * Extracts function and class definitions from Python code
   * @param code - Python source code
   * @returns Array of function/class definitions
   */
  private extractDefinitions(code: string): FunctionDefinition[] {
    const definitions: FunctionDefinition[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match function definitions
      const functionMatch = line.match(/^\s*def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
      if (functionMatch) {
        const name = functionMatch[1];

        // Skip private methods (starting with _) except __init__
        if (name.startsWith('_') && name !== '__init__') {
          continue;
        }

        // Check for docstring on next non-empty line
        let hasDocstring = false;
        let docstring: string | undefined;

        for (let j = i + 1; j < lines.length && j < i + 5; j++) {
          const nextLine = lines[j].trim();
          if (nextLine === '') continue;

          if (nextLine.startsWith('"""') || nextLine.startsWith("'''")) {
            hasDocstring = true;
            docstring = nextLine;
            break;
          }
          break;
        }

        definitions.push({
          name,
          line: i + 1,
          type: line.match(/^\s{4,}def/) ? 'method' : 'function',
          hasDocstring,
          docstring,
        });
      }

      // Match class definitions
      const classMatch = line.match(/^\s*class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
      if (classMatch) {
        const name = classMatch[1];

        // Check for docstring on next non-empty line
        let hasDocstring = false;
        let docstring: string | undefined;

        for (let j = i + 1; j < lines.length && j < i + 5; j++) {
          const nextLine = lines[j].trim();
          if (nextLine === '') continue;

          if (nextLine.startsWith('"""') || nextLine.startsWith("'''")) {
            hasDocstring = true;
            docstring = nextLine;
            break;
          }
          break;
        }

        definitions.push({
          name,
          line: i + 1,
          type: 'class',
          hasDocstring,
          docstring,
        });
      }
    }

    return definitions;
  }

  /**
   * Validates docstring quality (Google-style)
   * @param definition - Function/class definition
   * @param code - Full source code
   * @returns Array of violations
   */
  private validateDocstring(definition: FunctionDefinition, code: string, filePath: string): Violation[] {
    const violations: Violation[] = [];

    // Check if docstring exists
    if (!definition.hasDocstring) {
      violations.push({
        file: filePath,
        line: definition.line,
        column: 0,
        severity: 'error',
        rule: 'require-docstring',
        message: `${definition.type} '${definition.name}' missing docstring`,
        suggestion: 'Add Google-style docstring with description, Args, Returns, and Raises sections',
        autoFixable: false,
      });
      return violations;
    }

    // For functions/methods, check for Args and Returns sections
    if (definition.type === 'function' || definition.type === 'method') {
      const lines = code.split('\n');
      const functionLine = lines[definition.line - 1];

      // Check if function has parameters (excluding self/cls)
      const paramsMatch = functionLine.match(/\(([^)]+)\)/);
      if (paramsMatch) {
        const params = paramsMatch[1]
          .split(',')
          .map(p => p.trim().split(':')[0].trim())
          .filter(p => p !== 'self' && p !== 'cls' && p !== '');

        if (params.length > 0) {
          // Check for Args section in docstring
          const docstringLines = this.getFullDocstring(code, definition.line);
          const hasArgsSection = docstringLines.some(line => line.trim() === 'Args:');

          if (!hasArgsSection) {
            violations.push({
              file: filePath,
              line: definition.line,
              column: 0,
              severity: 'warning',
              rule: 'require-args-section',
              message: `${definition.type} '${definition.name}' missing Args section in docstring`,
              suggestion: 'Add Args section documenting all parameters',
              autoFixable: false,
            });
          }
        }
      }

      // Check for Returns section (skip __init__ and methods with -> None)
      if (definition.name !== '__init__') {
        const hasReturnAnnotation = functionLine.includes('->') && !functionLine.includes('-> None');
        const docstringLines = this.getFullDocstring(code, definition.line);
        const hasReturnsSection = docstringLines.some(line => line.trim() === 'Returns:');

        if (hasReturnAnnotation && !hasReturnsSection) {
          violations.push({
            file: filePath,
            line: definition.line,
            column: 0,
            severity: 'warning',
            rule: 'require-returns-section',
            message: `${definition.type} '${definition.name}' missing Returns section in docstring`,
            suggestion: 'Add Returns section documenting return value',
            autoFixable: false,
          });
        }
      }
    }

    return violations;
  }

  /**
   * Extracts full docstring for a definition
   * @param code - Full source code
   * @param startLine - Line number where definition starts
   * @returns Docstring lines
   */
  private getFullDocstring(code: string, startLine: number): string[] {
    const lines = code.split('\n');
    const docstringLines: string[] = [];
    let inDocstring = false;
    let quoteType = '';

    for (let i = startLine; i < lines.length && i < startLine + 50; i++) {
      const line = lines[i];

      if (!inDocstring) {
        if (line.includes('"""')) {
          inDocstring = true;
          quoteType = '"""';
          docstringLines.push(line);
          if (line.indexOf('"""') !== line.lastIndexOf('"""')) {
            break; // Single-line docstring
          }
        } else if (line.includes("'''")) {
          inDocstring = true;
          quoteType = "'''";
          docstringLines.push(line);
          if (line.indexOf("'''") !== line.lastIndexOf("'''")) {
            break; // Single-line docstring
          }
        }
      } else {
        docstringLines.push(line);
        if (line.includes(quoteType)) {
          break;
        }
      }
    }

    return docstringLines;
  }

  /**
   * Executes doc validation for a Python file
   * @param input - Doc validator input
   * @returns Agent result with violations
   */
  async execute(input: DocValidatorInput): Promise<AgentResult> {
    this.validateInput(input);

    const violations: Violation[] = [];

    // Extract function and class definitions
    const definitions = this.extractDefinitions(input.code);

    // Validate each definition's docstring
    for (const definition of definitions) {
      const defViolations = this.validateDocstring(definition, input.code, input.filePath);
      violations.push(...defViolations);
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
 * Factory function to create doc validator instance
 * @param projectRoot - Optional project root directory
 * @returns Doc validator instance
 */
export function createDocValidator(projectRoot?: string): DocValidator {
  return new DocValidator(projectRoot);
}
