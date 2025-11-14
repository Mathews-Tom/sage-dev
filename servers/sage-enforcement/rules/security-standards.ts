/**
 * Security Standards
 *
 * Defines security validation standards conforming to:
 * - OWASP Top 10 2021
 * - CWE (Common Weakness Enumeration)
 * - Industry security best practices
 *
 * Configurable strictness levels: strict, moderate, lenient
 * Supports custom rules and exclusions
 *
 * @see https://owasp.org/Top10/ - OWASP Top 10
 * @see https://cwe.mitre.org/ - Common Weakness Enumeration
 */

/**
 * Security Standards Configuration
 *
 * Defines which security rules to enforce during validation.
 */
export interface SecurityStandards {
  /** OWASP rules to enforce */
  owaspRules: string[];

  /** Functions to flag as insecure */
  insecureFunctions: string[];

  /** Patterns for detecting hardcoded secrets */
  secretPatterns?: RegExp[];

  /** Minimum password length requirement */
  minPasswordLength?: number;

  /** Excluded paths from security scanning */
  excludePaths?: string[];
}

/**
 * Strictness Levels
 *
 * Predefined configurations for different enforcement levels.
 */
export type StrictnessLevel = 'strict' | 'moderate' | 'lenient';

/**
 * OWASP Top 10 2021 Rules
 *
 * Complete list of OWASP Top 10 vulnerability categories.
 */
const OWASP_TOP_10_RULES = [
  'sql-injection',           // A03:2021 - Injection
  'xss',                     // A03:2021 - Injection (XSS)
  'csrf',                    // A04:2021 - Insecure Design
  'hardcoded-secrets',       // A02:2021 - Cryptographic Failures
  'weak-crypto',             // A02:2021 - Cryptographic Failures
  'insecure-deserialization', // A08:2021 - Software and Data Integrity Failures
  'unsafe-eval',             // A03:2021 - Injection
  'command-injection',       // A03:2021 - Injection
  'path-traversal',          // A01:2021 - Broken Access Control
  'missing-csrf-protection', // A04:2021 - Insecure Design
  'debug-mode-enabled',      // A05:2021 - Security Misconfiguration
  'insecure-random',         // A02:2021 - Cryptographic Failures
  'deprecated-function',     // A06:2021 - Vulnerable and Outdated Components
  'weak-password-validation', // A07:2021 - Identification and Authentication Failures
  'unsafe-url-open',         // A10:2021 - Server-Side Request Forgery
  'potential-xss',           // A03:2021 - Injection
] as const;

/**
 * Insecure Functions
 *
 * Functions that should be flagged as security risks.
 */
const INSECURE_FUNCTIONS = [
  'eval',                    // Code injection risk
  'exec',                    // Code injection risk
  'pickle.loads',            // Deserialization vulnerability
  'pickle.load',             // Deserialization vulnerability
  'yaml.unsafe_load',        // Unsafe YAML parsing
  'yaml.load',               // Potentially unsafe YAML parsing
  'os.system',               // Command injection risk
  'subprocess.call',         // Command injection risk (deprecated)
  'compile',                 // Code injection risk
  'execfile',                // Code injection risk (Python 2)
  '__import__',              // Dynamic import risk
] as const;

/**
 * Secret Detection Patterns
 *
 * Regular expressions for detecting hardcoded secrets.
 * Covers API keys, passwords, tokens, private keys, etc.
 */
const SECRET_PATTERNS = [
  // Generic secrets
  /(?:password|passwd|pwd|secret|api_key|apikey|token|auth)\s*=\s*["'][^"'\s]{8,}["']/gi,

  // AWS credentials
  /AKIA[0-9A-Z]{16}/g,  // AWS Access Key ID
  /(?:aws_secret_access_key|aws_session_token)\s*=\s*["'][^"'\s]+["']/gi,

  // GitHub tokens
  /ghp_[a-zA-Z0-9]{36}/g,  // GitHub Personal Access Token
  /ghs_[a-zA-Z0-9]{36}/g,  // GitHub Server-to-Server Token

  // Private keys
  /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH|PGP)\s+PRIVATE\s+KEY-----/gi,

  // JWT tokens
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,

  // Generic API keys (base64-like patterns)
  /["'](?:[A-Za-z0-9+/]{40,})["']/g,
] as const;

/**
 * Strict Security Standards
 *
 * Enforces all security rules:
 * - All OWASP Top 10 rules enabled
 * - All insecure functions flagged
 * - Secret pattern detection enabled
 * - Minimum 12-character passwords
 * - No exclusions
 *
 * Recommended for: production code, public APIs, financial systems
 */
export const STRICT_STANDARDS: SecurityStandards = {
  owaspRules: [...OWASP_TOP_10_RULES],
  insecureFunctions: [...INSECURE_FUNCTIONS],
  secretPatterns: [...SECRET_PATTERNS],
  minPasswordLength: 12,
  excludePaths: [],
};

/**
 * Moderate Security Standards
 *
 * Balanced security enforcement:
 * - Critical OWASP rules (injection, XSS, secrets)
 * - Core insecure functions flagged
 * - Secret pattern detection enabled
 * - Minimum 8-character passwords
 * - Exclude test fixtures
 *
 * Recommended for: most projects, internal tools, APIs
 */
export const MODERATE_STANDARDS: SecurityStandards = {
  owaspRules: [
    'sql-injection',
    'xss',
    'hardcoded-secrets',
    'weak-crypto',
    'insecure-deserialization',
    'unsafe-eval',
    'command-injection',
    'path-traversal',
  ],
  insecureFunctions: [
    'eval',
    'exec',
    'pickle.loads',
    'yaml.unsafe_load',
    'os.system',
  ],
  secretPatterns: [...SECRET_PATTERNS],
  minPasswordLength: 8,
  excludePaths: ['tests/fixtures/*', 'examples/*'],
};

/**
 * Lenient Security Standards
 *
 * Minimal security enforcement:
 * - Critical injection rules only
 * - Core insecure functions (eval, exec)
 * - Basic secret pattern detection
 * - No password length requirement
 * - Exclude tests and scripts
 *
 * Recommended for: legacy code, prototypes, internal scripts
 */
export const LENIENT_STANDARDS: SecurityStandards = {
  owaspRules: [
    'sql-injection',
    'xss',
    'hardcoded-secrets',
  ],
  insecureFunctions: [
    'eval',
    'exec',
  ],
  secretPatterns: [SECRET_PATTERNS[0]], // Generic secrets only
  excludePaths: ['tests/*', 'scripts/*', 'examples/*', 'docs/*'],
};

/**
 * Default Security Standards
 *
 * Defaults to MODERATE_STANDARDS for balanced enforcement.
 * Override with STRICT_STANDARDS or LENIENT_STANDARDS as needed.
 */
export const DEFAULT_STANDARDS: SecurityStandards = MODERATE_STANDARDS;

/**
 * SECURITY_STANDARDS Object
 *
 * Main export providing access to all standard configurations.
 *
 * Usage:
 * ```typescript
 * import { SECURITY_STANDARDS } from './rules/security-standards.js';
 *
 * const standards = SECURITY_STANDARDS.strict;
 * const result = await securityScanner({
 *   filePath: '/path/to/file.py',
 *   code: pythonCode,
 *   standards
 * });
 * ```
 */
export const SECURITY_STANDARDS = {
  strict: STRICT_STANDARDS,
  moderate: MODERATE_STANDARDS,
  lenient: LENIENT_STANDARDS,
  default: DEFAULT_STANDARDS,
} as const;

/**
 * Get Security Standards by Level
 *
 * Helper function to retrieve standards by strictness level.
 *
 * @param level - Strictness level (strict, moderate, lenient)
 * @returns Security standards configuration
 *
 * @example
 * ```typescript
 * const standards = getSecurityStandards('strict');
 * // Returns STRICT_STANDARDS
 * ```
 */
export function getSecurityStandards(level: StrictnessLevel): SecurityStandards {
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
 * Create Custom Security Standards
 *
 * Factory function to create custom standards by extending a base level.
 *
 * @param base - Base strictness level to extend
 * @param overrides - Custom overrides to apply
 * @returns Custom security standards configuration
 *
 * @example
 * ```typescript
 * const customStandards = createCustomStandards('moderate', {
 *   owaspRules: [...OWASP_TOP_10_RULES],
 *   excludePaths: ['legacy/*']
 * });
 * ```
 */
export function createCustomStandards(
  base: StrictnessLevel,
  overrides: Partial<SecurityStandards>
): SecurityStandards {
  const baseStandards = getSecurityStandards(base);
  return {
    ...baseStandards,
    ...overrides,
  };
}

/**
 * Validate Security Standards
 *
 * Ensures standards configuration is valid and consistent.
 *
 * @param standards - Standards to validate
 * @throws Error if standards are invalid
 *
 * @example
 * ```typescript
 * validateSecurityStandards(STRICT_STANDARDS); // OK
 * validateSecurityStandards({ minPasswordLength: -1 }); // Throws
 * ```
 */
export function validateSecurityStandards(standards: Partial<SecurityStandards>): void {
  // Validate password length
  if (standards.minPasswordLength !== undefined) {
    if (standards.minPasswordLength < 0) {
      throw new Error(
        `Invalid minPasswordLength: ${standards.minPasswordLength}. Must be non-negative.`
      );
    }
    if (standards.minPasswordLength < 8) {
      console.warn(
        `Weak password length: ${standards.minPasswordLength}. NIST recommends 8+ characters.`
      );
    }
  }

  // Validate OWASP rules
  if (standards.owaspRules && standards.owaspRules.length === 0) {
    console.warn(
      'No OWASP rules enabled. Security scanning will be ineffective.'
    );
  }

  // Validate insecure functions
  if (standards.insecureFunctions && standards.insecureFunctions.length === 0) {
    console.warn(
      'No insecure functions flagged. Consider enabling at least eval and exec detection.'
    );
  }
}

/**
 * Export Constants for Testing and Reference
 */
export { OWASP_TOP_10_RULES, INSECURE_FUNCTIONS, SECRET_PATTERNS };
