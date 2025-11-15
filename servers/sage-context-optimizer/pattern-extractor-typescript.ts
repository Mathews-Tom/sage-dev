import { Project, SourceFile, Node } from 'ts-morph';
import { glob } from 'glob';
import { TypeScriptPatterns, TypeScriptPatternsSchema } from './schemas/typescript-patterns.js';
import {
  calculateConfidence,
  calculateOverallConfidence,
  detectNamingConvention,
} from './utils/confidence-scorer.js';

interface RawTypeScriptAnalysis {
  functions: string[];
  classes: string[];
  interfaces: string[];
  typeAliases: string[];
  constants: string[];
  hasUnionPipe: boolean;
  hasUnionGeneric: boolean;
  usesBuiltinGenerics: boolean;
  usesLegacyGenerics: boolean;
  hasStrictNullChecks: boolean;
  testFramework: string;
  fileNaming: string;
  moduleSystem: string;
  exportPattern: string;
  hasBarrelFile: boolean;
}

export async function extractTypeScriptPatterns(
  repoPath: string,
  options: {
    samplePercentage?: number;
    maxFiles?: number;
  } = {}
): Promise<TypeScriptPatterns> {
  const { samplePercentage = 50, maxFiles = 1000 } = options;

  const tsFiles = await glob('**/*.ts', {
    cwd: repoPath,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.d.ts',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
    absolute: true,
  });

  const testFiles = await glob('**/*.{test,spec}.ts', {
    cwd: repoPath,
    ignore: ['**/node_modules/**', '**/dist/**'],
    absolute: true,
  });

  const totalFiles = tsFiles.length;
  const samplesToTake = Math.min(
    Math.ceil((totalFiles * samplePercentage) / 100),
    maxFiles
  );

  const shuffled = [...tsFiles].sort(() => Math.random() - 0.5);
  const sampledFiles = shuffled.slice(0, samplesToTake);

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: false,
      noEmit: true,
    },
  });

  const analyses: RawTypeScriptAnalysis[] = [];

  for (const filePath of sampledFiles) {
    try {
      const sourceFile = project.addSourceFileAtPath(filePath);
      const analysis = analyzeSourceFile(sourceFile, filePath);
      analyses.push(analysis);
    } catch (error) {
      console.warn(`Failed to analyze ${filePath}: ${error}`);
    }
  }

  const testAnalysis = analyzeTestFiles(testFiles);

  const patterns = aggregatePatterns(
    analyses,
    testAnalysis,
    totalFiles,
    samplesToTake,
    samplePercentage
  );

  return TypeScriptPatternsSchema.parse(patterns);
}

function analyzeSourceFile(sourceFile: SourceFile, filePath: string): RawTypeScriptAnalysis {
  const result: RawTypeScriptAnalysis = {
    functions: [],
    classes: [],
    interfaces: [],
    typeAliases: [],
    constants: [],
    hasUnionPipe: false,
    hasUnionGeneric: false,
    usesBuiltinGenerics: false,
    usesLegacyGenerics: false,
    hasStrictNullChecks: false,
    testFramework: 'unknown',
    fileNaming: 'unknown',
    moduleSystem: 'unknown',
    exportPattern: 'unknown',
    hasBarrelFile: false,
  };

  for (const func of sourceFile.getFunctions()) {
    const name = func.getName();
    if (name) {
      result.functions.push(name);
    }
  }

  for (const cls of sourceFile.getClasses()) {
    const name = cls.getName();
    if (name) {
      result.classes.push(name);
    }
  }

  for (const iface of sourceFile.getInterfaces()) {
    result.interfaces.push(iface.getName());
  }

  for (const typeAlias of sourceFile.getTypeAliases()) {
    result.typeAliases.push(typeAlias.getName());
  }

  for (const varDecl of sourceFile.getVariableDeclarations()) {
    const name = varDecl.getName();
    if (/^[A-Z][A-Z0-9_]*$/.test(name)) {
      result.constants.push(name);
    }
  }

  sourceFile.forEachDescendant((node: Node) => {
    if (Node.isUnionTypeNode(node)) {
      result.hasUnionPipe = true;
    }
    if (Node.isTypeReference(node)) {
      const typeName = node.getTypeName().getText();
      if (typeName === 'Union') {
        result.hasUnionGeneric = true;
      }
      if (['Array', 'Map', 'Set', 'Promise'].includes(typeName)) {
        result.usesBuiltinGenerics = true;
      }
      if (['List', 'Dictionary', 'Observable'].includes(typeName)) {
        result.usesLegacyGenerics = true;
      }
    }
  });

  const imports = sourceFile.getImportDeclarations();
  const hasEsmImport = imports.length > 0;
  const hasRequire = sourceFile.getText().includes('require(');

  if (hasEsmImport && !hasRequire) {
    result.moduleSystem = 'esm';
  } else if (hasRequire && !hasEsmImport) {
    result.moduleSystem = 'commonjs';
  } else {
    result.moduleSystem = 'mixed';
  }

  const defaultExports = sourceFile.getDefaultExportSymbol();
  const namedExports = sourceFile.getExportedDeclarations().size;

  if (defaultExports && namedExports === 0) {
    result.exportPattern = 'default';
  } else if (!defaultExports && namedExports > 0) {
    result.exportPattern = 'named';
  } else {
    result.exportPattern = 'mixed';
  }

  if (filePath.endsWith('index.ts')) {
    const reexports = sourceFile.getExportDeclarations().filter((exp) => exp.hasModuleSpecifier());
    if (reexports.length > 2) {
      result.hasBarrelFile = true;
    }
  }

  return result;
}

function analyzeTestFiles(testFiles: string[]): { framework: string; fileNaming: string } {
  let jestCount = 0;
  let vitestCount = 0;
  let mochaCount = 0;
  let testSuffixCount = 0;
  let specSuffixCount = 0;

  for (const file of testFiles) {
    if (file.endsWith('.test.ts')) {
      testSuffixCount++;
    } else if (file.endsWith('.spec.ts')) {
      specSuffixCount++;
    }
  }

  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const sampleTestFiles = testFiles.slice(0, Math.min(10, testFiles.length));

  for (const filePath of sampleTestFiles) {
    try {
      const sourceFile = project.addSourceFileAtPath(filePath);
      const text = sourceFile.getText();

      if (text.includes('vitest') || text.includes("from 'vitest'")) {
        vitestCount++;
      } else if (text.includes("from '@jest'") || text.includes("from 'jest'")) {
        jestCount++;
      } else if (text.includes('mocha') || text.includes("from 'chai'")) {
        mochaCount++;
      } else if (text.includes('describe') && text.includes('it(')) {
        jestCount++;
      }
    } catch {
      // Skip files that can't be parsed
    }
  }

  let framework = 'unknown';
  if (vitestCount > jestCount && vitestCount > mochaCount) {
    framework = 'vitest';
  } else if (jestCount > mochaCount) {
    framework = 'jest';
  } else if (mochaCount > 0) {
    framework = 'mocha';
  }

  let fileNaming: 'test_suffix' | 'spec_suffix' | 'mixed' = 'mixed';
  if (testSuffixCount > specSuffixCount * 2) {
    fileNaming = 'test_suffix';
  } else if (specSuffixCount > testSuffixCount * 2) {
    fileNaming = 'spec_suffix';
  }

  return { framework, fileNaming };
}

function aggregatePatterns(
  analyses: RawTypeScriptAnalysis[],
  testAnalysis: { framework: string; fileNaming: string },
  totalFiles: number,
  filesAnalyzed: number,
  samplingRate: number
): TypeScriptPatterns {
  const functionNames: string[] = [];
  const classNames: string[] = [];
  const interfaceNames: string[] = [];
  const typeAliasNames: string[] = [];
  const constantNames: string[] = [];
  let unionPipeCount = 0;
  let unionGenericCount = 0;
  let builtinGenericCount = 0;
  let legacyGenericCount = 0;
  let esmCount = 0;
  let cjsCount = 0;
  let namedExportCount = 0;
  let defaultExportCount = 0;
  let barrelFileCount = 0;

  for (const analysis of analyses) {
    functionNames.push(...analysis.functions);
    classNames.push(...analysis.classes);
    interfaceNames.push(...analysis.interfaces);
    typeAliasNames.push(...analysis.typeAliases);
    constantNames.push(...analysis.constants);

    if (analysis.hasUnionPipe) unionPipeCount++;
    if (analysis.hasUnionGeneric) unionGenericCount++;
    if (analysis.usesBuiltinGenerics) builtinGenericCount++;
    if (analysis.usesLegacyGenerics) legacyGenericCount++;

    if (analysis.moduleSystem === 'esm') esmCount++;
    else if (analysis.moduleSystem === 'commonjs') cjsCount++;

    if (analysis.exportPattern === 'named') namedExportCount++;
    else if (analysis.exportPattern === 'default') defaultExportCount++;

    if (analysis.hasBarrelFile) barrelFileCount++;
  }

  const funcConventions = countConventions(functionNames);
  const classConventions = countConventions(classNames);
  const ifaceConventions = countConventions(interfaceNames);
  const typeConventions = countConventions(typeAliasNames);
  const constConventions = countConventions(constantNames);

  const funcConf = calculateConfidence(funcConventions);
  const classConf = calculateConfidence(classConventions);
  const ifaceConf = calculateConfidence(ifaceConventions);
  const typeConf = calculateConfidence(typeConventions);
  const constConf = calculateConfidence(constConventions);

  let unionSyntax: 'pipe' | 'Union' | 'mixed' = 'mixed';
  if (unionPipeCount > unionGenericCount * 2) unionSyntax = 'pipe';
  else if (unionGenericCount > unionPipeCount * 2) unionSyntax = 'Union';

  let genericsSyntax: 'builtin' | 'legacy' | 'mixed' = 'mixed';
  if (builtinGenericCount > legacyGenericCount * 2) genericsSyntax = 'builtin';
  else if (legacyGenericCount > builtinGenericCount * 2) genericsSyntax = 'legacy';

  const typeAliasUsage = analyses.length > 0
    ? (typeAliasNames.length / (interfaceNames.length + typeAliasNames.length || 1)) * 100
    : 0;

  let interfaceVsType: 'interface' | 'type' | 'mixed' = 'mixed';
  if (interfaceNames.length > typeAliasNames.length * 2) interfaceVsType = 'interface';
  else if (typeAliasNames.length > interfaceNames.length * 2) interfaceVsType = 'type';

  let moduleSystem: 'esm' | 'commonjs' | 'mixed' = 'mixed';
  if (esmCount > cjsCount * 2) moduleSystem = 'esm';
  else if (cjsCount > esmCount * 2) moduleSystem = 'commonjs';

  let exportPattern: 'named' | 'default' | 'mixed' = 'mixed';
  if (namedExportCount > defaultExportCount * 2) exportPattern = 'named';
  else if (defaultExportCount > namedExportCount * 2) exportPattern = 'default';

  const namingConfidence =
    (funcConf.score + classConf.score + ifaceConf.score + typeConf.score + constConf.score) / 5;
  const typesConfidence = unionSyntax !== 'mixed' && genericsSyntax !== 'mixed' ? 0.8 : 0.5;
  const testingConfidence = testAnalysis.framework !== 'unknown' ? 0.8 : 0.2;
  const architectureConfidence =
    moduleSystem !== 'mixed' && exportPattern !== 'mixed' ? 0.8 : 0.5;

  const overallConfidence = calculateOverallConfidence([
    namingConfidence,
    typesConfidence,
    testingConfidence,
    architectureConfidence,
  ]);

  return {
    language: 'typescript',
    extractedAt: new Date().toISOString(),
    filesAnalyzed,
    totalFiles,
    samplingRate,
    naming: {
      functions: {
        pattern: (funcConf.dominantPattern || 'camelCase') as 'snake_case' | 'camelCase' | 'PascalCase' | 'UPPER_SNAKE_CASE',
        count: functionNames.length,
        percentage: funcConf.consistency * 100,
      },
      classes: {
        pattern: (classConf.dominantPattern || 'PascalCase') as 'snake_case' | 'camelCase' | 'PascalCase' | 'UPPER_SNAKE_CASE',
        count: classNames.length,
        percentage: classConf.consistency * 100,
      },
      interfaces: {
        pattern: (ifaceConf.dominantPattern || 'PascalCase') as 'snake_case' | 'camelCase' | 'PascalCase' | 'UPPER_SNAKE_CASE',
        count: interfaceNames.length,
        percentage: ifaceConf.consistency * 100,
      },
      types: {
        pattern: (typeConf.dominantPattern || 'PascalCase') as 'snake_case' | 'camelCase' | 'PascalCase' | 'UPPER_SNAKE_CASE',
        count: typeAliasNames.length,
        percentage: typeConf.consistency * 100,
      },
      constants: {
        pattern: (constConf.dominantPattern || 'UPPER_SNAKE_CASE') as 'snake_case' | 'camelCase' | 'PascalCase' | 'UPPER_SNAKE_CASE',
        count: constantNames.length,
        percentage: constConf.consistency * 100,
      },
    },
    types: {
      unionSyntax,
      genericsSyntax,
      typeAliasUsage,
      interfaceVsType,
      strictNullChecks: true,
    },
    testing: {
      framework: testAnalysis.framework as 'jest' | 'vitest' | 'mocha' | 'ava' | 'unknown',
      fileNaming: testAnalysis.fileNaming as 'test_suffix' | 'spec_suffix' | 'mixed',
      mockingLibrary: 'none',
      coverageIntegration: false,
    },
    architecture: {
      moduleSystem,
      exportPattern,
      barrelFiles: barrelFileCount > 0,
      layeredArchitecture: false,
    },
    confidence: {
      overall: overallConfidence,
      naming: namingConfidence,
      types: typesConfidence,
      testing: testingConfidence,
      architecture: architectureConfidence,
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
