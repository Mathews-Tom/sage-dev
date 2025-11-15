import { describe, it, expect } from 'vitest';
import {
  detectFileType,
  detectFeature,
  detectDomain,
  detectContext,
  filterPatternsByContext,
  calculateReductionPercentage,
} from '../utils/context-detector.js';

describe('detectFileType', () => {
  it('detects Python files', () => {
    expect(detectFileType('/path/to/file.py')).toBe('python');
    expect(detectFileType('/path/to/file.pyw')).toBe('python');
  });

  it('detects TypeScript files', () => {
    expect(detectFileType('/path/to/file.ts')).toBe('typescript');
    expect(detectFileType('/path/to/file.tsx')).toBe('typescript');
    expect(detectFileType('/path/to/file.mts')).toBe('typescript');
    expect(detectFileType('/path/to/file.cts')).toBe('typescript');
  });

  it('detects JavaScript files', () => {
    expect(detectFileType('/path/to/file.js')).toBe('javascript');
    expect(detectFileType('/path/to/file.jsx')).toBe('javascript');
    expect(detectFileType('/path/to/file.mjs')).toBe('javascript');
    expect(detectFileType('/path/to/file.cjs')).toBe('javascript');
  });

  it('returns unknown for unsupported extensions', () => {
    expect(detectFileType('/path/to/file.go')).toBe('unknown');
    expect(detectFileType('/path/to/file.rs')).toBe('unknown');
    expect(detectFileType('/path/to/file.md')).toBe('unknown');
  });

  it('handles case insensitivity', () => {
    expect(detectFileType('/path/to/file.PY')).toBe('python');
    expect(detectFileType('/path/to/file.Ts')).toBe('typescript');
  });
});

describe('detectFeature', () => {
  it('detects auth feature', () => {
    expect(detectFeature('/src/auth/login.ts')).toBe('auth');
    expect(detectFeature('/src/authentication/service.ts')).toBe('auth');
    expect(detectFeature('/app/login/handler.ts')).toBe('auth');
    expect(detectFeature('/app/signup/form.tsx')).toBe('auth');
  });

  it('detects api feature', () => {
    expect(detectFeature('/src/api/routes.ts')).toBe('api');
    expect(detectFeature('/app/rest/handlers.ts')).toBe('api');
    expect(detectFeature('/src/graphql/schema.ts')).toBe('api');
    expect(detectFeature('/app/endpoints/users.ts')).toBe('api');
  });

  it('detects ui feature', () => {
    expect(detectFeature('/src/ui/button.tsx')).toBe('ui');
    expect(detectFeature('/app/components/modal.tsx')).toBe('ui');
    expect(detectFeature('/src/views/home.tsx')).toBe('ui');
    expect(detectFeature('/app/pages/dashboard.tsx')).toBe('ui');
    expect(detectFeature('/src/frontend/app.tsx')).toBe('ui');
  });

  it('detects data feature', () => {
    expect(detectFeature('/src/data/repository.ts')).toBe('data');
    expect(detectFeature('/app/models/user.ts')).toBe('data');
    expect(detectFeature('/src/schemas/validation.ts')).toBe('data');
    expect(detectFeature('/app/database/connection.ts')).toBe('data');
    expect(detectFeature('/src/db/migrations.ts')).toBe('data');
  });

  it('detects testing feature', () => {
    expect(detectFeature('/src/test/unit.ts')).toBe('testing');
    expect(detectFeature('/app/tests/integration.ts')).toBe('testing');
    expect(detectFeature('/src/__tests__/component.ts')).toBe('testing');
    expect(detectFeature('/app/spec/service.ts')).toBe('testing');
    expect(detectFeature('/app/specs/api.ts')).toBe('testing');
    expect(detectFeature('/src/utils.test.ts')).toBe('testing');
    expect(detectFeature('/app/service.spec.js')).toBe('testing');
  });

  it('detects infrastructure feature', () => {
    expect(detectFeature('/infra/terraform/main.tf')).toBe('infrastructure');
    expect(detectFeature('/infrastructure/docker/compose.yml')).toBe('infrastructure');
    expect(detectFeature('/deploy/scripts/start.sh')).toBe('infrastructure');
    expect(detectFeature('/ci/workflows/build.yml')).toBe('infrastructure');
    expect(detectFeature('/cd/pipelines/deploy.yml')).toBe('infrastructure');
  });

  it('returns unknown for unrecognized paths', () => {
    expect(detectFeature('/src/utils/helpers.ts')).toBe('unknown');
    expect(detectFeature('/lib/common.ts')).toBe('unknown');
  });

  it('handles Windows paths', () => {
    expect(detectFeature('C:\\src\\auth\\login.ts')).toBe('auth');
    expect(detectFeature('D:\\app\\api\\routes.ts')).toBe('api');
  });
});

describe('detectDomain', () => {
  it('detects frontend domain', () => {
    expect(detectDomain('/frontend/app.tsx')).toBe('frontend');
    expect(detectDomain('/client/components.tsx')).toBe('frontend');
    expect(detectDomain('/ui/styles.css')).toBe('frontend');
    expect(detectDomain('/web/index.html')).toBe('frontend');
    expect(detectDomain('/app/main.tsx')).toBe('frontend');
  });

  it('detects backend domain', () => {
    expect(detectDomain('/backend/server.ts')).toBe('backend');
    expect(detectDomain('/server/routes.ts')).toBe('backend');
    expect(detectDomain('/api/handlers.ts')).toBe('backend');
    expect(detectDomain('/services/auth.ts')).toBe('backend');
    expect(detectDomain('/src/index.ts')).toBe('backend');
  });

  it('detects infra domain', () => {
    expect(detectDomain('/infra/main.tf')).toBe('infra');
    expect(detectDomain('/infrastructure/setup.sh')).toBe('infra');
    expect(detectDomain('/deploy/compose.yml')).toBe('infra');
    expect(detectDomain('/k8s/deployment.yaml')).toBe('infra');
    expect(detectDomain('/terraform/modules.tf')).toBe('infra');
  });

  it('detects shared domain', () => {
    expect(detectDomain('/shared/types.ts')).toBe('shared');
    expect(detectDomain('/common/utils.ts')).toBe('shared');
    expect(detectDomain('/lib/helpers.ts')).toBe('shared');
    expect(detectDomain('/utils/format.ts')).toBe('shared');
  });

  it('returns unknown for unrecognized paths', () => {
    expect(detectDomain('/random/path.ts')).toBe('unknown');
    expect(detectDomain('/other/file.js')).toBe('unknown');
  });
});

describe('detectContext', () => {
  it('combines all detections into context', () => {
    const context = detectContext('/src/auth/service.ts');
    expect(context.fileType).toBe('typescript');
    expect(context.feature).toBe('auth');
    expect(context.domain).toBe('backend');
    expect(context.filePath).toBe('/src/auth/service.ts');
    expect(context.patterns).toContain('security');
    expect(context.patterns).toContain('validation');
    expect(context.patterns).toContain('naming');
    expect(context.patterns).toContain('typing');
  });

  it('includes file type patterns', () => {
    const pythonContext = detectContext('/src/utils.py');
    expect(pythonContext.patterns).toContain('naming');
    expect(pythonContext.patterns).toContain('typing');
    expect(pythonContext.patterns).toContain('errorHandling');

    const tsContext = detectContext('/src/utils.ts');
    expect(tsContext.patterns).toContain('naming');
    expect(tsContext.patterns).toContain('typing');
    expect(tsContext.patterns).toContain('architecture');
  });

  it('includes feature patterns', () => {
    const apiContext = detectContext('/api/routes.ts');
    expect(apiContext.patterns).toContain('validation');
    expect(apiContext.patterns).toContain('persistence');

    const uiContext = detectContext('/ui/button.tsx');
    expect(uiContext.patterns).toContain('validation');
    expect(uiContext.patterns).toContain('ui');
  });

  it('deduplicates patterns', () => {
    const context = detectContext('/src/auth/validator.ts');
    const validationCount = context.patterns.filter((p) => p === 'validation').length;
    expect(validationCount).toBe(1);
  });
});

describe('filterPatternsByContext', () => {
  const allPatterns = {
    security: { level: 'high' },
    validation: { strict: true },
    persistence: { orm: 'prisma' },
    ui: { framework: 'react' },
    testing: { framework: 'vitest' },
    naming: { convention: 'camelCase' },
    typing: { strict: true },
    architecture: { pattern: 'mvc' },
    errorHandling: { strategy: 'throw' },
    infrastructure: { cloud: 'aws' },
  };

  it('filters patterns based on context', () => {
    const context = detectContext('/src/auth/service.ts');
    const filtered = filterPatternsByContext(allPatterns, context);

    expect(filtered).toHaveProperty('security');
    expect(filtered).toHaveProperty('validation');
    expect(filtered).toHaveProperty('naming');
    expect(filtered).toHaveProperty('typing');
    expect(filtered).not.toHaveProperty('ui');
    expect(filtered).not.toHaveProperty('persistence');
  });

  it('returns empty object for unknown context', () => {
    const context = detectContext('/random/file.txt');
    const filtered = filterPatternsByContext(allPatterns, context);
    expect(Object.keys(filtered).length).toBe(0);
  });

  it('handles missing patterns gracefully', () => {
    const context = detectContext('/src/auth/service.ts');
    const partialPatterns = { security: { level: 'high' } };
    const filtered = filterPatternsByContext(partialPatterns, context);
    expect(filtered).toHaveProperty('security');
    expect(Object.keys(filtered).length).toBe(1);
  });
});

describe('calculateReductionPercentage', () => {
  it('calculates correct reduction', () => {
    expect(calculateReductionPercentage(100, 10)).toBe(90);
    expect(calculateReductionPercentage(1000, 250)).toBe(75);
    expect(calculateReductionPercentage(50, 25)).toBe(50);
  });

  it('handles edge cases', () => {
    expect(calculateReductionPercentage(0, 0)).toBe(0);
    expect(calculateReductionPercentage(100, 100)).toBe(0);
    expect(calculateReductionPercentage(100, 0)).toBe(100);
  });

  it('handles fractional results', () => {
    const result = calculateReductionPercentage(3, 1);
    expect(result).toBeCloseTo(66.67, 1);
  });
});
