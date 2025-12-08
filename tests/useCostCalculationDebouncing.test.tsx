/**
 * Property-Based Tests for useCostCalculation Hook - Debouncing Behavior
 * 
 * **Feature: 6-frontend-backend-api-separation, Property 9: Debouncing reduces API calls during rapid changes**
 * **Validates: Requirements 3.5, 6.2**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import { useCostCalculation } from '../src/frontend/hooks/useCostCalculation';
import type { CostCalculationParams } from '../src/frontend/hooks/useCostCalculation';
import { apiClient } from '../src/frontend/services/apiClient';
import { validAttributesArb, validWarbandAbilityArb } from './testGenerators';

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

describe('useCostCalculation - Debouncing Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Property 9: Debouncing reduces API calls during rapid changes
   * 
   * For any sequence of cost calculation requests within 300 milliseconds,
   * the Frontend SHALL make at most one Backend API call after the debounce period
   */
  it('should debounce rapid parameter changes and make only one API call', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAttributesArb,
        validWarbandAbilityArb,
        fc.integer({ min: 2, max: 10 }), // Number of rapid changes
        async (attributes, warbandAbility, changeCount) => {
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

          // Initial params
          const initialParams: CostCalculationParams = {
            weirdoType: 'leader',
            attributes,
            warbandAbility,
          };

          // Render hook with initial params
          const { rerender } = renderHook(
            (props: CostCalculationParams) => useCostCalculation(props),
            { initialProps: initialParams }
          );

          // Wait for initial render to complete
          await vi.advanceTimersByTimeAsync(300);
          
          // Clear the mock calls from initial render
          vi.mocked(apiClient.calculateCostRealTime).mockClear();

          // Make rapid changes (within 300ms window)
          for (let i = 0; i < changeCount; i++) {
            const updatedParams: CostCalculationParams = {
              ...initialParams,
              equipment: [`equipment-${i}`],
            };
            rerender(updatedParams);
            
            // Advance time by less than debounce delay (e.g., 50ms)
            vi.advanceTimersByTime(50);
          }

          // Now advance past the debounce delay
          await vi.advanceTimersByTimeAsync(300);

          // Verify only one API call was made despite multiple rapid changes
          const callCount = vi.mocked(apiClient.calculateCostRealTime).mock.calls.length;
          expect(callCount).toBe(1);
        }
      ),
      { numRuns: 50 }
    );
  }, 10000);

  it('should make separate API calls when changes are spaced beyond debounce delay', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAttributesArb,
        validWarbandAbilityArb,
        fc.integer({ min: 2, max: 5 }), // Number of spaced changes
        async (attributes, warbandAbility, changeCount) => {
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

          // Initial params
          const initialParams: CostCalculationParams = {
            weirdoType: 'leader',
            attributes,
            warbandAbility,
          };

          // Render hook with initial params
          const { rerender } = renderHook(
            (props: CostCalculationParams) => useCostCalculation(props),
            { initialProps: initialParams }
          );

          // Wait for initial render to complete
          await vi.advanceTimersByTimeAsync(300);
          
          // Clear the mock calls from initial render
          vi.mocked(apiClient.calculateCostRealTime).mockClear();

          // Make changes spaced beyond debounce delay
          for (let i = 0; i < changeCount; i++) {
            const updatedParams: CostCalculationParams = {
              ...initialParams,
              equipment: [`equipment-${i}`],
            };
            rerender(updatedParams);
            
            // Advance time beyond debounce delay (350ms > 300ms)
            await vi.advanceTimersByTimeAsync(350);
          }

          // Verify multiple API calls were made (one per change)
          const callCount = vi.mocked(apiClient.calculateCostRealTime).mock.calls.length;
          expect(callCount).toBe(changeCount);
        }
      ),
      { numRuns: 50 }
    );
  }, 15000);
});
