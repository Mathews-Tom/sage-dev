#!/usr/bin/env npx ts-node --esm

import { extractPythonPatterns } from './pattern-extractor-python.js';
import { extractTypeScriptPatterns } from './pattern-extractor-typescript.js';
import { savePatterns, formatPatternsForDisplay } from './utils/pattern-storage.js';
import { createEmptyPatterns, mergePatterns } from './schemas/repository-patterns.js';
import { basename } from 'path';

interface CliOptions {
  repoPath: string;
  outputDir: string;
  samplePercentage: number;
  maxFiles: number;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    repoPath: process.cwd(),
    outputDir: '.sage/agent/examples',
    samplePercentage: 50,
    maxFiles: 1000,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--repoPath':
      case '-r':
        options.repoPath = args[++i];
        break;
      case '--outputDir':
      case '-o':
        options.outputDir = args[++i];
        break;
      case '--samplePercentage':
      case '-s':
        options.samplePercentage = parseInt(args[++i], 10);
        break;
      case '--maxFiles':
      case '-m':
        options.maxFiles = parseInt(args[++i], 10);
        break;
      case '--help':
      case '-h':
        console.log(`
sage-context-optimizer CLI

Usage: npx ts-node --esm cli.ts [options]

Options:
  -r, --repoPath <path>         Repository path to analyze (default: cwd)
  -o, --outputDir <dir>         Output directory for patterns (default: .sage/agent/examples)
  -s, --samplePercentage <num>  Percentage of files to sample (default: 50)
  -m, --maxFiles <num>          Max files per language (default: 1000)
  -h, --help                    Show this help message
`);
        process.exit(0);
    }
  }

  return options;
}

async function main(): Promise<void> {
  const options = parseArgs();

  console.log('🔍 Starting AST-based pattern extraction...');
  console.log(`  Repository: ${options.repoPath}`);
  console.log(`  Output: ${options.outputDir}`);
  console.log(`  Sample rate: ${options.samplePercentage}%`);
  console.log(`  Max files: ${options.maxFiles}`);
  console.log('');

  const repoName = basename(options.repoPath);
  let patterns = createEmptyPatterns(options.repoPath, repoName);

  let pythonFiles = 0;
  let tsFiles = 0;

  try {
    console.log('📊 Analyzing Python files...');
    const pythonPatterns = await extractPythonPatterns(options.repoPath, {
      samplePercentage: options.samplePercentage,
      maxFiles: options.maxFiles,
    });

    patterns = mergePatterns(patterns, {
      languages: { python: pythonPatterns },
    });

    pythonFiles = pythonPatterns.filesAnalyzed;
    console.log(`  ✓ Analyzed ${pythonFiles} Python files`);
    console.log(`  ✓ Confidence: ${(pythonPatterns.confidence.overall * 100).toFixed(1)}%`);
  } catch (error) {
    console.error('  ⚠️  Python extraction failed:', (error as Error).message);
  }

  try {
    console.log('📊 Analyzing TypeScript files...');
    const tsPatterns = await extractTypeScriptPatterns(options.repoPath, {
      samplePercentage: options.samplePercentage,
      maxFiles: options.maxFiles,
    });

    patterns = mergePatterns(patterns, {
      languages: { typescript: tsPatterns },
    });

    tsFiles = tsPatterns.filesAnalyzed;
    console.log(`  ✓ Analyzed ${tsFiles} TypeScript files`);
    console.log(`  ✓ Confidence: ${(tsPatterns.confidence.overall * 100).toFixed(1)}%`);
  } catch (error) {
    console.error('  ⚠️  TypeScript extraction failed:', (error as Error).message);
  }

  patterns.metadata.analyzedFiles = pythonFiles + tsFiles;

  if (pythonFiles > tsFiles * 2) {
    patterns.primaryLanguage = 'python';
  } else if (tsFiles > pythonFiles * 2) {
    patterns.primaryLanguage = 'typescript';
  } else if (pythonFiles > 0 && tsFiles > 0) {
    patterns.primaryLanguage = 'mixed';
  } else {
    patterns.primaryLanguage = 'unknown';
  }

  console.log('');
  console.log('💾 Saving patterns...');
  const savedPath = await savePatterns(patterns, options.outputDir);
  console.log(`  ✓ Saved to ${savedPath}`);

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('              PATTERN EXTRACTION COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  const display = formatPatternsForDisplay(patterns);
  console.log(display);

  console.log('');
  console.log('📈 Summary:');
  console.log(`  Primary language: ${patterns.primaryLanguage}`);
  console.log(`  Total files analyzed: ${patterns.metadata.analyzedFiles}`);
  console.log(`  Overall confidence: ${(patterns.overallConfidence * 100).toFixed(1)}%`);
  console.log(`  Patterns saved: ${savedPath}`);
  console.log('');

  if (patterns.overallConfidence < 0.7) {
    console.log('⚠️  Low confidence score. Consider:');
    console.log('  - Increasing sample percentage');
    console.log('  - Ensuring consistent code style across repository');
    console.log('  - Adding more source files');
  } else {
    console.log('✅ Patterns extracted successfully with high confidence!');
  }
}

main().catch((error) => {
  console.error('❌ Pattern extraction failed:', error);
  process.exit(1);
});
