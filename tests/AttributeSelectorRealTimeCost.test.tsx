import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CostEngine } from '../src/backend/services/CostEngine';
import { 
  Weirdo,
  SpeedLevel, 
  DiceLevel, 
  FirepowerLevel,
  WarbandAbility,
  Attributes
} from '../src/backend/models/types';

/**
 * Property-based test for real-time cost synchronization
 * **Feature: space-weirdos-ui, Property 3: Real-time cost synchronization**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.6**
 * 
 * For any change to weirdo attributes, the cost calculation should be consistent
 * and reflect the correct values based on the attribute levels and warband ability.
 */

describe('AttributeSelector Real-Time Cost Updates', () => {
  const costEngine = new CostEngine();

  /**
   * Property 3: Real-time cost synchronization
   * 
   * This test verifies that attribute cost calculations are consistent:
   * - Changing an attribute and recalculating produces the correct cost
   * - The weirdo total cost equals the sum of all attribute costs
   * - Warband ability modifiers are applied correctly
   */
  it('Property 3: Real-time cost synchronization', () => {
    fc.assert(
      fc.property(
        // Generate random attributes
        fc.constantFrom<SpeedLevel>(1, 2, 3),
        fc.constantFrom<DiceLevel>('2d6', '2d8', '2d10'),
        fc.constantFrom<FirepowerLevel>('None', '2d8', '2d10'),
        fc.constantFrom<DiceLevel>('2d6', '2d8', '2d10'),
        fc.constantFrom<DiceLevel>('2d6', '2d8', '2d10'),
        fc.option(
          fc.constantFrom<WarbandAbility>(
            'Cyborgs', 'Fanatics', 'Living Weapons', 
            'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
          ),
          { nil: null }
        ),

        (speed, defense, firepower, prowess, willpower, warbandAbility) => {
          // Create attributes object
          const attributes: Attributes = {
            speed,
            defense,
            firepower,
            prowess,
            willpower
          };

          // Create a minimal weirdo with these attributes
          const weirdo: Weirdo = {
            id: 'test-weirdo',
            name: 'Test Weirdo',
            type: 'trooper',
            attributes,
            closeCombatWeapons: [],
            rangedWeapons: [],
            equipment: [],
            psychicPowers: [],
            leaderTrait: null,
            notes: '',
            totalCost: 0
          };

          // Calculate individual attribute costs
          const speedCost = costEngine.getAttributeCost('speed', speed, warbandAbility);
          const defenseCost = costEngine.getAttributeCost('defense', defense, warbandAbility);
          const firepowerCost = costEngine.getAttributeCost('firepower', firepower, warbandAbility);
          const prowessCost = costEngine.getAttributeCost('prowess', prowess, warbandAbility);
          const willpowerCost = costEngine.getAttributeCost('willpower', willpower, warbandAbility);

          // Calculate total weirdo cost
          const totalCost = costEngine.calculateWeirdoCost(weirdo, warbandAbility);

          // Property 1: Total cost equals sum of attribute costs (since no weapons/equipment)
          const expectedTotal = speedCost + defenseCost + firepowerCost + prowessCost + willpowerCost;
          expect(totalCost).toBe(expectedTotal);

          // Property 2: All costs are non-negative
          expect(speedCost).toBeGreaterThanOrEqual(0);
          expect(defenseCost).toBeGreaterThanOrEqual(0);
          expect(firepowerCost).toBeGreaterThanOrEqual(0);
          expect(prowessCost).toBeGreaterThanOrEqual(0);
          expect(willpowerCost).toBeGreaterThanOrEqual(0);
          expect(totalCost).toBeGreaterThanOrEqual(0);

          // Property 3: Changing one attribute changes total cost correctly
          const newSpeed: SpeedLevel = speed === 3 ? 1 : (speed + 1) as SpeedLevel;
          const modifiedAttributes: Attributes = { ...attributes, speed: newSpeed };
          const modifiedWeirdo: Weirdo = { ...weirdo, attributes: modifiedAttributes };

          const newSpeedCost = costEngine.getAttributeCost('speed', newSpeed, warbandAbility);
          const newTotalCost = costEngine.calculateWeirdoCost(modifiedWeirdo, warbandAbility);

          // The difference in total cost should equal the difference in speed cost
          const costDifference = newTotalCost - totalCost;
          const speedCostDifference = newSpeedCost - speedCost;
          expect(costDifference).toBe(speedCostDifference);

          // Property 4: Warband ability modifiers are applied consistently
          const costWithoutAbility = costEngine.calculateWeirdoCost(weirdo, null);
          const costWithAbility = costEngine.calculateWeirdoCost(weirdo, warbandAbility);

          // If Mutants ability, speed costs should be reduced
          if (warbandAbility === 'Mutants' && speed > 1) {
            expect(costWithAbility).toBeLessThan(costWithoutAbility);
          }

          return true;
        }
      ),
      { numRuns: 50 } // Run 50 iterations as per project standards
    );
  });
});
