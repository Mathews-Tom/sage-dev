import { z } from 'zod';

export const CacheMetadataSchema = z.object({
  source: z.string(),
  version: z.string().optional(),
  confidence: z.number().min(0).max(1),
  lastUpdated: z.string().datetime(),
});

export const CacheEntrySchema = z.object({
  topic: z.string(),
  findings: z.string(),
  metadata: CacheMetadataSchema,
  timestamp: z.number(),
  expiresAt: z.number(),
  accessCount: z.number().min(0),
  lastAccessed: z.number(),
});

export const CacheStatsSchema = z.object({
  totalEntries: z.number().min(0),
  totalSize: z.number().min(0),
  hitRate: z.number().min(0).max(100),
  oldestEntry: z.number().optional(),
  newestEntry: z.number().optional(),
});

export type CacheMetadata = z.infer<typeof CacheMetadataSchema>;
export type CacheEntry = z.infer<typeof CacheEntrySchema>;
export type CacheStats = z.infer<typeof CacheStatsSchema>;
