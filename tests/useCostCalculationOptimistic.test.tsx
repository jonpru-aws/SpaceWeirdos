/**
 * Property-Based Tests for useCostCalculation Hook - Optimistic Updates
 * 
 * **Feature: 6-frontend-backend-api-separation, Property 13: Frontend shows last known value during API requests**
 * **Validates: Requirements 5.6**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
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

describe('useCostCalculation - Optimistic Updates Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Property 13: Frontend shows last known value during API requests
   * 
   * For any cost calculation request while a Backend API call is in flight,
   * the Frontend SHALL display the most recent known cost value
   */
  it('should show last known value while API request is in flight', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAttributesArb,
        validWarbandAbilityArb,
        fc.integer({ min: 5, max: 20 }),
        fc.integer({ min: 10, max: 30 }),
        async (attributes, warbandAbility, firstCost, secondCost) => {
          // Clear cache and mocks at start of each iteration
          costCache.clear();
          vi.clearAllMocks();

          // Setup first mock response
          const firstResponse = {
            success: true,
            data: {
              totalCost: firstCost,
              breakdown: {
                attributes: firstCost - 3,
                weapons: 1,
                equipment: 1,
                psychicPowers: 1,
              },
              warnings: [],
              isApproachingLimit: false,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(firstResponse);

          // Initial params
          const initialParams: CostCalculationParams = {
            weirdoType: 'leader',
            attributes,
            warbandAbility,
          };

          // Render hook with initial params
          const { result, rerender } = renderHook(
            (props: CostCalculationParams) => useCostCalculation(props),
            { initialProps: initialParams }
          );

          // Wait for initial calculation to complete
          await vi.advanceTimersByTimeAsync(300);

          // Verify initial cost is displayed
          expect(result.current.totalCost).toBe(firstCost);
          expect(result.current.isLoading).toBe(false);

          // Setup second mock response with different cost
          const secondResponse = {
            success: true,
            data: {
              totalCost: secondCost,
              breakdown: {
                attributes: secondCost - 3,
                weapons: 1,
                equipment: 1,
                psychicPowers: 1,
              },
              warnings: [],
              isApproachingLimit: false,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(secondResponse);

          // Update params to trigger new calculation
          const updatedParams: CostCalculationParams = {
            ...initialParams,
            equipment: ['new-equipment'],
          };
          rerender(updatedParams);

          // Immediately check - should still show first cost (optimistic update)
          // and isLoading should be false (showing last known value)
          expect(result.current.totalCost).toBe(firstCost);

          // Advance time partially through debounce
          vi.advanceTimersByTime(150);

          // Should still show first cost
          expect(result.current.totalCost).toBe(firstCost);

          // Complete debounce and API call
          await vi.advanceTimersByTimeAsync(200);

          // Now should show new cost
          expect(result.current.totalCost).toBe(secondCost);
          expect(result.current.isLoading).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  }, 10000);

  it('should maintain last known breakdown during loading', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAttributesArb,
        validWarbandAbilityArb,
        async (attributes, warbandAbility) => {
          // Clear cache and mocks at start of each iteration
          costCache.clear();
          vi.clearAllMocks();

          // Setup first mock response with specific breakdown
          const firstResponse = {
            success: true,
            data: {
              totalCost: 20,
              breakdown: {
                attributes: 10,
                weapons: 5,
                equipment: 3,
                psychicPowers: 2,
              },
              warnings: ['Test warning'],
              isApproachingLimit: true,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(firstResponse);

          // Initial params
          const initialParams: CostCalculationParams = {
            weirdoType: 'leader',
            attributes,
            warbandAbility,
          };

          // Render hook
          const { result, rerender } = renderHook(
            (props: CostCalculationParams) => useCostCalculation(props),
            { initialProps: initialParams }
          );

          // Wait for initial calculation
          await vi.advanceTimersByTimeAsync(300);

          // Verify initial breakdown
          expect(result.current.breakdown).toEqual({
            attributes: 10,
            weapons: 5,
            equipment: 3,
            psychicPowers: 2,
          });
          expect(result.current.warnings).toEqual(['Test warning']);
          expect(result.current.isApproachingLimit).toBe(true);

          // Setup second response
          const secondResponse = {
            success: true,
            data: {
              totalCost: 25,
              breakdown: {
                attributes: 12,
                weapons: 6,
                equipment: 4,
                psychicPowers: 3,
              },
              warnings: [],
              isApproachingLimit: false,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(secondResponse);

          // Update params
          const updatedParams: CostCalculationParams = {
            ...initialParams,
            psychicPowers: ['new-power'],
          };
          rerender(updatedParams);

          // Immediately check - should still show first breakdown (optimistic)
          expect(result.current.breakdown).toEqual({
            attributes: 10,
            weapons: 5,
            equipment: 3,
            psychicPowers: 2,
          });
          expect(result.current.warnings).toEqual(['Test warning']);
          expect(result.current.isApproachingLimit).toBe(true);

          // Complete debounce and API call
          await vi.advanceTimersByTimeAsync(350);

          // Now should show new breakdown
          expect(result.current.breakdown).toEqual({
            attributes: 12,
            weapons: 6,
            equipment: 4,
            psychicPowers: 3,
          });
          expect(result.current.warnings).toEqual([]);
          expect(result.current.isApproachingLimit).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  }, 10000);
});
