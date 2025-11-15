import { spawn } from 'child_process';
import { glob } from 'glob';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PythonPatterns, PythonPatternsSchema } from './schemas/python-patterns.js';
import {
  calculateConfidence,
  calculateOverallConfidence,
  detectNamingConvention,
} from './utils/confidence-scorer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface RawPythonAnalysis {
  functions: string[];
  classes: string[];
  constants: string[];
  variables: string[];
  typeHints: {
    hasHint: boolean;
    usesPipe: boolean;
    usesUnion: boolean;
    usesBuiltinGenerics: boolean;
    usesTypingGenerics: boolean;
  }[];
  imports: string[];
  exceptions: {
    caught: string[];
    raised: string[];
    custom: string[];
  };
  testFramework: string;
  hasFixtures: boolean;
  hasMocks: boolean;
  loggingImport: string;
}

interface FileAnalysisResult {
  file: string;
  analysis: RawPythonAnalysis;
  error?: string;
}

const PYTHON_ANALYZER_SCRIPT = `
import ast
import sys
import json
import os

def analyze_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        source = f.read()

    try:
        tree = ast.parse(source)
    except SyntaxError:
        return None

    result = {
        'functions': [],
        'classes': [],
        'constants': [],
        'variables': [],
        'typeHints': [],
        'imports': [],
        'exceptions': {'caught': [], 'raised': [], 'custom': []},
        'testFramework': 'unknown',
        'hasFixtures': False,
        'hasMocks': False,
        'loggingImport': 'none'
    }

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
            result['functions'].append(node.name)

            hint_info = {
                'hasHint': node.returns is not None or any(arg.annotation for arg in node.args.args),
                'usesPipe': False,
                'usesUnion': False,
                'usesBuiltinGenerics': False,
                'usesTypingGenerics': False
            }

            if node.returns:
                hint_info.update(analyze_type_hint(node.returns))
            for arg in node.args.args:
                if arg.annotation:
                    hint_info.update(analyze_type_hint(arg.annotation))

            result['typeHints'].append(hint_info)

            if 'pytest' in ' '.join(result['imports']):
                if node.name.startswith('fixture') or any(
                    isinstance(d, ast.Name) and d.id == 'fixture' for d in node.decorator_list
                ):
                    result['hasFixtures'] = True

        elif isinstance(node, ast.ClassDef):
            result['classes'].append(node.name)

            for base in node.bases:
                if isinstance(base, ast.Name) and base.id == 'Exception':
                    result['exceptions']['custom'].append(node.name)

        elif isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    name = target.name if hasattr(target, 'name') else target.id
                    if name.isupper():
                        result['constants'].append(name)
                    else:
                        result['variables'].append(name)

        elif isinstance(node, ast.Import):
            for alias in node.names:
                result['imports'].append(alias.name)
                if alias.name == 'pytest':
                    result['testFramework'] = 'pytest'
                elif alias.name == 'unittest':
                    result['testFramework'] = 'unittest'
                elif alias.name == 'logging':
                    result['loggingImport'] = 'logging'
                elif alias.name == 'loguru':
                    result['loggingImport'] = 'loguru'
                elif alias.name == 'structlog':
                    result['loggingImport'] = 'structlog'

        elif isinstance(node, ast.ImportFrom):
            if node.module:
                result['imports'].append(node.module)
                if 'pytest' in node.module:
                    result['testFramework'] = 'pytest'
                    if 'fixture' in [alias.name for alias in node.names]:
                        result['hasFixtures'] = True
                elif 'unittest' in node.module:
                    result['testFramework'] = 'unittest'
                    if 'mock' in node.module or 'Mock' in [alias.name for alias in node.names]:
                        result['hasMocks'] = True

        elif isinstance(node, ast.ExceptHandler):
            if node.type:
                if isinstance(node.type, ast.Name):
                    result['exceptions']['caught'].append(node.type.id)

        elif isinstance(node, ast.Raise):
            if node.exc:
                if isinstance(node.exc, ast.Call) and isinstance(node.exc.func, ast.Name):
                    result['exceptions']['raised'].append(node.exc.func.id)
                elif isinstance(node.exc, ast.Name):
                    result['exceptions']['raised'].append(node.exc.id)

    return result

def analyze_type_hint(node):
    info = {
        'usesPipe': False,
        'usesUnion': False,
        'usesBuiltinGenerics': False,
        'usesTypingGenerics': False
    }

    if isinstance(node, ast.BinOp) and isinstance(node.op, ast.BitOr):
        info['usesPipe'] = True
    elif isinstance(node, ast.Subscript):
        if isinstance(node.value, ast.Name):
            if node.value.id in ('list', 'dict', 'set', 'tuple', 'type'):
                info['usesBuiltinGenerics'] = True
            elif node.value.id in ('List', 'Dict', 'Set', 'Tuple', 'Type', 'Union', 'Optional'):
                info['usesTypingGenerics'] = True
                if node.value.id == 'Union':
                    info['usesUnion'] = True

    return info

if __name__ == '__main__':
    files = sys.argv[1:]
    results = []

    for filepath in files:
        try:
            analysis = analyze_file(filepath)
            if analysis:
                results.append({'file': filepath, 'analysis': analysis})
            else:
                results.append({'file': filepath, 'error': 'parse_error'})
        except Exception as e:
            results.append({'file': filepath, 'error': str(e)})

    print(json.dumps(results))
`;

export async function extractPythonPatterns(
  repoPath: string,
  options: {
    samplePercentage?: number;
    maxFiles?: number;
    timeoutMs?: number;
  } = {}
): Promise<PythonPatterns> {
  const {
    samplePercentage = 50,
    maxFiles = 1000,
    timeoutMs = 120000,
  } = options;

  const pythonFiles = await glob('**/*.py', {
    cwd: repoPath,
    ignore: ['**/node_modules/**', '**/.venv/**', '**/venv/**', '**/__pycache__/**', '**/dist/**'],
    absolute: true,
  });

  const totalFiles = pythonFiles.length;
  const samplesToTake = Math.min(
    Math.ceil((totalFiles * samplePercentage) / 100),
    maxFiles
  );

  const shuffled = [...pythonFiles].sort(() => Math.random() - 0.5);
  const sampledFiles = shuffled.slice(0, samplesToTake);

  const scriptPath = join(__dirname, '.tmp-python-analyzer.py');
  await writeFile(scriptPath, PYTHON_ANALYZER_SCRIPT);

  const results: FileAnalysisResult[] = [];
  const batchSize = 50;

  for (let i = 0; i < sampledFiles.length; i += batchSize) {
    const batch = sampledFiles.slice(i, i + batchSize);
    const batchResults = await runPythonAnalysis(scriptPath, batch, timeoutMs);
    results.push(...batchResults);
  }

  const patterns = aggregatePatterns(results, totalFiles, samplesToTake, samplePercentage);

  return PythonPatternsSchema.parse(patterns);
}

async function runPythonAnalysis(
  scriptPath: string,
  files: string[],
  timeoutMs: number
): Promise<FileAnalysisResult[]> {
  return new Promise((resolve) => {
    const process = spawn('python3', [scriptPath, ...files], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeoutMs,
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    process.on('close', (code: number | null) => {
      if (code !== 0) {
        console.error(`Python analysis failed with code ${code}: ${stderr}`);
        resolve([]);
        return;
      }

      try {
        const results = JSON.parse(stdout) as FileAnalysisResult[];
        resolve(results);
      } catch (error) {
        console.error(`Failed to parse Python analysis output: ${error}`);
        resolve([]);
      }
    });

    process.on('error', (error: Error) => {
      console.error(`Python process error: ${error.message}`);
      resolve([]);
    });
  });
}

function aggregatePatterns(
  results: FileAnalysisResult[],
  totalFiles: number,
  filesAnalyzed: number,
  samplingRate: number
): PythonPatterns {
  const functionNames: string[] = [];
  const classNames: string[] = [];
  const constantNames: string[] = [];
  const variableNames: string[] = [];
  const typeHints: RawPythonAnalysis['typeHints'] = [];
  const exceptions: { caught: string[]; raised: string[]; custom: string[] } = {
    caught: [],
    raised: [],
    custom: [],
  };
  const testFrameworks: string[] = [];
  const loggingImports: string[] = [];
  let hasFixtures = false;
  let hasMocks = false;

  for (const result of results) {
    if (result.error) {
      continue;
    }

    const analysis = result.analysis;
    functionNames.push(...analysis.functions);
    classNames.push(...analysis.classes);
    constantNames.push(...analysis.constants);
    variableNames.push(...analysis.variables);
    typeHints.push(...analysis.typeHints);
    exceptions.caught.push(...analysis.exceptions.caught);
    exceptions.raised.push(...analysis.exceptions.raised);
    exceptions.custom.push(...analysis.exceptions.custom);
    testFrameworks.push(analysis.testFramework);
    loggingImports.push(analysis.loggingImport);
    if (analysis.hasFixtures) hasFixtures = true;
    if (analysis.hasMocks) hasMocks = true;
  }

  const functionConventions = countConventions(functionNames);
  const classConventions = countConventions(classNames);
  const constantConventions = countConventions(constantNames);
  const variableConventions = countConventions(variableNames);

  const funcConf = calculateConfidence(functionConventions);
  const classConf = calculateConfidence(classConventions);
  const constConf = calculateConfidence(constantConventions);
  const varConf = calculateConfidence(variableConventions);

  const hintsWithType = typeHints.filter((h) => h.hasHint).length;
  const typeHintCoverage = typeHints.length > 0 ? (hintsWithType / typeHints.length) * 100 : 0;

  const pipeCount = typeHints.filter((h) => h.usesPipe).length;
  const unionCount = typeHints.filter((h) => h.usesUnion).length;
  let unionSyntax: 'pipe' | 'Union' | 'mixed' = 'mixed';
  if (pipeCount > unionCount * 2) unionSyntax = 'pipe';
  else if (unionCount > pipeCount * 2) unionSyntax = 'Union';

  const builtinCount = typeHints.filter((h) => h.usesBuiltinGenerics).length;
  const typingCount = typeHints.filter((h) => h.usesTypingGenerics).length;
  let genericsSyntax: 'builtin' | 'typing' | 'mixed' = 'mixed';
  if (builtinCount > typingCount * 2) genericsSyntax = 'builtin';
  else if (typingCount > builtinCount * 2) genericsSyntax = 'typing';

  const frameworkCounts = countOccurrences(testFrameworks);
  const framework = getMostCommon(frameworkCounts, 'unknown') as 'pytest' | 'unittest' | 'nose' | 'unknown';

  const loggingCounts = countOccurrences(loggingImports);
  const loggingFramework = getMostCommon(loggingCounts, 'none') as 'logging' | 'loguru' | 'structlog' | 'none';

  const caughtCounts = countOccurrences(exceptions.caught);
  const commonExceptions = Object.entries(caughtCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  const tryExceptUsage = results.length > 0
    ? (results.filter((r) => !r.error && r.analysis.exceptions.caught.length > 0).length / results.length) * 100
    : 0;

  const raisedCounts = countOccurrences(exceptions.raised);
  const returnPatterns = Object.keys(raisedCounts).length > 0 ? 'raise' : 'return';

  const namingConfidence = (funcConf.score + classConf.score + constConf.score + varConf.score) / 4;
  const typesConfidence = typeHintCoverage / 100;
  const testingConfidence = framework !== 'unknown' ? 0.8 : 0.2;
  const errorHandlingConfidence = tryExceptUsage / 100;

  const overallConfidence = calculateOverallConfidence([
    namingConfidence,
    typesConfidence,
    testingConfidence,
    errorHandlingConfidence,
  ]);

  return {
    language: 'python',
    extractedAt: new Date().toISOString(),
    filesAnalyzed,
    totalFiles,
    samplingRate,
    naming: {
      functions: {
        pattern: funcConf.dominantPattern as 'snake_case' | 'camelCase' | 'PascalCase' | 'UPPER_SNAKE_CASE',
        count: functionNames.length,
        percentage: funcConf.consistency * 100,
      },
      classes: {
        pattern: classConf.dominantPattern as 'snake_case' | 'camelCase' | 'PascalCase' | 'UPPER_SNAKE_CASE',
        count: classNames.length,
        percentage: classConf.consistency * 100,
      },
      constants: {
        pattern: constConf.dominantPattern as 'snake_case' | 'camelCase' | 'PascalCase' | 'UPPER_SNAKE_CASE',
        count: constantNames.length,
        percentage: constConf.consistency * 100,
      },
      variables: {
        pattern: varConf.dominantPattern as 'snake_case' | 'camelCase' | 'PascalCase' | 'UPPER_SNAKE_CASE',
        count: variableNames.length,
        percentage: varConf.consistency * 100,
      },
    },
    types: {
      unionSyntax,
      genericsSyntax,
      typeHintCoverage,
      commonTypes: [],
    },
    testing: {
      framework,
      fileNaming: 'test_prefix',
      fixtureUsage: hasFixtures,
      mockPatterns: hasMocks ? ['unittest.mock'] : [],
      coverageIntegration: false,
    },
    errorHandling: {
      tryExceptUsage,
      commonExceptions,
      customExceptions: [...new Set(exceptions.custom)],
      loggingFramework,
      errorPropagation: returnPatterns as 'raise' | 'return' | 'mixed',
    },
    confidence: {
      overall: overallConfidence,
      naming: namingConfidence,
      types: typesConfidence,
      testing: testingConfidence,
      errorHandling: errorHandlingConfidence,
    },
  };
}

function countConventions(names: string[]): Array<{ pattern: string; count: number }> {
  const counts: Record<string, number> = {};

  for (const name of names) {
    const convention = detectNamingConvention(name);
    counts[convention] = (counts[convention] || 0) + 1;
  }

  return Object.entries(counts).map(([pattern, count]) => ({ pattern, count }));
}

function countOccurrences(items: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1;
  }
  return counts;
}

function getMostCommon(counts: Record<string, number>, defaultValue: string): string {
  const entries = Object.entries(counts);
  if (entries.length === 0) return defaultValue;

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
