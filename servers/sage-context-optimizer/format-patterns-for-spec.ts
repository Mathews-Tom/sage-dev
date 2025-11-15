#!/usr/bin/env node

import { loadPatterns, formatPatternsForDisplay } from './utils/pattern-storage.js';
import { RepositoryPatterns } from './schemas/repository-patterns.js';

interface SpecPatternSummary {
  naming: {
    functions: string;
    classes: string;
    variables: string;
    constants: string;
  };
  typing: {
    coverage: string;
    unionSyntax: string;
    generics: string;
    nullHandling: string;
  };
  testing: {
    framework: string;
    coverageRequirement: string;
    mockStrategy: string;
    patterns: string;
  };
  errorHandling: {
    strategy: string;
    customExceptions: string;
    validation: string;
  };
  architecture: {
    moduleSystem: string;
    exportStyle: string;
    importStyle: string;
  };
  confidence: number;
  primaryLanguage: string;
}

function extractSpecPatterns(patterns: RepositoryPatterns): SpecPatternSummary {
  const summary: SpecPatternSummary = {
    naming: {
      functions: 'camelCase',
      classes: 'PascalCase',
      variables: 'camelCase',
      constants: 'SCREAMING_SNAKE_CASE',
    },
    typing: {
      coverage: '≥80%',
      unionSyntax: '|',
      generics: 'builtin',
      nullHandling: 'explicit',
    },
    testing: {
      framework: 'unknown',
      coverageRequirement: '≥80%',
      mockStrategy: 'vi.mock()',
      patterns: 'describe/it/expect',
    },
    errorHandling: {
      strategy: 'explicit throws',
      customExceptions: 'required',
      validation: 'input boundaries',
    },
    architecture: {
      moduleSystem: 'esm',
      exportStyle: 'named',
      importStyle: 'absolute',
    },
    confidence: patterns.overallConfidence,
    primaryLanguage: patterns.primaryLanguage,
  };

  if (patterns.languages.typescript) {
    const ts = patterns.languages.typescript;
    summary.naming.functions = `${ts.naming.functions.pattern} (${ts.naming.functions.percentage.toFixed(0)}% consistent)`;
    summary.naming.classes = `${ts.naming.classes.pattern} (${ts.naming.classes.percentage.toFixed(0)}% consistent)`;
    summary.testing.framework = ts.testing.framework;
    summary.architecture.moduleSystem = ts.architecture.moduleSystem;
    summary.architecture.exportStyle = ts.architecture.exportPattern;
  }

  if (patterns.languages.python) {
    const py = patterns.languages.python;
    if (patterns.primaryLanguage === 'python') {
      summary.naming.functions = `${py.naming.functions.pattern} (${py.naming.functions.percentage.toFixed(0)}% consistent)`;
      summary.naming.classes = `${py.naming.classes.pattern} (${py.naming.classes.percentage.toFixed(0)}% consistent)`;
      summary.typing.coverage = `≥${py.types.typeHintCoverage.toFixed(0)}%`;
      summary.typing.unionSyntax = py.types.unionSyntax;
      summary.testing.framework = py.testing.framework;
      summary.testing.mockStrategy = 'unittest.mock or pytest-mock';
      summary.testing.patterns = 'test_* functions or TestCase classes';
    }
  }

  return summary;
}

function formatAsMarkdown(summary: SpecPatternSummary): string {
  return `## 5. Code Pattern Requirements

### Naming Conventions
- **Functions**: ${summary.naming.functions}
- **Classes**: ${summary.naming.classes}
- **Variables**: ${summary.naming.variables}
- **Constants**: ${summary.naming.constants}

### Type Safety Requirements
- **Type hint coverage**: ${summary.typing.coverage} (matches repository baseline)
- **Union syntax**: Use \`${summary.typing.unionSyntax}\` operator
- **Generics**: Use ${summary.typing.generics} generics
- **Null handling**: ${summary.typing.nullHandling} (\`T | None\`)

### Testing Approach
- **Framework**: ${summary.testing.framework} (detected from repository)
- **Coverage requirement**: ${summary.testing.coverageRequirement} (baseline from existing tests)
- **Mocking strategy**: ${summary.testing.mockStrategy}
- **Test patterns**: ${summary.testing.patterns}

### Error Handling
- **Strategy**: ${summary.errorHandling.strategy} (no silent failures)
- **Custom exceptions**: ${summary.errorHandling.customExceptions} for domain errors
- **Validation**: ${summary.errorHandling.validation}

### Architecture Patterns
- **Module system**: ${summary.architecture.moduleSystem} (export/import)
- **Export style**: ${summary.architecture.exportStyle} exports preferred
- **Import style**: ${summary.architecture.importStyle} paths

**Pattern Confidence**: ${(summary.confidence * 100).toFixed(1)}% | **Primary Language**: ${summary.primaryLanguage}
`;
}

function formatAsJson(summary: SpecPatternSummary): string {
  return JSON.stringify(summary, null, 2);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let patternsDir = '.sage/agent/examples';
  let outputFormat = 'markdown';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dir':
      case '-d':
        patternsDir = args[++i];
        break;
      case '--format':
      case '-f':
        outputFormat = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
Format repository patterns for specification generation

Usage: node dist/format-patterns-for-spec.js [options]

Options:
  -d, --dir <path>      Patterns directory (default: .sage/agent/examples)
  -f, --format <type>   Output format: markdown | json | display (default: markdown)
  -h, --help            Show this help message
`);
        process.exit(0);
    }
  }

  const patterns = await loadPatterns(patternsDir);

  if (!patterns) {
    console.error('Error: No patterns found. Run /sage.init first.');
    process.exit(1);
  }

  const summary = extractSpecPatterns(patterns);

  switch (outputFormat) {
    case 'markdown':
      console.log(formatAsMarkdown(summary));
      break;
    case 'json':
      console.log(formatAsJson(summary));
      break;
    case 'display':
      console.log(formatPatternsForDisplay(patterns));
      break;
    default:
      console.error(`Unknown format: ${outputFormat}`);
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
