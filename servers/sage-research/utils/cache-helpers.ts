const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_WEEK = 604800;

export function formatCacheAge(timestamp: number): string {
  const now = Date.now();
  const ageMs = now - timestamp;
  const ageSeconds = Math.floor(ageMs / 1000);

  if (ageSeconds < SECONDS_PER_MINUTE) {
    return 'Cached just now';
  }

  if (ageSeconds < SECONDS_PER_HOUR) {
    const minutes = Math.floor(ageSeconds / SECONDS_PER_MINUTE);
    return `Cached ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  if (ageSeconds < SECONDS_PER_DAY) {
    const hours = Math.floor(ageSeconds / SECONDS_PER_HOUR);
    return `Cached ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (ageSeconds < SECONDS_PER_WEEK) {
    const days = Math.floor(ageSeconds / SECONDS_PER_DAY);
    return `Cached ${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  const weeks = Math.floor(ageSeconds / SECONDS_PER_WEEK);
  return `Cached ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
}

export function calculateExpiresAt(timestamp: number, ttlDays: number = 30): number {
  return timestamp + ttlDays * SECONDS_PER_DAY * 1000;
}

export function isExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

export function generateCacheKey(topic: string): string {
  const sanitized = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);

  return `${sanitized}.json`;
}

export function parseCacheSize(sizeString: string): number {
  const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB)$/i);
  if (!match) {
    throw new Error(`Invalid cache size format: ${sizeString}`);
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  switch (unit) {
    case 'KB':
      return value * 1024;
    case 'MB':
      return value * 1024 * 1024;
    case 'GB':
      return value * 1024 * 1024 * 1024;
    default:
      throw new Error(`Unknown size unit: ${unit}`);
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
