/**
 * Unit tests for apiClient.calculateBatchCosts method
 * Validates: Requirements 2.1, 2.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient } from '../src/frontend/services/apiClient';
import type { BatchCostRequest } from '../src/frontend/services/apiTypes';

describe('apiClient.calculateBatchCosts', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Mock fetch for testing
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('should call /api/cost/batch endpoint with correct request body', async () => {
    const mockResponse = {
      success: true,
      data: {
        costs: {
          'weapon-1': 5,
          'weapon-2': 10,
          'equipment-1': 3,
        },
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const request: BatchCostRequest = {
      items: [
        { id: 'weapon-1', type: 'weapon', name: 'Sword', weaponType: 'close' },
        { id: 'weapon-2', type: 'weapon', name: 'Rifle', weaponType: 'ranged' },
        { id: 'equipment-1', type: 'equipment', name: 'Shield' },
      ],
      warbandAbility: 'Heavily Armed',
    };

    const result = await apiClient.calculateBatchCosts(request);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/cost/batch'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
    );
    expect(result).toEqual({
      'weapon-1': 5,
      'weapon-2': 10,
      'equipment-1': 3,
    });
  });

  it('should return costs map for items without warband ability', async () => {
    const mockResponse = {
      success: true,
      data: {
        costs: {
          'power-1': 8,
          'power-2': 12,
        },
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const request: BatchCostRequest = {
      items: [
        { id: 'power-1', type: 'psychicPower', name: 'Telekinesis' },
        { id: 'power-2', type: 'psychicPower', name: 'Mind Control' },
      ],
      warbandAbility: null,
    };

    const result = await apiClient.calculateBatchCosts(request);

    expect(result).toEqual({
      'power-1': 8,
      'power-2': 12,
    });
  });

  it('should handle empty items array', async () => {
    const mockResponse = {
      success: true,
      data: {
        costs: {},
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const request: BatchCostRequest = {
      items: [],
      warbandAbility: null,
    };

    const result = await apiClient.calculateBatchCosts(request);

    expect(result).toEqual({});
  });

  it('should handle API errors correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: 'Invalid item type',
        details: 'Item type must be weapon, equipment, or psychicPower',
      }),
    });

    const request: BatchCostRequest = {
      items: [
        { id: 'invalid-1', type: 'weapon', name: 'Unknown' },
      ],
      warbandAbility: null,
    };

    await expect(apiClient.calculateBatchCosts(request)).rejects.toThrow('Invalid item type');
  });

  it('should handle mixed item types in single request', async () => {
    const mockResponse = {
      success: true,
      data: {
        costs: {
          'w1': 5,
          'e1': 3,
          'p1': 8,
        },
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const request: BatchCostRequest = {
      items: [
        { id: 'w1', type: 'weapon', name: 'Axe', weaponType: 'close' },
        { id: 'e1', type: 'equipment', name: 'Armor' },
        { id: 'p1', type: 'psychicPower', name: 'Fireball' },
      ],
      warbandAbility: 'Mutants',
    };

    const result = await apiClient.calculateBatchCosts(request);

    expect(result).toEqual({
      'w1': 5,
      'e1': 3,
      'p1': 8,
    });
  });
});
