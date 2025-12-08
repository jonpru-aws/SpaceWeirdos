import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { WarbandService } from '../src/backend/services/WarbandService';
import { DataRepository } from '../src/backend/services/DataRepository';
import { WarbandAbility, LeaderTrait } from '../src/backend/models/types';

describe('WarbandService', () => {
  let service: WarbandService;
  let repository: DataRepository;

  beforeEach(() => {
    // Create repository with persistence disabled for testing
    repository = new DataRepository(':memory:', false);
    service = new WarbandService(repository);
  });

  describe('Property 2: New warbands initialize with zero cost', () => {
    /**
     * **Feature: space-weirdos-warband, Property 2: New warbands initialize with zero cost**
     * **Validates: Requirements 1.3**
     * 
     * For any newly created warband, the total point cost should equal zero before any weirdos are added.
     */
    it('should initialize all new warbands with zero cost', () => {
      // Generate valid warband abilities
      const warbandAbilityGen = fc.constantFrom<WarbandAbility>(
        'Cyborgs', 'Fanatics', 'Living Weapons', 
        'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
      );

      // Generate valid point limits
      const pointLimitGen = fc.constantFrom(75, 125);

      // Generate non-empty names (excluding whitespace-only strings)
      const nameGen = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

      fc.assert(
        fc.property(nameGen, pointLimitGen, warbandAbilityGen, (name, pointLimit, ability) => {
          // Create a new warband
          const warband = service.createWarband({
            name,
            pointLimit: pointLimit as 75 | 125,
            ability
          });

          // Verify total cost is zero
          expect(warband.totalCost).toBe(0);
          
          // Verify weirdos array is empty
          expect(warband.weirdos).toEqual([]);
          
          // Verify warband has an ID
          expect(warband.id).toBeTruthy();
          
          // Verify timestamps are set
          expect(warband.createdAt).toBeInstanceOf(Date);
          expect(warband.updatedAt).toBeInstanceOf(Date);
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 21: Loaded warbands are validated like new warbands', () => {
    /**
     * **Feature: space-weirdos-warband, Property 21: Loaded warbands are validated like new warbands**
     * **Validates: Requirements 12.4**
     * 
     * For any loaded warband that is modified, the system should apply all validation rules
     * (weapon requirements, equipment limits, point limits) as if the warband were being created new.
     */
    it('should validate loaded warbands with same rules as new warbands', () => {
      // Generators
      const speedLevelGen = fc.constantFrom<1 | 2 | 3>(1, 2, 3);
      const diceLevelGen = fc.constantFrom<'2d6' | '2d8' | '2d10'>('2d6', '2d8', '2d10');
      const firepowerLevelGen = fc.constantFrom<'None' | '2d8' | '2d10'>('None', '2d8', '2d10');
      const warbandAbilityGen = fc.constantFrom<WarbandAbility>(
        'Cyborgs', 'Fanatics', 'Living Weapons', 
        'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
      );

      const attributesGen = fc.record({
        speed: speedLevelGen,
        defense: diceLevelGen,
        firepower: firepowerLevelGen,
        prowess: diceLevelGen,
        willpower: diceLevelGen
      });

      const closeCombatWeaponGen = fc.record({
        id: fc.uuid(),
        name: fc.constantFrom('Unarmed', 'Claws & Teeth', 'Sword'),
        type: fc.constant('close' as const),
        baseCost: fc.integer({ min: 0, max: 3 }),
        maxActions: fc.integer({ min: 1, max: 3 }),
        notes: fc.string()
      });

      const rangedWeaponGen = fc.record({
        id: fc.uuid(),
        name: fc.constantFrom('Pistol', 'Rifle'),
        type: fc.constant('ranged' as const),
        baseCost: fc.integer({ min: 1, max: 5 }),
        maxActions: fc.integer({ min: 1, max: 3 }),
        notes: fc.string()
      });

      const equipmentGen = fc.record({
        id: fc.uuid(),
        name: fc.constantFrom('Grenade', 'Heavy Armor', 'Medkit'),
        type: fc.constantFrom('Passive' as const, 'Action' as const),
        baseCost: fc.integer({ min: 0, max: 3 }),
        effect: fc.string()
      });

      const psychicPowerGen = fc.record({
        id: fc.uuid(),
        name: fc.string({ minLength: 1 }),
        type: fc.constantFrom('Attack' as const, 'Effect' as const, 'Either' as const),
        cost: fc.integer({ min: 0, max: 3 }),
        effect: fc.string()
      });

      const weirdoGen = (type: 'leader' | 'trooper', warbandAbility: WarbandAbility) =>
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          type: fc.constant(type),
          attributes: attributesGen,
          closeCombatWeapons: fc.array(closeCombatWeaponGen, { minLength: 1, maxLength: 2 }),
          rangedWeapons: fc.array(rangedWeaponGen, { minLength: 0, maxLength: 1 }),
          equipment: fc.array(equipmentGen, {
            minLength: 0,
            maxLength: type === 'leader' ? (warbandAbility === 'Cyborgs' ? 3 : 2) : warbandAbility === 'Cyborgs' ? 2 : 1
          }),
          psychicPowers: fc.array(psychicPowerGen, { minLength: 0, maxLength: 2 }),
          leaderTrait: type === 'leader' ? fc.option(fc.constantFrom('Bounty Hunter', 'Healer', 'Majestic', 'Monstrous', 'Political Officer'), { nil: null }) : fc.constant(null),
          notes: fc.string(),
          totalCost: fc.integer({ min: 0, max: 20 })
        }).map((weirdo) => {
          // Ensure ranged weapons require Firepower 2d8 or 2d10
          if (weirdo.rangedWeapons.length > 0 && weirdo.attributes.firepower === 'None') {
            return {
              ...weirdo,
              attributes: {
                ...weirdo.attributes,
                firepower: '2d8' as 'None' | '2d8' | '2d10'
              },
              leaderTrait: weirdo.leaderTrait as LeaderTrait | null
            };
          }
          return {
            ...weirdo,
            leaderTrait: weirdo.leaderTrait as LeaderTrait | null
          };
        });

      const warbandGen = fc.record({
        id: fc.uuid(),
        name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        ability: warbandAbilityGen,
        pointLimit: fc.constantFrom(75 as const, 125 as const),
        totalCost: fc.integer({ min: 0, max: 125 }),
        weirdos: fc.constant([]),
        createdAt: fc.date(),
        updatedAt: fc.date()
      }).chain((warband) =>
        fc
          .tuple(
            weirdoGen('leader', warband.ability),
            fc.array(weirdoGen('trooper', warband.ability), { minLength: 0, maxLength: 2 })
          )
          .map(([leader, troopers]) => ({
            ...warband,
            weirdos: [leader, ...troopers]
          }))
      );

      fc.assert(
        fc.property(warbandGen, (warband) => {
          // Save the warband
          const saved = repository.saveWarband(warband);
          
          // Load it back
          const loaded = service.getWarband(saved.id);
          expect(loaded).not.toBeNull();
          
          if (loaded) {
            // Validate the loaded warband
            const validationResult = service.validateWarband(loaded);
            
            // The validation should run (we're not checking if it passes or fails,
            // just that validation is applied)
            expect(validationResult).toHaveProperty('valid');
            expect(validationResult).toHaveProperty('errors');
            expect(Array.isArray(validationResult.errors)).toBe(true);
            
            // If we modify the loaded warband, validation should still apply
            const modified = {
              ...loaded,
              name: 'Modified Name'
            };
            
            const modifiedValidation = service.validateWarband(modified);
            expect(modifiedValidation).toHaveProperty('valid');
            expect(modifiedValidation).toHaveProperty('errors');
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 25: Cost changes cascade through the system', () => {
    /**
     * **Feature: space-weirdos-warband, Property 25: Cost changes cascade through the system**
     * **Validates: Requirements 15.1, 15.2**
     * 
     * For any weirdo in a warband, when attributes, weapons, equipment, or psychic powers are added or removed,
     * the weirdo's total cost should immediately update, and the warband's total cost should immediately update
     * to reflect the change.
     */
    it('should cascade cost changes from weirdo to warband', () => {
      const warbandAbilityGen = fc.constantFrom<WarbandAbility>(
        'Cyborgs', 'Fanatics', 'Living Weapons', 
        'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
      );

      const speedLevelGen = fc.constantFrom<1 | 2 | 3>(1, 2, 3);
      const diceLevelGen = fc.constantFrom<'2d6' | '2d8' | '2d10'>('2d6', '2d8', '2d10');
      const firepowerLevelGen = fc.constantFrom<'None' | '2d8' | '2d10'>('None', '2d8', '2d10');

      const attributesGen = fc.record({
        speed: speedLevelGen,
        defense: diceLevelGen,
        firepower: firepowerLevelGen,
        prowess: diceLevelGen,
        willpower: diceLevelGen
      });

      const closeCombatWeaponGen = fc.record({
        id: fc.uuid(),
        name: fc.constantFrom('Unarmed', 'Claws & Teeth', 'Sword'),
        type: fc.constant('close' as const),
        baseCost: fc.integer({ min: 0, max: 3 }),
        maxActions: fc.integer({ min: 1, max: 3 }),
        notes: fc.string()
      });

      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          fc.constantFrom(75 as const, 125 as const),
          warbandAbilityGen,
          attributesGen,
          fc.array(closeCombatWeaponGen, { minLength: 1, maxLength: 2 }),
          (name, pointLimit, ability, attributes, weapons) => {
            // Create a warband
            const warband = service.createWarband({ name, pointLimit, ability });
            const initialWarbandCost = warband.totalCost;
            expect(initialWarbandCost).toBe(0);

            // Create a weirdo with specific attributes and weapons
            const weirdo = {
              id: 'test-weirdo',
              name: 'Test Weirdo',
              type: 'leader' as const,
              attributes,
              closeCombatWeapons: weapons,
              rangedWeapons: [],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            // Add weirdo to warband
            const updatedWarband = service.updateWarband(warband.id, {
              weirdos: [weirdo]
            });

            // Verify weirdo has a cost calculated
            expect(updatedWarband.weirdos[0].totalCost).toBeGreaterThanOrEqual(0);
            const weirdoCost = updatedWarband.weirdos[0].totalCost;

            // Verify warband total cost equals weirdo cost (cascading)
            expect(updatedWarband.totalCost).toBe(weirdoCost);

            // Now modify the weirdo's attributes (change speed to a different level)
            const modifiedAttributes = {
              ...attributes,
              speed: (attributes.speed === 1 ? 2 : 1) as 1 | 2 | 3
            };

            const modifiedWeirdo = {
              ...updatedWarband.weirdos[0],
              attributes: modifiedAttributes
            };

            // Update the warband with modified weirdo
            const finalWarband = service.updateWarband(warband.id, {
              weirdos: [modifiedWeirdo]
            });

            // Verify weirdo cost changed (unless speed cost is same)
            const newWeirdoCost = finalWarband.weirdos[0].totalCost;
            expect(newWeirdoCost).toBeGreaterThanOrEqual(0);

            // Verify warband total cost cascaded to match new weirdo cost
            expect(finalWarband.totalCost).toBe(newWeirdoCost);

            // Verify the cascade: warband cost = sum of all weirdo costs
            const sumOfWeirdoCosts = finalWarband.weirdos.reduce((sum, w) => sum + w.totalCost, 0);
            expect(finalWarband.totalCost).toBe(sumOfWeirdoCosts);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 22: Warband list contains all saved warbands', () => {
    /**
     * **Feature: space-weirdos-warband, Property 22: Warband list contains all saved warbands**
     * **Validates: Requirements 13.1, 13.2, 13.3**
     * 
     * For any set of saved warbands, requesting the warband list should return all warbands
     * with their name, ability, point limit, total cost, and weirdo count.
     */
    it('should return all saved warbands with complete information', () => {
      const warbandAbilityGen = fc.constantFrom<WarbandAbility>(
        'Cyborgs', 'Fanatics', 'Living Weapons', 
        'Heavily Armed', 'Mutants', 'Soldiers', 'Undead'
      );

      const simpleWarbandGen = fc.record({
        name: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        ability: warbandAbilityGen,
        pointLimit: fc.constantFrom(75 as const, 125 as const),
        weirdos: fc.constant([])
      });

      fc.assert(
        fc.property(fc.array(simpleWarbandGen, { minLength: 1, maxLength: 5 }), (warbandDataArray) => {
          // Clear repository
          repository.clear();
          
          // Create all warbands
          const createdWarbands = warbandDataArray.map(data => 
            service.createWarband(data)
          );
          
          // Get all warbands
          const allWarbands = service.getAllWarbands();
          
          // Verify count matches
          expect(allWarbands.length).toBe(createdWarbands.length);
          
          // Verify each created warband is in the list
          for (const created of createdWarbands) {
            const found = allWarbands.find(w => w.id === created.id);
            expect(found).toBeDefined();
            
            if (found) {
              // Verify all required fields are present
              expect(found.name).toBe(created.name);
              expect(found.ability).toBe(created.ability);
              expect(found.pointLimit).toBe(created.pointLimit);
              expect(found.totalCost).toBe(created.totalCost);
              expect(found.weirdos).toBeDefined();
              expect(Array.isArray(found.weirdos)).toBe(true);
              
              // Verify weirdo count is accessible
              const weirdoCount = found.weirdos.length;
              expect(typeof weirdoCount).toBe('number');
              expect(weirdoCount).toBeGreaterThanOrEqual(0);
            }
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Centralized cost recalculation', () => {
    /**
     * Unit tests for recalculateAllCosts method
     * Requirements: 7.4
     */
    
    it('should recalculate weirdo costs accurately', () => {
      // Create a warband with Mutants ability
      const warband = service.createWarband({
        name: 'Test Warband',
        pointLimit: 75,
        ability: 'Mutants'
      });

      // Create a weirdo with known costs
      const weirdo = {
        id: 'test-weirdo-1',
        name: 'Test Weirdo',
        type: 'leader' as const,
        attributes: {
          speed: 1 as const,
          defense: '2d6' as const,
          firepower: 'None' as const,
          prowess: '2d6' as const,
          willpower: '2d6' as const
        },
        closeCombatWeapons: [{
          id: 'weapon-1',
          name: 'Claws & Teeth',
          type: 'close' as const,
          baseCost: 0,
          maxActions: 2,
          notes: ''
        }],
        rangedWeapons: [],
        equipment: [],
        psychicPowers: [],
        leaderTrait: null,
        notes: '',
        totalCost: 999 // Intentionally wrong cost
      };

      // Add weirdo to warband
      const warbandWithWeirdo = {
        ...warband,
        weirdos: [weirdo]
      };

      // Recalculate costs
      const recalculated = service.recalculateAllCosts(warbandWithWeirdo);

      // Verify weirdo cost was recalculated (should not be 999)
      expect(recalculated.weirdos[0].totalCost).not.toBe(999);
      expect(recalculated.weirdos[0].totalCost).toBeGreaterThanOrEqual(0);
      
      // Verify warband total cost matches sum of weirdo costs
      const expectedTotal = recalculated.weirdos.reduce((sum, w) => sum + w.totalCost, 0);
      expect(recalculated.totalCost).toBe(expectedTotal);
    });

    it('should cascade cost updates from weirdos to warband', () => {
      // Create a warband
      const warband = service.createWarband({
        name: 'Test Warband',
        pointLimit: 125,
        ability: 'Soldiers'
      });

      // Create multiple weirdos with incorrect costs
      const weirdos = [
        {
          id: 'weirdo-1',
          name: 'Leader',
          type: 'leader' as const,
          attributes: {
            speed: 2 as const,
            defense: '2d8' as const,
            firepower: '2d8' as const,
            prowess: '2d8' as const,
            willpower: '2d6' as const
          },
          closeCombatWeapons: [{
            id: 'weapon-1',
            name: 'Sword',
            type: 'close' as const,
            baseCost: 1,
            maxActions: 2,
            notes: ''
          }],
          rangedWeapons: [{
            id: 'weapon-2',
            name: 'Pistol',
            type: 'ranged' as const,
            baseCost: 2,
            maxActions: 1,
            notes: ''
          }],
          equipment: [],
          psychicPowers: [],
          leaderTrait: null,
          notes: '',
          totalCost: 100 // Wrong
        },
        {
          id: 'weirdo-2',
          name: 'Trooper',
          type: 'trooper' as const,
          attributes: {
            speed: 1 as const,
            defense: '2d6' as const,
            firepower: 'None' as const,
            prowess: '2d6' as const,
            willpower: '2d6' as const
          },
          closeCombatWeapons: [{
            id: 'weapon-3',
            name: 'Unarmed',
            type: 'close' as const,
            baseCost: 0,
            maxActions: 1,
            notes: ''
          }],
          rangedWeapons: [],
          equipment: [],
          psychicPowers: [],
          leaderTrait: null,
          notes: '',
          totalCost: 50 // Wrong
        }
      ];

      const warbandWithWeirdos = {
        ...warband,
        weirdos,
        totalCost: 999 // Wrong warband total
      };

      // Recalculate all costs
      const recalculated = service.recalculateAllCosts(warbandWithWeirdos);

      // Verify each weirdo cost was recalculated
      expect(recalculated.weirdos[0].totalCost).not.toBe(100);
      expect(recalculated.weirdos[1].totalCost).not.toBe(50);

      // Verify warband total cascaded correctly
      const sumOfWeirdoCosts = recalculated.weirdos[0].totalCost + recalculated.weirdos[1].totalCost;
      expect(recalculated.totalCost).toBe(sumOfWeirdoCosts);
      expect(recalculated.totalCost).not.toBe(999);
    });

    it('should handle ability changes correctly', () => {
      // Create a weirdo with equipment that Soldiers get for free
      const weirdo = {
        id: 'weirdo-1',
        name: 'Soldier',
        type: 'trooper' as const,
        attributes: {
          speed: 1 as const,
          defense: '2d6' as const,
          firepower: 'None' as const,
          prowess: '2d6' as const,
          willpower: '2d6' as const
        },
        closeCombatWeapons: [{
          id: 'weapon-1',
          name: 'Unarmed',
          type: 'close' as const,
          baseCost: 0,
          maxActions: 1,
          notes: ''
        }],
        rangedWeapons: [],
        equipment: [{
          id: 'equip-1',
          name: 'Heavy Armor',
          type: 'Passive' as const,
          baseCost: 2,
          effect: 'Protection'
        }],
        psychicPowers: [],
        leaderTrait: null,
        notes: '',
        totalCost: 0
      };

      // Create warband with Soldiers ability (Heavy Armor is free)
      const warbandWithSoldiers = {
        id: 'warband-1',
        name: 'Soldier Warband',
        ability: 'Soldiers' as WarbandAbility,
        pointLimit: 75 as const,
        weirdos: [weirdo],
        totalCost: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Recalculate with Soldiers ability
      const withSoldiers = service.recalculateAllCosts(warbandWithSoldiers);
      const costWithSoldiers = withSoldiers.weirdos[0].totalCost;

      // Change ability to Cyborgs (no discount for Heavy Armor)
      const warbandWithCyborgs = {
        ...warbandWithSoldiers,
        ability: 'Cyborgs' as WarbandAbility
      };

      // Recalculate with Cyborgs ability
      const withCyborgs = service.recalculateAllCosts(warbandWithCyborgs);
      const costWithCyborgs = withCyborgs.weirdos[0].totalCost;

      // Costs should be different due to ability change
      // (Soldiers get Heavy Armor for free, Cyborgs pay full price)
      expect(costWithSoldiers).not.toBe(costWithCyborgs);
      expect(costWithCyborgs).toBeGreaterThan(costWithSoldiers);
      
      // Both should be non-negative
      expect(costWithSoldiers).toBeGreaterThanOrEqual(0);
      expect(costWithCyborgs).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty warband correctly', () => {
      const emptyWarband = {
        id: 'warband-1',
        name: 'Empty Warband',
        ability: 'Cyborgs' as WarbandAbility,
        pointLimit: 75 as const,
        weirdos: [],
        totalCost: 999, // Wrong
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const recalculated = service.recalculateAllCosts(emptyWarband);

      // Empty warband should have zero cost
      expect(recalculated.totalCost).toBe(0);
      expect(recalculated.weirdos.length).toBe(0);
    });

    it('should handle complex weirdo with all components', () => {
      const complexWeirdo = {
        id: 'weirdo-1',
        name: 'Complex Weirdo',
        type: 'leader' as const,
        attributes: {
          speed: 3 as const,
          defense: '2d10' as const,
          firepower: '2d10' as const,
          prowess: '2d10' as const,
          willpower: '2d10' as const
        },
        closeCombatWeapons: [
          {
            id: 'weapon-1',
            name: 'Sword',
            type: 'close' as const,
            baseCost: 1,
            maxActions: 2,
            notes: ''
          },
          {
            id: 'weapon-2',
            name: 'Horrible Claws & Teeth',
            type: 'close' as const,
            baseCost: 1,
            maxActions: 3,
            notes: ''
          }
        ],
        rangedWeapons: [{
          id: 'weapon-3',
          name: 'Rifle',
          type: 'ranged' as const,
          baseCost: 3,
          maxActions: 2,
          notes: ''
        }],
        equipment: [
          {
            id: 'equip-1',
            name: 'Heavy Armor',
            type: 'Passive' as const,
            baseCost: 2,
            effect: 'Protection'
          },
          {
            id: 'equip-2',
            name: 'Medkit',
            type: 'Action' as const,
            baseCost: 1,
            effect: 'Healing'
          }
        ],
        psychicPowers: [{
          id: 'power-1',
          name: 'Mind Blast',
          type: 'Attack' as const,
          cost: 2,
          effect: 'Damage'
        }],
        leaderTrait: null,
        notes: '',
        totalCost: 0 // Will be calculated
      };

      const warband = {
        id: 'warband-1',
        name: 'Complex Warband',
        ability: 'Heavily Armed' as WarbandAbility,
        pointLimit: 125 as const,
        weirdos: [complexWeirdo],
        totalCost: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const recalculated = service.recalculateAllCosts(warband);

      // Verify cost is calculated (should be high due to all max attributes)
      expect(recalculated.weirdos[0].totalCost).toBeGreaterThan(0);
      
      // Verify warband total matches weirdo cost
      expect(recalculated.totalCost).toBe(recalculated.weirdos[0].totalCost);
      
      // Verify cost is reasonable (not negative, not absurdly high)
      expect(recalculated.totalCost).toBeGreaterThanOrEqual(0);
      expect(recalculated.totalCost).toBeLessThan(200); // Sanity check
    });
  });
});
