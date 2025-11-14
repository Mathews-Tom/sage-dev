#!/usr/bin/env node
/**
 * Token Reduction Measurement Script
 *
 * Validates the MCP server infrastructure token reduction claim.
 * Compares baseline (monolithic) vs MCP (on-demand) token usage.
 *
 * Target: 92% reduction (150K → 12K tokens)
 * Minimum: 60% reduction (150K → 60K tokens)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Token estimation (approximate)
 * Uses character count / 4 as rough approximation
 */
function estimateTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for code
  return Math.ceil(text.length / 4);
}

/**
 * Measure baseline token usage (monolithic approach)
 */
function measureBaseline(): {
  totalTokens: number;
  breakdown: Record<string, number>;
} {
  const agentsDir = join(__dirname, '../agents');
  const rulesDir = join(__dirname, '../rules');
  const utilsDir = join(__dirname, '../utils');

  const breakdown: Record<string, number> = {};

  // Load ALL agent files (monolithic approach)
  const agentFiles = [
    'type-enforcer.ts',
    'doc-validator.ts',
    'test-coverage.ts',
    'security-scanner.ts',
  ];

  let agentTokens = 0;
  for (const file of agentFiles) {
    const path = join(agentsDir, file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      const tokens = estimateTokens(content);
      breakdown[`agent:${file}`] = tokens;
      agentTokens += tokens;
    }
  }

  // Load ALL rule files
  const ruleFiles = [
    'typing-standards.ts',
    'test-standards.ts',
    'security-standards.ts',
  ];

  let ruleTokens = 0;
  for (const file of ruleFiles) {
    const path = join(rulesDir, file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      const tokens = estimateTokens(content);
      breakdown[`rule:${file}`] = tokens;
      ruleTokens += tokens;
    }
  }

  // Load utils
  const utilFiles = ['sandbox.ts', 'validation.ts'];
  let utilTokens = 0;
  for (const file of utilFiles) {
    const path = join(utilsDir, file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      const tokens = estimateTokens(content);
      breakdown[`util:${file}`] = tokens;
      utilTokens += tokens;
    }
  }

  // Load schemas
  const schemaPath = join(__dirname, '../schemas/index.ts');
  const schemaTokens = estimateTokens(readFileSync(schemaPath, 'utf-8'));
  breakdown['schemas'] = schemaTokens;

  const totalTokens = agentTokens + ruleTokens + utilTokens + schemaTokens;

  return {
    totalTokens,
    breakdown,
  };
}

/**
 * Measure MCP approach token usage (on-demand loading)
 */
function measureMCP(): {
  totalTokens: number;
  breakdown: Record<string, number>;
} {
  const agentsDir = join(__dirname, '../agents');
  const rulesDir = join(__dirname, '../rules');
  const utilsDir = join(__dirname, '../utils');

  const breakdown: Record<string, number> = {};

  // Load ONLY type-enforcer (on-demand)
  const typeEnforcerPath = join(agentsDir, 'type-enforcer.ts');
  const typeEnforcerTokens = estimateTokens(readFileSync(typeEnforcerPath, 'utf-8'));
  breakdown['agent:type-enforcer.ts'] = typeEnforcerTokens;

  // Load ONLY typing-standards (required by type-enforcer)
  const typingStandardsPath = join(rulesDir, 'typing-standards.ts');
  const typingStandardsTokens = estimateTokens(readFileSync(typingStandardsPath, 'utf-8'));
  breakdown['rule:typing-standards.ts'] = typingStandardsTokens;

  // Load required utils
  const sandboxPath = join(utilsDir, 'sandbox.ts');
  const sandboxTokens = estimateTokens(readFileSync(sandboxPath, 'utf-8'));
  breakdown['util:sandbox.ts'] = sandboxTokens;

  const validationPath = join(utilsDir, 'validation.ts');
  const validationTokens = estimateTokens(readFileSync(validationPath, 'utf-8'));
  breakdown['util:validation.ts'] = validationTokens;

  // Load type-enforcer-specific schemas only (on-demand)
  const schemaPath = join(__dirname, '../schemas/type-enforcer.ts');
  const schemaTokens = estimateTokens(readFileSync(schemaPath, 'utf-8'));
  breakdown['schemas:type-enforcer'] = schemaTokens;

  const totalTokens = typeEnforcerTokens + typingStandardsTokens + sandboxTokens + validationTokens + schemaTokens;

  return {
    totalTokens,
    breakdown,
  };
}

/**
 * Calculate reduction metrics
 */
function calculateReduction(baseline: number, mcp: number): {
  absoluteReduction: number;
  percentReduction: number;
  meetsMinimum: boolean;
  meetsTarget: boolean;
} {
  const absoluteReduction = baseline - mcp;
  const percentReduction = (absoluteReduction / baseline) * 100;

  return {
    absoluteReduction,
    percentReduction,
    meetsMinimum: percentReduction >= 60,
    meetsTarget: percentReduction >= 92,
  };
}

/**
 * Main measurement execution
 */
function main() {
  console.log('🔍 MCP Server Infrastructure - Token Reduction Validation');
  console.log('═'.repeat(70));
  console.log('');

  // Measure baseline
  console.log('📊 Measuring Baseline (Monolithic Approach)...');
  const baseline = measureBaseline();
  console.log(`   Total tokens: ${baseline.totalTokens.toLocaleString()}`);
  console.log('');

  // Measure MCP
  console.log('📊 Measuring MCP (On-Demand Loading)...');
  const mcp = measureMCP();
  console.log(`   Total tokens: ${mcp.totalTokens.toLocaleString()}`);
  console.log('');

  // Calculate reduction
  const reduction = calculateReduction(baseline.totalTokens, mcp.totalTokens);

  console.log('📈 Token Reduction Analysis');
  console.log('═'.repeat(70));
  console.log(`Baseline:              ${baseline.totalTokens.toLocaleString()} tokens`);
  console.log(`MCP:                   ${mcp.totalTokens.toLocaleString()} tokens`);
  console.log(`Absolute Reduction:    ${reduction.absoluteReduction.toLocaleString()} tokens`);
  console.log(`Percent Reduction:     ${reduction.percentReduction.toFixed(2)}%`);
  console.log('');
  console.log(`Minimum Target (60%):  ${reduction.meetsMinimum ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Stretch Target (92%):  ${reduction.meetsTarget ? '✅ PASS' : '⚠️  Not met'}`);
  console.log('');

  // Detailed breakdown
  console.log('📋 Detailed Breakdown');
  console.log('═'.repeat(70));
  console.log('');
  console.log('Baseline (loads ALL agents and rules):');
  for (const [component, tokens] of Object.entries(baseline.breakdown)) {
    console.log(`  ${component.padEnd(40)} ${tokens.toLocaleString().padStart(8)} tokens`);
  }
  console.log('');
  console.log('MCP (loads ONLY type-enforcer with agent-specific schemas):');
  for (const [component, tokens] of Object.entries(mcp.breakdown)) {
    console.log(`  ${component.padEnd(40)} ${tokens.toLocaleString().padStart(8)} tokens`);
  }
  console.log('');

  // Generate log entry
  const logEntry = {
    timestamp: new Date().toISOString(),
    baseline: {
      totalTokens: baseline.totalTokens,
      breakdown: baseline.breakdown,
    },
    mcp: {
      totalTokens: mcp.totalTokens,
      breakdown: mcp.breakdown,
    },
    reduction: {
      absolute: reduction.absoluteReduction,
      percent: reduction.percentReduction,
      meetsMinimum: reduction.meetsMinimum,
      meetsTarget: reduction.meetsTarget,
    },
  };

  // Write to metrics log
  const logPath = join(__dirname, '../../../.sage/enforcement-metrics.log');
  const logLine = JSON.stringify(logEntry, null, 2) + '\n';

  try {
    writeFileSync(logPath, logLine, { flag: 'a' });
    console.log(`✓ Metrics logged to ${logPath}`);
  } catch (error) {
    console.error(`❌ Failed to write metrics log: ${error}`);
  }

  console.log('');
  console.log('═'.repeat(70));

  // Go/No-Go decision
  if (reduction.meetsMinimum) {
    console.log('✅ GO: Token reduction exceeds minimum threshold (60%)');
    console.log('   Phase 1.1 PoC validated successfully');
    process.exit(0);
  } else {
    console.log('❌ NO-GO: Token reduction below minimum threshold (60%)');
    console.log('   Requires root cause analysis and mitigation strategy');
    process.exit(1);
  }
}

// Run measurement
main();
