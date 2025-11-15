import { loadPatterns } from './utils/pattern-storage.js';
import { detectContext, calculateReductionPercentage } from './utils/context-detector.js';
import { RepositoryPatterns } from './schemas/repository-patterns.js';
import { TaskContext } from './schemas/task-context.js';

export interface LoadingLevel {
  name: 'critical' | 'core' | 'extended';
  description: string;
  patterns: string[];
}

export const LOADING_LEVELS: LoadingLevel[] = [
  {
    name: 'critical',
    description: 'Essential patterns for basic functionality',
    patterns: ['naming', 'typing'],
  },
  {
    name: 'core',
    description: 'Core patterns for standard development',
    patterns: ['naming', 'typing', 'errorHandling', 'testing'],
  },
  {
    name: 'extended',
    description: 'All available patterns',
    patterns: ['naming', 'typing', 'errorHandling', 'testing', 'architecture', 'security', 'validation', 'persistence', 'ui', 'infrastructure'],
  },
];

export interface LoadedPatterns {
  patterns: RepositoryPatterns;
  context: TaskContext;
  level: LoadingLevel['name'];
  tokenCount: number;
  reductionPercentage: number;
  loadTimeMs: number;
}

export interface ProgressiveLoaderOptions {
  patternsDir?: string;
  defaultLevel?: LoadingLevel['name'];
  maxTokens?: number;
}

const DEFAULT_PATTERNS_DIR = '.sage/agent/examples';
const DEFAULT_LEVEL: LoadingLevel['name'] = 'core';

export class ProgressiveLoader {
  private patternsDir: string;
  private defaultLevel: LoadingLevel['name'];
  private cachedPatterns: RepositoryPatterns | null = null;

  constructor(options: ProgressiveLoaderOptions = {}) {
    this.patternsDir = options.patternsDir || DEFAULT_PATTERNS_DIR;
    this.defaultLevel = options.defaultLevel || DEFAULT_LEVEL;
  }

  async loadForContext(filePath: string, level?: LoadingLevel['name']): Promise<LoadedPatterns> {
    const startTime = Date.now();
    const context = detectContext(filePath);
    const loadLevel = level || this.defaultLevel;

    if (!this.cachedPatterns) {
      this.cachedPatterns = await loadPatterns(this.patternsDir);
    }

    if (!this.cachedPatterns) {
      throw new Error(`No patterns found in ${this.patternsDir}. Run extract_patterns first.`);
    }

    const filteredPatterns = this.filterByLevel(this.cachedPatterns, context, loadLevel);
    const tokenCount = this.estimateTokens(filteredPatterns);
    const originalTokens = this.estimateTokens(this.cachedPatterns);
    const reductionPercentage = calculateReductionPercentage(originalTokens, tokenCount);

    return {
      patterns: filteredPatterns,
      context,
      level: loadLevel,
      tokenCount,
      reductionPercentage,
      loadTimeMs: Date.now() - startTime,
    };
  }

  private filterByLevel(patterns: RepositoryPatterns, context: TaskContext, level: LoadingLevel['name']): RepositoryPatterns {
    const levelConfig = LOADING_LEVELS.find((l) => l.name === level);
    if (!levelConfig) {
      throw new Error(`Unknown loading level: ${level}`);
    }

    const contextPatterns = new Set(context.patterns);
    const levelPatterns = new Set(levelConfig.patterns);
    const allowedPatterns = new Set([...contextPatterns].filter((p) => levelPatterns.has(p)));

    const filtered: RepositoryPatterns = {
      ...patterns,
      languages: {},
    };

    if (patterns.languages.python && (context.fileType === 'python' || context.fileType === 'unknown')) {
      filtered.languages.python = this.filterLanguagePatterns(patterns.languages.python, allowedPatterns);
    }

    if (patterns.languages.typescript && (context.fileType === 'typescript' || context.fileType === 'javascript' || context.fileType === 'unknown')) {
      filtered.languages.typescript = this.filterLanguagePatterns(patterns.languages.typescript, allowedPatterns);
    }

    return filtered;
  }

  private filterLanguagePatterns<T extends Record<string, unknown>>(languagePatterns: T, allowedPatterns: Set<string>): T {
    const filtered: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(languagePatterns)) {
      if (key === 'filesAnalyzed' || key === 'confidence') {
        filtered[key] = value;
        continue;
      }

      if (this.patternMatchesAllowed(key, allowedPatterns)) {
        filtered[key] = value;
      }
    }

    return filtered as T;
  }

  private patternMatchesAllowed(patternKey: string, allowedPatterns: Set<string>): boolean {
    const keyLower = patternKey.toLowerCase();

    for (const allowed of allowedPatterns) {
      if (keyLower.includes(allowed.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  private estimateTokens(obj: unknown): number {
    const json = JSON.stringify(obj);
    return Math.ceil(json.length / 4);
  }

  clearCache(): void {
    this.cachedPatterns = null;
  }

  getLoadingLevel(name: LoadingLevel['name']): LoadingLevel | undefined {
    return LOADING_LEVELS.find((l) => l.name === name);
  }

  suggestLevel(tokenBudget: number): LoadingLevel['name'] {
    if (tokenBudget < 5000) {
      return 'critical';
    } else if (tokenBudget < 15000) {
      return 'core';
    } else {
      return 'extended';
    }
  }
}

export async function loadPatternsProgressively(
  filePath: string,
  options: ProgressiveLoaderOptions = {}
): Promise<LoadedPatterns> {
  const loader = new ProgressiveLoader(options);
  return loader.loadForContext(filePath);
}
