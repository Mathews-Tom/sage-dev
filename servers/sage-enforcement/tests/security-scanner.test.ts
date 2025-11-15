import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createSecurityScanner, SecurityScanner } from '../agents/security-scanner.js';
import { SecurityScannerInputSchema } from '../schemas/index.js';
import { getProjectRoot } from '../utils/validation.js';
import type { SecurityScannerInput, SecurityScannerResult } from '../schemas/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = join(__dirname, 'fixtures');
const PROJECT_ROOT = getProjectRoot();

/**
 * Load fixture file content
 */
function loadFixture(filename: string): string {
  return readFileSync(join(FIXTURES_DIR, filename), 'utf-8');
}

describe('SecurityScanner (unit)', () => {
  let scanner: SecurityScanner;

  beforeEach(() => {
    scanner = createSecurityScanner();
  });

  describe('Input Validation', () => {
    it('validates required fields with Zod schema', () => {
      const malformedInput = {
        filePath: '',
        // Missing code field
      };

      const result = SecurityScannerInputSchema.safeParse(malformedInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('validates filePath is not empty', () => {
      const invalidInput = {
        filePath: '',
        code: 'print("hello")',
      };

      const result = SecurityScannerInputSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it('accepts valid input with all required fields', () => {
      const validInput: SecurityScannerInput = {
        filePath: join(FIXTURES_DIR, 'sample.py'),
        code: 'print("hello")',
      };

      const result = SecurityScannerInputSchema.safeParse(validInput);

      expect(result.success).toBe(true);
    });
  });

  describe('Secret Detection', () => {
    it('detects hardcoded API keys', async () => {
      const code = loadFixture('sample-security-violations.py');

      const input: SecurityScannerInput = {
        filePath: join(FIXTURES_DIR, 'sample-security-violations.py'),
        code,
      };

      const result: SecurityScannerResult = await scanner.execute(input);

      const secretViolations = result.violations.filter(
        (v) => v.rule === 'no-hardcoded-secrets'
      );

      expect(secretViolations.length).toBeGreaterThan(0);
      expect(secretViolations[0].severity).toBe('error');
    });

    it('detects multiple types of secrets', async () => {
      const code = loadFixture('sample-security-violations.py');

      const input: SecurityScannerInput = {
        filePath: join(FIXTURES_DIR, 'sample-security-violations.py'),
        code,
      };

      const result: SecurityScannerResult = await scanner.execute(input);

      const secretViolations = result.violations.filter(
        (v) => v.rule === 'no-hardcoded-secrets'
      );

      // Should detect API_KEY, PASSWORD, AWS_SECRET
      expect(secretViolations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('SQL Injection Detection', () => {
    it('scans for SQL injection vulnerabilities', async () => {
      const code = `
def unsafe_query(user_id):
    execute("SELECT * FROM users WHERE id = " + user_id)
`;

      const input: SecurityScannerInput = {
        filePath: join(FIXTURES_DIR, 'test.py'),
        code,
      };

      const result: SecurityScannerResult = await scanner.execute(input);

      const sqlInjectionViolations = result.violations.filter(
        (v) => v.rule === 'no-sql-injection'
      );

      expect(sqlInjectionViolations.length).toBeGreaterThanOrEqual(1);
      expect(sqlInjectionViolations[0].severity).toBe('error');
      expect(sqlInjectionViolations[0].suggestion).toContain('parameterized queries');
    });
  });

  describe('Command Injection Detection', () => {
    it('detects command injection vulnerabilities', async () => {
      const code = loadFixture('sample-security-violations.py');

      const input: SecurityScannerInput = {
        filePath: join(FIXTURES_DIR, 'sample-security-violations.py'),
        code,
      };

      const result: SecurityScannerResult = await scanner.execute(input);

      const commandInjectionViolations = result.violations.filter(
        (v) => v.rule === 'no-command-injection'
      );

      expect(commandInjectionViolations.length).toBeGreaterThanOrEqual(1);
      expect(commandInjectionViolations[0].severity).toBe('error');
      expect(commandInjectionViolations[0].suggestion).toContain('subprocess');
    });
  });

  describe('Result Structure', () => {
    it('returns violations array', async () => {
      const code = loadFixture('sample-security-violations.py');

      const input: SecurityScannerInput = {
        filePath: join(FIXTURES_DIR, 'sample-security-violations.py'),
        code,
      };

      const result: SecurityScannerResult = await scanner.execute(input);

      expect(result.violations).toBeInstanceOf(Array);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('returns summary with correct counts', async () => {
      const code = loadFixture('sample-security-violations.py');

      const input: SecurityScannerInput = {
        filePath: join(FIXTURES_DIR, 'sample-security-violations.py'),
        code,
      };

      const result: SecurityScannerResult = await scanner.execute(input);

      expect(result.summary).toBeDefined();
      expect(result.summary.errors).toBeGreaterThanOrEqual(0);
      expect(result.summary.warnings).toBeGreaterThanOrEqual(0);
      expect(result.summary.info).toBeGreaterThanOrEqual(0);

      const totalViolations = result.violations.length;
      const summaryTotal =
        result.summary.errors + result.summary.warnings + result.summary.info;

      expect(summaryTotal).toBe(totalViolations);
    });

    it('includes criticalCount in result', async () => {
      const code = loadFixture('sample-security-violations.py');

      const input: SecurityScannerInput = {
        filePath: join(FIXTURES_DIR, 'sample-security-violations.py'),
        code,
      };

      const result: SecurityScannerResult = await scanner.execute(input);

      expect(result).toHaveProperty('criticalCount');
      expect(typeof result.criticalCount).toBe('number');
      expect(result.criticalCount).toBeGreaterThanOrEqual(0);
    });

    it('includes required violation fields', async () => {
      const code = loadFixture('sample-security-violations.py');

      const input: SecurityScannerInput = {
        filePath: join(FIXTURES_DIR, 'sample-security-violations.py'),
        code,
      };

      const result: SecurityScannerResult = await scanner.execute(input);

      expect(result.violations.length).toBeGreaterThan(0);

      const violation = result.violations[0];
      expect(violation).toHaveProperty('file');
      expect(violation).toHaveProperty('line');
      expect(violation).toHaveProperty('severity');
      expect(violation).toHaveProperty('rule');
      expect(violation).toHaveProperty('message');
      expect(violation).toHaveProperty('autoFixable');

      expect(typeof violation.file).toBe('string');
      expect(typeof violation.line).toBe('number');
      expect(violation.line).toBeGreaterThan(0);
      expect(['error', 'warning', 'info']).toContain(violation.severity);
    });
  });

  describe('Factory Function', () => {
    it('creates SecurityScanner instance', () => {
      const instance = createSecurityScanner();

      expect(instance).toBeInstanceOf(SecurityScanner);
    });

    it('accepts custom project root', () => {
      const customRoot = '/custom/project/root';
      const instance = createSecurityScanner(customRoot);

      expect(instance).toBeInstanceOf(SecurityScanner);
    });
  });

  describe('Clean Code', () => {
    it('returns no violations for clean code', async () => {
      const code = `
def safe_function(user_id: int) -> str:
    """Safely get user."""
    return f"User {user_id}"
`;

      const input: SecurityScannerInput = {
        filePath: join(FIXTURES_DIR, 'safe.py'),
        code,
      };

      const result: SecurityScannerResult = await scanner.execute(input);

      expect(result.violations.length).toBe(0);
      expect(result.summary.errors).toBe(0);
      expect(result.criticalCount).toBe(0);
    });
  });
});
