import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import { EquipmentSelector } from '../src/frontend/components/EquipmentSelector';
import { Equipment, WarbandAbility } from '../src/backend/models/types';

/**
 * Property-based tests for equipment limit enforcement
 * **Feature: npm-package-upgrade-fixes**
 * 
 * Tests verify that equipment selection is properly disabled when limits are reached,
 * and that disabled states update correctly when limits change.
 */

describe('EquipmentSelector Limit Enforcement', () => {
  // Generate mock equipment items
  const generateEquipment = (count: number): Equipment[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `equipment-${i}`,
      name: `Equipment ${i}`,
      type: 'Passive' as const,
      baseCost: 1,
      effect: `Effect ${i}`
    }));
  };

  /**
   * **Feature: npm-package-upgrade-fixes, Property 39: Equipment limit disables unselected options**
   * **Validates: Requirements 11.1**
   * 
   * For any weirdo at equipment limit, unselected equipment options should be disabled.
   */
  it('Property 39: Equipment limit disables unselected options', () => {
    fc.assert(
      fc.property(
        // Generate random weirdo type
        fc.constantFrom<'leader' | 'trooper'>('leader', 'trooper'),
        // Generate random warband ability (with null option)
        fc.option(
          fc.constantFrom<WarbandAbility>(
            'Cyborgs', 'Fanatics', 'Living Weapons', 
            'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
          ),
          { nil: null }
        ),

        (weirdoType, warbandAbility) => {
          // Calculate expected limit
          const isCyborg = warbandAbility === 'Cyborgs';
          const expectedLimit = weirdoType === 'leader' 
            ? (isCyborg ? 3 : 2)
            : (isCyborg ? 2 : 1);

          // Generate enough equipment items (at least 5 to test limit)
          const availableEquipment = generateEquipment(5);
          
          // Select equipment up to the limit
          const selectedEquipment = availableEquipment.slice(0, expectedLimit);

          const mockOnChange = vi.fn();

          // Render component at limit
          const { unmount } = render(
            <EquipmentSelector
              selectedEquipment={selectedEquipment}
              availableEquipment={availableEquipment}
              weirdoType={weirdoType}
              warbandAbility={warbandAbility}
              onChange={mockOnChange}
            />
          );

          // Get all checkboxes
          const checkboxes = screen.getAllByRole('checkbox');

          // Verify unselected checkboxes are disabled
          for (let index = 0; index < checkboxes.length; index++) {
            const checkbox = checkboxes[index];
            const isSelected = index < expectedLimit;

            if (!isSelected) {
              // Unselected checkboxes should be disabled when at limit
              expect(checkbox).toBeDisabled();
            }
          }
          
          // Clean up to avoid duplicate elements in next iteration
          unmount();
        }
      ),
      { numRuns: 50 } // Run 50 iterations as per spec requirements
    );
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 40: Under limit enables equipment options**
   * **Validates: Requirements 11.2**
   * 
   * For any weirdo under equipment limit, equipment options should be enabled.
   */
  it('Property 40: Under limit enables equipment options', () => {
    fc.assert(
      fc.property(
        // Generate random weirdo type
        fc.constantFrom<'leader' | 'trooper'>('leader', 'trooper'),
        // Generate random warband ability (with null option)
        fc.option(
          fc.constantFrom<WarbandAbility>(
            'Cyborgs', 'Fanatics', 'Living Weapons', 
            'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
          ),
          { nil: null }
        ),

        (weirdoType, warbandAbility) => {
          // Calculate expected limit
          const isCyborg = warbandAbility === 'Cyborgs';
          const expectedLimit = weirdoType === 'leader' 
            ? (isCyborg ? 3 : 2)
            : (isCyborg ? 2 : 1);

          // Generate enough equipment items
          const availableEquipment = generateEquipment(5);
          
          // Select equipment below the limit (at least 1 below)
          const selectedCount = Math.max(0, expectedLimit - 1);
          const selectedEquipment = availableEquipment.slice(0, selectedCount);

          const mockOnChange = vi.fn();

          // Render component below limit
          const { unmount } = render(
            <EquipmentSelector
              selectedEquipment={selectedEquipment}
              availableEquipment={availableEquipment}
              weirdoType={weirdoType}
              warbandAbility={warbandAbility}
              onChange={mockOnChange}
            />
          );

          // Get all checkboxes
          const checkboxes = screen.getAllByRole('checkbox');

          // Verify all checkboxes are enabled (both selected and unselected)
          for (const checkbox of checkboxes) {
            expect(checkbox).not.toBeDisabled();
          }
          
          // Clean up to avoid duplicate elements in next iteration
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 41: At limit allows deselecting equipment**
   * **Validates: Requirements 11.3**
   * 
   * For any weirdo at equipment limit, currently selected equipment should remain clickable for deselection.
   */
  it('Property 41: At limit allows deselecting equipment', () => {
    fc.assert(
      fc.property(
        // Generate random weirdo type
        fc.constantFrom<'leader' | 'trooper'>('leader', 'trooper'),
        // Generate random warband ability (with null option)
        fc.option(
          fc.constantFrom<WarbandAbility>(
            'Cyborgs', 'Fanatics', 'Living Weapons', 
            'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
          ),
          { nil: null }
        ),

        (weirdoType, warbandAbility) => {
          // Calculate expected limit
          const isCyborg = warbandAbility === 'Cyborgs';
          const expectedLimit = weirdoType === 'leader' 
            ? (isCyborg ? 3 : 2)
            : (isCyborg ? 2 : 1);

          // Generate enough equipment items
          const availableEquipment = generateEquipment(5);
          
          // Select equipment up to the limit
          const selectedEquipment = availableEquipment.slice(0, expectedLimit);

          const mockOnChange = vi.fn();

          // Render component at limit
          const { unmount } = render(
            <EquipmentSelector
              selectedEquipment={selectedEquipment}
              availableEquipment={availableEquipment}
              weirdoType={weirdoType}
              warbandAbility={warbandAbility}
              onChange={mockOnChange}
            />
          );

          // Get all checkboxes
          const checkboxes = screen.getAllByRole('checkbox');

          // Verify selected checkboxes are enabled (for deselection)
          for (let index = 0; index < checkboxes.length; index++) {
            const checkbox = checkboxes[index];
            const isSelected = index < expectedLimit;

            if (isSelected) {
              // Selected checkboxes should be enabled even at limit
              expect(checkbox).not.toBeDisabled();
            }
          }
          
          // Clean up to avoid duplicate elements in next iteration
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: npm-package-upgrade-fixes, Property 42: Limit changes update disabled states**
   * **Validates: Requirements 11.4**
   * 
   * For any weirdo, changing the equipment limit should update the disabled state of equipment options accordingly.
   */
  it('Property 42: Limit changes update disabled states', { timeout: 10000 }, () => {
    fc.assert(
      fc.property(
        // Generate random weirdo type
        fc.constantFrom<'leader' | 'trooper'>('leader', 'trooper'),
        // Generate two different warband abilities to test limit change
        fc.boolean(), // Whether to use Cyborgs ability

        (weirdoType, useCyborgs) => {
          // Generate enough equipment items
          const availableEquipment = generateEquipment(5);
          
          // Start with ability that gives lower limit
          const initialAbility: WarbandAbility | null = useCyborgs ? null : 'Cyborgs';
          const finalAbility: WarbandAbility | null = useCyborgs ? 'Cyborgs' : null;

          // Calculate limits
          const initialLimit = weirdoType === 'leader' 
            ? (initialAbility === 'Cyborgs' ? 3 : 2)
            : (initialAbility === 'Cyborgs' ? 2 : 1);
          
          const finalLimit = weirdoType === 'leader' 
            ? (finalAbility === 'Cyborgs' ? 3 : 2)
            : (finalAbility === 'Cyborgs' ? 2 : 1);

          // Select equipment at the initial limit
          const selectedEquipment = availableEquipment.slice(0, initialLimit);

          const mockOnChange = vi.fn();

          // Render component with initial ability
          const { rerender, unmount } = render(
            <EquipmentSelector
              selectedEquipment={selectedEquipment}
              availableEquipment={availableEquipment}
              weirdoType={weirdoType}
              warbandAbility={initialAbility}
              onChange={mockOnChange}
            />
          );

          // Get checkboxes in initial state
          const initialCheckboxes = screen.getAllByRole('checkbox');
          const initialAtLimit = selectedEquipment.length >= initialLimit;

          // Verify initial disabled states
          for (let index = 0; index < initialCheckboxes.length; index++) {
            const checkbox = initialCheckboxes[index];
            const isSelected = index < initialLimit;

            if (!isSelected && initialAtLimit) {
              expect(checkbox).toBeDisabled();
            }
          }

          // Change the warband ability (which changes the limit)
          rerender(
            <EquipmentSelector
              selectedEquipment={selectedEquipment}
              availableEquipment={availableEquipment}
              weirdoType={weirdoType}
              warbandAbility={finalAbility}
              onChange={mockOnChange}
            />
          );

          // Get checkboxes after limit change
          const finalCheckboxes = screen.getAllByRole('checkbox');
          const finalAtLimit = selectedEquipment.length >= finalLimit;

          // Verify disabled states updated correctly
          for (let index = 0; index < finalCheckboxes.length; index++) {
            const checkbox = finalCheckboxes[index];
            const isSelected = index < initialLimit; // Still same selection

            if (!isSelected && finalAtLimit) {
              // Should be disabled if still at or over limit
              expect(checkbox).toBeDisabled();
            } else if (!isSelected && !finalAtLimit) {
              // Should be enabled if now under limit
              expect(checkbox).not.toBeDisabled();
            }
          }
          
          // Clean up to avoid duplicate elements in next iteration
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });
});
