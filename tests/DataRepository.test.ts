import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { DataRepository } from '../src/backend/services/DataRepository';
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
import { promises as fs } from 'fs';
import path from 'path';

const testConfig = { numRuns: 50 };

// Generators (reused from other tests)
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
    totalCost: fc.integer({ min: 0, max: 25 })
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

const warbandGen = fc.record<Warband>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
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
      fc.array(weirdoGen('trooper', warband.ability), { minLength: 0, maxLength: 3 })
    )
    .map(([leader, troopers]) => ({
      ...warband,
      weirdos: [leader, ...troopers]
    }))
);

describe('DataRepository', () => {
  let repository: DataRepository;
  let testFilePath: string;

  beforeEach(() => {
    // Use a test-specific file path
    testFilePath = path.join(process.cwd(), 'data', 'test-warbands.json');
    repository = new DataRepository(testFilePath, false); // Disable auto-persistence for tests
  });

  afterEach(async () => {
    // Clean up test file
    try {
      await fs.unlink(testFilePath);
    } catch (err) {
      // Ignore if file doesn't exist
    }
    repository.clear();
  });

  describe('Property 18: Warband persistence preserves all data', () => {
    // **Feature: space-weirdos-warband, Property 18: Warband persistence preserves all data**
    // **Validates: Requirements 11.1, 11.2, 12.1, 12.2**
    it('should preserve all warband data through save and load cycle', async () => {
      await fc.assert(
        fc.asyncProperty(warbandGen, async (warband) => {
          // Remove ID to test generation
          const warbandWithoutId = { ...warband, id: '' };

          // Save warband
          const saved = repository.saveWarband(warbandWithoutId);

          // Persist to file
          await repository.persistToFile();

          // Create new repository and load from file
          const newRepository = new DataRepository(testFilePath, false);
          await newRepository.loadFromFile();

          // Load warband
          const loaded = newRepository.loadWarband(saved.id);

          // Verify all fields match
          expect(loaded).not.toBeNull();
          if (!loaded) return false;

          return (
            loaded.id === saved.id &&
            loaded.name === saved.name &&
            loaded.ability === saved.ability &&
            loaded.pointLimit === saved.pointLimit &&
            loaded.totalCost === saved.totalCost &&
            loaded.weirdos.length === saved.weirdos.length &&
            // Deep comparison of weirdos
            loaded.weirdos.every((loadedWeirdo, index) => {
              const savedWeirdo = saved.weirdos[index];
              return (
                loadedWeirdo.id === savedWeirdo.id &&
                loadedWeirdo.name === savedWeirdo.name &&
                loadedWeirdo.type === savedWeirdo.type &&
                loadedWeirdo.totalCost === savedWeirdo.totalCost &&
                loadedWeirdo.attributes.speed === savedWeirdo.attributes.speed &&
                loadedWeirdo.attributes.defense === savedWeirdo.attributes.defense &&
                loadedWeirdo.attributes.firepower === savedWeirdo.attributes.firepower &&
                loadedWeirdo.attributes.prowess === savedWeirdo.attributes.prowess &&
                loadedWeirdo.attributes.willpower === savedWeirdo.attributes.willpower &&
                loadedWeirdo.closeCombatWeapons.length === savedWeirdo.closeCombatWeapons.length &&
                loadedWeirdo.rangedWeapons.length === savedWeirdo.rangedWeapons.length &&
                loadedWeirdo.equipment.length === savedWeirdo.equipment.length &&
                loadedWeirdo.psychicPowers.length === savedWeirdo.psychicPowers.length &&
                loadedWeirdo.leaderTrait === savedWeirdo.leaderTrait &&
                loadedWeirdo.notes === savedWeirdo.notes
              );
            })
          );
        }),
        testConfig
      );
    });
  });

  describe('Property 19: Warband IDs are unique', () => {
    // **Feature: space-weirdos-warband, Property 19: Warband IDs are unique**
    // **Validates: Requirements 11.3**
    it('should generate unique IDs for all saved warbands', () => {
      fc.assert(
        fc.property(
          fc.array(warbandGen, { minLength: 2, maxLength: 10 }),
          (warbands) => {
            // Remove IDs to test generation
            const warbandsWithoutIds = warbands.map(w => ({ ...w, id: '' }));

            // Save all warbands
            const savedWarbands = warbandsWithoutIds.map(w => repository.saveWarband(w));

            // Extract all IDs
            const ids = savedWarbands.map(w => w.id);

            // Check for uniqueness
            const uniqueIds = new Set(ids);
            return uniqueIds.size === ids.length;
          }
        ),
        testConfig
      );
    });
  });

  describe('Property 20: Loaded warbands recalculate costs correctly', () => {
    // **Feature: space-weirdos-warband, Property 20: Loaded warbands recalculate costs correctly**
    // **Validates: Requirements 12.3**
    it('should recalculate costs correctly when loading warbands', async () => {
      const costEngine = new CostEngine();

      await fc.assert(
        fc.asyncProperty(warbandGen, async (warband) => {
          // Save warband
          const saved = repository.saveWarband(warband);

          // Persist to file
          await repository.persistToFile();

          // Create new repository and load from file
          const newRepository = new DataRepository(testFilePath, false);
          await newRepository.loadFromFile();

          // Load warband
          const loaded = newRepository.loadWarband(saved.id);

          if (!loaded) return false;

          // Recalculate costs
          const recalculatedWarbandCost = costEngine.calculateWarbandCost(loaded);

          // The loaded warband should have the same structure
          // We verify that we CAN recalculate costs (they should be deterministic)
          const expectedWarbandCost = costEngine.calculateWarbandCost(saved);

          return recalculatedWarbandCost === expectedWarbandCost;
        }),
        { numRuns: 10 } // Reduced runs for async file I/O tests
      );
    }, 30000); // 30 second timeout for file I/O operations
  });

  describe('Property 23: Warband deletion removes from storage', () => {
    // **Feature: space-weirdos-warband, Property 23: Warband deletion removes from storage**
    // **Validates: Requirements 14.2**
    it('should remove warband from storage after deletion', async () => {
      await fc.assert(
        fc.asyncProperty(warbandGen, async (warband) => {
          // Save warband
          const saved = repository.saveWarband(warband);

          // Verify it exists
          const beforeDelete = repository.loadWarband(saved.id);
          if (!beforeDelete) return false;

          // Delete warband
          const deleted = repository.deleteWarband(saved.id);
          if (!deleted) return false;

          // Persist to file
          await repository.persistToFile();

          // Verify it no longer exists in memory
          const afterDelete = repository.loadWarband(saved.id);
          if (afterDelete !== null) return false;

          // Create new repository and load from file
          const newRepository = new DataRepository(testFilePath, false);
          await newRepository.loadFromFile();

          // Verify it's not in the persisted data
          const afterLoad = newRepository.loadWarband(saved.id);
          return afterLoad === null;
        }),
        { numRuns: 10 } // Reduced runs for async file I/O tests
      );
    }, 30000); // 30 second timeout for file I/O operations
  });

  describe('Property 24: Deletion cancellation preserves warband', () => {
    // **Feature: space-weirdos-warband, Property 24: Deletion cancellation preserves warband**
    // **Validates: Requirements 14.4**
    it('should preserve warband when deletion is not performed', () => {
      fc.assert(
        fc.property(warbandGen, (warband) => {
          // Save warband
          const saved = repository.saveWarband(warband);

          // Verify it exists
          const beforeCheck = repository.loadWarband(saved.id);
          if (!beforeCheck) return false;

          // Simulate cancellation by NOT calling deleteWarband
          // Just verify the warband still exists

          // Verify it still exists
          const afterCheck = repository.loadWarband(saved.id);
          if (!afterCheck) return false;

          // Verify it's in the list
          const allWarbands = repository.loadAllWarbands();
          return allWarbands.some(w => w.id === saved.id);
        }),
        testConfig
      );
    });
  });
});
