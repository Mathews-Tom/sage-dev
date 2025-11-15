import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { CacheManager } from '../cache-manager.js';
import { CacheMetadata } from '../schemas/cache-entry.js';

const TEST_DIR = '/tmp/sage-cache-manager-test';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    cache = new CacheManager({
      cacheDir: TEST_DIR,
      maxSizeBytes: 1024 * 1024,
      ttlDays: 30,
    });
    await cache.initialize();
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('get()', () => {
    it('returns null on cache miss', async () => {
      const result = await cache.get('nonexistent-topic');
      expect(result).toBeNull();
    });

    it('returns entry on cache hit', async () => {
      const metadata = createTestMetadata();
      await cache.set('test-topic', 'Test findings', metadata);

      const result = await cache.get('test-topic');
      expect(result).not.toBeNull();
      expect(result?.topic).toBe('test-topic');
      expect(result?.findings).toBe('Test findings');
    });

    it('increments access count on hit', async () => {
      const metadata = createTestMetadata();
      await cache.set('test-topic', 'Test findings', metadata);

      await cache.get('test-topic');
      const result = await cache.get('test-topic');

      expect(result?.accessCount).toBe(2);
    });

    it('returns null for expired entries', async () => {
      const metadata = createTestMetadata();
      const shortTtlCache = new CacheManager({
        cacheDir: TEST_DIR,
        ttlDays: 0,
      });

      await shortTtlCache.set('expired-topic', 'Old findings', metadata);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = await shortTtlCache.get('expired-topic');
      expect(result).toBeNull();
    });
  });

  describe('set()', () => {
    it('stores cache entry correctly', async () => {
      const metadata = createTestMetadata();
      await cache.set('new-topic', 'New findings', metadata);

      const files = await readdir(TEST_DIR);
      expect(files.length).toBe(1);
      expect(files[0]).toContain('new-topic');
    });

    it('creates valid JSON file', async () => {
      const metadata = createTestMetadata();
      await cache.set('test-topic', 'Test findings', metadata);

      const files = await readdir(TEST_DIR);
      const content = await readFile(join(TEST_DIR, files[0]), 'utf-8');
      const parsed = JSON.parse(content);

      expect(parsed.topic).toBe('test-topic');
      expect(parsed.findings).toBe('Test findings');
      expect(parsed.timestamp).toBeTypeOf('number');
      expect(parsed.expiresAt).toBeTypeOf('number');
    });
  });

  describe('has()', () => {
    it('returns false for non-existent entry', async () => {
      const result = await cache.has('nonexistent');
      expect(result).toBe(false);
    });

    it('returns true for existing entry', async () => {
      const metadata = createTestMetadata();
      await cache.set('test-topic', 'Test findings', metadata);

      const result = await cache.has('test-topic');
      expect(result).toBe(true);
    });
  });

  describe('invalidate()', () => {
    it('removes specific cache entry', async () => {
      const metadata = createTestMetadata();
      await cache.set('topic-1', 'Findings 1', metadata);
      await cache.set('topic-2', 'Findings 2', metadata);

      const removed = await cache.invalidate('topic-1');
      expect(removed).toBe(true);

      const result = await cache.get('topic-1');
      expect(result).toBeNull();

      const stillExists = await cache.get('topic-2');
      expect(stillExists).not.toBeNull();
    });

    it('returns false for non-existent entry', async () => {
      const removed = await cache.invalidate('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('clear()', () => {
    it('removes all cache entries', async () => {
      const metadata = createTestMetadata();
      await cache.set('topic-1', 'Findings 1', metadata);
      await cache.set('topic-2', 'Findings 2', metadata);
      await cache.set('topic-3', 'Findings 3', metadata);

      const deletedCount = await cache.clear();
      expect(deletedCount).toBe(3);

      const files = await readdir(TEST_DIR);
      expect(files.length).toBe(0);
    });

    it('resets hit rate statistics', async () => {
      const metadata = createTestMetadata();
      await cache.set('test', 'findings', metadata);
      await cache.get('test');
      await cache.get('nonexistent');

      await cache.clear();
      const stats = await cache.stats();

      expect(stats.hitRate).toBe(0);
    });
  });

  describe('stats()', () => {
    it('returns correct metrics', async () => {
      const metadata = createTestMetadata();
      await cache.set('topic-1', 'Findings 1', metadata);
      await cache.set('topic-2', 'Findings 2', metadata);

      const stats = await cache.stats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.oldestEntry).toBeTypeOf('number');
      expect(stats.newestEntry).toBeTypeOf('number');
    });

    it('calculates hit rate correctly', async () => {
      const metadata = createTestMetadata();
      await cache.set('test', 'findings', metadata);

      await cache.get('test');
      await cache.get('test');
      await cache.get('nonexistent');

      const stats = await cache.stats();

      expect(stats.hitRate).toBeCloseTo(66.67, 1);
    });
  });

  describe('cleanup()', () => {
    it('removes expired entries', async () => {
      const metadata = createTestMetadata();
      const shortTtlCache = new CacheManager({
        cacheDir: TEST_DIR,
        ttlDays: 0,
      });

      await shortTtlCache.set('expired', 'Old data', metadata);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const removed = await shortTtlCache.cleanup();
      expect(removed).toBe(1);

      const files = await readdir(TEST_DIR);
      expect(files.length).toBe(0);
    });
  });

  describe('formatAge()', () => {
    it('formats cache age correctly', async () => {
      const metadata = createTestMetadata();
      await cache.set('test', 'findings', metadata);

      const entry = await cache.get('test');
      const age = cache.formatAge(entry!);

      expect(age).toContain('Cached');
    });
  });

  describe('atomic writes', () => {
    it('writes atomically to prevent corruption', async () => {
      const metadata = createTestMetadata();
      await cache.set('atomic-test', 'Atomic write test', metadata);

      const files = await readdir(TEST_DIR);
      const tempFiles = files.filter((f) => f.includes('.tmp'));

      expect(tempFiles.length).toBe(0);
    });
  });
});

function createTestMetadata(): CacheMetadata {
  return {
    source: 'test',
    version: '1.0.0',
    confidence: 0.9,
    lastUpdated: new Date().toISOString(),
  };
}
