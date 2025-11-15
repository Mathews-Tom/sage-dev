import { describe, it, expect } from 'vitest';
import {
  validatePath,
  isFileReadable,
  isPythonFile,
  isTypeScriptOrJavaScript,
  sanitizePath,
} from '../utils/validation.js';

describe('validation utils', () => {
  describe('validatePath', () => {
    it('accepts valid paths within project root', () => {
      const projectRoot = '/Users/test/project';
      const inputPath = 'src/main.py';

      const result = validatePath(inputPath, projectRoot);

      expect(result).toBe('/Users/test/project/src/main.py');
    });

    it('throws on path traversal attempts', () => {
      const projectRoot = '/Users/test/project';
      const inputPath = '../../../etc/passwd';

      expect(() => validatePath(inputPath, projectRoot)).toThrow('Path traversal detected');
    });

    it('handles absolute paths within project root', () => {
      const projectRoot = '/Users/test/project';
      const inputPath = '/Users/test/project/src/main.py';

      const result = validatePath(inputPath, projectRoot);

      expect(result).toBe('/Users/test/project/src/main.py');
    });
  });

  describe('isPythonFile', () => {
    it('returns true for .py files', () => {
      expect(isPythonFile('main.py')).toBe(true);
      expect(isPythonFile('/path/to/module.py')).toBe(true);
    });

    it('returns false for non-Python files', () => {
      expect(isPythonFile('main.ts')).toBe(false);
      expect(isPythonFile('main.js')).toBe(false);
      expect(isPythonFile('README.md')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(isPythonFile('MAIN.PY')).toBe(true);
    });
  });

  describe('isTypeScriptOrJavaScript', () => {
    it('returns true for TypeScript/JavaScript files', () => {
      expect(isTypeScriptOrJavaScript('main.ts')).toBe(true);
      expect(isTypeScriptOrJavaScript('main.js')).toBe(true);
      expect(isTypeScriptOrJavaScript('component.tsx')).toBe(true);
      expect(isTypeScriptOrJavaScript('component.jsx')).toBe(true);
    });

    it('returns false for non-TS/JS files', () => {
      expect(isTypeScriptOrJavaScript('main.py')).toBe(false);
      expect(isTypeScriptOrJavaScript('README.md')).toBe(false);
    });
  });

  describe('sanitizePath', () => {
    it('normalizes and validates paths', () => {
      const projectRoot = '/Users/test/project';
      const inputPath = 'src//./main.py';

      const result = sanitizePath(inputPath, projectRoot);

      expect(result).toBe('/Users/test/project/src/main.py');
    });

    it('throws on path traversal in normalized path', () => {
      const projectRoot = '/Users/test/project';
      const inputPath = 'src/../../etc/passwd';

      expect(() => sanitizePath(inputPath, projectRoot)).toThrow('Path traversal detected');
    });
  });
});
