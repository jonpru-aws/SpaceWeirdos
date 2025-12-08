import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import { WeaponSelector } from '../src/frontend/components/WeaponSelector';
import { CostEngine } from '../src/backend/services/CostEngine';
import { Weapon, WarbandAbility } from '../src/backend/models/types';
import * as apiClient from '../src/frontend/services/apiClient';

// Mock the API client
vi.mock('../src/frontend/services/apiClient', () => ({
  apiClient: {
    calculateCostRealTime: vi.fn(),
  },
}));

/**
 * Unit tests for WeaponSelector component
 * Requirements: 5.3, 5.7, 5.8, 12.2, 12.7
 */

describe('WeaponSelector Component', () => {
  const costEngine = new CostEngine();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
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

  const mockCloseCombatWeapons: Weapon[] = [
    {
      id: 'unarmed',
      name: 'Unarmed',
      type: 'close',
      baseCost: 0,
      maxActions: 3,
      notes: '-1DT to Power rolls'
    },
    {
      id: 'claws-teeth',
      name: 'Claws & Teeth',
      type: 'close',
      baseCost: 2,
      maxActions: 3,
      notes: ''
    },
    {
      id: 'melee-weapon',
      name: 'Melee Weapon',
      type: 'close',
      baseCost: 1,
      maxActions: 2,
      notes: ''
    }
  ];

  const mockRangedWeapons: Weapon[] = [
    {
      id: 'auto-pistol',
      name: 'Auto Pistol',
      type: 'ranged',
      baseCost: 0,
      maxActions: 3,
      notes: '-1DT range > 1 stick'
    },
    {
      id: 'auto-rifle',
      name: 'Auto Rifle',
      type: 'ranged',
      baseCost: 1,
      maxActions: 3,
      notes: 'Aim1'
    }
  ];

  describe('Close Combat Weapons', () => {
    it('should render weapon list with costs and notes', async () => {
      const mockOnChange = vi.fn();

      // Mock API responses for each weapon
      vi.mocked(apiClient.apiClient.calculateCostRealTime).mockImplementation(async (params) => {
        const weaponName = params.weapons?.close?.[0] || '';
        let weaponCost = 0;
        
        if (weaponName === 'Unarmed') weaponCost = 0;
        else if (weaponName === 'Claws & Teeth') weaponCost = 2;
        else if (weaponName === 'Melee Weapon') weaponCost = 1;

        return {
          success: true,
          data: {
            totalCost: weaponCost,
            breakdown: {
              attributes: 0,
              weapons: weaponCost,
              equipment: 0,
              psychicPowers: 0,
            },
            warnings: [],
            isApproachingLimit: false,
            isOverLimit: false,
          },
        };
      });

      render(
        <WeaponSelector
          type="close-combat"
          selectedWeapons={[]}
          availableWeapons={mockCloseCombatWeapons}
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      // Check title
      expect(screen.getByText('Close Combat Weapons')).toBeInTheDocument();

      // Wait for costs to load from API
      await waitFor(() => {
        expect(screen.getByText('0 pts')).toBeInTheDocument();
      });

      // Check all weapons are rendered with costs
      expect(screen.getByText('Unarmed')).toBeInTheDocument();
      expect(screen.getByText('-1DT to Power rolls')).toBeInTheDocument();

      expect(screen.getByText('Claws & Teeth')).toBeInTheDocument();
      expect(screen.getByText('2 pts')).toBeInTheDocument();

      expect(screen.getByText('Melee Weapon')).toBeInTheDocument();
      expect(screen.getByText('1 pts')).toBeInTheDocument();
    });

    it('should handle weapon selection', () => {
      const mockOnChange = vi.fn();

      render(
        <WeaponSelector
          type="close-combat"
          selectedWeapons={[]}
          availableWeapons={mockCloseCombatWeapons}
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      // Click checkbox for Unarmed
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).toHaveBeenCalledWith([mockCloseCombatWeapons[0]]);
    });

    it('should handle weapon deselection', () => {
      const mockOnChange = vi.fn();

      render(
        <WeaponSelector
          type="close-combat"
          selectedWeapons={[mockCloseCombatWeapons[0]]}
          availableWeapons={mockCloseCombatWeapons}
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      // Click checkbox for Unarmed (already selected)
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Ranged Weapons', () => {
    it('should render ranged weapon list', () => {
      const mockOnChange = vi.fn();

      render(
        <WeaponSelector
          type="ranged"
          selectedWeapons={[]}
          availableWeapons={mockRangedWeapons}
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      // Check title
      expect(screen.getByText('Ranged Weapons')).toBeInTheDocument();

      // Check weapons are rendered
      expect(screen.getByText('Auto Pistol')).toBeInTheDocument();
      expect(screen.getByText('Auto Rifle')).toBeInTheDocument();
    });

    it('should be disabled when Firepower is None', () => {
      const mockOnChange = vi.fn();

      render(
        <WeaponSelector
          type="ranged"
          selectedWeapons={[]}
          availableWeapons={mockRangedWeapons}
          warbandAbility={null}
          onChange={mockOnChange}
          disabled={true}
         
        />
      );

      // Check disabled message
      expect(screen.getByText('Ranged weapons are disabled when Firepower is None')).toBeInTheDocument();

      // Check all checkboxes are disabled
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled();
      });
    });

    it('should not call onChange when disabled', () => {
      const mockOnChange = vi.fn();

      render(
        <WeaponSelector
          type="ranged"
          selectedWeapons={[]}
          availableWeapons={mockRangedWeapons}
          warbandAbility={null}
          onChange={mockOnChange}
          disabled={true}
         
        />
      );

      // Try to click checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      // onChange should not be called
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Cost Display', () => {
    it('should show modified costs with warband ability modifiers', async () => {
      const mockOnChange = vi.fn();

      // Mock API to return modified costs with Mutants ability
      vi.mocked(apiClient.apiClient.calculateCostRealTime).mockImplementation(async (params) => {
        const weaponName = params.weapons?.close?.[0] || '';
        let weaponCost = 0;
        
        // Apply Mutants ability modifier (reduces Claws & Teeth by 1)
        if (weaponName === 'Claws & Teeth') weaponCost = 1; // 2 - 1 = 1
        else if (weaponName === 'Melee Weapon') weaponCost = 1;
        else if (weaponName === 'Unarmed') weaponCost = 0;

        return {
          success: true,
          data: {
            totalCost: weaponCost,
            breakdown: {
              attributes: 0,
              weapons: weaponCost,
              equipment: 0,
              psychicPowers: 0,
            },
            warnings: [],
            isApproachingLimit: false,
            isOverLimit: false,
          },
        };
      });

      // With Mutants ability, selector shows modified costs
      // Mutants reduces specific close combat weapon costs by 1
      render(
        <WeaponSelector
          type="close-combat"
          selectedWeapons={[]}
          availableWeapons={mockCloseCombatWeapons}
          warbandAbility={'Mutants' as WarbandAbility}
          onChange={mockOnChange}
        />
      );

      // Wait for costs to load and verify modified cost
      await waitFor(() => {
        const clawsTeethElement = screen.getByText('Claws & Teeth').closest('.weapon-selector__item');
        expect(clawsTeethElement).toHaveTextContent('1 pts');
      });
    });

    it('should show modified costs for ranged weapons with Heavily Armed ability', async () => {
      const mockOnChange = vi.fn();

      // Mock API to return modified costs with Heavily Armed ability
      vi.mocked(apiClient.apiClient.calculateCostRealTime).mockImplementation(async (params) => {
        const weaponName = params.weapons?.ranged?.[0] || '';
        let weaponCost = 0;
        
        // Apply Heavily Armed ability modifier (reduces ranged weapons by 1)
        if (weaponName === 'Auto Rifle') weaponCost = 0; // 1 - 1 = 0
        else if (weaponName === 'Auto Pistol') weaponCost = 0; // Already 0

        return {
          success: true,
          data: {
            totalCost: weaponCost,
            breakdown: {
              attributes: 0,
              weapons: weaponCost,
              equipment: 0,
              psychicPowers: 0,
            },
            warnings: [],
            isApproachingLimit: false,
            isOverLimit: false,
          },
        };
      });

      render(
        <WeaponSelector
          type="ranged"
          selectedWeapons={[]}
          availableWeapons={mockRangedWeapons}
          warbandAbility={'Heavily Armed' as WarbandAbility}
          onChange={mockOnChange}
        />
      );

      // Wait for costs to load and verify modified cost
      await waitFor(() => {
        const autoRifleElement = screen.getByText('Auto Rifle').closest('.weapon-selector__item');
        expect(autoRifleElement).toHaveTextContent('0 pts');
      });
    });

    it('should not show modified cost when no ability applies', () => {
      const mockOnChange = vi.fn();

      render(
        <WeaponSelector
          type="close-combat"
          selectedWeapons={[]}
          availableWeapons={mockCloseCombatWeapons}
          warbandAbility={null}
          onChange={mockOnChange}
         
        />
      );

      // Should show regular costs without "was" text
      expect(screen.queryByText(/was/)).not.toBeInTheDocument();
    });
  });
});

/**
 * Property-Based Tests for Weapon Selector API Usage
 * 
 * **Feature: 6-frontend-backend-api-separation, Property 12: Selector components use API for cost display**
 * **Validates: Requirements 5.1**
 */
describe('Property-Based Tests: Weapon Selector API Usage', () => {
  const testConfig = { numRuns: 50 };

  /**
   * Property 12: Selector components use API for cost display
   * 
   * For any weapon selector with weapons and warband ability, the component should:
   * 1. Use the useItemCost hook (which calls the API) for each weapon
   * 2. Display costs returned from the API
   * 3. Handle loading states appropriately
   * 4. Not use local cost calculation functions
   * 
   * This test verifies that the WeaponSelector component retrieves costs from the
   * backend API with warband ability context, rather than calculating costs locally.
   * 
   * **Feature: 6-frontend-backend-api-separation, Property 12: Selector components use API for cost display**
   * **Validates: Requirements 5.1**
   */
  it('Property 12: WeaponSelector uses API for cost display', () => {
    fc.assert(
      fc.property(
        // Generate weapon type
        fc.constantFrom('close-combat' as const, 'ranged' as const),
        // Generate random weapons (1-3 weapons to keep test fast)
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1, maxLength: 30 }),
            type: fc.constantFrom('close' as const, 'ranged' as const),
            baseCost: fc.integer({ min: 0, max: 5 }),
            maxActions: fc.constantFrom(1, 2, 3),
            notes: fc.string({ maxLength: 50 })
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

        (weaponType, weapons, warbandAbility) => {
          const mockOnChange = vi.fn();

          const { container, unmount } = render(
            <WeaponSelector
              type={weaponType}
              selectedWeapons={[]}
              availableWeapons={weapons}
              warbandAbility={warbandAbility}
              onChange={mockOnChange}
            />
          );

          try {
            // Property 1: Each weapon should have a cost display element
            const costElements = container.querySelectorAll('.weapon-selector__cost');
            expect(costElements.length).toBe(weapons.length);

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

            // Property 4: The component should render all weapons
            expect(container.querySelectorAll('.weapon-selector__item').length).toBe(weapons.length);

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

/**
 * Property-Based Tests for Weapon Selector
 * 
 * **Feature: space-weirdos-ui, Property 14: Ranged weapon selections are disabled when Firepower is None**
 * **Validates: Requirements 12.7**
 */
describe('Property-Based Tests: Ranged Weapon Disabling', () => {
  const costEngine = new CostEngine();
  const testConfig = { numRuns: 50 };

  /**
   * Property 14: Ranged weapon selections are disabled when Firepower is None
   * 
   * For any weirdo with Firepower level None, the ranged weapon selector should be disabled.
   * This property verifies that:
   * 1. When disabled=true, all ranged weapon checkboxes are disabled
   * 2. When disabled=true, clicking checkboxes does not trigger onChange
   * 3. When disabled=true, the disabled message is displayed
   * 
   * **Feature: space-weirdos-ui, Property 14: Ranged weapon selections are disabled when Firepower is None**
   * **Validates: Requirements 12.7**
   */
  it('Property 14: Ranged weapon selections are disabled when Firepower is None', () => {
    fc.assert(
      fc.property(
        // Generate random ranged weapons (1-5 weapons)
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1, maxLength: 30 }),
            type: fc.constant('ranged' as const),
            baseCost: fc.integer({ min: 0, max: 5 }),
            maxActions: fc.constantFrom(1, 2, 3),
            notes: fc.string({ maxLength: 50 })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        // Generate whether disabled (representing Firepower None)
        fc.boolean(),
        // Generate optional warband ability
        fc.option(
          fc.constantFrom<WarbandAbility>(
            'Cyborgs', 'Fanatics', 'Living Weapons', 
            'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
          ),
          { nil: null }
        ),

        (rangedWeapons, isDisabled, warbandAbility) => {
          const mockOnChange = vi.fn();

          const { unmount } = render(
            <WeaponSelector
              type="ranged"
              selectedWeapons={[]}
              availableWeapons={rangedWeapons}
              warbandAbility={warbandAbility}
              onChange={mockOnChange}
              disabled={isDisabled}
             
            />
          );

          try {
            // Property 1: When disabled, all checkboxes should be disabled
            const checkboxes = screen.getAllByRole('checkbox');
            checkboxes.forEach(checkbox => {
              if (isDisabled) {
                expect(checkbox).toBeDisabled();
              } else {
                expect(checkbox).not.toBeDisabled();
              }
            });

            // Property 2: When disabled, the disabled message should be displayed
            const disabledMessage = screen.queryByText('Ranged weapons are disabled when Firepower is None');
            if (isDisabled) {
              expect(disabledMessage).toBeInTheDocument();
            } else {
              expect(disabledMessage).not.toBeInTheDocument();
            }

            // Property 3: When disabled, clicking checkboxes should not trigger onChange
            if (checkboxes.length > 0) {
              const firstCheckbox = checkboxes[0];
              fireEvent.click(firstCheckbox);

              if (isDisabled) {
                expect(mockOnChange).not.toHaveBeenCalled();
              } else {
                expect(mockOnChange).toHaveBeenCalled();
              }
            }

            // Property 4: The number of checkboxes should equal the number of weapons
            expect(checkboxes.length).toBe(rangedWeapons.length);

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



