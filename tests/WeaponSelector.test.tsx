import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import fc from 'fast-check';
import { WeaponSelector } from '../src/frontend/components/WeaponSelector';
import { CostEngine } from '../src/backend/services/CostEngine';
import { Weapon, WarbandAbility } from '../src/backend/models/types';

/**
 * Unit tests for WeaponSelector component
 * Requirements: 5.3, 5.7, 5.8, 12.2, 12.7
 */

describe('WeaponSelector Component', () => {
  const costEngine = new CostEngine();

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
    it('should render weapon list with costs and notes', () => {
      const mockOnChange = vi.fn();

      render(
        <WeaponSelector
          type="close-combat"
          selectedWeapons={[]}
          availableWeapons={mockCloseCombatWeapons}
          warbandAbility={null}
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      // Check title
      expect(screen.getByText('Close Combat Weapons')).toBeInTheDocument();

      // Check all weapons are rendered with costs
      expect(screen.getByText('Unarmed')).toBeInTheDocument();
      expect(screen.getByText('0 pts')).toBeInTheDocument();
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
          costEngine={costEngine}
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
          costEngine={costEngine}
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
          costEngine={costEngine}
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
          costEngine={costEngine}
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
          costEngine={costEngine}
        />
      );

      // Try to click checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      // onChange should not be called
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Modified Cost Indication', () => {
    it('should show modified cost for Mutants ability on Claws & Teeth', () => {
      const mockOnChange = vi.fn();

      render(
        <WeaponSelector
          type="close-combat"
          selectedWeapons={[]}
          availableWeapons={mockCloseCombatWeapons}
          warbandAbility={'Mutants' as WarbandAbility}
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      // Claws & Teeth should show modified cost (1 pt instead of 2 pts - Mutants reduces by 1)
      expect(screen.getByText(/1 pts \(was 2 pts\)/)).toBeInTheDocument();
    });

    it('should show modified cost for Heavily Armed ability on ranged weapons', () => {
      const mockOnChange = vi.fn();

      render(
        <WeaponSelector
          type="ranged"
          selectedWeapons={[]}
          availableWeapons={mockRangedWeapons}
          warbandAbility={'Heavily Armed' as WarbandAbility}
          onChange={mockOnChange}
          costEngine={costEngine}
        />
      );

      // Auto Rifle should show modified cost (0 pts instead of 1 pt)
      expect(screen.getByText(/0 pts \(was 1 pts\)/)).toBeInTheDocument();
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
          costEngine={costEngine}
        />
      );

      // Should show regular costs without "was" text
      expect(screen.queryByText(/was/)).not.toBeInTheDocument();
    });
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

          const { container, unmount } = render(
            <WeaponSelector
              type="ranged"
              selectedWeapons={[]}
              availableWeapons={rangedWeapons}
              warbandAbility={warbandAbility}
              onChange={mockOnChange}
              disabled={isDisabled}
              costEngine={costEngine}
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
