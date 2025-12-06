import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
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
  PsychicPower
} from '../src/backend/models/types';

const testConfig = { numRuns: 50 };

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

const weirdoGen = (type: 'leader' | 'trooper', warbandAbility: WarbandAbility) =>
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
    totalCost: fc.constant(0)
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

describe('CostEngine Refactoring', () => {
  const costEngine = new CostEngine();

  describe('Property 2: Refactoring preserves cost calculation', () => {
    // **Feature: code-refactoring, Property 2: Refactoring preserves cost calculation**
    // **Validates: Requirements 3.4**
    it('should calculate identical costs after strategy pattern refactoring', () => {
      fc.assert(
        fc.property(warbandAbilityGen, (ability) => {
          return fc.assert(
            fc.property(weirdoGen('leader', ability), (weirdo) => {
              // Calculate expected costs using the specification
              const speedCosts = { 1: 0, 2: 1, 3: 3 };
              const diceCosts = { '2d6': 2, '2d8': 4, '2d10': 8 };
              const firepowerCosts = { 'None': 0, '2d8': 2, '2d10': 4 };
              const prowessCosts = { '2d6': 2, '2d8': 4, '2d10': 6 };
              const willpowerCosts = { '2d6': 2, '2d8': 4, '2d10': 6 };

              let expectedTotal = 0;

              // Attributes
              let speedCost = speedCosts[weirdo.attributes.speed];
              if (ability === 'Mutants') {
                speedCost = Math.max(0, speedCost - 1);
              }
              expectedTotal += speedCost;
              expectedTotal += diceCosts[weirdo.attributes.defense];
              expectedTotal += firepowerCosts[weirdo.attributes.firepower];
              expectedTotal += prowessCosts[weirdo.attributes.prowess];
              expectedTotal += willpowerCosts[weirdo.attributes.willpower];

              // Close combat weapons
              for (const weapon of weirdo.closeCombatWeapons) {
                let cost = weapon.baseCost;
                if (ability === 'Mutants') {
                  const mutantWeapons = ['Claws & Teeth', 'Horrible Claws & Teeth', 'Whip/Tail'];
                  if (mutantWeapons.includes(weapon.name)) {
                    cost = Math.max(0, cost - 1);
                  }
                }
                expectedTotal += cost;
              }

              // Ranged weapons
              for (const weapon of weirdo.rangedWeapons) {
                let cost = weapon.baseCost;
                if (ability === 'Heavily Armed') {
                  cost = Math.max(0, cost - 1);
                }
                expectedTotal += cost;
              }

              // Equipment
              for (const equip of weirdo.equipment) {
                let cost = equip.baseCost;
                if (ability === 'Soldiers') {
                  const freeEquipment = ['Grenade', 'Heavy Armor', 'Medkit'];
                  if (freeEquipment.includes(equip.name)) {
                    cost = 0;
                  }
                }
                expectedTotal += cost;
              }

              // Psychic powers
              for (const power of weirdo.psychicPowers) {
                expectedTotal += power.cost;
              }

              // Calculate actual total using refactored code
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
});
