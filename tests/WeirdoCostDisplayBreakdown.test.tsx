import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as fc from 'fast-check';
import { WeirdoCostDisplay } from '../src/frontend/components/WeirdoCostDisplay';
import type { Weirdo } from '../src/backend/models/types';
import * as apiClient from '../src/frontend/services/apiClient';

/**
 * Property-Based Tests for WeirdoCostDisplay Cost Breakdown
 * 
 * **Feature: 6-frontend-backend-api-separation, Property 7: Cost breakdown contains all categories**
 * **Validates: Requirements 3.2**
 * 
 * Tests that cost breakdown displays all required categories
 */

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

describe('WeirdoCostDisplay Breakdown Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  /**
   * Property 7: Cost breakdown contains all categories
   * 
   * For any cost calculation result, the breakdown SHALL include values
   * for attributes, weapons, equipment, and psychicPowers categories
   */
  it('Property 7: should display all cost categories in breakdown', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random weirdo configurations with varied costs
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
          // Generate random breakdown values
          breakdown: fc.record({
            attributes: fc.integer({ min: 0, max: 15 }),
            weapons: fc.integer({ min: 0, max: 10 }),
            equipment: fc.integer({ min: 0, max: 8 }),
            psychicPowers: fc.integer({ min: 0, max: 6 }),
          }),
        }),
        async (weirdoConfig) => {
          // Calculate total cost from breakdown
          const totalCost = 
            weirdoConfig.breakdown.attributes +
            weirdoConfig.breakdown.weapons +
            weirdoConfig.breakdown.equipment +
            weirdoConfig.breakdown.psychicPowers;

          // Mock API response with the generated breakdown
          const mockResponse = {
            success: true as const,
            data: {
              totalCost,
              breakdown: weirdoConfig.breakdown,
              warnings: [],
              isApproachingLimit: false,
              isOverLimit: false,
              calculationTime: 50,
            },
          };

          vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue(mockResponse);

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
            totalCost,
          };

          // Render component
          const { container, getByText } = render(
            <WeirdoCostDisplay
              weirdo={mockWeirdo}
              warbandAbility={null}
            />
          );

          // Fast-forward through debounce period to load initial cost
          await act(async () => {
            vi.advanceTimersByTime(350);
            await Promise.resolve();
          });

          // Expand the breakdown by clicking the toggle button
          const toggleButton = container.querySelector('.weirdo-cost-display__toggle');
          expect(toggleButton).toBeTruthy();
          
          await act(async () => {
            toggleButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            vi.advanceTimersByTime(100);
            await Promise.resolve();
          });

          // Verify all four categories are present in the breakdown
          const breakdownSection = container.querySelector('.weirdo-cost-display__breakdown');
          expect(breakdownSection).toBeTruthy();

          // Verify each category displays its cost value within the breakdown section
          const breakdownItems = container.querySelectorAll('.weirdo-cost-display__breakdown-item');
          expect(breakdownItems.length).toBeGreaterThanOrEqual(4); // At least 4 categories (+ total)

          // Check that all four required categories are present
          const breakdownText = breakdownSection?.textContent || '';
          expect(breakdownText).toContain('Attributes:');
          expect(breakdownText).toContain('Weapons:');
          expect(breakdownText).toContain('Equipment:');
          expect(breakdownText).toContain('Psychic Powers:');
          expect(breakdownText).toContain('Total:');

          // Verify the breakdown values match the API response
          expect(breakdownText).toContain(`${weirdoConfig.breakdown.attributes} pts`);
          expect(breakdownText).toContain(`${weirdoConfig.breakdown.weapons} pts`);
          expect(breakdownText).toContain(`${weirdoConfig.breakdown.equipment} pts`);
          expect(breakdownText).toContain(`${weirdoConfig.breakdown.psychicPowers} pts`);
          expect(breakdownText).toContain(`${totalCost} pts`);
        }
      ),
      { numRuns: 50 }
    );
  });
});
