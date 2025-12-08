import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as fc from 'fast-check';
import { WeirdoCostDisplay } from '../src/frontend/components/WeirdoCostDisplay';
import { Weirdo } from '../src/backend/models/types';
import * as apiClient from '../src/frontend/services/apiClient';
import { validWeirdoArb } from './testGenerators';

/**
 * Property-Based Tests for WeirdoCostDisplay Component
 * 
 * Tests cost breakdown toggle functionality and cost component display
 * using property-based testing to verify behavior across all valid inputs.
 */

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

describe('WeirdoCostDisplay Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Use shared generator for valid weirdos
  const weirdoArb = validWeirdoArb;

  // Generator for cost breakdown values
  const costBreakdownArb = fc.record({
    attributes: fc.integer({ min: 0, max: 20 }),
    weapons: fc.integer({ min: 0, max: 10 }),
    equipment: fc.integer({ min: 0, max: 10 }),
    psychicPowers: fc.integer({ min: 0, max: 10 }),
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 17: Cost breakdown toggle expands breakdown**
   * **Validates: Requirements 5.1**
   * 
   * Property: For any weirdo, clicking the cost breakdown toggle when collapsed 
   * should expand the breakdown to show cost components.
   */
  describe('Property 17: Cost breakdown toggle expands breakdown', () => {
    it('should expand breakdown when toggle is clicked', async () => {
      await fc.assert(
        fc.asyncProperty(
          weirdoArb,
          costBreakdownArb,
          async (weirdo, breakdown) => {
            // Setup mock API response
            vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
              success: true,
              data: {
                totalCost: weirdo.totalCost,
                breakdown,
                warnings: [],
                isApproachingLimit: false,
                isOverLimit: false,
                calculationTime: 5,
              },
            });

            const user = userEvent.setup();
            const { container, queryByText } = render(
              <WeirdoCostDisplay weirdo={weirdo as Weirdo} warbandAbility={null} />
            );

            try {
              // Initially, breakdown should not be visible
              expect(queryByText(/attributes:/i)).toBeNull();

              // Click the toggle button
              const toggleButton = container.querySelector('button[aria-label="Show cost breakdown"]');
              expect(toggleButton).not.toBeNull();
              await user.click(toggleButton!);

              // After clicking, breakdown should be visible
              await waitFor(() => {
                expect(queryByText(/attributes:/i)).not.toBeNull();
              }, { timeout: 3000 });
            } finally {
              cleanup();
            }
          }
        ),
        { numRuns: 10 } // Reduced runs to prevent timeout
      );
    }, 30000); // Increased timeout for async property test
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 18: Expanded breakdown shows all cost components**
   * **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6**
   * 
   * Property: For any weirdo with expanded cost breakdown, the display should show 
   * attributes, weapons, equipment, and psychic powers cost values.
   */
  describe('Property 18: Expanded breakdown shows all cost components', () => {
    it('should show all cost components when breakdown is expanded', async () => {
      await fc.assert(
        fc.asyncProperty(
          weirdoArb,
          costBreakdownArb,
          async (weirdo, breakdown) => {
            // Setup mock API response
            vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
              success: true,
              data: {
                totalCost: weirdo.totalCost,
                breakdown,
                warnings: [],
                isApproachingLimit: false,
                isOverLimit: false,
                calculationTime: 5,
              },
            });

            const user = userEvent.setup();
            const { container, getByRole, queryByText } = render(
              <WeirdoCostDisplay weirdo={weirdo as Weirdo} warbandAbility={null} />
            );

            try {
              // Expand breakdown
              const toggleButton = getByRole('button', { name: /show cost breakdown/i });
              await user.click(toggleButton);

              // Wait for breakdown to load
              await waitFor(() => {
                expect(queryByText(/attributes:/i)).not.toBeNull();
              }, { timeout: 3000 });

              // Verify all cost components are shown
              expect(queryByText(/attributes:/i)).not.toBeNull();
              expect(queryByText(/weapons:/i)).not.toBeNull();
              expect(queryByText(/equipment:/i)).not.toBeNull();
              expect(queryByText(/psychic powers:/i)).not.toBeNull();

              // Verify the breakdown section exists with all items
              const breakdownSection = container.querySelector('.weirdo-cost-display__breakdown');
              expect(breakdownSection).not.toBeNull();
              
              // Verify breakdown items exist
              const breakdownItems = container.querySelectorAll('.weirdo-cost-display__breakdown-item');
              expect(breakdownItems.length).toBeGreaterThanOrEqual(4); // At least 4 cost components
            } finally {
              cleanup();
            }
          }
        ),
        { numRuns: 10 } // Reduced runs to prevent timeout
      );
    }, 30000); // Increased timeout for async property test
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 19: Cost breakdown toggle collapses breakdown**
   * **Validates: Requirements 5.7**
   * 
   * Property: For any weirdo with expanded breakdown, clicking the toggle should 
   * collapse the breakdown to hide cost components.
   */
  describe('Property 19: Cost breakdown toggle collapses breakdown', () => {
    it('should collapse breakdown when toggle is clicked while expanded', async () => {
      await fc.assert(
        fc.asyncProperty(
          weirdoArb,
          costBreakdownArb,
          async (weirdo, breakdown) => {
            // Setup mock API response
            vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
              success: true,
              data: {
                totalCost: weirdo.totalCost,
                breakdown,
                warnings: [],
                isApproachingLimit: false,
                isOverLimit: false,
                calculationTime: 5,
              },
            });

            const user = userEvent.setup();
            const { container, queryByText } = render(
              <WeirdoCostDisplay weirdo={weirdo as Weirdo} warbandAbility={null} />
            );

            try {
              // Expand breakdown first
              const showButton = container.querySelector('button[aria-label="Show cost breakdown"]');
              expect(showButton).not.toBeNull();
              await user.click(showButton!);

              // Wait for breakdown to appear
              await waitFor(() => {
                expect(queryByText(/attributes:/i)).not.toBeNull();
              }, { timeout: 3000 });

              // Click again to collapse - the button is the same element, just with updated aria-label
              const hideButton = await waitFor(() => {
                const btn = container.querySelector('button[aria-label="Hide cost breakdown"]');
                if (!btn) throw new Error('Hide button not found');
                return btn;
              }, { timeout: 3000 });

              await user.click(hideButton);

              // Wait for breakdown to be hidden
              await waitFor(() => {
                expect(queryByText(/attributes:/i)).toBeNull();
              }, { timeout: 3000 });
            } finally {
              cleanup();
            }
          }
        ),
        { numRuns: 10 } // Reduced runs to prevent timeout
      );
    }, 30000); // Increased timeout for async property test
  });
});
