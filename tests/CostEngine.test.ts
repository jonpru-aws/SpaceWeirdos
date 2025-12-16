import { describe, it, beforeEach } from 'vitest';
import fc from 'fast-check';
import { CostEngine } from '../src/backend/services/CostEngine';
import { CostConfig } from '../src/backend/config/types';
import { ConfigurationManager } from '../src/backend/config/ConfigurationManager';
import { ConfigurationFactory } from '../src/backend/config/ConfigurationFactory';
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

// Test configuration for CostEngine
const testCostConfig: CostConfig = {
  pointLimits: {
    standard: 75,
    extended: 125,
    warningThreshold: 0.9
  },
  trooperLimits: {
    standardLimit: 20,
    maximumLimit: 25,
    specialSlotMin: 21,
    specialSlotMax: 25
  },
  equipmentLimits: {
    leaderStandard: 2,
    leaderCyborgs: 3,
    trooperStandard: 1,
    trooperCyborgs: 3
  },
  discountValues: {
    mutantDiscount: 1,
    heavilyArmedDiscount: 1
  },
  abilityWeaponLists: {
    mutantWeapons: ['Claws & Teeth', 'Horrible Claws & Teeth', 'Whip/Tail'] as const
  },
  abilityEquipmentLists: {
    soldierFreeEquipment: ['Grenade', 'Heavy Armor', 'Medkit'] as const
  }
};

// Generators
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

const weirdoGen = (type: 'leader' | 'trooper', warbandAbility: WarbandAbility | null) =>
  fc.record<Weirdo>({
    id: fc.uuid(),
    name: fc.string({ minLength: 1 }),
    type: fc.constant(type),
    attributes: attributesGen,
    closeCombatWeapons: fc.array(closeCombatWeaponGen, { minLength: 1, maxLength: 3 }),
    rangedWeapons: fc.array(rangedWeaponGen, { minLength: 0, maxLength: 2 }),
    equipment: fc.array(equipmentGen, {
      minLength: 0,
      maxLength: type === 'leader' ? (warbandAbility === 'Cyborgs' ? 3 : 2) : warbandAbility === 'Cyborgs' ? 2 : 1
    }),
    psychicPowers: fc.array(psychicPowerGen, { minLength: 0, maxLength: 3 }),
    leaderTrait: type === 'leader' ? fc.option(fc.constantFrom('Bounty Hunter', 'Healer', 'Majestic', 'Monstrous', 'Political Officer', 'Sorcerer', 'Tactician'), { nil: null }) : fc.constant(null),
    notes: fc.string(),
    totalCost: fc.constant(0) // Will be calculated
  }).map((weirdo) => {
    // Ensure ranged weapons require Firepower 2d8 or 2d10
    if (weirdo.rangedWeapons.length > 0 && weirdo.attributes.firepower === 'None') {
      return {
        ...weirdo,
        attributes: {
          ...weirdo.attributes,
          firepower: '2d8' as FirepowerLevel
        }
      };
    }
    return weirdo;
  });

describe('CostEngine', () => {
  let costEngine: CostEngine;
  let configManager: ConfigurationManager;
  let configFactory: ConfigurationFactory;

  beforeEach(async () => {
    // Reset singleton instance for each test
    (ConfigurationManager as any).instance = null;
    
    // Initialize configuration manager
    configManager = ConfigurationManager.getInstance();
    await configManager.initialize();
    
    // Create factory and services
    configFactory = new ConfigurationFactory(configManager);
    costEngine = configFactory.createCostEngine();
  });

  describe('Property 4: Attribute costs are calculated correctly', () => {
    // **Feature: space-weirdos-warband, Property 4: Attribute costs are calculated correctly**
    // **Validates: Requirements 2.3-2.17, 7.2, 8.2**
    it('should calculate attribute costs correctly with warband ability modifiers', () => {
      fc.assert(
        fc.property(attributesGen, warbandAbilityGen, (attributes, ability) => {
          // Calculate expected costs based on lookup table
          const speedCosts = { 1: 0, 2: 1, 3: 3 };
          const diceCosts = { '2d6': 2, '2d8': 4, '2d10': 8 };
          const firepowerCosts = { 'None': 0, '2d8': 2, '2d10': 4 };
          const prowessCosts = { '2d6': 2, '2d8': 4, '2d10': 6 };
          const willpowerCosts = { '2d6': 2, '2d8': 4, '2d10': 6 };

          let expectedSpeed = speedCosts[attributes.speed];
          if (ability === 'Mutants') {
            expectedSpeed = Math.max(0, expectedSpeed - 1);
          }

          const expectedDefense = diceCosts[attributes.defense];
          const expectedFirepower = firepowerCosts[attributes.firepower];
          const expectedProwess = prowessCosts[attributes.prowess];
          const expectedWillpower = willpowerCosts[attributes.willpower];

          const actualSpeed = costEngine.getAttributeCost('speed', attributes.speed, ability);
          const actualDefense = costEngine.getAttributeCost('defense', attributes.defense, ability);
          const actualFirepower = costEngine.getAttributeCost('firepower', attributes.firepower, ability);
          const actualProwess = costEngine.getAttributeCost('prowess', attributes.prowess, ability);
          const actualWillpower = costEngine.getAttributeCost('willpower', attributes.willpower, ability);

          return (
            actualSpeed === expectedSpeed &&
            actualDefense === expectedDefense &&
            actualFirepower === expectedFirepower &&
            actualProwess === expectedProwess &&
            actualWillpower === expectedWillpower
          );
        }),
        testConfig
      );
    });
  });

  describe('Property 7: Weapon costs accumulate correctly', () => {
    // **Feature: space-weirdos-warband, Property 7: Weapon costs accumulate correctly**
    // **Validates: Requirements 3.4, 3.5, 8.1, 8.3, 8.4, 8.5**
    it('should accumulate weapon costs correctly with warband ability modifiers', () => {
      fc.assert(
        fc.property(
          fc.array(closeCombatWeaponGen, { minLength: 0, maxLength: 3 }),
          fc.array(rangedWeaponGen, { minLength: 0, maxLength: 3 }),
          warbandAbilityGen,
          (closeWeapons, rangedWeapons, ability) => {
            // Calculate expected total
            let expectedTotal = 0;

            for (const weapon of closeWeapons) {
              let cost = weapon.baseCost;
              // Apply Mutants modifier
              if (ability === 'Mutants') {
                const mutantWeapons = ['Claws & Teeth', 'Horrible Claws & Teeth', 'Whip/Tail'];
                if (mutantWeapons.includes(weapon.name)) {
                  cost = Math.max(0, cost - 1);
                }
              }
              expectedTotal += cost;
            }

            for (const weapon of rangedWeapons) {
              let cost = weapon.baseCost;
              // Apply Heavily Armed modifier
              if (ability === 'Heavily Armed') {
                cost = Math.max(0, cost - 1);
              }
              expectedTotal += cost;
            }

            // Calculate actual total
            let actualTotal = 0;
            for (const weapon of closeWeapons) {
              actualTotal += costEngine.getWeaponCost(weapon, ability);
            }
            for (const weapon of rangedWeapons) {
              actualTotal += costEngine.getWeaponCost(weapon, ability);
            }

            return actualTotal === expectedTotal;
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 9: Equipment costs accumulate correctly', () => {
    // **Feature: space-weirdos-warband, Property 9: Equipment costs accumulate correctly**
    // **Validates: Requirements 4.3, 8.6, 8.7, 8.8**
    it('should accumulate equipment costs correctly with warband ability modifiers', () => {
      fc.assert(
        fc.property(
          fc.array(equipmentGen, { minLength: 0, maxLength: 3 }),
          warbandAbilityGen,
          (equipment, ability) => {
            // Calculate expected total
            let expectedTotal = 0;

            for (const equip of equipment) {
              let cost = equip.baseCost;
              // Apply Soldiers modifier
              if (ability === 'Soldiers') {
                const freeEquipment = ['Grenade', 'Heavy Armor', 'Medkit'];
                if (freeEquipment.includes(equip.name)) {
                  cost = 0;
                }
              }
              expectedTotal += cost;
            }

            // Calculate actual total
            let actualTotal = 0;
            for (const equip of equipment) {
              actualTotal += costEngine.getEquipmentCost(equip, ability);
            }

            return actualTotal === expectedTotal;
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 13: Cost reductions never go below zero', () => {
    // **Feature: space-weirdos-warband, Property 13: Cost reductions never go below zero**
    // **Validates: Requirements 8.9**
    it('should never return negative costs after applying modifiers', () => {
      fc.assert(
        fc.property(
          attributesGen,
          fc.array(closeCombatWeaponGen, { minLength: 0, maxLength: 3 }),
          fc.array(rangedWeaponGen, { minLength: 0, maxLength: 3 }),
          fc.array(equipmentGen, { minLength: 0, maxLength: 3 }),
          warbandAbilityGen,
          (attributes, closeWeapons, rangedWeapons, equipment, ability) => {
            // Check all attribute costs are >= 0
            const speedCost = costEngine.getAttributeCost('speed', attributes.speed, ability);
            const defenseCost = costEngine.getAttributeCost('defense', attributes.defense, ability);
            const firepowerCost = costEngine.getAttributeCost('firepower', attributes.firepower, ability);
            const prowessCost = costEngine.getAttributeCost('prowess', attributes.prowess, ability);
            const willpowerCost = costEngine.getAttributeCost('willpower', attributes.willpower, ability);

            const attributeCostsValid =
              speedCost >= 0 &&
              defenseCost >= 0 &&
              firepowerCost >= 0 &&
              prowessCost >= 0 &&
              willpowerCost >= 0;

            // Check all weapon costs are >= 0
            const weaponCostsValid = [...closeWeapons, ...rangedWeapons].every(
              (weapon) => costEngine.getWeaponCost(weapon, ability) >= 0
            );

            // Check all equipment costs are >= 0
            const equipmentCostsValid = equipment.every(
              (equip) => costEngine.getEquipmentCost(equip, ability) >= 0
            );

            return attributeCostsValid && weaponCostsValid && equipmentCostsValid;
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 12: Weirdo total cost equals sum of all components', () => {
    // **Feature: space-weirdos-warband, Property 12: Weirdo total cost equals sum of all components**
    // **Validates: Requirements 7.8**
    it('should calculate weirdo total cost as sum of all component costs', () => {
      fc.assert(
        fc.property(warbandAbilityGen, (ability) => {
          return fc.assert(
            fc.property(weirdoGen('leader', ability), (weirdo) => {
              // Calculate expected total manually
              let expectedTotal = 0;

              // Attributes
              expectedTotal += costEngine.getAttributeCost('speed', weirdo.attributes.speed, ability);
              expectedTotal += costEngine.getAttributeCost('defense', weirdo.attributes.defense, ability);
              expectedTotal += costEngine.getAttributeCost('firepower', weirdo.attributes.firepower, ability);
              expectedTotal += costEngine.getAttributeCost('prowess', weirdo.attributes.prowess, ability);
              expectedTotal += costEngine.getAttributeCost('willpower', weirdo.attributes.willpower, ability);

              // Weapons
              for (const weapon of weirdo.closeCombatWeapons) {
                expectedTotal += costEngine.getWeaponCost(weapon, ability);
              }
              for (const weapon of weirdo.rangedWeapons) {
                expectedTotal += costEngine.getWeaponCost(weapon, ability);
              }

              // Equipment
              for (const equip of weirdo.equipment) {
                expectedTotal += costEngine.getEquipmentCost(equip, ability);
              }

              // Psychic Powers
              for (const power of weirdo.psychicPowers) {
                expectedTotal += costEngine.getPsychicPowerCost(power);
              }

              // Calculate actual total
              const actualTotal = costEngine.calculateWeirdoCost(weirdo, ability);

              return actualTotal === expectedTotal;
            }),
            { numRuns: 1 }
          );
        }),
        testConfig
      );
    });
  });

  describe('Property 16: Warband total cost equals sum of weirdo costs', () => {
    // **Feature: space-weirdos-warband, Property 16: Warband total cost equals sum of weirdo costs**
    // **Validates: Requirements 10.1**
    it('should calculate warband total cost as sum of all weirdo costs', () => {
      const warbandGen = fc.record<Warband>({
        id: fc.uuid(),
        name: fc.string({ minLength: 1 }),
        ability: warbandAbilityGen,
        pointLimit: fc.constantFrom(75 as const, 125 as const),
        totalCost: fc.constant(0),
        weirdos: fc.constant([]),
        createdAt: fc.date(),
        updatedAt: fc.date()
      }).chain((warband) =>
        fc
          .tuple(
            weirdoGen('leader', warband.ability),
            fc.array(weirdoGen('trooper', warband.ability), { minLength: 0, maxLength: 5 })
          )
          .map(([leader, troopers]) => ({
            ...warband,
            weirdos: [leader, ...troopers]
          }))
      );

      fc.assert(
        fc.property(warbandGen, (warband) => {
          // Calculate expected total manually
          let expectedTotal = 0;
          for (const weirdo of warband.weirdos) {
            expectedTotal += costEngine.calculateWeirdoCost(weirdo, warband.ability);
          }

          // Calculate actual total
          const actualTotal = costEngine.calculateWarbandCost(warband);

          return actualTotal === expectedTotal;
        }),
        testConfig
      );
    });
  });
});
