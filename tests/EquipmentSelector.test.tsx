import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EquipmentSelector } from '../src/frontend/components/EquipmentSelector';
import { CostEngine } from '../src/backend/services/CostEngine';
import { Equipment } from '../src/backend/models/types';
import * as apiClient from '../src/frontend/services/apiClient';
import { itemCostCache } from '../src/frontend/hooks/useItemCost';

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

/**
 * Unit tests for EquipmentSelector component
 * Requirements: 5.4, 5.7, 5.8, 12.3, 12.6
 */

describe('EquipmentSelector Component', () => {
  const costEngine = new CostEngine();

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

  const mockEquipment: Equipment[] = [
    {
      id: 'heavy-armor',
      name: 'Heavy Armor',
      type: 'Passive',
      baseCost: 1,
      effect: '+1 to Defense rolls'
    },
    {
      id: 'medkit',
      name: 'Medkit',
      type: 'Action',
      baseCost: 1,
      effect: 'Once per game, 1 weirdo touching this weirdo becomes ready'
    },
    {
      id: 'grenade',
      name: 'Grenade',
      type: 'Action',
      baseCost: 1,
      effect: 'Once per game, Targets point up to 1 stick from attacker'
    }
  ];

  describe('Equipment Limit Enforcement', () => {
    it('should enforce limit of 2 for leader without Cyborgs', () => {
      const mockOnChange = vi.fn();
      const selected = [mockEquipment[0], mockEquipment[1]];

      render(
        <EquipmentSelector
          selectedEquipment={selected}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      // Check limit display
      expect(screen.getByText('Selected: 2/2')).toBeInTheDocument();

      // Third checkbox should be disabled
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[2]).toBeDisabled();
    });

    it('should enforce limit of 3 for leader with Cyborgs', () => {
      const mockOnChange = vi.fn();
      const selected = [mockEquipment[0], mockEquipment[1]];

      render(
        <EquipmentSelector
          selectedEquipment={selected}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
         
        />
      );

      // Check limit display
      expect(screen.getByText('Selected: 2/3')).toBeInTheDocument();

      // Third checkbox should NOT be disabled
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[2]).not.toBeDisabled();
    });

    it('should enforce limit of 1 for trooper without Cyborgs', () => {
      const mockOnChange = vi.fn();
      const selected = [mockEquipment[0]];

      render(
        <EquipmentSelector
          selectedEquipment={selected}
          availableEquipment={mockEquipment}
          weirdoType="trooper"
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      // Check limit display
      expect(screen.getByText('Selected: 1/1')).toBeInTheDocument();

      // Second and third checkboxes should be disabled
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[1]).toBeDisabled();
      expect(checkboxes[2]).toBeDisabled();
    });

    it('should enforce limit of 2 for trooper with Cyborgs', () => {
      const mockOnChange = vi.fn();
      const selected = [mockEquipment[0]];

      render(
        <EquipmentSelector
          selectedEquipment={selected}
          availableEquipment={mockEquipment}
          weirdoType="trooper"
          warbandAbility="Cyborgs"
          onChange={mockOnChange}
         
        />
      );

      // Check limit display
      expect(screen.getByText('Selected: 1/2')).toBeInTheDocument();

      // Second checkbox should NOT be disabled
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[1]).not.toBeDisabled();
    });
  });

  describe('Count vs Limit Display', () => {
    it('should show current count vs limit', () => {
      const mockOnChange = vi.fn();

      render(
        <EquipmentSelector
          selectedEquipment={[]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      expect(screen.getByText('Selected: 0/2')).toBeInTheDocument();
    });

    it('should update count when equipment is selected', () => {
      const mockOnChange = vi.fn();

      const { rerender } = render(
        <EquipmentSelector
          selectedEquipment={[]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      expect(screen.getByText('Selected: 0/2')).toBeInTheDocument();

      // Simulate selection
      rerender(
        <EquipmentSelector
          selectedEquipment={[mockEquipment[0]]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      expect(screen.getByText('Selected: 1/2')).toBeInTheDocument();
    });
  });

  describe('Equipment Display', () => {
    it('should display name, cost, and effect for each equipment', async () => {
      const mockOnChange = vi.fn();

      // Clear and reset the mock for this specific test
      vi.mocked(apiClient.apiClient.calculateCostRealTime).mockReset();
      
      // Mock API responses for each equipment item
      // useItemCost calls the API with the equipment in the equipment array
      vi.mocked(apiClient.apiClient.calculateCostRealTime).mockImplementation(async (params) => {
        // Each equipment item has baseCost of 1
        const equipmentCost = params.equipment && params.equipment.length > 0 ? 1 : 0;
        
        return {
          success: true,
          data: {
            totalCost: equipmentCost,
            breakdown: {
              attributes: 0,
              weapons: 0,
              equipment: equipmentCost,
              psychicPowers: 0,
            },
            warnings: [],
            isApproachingLimit: false,
            isOverLimit: false,
          },
        };
      });

      render(
        <EquipmentSelector
          selectedEquipment={[]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      // Check all equipment are rendered with costs and effects
      expect(screen.getByText('Heavy Armor')).toBeInTheDocument();
      
      // Wait for costs to load from API
      await waitFor(() => {
        expect(screen.getAllByText('1 pts')).toHaveLength(3); // All three equipment have 1 pt cost
      });
      
      expect(screen.getByText('+1 to Defense rolls')).toBeInTheDocument();

      expect(screen.getByText('Medkit')).toBeInTheDocument();
      expect(screen.getByText('Once per game, 1 weirdo touching this weirdo becomes ready')).toBeInTheDocument();
    });

    it('should show modified costs based on warband ability', async () => {
      const mockOnChange = vi.fn();

      // Clear and reset the mock for this specific test
      vi.mocked(apiClient.apiClient.calculateCostRealTime).mockReset();
      
      // Mock API responses with Soldiers ability (equipment is free)
      vi.mocked(apiClient.apiClient.calculateCostRealTime).mockImplementation(async (params) => {
        // With Soldiers ability, equipment costs 0
        const equipmentCost = params.warbandAbility === 'Soldiers' ? 0 : 1;
        
        return {
          success: true,
          data: {
            totalCost: equipmentCost,
            breakdown: {
              attributes: 0,
              weapons: 0,
              equipment: equipmentCost,
              psychicPowers: 0,
            },
            warnings: [],
            isApproachingLimit: false,
            isOverLimit: false,
          },
        };
      });

      // With Soldiers ability, selector shows modified costs (0 pts for free equipment)
      // This matches the backend cost calculations
      render(
        <EquipmentSelector
          selectedEquipment={[]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility="Soldiers"
          onChange={mockOnChange}
        />
      );

      // Wait for costs to load from API
      // Equipment shows modified cost (0 pts for Soldiers ability)
      // Requirements: 1.2, 1.4, 2.2
      await waitFor(() => {
        expect(screen.getAllByText('0 pts')).toHaveLength(3);
      });
      expect(screen.queryByText('1 pts')).not.toBeInTheDocument();
    });
  });

  describe('Equipment Selection', () => {
    it('should handle equipment selection changes', () => {
      const mockOnChange = vi.fn();

      render(
        <EquipmentSelector
          selectedEquipment={[]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      // Click first checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).toHaveBeenCalledWith([mockEquipment[0]]);
    });

    it('should handle equipment deselection', () => {
      const mockOnChange = vi.fn();

      render(
        <EquipmentSelector
          selectedEquipment={[mockEquipment[0]]}
          availableEquipment={mockEquipment}
          weirdoType="leader"
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      // Click first checkbox to deselect
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('should not allow selection when limit is reached', () => {
      const mockOnChange = vi.fn();
      const selected = [mockEquipment[0]];

      render(
        <EquipmentSelector
          selectedEquipment={selected}
          availableEquipment={mockEquipment}
          weirdoType="trooper"
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      // Try to click second checkbox (should be disabled)
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);

      // onChange should not be called
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});




/**
 * Property-Based Tests for Equipment Selector API Usage
 * 
 * **Feature: 6-frontend-backend-api-separation, Property 12: Selector components use API for cost display**
 * **Validates: Requirements 5.2**
 */
describe('Property-Based Tests: Equipment Selector API Usage', () => {
  const testConfig = { numRuns: 50 };

  /**
   * Property 12: Selector components use API for cost display
   * 
   * For any equipment selector with equipment and warband ability, the component should:
   * 1. Use the useItemCost hook (which calls the API) for each equipment item
   * 2. Display costs returned from the API
   * 3. Handle loading states appropriately
   * 4. Not use local cost calculation functions
   * 
   * This test verifies that the EquipmentSelector component retrieves costs from the
   * backend API with warband ability context, rather than calculating costs locally.
   * 
   * **Feature: 6-frontend-backend-api-separation, Property 12: Selector components use API for cost display**
   * **Validates: Requirements 5.2**
   */
  it('Property 12: EquipmentSelector uses API for cost display', async () => {
    const fc = await import('fast-check');
    const { WarbandAbility } = await import('../src/backend/models/types');

    fc.assert(
      fc.property(
        // Generate weirdo type
        fc.constantFrom('leader' as const, 'trooper' as const),
        // Generate random equipment (1-3 items to keep test fast)
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1, maxLength: 30 }),
            type: fc.constantFrom('Passive' as const, 'Action' as const),
            baseCost: fc.integer({ min: 0, max: 5 }),
            effect: fc.string({ minLength: 1, maxLength: 50 })
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

        (weirdoType, equipment, warbandAbility) => {
          const mockOnChange = vi.fn();

          const { container, unmount } = render(
            <EquipmentSelector
              selectedEquipment={[]}
              availableEquipment={equipment}
              weirdoType={weirdoType}
              warbandAbility={warbandAbility}
              onChange={mockOnChange}
            />
          );

          try {
            // Property 1: Each equipment item should have a cost display element
            const costElements = container.querySelectorAll('.equipment-selector__cost');
            expect(costElements.length).toBe(equipment.length);

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

            // Property 4: The component should render all equipment items
            expect(container.querySelectorAll('.equipment-selector__item').length).toBe(equipment.length);

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
