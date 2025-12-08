import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { CostCache } from '../src/frontend/services/CostCache';

describe('CostCache', () => {
  describe('Basic Operations', () => {
    let cache: CostCache<number>;

    beforeEach(() => {
      cache = new CostCache<number>(100, 5000);
    });

    it('should store and retrieve values', () => {
      cache.set('key1', 42);
      expect(cache.get('key1')).toBe(42);
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should update existing keys', () => {
      cache.set('key1', 42);
      cache.set('key1', 100);
      expect(cache.get('key1')).toBe(100);
    });

    it('should clear all entries', () => {
      cache.set('key1', 1);
      cache.set('key2', 2);
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('Property 16: LRU cache eviction at capacity', () => {
    /**
     * **Feature: frontend-backend-api-separation, Property 16: LRU cache eviction at capacity**
     * **Validates: Requirements 6.5**
     * 
     * For any cache state at maximum capacity (100 entries), when a new entry is added,
     * the Frontend SHALL evict the least-recently-used entry
     */
    it('should evict least recently used entry when at capacity', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 50 }), // Cache size
          fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 100 }), // Keys to insert
          (maxSize, keys) => {
            const cache = new CostCache<number>(maxSize, 60000); // Long TTL to avoid expiration
            const uniqueKeys = [...new Set(keys)].slice(0, maxSize + 10); // Ensure we have enough unique keys

            if (uniqueKeys.length <= maxSize) {
              return true; // Skip if not enough keys to test eviction
            }

            // Fill cache to capacity
            for (let i = 0; i < maxSize; i++) {
              cache.set(uniqueKeys[i], i);
            }

            expect(cache.size()).toBe(maxSize);

            // Access some entries to update their LRU status
            // The first entry (index 0) will be the LRU since we don't access it
            for (let i = 1; i < maxSize; i++) {
              cache.get(uniqueKeys[i]);
            }

            // Add a new entry, should evict the LRU (first entry)
            cache.set(uniqueKeys[maxSize], 999);

            // Cache should still be at max size
            expect(cache.size()).toBe(maxSize);

            // The LRU entry (first one) should be evicted
            expect(cache.get(uniqueKeys[0])).toBeNull();

            // The new entry should exist
            expect(cache.get(uniqueKeys[maxSize])).toBe(999);

            // Other entries should still exist
            expect(cache.get(uniqueKeys[1])).toBe(1);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain LRU order correctly with multiple accesses', async () => {
      const cache = new CostCache<string>(3, 60000);

      // Add three entries with small delays to ensure different timestamps
      cache.set('a', 'value-a');
      await new Promise(resolve => setTimeout(resolve, 10));
      cache.set('b', 'value-b');
      await new Promise(resolve => setTimeout(resolve, 10));
      cache.set('c', 'value-c');
      await new Promise(resolve => setTimeout(resolve, 10));

      // Access 'a' and 'b' to make 'c' the LRU
      cache.get('a');
      await new Promise(resolve => setTimeout(resolve, 10));
      cache.get('b');
      await new Promise(resolve => setTimeout(resolve, 10));

      // Add new entry, should evict 'c'
      cache.set('d', 'value-d');

      expect(cache.get('c')).toBeNull();
      expect(cache.get('a')).toBe('value-a');
      expect(cache.get('b')).toBe('value-b');
      expect(cache.get('d')).toBe('value-d');
    });
  });

  describe('Property 10: Cache returns identical results for identical inputs', () => {
    /**
     * **Feature: frontend-backend-api-separation, Property 10: Cache returns identical results for identical inputs**
     * **Validates: Requirements 6.1**
     * 
     * For any cost calculation request, if an identical request was made within 5 seconds,
     * the Frontend SHALL return the cached result without making a Backend API call
     */
    it('should return cached values for identical keys within TTL', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer(),
          (key, value) => {
            const cache = new CostCache<number>(100, 5000);

            cache.set(key, value);
            const retrieved = cache.get(key);

            // Should return the exact same value
            expect(retrieved).toBe(value);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should return null for expired entries', async () => {
      const cache = new CostCache<number>(100, 100); // 100ms TTL

      cache.set('key1', 42);
      expect(cache.get('key1')).toBe(42);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cache.get('key1')).toBeNull();
    });

    it('should handle multiple identical requests within TTL', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer(),
          fc.integer({ min: 2, max: 10 }),
          (key, value, numRequests) => {
            const cache = new CostCache<number>(100, 5000);

            cache.set(key, value);

            // Make multiple requests for the same key
            for (let i = 0; i < numRequests; i++) {
              const retrieved = cache.get(key);
              expect(retrieved).toBe(value);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 15: Cache invalidation on warband ability change', () => {
    /**
     * **Feature: frontend-backend-api-separation, Property 15: Cache invalidation on warband ability change**
     * **Validates: Requirements 6.4**
     * 
     * For any change to the warband ability, the Frontend SHALL invalidate all cached cost calculations
     */
    it('should invalidate entries matching predicate', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              key: fc.string({ minLength: 1, maxLength: 50 }),
              value: fc.integer(),
              shouldInvalidate: fc.boolean(),
            }),
            { minLength: 5, maxLength: 20 }
          ),
          (entries) => {
            const cache = new CostCache<number>(100, 5000);

            // Create a map to track the last entry for each unique key
            const uniqueEntries = new Map<string, { value: number; shouldInvalidate: boolean }>();
            for (const entry of entries) {
              uniqueEntries.set(entry.key, {
                value: entry.value,
                shouldInvalidate: entry.shouldInvalidate,
              });
            }

            // Add all unique entries to cache
            for (const [key, data] of uniqueEntries) {
              cache.set(key, data.value);
            }

            // Invalidate entries based on predicate
            cache.invalidate((key) => {
              const entry = uniqueEntries.get(key);
              return entry?.shouldInvalidate ?? false;
            });

            // Check that invalidated entries are gone and others remain
            for (const [key, data] of uniqueEntries) {
              const retrieved = cache.get(key);
              if (data.shouldInvalidate) {
                expect(retrieved).toBeNull();
              } else {
                expect(retrieved).toBe(data.value);
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should invalidate all entries with warband ability in key', () => {
      const cache = new CostCache<number>(100, 5000);

      // Simulate cache keys with different warband abilities
      cache.set('cost:ability1:weapon1', 10);
      cache.set('cost:ability1:weapon2', 15);
      cache.set('cost:ability2:weapon1', 12);
      cache.set('cost:noability:weapon1', 8);

      // Invalidate all entries with ability1
      cache.invalidate((key) => key.includes('ability1'));

      expect(cache.get('cost:ability1:weapon1')).toBeNull();
      expect(cache.get('cost:ability1:weapon2')).toBeNull();
      expect(cache.get('cost:ability2:weapon1')).toBe(12);
      expect(cache.get('cost:noability:weapon1')).toBe(8);
    });

    it('should handle invalidation with no matching entries', () => {
      const cache = new CostCache<number>(100, 5000);

      cache.set('key1', 1);
      cache.set('key2', 2);

      // Invalidate with predicate that matches nothing
      cache.invalidate((key) => key.includes('nonexistent'));

      expect(cache.get('key1')).toBe(1);
      expect(cache.get('key2')).toBe(2);
      expect(cache.size()).toBe(2);
    });
  });
});
