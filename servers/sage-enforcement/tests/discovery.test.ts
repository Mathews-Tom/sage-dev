import { describe, it, expect, beforeEach } from 'vitest';
import {
  discoverAgents,
  getApplicableAgents,
  getAgentMetadata,
  clearAgentCache,
  getCachedAgentCount,
} from '../discovery.js';

describe('discovery', () => {
  beforeEach(() => {
    clearAgentCache();
  });

  describe('discoverAgents', () => {
    it('returns all available agents', () => {
      const agents = discoverAgents();

      expect(agents.length).toBe(4);
      expect(agents.map(a => a.name)).toEqual([
        'type-enforcer',
        'doc-validator',
        'test-coverage',
        'security-scanner',
      ]);
    });

    it('includes agent metadata', () => {
      const agents = discoverAgents();

      for (const agent of agents) {
        expect(agent).toHaveProperty('name');
        expect(agent).toHaveProperty('description');
        expect(agent).toHaveProperty('applicableFileTypes');
        expect(agent).toHaveProperty('modulePath');
      }
    });
  });

  describe('getApplicableAgents', () => {
    it('returns 4 agents for Python files', () => {
      const agents = getApplicableAgents('/test/file.py');

      expect(agents.length).toBe(4);
      expect(agents).toEqual([
        'type-enforcer',
        'doc-validator',
        'test-coverage',
        'security-scanner',
      ]);
    });

    it('returns 1 agent for TypeScript files', () => {
      const agents = getApplicableAgents('/test/file.ts');

      expect(agents.length).toBe(1);
      expect(agents).toEqual(['security-scanner']);
    });

    it('returns 1 agent for JavaScript files', () => {
      const agents = getApplicableAgents('/test/file.js');

      expect(agents.length).toBe(1);
      expect(agents).toEqual(['security-scanner']);
    });

    it('returns empty array for unsupported file types', () => {
      const agents = getApplicableAgents('/test/file.md');

      expect(agents.length).toBe(0);
    });

    it('is case-insensitive for file extensions', () => {
      const agents1 = getApplicableAgents('/test/file.PY');
      const agents2 = getApplicableAgents('/test/file.TS');

      expect(agents1.length).toBe(4);
      expect(agents2.length).toBe(1);
    });
  });

  describe('getAgentMetadata', () => {
    it('returns metadata for valid agent name', () => {
      const metadata = getAgentMetadata('type-enforcer');

      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe('type-enforcer');
      expect(metadata?.description).toContain('Python 3.12');
    });

    it('returns undefined for unknown agent', () => {
      const metadata = getAgentMetadata('unknown-agent');

      expect(metadata).toBeUndefined();
    });
  });

  describe('clearAgentCache', () => {
    it('clears cached agents', () => {
      clearAgentCache();

      expect(getCachedAgentCount()).toBe(0);
    });
  });
});
