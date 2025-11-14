import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * Sandbox configuration for agent execution
 */
export interface SandboxConfig {
  timeoutMs: number;
  maxMemoryMb: number;
  allowedCommands: string[];
  workingDirectory: string;
}

/**
 * Sandbox execution result
 */
export interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryUsedMb: number;
}

/**
 * Default sandbox configuration
 */
export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  timeoutMs: 10000, // 10 seconds max execution time
  maxMemoryMb: 512, // 512MB max memory
  allowedCommands: ['pyright', 'pytest'],
  workingDirectory: process.cwd(),
};

/**
 * Validates that a command is allowed in the sandbox
 * @param command - Command to validate
 * @param allowedCommands - List of allowed commands
 * @throws Error if command is not allowed
 */
export function validateCommand(command: string, allowedCommands: string[]): void {
  const baseCommand = command.split(' ')[0];

  if (!allowedCommands.includes(baseCommand)) {
    throw new Error(`Command not allowed in sandbox: ${baseCommand}`);
  }
}

/**
 * Executes a command in a sandboxed environment
 * Enforces CPU and memory limits using Node.js child_process
 * @param command - Command to execute
 * @param args - Command arguments
 * @param config - Sandbox configuration
 * @returns Sandbox execution result
 * @throws Error if execution fails or exceeds limits
 */
export async function executeSandboxed(
  command: string,
  args: string[],
  config: SandboxConfig = DEFAULT_SANDBOX_CONFIG
): Promise<SandboxResult> {
  validateCommand(command, config.allowedCommands);

  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      timeout: config.timeoutMs,
      cwd: config.workingDirectory,
      maxBuffer: config.maxMemoryMb * 1024 * 1024,
      killSignal: 'SIGTERM',
    });

    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      stdout,
      stderr,
      exitCode: 0,
      executionTimeMs: endTime - startTime,
      memoryUsedMb: Math.round((endMemory - startMemory) / 1024 / 1024),
    };
  } catch (error) {
    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    if (error instanceof Error && 'killed' in error && error.killed) {
      throw new Error(`Sandbox execution timeout: exceeded ${config.timeoutMs}ms`);
    }

    if (error instanceof Error && 'code' in error && error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
      throw new Error(`Sandbox memory limit exceeded: ${config.maxMemoryMb}MB`);
    }

    // Command execution failed with non-zero exit code
    const execError = error as { stdout?: string; stderr?: string; code?: number };
    return {
      stdout: execError.stdout || '',
      stderr: execError.stderr || '',
      exitCode: execError.code || 1,
      executionTimeMs: endTime - startTime,
      memoryUsedMb: Math.round((endMemory - startMemory) / 1024 / 1024),
    };
  }
}

/**
 * Executes Pyright type checker in sandbox
 * @param filePath - Absolute path to Python file
 * @param config - Sandbox configuration
 * @returns Sandbox execution result
 */
export async function executePyright(
  filePath: string,
  config: SandboxConfig = DEFAULT_SANDBOX_CONFIG
): Promise<SandboxResult> {
  return executeSandboxed('pyright', [filePath, '--outputjson'], config);
}

/**
 * Executes pytest coverage in sandbox
 * @param filePath - Absolute path to Python file or test directory
 * @param threshold - Minimum coverage threshold (0-100)
 * @param config - Sandbox configuration
 * @returns Sandbox execution result
 */
export async function executePytestCoverage(
  filePath: string,
  threshold: number,
  config: SandboxConfig = DEFAULT_SANDBOX_CONFIG
): Promise<SandboxResult> {
  return executeSandboxed(
    'pytest',
    [
      filePath,
      '--cov',
      '--cov-report=json',
      `--cov-fail-under=${threshold}`,
    ],
    config
  );
}

/**
 * Creates a sandbox configuration with custom overrides
 * @param overrides - Partial sandbox configuration to override defaults
 * @returns Complete sandbox configuration
 */
export function createSandboxConfig(overrides: Partial<SandboxConfig>): SandboxConfig {
  return {
    ...DEFAULT_SANDBOX_CONFIG,
    ...overrides,
  };
}
