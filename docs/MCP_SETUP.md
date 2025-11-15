# MCP Server Setup Guide

Complete guide for installing and configuring Model Context Protocol (MCP) servers for Sage-Dev.

## Table of Contents

- [Overview](#overview)
- [Available Servers](#available-servers)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

---

## Overview

MCP (Model Context Protocol) servers extend Sage-Dev with advanced capabilities:

- **Pattern Extraction**: AST-based code analysis for repository patterns
- **Progressive Loading**: Context-aware loading with 60-80% token reduction
- **Research Caching**: 24-hour TTL caching for research queries
- **Code Enforcement**: Real-time linting and pattern validation

### Architecture

```plaintext
┌─────────────────┐     ┌──────────────────────┐
│   Claude Code   │────▶│   MCP Server Layer   │
│   (AI Agent)    │◀────│  (stdio transport)   │
└─────────────────┘     └──────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
          ┌─────────▼─────────┐ ┌─────────▼─────────┐
          │ sage-context-     │ │   sage-research   │
          │   optimizer       │ │                   │
          │ (pattern extract) │ │  (caching layer)  │
          └───────────────────┘ └───────────────────┘
```

---

## Available Servers

### sage-context-optimizer

**Purpose**: AST-based pattern extraction and progressive loading

**Tools**:

- `extract_patterns` - Extract patterns from codebase using AST
- `load_patterns` - Load saved patterns from disk
- `display_patterns` - Human-readable pattern output
- `load_patterns_progressive` - Context-aware loading with token reduction

**Features**:

- Python and TypeScript AST analysis
- Module system detection (ESM/CJS)
- Naming convention extraction
- Testing framework detection
- 60-80% token reduction through progressive loading
- Confidence scoring for pattern reliability

**Use Cases**:

- `/sage.init` - Extract patterns during initialization
- `/sage.specify` - Pattern-aware specification generation
- `/sage.implement` - Progressive pattern loading during implementation

### sage-research

**Purpose**: Research caching and deduplication

**Tools**:

- `research_query` - Query cached research by topic
- `research_store` - Store research findings with TTL
- `research_invalidate` - Invalidate specific cache entry
- `research_stats` - View cache statistics (hit rate, size)
- `research_cleanup` - Remove expired entries

**Features**:

- 24-hour TTL caching
- MD5-based query deduplication
- LRU eviction with 100MB limit
- Automatic cache index management
- Hit rate tracking

**Use Cases**:

- `/sage.intel` - Cache research findings
- Repeated queries return cached results
- Reduce API costs and latency

### sage-enforcement

**Purpose**: Code quality enforcement and validation

**Tools**:

- Linting and formatting
- Pattern compliance checking
- Security scanning
- Test coverage validation

**Features**:

- Real-time code analysis
- Pattern-based validation
- Integration with ESLint, TypeScript, and custom rules
- HTTP API for CI/CD integration

---

## Installation

### Prerequisites

```bash
# Check Node.js version (18+ required)
node --version

# Check npm version (9+ required)
npm --version

# For Python pattern extraction
python3 --version  # 3.12+ required
```

### Quick Install (All Servers)

```bash
cd /path/to/sage-dev/servers

# Install sage-context-optimizer
cd sage-context-optimizer
npm install
npm run build
npm test  # Verify installation
cd ..

# Install sage-research
cd sage-research
npm install
npm run build
npm test
cd ..

# Install sage-enforcement
cd sage-enforcement
npm install
npm run build
npm test
cd ..
```

### Automated Install Script

```bash
# Create setup script
cat > setup-mcp-servers.sh << 'EOF'
#!/bin/bash
set -e

SERVERS_DIR="$(cd "$(dirname "$0")" && pwd)"

for server in sage-context-optimizer sage-research sage-enforcement; do
  echo "Installing $server..."
  cd "$SERVERS_DIR/$server"
  npm install
  npm run build
  npm test
  echo "✓ $server installed"
done

echo "All MCP servers installed successfully!"
EOF

chmod +x setup-mcp-servers.sh
./setup-mcp-servers.sh
```

### Verify Installation

```bash
# Check build outputs exist
ls servers/sage-context-optimizer/dist/index.js
ls servers/sage-research/dist/index.js
ls servers/sage-enforcement/dist/index.js

# Run tests
cd servers/sage-context-optimizer && npm test
cd servers/sage-research && npm test
cd servers/sage-enforcement && npm test
```

---

## Configuration

### Claude Code Configuration

Edit `~/.claude/mcp_servers.json`:

```json
{
  "mcpServers": {
    "sage-context-optimizer": {
      "command": "node",
      "args": [
        "/absolute/path/to/sage-dev/servers/sage-context-optimizer/dist/index.js"
      ],
      "env": {
        "SAGE_PATTERNS_DIR": ".sage/agent/examples",
        "LOG_LEVEL": "info"
      }
    },
    "sage-research": {
      "command": "node",
      "args": [
        "/absolute/path/to/sage-dev/servers/sage-research/dist/index.js"
      ],
      "env": {
        "SAGE_RESEARCH_DIR": ".sage/agent/research",
        "CACHE_TTL": "86400000",
        "CACHE_MAX_SIZE": "104857600"
      }
    },
    "sage-enforcement": {
      "command": "node",
      "args": [
        "/absolute/path/to/sage-dev/servers/sage-enforcement/dist/index.js"
      ],
      "env": {
        "ENFORCEMENT_LEVEL": "BALANCED",
        "AUTO_FIX": "true"
      }
    }
  }
}
```

### Environment Variables

**sage-context-optimizer:**

| Variable | Default | Description |
|----------|---------|-------------|
| `SAGE_PATTERNS_DIR` | `.sage/agent/examples` | Pattern storage directory |
| `LOG_LEVEL` | `info` | Logging level (debug/info/warn/error) |
| `MAX_FILE_SIZE` | `1000000` | Max file size for analysis (bytes) |

**sage-research:**

| Variable | Default | Description |
|----------|---------|-------------|
| `SAGE_RESEARCH_DIR` | `.sage/agent/research` | Cache storage directory |
| `CACHE_TTL` | `86400000` | Cache TTL in milliseconds (24h) |
| `CACHE_MAX_SIZE` | `104857600` | Max cache size (100MB) |
| `CLEANUP_INTERVAL` | `3600000` | Cleanup interval (1h) |

**sage-enforcement:**

| Variable | Default | Description |
|----------|---------|-------------|
| `ENFORCEMENT_LEVEL` | `BALANCED` | STRICT/BALANCED/PROTOTYPE |
| `AUTO_FIX` | `false` | Auto-fix violations |
| `PORT` | `3456` | HTTP server port |

### Project-Level Configuration

Create `.sage/mcp-config.json` in your project:

```json
{
  "patternExtraction": {
    "languages": ["typescript", "python"],
    "excludePatterns": ["**/node_modules/**", "**/dist/**"],
    "maxFiles": 100,
    "confidenceThreshold": 0.7
  },
  "progressiveLoading": {
    "defaultLevel": "core",
    "tokenBudget": 5000,
    "priorityMapping": {
      "P0": "extended",
      "P1": "core",
      "P2": "critical"
    }
  },
  "researchCaching": {
    "ttl": 86400000,
    "maxSize": "100MB",
    "deduplication": true
  }
}
```

---

## Usage

### Pattern Extraction

```bash
# In Claude Code conversation
User: Extract patterns from my codebase

# Claude uses MCP tool
Claude: Using mcp__sage-context-optimizer__extract_patterns
        Parameters: { "directory": ".", "languages": ["typescript"] }

        Extracting patterns...
        - Analyzed 23 TypeScript files
        - Confidence: 84%
        - Module system: ESM
        - Naming: camelCase/PascalCase
        - Testing: Vitest
        - Patterns saved to .sage/agent/examples/
```

### Progressive Loading

```bash
# During implementation
User: /sage.implement AUTH-001

# Claude automatically loads context-aware patterns
Claude: Loading patterns for authentication context...
        - Loading level: core (based on P1 priority)
        - Patterns: naming, typing, errorHandling, testing
        - Token count: 201 tokens (60% reduction)
        - Confidence: 84%
```

### Research Caching

```bash
# First query (cache miss)
User: /sage.intel --topic=jwt-best-practices

Claude: Researching JWT best practices...
        Cache MISS - Fetching from web...
        - 15 sources analyzed
        - Results cached for 24 hours
        - Cache key: md5(jwt-best-practices)

# Second query (cache hit)
User: /sage.intel --topic=jwt-best-practices

Claude: Researching JWT best practices...
        Cache HIT - Loading from cache...
        - Cached 2 hours ago
        - TTL: 22 hours remaining
        - Saved 45 seconds
```

### Cache Management

```bash
# View cache statistics
User: Show research cache stats

Claude: Using mcp__sage-research__research_stats

        Research Cache Statistics:
        - Total entries: 47
        - Cache size: 23.4 MB
        - Hit rate: 73.2%
        - Hits: 156
        - Misses: 57
        - Oldest entry: 18 hours ago
        - Next cleanup: 45 minutes

# Clean expired entries
User: Cleanup expired cache

Claude: Using mcp__sage-research__research_cleanup

        Cleaned up 12 expired entries
        Freed 8.2 MB
        Current size: 15.2 MB
```

---

## Troubleshooting

### Server Not Starting

**Issue**: MCP server fails to start

**Solution**:

```bash
# Check Node.js version
node --version  # Must be 18+

# Verify build
ls servers/sage-context-optimizer/dist/index.js

# Check for missing dependencies
cd servers/sage-context-optimizer
npm ls

# Rebuild
npm run build
```

### Pattern Extraction Fails

**Issue**: No patterns extracted or low confidence

**Solution**:

```bash
# Check file permissions
ls -la src/

# Verify supported file types
# TypeScript: .ts, .tsx
# Python: .py

# Check exclude patterns
cat .sage/mcp-config.json | jq .patternExtraction.excludePatterns

# Run with debug logging
LOG_LEVEL=debug node servers/sage-context-optimizer/dist/index.js
```

### Cache Corruption

**Issue**: Research cache returns errors

**Solution**:

```bash
# Clear cache directory
rm -rf .sage/agent/research/*

# Verify directory exists
mkdir -p .sage/agent/research

# Check permissions
chmod 755 .sage/agent/research

# Restart server
# Claude Code will reconnect automatically
```

### High Memory Usage

**Issue**: MCP server consuming too much memory

**Solution**:

```bash
# Reduce cache size
export CACHE_MAX_SIZE=52428800  # 50MB instead of 100MB

# Lower pattern file limit
export MAX_FILE_SIZE=500000  # 500KB

# Monitor memory
node --expose-gc servers/sage-context-optimizer/dist/index.js
```

### Connection Timeout

**Issue**: MCP tools timeout

**Solution**:

```bash
# Check server is running
ps aux | grep sage

# Verify stdio transport
# MCP uses stdio, not HTTP

# Restart Claude Code
# Servers auto-reconnect

# Check logs
tail -f /tmp/sage-context-optimizer.log
```

---

## Development

### Running Tests

```bash
# All tests
cd servers/sage-context-optimizer
npm test

# Specific test file
npm test -- confidence-scorer.test.ts

# Coverage report
npm run coverage

# Watch mode
npm test -- --watch
```

### Test Suite Structure

```plaintext
servers/sage-context-optimizer/tests/
├── confidence-scorer.test.ts      # 12 tests
├── context-detector.test.ts       # 28 tests
├── progressive-loader.test.ts     # 21 tests
├── pattern-storage.test.ts        # 10 tests
├── mcp-server.integration.test.ts # 12 tests
└── pattern-extraction.integration.test.ts # 6 tests

Total: 89 tests
```

### Adding New Tools

1. **Define schema** in `schemas/`:

```typescript
// schemas/new-feature.ts
import { z } from 'zod';

export const NewFeatureSchema = z.object({
  input: z.string(),
  options: z.object({
    flag: z.boolean().optional()
  }).optional()
});
```

2. **Implement handler** in main server:

```typescript
// index.ts
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'new_feature') {
    const params = NewFeatureSchema.parse(request.params.arguments);
    const result = await processNewFeature(params);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }]
    };
  }
});
```

3. **Register tool** in tool list:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // ... existing tools
      {
        name: 'new_feature',
        description: 'Description of new feature',
        inputSchema: NewFeatureSchema
      }
    ]
  };
});
```

4. **Add tests**:

```typescript
// tests/new-feature.test.ts
describe('New Feature', () => {
  it('should process input correctly', async () => {
    const result = await processNewFeature({ input: 'test' });
    expect(result).toBeDefined();
  });
});
```

### Building for Production

```bash
# Clean build
npm run clean
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Full production build
npm run build:prod
```

### Debugging

```bash
# Enable debug logging
export LOG_LEVEL=debug

# Run with inspector
node --inspect servers/sage-context-optimizer/dist/index.js

# Connect Chrome DevTools
# Open chrome://inspect

# Profile memory
node --prof servers/sage-context-optimizer/dist/index.js
```

---

## Integration Points

### sage.init Integration

```bash
/sage.init
```

Calls `extract_patterns` to:

- Analyze codebase structure
- Extract naming conventions
- Detect module system
- Identify testing framework
- Store patterns in `.sage/agent/examples/`

### sage.specify Integration

```bash
/sage.specify
```

Uses `load_patterns` to:

- Include code pattern requirements in specs
- Apply naming conventions
- Set testing framework requirements
- Ensure consistency

### sage.implement Integration

```bash
/sage.implement AUTH-001
```

Uses `load_patterns_progressive` to:

- Load context-appropriate patterns
- Reduce token usage (60-80%)
- Apply confidence-based buffers
- Ensure pattern compliance

### sage.intel Integration

```bash
/sage.intel
```

Uses `research_store` and `research_query` to:

- Cache research findings
- Deduplicate queries
- Track hit rates
- Optimize API usage

---

## Performance Metrics

### Token Reduction

| Loading Level | Patterns Included | Token Reduction |
|---------------|-------------------|-----------------|
| Critical | naming, typing | 65% |
| Core | + errorHandling, testing | 60% |
| Extended | + architecture, security, etc. | 54% |

### Cache Performance

- **Hit rate**: 70-80% (after warm-up)
- **Query time**: 10ms (cache hit) vs 2-5s (cache miss)
- **Storage efficiency**: 23MB for 47 research entries
- **TTL optimization**: 24h balances freshness and performance

### Pattern Extraction

- **Sage-dev analysis**: 8.2 seconds for 9 TypeScript files
- **Overall confidence**: 80-84%
- **Detection accuracy**: 95%+ for supported patterns

---

## Next Steps

- [Installation Guide](INSTALLATION.md) - Complete setup instructions
- [Workflows Guide](WORKFLOWS.md) - Usage scenarios
- [Command Reference](../commands/SAGE.COMMANDS.md) - All 37 commands
- [Skills Guide](SKILLS_GUIDE.md) - Cross-platform portable skills
