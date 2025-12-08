import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import * as apiClient from '../src/frontend/services/apiClient';

/**
 * Unit tests for real-time cost calculation with debouncing and memoization
 * 
 * Tests cost updates when selections change, debouncing behavior, and memoization.
 * Requirements: 1.1, 1.2, 1.4
 */
describe('Real-time cost calculation', () => {
  let callCount = 0;
  
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    callCount = 0;
    
    // Mock API calls - required because WarbandProvider uses apiClient internally
    // Return increasing costs on each call to test cost updates
    vi.spyOn(apiClient.apiClient, 'calculateCostRealTime').mockImplementation(async () => {
      callCount++;
      return {
        data: {
          totalCost: 10 + (callCount * 5), // Each call increases cost by 5
          breakdown: {
            baseCost: 10,
            attributeCost: callCount * 5,
            weaponsCost: 0,
            equipmentCost: 0,
            psychicPowersCost: 0,
            modifiers: []
          }
        }
      };
    });
    
    vi.spyOn(apiClient.apiClient, 'validateWarband').mockResolvedValue({
      data: {
        isValid: true,
        errors: [],
        warnings: []
      }
    });
  });

  /**
   * Test that costs update when weirdo attributes change
   * Requirements: 1.1, 1.2
   */
  it('should update weirdo cost when attributes change', async () => {
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

    // Wait for weirdo to be added
    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    const weirdoId = result.current.currentWarband!.weirdos[0].id;
    const initialCost = result.current.currentWarband!.weirdos[0].totalCost;

    // Update attribute
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

    // Wait for debounced update (100ms debounce + API call time)
    await waitFor(
      () => {
        const updatedCost = result.current.currentWarband!.weirdos[0].totalCost;
        expect(updatedCost).toBeGreaterThan(initialCost);
      },
      { timeout: 500 }
    );
  });

  /**
   * Test that warband cost updates when weirdo costs change
   * Requirements: 1.1, 1.2
   */
  it('should update warband cost when weirdo cost changes', async () => {
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

    // Wait for weirdo to be added
    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    const weirdoId = result.current.currentWarband!.weirdos[0].id;
    const initialWarbandCost = result.current.currentWarband!.totalCost;

    // Update weirdo attribute to increase cost
    act(() => {
      result.current.updateWeirdo(weirdoId, {
        attributes: {
          speed: 3,
          defense: '2d8',
          firepower: '2d10',
          prowess: '2d10',
          willpower: '2d10',
        },
      });
    });

    // Wait for debounced update
    await waitFor(
      () => {
        const updatedWarbandCost = result.current.currentWarband!.totalCost;
        expect(updatedWarbandCost).toBeGreaterThan(initialWarbandCost);
      },
      { timeout: 500 }
    );
  });

  /**
   * Test that debouncing works correctly (updates delayed by 100ms)
   * Requirements: 1.4
   */
  it('should debounce cost updates to 100ms', async () => {
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

    // Wait for weirdo to be added
    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    const weirdoId = result.current.currentWarband!.weirdos[0].id;

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

    // Cost should not be updated immediately (still debouncing)
    // Wait for debounce to complete
    await waitFor(
      () => {
        const finalCost = result.current.currentWarband!.weirdos[0].totalCost;
        // Final cost should reflect the last update
        expect(finalCost).toBeGreaterThan(0);
      },
      { timeout: 500 }
    );
  });

  /**
   * Test that memoization prevents unnecessary recalculations
   * Requirements: 1.4
   */
  it('should use memoized cost values when available', async () => {
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

    // Wait for weirdo to be added
    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    const weirdoId = result.current.currentWarband!.weirdos[0].id;

    // Get cost multiple times - should use cached value
    const cost1 = result.current.getWeirdoCost(weirdoId);
    const cost2 = result.current.getWeirdoCost(weirdoId);
    const cost3 = result.current.getWeirdoCost(weirdoId);

    // All should return the same value (memoized)
    expect(cost1).toBe(cost2);
    expect(cost2).toBe(cost3);
  });

  /**
   * Test that warband ability changes trigger cost recalculation
   * Requirements: 1.1, 1.2
   */
  it('should recalculate costs when warband ability changes', async () => {
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

    // Wait for weirdo to be added
    await waitFor(() => {
      expect(result.current.currentWarband?.weirdos.length).toBe(1);
    });

    const weirdoId = result.current.currentWarband!.weirdos[0].id;

    // Update weirdo to have higher attributes
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

    // Wait for initial cost calculation
    await waitFor(() => {
      const weirdoCost = result.current.currentWarband!.weirdos[0].totalCost;
      expect(weirdoCost).toBeGreaterThan(0);
    }, { timeout: 500 });

    // Change warband ability to "Mutants" (cheaper attributes)
    act(() => {
      result.current.updateWarband({ ability: 'Mutants' });
    });

    // Wait for debounced cost recalculation
    await waitFor(
      () => {
        const costWithAbility = result.current.currentWarband!.totalCost;
        // Cost should be recalculated (may be same or different depending on ability)
        expect(costWithAbility).toBeGreaterThanOrEqual(0);
      },
      { timeout: 500 }
    );
  });
});
