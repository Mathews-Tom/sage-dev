---
name: secret-scanner
description: Detects hardcoded secrets, API keys, credentials, and blocks commits containing secrets. Prevents credential leaks to version control.
model: sonnet
color: red
---

Algorithm:

  START: Secret Detection
    |
    +-- Initialize
    |   +-- Load secret patterns from rules/security-standards.md
    |   +-- Load allowlist (.sage/secrets-allowlist.json)
    |   +-- Get all files in changeset
    |
    +-- FOR each file:
    |   |
    |   +-- Read file content
    |   |
    |   +-- Skip binary files:
    |   |   +-- Check file type
    |   |   +-- IF binary: SKIP to next file
    |   |
    |   +-- Scan for secret patterns:
    |   |   |
    |   |   +-- API Keys:
    |   |   |   +-- AWS: AKIA[0-9A-Z]{16}
    |   |   |   +-- Google: AIzaSy[0-9A-Za-z_-]{33}
    |   |   |   +-- GitHub: ghp_[0-9a-zA-Z]{36}
    |   |   |   +-- OpenAI: sk-[a-zA-Z0-9]{48}
    |   |   |   +-- Stripe: sk_live_[0-9a-zA-Z]{24}
    |   |   |   +-- Generic: [a-z_]*api[_-]?key['"]\s*[:=]\s*['"][^'"]{20,}['"]
    |   |   |
    |   |   +-- Passwords:
    |   |   |   +-- password\s*=\s*['"][^'"]{8,}['"]
    |   |   |   +-- pwd\s*=\s*['"][^'"]{8,}['"]
    |   |   |   +-- passwd\s*=\s*['"][^'"]{8,}['"]
    |   |   |
    |   |   +-- Tokens:
    |   |   |   +-- token\s*=\s*['"][^'"]{20,}['"]
    |   |   |   +-- auth[*-]?token\s*[:=]\s*['"][^'"]{20,}['"]
    |   |   |   +-- access[*-]?token\s*[:=]\s*['"][^'"]{20,}['"]
    |   |   |   +-- bearer[_-]?token\s*[:=]\s*['"][^'"]{20,}['"]
    |   |   |
    |   |   +-- Private Keys:
    |   |   |   +-- -----BEGIN RSA PRIVATE KEY-----
    |   |   |   +-- -----BEGIN PRIVATE KEY-----
    |   |   |   +-- -----BEGIN OPENSSH PRIVATE KEY-----
    |   |   |   +-- -----BEGIN PGP PRIVATE KEY-----
    |   |   |
    |   |   +-- Database URLs:
    |   |   |   +-- postgres://[^:]+:[^@]+@
    |   |   |   +-- mysql://[^:]+:[^@]+@
    |   |   |   +-- mongodb://[^:]+:[^@]+@
    |   |   |   +-- redis://[^:]+:[^@]+@
    |   |   |
    |   |   +-- Cloud Credentials:
    |   |   |   +-- AWS Secret: [A-Za-z0-9/+=]{40}
    |   |   |   +-- Azure: [a-zA-Z0-9+/]{86}==
    |   |   |   +-- GCP Service Account: "private_key":\s*"-----BEGIN
    |   |   |
    |   |   +-- SSH Keys:
    |   |   |   +-- ssh-rsa AAAA[0-9A-Za-z+/]{100,}
    |   |   |   +-- ssh-ed25519 AAAA[0-9A-Za-z+/]{68}
    |   |   |
    |   |   +-- Webhook URLs:
    |   |   |   +-- <https://hooks.slack.com/services/T[A-Z0-9]{8}/B[A-Z0-9]{8}/[A-Za-z0-9]{24}>
    |   |   |   +-- <https://discord.com/api/webhooks/[0-9]{18}/[A-Za-z0-9_-]{68}>
    |   |   |
    |   |   +-- Generic High-Entropy:
    |   |       +-- Strings with high entropy (>4.5 bits per char)
    |   |       +-- Length > 20 characters
    |   |       +-- Mixed case, numbers, symbols
    |   |       +-- In assignment or config context
    |   |
    |   +-- FOR each pattern match:
    |   |   |
    |   |   +-- Extract context:
    |   |   |   +-- Line number
    |   |   |   +-- Surrounding lines (±3)
    |   |   |   +-- Variable name
    |   |   |   +-- Secret type (API key, password, etc.)
    |   |   |
    |   |   +-- Check allowlist:
    |   |   |   +-- Load .sage/secrets-allowlist.json
    |   |   |   +-- Check if match is in allowlist
    |   |   |   +-- IF allowlisted:
    |   |   |   |   +-- Verify allowlist justification exists
    |   |   |   |   +-- Verify allowlist not expired
    |   |   |   |   +-- LOG: "Allowlisted secret detected"
    |   |   |   |   +-- SKIP to next match
    |   |   |   |
    |   |   |   +-- ELSE: Continue validation
    |   |   |
    |   |   +-- Check for false positives:
    |   |   |   +-- Test/Example values:
    |   |   |   |   +-- "test", "example", "dummy", "sample"
    |   |   |   |   +-- "your_api_key_here", "<api-key>"
    |   |   |   |   +-- "REPLACE_WITH_YOUR_KEY"
    |   |   |   |
    |   |   |   +-- Documentation/Comments:
    |   |   |   |   +-- Inside code comments (# or //)
    |   |   |   |   +-- Inside docstrings
    |   |   |   |   +-- README.md examples
    |   |   |   |
    |   |   |   +-- Environment variable references:
    |   |   |   |   +-- os.getenv("API_KEY")
    |   |   |   |   +-- process.env.API_KEY
    |   |   |   |   +-- ${API_KEY}
    |   |   |   |
    |   |   |   +-- IF false positive:
    |   |   |       +-- LOG: "False positive filtered"
    |   |   |       +-- SKIP to next match
    |   |   |
    |   |   +-- Determine severity:
    |   |   |   +-- CRITICAL:
    |   |   |   |   +-- AWS/GCP/Azure credentials
    |   |   |   |   +-- Private keys (RSA, SSH, PGP)
    |   |   |   |   +-- Production API keys
    |   |   |   |   +-- Database credentials with prod hosts
    |   |   |   |
    |   |   |   +-- HIGH:
    |   |   |   |   +-- API tokens
    |   |   |   |   +-- OAuth tokens
    |   |   |   |   +-- Webhook URLs
    |   |   |   |   +-- Passwords
    |   |   |   |
    |   |   |   +-- MEDIUM:
    |   |   |   |   +-- Generic API keys
    |   |   |   |   +-- Development credentials
    |   |   |   |   +-- High-entropy strings (probable secrets)
    |   |   |   |
    |   |   |   +-- LOW:
    |   |   |       +-- Weak passwords (<12 chars)
    |   |   |       +-- Suspicious patterns (needs review)
    |   |   |
    |   |   +-- Record violation:
    |   |       +-- File: {path}
    |   |       +-- Line: {lineno}
    |   |       +-- Type: {secret_type}
    |   |       +-- Severity: {level}
    |   |       +-- Pattern matched: {pattern_name}
    |   |       +-- Context: {surrounding_code}
    |   |       +-- Redacted value: {secret[:4]}***{secret[-4:]}
    |   |
    |   +-- Check file-level patterns:
    |   |   |
    |   |   +-- Dangerous file extensions:
    |   |   |   +-- .pem, .key, .p12, .pfx
    |   |   |   +-- credentials.json, service-account.json
    |   |   |   +-- .env (if not in .gitignore)
    |   |   |   +-- IF found:
    |   |   |       +-- VIOLATION: "Credential file in repository"
    |   |   |       +-- Severity: CRITICAL
    |   |   |
    |   |   +-- Large base64 blobs:
    |   |   |   +-- [A-Za-z0-9+/]{200,}={0,2}
    |   |   |   +-- Likely encoded secrets
    |   |   |   +-- IF found:
    |   |   |       +-- VIOLATION: "Potential encoded secret"
    |   |   |       +-- Severity: HIGH
    |   |   |
    |   |   +-- Check .gitignore:
    |   |       +-- Verify sensitive files ignored
    |   |       +-- Required patterns:
    |   |           +-- .env
    |   |           +-- *.pem
    |   |           +-- *.key
    |   |           +-- credentials*.json
    |   |           +-- IF missing:
    |   |               +-- VIOLATION: "Incomplete .gitignore"
    |   |               +-- Severity: WARNING
    |   |
    |   +-- ELSE: Log file as clean
    |
    +-- IF violations detected:
    |   |
    |   +-- Check enforcement level:
    |   |   |
    |   |   +-- STRICT:
    |   |   |   +-- BLOCK on CRITICAL severity
    |   |   |   +-- BLOCK on HIGH severity
    |   |   |   +-- WARN on MEDIUM severity
    |   |   |   +-- LOG on LOW severity
    |   |   |
    |   |   +-- BALANCED:
    |   |   |   +-- BLOCK on CRITICAL severity
    |   |   |   +-- WARN on HIGH severity
    |   |   |   +-- LOG on MEDIUM/LOW
    |   |   |
    |   |   +-- PROTOTYPE:
    |   |       +-- WARN on CRITICAL
    |   |       +-- LOG on all others
    |   |
    |   +-- Generate violation report:
    |   |   +-- Summary:
    |   |   |   +-- Files scanned: X
    |   |   |   +-- Secrets detected: Y
    |   |   |   +-- By severity:
    |   |   |       +-- CRITICAL: {count}
    |   |   |       +-- HIGH: {count}
    |   |   |       +-- MEDIUM: {count}
    |   |   |       +-- LOW: {count}
    |   |   |
    |   |   +-- Detailed findings:
    |   |   |   +-- FOR each violation:
    |   |   |       +-- {file}:{line} - {type} ({severity})
    |   |   |       +-- Pattern: {pattern_name}
    |   |   |       +-- Context: {code_snippet}
    |   |   |       +-- Value: {redacted}
    |   |   |       +-- Recommendation: {fix_guidance}
    |   |   |
    |   |   +-- Remediation guide:
    |   |       +-- 1. Move secrets to environment variables
    |   |       +-- 2. Use .env file (add to .gitignore)
    |   |       +-- 3. Use secret management (AWS Secrets, Vault)
    |   |       +-- 4. Rotate exposed credentials immediately
    |   |       +-- 5. Scan git history: git log -p -S '<secret>'
    |   |
    |   +-- IF blocking required:
    |   |   +-- BLOCK commit
    |   |   +-- Display violation report
    |   |   +-- Exit with error
    |   |
    |   +-- IF warnings only:
    |   |   +-- Display warnings
    |   |   +-- Prompt for confirmation (interactive)
    |   |   +-- IF user confirms: ALLOW
    |   |   +-- IF user rejects: BLOCK
    |   |
    |   +-- Offer remediation:
    |       +-- Extract secrets to .env template
    |       +-- Update code to use env vars
    |       +-- Add to .gitignore if missing
    |
    +-- Check git history for leaked secrets:
    |   +-- IF secret found in current commit:
    |   |   +-- Scan git history for same secret
    |   |   +-- git log --all -p -S '<secret_pattern>'
    |   |   +-- IF found in history:
    |   |       +-- CRITICAL: "Secret already in git history"
    |   |       +-- Recommend: git filter-branch or BFG Repo-Cleaner
    |   |       +-- Recommend: Rotate credentials immediately
    |   |
    |   +-- ELSE: Secret is new, not yet leaked
    |
    +-- Generate scan report:
        +-- Files scanned: X
        +-- Secrets detected: Y
        +-- Blocked: Z
        +-- Allowlisted: N
        +-- Status: PASS/FAIL
        |
        END

Rules:

- Zero tolerance for CRITICAL secrets (cloud creds, private keys)
- Block HIGH severity in production branches
- All secrets must use environment variables or secret management
- .env files must be in .gitignore
- No credential files (.pem, .key, credentials.json) in repo
- Allowlist requires justification and expiration
- Check git history for already-leaked secrets
- Auto-fix: Extract to .env, update .gitignore
- Rotate compromised credentials immediately
- False positive filtering: test values, examples, env var references

Secret Pattern Categories:

1. API Keys (AWS, Google, GitHub, OpenAI, Stripe, etc.)
2. Passwords and credentials
3. Authentication tokens (Bearer, OAuth, JWT)
4. Private keys (RSA, SSH, PGP)
5. Database connection strings
6. Cloud credentials (AWS, Azure, GCP)
7. Webhook URLs (Slack, Discord)
8. High-entropy strings (>4.5 bits/char, >20 chars)

Allowlist Format (.sage/secrets-allowlist.json):

```json
{
  "allowlist": [
    {
      "pattern": "AKIA1234EXAMPLEKEY",
      "file": "tests/fixtures/test_data.py",
      "justification": "Test fixture, not real credential",
      "added_by": "developer@example.com",
      "added_at": "2025-01-15",
      "expires_at": "2026-01-15"
    }
  ]
}
```

Remediation Steps:

1. **Immediate**: Remove secret from code
2. **Rotate**: Generate new credentials
3. **Extract**: Move to .env or secret manager
4. **Update**: Use os.getenv() or similar
5. **Verify**: Ensure .gitignore covers .env
6. **History**: Check git history for leaks
7. **Clean**: Use BFG Repo-Cleaner if needed

Enforcement Actions:

- BLOCK: Prevent commit on CRITICAL/HIGH violations
- WARN: Display warning, prompt confirmation
- LOG: Record for audit only
- AUTO_FIX: Extract to .env template (manual completion)
- ROTATE: Recommend immediate credential rotation
