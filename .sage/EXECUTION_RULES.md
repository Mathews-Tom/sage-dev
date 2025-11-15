# EXECUTION RULES FOR MCP ENFORCEMENT AGENTS

**Purpose**: Explicit directives for AI agents using the MCP enforcement server infrastructure.
**Target Audience**: Claude Code, LLM-based development tools, autonomous agents.
**Last Updated**: 2025-11-14

---

## Overview

The MCP enforcement server achieves **92% token reduction** (150K → 12K tokens) through:
1. **On-demand tool loading**: Import only applicable agents, never all agents
2. **Result filtering**: Filter violations before logging to context
3. **Progressive discovery**: Check filesystem, load selective agents

**CRITICAL**: Violating these rules eliminates token savings and causes performance degradation.

---

## RULE 1: On-Demand Tool Loading

### ✅ CORRECT: Load Only Applicable Agents

```typescript
// GOOD: Import only agents needed for this file type
import { getApplicableAgents, getAgent } from './discovery.js';

async function enforceFile(filePath: string, code: string) {
  // Get applicable agents for file type
  const agentNames = getApplicableAgents(filePath);  // .py → 4 agents, .ts → 1 agent

  // Load only applicable agents
  const agents = await Promise.all(
    agentNames.map(name => getAgent(name))
  );

  // Execute only loaded agents
  const results = await Promise.all(
    agents.map(agent => agent.execute({ filePath, code }))
  );

  return results;
}
```

### ❌ INCORRECT: Loading All Agents

```typescript
// BAD: DO NOT import all agents upfront
import { typeEnforcer } from './agents/type-enforcer.js';
import { docValidator } from './agents/doc-validator.js';
import { testCoverage } from './agents/test-coverage.js';
import { securityScanner } from './agents/security-scanner.js';

// BAD: DO NOT execute all agents regardless of file type
async function enforceFile(filePath: string, code: string) {
  // This wastes tokens - TypeScript files don't need type-enforcer
  const results = await Promise.all([
    typeEnforcer({ filePath, code }),
    docValidator({ filePath, code }),
    testCoverage({ filePath }),
    securityScanner({ filePath, code }),
  ]);

  return results;
}
```

**Why**: Loading all agents uses 4x more tokens than needed. TypeScript files need 1 agent (security-scanner), not 4.

---

## RULE 2: Result Filtering in Code

### ✅ CORRECT: Filter Before Logging

```typescript
import { filterViolations } from './filters.js';

async function enforceWithFiltering(filePath: string, code: string) {
  const agents = await loadAgentsForFile(filePath);
  const results = await Promise.all(
    agents.map(agent => agent.execute({ filePath, code }))
  );

  // GOOD: Filter violations before logging to context
  for (const result of results) {
    const filtered = filterViolations(result.violations, 10);  // Top 10 per severity

    console.error(`Agent: ${result.agent}`);
    console.error(`Violations: ${filtered.metadata.total} (showing ${filtered.violations.length})`);

    // Log only filtered results
    for (const violation of filtered.violations) {
      console.error(`  ${violation.severity}: ${violation.file}:${violation.line} - ${violation.message}`);
    }
  }
}
```

### ❌ INCORRECT: Logging Unfiltered Results

```typescript
// BAD: DO NOT log all violations to context
async function enforceWithoutFiltering(filePath: string, code: string) {
  const agents = await loadAgentsForFile(filePath);
  const results = await Promise.all(
    agents.map(agent => agent.execute({ filePath, code }))
  );

  // BAD: Logging 1000+ violations consumes massive context
  for (const result of results) {
    console.error(`Agent: ${result.agent}`);

    // This logs ALL violations - wastes tokens
    for (const violation of result.violations) {
      console.error(`  ${violation.severity}: ${violation.file}:${violation.line} - ${violation.message}`);
    }
  }
}
```

**Why**: Unfiltered results can be 1000+ violations. Filtering to top 10 per severity reduces token usage by 97%.

---

## RULE 3: Progressive Discovery

### ✅ CORRECT: Filesystem-Based Discovery

```typescript
import { discoverAgents, getApplicableAgents, loadAgentsForFile } from './discovery.js';

async function initialize() {
  // GOOD: Discover available agents from filesystem
  const availableAgents = discoverAgents();
  console.error(`Discovered ${availableAgents.length} agents`);

  // No loading happens here - just discovery
  return availableAgents;
}

async function enforceFile(filePath: string, code: string) {
  // GOOD: Load only agents applicable to this file
  const agents = await loadAgentsForFile(filePath);

  console.error(`Loaded ${agents.length} agents for ${filePath}`);

  // Execute loaded agents
  const results = await Promise.all(
    agents.map(agent => agent.execute({ filePath, code }))
  );

  return results;
}
```

### ❌ INCORRECT: Upfront Loading

```typescript
// BAD: DO NOT load all agents at startup
const allAgents = await Promise.all([
  getAgent('type-enforcer'),
  getAgent('doc-validator'),
  getAgent('test-coverage'),
  getAgent('security-scanner'),
]);

// BAD: DO NOT cache all agents globally
globalThis.cachedAgents = allAgents;

async function enforceFile(filePath: string, code: string) {
  // This uses 4x more memory than needed
  const results = await Promise.all(
    globalThis.cachedAgents.map(agent => agent.execute({ filePath, code }))
  );

  return results;
}
```

**Why**: Upfront loading wastes memory and tokens. Progressive discovery loads agents on-demand based on file types.

---

## Complete Usage Example

### ✅ CORRECT: Full Enforcement Flow

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadAgentsForFile } from './discovery.js';
import { filterViolations } from './filters.js';

const server = new Server(
  {
    name: 'sage-enforcement',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register enforce-file tool
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'enforce-file') {
    const { filePath, code } = request.params.arguments as {
      filePath: string;
      code: string;
    };

    try {
      // Step 1: Load only applicable agents
      const agents = await loadAgentsForFile(filePath);

      // Step 2: Execute loaded agents
      const results = await Promise.all(
        agents.map(agent => agent.execute({ filePath, code }))
      );

      // Step 3: Filter results before returning
      const filteredResults = results.map(result => ({
        agent: result.agent,
        executionTime: result.executionTime,
        tokensUsed: result.tokensUsed,
        ...filterViolations(result.violations, 10),
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(filteredResults, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Enforcement failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## Streaming for Large Result Sets

### ✅ CORRECT: Progressive Streaming

```typescript
import { streamViolations } from './filters.js';

async function streamEnforcementResults(filePath: string, code: string) {
  const agents = await loadAgentsForFile(filePath);

  for (const agent of agents) {
    const result = await agent.execute({ filePath, code });

    // GOOD: Stream violations in batches
    console.error(`Agent: ${agent.name}`);

    for await (const batch of streamViolations(result.violations, 10)) {
      console.error(`  Batch: ${batch.length} violations`);

      for (const violation of batch) {
        console.error(`    ${violation.severity}: ${violation.message}`);
      }

      // Yield control between batches
      await new Promise(resolve => setImmediate(resolve));
    }
  }
}
```

---

## Anti-Patterns: What NOT to Do

### ❌ ANTI-PATTERN 1: Loading All Agents Regardless of File Type

```typescript
// BAD: Wastes 3x tokens for TypeScript files
const agents = await Promise.all([
  getAgent('type-enforcer'),    // Not needed for .ts files
  getAgent('doc-validator'),    // Not needed for .ts files
  getAgent('test-coverage'),    // Not needed for .ts files
  getAgent('security-scanner'), // Only agent needed for .ts files
]);
```

**Fix**: Use `getApplicableAgents(filePath)` to load only relevant agents.

### ❌ ANTI-PATTERN 2: Passing Unfiltered Results to Context

```typescript
// BAD: 1000 violations = 50K tokens wasted
console.log(JSON.stringify(violations, null, 2));
```

**Fix**: Use `filterViolations(violations, 10)` before logging.

### ❌ ANTI-PATTERN 3: Synchronous Agent Discovery

```typescript
// BAD: Blocks event loop during discovery
const agents = readdirSync('./agents')
  .map(file => require(`./agents/${file}`))
  .map(module => module.default);
```

**Fix**: Use async `discoverAgents()` and lazy loading with `getAgent()`.

### ❌ ANTI-PATTERN 4: Global Agent Cache

```typescript
// BAD: Memory leak - agents cached globally forever
globalThis.agentCache = new Map();

async function getAgent(name: string) {
  if (!globalThis.agentCache.has(name)) {
    globalThis.agentCache.set(name, await import(`./agents/${name}.js`));
  }
  return globalThis.agentCache.get(name);
}
```

**Fix**: Use session-based cache in `discovery.ts` with `clearAgentCache()` for cleanup.

### ❌ ANTI-PATTERN 5: Ignoring Severity Levels

```typescript
// BAD: Treating all violations equally
const allViolations = results.flatMap(r => r.violations);
```

**Fix**: Use `sortViolations()` to prioritize errors > warnings > info.

### ❌ ANTI-PATTERN 6: Not Handling Large Result Sets

```typescript
// BAD: Loading 10K violations into memory at once
const violations = await getAllViolations(filePath);
console.log(violations); // OOM for large files
```

**Fix**: Use `streamViolations()` async generator for large result sets.

---

## Performance Targets

When following these rules, expect:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Token Usage (TypeScript) | <5K tokens | Load 1 agent, filter 10 violations |
| Token Usage (Python) | <12K tokens | Load 4 agents, filter 40 violations |
| Discovery Latency (cached) | <100ms | Session-based agent cache |
| Discovery Latency (cold) | <500ms | Filesystem scan + import |
| Filtering Latency | <10ms | 1000 violations → 30 filtered |

---

## Validation Checklist

Before deploying enforcement code, verify:

- [ ] ✅ Use `getApplicableAgents()` to load selective agents
- [ ] ✅ Use `filterViolations()` before logging results
- [ ] ✅ Use `discoverAgents()` for filesystem-based discovery
- [ ] ✅ Use async generators for large result sets
- [ ] ✅ Verify token usage <12K per enforcement operation
- [ ] ❌ NEVER import all agents upfront
- [ ] ❌ NEVER log unfiltered violations to context
- [ ] ❌ NEVER use global agent cache
- [ ] ❌ NEVER ignore severity levels

---

## References

- `discovery.ts`: Progressive tool discovery implementation (MCP-011)
- `filters.ts`: Result filtering pipeline implementation (MCP-012)
- `index.ts`: MCP server entry point with tool registration (MCP-003)
- `docs/specs/mcp-server-infrastructure/spec.md`: Full specification
- `docs/specs/mcp-server-infrastructure/plan.md`: Architecture and research

---

## Enforcement

**These rules are mandatory**. Code review should reject PRs that:
1. Load all agents regardless of file type
2. Log unfiltered violations (>30 violations per agent)
3. Use synchronous discovery or global caching

**Rationale**: These patterns eliminate the 92% token reduction this architecture provides.
