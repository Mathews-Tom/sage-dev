import * as path from 'path';
import * as fs from 'fs';

/**
 * Validates that a file path is within the project directory
 * Prevents directory traversal attacks
 * @param inputPath - User-provided file path
 * @param projectRoot - Project root directory
 * @returns Validated absolute path
 * @throws Error if path traversal detected
 */
export function validatePath(inputPath: string, projectRoot: string): string {
  const resolved = path.resolve(projectRoot, inputPath);

  if (!resolved.startsWith(projectRoot)) {
    throw new Error(`Path traversal detected: ${inputPath}`);
  }

  return resolved;
}

/**
 * Checks if a file exists and is readable
 * @param filePath - Absolute file path
 * @returns true if file exists and is readable
 */
export function isFileReadable(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates Python file path (must have .py extension)
 * @param filePath - File path to validate
 * @returns true if valid Python file
 */
export function isPythonFile(filePath: string): boolean {
  return path.extname(filePath).toLowerCase() === '.py';
}

/**
 * Validates TypeScript/JavaScript file path
 * @param filePath - File path to validate
 * @returns true if valid TS/JS file
 */
export function isTypeScriptOrJavaScript(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.ts' || ext === '.js' || ext === '.tsx' || ext === '.jsx';
}

/**
 * Sanitizes file path by normalizing and validating
 * @param inputPath - User-provided path
 * @param projectRoot - Project root directory
 * @returns Sanitized absolute path
 */
export function sanitizePath(inputPath: string, projectRoot: string): string {
  const validated = validatePath(inputPath, projectRoot);
  const normalized = path.normalize(validated);
  return normalized;
}

/**
 * Gets project root from environment or current working directory
 * @returns Project root directory
 */
export function getProjectRoot(): string {
  return process.env.PROJECT_ROOT || process.cwd();
}

/**
 * Validates that a path points to a file (not a directory)
 * @param filePath - Path to validate
 * @returns true if path is a file
 */
export function isFile(filePath: string): boolean {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}
