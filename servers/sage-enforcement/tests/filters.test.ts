import { describe, it, expect } from 'vitest';
import {
  sortViolations,
  filterViolations,
  groupViolationsByFile,
  groupViolationsBySeverity,
  calculateStatistics,
} from '../filters.js';
import type { Violation } from '../schemas/index.js';

describe('filters', () => {
  const createViolation = (overrides: Partial<Violation>): Violation => ({
    file: '/test/file.py',
    line: 1,
    column: 0,
    severity: 'error',
    rule: 'test-rule',
    message: 'Test violation',
    autoFixable: false,
    ...overrides,
  });

  describe('sortViolations', () => {
    it('sorts by severity first (errors, warnings, info)', () => {
      const violations = [
        createViolation({ severity: 'info', line: 1 }),
        createViolation({ severity: 'error', line: 3 }),
        createViolation({ severity: 'warning', line: 2 }),
      ];

      const sorted = sortViolations(violations);

      expect(sorted[0].severity).toBe('error');
      expect(sorted[1].severity).toBe('warning');
      expect(sorted[2].severity).toBe('info');
    });

    it('sorts by line number within same severity', () => {
      const violations = [
        createViolation({ severity: 'error', line: 10 }),
        createViolation({ severity: 'error', line: 5 }),
        createViolation({ severity: 'error', line: 15 }),
      ];

      const sorted = sortViolations(violations);

      expect(sorted[0].line).toBe(5);
      expect(sorted[1].line).toBe(10);
      expect(sorted[2].line).toBe(15);
    });
  });

  describe('filterViolations', () => {
    it('filters to top N per severity', () => {
      const violations = [
        ...Array(20).fill(0).map((_, i) => createViolation({ severity: 'error', line: i + 1 })),
        ...Array(20).fill(0).map((_, i) => createViolation({ severity: 'warning', line: i + 100 })),
        ...Array(20).fill(0).map((_, i) => createViolation({ severity: 'info', line: i + 200 })),
      ];

      const filtered = filterViolations(violations, 5);

      expect(filtered.violations.length).toBe(15); // 5 per severity
      expect(filtered.metadata.total).toBe(60);
      expect(filtered.metadata.filtered).toBe(45);
    });

    it('calculates metadata correctly', () => {
      const violations = [
        createViolation({ severity: 'error' }),
        createViolation({ severity: 'error' }),
        createViolation({ severity: 'warning' }),
        createViolation({ severity: 'info' }),
      ];

      const filtered = filterViolations(violations, 10);

      expect(filtered.metadata.errors).toBe(2);
      expect(filtered.metadata.warnings).toBe(1);
      expect(filtered.metadata.info).toBe(1);
      expect(filtered.metadata.total).toBe(4);
    });
  });

  describe('groupViolationsByFile', () => {
    it('groups violations by file path', () => {
      const violations = [
        createViolation({ file: '/test/file1.py', line: 1 }),
        createViolation({ file: '/test/file2.py', line: 1 }),
        createViolation({ file: '/test/file1.py', line: 2 }),
      ];

      const grouped = groupViolationsByFile(violations);

      expect(grouped.size).toBe(2);
      expect(grouped.get('/test/file1.py')?.length).toBe(2);
      expect(grouped.get('/test/file2.py')?.length).toBe(1);
    });
  });

  describe('groupViolationsBySeverity', () => {
    it('groups violations by severity', () => {
      const violations = [
        createViolation({ severity: 'error' }),
        createViolation({ severity: 'error' }),
        createViolation({ severity: 'warning' }),
        createViolation({ severity: 'info' }),
      ];

      const grouped = groupViolationsBySeverity(violations);

      expect(grouped.get('error')?.length).toBe(2);
      expect(grouped.get('warning')?.length).toBe(1);
      expect(grouped.get('info')?.length).toBe(1);
    });
  });

  describe('calculateStatistics', () => {
    it('calculates violation statistics', () => {
      const violations = [
        createViolation({ severity: 'error', file: '/test/file1.py', rule: 'rule1', autoFixable: true }),
        createViolation({ severity: 'error', file: '/test/file2.py', rule: 'rule2', autoFixable: false }),
        createViolation({ severity: 'warning', file: '/test/file1.py', rule: 'rule1', autoFixable: true }),
      ];

      const stats = calculateStatistics(violations);

      expect(stats.total).toBe(3);
      expect(stats.errors).toBe(2);
      expect(stats.warnings).toBe(1);
      expect(stats.info).toBe(0);
      expect(stats.autoFixable).toBe(2);
      expect(stats.uniqueFiles).toBe(2);
      expect(stats.uniqueRules).toBe(2);
    });
  });
});
