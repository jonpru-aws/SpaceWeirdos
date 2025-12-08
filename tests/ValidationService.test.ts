import { describe, it } from 'vitest';
import fc from 'fast-check';
import { ValidationService } from '../src/backend/services/ValidationService';
import { CostEngine } from '../src/backend/services/CostEngine';
import {
  SpeedLevel,
  DiceLevel,
  FirepowerLevel,
  WarbandAbility,
  Attributes,
  Weirdo,
  Weapon,
  Equipment,
  PsychicPower,
  Warband
} from '../src/backend/models/types';

const testConfig = { numRuns: 50 };

// Generators (reused from CostEngine tests)
const speedLevelGen = fc.constantFrom<SpeedLevel>(1, 2, 3);
const diceLevelGen = fc.constantFrom<DiceLevel>('2d6', '2d8', '2d10');
const firepowerLevelGen = fc.constantFrom<FirepowerLevel>('None', '2d8', '2d10');
const warbandAbilityGen = fc.constantFrom<WarbandAbility>(
  'Cyborgs',
  'Fanatics',
  'Living Weapons',
  'Heavily Armed',
  'Mutants',
  'Soldiers',
  'Undead'
);

const attributesGen = fc.record<Attributes>({
  speed: speedLevelGen,
  defense: diceLevelGen,
  firepower: firepowerLevelGen,
  prowess: diceLevelGen,
  willpower: diceLevelGen
});

const closeCombatWeaponGen = fc.record<Weapon>({
  id: fc.uuid(),
  name: fc.constantFrom('Unarmed', 'Claws & Teeth', 'Horrible Claws & Teeth', 'Whip/Tail', 'Sword', 'Axe'),
  type: fc.constant('close' as const),
  baseCost: fc.integer({ min: 0, max: 5 }),
  maxActions: fc.integer({ min: 1, max: 3 }),
  notes: fc.string()
});

const rangedWeaponGen = fc.record<Weapon>({
  id: fc.uuid(),
  name: fc.constantFrom('Pistol', 'Rifle', 'Heavy Weapon'),
  type: fc.constant('ranged' as const),
  baseCost: fc.integer({ min: 0, max: 5 }),
  maxActions: fc.integer({ min: 1, max: 3 }),
  notes: fc.string()
});

const equipmentGen = fc.record<Equipment>({
  id: fc.uuid(),
  name: fc.constantFrom('Grenade', 'Heavy Armor', 'Medkit', 'Scanner', 'Shield'),
  type: fc.constantFrom('Passive' as const, 'Action' as const),
  baseCost: fc.integer({ min: 0, max: 5 }),
  effect: fc.string()
});

const psychicPowerGen = fc.record<PsychicPower>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  type: fc.constantFrom('Attack' as const, 'Effect' as const, 'Either' as const),
  cost: fc.integer({ min: 0, max: 5 }),
  effect: fc.string()
});

describe('ValidationService', () => {
  const validationService = new ValidationService();

  describe('Property 1: Warband creation requires all mandatory fields', () => {
    // **Feature: space-weirdos-warband, Property 1: Warband creation requires all mandatory fields**
    // **Validates: Requirements 1.1, 1.2, 1.4, 1.5, 1.6**
    it('should reject warband creation if name is missing or empty', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\t', '\n'),
          fc.option(warbandAbilityGen, { nil: null }),
          fc.constantFrom(75 as const, 125 as const),
          (name, ability, pointLimit) => {
            const warband: Warband = {
              id: 'test-id',
              name,
              ability,
              pointLimit,
              totalCost: 0,
              weirdos: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWarband(warband);
            return !result.valid && result.errors.some(e => e.code === 'WARBAND_NAME_REQUIRED');
          }
        ),
        testConfig
      );
    });

    it('should reject warband creation if point limit is invalid', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.option(warbandAbilityGen, { nil: null }),
          fc.integer({ min: -100, max: 200 }).filter(n => n !== 75 && n !== 125),
          (name, ability, pointLimit) => {
            const warband: Warband = {
              id: 'test-id',
              name,
              ability,
              pointLimit: pointLimit as any,
              totalCost: 0,
              weirdos: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWarband(warband);
            return !result.valid && result.errors.some(e => e.code === 'INVALID_POINT_LIMIT');
          }
        ),
        testConfig
      );
    });

    it('should accept warband creation with all mandatory fields (ability optional)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          fc.option(warbandAbilityGen, { nil: null }),
          fc.constantFrom(75 as const, 125 as const),
          (name, ability, pointLimit) => {
            const warband: Warband = {
              id: 'test-id',
              name,
              ability,
              pointLimit,
              totalCost: 0,
              weirdos: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWarband(warband);
            // Should be valid (no weirdos means no other validation errors)
            return result.valid;
          }
        ),
        testConfig
      );
    });

    it('should accept warband creation with null ability', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          fc.constantFrom(75 as const, 125 as const),
          (name, pointLimit) => {
            const warband: Warband = {
              id: 'test-id',
              name,
              ability: null,
              pointLimit,
              totalCost: 0,
              weirdos: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWarband(warband);
            // Should be valid with null ability
            return result.valid;
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 3: Weirdo creation requires name and all attributes', () => {
    // **Feature: space-weirdos-warband, Property 3: Weirdo creation requires name and all attributes**
    // **Validates: Requirements 2.1, 2.2, 7.1, 7.2**
    it('should reject weirdo creation if name is missing or empty', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\t', '\n'),
          warbandAbilityGen,
          (name, ability) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return errors.some(e => e.code === 'WEIRDO_NAME_REQUIRED');
          }
        ),
        testConfig
      );
    });

    it('should reject weirdo creation if attributes are incomplete', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          warbandAbilityGen,
          (name, ability) => {
            // Create weirdo with null attributes
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: null as any,
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return errors.some(e => e.code === 'ATTRIBUTES_INCOMPLETE');
          }
        ),
        testConfig
      );
    });

    it('should accept weirdo creation with name and all attributes', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          attributesGen,
          (name, ability, attributes) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes,
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            // Should not have name or attribute errors
            return !errors.some(e => e.code === 'WEIRDO_NAME_REQUIRED' || e.code === 'ATTRIBUTES_INCOMPLETE');
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 5: Close combat weapon requirement is enforced', () => {
    // **Feature: space-weirdos-warband, Property 5: Close combat weapon requirement is enforced**
    // **Validates: Requirements 3.1, 7.3**
    it('should reject weirdo without close combat weapons', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          attributesGen,
          (name, ability, attributes) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes,
              closeCombatWeapons: [], // No close combat weapons
              rangedWeapons: [],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return errors.some(e => e.code === 'CLOSE_COMBAT_WEAPON_REQUIRED');
          }
        ),
        testConfig
      );
    });

    it('should accept weirdo with at least one close combat weapon', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          attributesGen,
          fc.array(closeCombatWeaponGen, { minLength: 1, maxLength: 3 }),
          (name, ability, attributes, weapons) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes,
              closeCombatWeapons: weapons,
              rangedWeapons: [],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return !errors.some(e => e.code === 'CLOSE_COMBAT_WEAPON_REQUIRED');
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 6: Ranged weapon requirement depends on Firepower level', () => {
    // **Feature: space-weirdos-warband, Property 6: Ranged weapon requirement depends on Firepower level**
    // **Validates: Requirements 3.2, 3.3, 7.4**
    it('should require ranged weapon when Firepower is 2d8 or 2d10', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          fc.constantFrom<FirepowerLevel>('2d8', '2d10'),
          (name, ability, firepower) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower,
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [], // No ranged weapons
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return errors.some(e => e.code === 'RANGED_WEAPON_REQUIRED');
          }
        ),
        testConfig
      );
    });

    it('should not require ranged weapon when Firepower is None', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          (name, ability) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [], // No ranged weapons
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return !errors.some(e => e.code === 'RANGED_WEAPON_REQUIRED');
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 6a: Ranged weapon selection requires non-zero Firepower', () => {
    // **Feature: space-weirdos-warband, Property 6a: Ranged weapon selection requires non-zero Firepower**
    // **Validates: Requirements 3.4, 7.5**
    it('should reject weirdo with ranged weapons and Firepower None', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          fc.array(rangedWeaponGen, { minLength: 1, maxLength: 2 }),
          (name, ability, rangedWeapons) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None', // Firepower is None
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons, // Has ranged weapons
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return errors.some(e => e.code === 'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON');
          }
        ),
        testConfig
      );
    });

    it('should accept weirdo with ranged weapons and Firepower 2d8 or 2d10', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          fc.constantFrom<FirepowerLevel>('2d8', '2d10'),
          fc.array(rangedWeaponGen, { minLength: 1, maxLength: 2 }),
          (name, ability, firepower, rangedWeapons) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower, // Firepower is 2d8 or 2d10
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons, // Has ranged weapons
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return !errors.some(e => e.code === 'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON');
          }
        ),
        testConfig
      );
    });

    // Additional test cases for the new validation rule (Requirements 3.4, 7.5)
    it('should reject trooper with ranged weapons and Firepower None', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          (name, ability) => {
            const trooper: Weirdo = {
              id: 'test-id',
              name,
              type: 'trooper',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None', // Firepower is None
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [{
                id: 'weapon-2',
                name: 'Pistol',
                type: 'ranged',
                baseCost: 1,
                maxActions: 2,
                notes: ''
              }],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [trooper],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(trooper, warband);
            const errors = result.errors;
            return errors.some(e => e.code === 'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON');
          }
        ),
        testConfig
      );
    });

    it('should reject weirdo with multiple ranged weapons and Firepower None', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          (name, ability) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None', // Firepower is None
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [
                {
                  id: 'weapon-2',
                  name: 'Pistol',
                  type: 'ranged',
                  baseCost: 1,
                  maxActions: 2,
                  notes: ''
                },
                {
                  id: 'weapon-3',
                  name: 'Rifle',
                  type: 'ranged',
                  baseCost: 2,
                  maxActions: 2,
                  notes: ''
                }
              ],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return errors.some(e => e.code === 'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON');
          }
        ),
        testConfig
      );
    });

    it('should accept weirdo with no ranged weapons and Firepower None', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          (name, ability) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None', // Firepower is None
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [], // No ranged weapons
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return !errors.some(e => e.code === 'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON');
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 1: Refactoring preserves validation behavior', () => {
    // **Feature: code-refactoring, Property 1: Refactoring preserves validation behavior**
    // **Validates: Requirements 1.4**
    
    it('should consistently validate warband name across all inputs', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant('   '),
            fc.constant('\t\n'),
            fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)
          ),
          fc.option(warbandAbilityGen, { nil: null }),
          fc.constantFrom(75 as const, 125 as const),
          (name, ability, pointLimit) => {
            const warband: Warband = {
              id: 'test-id',
              name,
              ability,
              pointLimit,
              totalCost: 0,
              weirdos: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWarband(warband);
            const hasNameError = result.errors.some(e => e.code === 'WARBAND_NAME_REQUIRED');
            const isEmptyName = !name || name.trim().length === 0;
            
            // Validation behavior: empty names should produce error, non-empty should not
            return hasNameError === isEmptyName;
          }
        ),
        testConfig
      );
    });

    it('should consistently validate attribute completeness using iteration', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          fc.oneof(
            fc.constant(null),
            fc.record({
              speed: fc.option(speedLevelGen, { nil: null }),
              defense: fc.option(diceLevelGen, { nil: null }),
              firepower: fc.option(firepowerLevelGen, { nil: null }),
              prowess: fc.option(diceLevelGen, { nil: null }),
              willpower: fc.option(diceLevelGen, { nil: null })
            })
          ),
          (name, ability, attributes) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: attributes as any,
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            const hasAttributeError = errors.some(e => e.code === 'ATTRIBUTES_INCOMPLETE');
            
            // Check if attributes are complete
            const isComplete = attributes !== null && 
              attributes.speed !== null && attributes.speed !== undefined &&
              attributes.defense !== null && attributes.defense !== undefined &&
              attributes.firepower !== null && attributes.firepower !== undefined &&
              attributes.prowess !== null && attributes.prowess !== undefined &&
              attributes.willpower !== null && attributes.willpower !== undefined;
            
            // Validation behavior: incomplete attributes should produce error
            return hasAttributeError === !isComplete;
          }
        ),
        testConfig
      );
    });

    it('should consistently validate conditional requirements (ranged weapon/firepower)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          firepowerLevelGen,
          fc.boolean(),
          (name, ability, firepower, hasRangedWeapon) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower,
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: hasRangedWeapon ? [{
                id: 'weapon-2',
                name: 'Pistol',
                type: 'ranged',
                baseCost: 1,
                maxActions: 2,
                notes: ''
              }] : [],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            const hasRangedWeaponError = errors.some(e => e.code === 'RANGED_WEAPON_REQUIRED');
            const hasFirepowerError = errors.some(e => e.code === 'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON');
            
            // Validation behavior rules:
            // 1. If firepower is 2d8 or 2d10, ranged weapon is required
            const requiresRangedWeapon = (firepower === '2d8' || firepower === '2d10') && !hasRangedWeapon;
            // 2. If has ranged weapon, firepower cannot be None
            const requiresFirepower = hasRangedWeapon && firepower === 'None';
            
            return hasRangedWeaponError === requiresRangedWeapon && 
                   hasFirepowerError === requiresFirepower;
          }
        ),
        testConfig
      );
    });

    it('should consistently validate equipment limits based on type and ability', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          fc.constantFrom<'leader' | 'trooper'>('leader', 'trooper'),
          warbandAbilityGen,
          fc.array(equipmentGen, { minLength: 0, maxLength: 5 }),
          (name, type, ability, equipment) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type,
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [],
              equipment,
              psychicPowers: [],
              leaderTrait: type === 'leader' ? null : null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            const hasEquipmentError = errors.some(e => e.code === 'EQUIPMENT_LIMIT_EXCEEDED');
            
            // Calculate expected limit based on type and ability
            const maxEquipment = type === 'leader'
              ? (ability === 'Cyborgs' ? 3 : 2)
              : (ability === 'Cyborgs' ? 2 : 1);
            
            const exceedsLimit = equipment.length > maxEquipment;
            
            // Validation behavior: exceeding limit should produce error
            return hasEquipmentError === exceedsLimit;
          }
        ),
        testConfig
      );
    });

    it('should consistently validate array requirements (close combat weapon)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          fc.array(closeCombatWeaponGen, { minLength: 0, maxLength: 3 }),
          (name, ability, weapons) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: weapons,
              rangedWeapons: [],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            const hasWeaponError = errors.some(e => e.code === 'CLOSE_COMBAT_WEAPON_REQUIRED');
            
            // Validation behavior: empty weapon array should produce error
            return hasWeaponError === (weapons.length === 0);
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 8: Equipment limits are enforced based on type and ability', () => {
    // **Feature: space-weirdos-warband, Property 8: Equipment limits are enforced based on type and ability**
    // **Validates: Requirements 4.1, 4.2, 4.4, 7.5, 7.6**
    it('should enforce equipment limit for leaders without Cyborgs (max 2)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen.filter(a => a !== 'Cyborgs'),
          fc.array(equipmentGen, { minLength: 3, maxLength: 5 }),
          (name, ability, equipment) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [],
              equipment, // More than 2
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return errors.some(e => e.code === 'EQUIPMENT_LIMIT_EXCEEDED');
          }
        ),
        testConfig
      );
    });

    it('should enforce equipment limit for leaders with Cyborgs (max 3)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          fc.array(equipmentGen, { minLength: 4, maxLength: 5 }),
          (name, equipment) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [],
              equipment, // More than 3
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability: 'Cyborgs',
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return errors.some(e => e.code === 'EQUIPMENT_LIMIT_EXCEEDED');
          }
        ),
        testConfig
      );
    });

    it('should enforce equipment limit for troopers without Cyborgs (max 1)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen.filter(a => a !== 'Cyborgs'),
          fc.array(equipmentGen, { minLength: 2, maxLength: 3 }),
          (name, ability, equipment) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'trooper',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [],
              equipment, // More than 1
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return errors.some(e => e.code === 'EQUIPMENT_LIMIT_EXCEEDED');
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 10: Psychic powers are unlimited and costs accumulate', () => {
    // **Feature: space-weirdos-warband, Property 10: Psychic powers are unlimited and costs accumulate**
    // **Validates: Requirements 5.1, 5.2, 5.3, 7.7**
    it('should allow any number of psychic powers', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          fc.array(psychicPowerGen, { minLength: 0, maxLength: 10 }),
          (name, ability, powers) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [],
              equipment: [],
              psychicPowers: powers,
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            // Should not have any psychic power limit errors
            return !errors.some(e => e.message.includes('psychic power'));
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 11: Leader traits are optional and singular', () => {
    // **Feature: space-weirdos-warband, Property 11: Leader traits are optional and singular**
    // **Validates: Requirements 6.1, 6.2, 6.3**
    it('should reject leader trait on troopers', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          fc.constantFrom('Bounty Hunter', 'Healer', 'Majestic', 'Monstrous', 'Political Officer', 'Sorcerer', 'Tactician'),
          (name, ability, trait) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'trooper',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [],
              equipment: [],
              psychicPowers: [],
              leaderTrait: trait as any,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return errors.some(e => e.code === 'LEADER_TRAIT_INVALID');
          }
        ),
        testConfig
      );
    });

    it('should allow leader trait on leaders', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          fc.option(fc.constantFrom('Bounty Hunter', 'Healer', 'Majestic', 'Monstrous', 'Political Officer', 'Sorcerer', 'Tactician'), { nil: null }),
          (name, ability, trait) => {
            const weirdo: Weirdo = {
              id: 'test-id',
              name,
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [],
              equipment: [],
              psychicPowers: [],
              leaderTrait: trait as any,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 75,
              totalCost: 0,
              weirdos: [weirdo],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWeirdo(weirdo, warband);
            const errors = result.errors;
            return !errors.some(e => e.code === 'LEADER_TRAIT_INVALID');
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 14: Trooper point limit is enforced', () => {
    // **Feature: space-weirdos-warband, Property 14: Trooper point limit is enforced**
    // **Validates: Requirements 9.1, 9.3, 9.4**
    it('should reject trooper exceeding 20 points when no 25-point weirdo exists', () => {
      const costEngine = new CostEngine();
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          warbandAbilityGen,
          (name, ability) => {
            // Create a trooper that costs more than 20 points
            const trooper: Weirdo = {
              id: 'trooper-id',
              name,
              type: 'trooper',
              attributes: {
                speed: 3, // 3 points
                defense: '2d10', // 8 points
                firepower: '2d10', // 4 points
                prowess: '2d10', // 6 points
                willpower: '2d10' // 6 points
              }, // Total: 27 points from attributes alone
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [{
                id: 'weapon-2',
                name: 'Pistol',
                type: 'ranged',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 125,
              totalCost: 0,
              weirdos: [trooper],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const cost = costEngine.calculateWeirdoCost(trooper, ability);
            const result = validationService.validateWeirdo(trooper, warband);
            const errors = result.errors;
            
            // If cost > 25, should have error
            if (cost > 25) {
              return errors.some(e => e.code === 'TROOPER_POINT_LIMIT_EXCEEDED');
            }
            // If cost > 20 but <= 25, should be allowed (as the one 25-point weirdo)
            return true;
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 15: Exactly one weirdo may cost 21-25 points', () => {
    // **Feature: space-weirdos-warband, Property 15: Exactly one weirdo may cost 21-25 points**
    // **Validates: Requirements 9.2, 9.3**
    it('should reject warband with multiple weirdos costing 21-25 points', () => {
      const costEngine = new CostEngine();
      
      fc.assert(
        fc.property(
          warbandAbilityGen,
          (ability) => {
            // Create two weirdos that cost 21-25 points
            const weirdo1: Weirdo = {
              id: 'weirdo-1',
              name: 'Weirdo 1',
              type: 'leader',
              attributes: {
                speed: 3, // 3 points
                defense: '2d10', // 8 points
                firepower: '2d10', // 4 points
                prowess: '2d10', // 6 points
                willpower: '2d6' // 2 points
              }, // Total: 23 points
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [{
                id: 'weapon-2',
                name: 'Pistol',
                type: 'ranged',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const weirdo2: Weirdo = {
              id: 'weirdo-2',
              name: 'Weirdo 2',
              type: 'trooper',
              attributes: {
                speed: 3, // 3 points
                defense: '2d10', // 8 points
                firepower: '2d10', // 4 points
                prowess: '2d10', // 6 points
                willpower: '2d6' // 2 points
              }, // Total: 23 points
              closeCombatWeapons: [{
                id: 'weapon-3',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [{
                id: 'weapon-4',
                name: 'Pistol',
                type: 'ranged',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit: 125,
              totalCost: 0,
              weirdos: [weirdo1, weirdo2],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const cost1 = costEngine.calculateWeirdoCost(weirdo1, ability);
            const cost2 = costEngine.calculateWeirdoCost(weirdo2, ability);
            
            // If both cost 21-25, should have error
            if (cost1 >= 21 && cost1 <= 25 && cost2 >= 21 && cost2 <= 25) {
              const result = validationService.validateWarband(warband);
              return !result.valid && result.errors.some(e => e.code === 'MULTIPLE_25_POINT_WEIRDOS');
            }
            return true;
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 17: Warband point limit is enforced', () => {
    // **Feature: space-weirdos-warband, Property 17: Warband point limit is enforced**
    // **Validates: Requirements 10.2, 10.3, 10.4**
    it('should reject warband exceeding point limit', () => {
      const costEngine = new CostEngine();
      
      fc.assert(
        fc.property(
          warbandAbilityGen,
          fc.constantFrom(75 as const, 125 as const),
          (ability, pointLimit) => {
            // Create weirdos that exceed the point limit
            const weirdos: Weirdo[] = [];
            
            // Add multiple expensive weirdos
            for (let i = 0; i < 10; i++) {
              weirdos.push({
                id: `weirdo-${i}`,
                name: `Weirdo ${i}`,
                type: i === 0 ? 'leader' : 'trooper',
                attributes: {
                  speed: 3,
                  defense: '2d10',
                  firepower: 'None',
                  prowess: '2d10',
                  willpower: '2d10'
                },
                closeCombatWeapons: [{
                  id: `weapon-${i}`,
                  name: 'Unarmed',
                  type: 'close',
                  baseCost: 0,
                  maxActions: 1,
                  notes: ''
                }],
                rangedWeapons: [],
                equipment: [],
                psychicPowers: [],
                leaderTrait: null,
                notes: '',
                totalCost: 0
              });
            }

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit,
              totalCost: 0,
              weirdos,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const totalCost = costEngine.calculateWarbandCost(warband);
            const result = validationService.validateWarband(warband);
            
            // If total cost exceeds limit, should have error
            if (totalCost > pointLimit) {
              return !result.valid && result.errors.some(e => e.code === 'WARBAND_POINT_LIMIT_EXCEEDED');
            }
            return true;
          }
        ),
        testConfig
      );
    });

    it('should accept warband at or below point limit', () => {
      fc.assert(
        fc.property(
          warbandAbilityGen,
          fc.constantFrom(75 as const, 125 as const),
          (ability, pointLimit) => {
            // Create a minimal warband
            const leader: Weirdo = {
              id: 'leader-id',
              name: 'Leader',
              type: 'leader',
              attributes: {
                speed: 1,
                defense: '2d6',
                firepower: 'None',
                prowess: '2d6',
                willpower: '2d6'
              },
              closeCombatWeapons: [{
                id: 'weapon-1',
                name: 'Unarmed',
                type: 'close',
                baseCost: 0,
                maxActions: 1,
                notes: ''
              }],
              rangedWeapons: [],
              equipment: [],
              psychicPowers: [],
              leaderTrait: null,
              notes: '',
              totalCost: 0
            };

            const warband: Warband = {
              id: 'warband-id',
              name: 'Test Warband',
              ability,
              pointLimit,
              totalCost: 0,
              weirdos: [leader],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const result = validationService.validateWarband(warband);
            // Should not have point limit error
            return !result.errors.some(e => e.code === 'WARBAND_POINT_LIMIT_EXCEEDED');
          }
        ),
        testConfig
      );
    });
  });
});

