/**
 * Unit Tests for useItemCost Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useItemCost, itemCostCache } from '../src/frontend/hooks/useItemCost';
import type { ItemCostParams } from '../src/frontend/hooks/useItemCost';
import { apiClient } from '../src/frontend/services/apiClient';

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

describe('useItemCost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    itemCostCache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should calculate weapon cost correctly', async () => {
    const mockResponse = {
      success: true,
      data: {
        totalCost: 5,
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

    const params: ItemCostParams = {
      itemType: 'weapon',
      itemName: 'Laser Rifle',
      warbandAbility: null,
      weaponType: 'ranged',
    };

    const { result } = renderHook(() => useItemCost(params));

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for calculation to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check result
    expect(result.current.cost).toBe(5);
    expect(result.current.error).toBeNull();
    expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
  });

  it('should calculate equipment cost correctly', async () => {
    const mockResponse = {
      success: true,
      data: {
        totalCost: 3,
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

    const params: ItemCostParams = {
      itemType: 'equipment',
      itemName: 'Shield',
      warbandAbility: null,
    };

    const { result } = renderHook(() => useItemCost(params));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cost).toBe(3);
    expect(result.current.error).toBeNull();
  });

  it('should calculate psychic power cost correctly', async () => {
    const mockResponse = {
      success: true,
      data: {
        totalCost: 2,
        breakdown: {
          attributes: 0,
          weapons: 0,
          equipment: 0,
          psychicPowers: 2,
        },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 50,
      },
    };

    vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(mockResponse);

    const params: ItemCostParams = {
      itemType: 'psychicPower',
      itemName: 'Mind Blast',
      warbandAbility: null,
    };

    const { result } = renderHook(() => useItemCost(params));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cost).toBe(2);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(apiClient.calculateCostRealTime).mockRejectedValue(
      new Error('Network error')
    );

    const params: ItemCostParams = {
      itemType: 'weapon',
      itemName: 'Sword',
      warbandAbility: null,
      weaponType: 'close',
    };

    const { result } = renderHook(() => useItemCost(params));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.cost).toBe(0);
  });

  it('should use cached values for identical requests', async () => {
    const mockResponse = {
      success: true,
      data: {
        totalCost: 4,
        breakdown: {
          attributes: 0,
          weapons: 0,
          equipment: 4,
          psychicPowers: 0,
        },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 50,
      },
    };

    vi.mocked(apiClient.calculateCostRealTime).mockResolvedValue(mockResponse);

    const params: ItemCostParams = {
      itemType: 'equipment',
      itemName: 'Armor',
      warbandAbility: null,
    };

    // First render
    const { result: result1, unmount: unmount1 } = renderHook(() => useItemCost(params));

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
    });

    expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
    unmount1();

    // Second render with same params
    const { result: result2 } = renderHook(() => useItemCost(params));

    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false);
    });

    // Should still be 1 call (cache hit)
    expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
    expect(result2.current.cost).toBe(4);
  });

  it('should invalidate cache when warband ability changes', async () => {
    const mockResponse = {
      success: true,
      data: {
        totalCost: 3,
        breakdown: {
          attributes: 0,
          weapons: 3,
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

    const params1: ItemCostParams = {
      itemType: 'weapon',
      itemName: 'Pistol',
      warbandAbility: null,
      weaponType: 'ranged',
    };

    // First render with no ability
    const { result: result1, unmount: unmount1 } = renderHook(() => useItemCost(params1));

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
    });

    expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(1);
    unmount1();

    // Second render with different ability
    const params2: ItemCostParams = {
      ...params1,
      warbandAbility: 'Cyborgs',
    };

    const { result: result2 } = renderHook(() => useItemCost(params2));

    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false);
    });

    // Should make new API call (cache invalidated)
    expect(apiClient.calculateCostRealTime).toHaveBeenCalledTimes(2);
  });
});
