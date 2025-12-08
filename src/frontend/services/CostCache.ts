/**
 * LRU Cache with TTL support for cost calculation results
 * 
 * Features:
 * - Least Recently Used (LRU) eviction when capacity is reached
 * - Time-to-Live (TTL) expiration for cached entries
 * - Predicate-based invalidation
 * - Maximum capacity of 100 entries
 * - Default TTL of 5 seconds
 */

interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  lastAccessed: number;
}

export class CostCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds

  /**
   * Creates a new CostCache instance
   * @param maxSize Maximum number of entries (default: 100)
   * @param ttl Time to live in milliseconds (default: 5000ms = 5 seconds)
   */
  constructor(maxSize: number = 100, ttl: number = 5000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Retrieves a value from the cache
   * Returns null if the key doesn't exist or the entry has expired
   * @param key Cache key
   * @returns Cached value or null
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update last accessed time for LRU tracking
    entry.lastAccessed = now;
    
    return entry.value;
  }

  /**
   * Stores a value in the cache
   * Evicts the least recently used entry if capacity is reached
   * @param key Cache key
   * @param value Value to cache
   */
  set(key: string, value: T): void {
    const now = Date.now();

    // If key already exists, update it (preserve original timestamp, update lastAccessed)
    const existing = this.cache.get(key);
    if (existing) {
      this.cache.set(key, {
        key,
        value,
        timestamp: existing.timestamp, // Keep original timestamp
        lastAccessed: now,
      });
      return;
    }

    // If at capacity, evict least recently used entry
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    // Add new entry
    this.cache.set(key, {
      key,
      value,
      timestamp: now,
      lastAccessed: now,
    });
  }

  /**
   * Invalidates cache entries matching the predicate
   * @param predicate Function that returns true for keys to invalidate
   */
  invalidate(predicate: (key: string) => boolean): void {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache) {
      if (predicate(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Clears all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Returns the current number of entries in the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Evicts the least recently used entry from the cache
   * @private
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey !== null) {
      this.cache.delete(lruKey);
    }
  }
}
