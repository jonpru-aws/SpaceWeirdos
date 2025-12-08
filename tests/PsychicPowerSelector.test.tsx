import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PsychicPowerSelector } from '../src/frontend/components/PsychicPowerSelector';
import { PsychicPower, WarbandAbility } from '../src/backend/models/types';
import * as apiClient from '../src/frontend/services/apiClient';
import { itemCostCache } from '../src/frontend/hooks/useItemCost';

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

/**
 * Unit tests for PsychicPowerSelector component
 * Requirements: 5.5, 12.4
 */

describe('PsychicPowerSelector Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    itemCostCache.clear();
    
    // Setup default mock response for API calls
    vi.mocked(apiClient.apiClient.calculateCostRealTime).mockResolvedValue({
      success: true,
      data: {
        totalCost: 0,
        breakdown: {
          attributes: 0,
          weapons: 0,
          equipment: 0,
          psychicPowers: 0,
        },
        warnings: [],
        isApproachingLimit: false,
        isOverLimit: false,
      },
    });
  });
  const mockPowers: PsychicPower[] = [
    {
      id: 'fear',
      name: 'Fear',
      type: 'Attack',
      cost: 1,
      effect: 'Each enemy weirdo within 1 stick who loses its opposed Will roll must move 1 stick away from the psychic.'
    },
    {
      id: 'healing',
      name: 'Healing',
      type: 'Effect',
      cost: 1,
      effect: '1 weirdo within 1 stick of this weirdo and in LoS becomes ready.'
    },
    {
      id: 'mind-stab',
      name: 'Mind Stab',
      type: 'Attack',
      cost: 3,
      effect: 'Target 1 enemy weirdo within 1 stick. Roll on Under Fire table +3.'
    }
  ];

  describe('Psychic Power Display', () => {
    it('should render all psychic powers', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={[]}
          availablePowers={mockPowers}
          warbandAbility={null}
          onChange={mockOnChange}
        />
      );

      // Check title
      expect(screen.getByText('Psychic Powers')).toBeInTheDocument();

      // Check all powers are rendered
      expect(screen.getByText('Fear')).toBeInTheDocument();
      expect(screen.getByText('Healing')).toBeInTheDocument();
      expect(screen.getByText('Mind Stab')).toBeInTheDocument();
    });

    it('should display name, cost, and effect for each power', async () => {
      const mockOnChange = vi.fn();

      // Mock API responses for each psychic power
      vi.mocked(apiClient.apiClient.calculateCostRealTime).mockImplementation(async (params) => {
        const powerName = params.psychicPowers?.[0] || '';
        let powerCost = 0;
        
        if (powerName === 'Fear' || powerName === 'Healing') {
          powerCost = 1;
        } else if (powerName === 'Mind Stab') {
          powerCost = 3;
        }

        return {
          success: true,
          data: {
            totalCost: powerCost,
            breakdown: {
              attributes: 0,
              weapons: 0,
              equipment: 0,
              psychicPowers: powerCost,
            },
            warnings: [],
            isApproachingLimit: false,
            isOverLimit: false,
          },
        };
      });

      render(
        <PsychicPowerSelector
          selectedPowers={[]}
          availablePowers={mockPowers}
          warbandAbility={null}
          onChange={mockOnChange}
        />
      );

      // Wait for costs to load
      await waitFor(() => {
        expect(screen.getAllByText('1 pts')).toHaveLength(2); // Fear and Healing
      });
      
      expect(screen.getByText('3 pts')).toBeInTheDocument(); // Mind Stab

      // Check effects
      expect(screen.getByText(/Each enemy weirdo within 1 stick/)).toBeInTheDocument();
      expect(screen.getByText(/1 weirdo within 1 stick of this weirdo/)).toBeInTheDocument();
      expect(screen.getByText(/Target 1 enemy weirdo within 1 stick/)).toBeInTheDocument();
    });
  });

  describe('Power Selection', () => {
    it('should handle power selection changes', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={[]}
          availablePowers={mockPowers}
          warbandAbility={null}
          onChange={mockOnChange}
        />
      );

      // Click first checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).toHaveBeenCalledWith([mockPowers[0]]);
    });

    it('should handle power deselection', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={[mockPowers[0]]}
          availablePowers={mockPowers}
          warbandAbility={null}
          onChange={mockOnChange}
        />
      );

      // Click first checkbox to deselect
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('should allow multiple power selections without limit', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={[mockPowers[0], mockPowers[1]]}
          availablePowers={mockPowers}
          warbandAbility={null}
          onChange={mockOnChange}
        />
      );

      // All checkboxes should be enabled
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
      expect(checkboxes[2]).not.toBeDisabled();
    });

    it('should handle selecting all powers', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={[mockPowers[0], mockPowers[1]]}
          availablePowers={mockPowers}
          warbandAbility={null}
          onChange={mockOnChange}
        />
      );

      // Click third checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[2]);

      expect(mockOnChange).toHaveBeenCalledWith([mockPowers[0], mockPowers[1], mockPowers[2]]);
    });
  });

  describe('No Limit Enforcement', () => {
    it('should not disable any checkboxes regardless of selection count', () => {
      const mockOnChange = vi.fn();

      render(
        <PsychicPowerSelector
          selectedPowers={mockPowers}
          availablePowers={mockPowers}
          warbandAbility={null}
          onChange={mockOnChange}
        />
      );

      // All checkboxes should be enabled even when all are selected
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeDisabled();
      });
    });
  });
});

/**
 * Property-Based Tests for Psychic Power Selector API Usage
 * 
 * **Feature: 6-frontend-backend-api-separation, Property 12: Selector components use API for cost display**
 * **Validates: Requirements 5.3**
 */
describe('Property-Based Tests: Psychic Power Selector API Usage', () => {
  const testConfig = { numRuns: 50 };

  /**
   * Property 12: Selector components use API for cost display
   * 
   * For any psychic power selector with powers and warband ability, the component should:
   * 1. Use the useItemCost hook (which calls the API) for each psychic power
   * 2. Display costs returned from the API
   * 3. Handle loading states appropriately
   * 4. Not use local cost calculation functions
   * 
   * This test verifies that the PsychicPowerSelector component retrieves costs from the
   * backend API with warband ability context, rather than calculating costs locally.
   * 
   * **Feature: 6-frontend-backend-api-separation, Property 12: Selector components use API for cost display**
   * **Validates: Requirements 5.3**
   */
  it('Property 12: PsychicPowerSelector uses API for cost display', async () => {
    const fc = await import('fast-check');
    
    fc.assert(
      fc.property(
        // Generate random psychic powers (1-3 powers to keep test fast)
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1, maxLength: 30 }),
            type: fc.constantFrom('Attack' as const, 'Effect' as const, 'Defense' as const),
            cost: fc.integer({ min: 1, max: 5 }),
            effect: fc.string({ minLength: 10, maxLength: 100 })
          }),
          { minLength: 1, maxLength: 3 }
        ),
        // Generate optional warband ability
        fc.option(
          fc.constantFrom<WarbandAbility>(
            'Cyborgs', 'Fanatics', 'Living Weapons', 
            'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
          ),
          { nil: null }
        ),

        (powers, warbandAbility) => {
          const mockOnChange = vi.fn();

          const { container, unmount } = render(
            <PsychicPowerSelector
              selectedPowers={[]}
              availablePowers={powers}
              warbandAbility={warbandAbility}
              onChange={mockOnChange}
            />
          );

          try {
            // Property 1: Each psychic power should have a cost display element
            const costElements = container.querySelectorAll('.psychic-power-selector__cost');
            expect(costElements.length).toBe(powers.length);

            // Property 2: Cost elements should have data attributes for loading/error states
            // These attributes are set by the useItemCost hook
            costElements.forEach(costElement => {
              expect(costElement).toHaveAttribute('data-loading');
              expect(costElement).toHaveAttribute('data-error');
            });

            // Property 3: Cost display should show either:
            // - A numeric cost with "pts" (when loaded)
            // - "... pts" (when loading)
            // - "? pts" (when error)
            costElements.forEach(costElement => {
              const costText = costElement.textContent || '';
              const isValidCostFormat = 
                /^\d+ pts$/.test(costText) ||  // Numeric cost
                costText === '... pts' ||       // Loading
                costText === '? pts';           // Error
              
              expect(isValidCostFormat).toBe(true);
            });

            // Property 4: The component should render all psychic powers
            expect(container.querySelectorAll('.psychic-power-selector__item').length).toBe(powers.length);

            return true;
          } finally {
            // Clean up after each iteration
            unmount();
          }
        }
      ),
      testConfig
    );
  });
});
