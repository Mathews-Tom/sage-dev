# Sage-Dev MCP Enforcement Server

MCP (Model Context Protocol) server for Sage-Dev code enforcement agents. Provides progressive tool discovery and result filtering to achieve **92% token reduction** (150K → 12K tokens).

## Overview

The enforcement server provides 4 specialized agents for code quality enforcement:

1. **type-enforcer**: Python 3.12 type checking via Pyright
2. **doc-validator**: Python docstring validation (Google-style)
3. **test-coverage**: Pytest coverage enforcement
4. **security-scanner**: Security vulnerability and secret detection

## Key Features

- **On-demand agent loading**: Load only applicable agents per file type
  - Python files (.py): 4 agents
  - TypeScript/JavaScript files (.ts, .js, .tsx, .jsx): 1 agent
- **Result filtering**: Filter violations to top 10 per severity level
  - 1000 violations → 30 violations = **97% reduction**
- **Session-based caching**: <100ms discovery latency for cached agents
- **Sandboxed execution**: CPU and memory limits via Node.js child_process

## Installation

```bash
cd servers/sage-enforcement
npm install
npm run build
```

## Usage

### As MCP Server

Add to Claude Desktop or Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "sage-enforcement": {
      "command": "node",
      "args": ["/path/to/sage-dev/servers/sage-enforcement/dist/index.js"]
    }
  }
}
```

### Available Tools

#### `enforce-file`

Enforce code quality standards on a file using applicable agents.

**Input:**
- `filePath` (string, required): Absolute path to file
- `code` (string, required): Source code content
- `limitPerSeverity` (number, optional): Maximum violations per severity (default: 10)

**Output:**
```json
{
  "filePath": "/path/to/file.py",
  "agentsExecuted": 4,
  "statistics": {
    "total": 45,
    "errors": 12,
    "warnings": 20,
    "info": 13,
    "autoFixable": 8,
    "uniqueFiles": 1,
    "uniqueRules": 6
  },
  "filtered": {
    "shown": 30,
    "total": 45,
    "reduction": "33%"
  },
  "violations": [...]
}
```

#### `list-agents`

List all available enforcement agents and their applicable file types.

**Output:**
```json
{
  "totalAgents": 4,
  "agents": [
    {
      "name": "type-enforcer",
      "description": "Python 3.12 type checking via Pyright",
      "applicableFileTypes": [".py"]
    },
    ...
  ]
}
```

#### `get-applicable-agents`

Get list of agents applicable to a specific file.

**Input:**
- `filePath` (string, required): File path to check

**Output:**
```json
{
  "filePath": "/path/to/file.py",
  "applicableAgents": ["type-enforcer", "doc-validator", "test-coverage", "security-scanner"],
  "count": 4
}
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

### Progressive Discovery

```typescript
// GOOD: Load only applicable agents
const agents = await loadAgentsForFile(filePath);  // .py → 4 agents, .ts → 1 agent
const results = await Promise.all(agents.map(agent => agent.execute({ filePath, code })));
```

### Result Filtering

```typescript
// GOOD: Filter before logging to context
const filtered = filterViolations(violations, 10);  // Top 10 per severity
console.error(`Violations: ${filtered.metadata.total} (showing ${filtered.violations.length})`);
```

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Token Usage (TypeScript) | <5K tokens | Load 1 agent, filter 10 violations |
| Token Usage (Python) | <12K tokens | Load 4 agents, filter 40 violations |
| Discovery Latency (cached) | <100ms | Session-based agent cache |
| Discovery Latency (cold) | <500ms | Filesystem scan + import |
| Filtering Latency | <10ms | 1000 violations → 30 filtered |

## Development

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:unit     # Unit tests only
npm run coverage      # Generate coverage report
```

### Type Checking

```bash
npm run typecheck     # TypeScript type checking
```

### Linting

```bash
npm run lint          # ESLint
npm run format        # Prettier
```

### Building

```bash
npm run build         # Compile TypeScript
npm run dev           # Watch mode
```

## Agent Details

### Type Enforcer

- **File types**: `.py`
- **Tool**: Pyright v1.1+
- **Checks**:
  - Deprecated typing imports (List, Dict, Optional, Union)
  - Missing type annotations
  - Type errors and inconsistencies
- **Auto-fixable**: Deprecated imports only

### Doc Validator

- **File types**: `.py`
- **Style**: Google-style docstrings
- **Checks**:
  - Missing docstrings for functions/classes
  - Missing Args section for functions with parameters
  - Missing Returns section for functions with return values
- **Auto-fixable**: No

### Test Coverage

- **File types**: `.py`
- **Tool**: pytest-cov v4.0+
- **Checks**:
  - Coverage below threshold (default: 80%)
  - Uncovered functions and classes
  - Uncovered line ranges
- **Auto-fixable**: No

### Security Scanner

- **File types**: `.py`, `.ts`, `.js`, `.tsx`, `.jsx`
- **Checks**:
  - Hardcoded secrets and API keys (AWS, GitHub, Slack, etc.)
  - SQL injection vulnerabilities
  - Command injection vulnerabilities (shell=True, eval, exec)
- **Auto-fixable**: No

## Execution Rules

See [.sage/EXECUTION_RULES.md](../../.sage/EXECUTION_RULES.md) for AI agent execution rules.

## License

MIT
