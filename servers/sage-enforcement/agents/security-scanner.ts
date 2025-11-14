/**
 * Security Scanner Agent
 *
 * Detects OWASP Top 10 vulnerabilities, hardcoded secrets, and insecure coding patterns.
 * Provides remediation guidance with code examples.
 *
 * Standards: OWASP Top 10, CWE
 * Method: Pattern matching and AST analysis
 *
 * @see https://owasp.org/Top10/ - OWASP Top 10
 * @see https://cwe.mitre.org/ - Common Weakness Enumeration
 */

import {
  SecurityScanInputSchema,
  AgentResultSchema,
  ViolationSchema,
  type SecurityScanInput,
  type AgentResult,
  type Violation,
} from '../schemas/index.js';

/**
 * Security Pattern Definition
 *
 * Defines a security vulnerability pattern with detection regex and metadata.
 */
interface SecurityPattern {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  regex: RegExp;
  message: string;
  suggestion: string;
  cwe?: string;
  owasp?: string;
}

/**
 * Security Patterns Database
 *
 * Comprehensive list of security patterns to detect.
 * Organized by OWASP Top 10 categories.
 */
const SECURITY_PATTERNS: SecurityPattern[] = [
  // A01:2021 - Broken Access Control
  {
    rule: 'sql-injection',
    severity: 'error',
    regex: /(?:execute|executemany|cursor\.execute)\s*\(\s*[f"'].*?{.*?}|(?:execute|executemany|cursor\.execute)\s*\(\s*.*?\s*\+\s*/gi,
    message: 'Potential SQL injection vulnerability detected',
    suggestion: 'Use parameterized queries instead of string formatting. Example: cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))',
    cwe: 'CWE-89',
    owasp: 'A03:2021',
  },
  {
    rule: 'command-injection',
    severity: 'error',
    regex: /(?:os\.system|subprocess\.(?:call|run|Popen))\s*\([^)]*(?:\+|f["']|\.format)/gi,
    message: 'Potential command injection vulnerability detected',
    suggestion: 'Use subprocess with list arguments instead of shell=True. Example: subprocess.run(["ls", user_input], shell=False)',
    cwe: 'CWE-78',
    owasp: 'A03:2021',
  },

  // A02:2021 - Cryptographic Failures
  {
    rule: 'hardcoded-secret',
    severity: 'error',
    regex: /(?:password|passwd|pwd|secret|api_key|apikey|token|auth)\s*=\s*["'][^"'\s]{8,}["']/gi,
    message: 'Hardcoded secret or API key detected',
    suggestion: 'Use environment variables or secret management. Example: password = os.getenv("DB_PASSWORD")',
    cwe: 'CWE-798',
    owasp: 'A02:2021',
  },
  {
    rule: 'weak-crypto',
    severity: 'error',
    regex: /hashlib\.(?:md5|sha1)\(|from\s+Crypto\.Hash\s+import\s+(?:MD5|SHA1)/gi,
    message: 'Weak cryptographic algorithm detected (MD5/SHA1)',
    suggestion: 'Use strong algorithms like SHA256 or SHA3. Example: hashlib.sha256(data.encode())',
    cwe: 'CWE-327',
    owasp: 'A02:2021',
  },

  // A03:2021 - Injection
  {
    rule: 'unsafe-eval',
    severity: 'error',
    regex: /\b(?:eval|exec)\s*\(/gi,
    message: 'Unsafe use of eval() or exec() detected',
    suggestion: 'Avoid eval/exec entirely. If absolutely necessary, validate input strictly and use ast.literal_eval() for data.',
    cwe: 'CWE-95',
    owasp: 'A03:2021',
  },
  {
    rule: 'unsafe-deserialization',
    severity: 'error',
    regex: /pickle\.loads?\(|yaml\.(?:load|unsafe_load)\(/gi,
    message: 'Unsafe deserialization detected (pickle/yaml)',
    suggestion: 'Use safe alternatives like json.loads() or yaml.safe_load(). Never deserialize untrusted data with pickle.',
    cwe: 'CWE-502',
    owasp: 'A08:2021',
  },
  {
    rule: 'path-traversal',
    severity: 'error',
    regex: /open\s*\([^)]*(?:\+|f["']|\.format).*?["']\.\.\/|os\.path\.join\([^)]*(?:user_input|request\.|params\.)/gi,
    message: 'Potential path traversal vulnerability detected',
    suggestion: 'Validate and sanitize file paths. Use os.path.abspath() and check if path startswith allowed directory.',
    cwe: 'CWE-22',
    owasp: 'A01:2021',
  },

  // A04:2021 - Insecure Design
  {
    rule: 'missing-csrf-protection',
    severity: 'warning',
    regex: /@app\.route\([^)]*methods\s*=\s*\[[^\]]*["']POST["']/gi,
    message: 'POST endpoint without apparent CSRF protection',
    suggestion: 'Implement CSRF protection using Flask-WTF or similar library.',
    cwe: 'CWE-352',
    owasp: 'A04:2021',
  },

  // A05:2021 - Security Misconfiguration
  {
    rule: 'debug-mode-enabled',
    severity: 'warning',
    regex: /(?:app\.run|Flask\(.*\))\s*\([^)]*debug\s*=\s*True/gi,
    message: 'Debug mode enabled in production code',
    suggestion: 'Disable debug mode in production: app.run(debug=False) or use environment variable.',
    cwe: 'CWE-489',
    owasp: 'A05:2021',
  },
  {
    rule: 'insecure-random',
    severity: 'warning',
    regex: /import\s+random(?!\s+import\s+SystemRandom)|random\.(?:randint|choice|random)\(/gi,
    message: 'Insecure random number generator for security purposes',
    suggestion: 'Use secrets module for cryptographic randomness: secrets.token_hex(32)',
    cwe: 'CWE-330',
    owasp: 'A02:2021',
  },

  // A06:2021 - Vulnerable and Outdated Components
  {
    rule: 'deprecated-function',
    severity: 'warning',
    regex: /os\.(?:popen|system)\(|subprocess\.(?:call|check_call)\(/gi,
    message: 'Deprecated or insecure function usage',
    suggestion: 'Use subprocess.run() with proper arguments instead.',
    cwe: 'CWE-676',
    owasp: 'A06:2021',
  },

  // A07:2021 - Identification and Authentication Failures
  {
    rule: 'weak-password-validation',
    severity: 'warning',
    regex: /if\s+len\s*\(\s*password\s*\)\s*[<>=]+\s*[1-7]\s*:/gi,
    message: 'Weak password length requirement (< 8 characters)',
    suggestion: 'Require minimum 8 characters, complexity rules, and consider using passlib for password hashing.',
    cwe: 'CWE-521',
    owasp: 'A07:2021',
  },

  // A08:2021 - Software and Data Integrity Failures
  {
    rule: 'unsafe-url-open',
    severity: 'warning',
    regex: /urllib\.request\.urlopen\([^)]*(?:\+|f["']|\.format)/gi,
    message: 'Potential SSRF vulnerability via user-controlled URL',
    suggestion: 'Validate URLs against allowlist before opening. Use requests library with timeout.',
    cwe: 'CWE-918',
    owasp: 'A10:2021',
  },

  // A09:2021 - Security Logging and Monitoring Failures
  {
    rule: 'missing-input-validation',
    severity: 'info',
    regex: /def\s+\w+\s*\([^)]*request\.[^)]*\).*?(?!if\s+.*?(?:validate|check|verify))/gis,
    message: 'Function accepts user input without apparent validation',
    suggestion: 'Always validate and sanitize user input. Use validation libraries like pydantic or marshmallow.',
    cwe: 'CWE-20',
    owasp: 'A03:2021',
  },

  // A10:2021 - Server-Side Request Forgery (SSRF)
  {
    rule: 'potential-xss',
    severity: 'warning',
    regex: /render_template_string\(|Markup\([^)]*(?:\+|f["']|\.format)|innerHTML\s*=|document\.write\(/gi,
    message: 'Potential XSS vulnerability detected',
    suggestion: 'Escape user input before rendering. Use Jinja2 autoescaping or DOMPurify for JavaScript.',
    cwe: 'CWE-79',
    owasp: 'A03:2021',
  },
];

/**
 * Scan Code for Security Vulnerabilities
 *
 * Performs pattern matching against security vulnerability database.
 *
 * @param code - Python code to scan
 * @param filePath - File path for violation reporting
 * @returns Array of violations
 */
function scanCode(code: string, filePath: string): Violation[] {
  const violations: Violation[] = [];
  const lines = code.split('\n');

  for (const pattern of SECURITY_PATTERNS) {
    // Reset regex state
    pattern.regex.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = pattern.regex.exec(code)) !== null) {
      // Find line number for this match
      const beforeMatch = code.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      const lineContent = lines[lineNumber - 1] || '';

      // Skip if match is in a comment
      const trimmedLine = lineContent.trim();
      if (trimmedLine.startsWith('#')) {
        continue;
      }

      // Create violation
      violations.push(
        ViolationSchema.parse({
          file: filePath,
          line: lineNumber,
          column: match.index - beforeMatch.lastIndexOf('\n') - 1,
          severity: pattern.severity,
          rule: pattern.rule,
          message: `${pattern.message}${pattern.owasp ? ` (${pattern.owasp})` : ''}`,
          suggestion: pattern.suggestion,
          autoFixable: false,
        })
      );
    }
  }

  return violations;
}

/**
 * Security Scanner Agent
 *
 * Scans Python code for security vulnerabilities using pattern matching.
 * Returns critical violations (errors) first, then warnings.
 *
 * Example usage:
 * ```typescript
 * const result = await securityScanner({
 *   filePath: '/path/to/file.py',
 *   code: 'password = "hardcoded123"'
 * });
 * ```
 *
 * @param input - Security scan parameters
 * @returns Agent result with violations
 */
export async function securityScanner(input: unknown): Promise<AgentResult> {
  const startTime = Date.now();

  // Validate input with Zod schema
  const validated = SecurityScanInputSchema.parse(input) as SecurityScanInput;

  try {
    // Scan code for security issues
    const allViolations = scanCode(validated.code, validated.filePath);

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
    const tokensUsed = violations.length * 60; // Security violations have more detail

    // Count violations by severity
    const errors = allViolations.filter((v) => v.severity === 'error').length;
    const warnings = allViolations.filter((v) => v.severity === 'warning').length;
    const info = allViolations.filter((v) => v.severity === 'info').length;

    // Build result
    const result: AgentResult = {
      agent: 'security-scanner',
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
      throw error;
    }
    throw new Error('Unknown error during security scan');
  }
}
