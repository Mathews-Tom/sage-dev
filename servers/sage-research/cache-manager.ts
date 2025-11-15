import { readdir, readFile, writeFile, unlink, rename, stat, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';
import {
  CacheEntry,
  CacheEntrySchema,
  CacheMetadata,
  CacheStats,
} from './schemas/cache-entry.js';
import {
  formatCacheAge,
  calculateExpiresAt,
  isExpired,
  generateCacheKey,
  parseCacheSize,
  formatBytes,
} from './utils/cache-helpers.js';

export interface CacheManagerOptions {
  cacheDir: string;
  maxSizeBytes?: number;
  ttlDays?: number;
}

export class CacheManager {
  private cacheDir: string;
  private maxSizeBytes: number;
  private ttlDays: number;
  private hitCount = 0;
  private missCount = 0;

  constructor(options: CacheManagerOptions) {
    this.cacheDir = options.cacheDir;
    this.maxSizeBytes = options.maxSizeBytes ?? parseCacheSize('100MB');
    this.ttlDays = options.ttlDays ?? 30;
  }

  async initialize(): Promise<void> {
    await mkdir(this.cacheDir, { recursive: true });
  }

  async get(topic: string): Promise<CacheEntry | null> {
    const cacheKey = generateCacheKey(topic);
    const filePath = join(this.cacheDir, cacheKey);

    try {
      const content = await readFile(filePath, 'utf-8');
      const entry = CacheEntrySchema.parse(JSON.parse(content));

      if (isExpired(entry.expiresAt)) {
        await this.invalidate(topic);
        this.missCount++;
        return null;
      }

      entry.accessCount++;
      entry.lastAccessed = Date.now();
      await this.atomicWrite(filePath, entry);

      this.hitCount++;
      return entry;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.missCount++;
        return null;
      }

      console.error(`Cache read error for ${topic}:`, error);
      try {
        await unlink(filePath);
      } catch {
        // Ignore deletion errors
      }
      this.missCount++;
      return null;
    }
  }

  async set(topic: string, findings: string, metadata: CacheMetadata): Promise<void> {
    const cacheKey = generateCacheKey(topic);
    const filePath = join(this.cacheDir, cacheKey);
    const now = Date.now();

    const entry: CacheEntry = {
      topic,
      findings,
      metadata,
      timestamp: now,
      expiresAt: calculateExpiresAt(now, this.ttlDays),
      accessCount: 0,
      lastAccessed: now,
    };

    await this.atomicWrite(filePath, entry);
    await this.enforceSizeLimit();
  }

  async has(topic: string): Promise<boolean> {
    const cacheKey = generateCacheKey(topic);
    const filePath = join(this.cacheDir, cacheKey);

    try {
      await stat(filePath);
      const entry = await this.get(topic);
      return entry !== null;
    } catch {
      return false;
    }
  }

  async invalidate(topic: string): Promise<boolean> {
    const cacheKey = generateCacheKey(topic);
    const filePath = join(this.cacheDir, cacheKey);

    try {
      await unlink(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  async clear(): Promise<number> {
    const files = await this.getCacheFiles();
    let deletedCount = 0;

    for (const file of files) {
      try {
        await unlink(join(this.cacheDir, file));
        deletedCount++;
      } catch {
        // Ignore individual deletion errors
      }
    }

    this.hitCount = 0;
    this.missCount = 0;
    return deletedCount;
  }

  async stats(): Promise<CacheStats> {
    const files = await this.getCacheFiles();
    let totalSize = 0;
    let oldestTimestamp: number | undefined;
    let newestTimestamp: number | undefined;

    for (const file of files) {
      const filePath = join(this.cacheDir, file);
      try {
        const fileStat = await stat(filePath);
        totalSize += fileStat.size;

        const content = await readFile(filePath, 'utf-8');
        const entry = CacheEntrySchema.parse(JSON.parse(content));

        if (!oldestTimestamp || entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
        }
        if (!newestTimestamp || entry.timestamp > newestTimestamp) {
          newestTimestamp = entry.timestamp;
        }
      } catch {
        // Skip invalid files
      }
    }

    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;

    return {
      totalEntries: files.length,
      totalSize,
      hitRate,
      oldestEntry: oldestTimestamp,
      newestEntry: newestTimestamp,
    };
  }

  async cleanup(): Promise<number> {
    const files = await this.getCacheFiles();
    let removedCount = 0;

    for (const file of files) {
      const filePath = join(this.cacheDir, file);
      try {
        const content = await readFile(filePath, 'utf-8');
        const entry = CacheEntrySchema.parse(JSON.parse(content));

        if (isExpired(entry.expiresAt)) {
          await unlink(filePath);
          removedCount++;
        }
      } catch {
        try {
          await unlink(filePath);
          removedCount++;
        } catch {
          // Ignore errors
        }
      }
    }

    return removedCount;
  }

  formatAge(entry: CacheEntry): string {
    return formatCacheAge(entry.timestamp);
  }

  formatSize(bytes: number): string {
    return formatBytes(bytes);
  }

  private async atomicWrite(filePath: string, entry: CacheEntry): Promise<void> {
    const validated = CacheEntrySchema.parse(entry);
    const tempPath = `${filePath}.${randomBytes(8).toString('hex')}.tmp`;
    const content = JSON.stringify(validated, null, 2);

    await writeFile(tempPath, content, 'utf-8');
    await rename(tempPath, filePath);
  }

  private async getCacheFiles(): Promise<string[]> {
    try {
      const files = await readdir(this.cacheDir);
      return files.filter((f) => f.endsWith('.json'));
    } catch {
      return [];
    }
  }

  private async enforceSizeLimit(): Promise<void> {
    const files = await this.getCacheFiles();
    const entries: Array<{ file: string; entry: CacheEntry; size: number }> = [];

    for (const file of files) {
      const filePath = join(this.cacheDir, file);
      try {
        const fileStat = await stat(filePath);
        const content = await readFile(filePath, 'utf-8');
        const entry = CacheEntrySchema.parse(JSON.parse(content));
        entries.push({ file, entry, size: fileStat.size });
      } catch {
        // Skip invalid files
      }
    }

    let totalSize = entries.reduce((sum, e) => sum + e.size, 0);

    if (totalSize <= this.maxSizeBytes) {
      return;
    }

    entries.sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed);

    for (const entry of entries) {
      if (totalSize <= this.maxSizeBytes * 0.9) {
        break;
      }

      try {
        await unlink(join(this.cacheDir, entry.file));
        totalSize -= entry.size;
      } catch {
        // Ignore deletion errors
      }
    }
  }
}
