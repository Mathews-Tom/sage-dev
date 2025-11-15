export interface PatternCount {
  pattern: string;
  count: number;
}

export interface ConfidenceResult {
  score: number;
  dominantPattern: string;
  consistency: number;
}

export function calculateConfidence(patterns: PatternCount[]): ConfidenceResult {
  if (patterns.length === 0) {
    return { score: 0, dominantPattern: 'unknown', consistency: 0 };
  }

  const total = patterns.reduce((sum, p) => sum + p.count, 0);
  if (total === 0) {
    return { score: 0, dominantPattern: 'unknown', consistency: 0 };
  }

  const sorted = [...patterns].sort((a, b) => b.count - a.count);
  const dominant = sorted[0];
  const dominantPercentage = dominant.count / total;

  const consistency = dominantPercentage;

  let score: number;
  if (consistency >= 0.9) {
    score = 1.0;
  } else if (consistency >= 0.75) {
    score = 0.85 + (consistency - 0.75) * 1.0;
  } else if (consistency >= 0.5) {
    score = 0.6 + (consistency - 0.5) * 1.0;
  } else {
    score = consistency * 1.2;
  }

  return {
    score: Math.min(1, Math.max(0, score)),
    dominantPattern: dominant.pattern,
    consistency,
  };
}

export function calculateOverallConfidence(scores: number[]): number {
  if (scores.length === 0) {
    return 0;
  }

  const validScores = scores.filter((s) => s > 0);
  if (validScores.length === 0) {
    return 0;
  }

  const mean = validScores.reduce((sum, s) => sum + s, 0) / validScores.length;
  const min = Math.min(...validScores);
  const weightedScore = mean * 0.7 + min * 0.3;

  return Math.round(weightedScore * 100) / 100;
}

export function detectNamingConvention(name: string): string {
  if (/^[A-Z][A-Z0-9_]*$/.test(name)) {
    return 'UPPER_SNAKE_CASE';
  }
  if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return 'PascalCase';
  }
  if (/^[a-z][a-z0-9_]*$/.test(name)) {
    return 'snake_case';
  }
  if (/^[a-z][a-zA-Z0-9]*$/.test(name)) {
    return 'camelCase';
  }
  return 'unknown';
}
