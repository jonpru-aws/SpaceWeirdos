import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import { EquipmentSelector } from '../src/frontend/components/EquipmentSelector';
import { CostEngine } from '../src/backend/services/CostEngine';
import { Equipment, WarbandAbility } from '../src/backend/models/types';

/**
 * Property-based test for equipment limit enforcement
 * **Feature: space-weirdos-ui, Property 13: Equipment selections are disabled at limit**
 * **Validates: Requirements 12.6**
 * 
 * For any weirdo with equipment at the limit (based on type and Cyborgs ability),
 * additional equipment checkboxes should be disabled.
 */

describe('EquipmentSelector Limit Enforcement', () => {
  const costEngine = new CostEngine();

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
   * Property 13: Equipment selections are disabled at limit
   * 
   * This test verifies that:
   * - When equipment count equals the limit, unselected checkboxes are disabled
   * - The limit is correctly calculated based on weirdo type and warband ability
   * - Selected equipment checkboxes remain enabled (for deselection)
   */
  it('Property 13: Equipment selections are disabled at limit', () => {
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
        // Generate number of equipment items to select (0-4)
        fc.integer({ min: 0, max: 4 }),

        (weirdoType, warbandAbility, selectedCount) => {
          // Calculate expected limit
          const isCyborg = warbandAbility === 'Cyborgs';
          const expectedLimit = weirdoType === 'leader' 
            ? (isCyborg ? 3 : 2)
            : (isCyborg ? 2 : 1);

          // Generate enough equipment items (at least 5 to test limit)
          const availableEquipment = generateEquipment(5);
          
          // Select equipment up to the specified count (but not exceeding limit)
          const actualSelectedCount = Math.min(selectedCount, expectedLimit);
          const selectedEquipment = availableEquipment.slice(0, actualSelectedCount);

          const mockOnChange = vi.fn();

          // Render component
          const { unmount } = render(
            <EquipmentSelector
              selectedEquipment={selectedEquipment}
              availableEquipment={availableEquipment}
              weirdoType={weirdoType}
              warbandAbility={warbandAbility}
              onChange={mockOnChange}
              costEngine={costEngine}
            />
          );

          // Verify limit display
          const limitText = `Selected: ${actualSelectedCount}/${expectedLimit}`;
          expect(screen.getByText(limitText)).toBeInTheDocument();

          // Get all checkboxes
          const checkboxes = screen.getAllByRole('checkbox');

          // Verify checkbox states
          const isAtLimit = actualSelectedCount >= expectedLimit;
          
          for (let index = 0; index < checkboxes.length; index++) {
            const checkbox = checkboxes[index];
            const isSelected = index < actualSelectedCount;

            // Check if checkbox is checked
            if (isSelected) {
              expect(checkbox).toBeChecked();
            } else {
              expect(checkbox).not.toBeChecked();
            }

            // Check if checkbox is disabled
            if (isSelected) {
              // Selected checkboxes should always be enabled (for deselection)
              expect(checkbox).not.toBeDisabled();
            } else if (isAtLimit) {
              // Unselected checkboxes should be disabled when at limit
              expect(checkbox).toBeDisabled();
            } else {
              // Unselected checkboxes should be enabled when below limit
              expect(checkbox).not.toBeDisabled();
            }
          }
          
          // Clean up to avoid duplicate elements in next iteration
          unmount();
        }
      ),
      { numRuns: 100 } // Run 100 iterations as per spec requirements
    );
  });

  /**
   * Additional property: Limit calculation correctness
   * 
   * This test verifies that the limit is calculated correctly for all combinations:
   * - Leader without Cyborgs: 2
   * - Leader with Cyborgs: 3
   * - Trooper without Cyborgs: 1
   * - Trooper with Cyborgs: 2
   */
  it('should calculate correct limits for all type/ability combinations', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<'leader' | 'trooper'>('leader', 'trooper'),
        fc.boolean(), // isCyborg

        (weirdoType, isCyborg) => {
          const warbandAbility = isCyborg ? 'Cyborgs' : null;
          const availableEquipment = generateEquipment(5);
          const mockOnChange = vi.fn();

          const { unmount } = render(
            <EquipmentSelector
              selectedEquipment={[]}
              availableEquipment={availableEquipment}
              weirdoType={weirdoType}
              warbandAbility={warbandAbility}
              onChange={mockOnChange}
              costEngine={costEngine}
            />
          );

          // Calculate expected limit
          let expectedLimit: number;
          if (weirdoType === 'leader') {
            expectedLimit = isCyborg ? 3 : 2;
          } else {
            expectedLimit = isCyborg ? 2 : 1;
          }

          // Verify limit is displayed correctly
          expect(screen.getByText(`Selected: 0/${expectedLimit}`)).toBeInTheDocument();
          
          // Clean up to avoid duplicate elements in next iteration
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
