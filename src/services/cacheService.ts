/**
 * JurisAccess AI - High-Performance In-Memory Cache Service
 * Caches frequent legal queries and statutory guidelines to reduce latency and token consumption.
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class CacheService {
  private static cache: Map<string, CacheEntry<unknown>> = new Map();
  private static maxEntries = 500;

  /**
   * Retrieves a cached value if present and unexpired
   */
  public static get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Stores a value in cache with a configurable TTL (default 1 hour)
   */
  public static set<T>(key: string, value: T, ttlMs = 3600000): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict the oldest key
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  /**
   * Clears the entire cache (useful for tests)
   */
  public static clear(): void {
    this.cache.clear();
  }
}
