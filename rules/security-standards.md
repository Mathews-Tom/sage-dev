---
description: Security standards for secret management, input validation, and secure coding practices
---

# Security Standards

## Secret Management

ZERO TOLERANCE POLICY:
  |
  +-- No hardcoded secrets in code
  +-- No credentials in version control
  +-- No API keys in configuration files (tracked)
  +-- All secrets via environment variables or secret management
  +-- Immediate rotation if secret leaked

---

## Secret Detection Patterns

### API Keys and Tokens

**AWS:**

- Access Key: `AKIA[0-9A-Z]{16}`
- Secret Key: `[A-Za-z0-9/+=]{40}`
- Session Token: `[A-Za-z0-9/+=]{200,}`

**Google Cloud:**

- API Key: `AIzaSy[0-9A-Za-z_-]{33}`
- Service Account: `"private_key":\s*"-----BEGIN PRIVATE KEY-----`

**GitHub:**

- Personal Access Token: `ghp_[0-9a-zA-Z]{36}`
- OAuth Token: `gho_[0-9a-zA-Z]{36}`
- App Token: `ghu_[0-9a-zA-Z]{36}`

**OpenAI:**

- API Key: `sk-[a-zA-Z0-9]{48}`
- Organization ID: `org-[a-zA-Z0-9]{24}`

**Stripe:**

- Secret Key: `sk_live_[0-9a-zA-Z]{24}`
- Publishable Key: `pk_live_[0-9a-zA-Z]{24}`

**Generic:**

- `api[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]`
- `secret[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]`
- `access[_-]?token\s*[:=]\s*['"][^'"]{20,}['"]`

### Credentials

**Passwords:**

- `password\s*=\s*['"][^'"]{8,}['"]`
- `pwd\s*=\s*['"][^'"]{8,}['"]`
- `passwd\s*=\s*['"][^'"]{8,}['"]`

**Database URLs:**

- PostgreSQL: `postgres://[^:]+:[^@]+@`
- MySQL: `mysql://[^:]+:[^@]+@`
- MongoDB: `mongodb://[^:]+:[^@]+@`
- Redis: `redis://[^:]+:[^@]+@`

**Private Keys:**

- RSA: `-----BEGIN RSA PRIVATE KEY-----`
- OpenSSH: `-----BEGIN OPENSSH PRIVATE KEY-----`
- PGP: `-----BEGIN PGP PRIVATE KEY-----`

**SSH Keys:**

- RSA: `ssh-rsa AAAA[0-9A-Za-z+/]{100,}`
- Ed25519: `ssh-ed25519 AAAA[0-9A-Za-z+/]{68}`

---

## Secure Secret Management

### Environment Variables

**.env file (NEVER commit):**

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost/db
API_KEY=sk-proj-abc123xyz789
STRIPE_SECRET=sk_live_abc123xyz789
JWT_SECRET=your-super-secret-jwt-key
```

**Add to .gitignore:**

```gitignore
# Secrets and credentials
.env
.env.*
*.pem
*.key
*.p12
*.pfx
credentials*.json
service-account*.json
secrets*.yaml
config/secrets.py
```

**Load in code:**

```python
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Access secrets
API_KEY = os.environ["API_KEY"]  # Fail if missing
DATABASE_URL = os.getenv("DATABASE_URL")  # None if missing

# Never log secrets
logger.info(f"API Key: {API_KEY[:4]}***")  # Only first 4 chars
```

### Secret Management Services

**AWS Secrets Manager:**

```python
import boto3

def get_secret(secret_name: str) -> dict[str, str]:
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

# Usage
db_credentials = get_secret('prod/database/credentials')
```

**HashiCorp Vault:**

```python
import hvac

def get_vault_secret(path: str) -> dict[str, Any]:
    client = hvac.Client(url='https://vault.example.com')
    client.token = os.environ['VAULT_TOKEN']
    secret = client.secrets.kv.v2.read_secret_version(path=path)
    return secret['data']['data']

# Usage
api_keys = get_vault_secret('secret/api-keys')
```

---

## Input Validation and Sanitization

### SQL Injection Prevention

**❌ NEVER do this:**

```python
# VULNERABLE
query = f"SELECT * FROM users WHERE email = '{user_input}'"
cursor.execute(query)

# VULNERABLE
query = "SELECT * FROM users WHERE id = " + user_id
cursor.execute(query)
```

**✅ ALWAYS do this:**

```python
# SAFE: Parameterized query
query = "SELECT * FROM users WHERE email = %s"
cursor.execute(query, (user_input,))

# SAFE: ORM
user = User.objects.get(email=user_input)
```

### Command Injection Prevention

**❌ NEVER do this:**

```python
# VULNERABLE
os.system(f"ping -c 1 {user_input}")
subprocess.call(f"convert {filename} output.jpg", shell=True)
```

**✅ ALWAYS do this:**

```python
# SAFE: Array of arguments, no shell
subprocess.run(["ping", "-c", "1", user_input], shell=False, check=True)
subprocess.run(["convert", filename, "output.jpg"], check=True)
```

### Path Traversal Prevention

**❌ NEVER do this:**

```python
# VULNERABLE
file_path = f"/uploads/{user_filename}"
with open(file_path) as f:
    return f.read()
```

**✅ ALWAYS do this:**

```python
from pathlib import Path

# SAFE: Validate and sanitize path
def safe_read_file(filename: str) -> str:
    # Resolve to absolute path
    base_dir = Path("/uploads").resolve()
    file_path = (base_dir / filename).resolve()

    # Ensure path is within base_dir
    if not file_path.is_relative_to(base_dir):
        raise ValueError("Invalid file path")

    # Ensure file exists and is a file
    if not file_path.is_file():
        raise FileNotFoundError("File not found")

    return file_path.read_text()
```

### XSS Prevention

**❌ NEVER do this:**

```python
# VULNERABLE: HTML injection
html = f"<div>Welcome, {user_input}!</div>"
return render_template_string(html)
```

**✅ ALWAYS do this:**

```python
from markupsafe import escape

# SAFE: Escape user input
html = f"<div>Welcome, {escape(user_input)}!</div>"

# Or use template engine with auto-escaping
return render_template("welcome.html", name=user_input)
```

---

## Authentication and Authorization

### Password Security

**Requirements:**

- Minimum 12 characters
- Must include: uppercase, lowercase, number, special char
- Hash with bcrypt, argon2, or scrypt (NOT MD5, SHA1, or plain SHA256)
- Salt automatically handled by modern hash functions

**✅ CORRECT implementation:**

```python
from argon2 import PasswordHasher

ph = PasswordHasher()

def hash_password(password: str) -> str:
    """Hash password using Argon2."""
    return ph.hash(password)

def verify_password(password: str, hash: str) -> bool:
    """Verify password against hash."""
    try:
        ph.verify(hash, password)
        return True
    except:
        return False
```

### Session Management

**Requirements:**

- Use cryptographically secure random tokens
- Expire sessions after inactivity (e.g., 30 min)
- Invalidate on logout
- Regenerate session ID on privilege elevation

**✅ CORRECT implementation:**

```python
import secrets
from datetime import datetime, timedelta

def create_session(user_id: int) -> str:
    """Create secure session token."""
    token = secrets.token_urlsafe(32)  # 256 bits of randomness
    expiry = datetime.now() + timedelta(minutes=30)

    session_store[token] = {
        'user_id': user_id,
        'created_at': datetime.now(),
        'expires_at': expiry,
    }

    return token
```

### JWT Security

**Requirements:**

- Sign with strong secret (min 256 bits)
- Use HS256 or RS256 algorithm
- Set expiration (exp claim)
- Validate signature on every request
- Never trust client-provided data without verification

**✅ CORRECT implementation:**

```python
import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.environ["JWT_SECRET"]  # From env, not hardcoded

def create_jwt(user_id: int) -> str:
    """Create JWT token."""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=1),
        'iat': datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_jwt(token: str) -> dict[str, Any]:
    """Verify and decode JWT."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("Token expired")
    except jwt.InvalidTokenError:
        raise AuthenticationError("Invalid token")
```

---

## HTTPS and TLS

### Requirements

- **Production**: HTTPS only, no HTTP
- **TLS version**: 1.2 minimum, 1.3 recommended
- **Certificate**: Valid, not self-signed (except local dev)
- **HSTS**: Enforce HTTPS with Strict-Transport-Security header

**Flask/Django configuration:**

```python
# Enforce HTTPS
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# HSTS header
@app.after_request
def set_secure_headers(response):
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    return response
```

---

## File Upload Security

### Validation Requirements

```python
from pathlib import Path
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def validate_upload(file) -> Path:
    """Validate uploaded file."""
    # Check file presence
    if not file or not file.filename:
        raise ValueError("No file provided")

    # Sanitize filename
    filename = secure_filename(file.filename)

    # Check extension
    ext = Path(filename).suffix.lower().lstrip('.')
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"File type .{ext} not allowed")

    # Check file size
    file.seek(0, 2)  # Seek to end
    size = file.tell()
    file.seek(0)  # Reset
    if size > MAX_FILE_SIZE:
        raise ValueError("File too large")

    # Verify actual file type (not just extension)
    import magic
    mime_type = magic.from_buffer(file.read(1024), mime=True)
    file.seek(0)
    if mime_type not in ['image/png', 'image/jpeg', 'image/gif', 'application/pdf']:
        raise ValueError("Invalid file type")

    return Path(filename)
```

---

## Enforcement Rules

1. **No hardcoded secrets** - Use env vars or secret manager
2. **No credentials in git** - Add to .gitignore
3. **Parameterized queries only** - Prevent SQL injection
4. **No shell=True** - Prevent command injection
5. **Validate all paths** - Prevent path traversal
6. **Escape all output** - Prevent XSS
7. **Hash passwords properly** - Use Argon2/bcrypt
8. **HTTPS in production** - No plain HTTP
9. **Validate file uploads** - Check type, size, content
10. **Rotate leaked secrets** - Immediately upon detection

---

## Secret Rotation Procedure

**If secret is leaked:**

1. **Immediate action** (within 1 hour):
   - Generate new secret
   - Update in secret management system
   - Deploy new secret to production
   - Revoke old secret

2. **Investigation** (within 24 hours):
   - Check git history for exposure
   - Scan logs for unauthorized use
   - Review access patterns

3. **Cleanup** (within 1 week):
   - Remove from git history (BFG Repo-Cleaner)
   - Update documentation
   - Post-mortem analysis

**Commands:**

```bash
# Find secret in git history
git log --all -p -S 'secret_pattern'

# Remove from git history
bfg --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (warn team first!)
git push --force --all
```

---

## Security Headers

**Required headers:**

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## Regular Security Audits

**Automated checks:**

- Secret scanning (on every commit)
- Dependency vulnerability scanning (weekly)
- Static analysis (on every PR)
- Penetration testing (quarterly)

**Tools:**

```bash
# Secret scanning
git-secrets --scan
truffleHog --regex --entropy=True

# Dependency scanning
pip-audit
safety check

# Static analysis
bandit -r src/
semgrep --config=p/security-audit
```
