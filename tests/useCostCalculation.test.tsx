/**
 * Unit Tests for useCostCalculation Hook
 * 
 * Tests basic functionality and integration with API client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCostCalculation, costCache } from '../src/frontend/hooks/useCostCalculation';
import type { CostCalculationParams } from '../src/frontend/hooks/useCostCalculation';
import { apiClient } from '../src/frontend/services/apiClient';

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

describe('useCostCalculation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    costCache.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial loading state', () => {
    const params: CostCalculationParams = {
      weirdoType: 'leader',
      attributes: {
        speed: 3,
        defense: '3d6',
        firepower: '3d6',
        prowess: '3d6',
        willpower: '3d6',
      },
    };

    const { result } = renderHook(() => useCostCalculation(params));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should call API with correct parameters', async () => {
    const mockResponse = {
      success: true,
      data: {
        totalCost: 15,
        breakdown: {
          attributes: 10,
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

    const params: CostCalculationParams = {
      weirdoType: 'trooper',
      attributes: {
        speed: 4,
        defense: '4d6',
        firepower: '2d6',
        prowess: '3d6',
        willpower: '2d6',
      },
      weapons: {
        close: ['Sword'],
        ranged: ['Pistol'],
      },
      equipment: ['Shield'],
      psychicPowers: ['Fireball'],
      warbandAbility: 'Cyborgs',
    };

    renderHook(() => useCostCalculation(params));

    // Advance past debounce delay
    await vi.advanceTimersByTimeAsync(300);

    expect(apiClient.calculateCostRealTime).toHaveBeenCalledWith({
      weirdoType: 'trooper',
      attributes: params.attributes,
      weapons: params.weapons,
      equipment: params.equipment,
      psychicPowers: params.psychicPowers,
      warbandAbility: 'Cyborgs',
    });
  });

  it('should update result with API response', async () => {
    const mockResponse = {
      success: true,
      data: {
        totalCost: 25,
        breakdown: {
          attributes: 15,
          weapons: 5,
          equipment: 3,
          psychicPowers: 2,
        },
        warnings: ['Approaching limit'],
        isApproachingLimit: true,
        isOverLimit: false,
        calculationTime: 45,
      },
    };

    vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(mockResponse);

    const params: CostCalculationParams = {
      weirdoType: 'leader',
      attributes: {
        speed: 5,
        defense: '5d6',
        firepower: '4d6',
        prowess: '4d6',
        willpower: '5d6',
      },
    };

    const { result } = renderHook(() => useCostCalculation(params));

    // Advance past debounce delay
    await vi.advanceTimersByTimeAsync(300);

    expect(result.current.totalCost).toBe(25);
    expect(result.current.breakdown).toEqual({
      attributes: 15,
      weapons: 5,
      equipment: 3,
      psychicPowers: 2,
    });
    expect(result.current.warnings).toEqual(['Approaching limit']);
    expect(result.current.isApproachingLimit).toBe(true);
    expect(result.current.isOverLimit).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle API errors', async () => {
    const mockError = new Error('Network error');
    vi.mocked(apiClient.calculateCostRealTime).mockRejectedValue(mockError);

    const params: CostCalculationParams = {
      weirdoType: 'leader',
      attributes: {
        speed: 3,
        defense: '3d6',
        firepower: '3d6',
        prowess: '3d6',
        willpower: '3d6',
      },
    };

    const { result } = renderHook(() => useCostCalculation(params));

    // Advance past debounce delay
    await vi.advanceTimersByTimeAsync(300);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Network error');
  });

  it('should clear cache when warband ability changes', async () => {
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

    const initialParams: CostCalculationParams = {
      weirdoType: 'leader',
      attributes: {
        speed: 3,
        defense: '3d6',
        firepower: '3d6',
        prowess: '3d6',
        willpower: '3d6',
      },
      warbandAbility: 'Cyborgs',
    };

    const { rerender } = renderHook(
      (props: CostCalculationParams) => useCostCalculation(props),
      { initialProps: initialParams }
    );

    // Wait for initial calculation
    await vi.advanceTimersByTimeAsync(300);

    // Add something to cache
    expect(costCache.size()).toBeGreaterThan(0);

    // Change warband ability
    const updatedParams: CostCalculationParams = {
      ...initialParams,
      warbandAbility: 'Soldiers',
    };
    rerender(updatedParams);

    // Cache should be cleared
    expect(costCache.size()).toBe(0);
  });
});
