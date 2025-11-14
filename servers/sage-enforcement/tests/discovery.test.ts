/**
 * Discovery System Tests
 *
 * Validates agent discovery, lazy loading, caching, and performance metrics.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getApplicableAgents,
  discoverAgents,
  getAgent,
  loadAgentsForFile,
  clearAgentCache,
  getPerformanceMetrics,
  getAgentRegistry,
} from '../discovery.js';

describe('Agent Discovery System', () => {
  beforeEach(() => {
    // Clear cache before each test to ensure isolation
    clearAgentCache();
  });

  describe('getApplicableAgents', () => {
    it('should return all 4 agents for .py files', () => {
      const agents = getApplicableAgents('src/auth.py');

      expect(agents).toHaveLength(4);
      expect(agents).toContain('type-enforcer');
      expect(agents).toContain('doc-validator');
      expect(agents).toContain('test-coverage');
      expect(agents).toContain('security-scanner');
    });

    it('should return 2 agents for .pyi files (stub files)', () => {
      const agents = getApplicableAgents('src/types.pyi');

      expect(agents).toHaveLength(2);
      expect(agents).toContain('type-enforcer');
      expect(agents).toContain('doc-validator');
      expect(agents).not.toContain('test-coverage'); // No tests for stub files
      expect(agents).not.toContain('security-scanner');
    });

    it('should return only security-scanner for .ts files', () => {
      const agents = getApplicableAgents('src/utils.ts');

      expect(agents).toHaveLength(1);
      expect(agents).toContain('security-scanner');
    });

    it('should return only security-scanner for .js files', () => {
      const agents = getApplicableAgents('src/utils.js');

      expect(agents).toHaveLength(1);
      expect(agents).toContain('security-scanner');
    });

    it('should return empty array for unsupported file types', () => {
      const agents = getApplicableAgents('README.md');

      expect(agents).toHaveLength(0);
    });

    it('should handle file paths with directories', () => {
      const agents = getApplicableAgents('/path/to/src/component.py');

      expect(agents).toHaveLength(4);
    });

    it('should handle relative file paths', () => {
      const agents = getApplicableAgents('../auth.py');

      expect(agents).toHaveLength(4);
    });
  });

  describe('discoverAgents', () => {
    it('should discover all agent files in agents directory', () => {
      const agents = discoverAgents();

      // Should find at least the 4 core agents
      expect(agents.length).toBeGreaterThanOrEqual(4);
      expect(agents).toContain('type-enforcer');
      expect(agents).toContain('doc-validator');
      expect(agents).toContain('test-coverage');
      expect(agents).toContain('security-scanner');
    });

    it('should not include test files', () => {
      const agents = discoverAgents();

      // No .test.ts files should be discovered
      agents.forEach((agent) => {
        expect(agent).not.toContain('.test');
      });
    });

    it('should return agent names without file extensions', () => {
      const agents = discoverAgents();

      agents.forEach((agent) => {
        expect(agent).not.toContain('.ts');
        expect(agent).not.toContain('.js');
      });
    });
  });

  describe('getAgent', () => {
    it('should load type-enforcer agent with execute function', async () => {
      const agent = await getAgent('type-enforcer');

      expect(agent.name).toBe('type-enforcer');
      expect(agent.displayName).toBe('Type Enforcer');
      expect(agent.description).toContain('Pyright');
      expect(agent.supportedExtensions).toContain('.py');
      expect(agent.execute).toBeDefined();
      expect(typeof agent.execute).toBe('function');
    });

    it('should load doc-validator agent with execute function', async () => {
      const agent = await getAgent('doc-validator');

      expect(agent.name).toBe('doc-validator');
      expect(agent.displayName).toBe('Documentation Validator');
      expect(agent.description).toContain('docstring');
      expect(agent.supportedExtensions).toContain('.py');
      expect(agent.execute).toBeDefined();
    });

    it('should load test-coverage agent with execute function', async () => {
      const agent = await getAgent('test-coverage');

      expect(agent.name).toBe('test-coverage');
      expect(agent.displayName).toBe('Test Coverage');
      expect(agent.description).toContain('pytest-cov');
      expect(agent.supportedExtensions).toContain('.py');
      expect(agent.execute).toBeDefined();
    });

    it('should load security-scanner agent with execute function', async () => {
      const agent = await getAgent('security-scanner');

      expect(agent.name).toBe('security-scanner');
      expect(agent.displayName).toBe('Security Scanner');
      expect(agent.description).toContain('OWASP');
      expect(agent.supportedExtensions).toContain('.py');
      expect(agent.supportedExtensions).toContain('.js');
      expect(agent.execute).toBeDefined();
    });

    it('should throw error for unknown agent', async () => {
      await expect(getAgent('nonexistent-agent')).rejects.toThrow(
        'Agent not found: nonexistent-agent'
      );
    });

    it('should cache loaded agents', async () => {
      // Load agent first time
      const agent1 = await getAgent('type-enforcer');

      // Load again - should come from cache
      const agent2 = await getAgent('type-enforcer');

      // Should be same instance
      expect(agent1).toBe(agent2);

      // Check metrics
      const metrics = getPerformanceMetrics();
      expect(metrics.cacheHits).toBeGreaterThan(0);
    });

    it('should have cache hit latency <100ms', async () => {
      // Prime cache
      await getAgent('type-enforcer');

      // Measure cache hit
      const start = performance.now();
      await getAgent('type-enforcer');
      const latency = performance.now() - start;

      expect(latency).toBeLessThan(100);
    });

    it('should have cold start latency <500ms', async () => {
      // Clear cache to ensure cold start
      clearAgentCache();

      // Measure cold start
      const start = performance.now();
      await getAgent('type-enforcer');
      const latency = performance.now() - start;

      expect(latency).toBeLessThan(500);
    });
  });

  describe('loadAgentsForFile', () => {
    it('should load all applicable agents for Python file', async () => {
      const agents = await loadAgentsForFile('src/auth.py');

      expect(agents).toHaveLength(4);
      expect(agents.every((a) => a.execute)).toBe(true);
    });

    it('should load selective agents for TypeScript file', async () => {
      const agents = await loadAgentsForFile('src/utils.ts');

      expect(agents).toHaveLength(1);
      expect(agents[0].name).toBe('security-scanner');
    });

    it('should return empty array for unsupported files', async () => {
      const agents = await loadAgentsForFile('README.md');

      expect(agents).toHaveLength(0);
    });

    it('should complete loading in reasonable time', async () => {
      const start = performance.now();
      await loadAgentsForFile('src/auth.py');
      const latency = performance.now() - start;

      // First load (cold start): <2000ms for 4 agents
      expect(latency).toBeLessThan(2000);
    });
  });

  describe('Performance Metrics', () => {
    it('should track cache hits and misses', async () => {
      clearAgentCache();

      await getAgent('type-enforcer'); // Cache miss
      await getAgent('type-enforcer'); // Cache hit
      await getAgent('doc-validator'); // Cache miss
      await getAgent('type-enforcer'); // Cache hit

      const metrics = getPerformanceMetrics();

      expect(metrics.cacheHits).toBe(2);
      expect(metrics.cacheMisses).toBe(2);
    });

    it('should track total discovery time', async () => {
      clearAgentCache();

      await getAgent('type-enforcer');
      const metrics = getPerformanceMetrics();

      expect(metrics.totalDiscoveryTime).toBeGreaterThan(0);
    });

    it('should calculate average discovery time', async () => {
      clearAgentCache();

      await getAgent('type-enforcer');
      await getAgent('doc-validator');

      const metrics = getPerformanceMetrics();

      expect(metrics.avgDiscoveryTime).toBeGreaterThan(0);
      expect(metrics.avgDiscoveryTime).toBeLessThan(metrics.totalDiscoveryTime);
    });
  });

  describe('Cache Management', () => {
    it('should clear agent cache and reset metrics', async () => {
      // Load agent to populate cache
      await getAgent('type-enforcer');
      const metricsBeforeClear = getPerformanceMetrics();
      expect(metricsBeforeClear.cacheMisses).toBe(1);

      // Clear cache (also resets metrics)
      clearAgentCache();

      // Verify metrics are reset
      const metricsAfterClear = getPerformanceMetrics();
      expect(metricsAfterClear.cacheMisses).toBe(0);
      expect(metricsAfterClear.cacheHits).toBe(0);

      // Load again - should be cache miss
      await getAgent('type-enforcer');

      const metricsFinal = getPerformanceMetrics();
      expect(metricsFinal.cacheMisses).toBe(1); // One miss after clear
    });
  });

  describe('Agent Registry', () => {
    it('should return complete agent registry', () => {
      const registry = getAgentRegistry();

      expect(Object.keys(registry)).toHaveLength(4);
      expect(registry['type-enforcer']).toBeDefined();
      expect(registry['doc-validator']).toBeDefined();
      expect(registry['test-coverage']).toBeDefined();
      expect(registry['security-scanner']).toBeDefined();
    });

    it('should include all metadata fields', () => {
      const registry = getAgentRegistry();

      Object.values(registry).forEach((agent) => {
        expect(agent.name).toBeDefined();
        expect(agent.displayName).toBeDefined();
        expect(agent.description).toBeDefined();
        expect(agent.supportedExtensions).toBeDefined();
        expect(Array.isArray(agent.supportedExtensions)).toBe(true);
      });
    });
  });

  describe('Selective Loading (Scenario 6 from spec)', () => {
    it('should load 1-2 agents for TypeScript, not all 4', async () => {
      const agents = await loadAgentsForFile('src/component.ts');

      expect(agents.length).toBeLessThan(4);
      expect(agents.length).toBeGreaterThanOrEqual(1);
    });

    it('should load 4 agents for Python, not less', async () => {
      const agents = await loadAgentsForFile('src/module.py');

      expect(agents.length).toBe(4);
    });

    it('should not load Python-specific agents for JavaScript files', async () => {
      const agents = await loadAgentsForFile('src/script.js');

      const agentNames = agents.map((a) => a.name);
      expect(agentNames).not.toContain('type-enforcer');
      expect(agentNames).not.toContain('doc-validator');
      expect(agentNames).not.toContain('test-coverage');
    });
  });
});
