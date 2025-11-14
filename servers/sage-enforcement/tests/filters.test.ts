/**
 * Result Filtering Pipeline Tests
 *
 * Validates filtering, sorting, pagination, and streaming functionality.
 * Target: 100% test coverage for critical path.
 */

import { describe, it, expect } from 'vitest';
import {
  filterViolations,
  streamViolations,
  sortViolations,
  getViolationsBySeverity,
  getSummaryStatistics,
  type FilteredResult,
} from '../filters.js';
import type { Violation } from '../schemas/index.js';

// Test Fixtures
const createViolation = (
  severity: 'error' | 'warning' | 'info',
  line: number,
  rule: string = 'test-rule'
): Violation => ({
  file: '/test/file.py',
  line,
  severity,
  rule,
  message: `${severity} at line ${line}`,
  autoFixable: false,
});

describe('Result Filtering Pipeline', () => {
  describe('filterViolations', () => {
    it('should filter empty array', () => {
      const result = filterViolations([]);

      expect(result.violations).toEqual([]);
      expect(result.metadata.total).toBe(0);
      expect(result.metadata.truncated).toBe(0);
    });

    it('should return all violations when below max', () => {
      const violations: Violation[] = [
        createViolation('error', 1),
        createViolation('warning', 2),
        createViolation('info', 3),
      ];

      const result = filterViolations(violations, 10);

      expect(result.violations).toHaveLength(3);
      expect(result.metadata.total).toBe(3);
      expect(result.metadata.truncated).toBe(0);
    });

    it('should sort by severity: error > warning > info', () => {
      const violations: Violation[] = [
        createViolation('info', 1),
        createViolation('error', 2),
        createViolation('warning', 3),
      ];

      const result = filterViolations(violations, 10);

      expect(result.violations[0].severity).toBe('error');
      expect(result.violations[1].severity).toBe('warning');
      expect(result.violations[2].severity).toBe('info');
    });

    it('should sort within severity by line number ascending', () => {
      const violations: Violation[] = [
        createViolation('error', 100),
        createViolation('error', 10),
        createViolation('error', 50),
      ];

      const result = filterViolations(violations, 10);

      expect(result.violations[0].line).toBe(10);
      expect(result.violations[1].line).toBe(50);
      expect(result.violations[2].line).toBe(100);
    });

    it('should paginate to maxPerSeverity', () => {
      const violations: Violation[] = [
        ...Array.from({ length: 15 }, (_, i) => createViolation('error', i + 1)),
        ...Array.from({ length: 12 }, (_, i) => createViolation('warning', i + 100)),
        ...Array.from({ length: 8 }, (_, i) => createViolation('info', i + 200)),
      ];

      const result = filterViolations(violations, 10);

      // Should return top 10 per severity
      expect(result.violations).toHaveLength(28); // 10 errors + 10 warnings + 8 info
      expect(result.metadata.bySeverity.error.returned).toBe(10);
      expect(result.metadata.bySeverity.error.truncated).toBe(5);
      expect(result.metadata.bySeverity.warning.returned).toBe(10);
      expect(result.metadata.bySeverity.warning.truncated).toBe(2);
      expect(result.metadata.bySeverity.info.returned).toBe(8);
      expect(result.metadata.bySeverity.info.truncated).toBe(0);
    });

    it('should calculate metadata correctly', () => {
      const violations: Violation[] = [
        ...Array.from({ length: 20 }, (_, i) => createViolation('error', i + 1)),
        ...Array.from({ length: 15 }, (_, i) => createViolation('warning', i + 100)),
        ...Array.from({ length: 5 }, (_, i) => createViolation('info', i + 200)),
      ];

      const result = filterViolations(violations, 10);

      expect(result.metadata.total).toBe(40);
      expect(result.metadata.truncated).toBe(15); // 10 errors + 5 warnings truncated
      expect(result.metadata.bySeverity.error.total).toBe(20);
      expect(result.metadata.bySeverity.warning.total).toBe(15);
      expect(result.metadata.bySeverity.info.total).toBe(5);
    });

    it('should handle maxPerSeverity = 0', () => {
      const violations: Violation[] = [
        createViolation('error', 1),
        createViolation('warning', 2),
      ];

      const result = filterViolations(violations, 0);

      expect(result.violations).toHaveLength(0);
      expect(result.metadata.truncated).toBe(2);
    });

    it('should use default maxPerSeverity = 10', () => {
      const violations: Violation[] = Array.from({ length: 25 }, (_, i) =>
        createViolation('error', i + 1)
      );

      const result = filterViolations(violations);

      expect(result.violations).toHaveLength(10);
      expect(result.metadata.bySeverity.error.returned).toBe(10);
      expect(result.metadata.bySeverity.error.truncated).toBe(15);
    });

    it('should preserve violation properties', () => {
      const violation: Violation = {
        file: '/path/to/file.py',
        line: 42,
        column: 10,
        severity: 'error',
        rule: 'missing-type',
        message: 'Missing type annotation',
        suggestion: 'Add type hint',
        autoFixable: true,
      };

      const result = filterViolations([violation], 10);

      expect(result.violations[0]).toEqual(violation);
    });
  });

  describe('streamViolations', () => {
    it('should stream violations in batches', async () => {
      const violations: Violation[] = Array.from({ length: 25 }, (_, i) =>
        createViolation('error', i + 1)
      );

      const batches: Violation[][] = [];
      for await (const batch of streamViolations(violations, 10)) {
        batches.push(batch);
      }

      expect(batches).toHaveLength(3); // 10, 10, 5
      expect(batches[0]).toHaveLength(10);
      expect(batches[1]).toHaveLength(10);
      expect(batches[2]).toHaveLength(5);
    });

    it('should stream in severity order', async () => {
      const violations: Violation[] = [
        ...Array.from({ length: 5 }, (_, i) => createViolation('info', i + 200)),
        ...Array.from({ length: 5 }, (_, i) => createViolation('error', i + 1)),
        ...Array.from({ length: 5 }, (_, i) => createViolation('warning', i + 100)),
      ];

      const batches: Violation[][] = [];
      for await (const batch of streamViolations(violations, 10)) {
        batches.push(batch);
      }

      // Should yield errors first, then warnings, then info
      expect(batches[0][0].severity).toBe('error');
      expect(batches[1][0].severity).toBe('warning');
      expect(batches[2][0].severity).toBe('info');
    });

    it('should sort within batches by line number', async () => {
      const violations: Violation[] = [
        createViolation('error', 100),
        createViolation('error', 10),
        createViolation('error', 50),
      ];

      const batches: Violation[][] = [];
      for await (const batch of streamViolations(violations, 10)) {
        batches.push(batch);
      }

      expect(batches[0][0].line).toBe(10);
      expect(batches[0][1].line).toBe(50);
      expect(batches[0][2].line).toBe(100);
    });

    it('should handle empty violations', async () => {
      const batches: Violation[][] = [];
      for await (const batch of streamViolations([], 10)) {
        batches.push(batch);
      }

      expect(batches).toHaveLength(0);
    });

    it('should use default batchSize = 10', async () => {
      const violations: Violation[] = Array.from({ length: 25 }, (_, i) =>
        createViolation('error', i + 1)
      );

      const batches: Violation[][] = [];
      for await (const batch of streamViolations(violations)) {
        batches.push(batch);
      }

      expect(batches).toHaveLength(3);
      expect(batches[0]).toHaveLength(10);
    });

    it('should handle batchSize larger than violations', async () => {
      const violations: Violation[] = [
        createViolation('error', 1),
        createViolation('error', 2),
      ];

      const batches: Violation[][] = [];
      for await (const batch of streamViolations(violations, 100)) {
        batches.push(batch);
      }

      expect(batches).toHaveLength(1);
      expect(batches[0]).toHaveLength(2);
    });
  });

  describe('sortViolations', () => {
    it('should sort by severity priority', () => {
      const violations: Violation[] = [
        createViolation('info', 1),
        createViolation('warning', 2),
        createViolation('error', 3),
      ];

      const sorted = sortViolations(violations);

      expect(sorted[0].severity).toBe('error');
      expect(sorted[1].severity).toBe('warning');
      expect(sorted[2].severity).toBe('info');
    });

    it('should sort by line number within severity', () => {
      const violations: Violation[] = [
        createViolation('error', 100),
        createViolation('error', 10),
        createViolation('error', 50),
      ];

      const sorted = sortViolations(violations);

      expect(sorted[0].line).toBe(10);
      expect(sorted[1].line).toBe(50);
      expect(sorted[2].line).toBe(100);
    });

    it('should mutate original array', () => {
      const violations: Violation[] = [
        createViolation('info', 1),
        createViolation('error', 2),
      ];

      const sorted = sortViolations(violations);

      expect(sorted).toBe(violations); // Same reference
      expect(violations[0].severity).toBe('error');
    });

    it('should handle empty array', () => {
      const sorted = sortViolations([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single violation', () => {
      const violations: Violation[] = [createViolation('warning', 1)];
      const sorted = sortViolations(violations);

      expect(sorted).toHaveLength(1);
      expect(sorted[0].severity).toBe('warning');
    });
  });

  describe('getViolationsBySeverity', () => {
    it('should filter by single severity', () => {
      const violations: Violation[] = [
        createViolation('error', 1),
        createViolation('warning', 2),
        createViolation('info', 3),
      ];

      const errors = getViolationsBySeverity(violations, ['error']);

      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
    });

    it('should filter by multiple severities', () => {
      const violations: Violation[] = [
        createViolation('error', 1),
        createViolation('warning', 2),
        createViolation('info', 3),
      ];

      const critical = getViolationsBySeverity(violations, ['error', 'warning']);

      expect(critical).toHaveLength(2);
      expect(critical.some((v) => v.severity === 'info')).toBe(false);
    });

    it('should return empty array when no matches', () => {
      const violations: Violation[] = [createViolation('info', 1)];

      const errors = getViolationsBySeverity(violations, ['error']);

      expect(errors).toEqual([]);
    });

    it('should handle empty violations', () => {
      const filtered = getViolationsBySeverity([], ['error']);
      expect(filtered).toEqual([]);
    });

    it('should handle empty severities filter', () => {
      const violations: Violation[] = [createViolation('error', 1)];
      const filtered = getViolationsBySeverity(violations, []);

      expect(filtered).toEqual([]);
    });
  });

  describe('getSummaryStatistics', () => {
    it('should count violations by severity', () => {
      const violations: Violation[] = [
        createViolation('error', 1),
        createViolation('error', 2),
        createViolation('warning', 3),
        createViolation('info', 4),
        createViolation('info', 5),
        createViolation('info', 6),
      ];

      const summary = getSummaryStatistics(violations);

      expect(summary.error).toBe(2);
      expect(summary.warning).toBe(1);
      expect(summary.info).toBe(3);
    });

    it('should return zero counts for empty array', () => {
      const summary = getSummaryStatistics([]);

      expect(summary.error).toBe(0);
      expect(summary.warning).toBe(0);
      expect(summary.info).toBe(0);
    });

    it('should handle single severity', () => {
      const violations: Violation[] = [
        createViolation('error', 1),
        createViolation('error', 2),
      ];

      const summary = getSummaryStatistics(violations);

      expect(summary.error).toBe(2);
      expect(summary.warning).toBe(0);
      expect(summary.info).toBe(0);
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle large violation sets efficiently', () => {
      const startTime = performance.now();

      // Generate 1000 violations
      const violations: Violation[] = Array.from({ length: 1000 }, (_, i) => {
        const severity = i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'info';
        return createViolation(severity as 'error' | 'warning' | 'info', i + 1);
      });

      const result = filterViolations(violations, 10);

      const elapsedTime = performance.now() - startTime;

      expect(result.violations).toHaveLength(30); // 10 per severity
      expect(elapsedTime).toBeLessThan(10); // <10ms target
    });

    it('should handle violations with same line numbers', () => {
      const violations: Violation[] = [
        createViolation('error', 42, 'rule-a'),
        createViolation('error', 42, 'rule-b'),
        createViolation('error', 42, 'rule-c'),
      ];

      const result = filterViolations(violations, 10);

      expect(result.violations).toHaveLength(3);
      expect(result.violations.every((v) => v.line === 42)).toBe(true);
    });

    it('should handle violations without column numbers', () => {
      const violation: Violation = {
        file: '/test.py',
        line: 1,
        severity: 'error',
        rule: 'test-rule',
        message: 'Test message',
        autoFixable: false,
      };

      const result = filterViolations([violation], 10);

      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].column).toBeUndefined();
    });
  });
});
