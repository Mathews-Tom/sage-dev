/**
 * Security standards and rules
 * Detects hardcoded secrets, API keys, and security vulnerabilities
 */

/**
 * Patterns for detecting hardcoded secrets
 */
export const SECRET_PATTERNS = [
  {
    id: 'aws-access-key',
    pattern: /AKIA[0-9A-Z]{16}/,
    description: 'AWS Access Key ID detected',
  },
  {
    id: 'aws-secret-key',
    pattern: /aws(.{0,20})?['\"][0-9a-zA-Z/+]{40}['\"]/i,
    description: 'AWS Secret Access Key detected',
  },
  {
    id: 'github-token',
    pattern: /ghp_[0-9a-zA-Z]{36}/,
    description: 'GitHub Personal Access Token detected',
  },
  {
    id: 'github-oauth',
    pattern: /gho_[0-9a-zA-Z]{36}/,
    description: 'GitHub OAuth Token detected',
  },
  {
    id: 'slack-token',
    pattern: /xox[baprs]-[0-9a-zA-Z-]{10,48}/,
    description: 'Slack Token detected',
  },
  {
    id: 'slack-webhook',
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]{8,}\/B[a-zA-Z0-9_]{8,}\/[a-zA-Z0-9_]{24,}/,
    description: 'Slack Webhook URL detected',
  },
  {
    id: 'api-key',
    pattern: /api[_-]?key['\"]?\s*[:=]\s*['"][a-zA-Z0-9]{20,}['\"]/i,
    description: 'Generic API key detected',
  },
  {
    id: 'private-key',
    pattern: /-----BEGIN\s+(?:RSA|EC|DSA|OPENSSH)\s+PRIVATE\s+KEY-----/,
    description: 'Private key detected',
  },
  {
    id: 'password',
    pattern: /password['\"]?\s*[:=]\s*['"][^'\"]{8,}['\"]/i,
    description: 'Hardcoded password detected',
  },
] as const;

/**
 * Patterns for detecting SQL injection vulnerabilities
 */
export const SQL_INJECTION_PATTERNS = [
  {
    id: 'string-concatenation-sql',
    pattern: /execute\s*\([^)]*\+[^)]*\)/i,
    description: 'SQL query with string concatenation (injection risk)',
  },
  {
    id: 'format-string-sql',
    pattern: /execute\s*\([^)]*\.format\([^)]*\)/i,
    description: 'SQL query with .format() (injection risk)',
  },
  {
    id: 'f-string-sql',
    pattern: /execute\s*\(f['"][^'"]*{[^}]+}[^'"]*['"]\)/i,
    description: 'SQL query with f-string interpolation (injection risk)',
  },
] as const;

/**
 * Patterns for detecting command injection vulnerabilities
 */
export const COMMAND_INJECTION_PATTERNS = [
  {
    id: 'shell-true',
    pattern: /subprocess\.(run|Popen|call|check_output)\([^)]*shell\s*=\s*True/i,
    description: 'subprocess with shell=True (command injection risk)',
  },
  {
    id: 'os-system',
    pattern: /os\.system\(/,
    description: 'os.system() usage (command injection risk)',
  },
  {
    id: 'eval-usage',
    pattern: /\beval\s*\(/,
    description: 'eval() usage (code injection risk)',
  },
  {
    id: 'exec-usage',
    pattern: /\bexec\s*\(/,
    description: 'exec() usage (code injection risk)',
  },
] as const;

/**
 * Security rule definition
 */
export interface SecurityRule {
  id: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  autoFixable: boolean;
  pattern?: RegExp;
}

/**
 * All security enforcement rules
 */
export const SECURITY_RULES: SecurityRule[] = [
  {
    id: 'no-hardcoded-secrets',
    description: 'No hardcoded secrets, API keys, or credentials allowed',
    severity: 'error',
    autoFixable: false,
  },
  {
    id: 'no-sql-injection',
    description: 'SQL queries must use parameterized statements',
    severity: 'error',
    autoFixable: false,
  },
  {
    id: 'no-command-injection',
    description: 'Avoid shell=True and unsafe command execution',
    severity: 'error',
    autoFixable: false,
  },
  {
    id: 'no-code-injection',
    description: 'Avoid eval() and exec() with untrusted input',
    severity: 'error',
    autoFixable: false,
  },
  {
    id: 'require-input-validation',
    description: 'All user inputs must be validated',
    severity: 'warning',
    autoFixable: false,
  },
  {
    id: 'require-output-encoding',
    description: 'All outputs must be properly encoded',
    severity: 'warning',
    autoFixable: false,
  },
];

/**
 * Scans code for hardcoded secrets
 * @param code - Source code to scan
 * @returns Array of detected secret patterns
 */
export function scanForSecrets(code: string): Array<{ id: string; description: string; line: number }> {
  const findings: Array<{ id: string; description: string; line: number }> = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const { id, pattern, description } of SECRET_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({ id, description, line: i + 1 });
      }
    }
  }

  return findings;
}

/**
 * Scans code for SQL injection vulnerabilities
 * @param code - Source code to scan
 * @returns Array of detected SQL injection patterns
 */
export function scanForSqlInjection(code: string): Array<{ id: string; description: string; line: number }> {
  const findings: Array<{ id: string; description: string; line: number }> = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const { id, pattern, description } of SQL_INJECTION_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({ id, description, line: i + 1 });
      }
    }
  }

  return findings;
}

/**
 * Scans code for command injection vulnerabilities
 * @param code - Source code to scan
 * @returns Array of detected command injection patterns
 */
export function scanForCommandInjection(code: string): Array<{ id: string; description: string; line: number }> {
  const findings: Array<{ id: string; description: string; line: number }> = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const { id, pattern, description } of COMMAND_INJECTION_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({ id, description, line: i + 1 });
      }
    }
  }

  return findings;
}

/**
 * Gets a security rule by ID
 * @param ruleId - Rule identifier
 * @returns Security rule or undefined if not found
 */
export function getSecurityRule(ruleId: string): SecurityRule | undefined {
  return SECURITY_RULES.find(rule => rule.id === ruleId);
}
