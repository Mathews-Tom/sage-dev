import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProgressiveLoader, LOADING_LEVELS, loadPatternsProgressively } from '../progressive-loader.js';
import * as patternStorage from '../utils/pattern-storage.js';
import { RepositoryPatterns } from '../schemas/repository-patterns.js';

const mockPatterns: RepositoryPatterns = {
  repoPath: '/test/repo',
  repoName: 'test-repo',
  extractedAt: new Date().toISOString(),
  primaryLanguage: 'typescript',
  languages: {
    typescript: {
      filesAnalyzed: 100,
      naming: {
        functions: { camelCase: 90, PascalCase: 10 },
        classes: { PascalCase: 100 },
        variables: { camelCase: 95, SCREAMING_SNAKE: 5 },
        constants: { SCREAMING_SNAKE: 80, camelCase: 20 },
      },
      typing: {
        useStrict: true,
        preferBuiltinGenerics: true,
        unionStyle: 'pipe',
        nullHandling: 'explicit',
      },
      testing: {
        framework: 'vitest',
        patterns: ['describe', 'it', 'expect'],
        mockingApproach: 'vi.mock',
      },
      architecture: {
        moduleSystem: 'esm',
        exportStyle: 'named',
        importStyle: 'absolute',
      },
      confidence: {
        overall: 0.85,
        naming: 0.9,
        typing: 0.8,
        testing: 0.85,
      },
    },
    python: {
      filesAnalyzed: 50,
      naming: {
        functions: { snake_case: 95, camelCase: 5 },
        classes: { PascalCase: 100 },
        variables: { snake_case: 90, SCREAMING_SNAKE: 10 },
      },
      typing: {
        useTypeHints: true,
        preferBuiltinGenerics: true,
        unionStyle: 'pipe',
      },
      errorHandling: {
        strategy: 'explicit',
        customExceptions: true,
        loggingFramework: 'logging',
      },
      testing: {
        framework: 'pytest',
        fixtureUsage: true,
        mockingLibrary: 'unittest.mock',
      },
      confidence: {
        overall: 0.82,
        naming: 0.88,
        typing: 0.78,
        errorHandling: 0.8,
        testing: 0.82,
      },
    },
  },
  overallConfidence: 0.84,
  metadata: {
    extractionDuration: 5000,
    analyzedFiles: 150,
    skippedFiles: 10,
  },
};

describe('ProgressiveLoader', () => {
  beforeEach(() => {
    vi.spyOn(patternStorage, 'loadPatterns').mockResolvedValue(mockPatterns);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadForContext', () => {
    it('loads patterns for TypeScript context', async () => {
      const loader = new ProgressiveLoader({ patternsDir: '/test/patterns' });
      const result = await loader.loadForContext('/src/auth/service.ts');

      expect(result.context.fileType).toBe('typescript');
      expect(result.context.feature).toBe('auth');
      expect(result.patterns.languages.typescript).toBeDefined();
      expect(result.level).toBe('core');
      expect(result.tokenCount).toBeGreaterThan(0);
      expect(result.reductionPercentage).toBeGreaterThan(0);
      expect(result.loadTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('loads patterns for Python context', async () => {
      const loader = new ProgressiveLoader({ patternsDir: '/test/patterns' });
      const result = await loader.loadForContext('/src/utils.py');

      expect(result.context.fileType).toBe('python');
      expect(result.patterns.languages.python).toBeDefined();
    });

    it('uses specified level', async () => {
      const loader = new ProgressiveLoader({ patternsDir: '/test/patterns' });
      const result = await loader.loadForContext('/src/file.ts', 'critical');

      expect(result.level).toBe('critical');
    });

    it('caches patterns between calls', async () => {
      const loader = new ProgressiveLoader({ patternsDir: '/test/patterns' });

      await loader.loadForContext('/src/file1.ts');
      await loader.loadForContext('/src/file2.ts');

      expect(patternStorage.loadPatterns).toHaveBeenCalledTimes(1);
    });

    it('throws error when no patterns found', async () => {
      vi.spyOn(patternStorage, 'loadPatterns').mockResolvedValue(null);

      const loader = new ProgressiveLoader({ patternsDir: '/test/patterns' });
      await expect(loader.loadForContext('/src/file.ts')).rejects.toThrow('No patterns found');
    });

    it('throws error for unknown loading level', async () => {
      const loader = new ProgressiveLoader({ patternsDir: '/test/patterns' });
      await expect(loader.loadForContext('/src/file.ts', 'invalid' as 'core')).rejects.toThrow('Unknown loading level');
    });
  });

  describe('filtering by level', () => {
    it('critical level loads minimal patterns', async () => {
      const loader = new ProgressiveLoader({ patternsDir: '/test/patterns' });
      const result = await loader.loadForContext('/src/file.ts', 'critical');

      const tsPatterns = result.patterns.languages.typescript;
      expect(tsPatterns).toBeDefined();
      if (tsPatterns) {
        expect(tsPatterns.naming).toBeDefined();
        expect(tsPatterns.typing).toBeDefined();
        expect(tsPatterns.testing).toBeUndefined();
        expect(tsPatterns.architecture).toBeUndefined();
      }
    });

    it('core level loads standard patterns', async () => {
      const loader = new ProgressiveLoader({ patternsDir: '/test/patterns' });
      const result = await loader.loadForContext('/src/file.ts', 'core');

      const tsPatterns = result.patterns.languages.typescript;
      expect(tsPatterns).toBeDefined();
      if (tsPatterns) {
        expect(tsPatterns.naming).toBeDefined();
        expect(tsPatterns.typing).toBeDefined();
        expect(tsPatterns.testing).toBeDefined();
      }
    });

    it('extended level loads all patterns', async () => {
      const loader = new ProgressiveLoader({ patternsDir: '/test/patterns' });
      const result = await loader.loadForContext('/src/file.ts', 'extended');

      const tsPatterns = result.patterns.languages.typescript;
      expect(tsPatterns).toBeDefined();
      if (tsPatterns) {
        expect(tsPatterns.naming).toBeDefined();
        expect(tsPatterns.typing).toBeDefined();
        expect(tsPatterns.testing).toBeDefined();
        expect(tsPatterns.architecture).toBeDefined();
      }
    });

    it('applies context filtering', async () => {
      const loader = new ProgressiveLoader({ patternsDir: '/test/patterns' });
      const result = await loader.loadForContext('/src/auth/service.py', 'extended');

      const pyPatterns = result.patterns.languages.python;
      expect(pyPatterns).toBeDefined();
      if (pyPatterns) {
        expect(pyPatterns.naming).toBeDefined();
        expect(pyPatterns.typing).toBeDefined();
        expect(pyPatterns.errorHandling).toBeDefined();
      }
    });
  });

  describe('clearCache', () => {
    it('clears cached patterns', async () => {
      const loader = new ProgressiveLoader({ patternsDir: '/test/patterns' });

      await loader.loadForContext('/src/file.ts');
      loader.clearCache();
      await loader.loadForContext('/src/file.ts');

      expect(patternStorage.loadPatterns).toHaveBeenCalledTimes(2);
    });
  });

  describe('getLoadingLevel', () => {
    it('returns level configuration', () => {
      const loader = new ProgressiveLoader();
      const level = loader.getLoadingLevel('core');

      expect(level).toBeDefined();
      expect(level?.name).toBe('core');
      expect(level?.patterns).toContain('naming');
      expect(level?.patterns).toContain('typing');
    });

    it('returns undefined for unknown level', () => {
      const loader = new ProgressiveLoader();
      const level = loader.getLoadingLevel('invalid' as 'core');

      expect(level).toBeUndefined();
    });
  });

  describe('suggestLevel', () => {
    it('suggests critical for small budget', () => {
      const loader = new ProgressiveLoader();
      expect(loader.suggestLevel(3000)).toBe('critical');
    });

    it('suggests core for medium budget', () => {
      const loader = new ProgressiveLoader();
      expect(loader.suggestLevel(10000)).toBe('core');
    });

    it('suggests extended for large budget', () => {
      const loader = new ProgressiveLoader();
      expect(loader.suggestLevel(20000)).toBe('extended');
    });
  });
});

describe('LOADING_LEVELS', () => {
  it('has three levels', () => {
    expect(LOADING_LEVELS).toHaveLength(3);
  });

  it('critical is most restrictive', () => {
    const critical = LOADING_LEVELS.find((l) => l.name === 'critical');
    expect(critical?.patterns).toHaveLength(2);
  });

  it('core includes testing', () => {
    const core = LOADING_LEVELS.find((l) => l.name === 'core');
    expect(core?.patterns).toContain('testing');
  });

  it('extended includes all patterns', () => {
    const extended = LOADING_LEVELS.find((l) => l.name === 'extended');
    expect(extended?.patterns.length).toBeGreaterThan(8);
  });
});

describe('loadPatternsProgressively', () => {
  beforeEach(() => {
    vi.spyOn(patternStorage, 'loadPatterns').mockResolvedValue(mockPatterns);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is a convenience function', async () => {
    const result = await loadPatternsProgressively('/src/file.ts');

    expect(result.context).toBeDefined();
    expect(result.patterns).toBeDefined();
    expect(result.level).toBe('core');
  });
});
