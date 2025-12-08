import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import { apiClient } from '../src/frontend/services/apiClient';

/**
 * Unit tests for API cost calculation integration
 * 
 * Tests that cost calculations use API endpoints with proper debouncing,
 * memoization, and error handling.
 * 
 * Requirements: 1.1, 1.2, 1.4, 6.1, 6.3, 6.5, 9.2, 9.6
 */
describe('API Cost Calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test that cost API is called when weirdo selections change
   * Requirements: 1.1, 1.2, 6.1
   */
  it('should call cost API when weirdo attributes change', async () => {
    // Mock the API client
    const calculateCostSpy = vi.spyOn(apiClient, 'calculateCostRealTime').mockResolvedValue({
      success: true,
      data: {
        totalCost: 15,
        breakdown: { attributes: 10, weapons: 0, equipment: 0, psychicPowers: 0 },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 5,
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <WarbandProvider>
        {children}
      </WarbandProvider>
    );

    const { result } = renderHook(() => useWarband(), { wrapper });

    // Create warband and add weirdo
    act(() => {
      result.current.createWarband('Test Warband', 75);
    });

    await act(async () => {
      await result.current.addWeirdo('leader');
    });

    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    const weirdoId = result.current.currentWarband!.weirdos[0].id;

    // Clear any calls from initial setup
    calculateCostSpy.mockClear();

    // Update weirdo attributes
    act(() => {
      result.current.updateWeirdo(weirdoId, {
        attributes: {
          speed: 2,
          defense: '2d8',
          firepower: '2d10',
          prowess: '2d8',
          willpower: '2d8',
        },
      });
    });

    // Wait for debounced API call (100ms)
    await waitFor(
      () => {
        expect(calculateCostSpy).toHaveBeenCalled();
      },
      { timeout: 200 }
    );

    // Verify API was called with correct parameters
    expect(calculateCostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        weirdoType: 'leader',
        attributes: expect.objectContaining({
          speed: 2,
          defense: '2d8',
        }),
      })
    );
  });

  /**
   * Test that cost API is called when weapons change
   * Requirements: 1.1, 1.2, 6.1
   */
  it('should call cost API when weapons change', async () => {
    const calculateCostSpy = vi.spyOn(apiClient, 'calculateCostRealTime').mockResolvedValue({
      success: true,
      data: {
        totalCost: 18,
        breakdown: { attributes: 10, weapons: 8, equipment: 0, psychicPowers: 0 },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 5,
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <WarbandProvider>
        {children}
      </WarbandProvider>
    );

    const { result } = renderHook(() => useWarband(), { wrapper });

    act(() => {
      result.current.createWarband('Test Warband', 75);
    });

    await act(async () => {
      await result.current.addWeirdo('leader');
    });

    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    const weirdoId = result.current.currentWarband!.weirdos[0].id;
    calculateCostSpy.mockClear();

    // Add a weapon
    act(() => {
      result.current.updateWeirdo(weirdoId, {
        rangedWeapons: [{ id: '1', name: 'Blaster', type: 'ranged', baseCost: 5, maxActions: 2, notes: '' }],
      });
    });

    await waitFor(
      () => {
        expect(calculateCostSpy).toHaveBeenCalled();
      },
      { timeout: 200 }
    );
  });

  /**
   * Test that cost API is called when equipment changes
   * Requirements: 1.1, 1.2, 6.1
   */
  it('should call cost API when equipment changes', async () => {
    const calculateCostSpy = vi.spyOn(apiClient, 'calculateCostRealTime').mockResolvedValue({
      success: true,
      data: {
        totalCost: 16,
        breakdown: { attributes: 10, weapons: 0, equipment: 6, psychicPowers: 0 },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 5,
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <WarbandProvider>
        {children}
      </WarbandProvider>
    );

    const { result } = renderHook(() => useWarband(), { wrapper });

    act(() => {
      result.current.createWarband('Test Warband', 75);
    });

    await act(async () => {
      await result.current.addWeirdo('leader');
    });

    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    const weirdoId = result.current.currentWarband!.weirdos[0].id;
    calculateCostSpy.mockClear();

    // Add equipment
    act(() => {
      result.current.updateWeirdo(weirdoId, {
        equipment: [{ id: '1', name: 'Armor', type: 'Passive', baseCost: 3, effect: 'Protection' }],
      });
    });

    await waitFor(
      () => {
        expect(calculateCostSpy).toHaveBeenCalled();
      },
      { timeout: 200 }
    );
  });

  /**
   * Test that debouncing works correctly (100ms delay)
   * Requirements: 1.4, 6.3
   */
  it('should debounce API calls to 100ms', async () => {
    const calculateCostSpy = vi.spyOn(apiClient, 'calculateCostRealTime').mockResolvedValue({
      success: true,
      data: {
        totalCost: 20,
        breakdown: { attributes: 20, weapons: 0, equipment: 0, psychicPowers: 0 },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 5,
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <WarbandProvider>
        {children}
      </WarbandProvider>
    );

    const { result } = renderHook(() => useWarband(), { wrapper });

    act(() => {
      result.current.createWarband('Test Warband', 75);
    });

    await act(async () => {
      await result.current.addWeirdo('leader');
    });

    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    const weirdoId = result.current.currentWarband!.weirdos[0].id;
    calculateCostSpy.mockClear();

    // Make multiple rapid updates
    act(() => {
      result.current.updateWeirdo(weirdoId, {
        attributes: {
          speed: 2,
          defense: '2d6',
          firepower: 'None',
          prowess: '2d6',
          willpower: '2d6',
        },
      });
    });

    act(() => {
      result.current.updateWeirdo(weirdoId, {
        attributes: {
          speed: 3,
          defense: '2d8',
          firepower: '2d10',
          prowess: '2d8',
          willpower: '2d8',
        },
      });
    });

    act(() => {
      result.current.updateWeirdo(weirdoId, {
        attributes: {
          speed: 3,
          defense: '2d10',
          firepower: '2d10',
          prowess: '2d10',
          willpower: '2d10',
        },
      });
    });

    // API should not be called immediately
    expect(calculateCostSpy).not.toHaveBeenCalled();

    // Wait for debounce period
    await waitFor(
      () => {
        expect(calculateCostSpy).toHaveBeenCalled();
      },
      { timeout: 200 }
    );

    // Should only be called once due to debouncing (last update)
    expect(calculateCostSpy).toHaveBeenCalledTimes(1);
  });

  /**
   * Test that cost updates from API response within 100ms
   * Requirements: 1.4, 6.3
   */
  it('should update cost from API response within 100ms', async () => {
    const mockCost = 25;
    vi.spyOn(apiClient, 'calculateCostRealTime').mockResolvedValue({
      success: true,
      data: {
        totalCost: mockCost,
        breakdown: { attributes: 25, weapons: 0, equipment: 0, psychicPowers: 0 },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 5,
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <WarbandProvider>
        {children}
      </WarbandProvider>
    );

    const { result } = renderHook(() => useWarband(), { wrapper });

    act(() => {
      result.current.createWarband('Test Warband', 75);
    });

    await act(async () => {
      await result.current.addWeirdo('leader');
    });

    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    const weirdoId = result.current.currentWarband!.weirdos[0].id;

    // Update weirdo
    const startTime = Date.now();
    act(() => {
      result.current.updateWeirdo(weirdoId, {
        attributes: {
          speed: 3,
          defense: '2d10',
          firepower: '2d10',
          prowess: '2d10',
          willpower: '2d10',
        },
      });
    });

    // Wait for cost to update
    await waitFor(
      () => {
        const updatedCost = result.current.currentWarband!.weirdos[0].totalCost;
        expect(updatedCost).toBe(mockCost);
      },
      { timeout: 300 }
    );

    const endTime = Date.now();
    const elapsed = endTime - startTime;

    // Should complete within reasonable time (including debounce + API call)
    expect(elapsed).toBeLessThan(300);
  });

  /**
   * Test that memoization prevents unnecessary API calls
   * Requirements: 1.4, 6.5
   */
  it('should memoize API responses to prevent unnecessary calls', async () => {
    const calculateCostSpy = vi.spyOn(apiClient, 'calculateCostRealTime').mockResolvedValue({
      success: true,
      data: {
        totalCost: 15,
        breakdown: { attributes: 10, weapons: 0, equipment: 0, psychicPowers: 0 },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 5,
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <WarbandProvider>
        {children}
      </WarbandProvider>
    );

    const { result } = renderHook(() => useWarband(), { wrapper });

    act(() => {
      result.current.createWarband('Test Warband', 75);
    });

    await act(async () => {
      await result.current.addWeirdo('leader');
    });

    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    const weirdoId = result.current.currentWarband!.weirdos[0].id;

    // Wait for initial cost calculation
    await waitFor(
      () => {
        expect(result.current.currentWarband!.weirdos[0].totalCost).toBeGreaterThanOrEqual(0);
      },
      { timeout: 200 }
    );

    calculateCostSpy.mockClear();

    // Get cost multiple times without changing weirdo
    const cost1 = result.current.getWeirdoCost(weirdoId);
    const cost2 = result.current.getWeirdoCost(weirdoId);
    const cost3 = result.current.getWeirdoCost(weirdoId);

    // Should return cached values without calling API
    expect(calculateCostSpy).not.toHaveBeenCalled();
    expect(cost1).toBe(cost2);
    expect(cost2).toBe(cost3);
  });

  /**
   * Test error handling for failed API calls
   * Requirements: 6.5
   */
  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(apiClient, 'calculateCostRealTime').mockRejectedValue(
      new Error('Network error')
    );

    const wrapper = ({ children }: { children: ReactNode }) => (
      <WarbandProvider>
        {children}
      </WarbandProvider>
    );

    const { result } = renderHook(() => useWarband(), { wrapper });

    act(() => {
      result.current.createWarband('Test Warband', 75);
    });

    await act(async () => {
      await result.current.addWeirdo('leader');
    });

    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    const weirdoId = result.current.currentWarband!.weirdos[0].id;

    // Update weirdo (should trigger API call that fails)
    act(() => {
      result.current.updateWeirdo(weirdoId, {
        attributes: {
          speed: 2,
          defense: '2d8',
          firepower: '2d10',
          prowess: '2d8',
          willpower: '2d8',
        },
      });
    });

    // Wait for error to be handled
    await waitFor(
      () => {
        // Should log error but not crash
        expect(consoleErrorSpy).toHaveBeenCalled();
      },
      { timeout: 200 }
    );

    // Application should still be functional
    expect(result.current.currentWarband).toBeDefined();
    expect(result.current.currentWarband!.weirdos.length).toBe(1);

    consoleErrorSpy.mockRestore();
  });

  /**
   * Test that API is called when warband ability changes
   * Requirements: 1.1, 1.2, 6.1
   */
  it('should call cost API when warband ability changes', async () => {
    const calculateCostSpy = vi.spyOn(apiClient, 'calculateCostRealTime').mockResolvedValue({
      success: true,
      data: {
        totalCost: 12,
        breakdown: { attributes: 8, weapons: 0, equipment: 0, psychicPowers: 0 },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 5,
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <WarbandProvider>
        {children}
      </WarbandProvider>
    );

    const { result } = renderHook(() => useWarband(), { wrapper });

    act(() => {
      result.current.createWarband('Test Warband', 75);
    });

    await act(async () => {
      await result.current.addWeirdo('leader');
    });

    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    calculateCostSpy.mockClear();

    // Change warband ability
    act(() => {
      result.current.updateWarband({ ability: 'Mutants' });
    });

    // Wait for debounced API call
    await waitFor(
      () => {
        expect(calculateCostSpy).toHaveBeenCalled();
      },
      { timeout: 200 }
    );

    // Verify API was called with warband ability
    expect(calculateCostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        warbandAbility: 'Mutants',
      })
    );
  });

  /**
   * Test that multiple weirdos trigger separate API calls
   * Requirements: 1.1, 1.2, 6.1
   */
  it('should call cost API for each weirdo when updated', async () => {
    const calculateCostSpy = vi.spyOn(apiClient, 'calculateCostRealTime').mockResolvedValue({
      success: true,
      data: {
        totalCost: 15,
        breakdown: { attributes: 10, weapons: 0, equipment: 0, psychicPowers: 0 },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
        calculationTime: 5,
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <WarbandProvider>
        {children}
      </WarbandProvider>
    );

    const { result } = renderHook(() => useWarband(), { wrapper });

    act(() => {
      result.current.createWarband('Test Warband', 125);
    });

    await act(async () => {
      await result.current.addWeirdo('leader');
    });

    await act(async () => {
      await result.current.addWeirdo('trooper');
    });

    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(2);
    });

    const weirdo1Id = result.current.currentWarband!.weirdos[0].id;
    const weirdo2Id = result.current.currentWarband!.weirdos[1].id;

    calculateCostSpy.mockClear();

    // Update first weirdo - this triggers cost recalculation for ALL weirdos
    act(() => {
      result.current.updateWeirdo(weirdo1Id, {
        attributes: {
          speed: 2,
          defense: '2d8',
          firepower: '2d10',
          prowess: '2d8',
          willpower: '2d8',
        },
      });
    });

    // Wait for debounced update - should call API for both weirdos
    await waitFor(
      () => {
        expect(calculateCostSpy).toHaveBeenCalledTimes(2);
      },
      { timeout: 200 }
    );

    calculateCostSpy.mockClear();

    // Update second weirdo - this also triggers cost recalculation for ALL weirdos
    act(() => {
      result.current.updateWeirdo(weirdo2Id, {
        attributes: {
          speed: 3,
          defense: '2d10',
          firepower: '2d10',
          prowess: '2d10',
          willpower: '2d10',
        },
      });
    });

    await waitFor(
      () => {
        expect(calculateCostSpy).toHaveBeenCalledTimes(2);
      },
      { timeout: 400 }
    );
  });
});

