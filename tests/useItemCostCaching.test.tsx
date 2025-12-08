/**
 * Property-Based Tests for useItemCost Hook - Caching Behavior
 * 
 * **Feature: 6-frontend-backend-api-separation, Property 10: Cache returns identical results for identical inputs**
 * **Validates: Requirements 5.5, 6.1**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import fc from 'fast-check';
import { useItemCost, itemCostCache } from '../src/frontend/hooks/useItemCost';
import type { ItemCostParams } from '../src/frontend/hooks/useItemCost';
import { apiClient } from '../src/frontend/services/apiClient';
import { validWarbandAbilityArb } from './testGenerators';

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

// Arbitraries for item cost parameters
const itemTypeArb = fc.constantFrom('weapon', 'equipment', 'psychicPower') as fc.Arbitrary<'weapon' | 'equipment' | 'psychicPower'>;
const weaponTypeArb = fc.constantFrom('close', 'ranged') as fc.Arbitrary<'close' | 'ranged'>;
const itemNameArb = fc.string({ minLength: 1, maxLength: 30 });

const itemCostParamsArb = fc.record({
  itemType: itemTypeArb,
  itemName: itemNameArb,
  warbandAbility: validWarbandAbilityArb,
  weaponType: fc.option(weaponTypeArb, { nil: undefined }),
});

describe('useItemCost - Caching Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Property 10: Cache returns identical results for identical inputs
   * 
   * For any cost calculation request, if an identical request was made within 5 seconds,
   * the Frontend SHALL return the cached result without making a Backend API call
   */
  it('should return cached results for identical item cost requests within TTL', async () => {
    await fc.assert(
      fc.asyncProperty(
        itemCostParamsArb,
        async (params) => {
          // Clear cache at start of each iteration
          itemCostCache.clear();
          vi.clearAllMocks();
          
          // Setup mock response
          const mockResponse = {
            success: true,
            data: {
              totalCost: 15,
              breakdown: {
                attributes: 0,
                weapons: params.itemType === 'weapon' ? 5 : 0,
                equipment: params.itemType === 'equipment' ? 3 : 0,
                psychicPowers: params.itemType === 'psychicPower' ? 2 : 0,
              },
              warnings: [],
              isApproachingLimit: false,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(mockResponse);

          // First render - should make API call
          const { unmount: unmount1 } = renderHook(() => useItemCost(params));
          await vi.runAllTimersAsync();

          // Verify first API call was made
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
          
          // Clean up first hook
          unmount1();

          // Clear mock to track new calls
          vi.mocked(apiClient.calculateCostRealTime).mockClear();

          // Second render with identical params within TTL (< 5 seconds)
          const { unmount: unmount2 } = renderHook(() => useItemCost(params));
          await vi.runAllTimersAsync();

          // Verify NO new API call was made (cache hit)
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(0);
          
          // Clean up second hook
          unmount2();
        }
      ),
      { numRuns: 50 }
    );
  }, 15000);

  it('should make new API call when cache entry expires after TTL', async () => {
    await fc.assert(
      fc.asyncProperty(
        itemCostParamsArb,
        async (params) => {
          // Clear cache and mocks at start of each iteration
          itemCostCache.clear();
          vi.clearAllMocks();
          
          // Setup mock response
          const mockResponse = {
            success: true,
            data: {
              totalCost: 10,
              breakdown: {
                attributes: 0,
                weapons: params.itemType === 'weapon' ? 4 : 0,
                equipment: params.itemType === 'equipment' ? 2 : 0,
                psychicPowers: params.itemType === 'psychicPower' ? 3 : 0,
              },
              warnings: [],
              isApproachingLimit: false,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(mockResponse);

          // First render - should make API call
          const { unmount: unmount1 } = renderHook(() => useItemCost(params));
          await vi.runAllTimersAsync();

          // Verify first API call was made
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
          
          // Clean up first hook
          unmount1();

          // Clear mock to track new calls
          vi.mocked(apiClient.calculateCostRealTime).mockClear();

          // Advance time beyond TTL (5 seconds + buffer)
          await vi.advanceTimersByTimeAsync(5500);

          // Second render with identical params after TTL expiration
          const { unmount: unmount2 } = renderHook(() => useItemCost(params));
          await vi.runAllTimersAsync();

          // Verify new API call was made (cache miss due to expiration)
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
          
          // Clean up second hook
          unmount2();
        }
      ),
      { numRuns: 50 }
    );
  }, 15000);

  it('should make separate API calls for different item parameters', async () => {
    await fc.assert(
      fc.asyncProperty(
        itemNameArb,
        itemNameArb,
        validWarbandAbilityArb,
        async (itemName1, itemName2, warbandAbility) => {
          // Clear cache and mocks at start of each iteration
          itemCostCache.clear();
          vi.clearAllMocks();
          
          // Ensure item names are different
          if (itemName1 === itemName2) {
            return; // Skip if identical
          }

          // Setup mock response
          const mockResponse = {
            success: true,
            data: {
              totalCost: 10,
              breakdown: {
                attributes: 0,
                weapons: 5,
                equipment: 0,
                psychicPowers: 0,
              },
              warnings: [],
              isApproachingLimit: false,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(mockResponse);

          // First params
          const params1: ItemCostParams = {
            itemType: 'weapon',
            itemName: itemName1,
            warbandAbility,
            weaponType: 'close',
          };

          // Second params (different item name)
          const params2: ItemCostParams = {
            itemType: 'weapon',
            itemName: itemName2,
            warbandAbility,
            weaponType: 'close',
          };

          // First render
          const { unmount: unmount1 } = renderHook(() => useItemCost(params1));
          await vi.runAllTimersAsync();

          // Verify first API call
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
          unmount1();

          // Clear mock
          vi.mocked(apiClient.calculateCostRealTime).mockClear();

          // Second render with different params
          const { unmount: unmount2 } = renderHook(() => useItemCost(params2));
          await vi.runAllTimersAsync();

          // Verify new API call was made (different cache key)
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
          unmount2();
        }
      ),
      { numRuns: 50 }
    );
  }, 15000);

  it('should invalidate cache when warband ability changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        itemNameArb,
        validWarbandAbilityArb,
        validWarbandAbilityArb,
        async (itemName, ability1, ability2) => {
          // Clear cache and mocks at start of each iteration
          itemCostCache.clear();
          vi.clearAllMocks();
          
          // Ensure abilities are different
          if (ability1 === ability2) {
            return; // Skip if identical
          }

          // Setup mock response
          const mockResponse = {
            success: true,
            data: {
              totalCost: 10,
              breakdown: {
                attributes: 0,
                weapons: 0,
                equipment: 3,
                psychicPowers: 0,
              },
              warnings: [],
              isApproachingLimit: false,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(mockResponse);

          // First params with ability1
          const params1: ItemCostParams = {
            itemType: 'equipment',
            itemName,
            warbandAbility: ability1,
          };

          // First render
          const { unmount: unmount1 } = renderHook(() => useItemCost(params1));
          await vi.runAllTimersAsync();

          // Verify first API call
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
          unmount1();

          // Clear mock
          vi.mocked(apiClient.calculateCostRealTime).mockClear();

          // Second params with ability2 (different ability, same item)
          const params2: ItemCostParams = {
            itemType: 'equipment',
            itemName,
            warbandAbility: ability2,
          };

          // Second render with different ability
          const { unmount: unmount2 } = renderHook(() => useItemCost(params2));
          await vi.runAllTimersAsync();

          // Verify new API call was made (cache invalidated due to ability change)
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
          unmount2();
        }
      ),
      { numRuns: 50 }
    );
  }, 15000);
});
