/**
 * Python 3.12 Typing Standards
 *
 * Defines type annotation standards conforming to:
 * - PEP 585: Type Hinting Generics In Standard Collections (built-in generics)
 * - PEP 604: Allow writing union types as X | Y (union syntax)
 * - PEP 698: Override decorator for static typing
 *
 * Configurable strictness levels: strict, moderate, lenient
 * Supports allow/deny lists for project-specific patterns
 *
 * @see https://peps.python.org/pep-0585/ - PEP 585
 * @see https://peps.python.org/pep-0604/ - PEP 604
 * @see https://peps.python.org/pep-0698/ - PEP 698
 */

/**
 * Typing Standards Configuration
 *
 * Defines which type annotation rules to enforce during validation.
 */
export interface TypingStandards {
  /** Require explicit return type annotations on all functions */
  enforceReturnTypes: boolean;

  /** Allow usage of typing.Any (strict mode disallows) */
  allowAny: boolean;

  /** Target Python version for type checking */
  pythonVersion: string;

  /** List of deprecated typing imports to flag (PEP 585) */
  deprecatedImports: string[];

  /** Require built-in generics (list, dict) instead of typing.List, typing.Dict */
  builtinGenerics: boolean;

  /** Patterns explicitly allowed (bypass rules) */
  allowList?: string[];

  /** Patterns explicitly denied (always flag) */
  denyList?: string[];
}

/**
 * Strictness Levels
 *
 * Predefined configurations for different enforcement levels.
 */
export type StrictnessLevel = 'strict' | 'moderate' | 'lenient';

/**
 * Deprecated Typing Imports (PEP 585)
 *
 * These typing module imports should be replaced with built-in equivalents:
 * - typing.List → list
 * - typing.Dict → dict
 * - typing.Tuple → tuple
 * - typing.Set → set
 * - typing.FrozenSet → frozenset
 * - typing.Optional[X] → X | None (PEP 604)
 * - typing.Union[X, Y] → X | Y (PEP 604)
 */
const DEPRECATED_TYPING_IMPORTS = [
  'typing.List',
  'typing.Dict',
  'typing.Tuple',
  'typing.Set',
  'typing.FrozenSet',
  'typing.Optional',
  'typing.Union',
] as const;

/**
 * Built-In Generic Types (PEP 585)
 *
 * Python 3.9+ supports using these built-in types directly as generics.
 * No need to import from typing module.
 */
const BUILTIN_GENERICS = [
  'list',
  'dict',
  'tuple',
  'set',
  'frozenset',
] as const;

/**
 * Strict Typing Standards
 *
 * Enforces all type annotation rules:
 * - Require return types on all functions
 * - Disallow typing.Any usage
 * - Require built-in generics
 * - Flag all deprecated typing imports
 * - Target Python 3.12
 *
 * Recommended for: production code, libraries, critical systems
 */
export const STRICT_STANDARDS: TypingStandards = {
  enforceReturnTypes: true,
  allowAny: false,
  pythonVersion: '3.12',
  deprecatedImports: [...DEPRECATED_TYPING_IMPORTS],
  builtinGenerics: true,
  allowList: [],
  denyList: ['Any'],
};

/**
 * Moderate Typing Standards
 *
 * Balanced enforcement:
 * - Require return types on public functions
 * - Allow typing.Any for dynamic cases
 * - Require built-in generics
 * - Flag deprecated typing imports
 * - Target Python 3.12
 *
 * Recommended for: most projects, internal tools, prototypes
 */
export const MODERATE_STANDARDS: TypingStandards = {
  enforceReturnTypes: true,
  allowAny: true,
  pythonVersion: '3.12',
  deprecatedImports: [...DEPRECATED_TYPING_IMPORTS],
  builtinGenerics: true,
  allowList: ['Any'],
  denyList: [],
};

/**
 * Lenient Typing Standards
 *
 * Minimal enforcement:
 * - Suggest return types but don't require
 * - Allow typing.Any usage
 * - Allow both built-in and typing module generics
 * - Only flag Union and Optional (PEP 604 replacements)
 * - Target Python 3.10+ (minimum for | union syntax)
 *
 * Recommended for: legacy code, exploratory work, gradual migration
 */
export const LENIENT_STANDARDS: TypingStandards = {
  enforceReturnTypes: false,
  allowAny: true,
  pythonVersion: '3.10',
  deprecatedImports: [
    'typing.Optional',
    'typing.Union',
  ],
  builtinGenerics: false,
  allowList: ['Any', 'List', 'Dict', 'Tuple', 'Set'],
  denyList: [],
};

/**
 * Default Typing Standards
 *
 * Defaults to MODERATE_STANDARDS for balanced enforcement.
 * Override with STRICT_STANDARDS or LENIENT_STANDARDS as needed.
 */
export const DEFAULT_STANDARDS: TypingStandards = MODERATE_STANDARDS;

/**
 * TYPING_STANDARDS Object
 *
 * Main export providing access to all standard configurations.
 *
 * Usage:
 * ```typescript
 * import { TYPING_STANDARDS } from './rules/typing-standards.js';
 *
 * const standards = TYPING_STANDARDS.strict;
 * const result = await typeEnforcer({
 *   filePath: '/path/to/file.py',
 *   code: pythonCode,
 *   standards
 * });
 * ```
 */
export const TYPING_STANDARDS = {
  strict: STRICT_STANDARDS,
  moderate: MODERATE_STANDARDS,
  lenient: LENIENT_STANDARDS,
  default: DEFAULT_STANDARDS,
} as const;

/**
 * Get Typing Standards by Level
 *
 * Helper function to retrieve standards by strictness level.
 *
 * @param level - Strictness level (strict, moderate, lenient)
 * @returns Typing standards configuration
 *
 * @example
 * ```typescript
 * const standards = getTypingStandards('strict');
 * // Returns STRICT_STANDARDS
 * ```
 */
export function getTypingStandards(level: StrictnessLevel): TypingStandards {
  switch (level) {
    case 'strict':
      return STRICT_STANDARDS;
    case 'moderate':
      return MODERATE_STANDARDS;
    case 'lenient':
      return LENIENT_STANDARDS;
    default:
      throw new Error(`Invalid strictness level: ${level}`);
  }
}

/**
 * Create Custom Typing Standards
 *
 * Factory function to create custom standards by extending a base level.
 *
 * @param base - Base strictness level to extend
 * @param overrides - Custom overrides to apply
 * @returns Custom typing standards configuration
 *
 * @example
 * ```typescript
 * const customStandards = createCustomStandards('moderate', {
 *   allowAny: false,
 *   allowList: ['mypy_extensions.TypedDict']
 * });
 * ```
 */
export function createCustomStandards(
  base: StrictnessLevel,
  overrides: Partial<TypingStandards>
): TypingStandards {
  const baseStandards = getTypingStandards(base);
  return {
    ...baseStandards,
    ...overrides,
  };
}

/**
 * Validate Typing Standards
 *
 * Ensures standards configuration is valid and consistent.
 *
 * @param standards - Standards to validate
 * @throws Error if standards are invalid
 *
 * @example
 * ```typescript
 * validateTypingStandards(STRICT_STANDARDS); // OK
 * validateTypingStandards({ pythonVersion: '2.7' }); // Throws
 * ```
 */
export function validateTypingStandards(standards: Partial<TypingStandards>): void {
  // Validate Python version
  if (standards.pythonVersion) {
    const version = parseFloat(standards.pythonVersion);
    if (version < 3.10) {
      throw new Error(
        `Python version ${standards.pythonVersion} does not support PEP 604 (| union syntax). Minimum: 3.10`
      );
    }
    if (version < 3.12) {
      console.warn(
        `Python version ${standards.pythonVersion} has limited PEP 698 support. Recommended: 3.12+`
      );
    }
  }

  // Validate consistency: if denyList contains 'Any', allowAny should be false
  if (standards.denyList?.includes('Any') && standards.allowAny === true) {
    throw new Error(
      'Inconsistent configuration: denyList contains "Any" but allowAny is true'
    );
  }

  // Validate consistency: if allowList contains 'Any', allowAny should be true
  if (standards.allowList?.includes('Any') && standards.allowAny === false) {
    console.warn(
      'Inconsistent configuration: allowList contains "Any" but allowAny is false. Consider setting allowAny to true.'
    );
  }
}

/**
 * Export Constants for Testing and Reference
 */
export { DEPRECATED_TYPING_IMPORTS, BUILTIN_GENERICS };
