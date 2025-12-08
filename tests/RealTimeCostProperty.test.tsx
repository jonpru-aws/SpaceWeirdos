import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import * as fc from 'fast-check';
import { WarbandProvider, useWarband } from '../src/frontend/contexts/WarbandContext';
import { apiClient } from '../src/frontend/services/apiClient';

/**
 * Property-based tests for real-time cost calculation
 * 
 * Tests debouncing, ability-triggered recalculation, and memoization properties.
 * Requirements: 7.1, 7.3, 7.4, 7.5
 */
describe('Real-time cost calculation properties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 24: Cost updates complete within 100ms**
   * **Validates: Requirements 7.1**
   * 
   * For any weirdo attribute change, the cost recalculation should complete within 100ms (debounced)
   */
  it('Property 24: Cost updates complete within 100ms', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 6 }), // speed
        fc.constantFrom('2d6', '3d6', '4d6', '5d6'), // defense
        async (speed, defense) => {
          // Mock API response
          vi.spyOn(apiClient, 'calculateCostRealTime').mockResolvedValue({
            success: true,
            data: {
              totalCost: 10,
              breakdown: {
                attributes: 10,
                weapons: 0,
                equipment: 0,
                psychicPowers: 0,
              },
            },
          });

          const wrapper = ({ children }: { children: ReactNode }) => (
            <WarbandProvider>{children}</WarbandProvider>
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
          const startTime = Date.now();

          // Update weirdo attributes
          act(() => {
            result.current.updateWeirdo(weirdoId, {
              attributes: {
                speed,
                defense,
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6',
              },
            });
          });

          // Wait for debounced cost update
          await waitFor(
            () => {
              const apiCalls = vi.mocked(apiClient.calculateCostRealTime).mock.calls;
              // Should have at least 2 calls: initial add + update
              expect(apiCalls.length).toBeGreaterThanOrEqual(2);
            },
            { timeout: 300 }
          );

          const endTime = Date.now();
          const elapsed = endTime - startTime;

          // Property: Cost update should complete within 100ms + buffer for test overhead
          expect(elapsed).toBeLessThan(250);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * **Feature: npm-package-upgrade-fixes, Property 25: Ability changes trigger cost recalculation**
   * **Validates: Requirements 7.3**
   * 
   * For any warband, changing the warband ability should trigger cost recalculation for all weirdos
   */
  it('Property 25: Ability changes trigger cost recalculation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('Mutants', 'Robots', 'Psykers', 'Zealots', 'Heavily Armed', 'Soldiers'),
        fc.constantFrom('Mutants', 'Robots', 'Psykers', 'Zealots', 'Heavily Armed', 'Soldiers'),
        async (ability1, ability2) => {
          // Skip if abilities are the same
          fc.pre(ability1 !== ability2);

          // Mock API response
          vi.spyOn(apiClient, 'calculateCostRealTime').mockResolvedValue({
            success: true,
            data: {
              totalCost: 10,
              breakdown: {
                attributes: 10,
                weapons: 0,
                equipment: 0,
                psychicPowers: 0,
              },
            },
          });

          const wrapper = ({ children }: { children: ReactNode }) => (
            <WarbandProvider>{children}</WarbandProvider>
          );

          const { result } = renderHook(() => useWarband(), { wrapper });

          // Create warband with first ability
          act(() => {
            result.current.createWarband('Test Warband', 75);
            result.current.updateWarband({ ability: ability1 });
          });

          await act(async () => {
            await result.current.addWeirdo('leader');
          });

          await waitFor(() => {
            expect(result.current.currentWarband?.weirdos.length).toBe(1);
          });

          // Clear mock calls from setup
          vi.mocked(apiClient.calculateCostRealTime).mockClear();

          // Change ability
          act(() => {
            result.current.updateWarband({ ability: ability2 });
          });

          // Wait for debounced cost recalculation
          await waitFor(
            () => {
              const apiCalls = vi.mocked(apiClient.calculateCostRealTime).mock.calls;
              // Property: Ability change should trigger API call for cost recalculation
              expect(apiCalls.length).toBeGreaterThanOrEqual(1);
            },
            { timeout: 300 }
          );

          // Verify the API was called with the new ability
          const lastCall = vi.mocked(apiClient.calculateCostRealTime).mock.calls.slice(-1)[0];
          expect(lastCall[0].warbandAbility).toBe(ability2);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * **Feature: npm-package-upgrade-fixes, Property 26: Rapid updates are debounced**
   * **Validates: Requirements 7.4**
   * 
   * For any sequence of rapid attribute changes, the system should debounce cost calculations
   * to prevent excessive API calls (only one calculation after changes stop)
   */
  it('Property 26: Rapid updates are debounced', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 1, max: 6 }), { minLength: 3, maxLength: 5 }),
        async (speeds) => {
          // Mock API response
          vi.spyOn(apiClient, 'calculateCostRealTime').mockResolvedValue({
            success: true,
            data: {
              totalCost: 10,
              breakdown: {
                attributes: 10,
                weapons: 0,
                equipment: 0,
                psychicPowers: 0,
              },
            },
          });

          const wrapper = ({ children }: { children: ReactNode }) => (
            <WarbandProvider>{children}</WarbandProvider>
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

          // Clear mock calls from setup
          vi.mocked(apiClient.calculateCostRealTime).mockClear();

          // Make rapid updates
          for (const speed of speeds) {
            act(() => {
              result.current.updateWeirdo(weirdoId, {
                attributes: {
                  speed,
                  defense: '2d6',
                  firepower: 'None',
                  prowess: '2d6',
                  willpower: '2d6',
                },
              });
            });
          }

          // Wait for debounced update to complete
          await waitFor(
            () => {
              const apiCalls = vi.mocked(apiClient.calculateCostRealTime).mock.calls;
              expect(apiCalls.length).toBeGreaterThanOrEqual(1);
            },
            { timeout: 300 }
          );

          // Property: Rapid updates should be debounced - should have significantly fewer API calls than updates
          const apiCalls = vi.mocked(apiClient.calculateCostRealTime).mock.calls;
          // With debouncing, we should have at most 2 calls (one for the first update, one for the final)
          // In practice, usually just 1 call after all updates settle
          expect(apiCalls.length).toBeLessThanOrEqual(2);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * **Feature: npm-package-upgrade-fixes, Property 27: Unchanged values use memoization**
   * **Validates: Requirements 7.5**
   * 
   * For any weirdo with unchanged attributes, requesting the cost should return
   * the cached value without triggering a new calculation
   */
  it('Property 27: Unchanged values use memoization', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 6 }), // speed
        fc.constantFrom('2d6', '3d6', '4d6', '5d6'), // defense
        async (speed, defense) => {
          // Mock API response
          vi.spyOn(apiClient, 'calculateCostRealTime').mockResolvedValue({
            success: true,
            data: {
              totalCost: 15,
              breakdown: {
                attributes: 15,
                weapons: 0,
                equipment: 0,
                psychicPowers: 0,
              },
            },
          });

          const wrapper = ({ children }: { children: ReactNode }) => (
            <WarbandProvider>{children}</WarbandProvider>
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

          // Update weirdo once
          act(() => {
            result.current.updateWeirdo(weirdoId, {
              attributes: {
                speed,
                defense,
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6',
              },
            });
          });

          // Wait for cost calculation
          await waitFor(
            () => {
              const cost = result.current.getWeirdoCost(weirdoId);
              expect(cost).toBeGreaterThan(0);
            },
            { timeout: 300 }
          );

          // Clear mock calls
          vi.mocked(apiClient.calculateCostRealTime).mockClear();

          // Get cost multiple times without changing weirdo
          const cost1 = result.current.getWeirdoCost(weirdoId);
          const cost2 = result.current.getWeirdoCost(weirdoId);
          const cost3 = result.current.getWeirdoCost(weirdoId);

          // Property: All calls should return the same memoized value
          expect(cost1).toBe(cost2);
          expect(cost2).toBe(cost3);

          // Property: No new API calls should be made for unchanged values
          const apiCalls = vi.mocked(apiClient.calculateCostRealTime).mock.calls;
          expect(apiCalls.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);
});
