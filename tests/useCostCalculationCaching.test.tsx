/**
 * Property-Based Tests for useCostCalculation Hook - Caching Behavior
 * 
 * **Feature: 6-frontend-backend-api-separation, Property 10: Cache returns identical results for identical inputs**
 * **Validates: Requirements 3.6, 5.5, 6.1**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import fc from 'fast-check';
import { useCostCalculation, costCache } from '../src/frontend/hooks/useCostCalculation';
import type { CostCalculationParams } from '../src/frontend/hooks/useCostCalculation';
import { apiClient } from '../src/frontend/services/apiClient';
import { validAttributesArb, validWarbandAbilityArb } from './testGenerators';

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

describe('useCostCalculation - Caching Property Tests', () => {
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
  it('should return cached results for identical inputs within TTL', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAttributesArb,
        validWarbandAbilityArb,
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 3 }),
        async (attributes, warbandAbility, equipment) => {
          // Clear cache at start of each iteration
          costCache.clear();
          
          // Setup mock response
          const mockResponse = {
            success: true,
            data: {
              totalCost: 15,
              breakdown: {
                attributes: 5,
                weapons: 3,
                equipment: 5,
                psychicPowers: 2,
              },
              warnings: [],
              isApproachingLimit: false,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(mockResponse);

          // Params for calculation
          const params: CostCalculationParams = {
            weirdoType: 'leader',
            attributes,
            warbandAbility,
            equipment,
          };

          // First render - should make API call
          const { unmount: unmount1 } = renderHook(() => useCostCalculation(params));
          await vi.advanceTimersByTimeAsync(300);

          // Verify first API call was made
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
          
          // Clean up first hook
          unmount1();

          // Clear mock to track new calls
          vi.mocked(apiClient.calculateCostRealTime).mockClear();

          // Second render with identical params within TTL (< 5 seconds)
          const { unmount: unmount2 } = renderHook(() => useCostCalculation(params));
          await vi.advanceTimersByTimeAsync(300);

          // Verify NO new API call was made (cache hit)
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(0);
          
          // Clean up second hook
          unmount2();
        }
      ),
      { numRuns: 50 }
    );
  }, 10000);

  it('should make new API call when cache entry expires after TTL', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAttributesArb,
        validWarbandAbilityArb,
        async (attributes, warbandAbility) => {
          // Clear cache and mocks at start of each iteration
          costCache.clear();
          vi.clearAllMocks();
          
          // Setup mock response
          const mockResponse = {
            success: true,
            data: {
              totalCost: 10,
              breakdown: {
                attributes: 5,
                weapons: 2,
                equipment: 2,
                psychicPowers: 1,
              },
              warnings: [],
              isApproachingLimit: false,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(mockResponse);

          // Params for calculation
          const params: CostCalculationParams = {
            weirdoType: 'trooper',
            attributes,
            warbandAbility,
          };

          // First render - should make API call
          const { unmount: unmount1 } = renderHook(() => useCostCalculation(params));
          await vi.advanceTimersByTimeAsync(300);

          // Verify first API call was made
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
          
          // Clean up first hook
          unmount1();

          // Clear mock to track new calls
          vi.mocked(apiClient.calculateCostRealTime).mockClear();

          // Advance time beyond TTL (5 seconds + buffer)
          await vi.advanceTimersByTimeAsync(5500);

          // Second render with identical params after TTL expiration
          const { unmount: unmount2 } = renderHook(() => useCostCalculation(params));
          await vi.advanceTimersByTimeAsync(300);

          // Verify new API call was made (cache miss due to expiration)
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
          
          // Clean up second hook
          unmount2();
        }
      ),
      { numRuns: 50 }
    );
  }, 10000);

  it('should make separate API calls for different inputs', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAttributesArb,
        validAttributesArb,
        validWarbandAbilityArb,
        async (attributes1, attributes2, warbandAbility) => {
          // Clear cache and mocks at start of each iteration
          costCache.clear();
          vi.clearAllMocks();
          
          // Ensure attributes are different
          if (JSON.stringify(attributes1) === JSON.stringify(attributes2)) {
            return; // Skip if identical
          }

          // Setup mock response
          const mockResponse = {
            success: true,
            data: {
              totalCost: 10,
              breakdown: {
                attributes: 5,
                weapons: 2,
                equipment: 2,
                psychicPowers: 1,
              },
              warnings: [],
              isApproachingLimit: false,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(mockResponse);

          // First params
          const params1: CostCalculationParams = {
            weirdoType: 'leader',
            attributes: attributes1,
            warbandAbility,
          };

          // Second params (different attributes)
          const params2: CostCalculationParams = {
            weirdoType: 'leader',
            attributes: attributes2,
            warbandAbility,
          };

          // First render
          const { unmount: unmount1 } = renderHook(() => useCostCalculation(params1));
          await vi.advanceTimersByTimeAsync(300);

          // Verify first API call
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
          unmount1();

          // Clear mock
          vi.mocked(apiClient.calculateCostRealTime).mockClear();

          // Second render with different params
          const { unmount: unmount2 } = renderHook(() => useCostCalculation(params2));
          await vi.advanceTimersByTimeAsync(300);

          // Verify new API call was made (different cache key)
          expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
          unmount2();
        }
      ),
      { numRuns: 50 }
    );
  }, 10000);
});
