/**
 * Python 3.12 typing standards and rules
 * Enforces modern type annotation practices
 */

/**
 * Deprecated typing imports that should be replaced with built-in generics
 */
export const DEPRECATED_TYPING_IMPORTS = [
  'List',
  'Dict',
  'Set',
  'FrozenSet',
  'Tuple',
  'Optional',
  'Union',
] as const;

/**
 * Built-in generic replacements for deprecated typing imports
 */
export const BUILTIN_GENERIC_REPLACEMENTS: Record<string, string> = {
  'List': 'list',
  'Dict': 'dict',
  'Set': 'set',
  'FrozenSet': 'frozenset',
  'Tuple': 'tuple',
  'Optional': '| None',
  'Union': '|',
};

/**
 * Typing imports that should be retained from typing module
 */
export const ALLOWED_TYPING_IMPORTS = [
  'Any',
  'Callable',
  'Awaitable',
  'Coroutine',
  'Literal',
  'LiteralString',
  'TypeVar',
  'ParamSpec',
  'TypeVarTuple',
  'Unpack',
  'Protocol',
  'TypedDict',
  'Final',
  'ClassVar',
  'Never',
  'NoReturn',
  'TypeGuard',
  'TypeIs',
  'TypeAlias',
  'Self',
  'overload',
  'override',
  'dataclass_transform',
  'TYPE_CHECKING',
  'get_origin',
  'get_args',
] as const;

/**
 * Minimum Python version for built-in generics
 */
export const MIN_PYTHON_VERSION_FOR_BUILTINS = '3.9';

/**
 * Minimum Python version for | union syntax
 */
export const MIN_PYTHON_VERSION_FOR_UNION_SYNTAX = '3.10';

/**
 * Type annotation rules
 */
export interface TypingRule {
  id: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  autoFixable: boolean;
}

/**
 * All typing enforcement rules
 */
export const TYPING_RULES: TypingRule[] = [
  {
    id: 'no-legacy-list',
    description: 'Use built-in list[T] instead of typing.List[T]',
    severity: 'error',
    autoFixable: true,
  },
  {
    id: 'no-legacy-dict',
    description: 'Use built-in dict[K, V] instead of typing.Dict[K, V]',
    severity: 'error',
    autoFixable: true,
  },
  {
    id: 'no-legacy-optional',
    description: 'Use | None instead of typing.Optional[T]',
    severity: 'error',
    autoFixable: true,
  },
  {
    id: 'no-legacy-union',
    description: 'Use | syntax instead of typing.Union[T1, T2]',
    severity: 'error',
    autoFixable: true,
  },
  {
    id: 'require-return-type',
    description: 'All functions must have return type annotations',
    severity: 'error',
    autoFixable: false,
  },
  {
    id: 'require-param-type',
    description: 'All function parameters must have type annotations',
    severity: 'error',
    autoFixable: false,
  },
  {
    id: 'no-any-type',
    description: 'Avoid using Any type; use specific types instead',
    severity: 'warning',
    autoFixable: false,
  },
  {
    id: 'use-self-type',
    description: 'Use typing.Self for fluent interface return types',
    severity: 'info',
    autoFixable: true,
  },
];

/**
 * Checks if a typing import is deprecated
 * @param importName - Import name to check
 * @returns True if import is deprecated
 */
export function isDeprecatedImport(importName: string): boolean {
  return DEPRECATED_TYPING_IMPORTS.includes(importName as typeof DEPRECATED_TYPING_IMPORTS[number]);
}

/**
 * Gets the built-in generic replacement for a deprecated import
 * @param deprecatedImport - Deprecated import name
 * @returns Built-in generic replacement
 */
export function getBuiltinReplacement(deprecatedImport: string): string | undefined {
  return BUILTIN_GENERIC_REPLACEMENTS[deprecatedImport];
}

/**
 * Checks if a typing import is allowed
 * @param importName - Import name to check
 * @returns True if import is allowed
 */
export function isAllowedImport(importName: string): boolean {
  return ALLOWED_TYPING_IMPORTS.includes(importName as typeof ALLOWED_TYPING_IMPORTS[number]);
}

/**
 * Gets a typing rule by ID
 * @param ruleId - Rule identifier
 * @returns Typing rule or undefined if not found
 */
export function getTypingRule(ruleId: string): TypingRule | undefined {
  return TYPING_RULES.find(rule => rule.id === ruleId);
}
