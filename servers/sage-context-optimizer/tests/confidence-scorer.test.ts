import { describe, it, expect } from 'vitest';
import {
  calculateConfidence,
  calculateOverallConfidence,
  detectNamingConvention,
} from '../utils/confidence-scorer.js';

describe('calculateConfidence', () => {
  it('returns high confidence for consistent patterns', () => {
    const patterns = [
      { pattern: 'snake_case', count: 95 },
      { pattern: 'camelCase', count: 5 },
    ];
    const result = calculateConfidence(patterns);
    expect(result.score).toBeGreaterThan(0.9);
    expect(result.dominantPattern).toBe('snake_case');
    expect(result.consistency).toBe(0.95);
  });

  it('returns lower confidence for mixed patterns', () => {
    const patterns = [
      { pattern: 'snake_case', count: 60 },
      { pattern: 'camelCase', count: 40 },
    ];
    const result = calculateConfidence(patterns);
    expect(result.score).toBeLessThan(0.9);
    expect(result.dominantPattern).toBe('snake_case');
    expect(result.consistency).toBe(0.6);
  });

  it('handles empty patterns', () => {
    const result = calculateConfidence([]);
    expect(result.score).toBe(0);
    expect(result.dominantPattern).toBe('unknown');
    expect(result.consistency).toBe(0);
  });

  it('handles zero total count', () => {
    const patterns = [{ pattern: 'snake_case', count: 0 }];
    const result = calculateConfidence(patterns);
    expect(result.score).toBe(0);
  });
});

describe('calculateOverallConfidence', () => {
  it('calculates weighted average', () => {
    const scores = [0.9, 0.8, 0.7, 0.6];
    const result = calculateOverallConfidence(scores);
    expect(result).toBeGreaterThan(0.5);
    expect(result).toBeLessThan(1.0);
  });

  it('handles empty scores', () => {
    const result = calculateOverallConfidence([]);
    expect(result).toBe(0);
  });

  it('filters zero scores', () => {
    const scores = [0.9, 0, 0.8];
    const result = calculateOverallConfidence(scores);
    expect(result).toBeGreaterThan(0.7);
  });
});

describe('detectNamingConvention', () => {
  it('detects snake_case', () => {
    expect(detectNamingConvention('my_function_name')).toBe('snake_case');
    expect(detectNamingConvention('get_user')).toBe('snake_case');
  });

  it('detects PascalCase', () => {
    expect(detectNamingConvention('MyClassName')).toBe('PascalCase');
    expect(detectNamingConvention('UserService')).toBe('PascalCase');
  });

  it('detects UPPER_SNAKE_CASE', () => {
    expect(detectNamingConvention('MAX_SIZE')).toBe('UPPER_SNAKE_CASE');
    expect(detectNamingConvention('API_KEY')).toBe('UPPER_SNAKE_CASE');
  });

  it('detects camelCase', () => {
    expect(detectNamingConvention('myVariable')).toBe('camelCase');
    expect(detectNamingConvention('getUserName')).toBe('camelCase');
  });

  it('returns unknown for non-standard names', () => {
    expect(detectNamingConvention('_private_method')).toBe('unknown');
    expect(detectNamingConvention('__dunder__')).toBe('unknown');
  });
});
