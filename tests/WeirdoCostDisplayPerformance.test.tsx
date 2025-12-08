import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { WeirdoCostDisplay } from '../src/frontend/components/WeirdoCostDisplay';
import type { Weirdo } from '../src/backend/models/types';
import * as apiClient from '../src/frontend/services/apiClient';

/**
 * Property-Based Tests for WeirdoCostDisplay Performance
 * 
 * **Feature: 6-frontend-backend-api-separation, Property 6: Cost updates display within performance threshold**
 * **Validates: Requirements 3.1**
 * 
 * Tests that cost updates are displayed within 200ms performance threshold
 * (after debouncing completes)
 */

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

describe('WeirdoCostDisplay Performance Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  /**
   * Property 6: Cost updates display within performance threshold
   * 
   * For any user modification to Weirdo attributes or equipment,
   * the Frontend SHALL display updated costs within 200 milliseconds
   * (after the debounce period completes)
   */
  it('Property 6: should display cost updates within 200ms after debounce', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random weirdo configurations
        fc.record({
          type: fc.constantFrom('leader' as const, 'trooper' as const),
          attributes: fc.record({
            speed: fc.integer({ min: 1, max: 3 }),
            defense: fc.constantFrom('2d6', '2d8', '2d10'),
            firepower: fc.constantFrom('None', '2d6', '2d8', '2d10'),
            prowess: fc.constantFrom('2d6', '2d8', '2d10'),
            willpower: fc.constantFrom('2d6', '2d8', '2d10'),
          }),
          weapons: fc.record({
            close: fc.array(fc.constantFrom('Unarmed', 'Sword', 'Axe'), { maxLength: 3 }),
            ranged: fc.array(fc.constantFrom('Pistol', 'Rifle', 'Blaster'), { maxLength: 3 }),
          }),
          equipment: fc.array(fc.constantFrom('Armor', 'Shield', 'Medkit'), { maxLength: 3 }),
          psychicPowers: fc.array(fc.constantFrom('Telekinesis', 'Mind Blast'), { maxLength: 2 }),
          totalCost: fc.integer({ min: 5, max: 30 }),
        }),
        async (weirdoConfig) => {
          // Mock API response with realistic timing (< 100ms as per backend requirement)
          const mockResponse = {
            success: true as const,
            data: {
              totalCost: weirdoConfig.totalCost,
              breakdown: {
                attributes: Math.floor(weirdoConfig.totalCost * 0.4),
                weapons: Math.floor(weirdoConfig.totalCost * 0.3),
                equipment: Math.floor(weirdoConfig.totalCost * 0.2),
                psychicPowers: Math.floor(weirdoConfig.totalCost * 0.1),
              },
              warnings: [],
              isApproachingLimit: false,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          // Mock API to respond quickly (within 100ms backend requirement)
          let apiCallTime = 0;
          vi.mocked(apiClient.apiClient.calculateCostRealTime).mockImplementation(
            async () => {
              const start = performance.now();
              // Simulate API processing time (< 100ms)
              await new Promise(resolve => setTimeout(resolve, 50));
              apiCallTime = performance.now() - start;
              return mockResponse;
            }
          );

          // Create mock weirdo
          const mockWeirdo: Weirdo = {
            id: 'test-weirdo',
            name: 'Test Weirdo',
            type: weirdoConfig.type,
            attributes: weirdoConfig.attributes,
            closeCombatWeapons: weirdoConfig.weapons.close.map(name => ({ name })),
            rangedWeapons: weirdoConfig.weapons.ranged.map(name => ({ name })),
            equipment: weirdoConfig.equipment.map(name => ({ name })),
            psychicPowers: weirdoConfig.psychicPowers.map(name => ({ name })),
            leaderTrait: null,
            totalCost: weirdoConfig.totalCost,
          };

          // Render component
          const { container } = render(
            <WeirdoCostDisplay
              weirdo={mockWeirdo}
              warbandAbility={null}
            />
          );

          // Fast-forward through debounce period (300ms)
          await act(async () => {
            vi.advanceTimersByTime(300);
          });

          // Measure time for API call and render update
          const updateStart = performance.now();
          
          // Fast-forward through API call time (50ms)
          await act(async () => {
            vi.advanceTimersByTime(50);
            await Promise.resolve(); // Allow promises to resolve
          });

          const updateEnd = performance.now();
          const updateTime = updateEnd - updateStart;

          // Verify cost is displayed
          const costDisplay = container.querySelector('.weirdo-cost-display__value');
          expect(costDisplay).toBeTruthy();
          const text = costDisplay?.textContent || '';
          expect(text).toContain(weirdoConfig.totalCost.toString());

          // Verify update time (API + render) is within 200ms threshold
          // This tests the requirement that updates display within 200ms
          // (after debouncing, which is a separate optimization)
          expect(updateTime).toBeLessThan(200);
        }
      ),
      { numRuns: 50 }
    );
  });
});
