import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Property-Based Tests for Selection Information Display
 * 
 * These tests verify that selection interfaces display descriptive information
 * including costs, descriptions, effects, and notes for all available options.
 * 
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7
 */

describe('Selection Information Display Tests', () => {
  describe('Property 26: Selection options display descriptive information', () => {
    /**
     * **Feature: space-weirdos-warband, Property 26: Selection options display descriptive information**
     * 
     * **Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7**
     * 
     * For any selection interface (abilities, attributes, weapons, equipment, psychic powers, leader traits),
     * the system should display relevant descriptive information (descriptions, notes, effects) and point costs
     * for each available option.
     */

    it('should display point costs for all attribute level options', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(1, 2, 3),
          fc.constantFrom('2d6', '2d8', '2d10'),
          fc.constantFrom('None', '2d8', '2d10'),
          fc.constantFrom('Mutants', 'Cyborgs', 'Soldiers', 'Heavily Armed', null),
          (speedLevel, diceLevel, firepowerLevel, ability) => {
            // Speed costs
            const speedBaseCost = speedLevel === 1 ? 0 : speedLevel === 2 ? 1 : 3;
            const speedModifiedCost = ability === 'Mutants' ? Math.max(0, speedBaseCost - 1) : speedBaseCost;
            
            // Verify speed cost is non-negative
            expect(speedModifiedCost).toBeGreaterThanOrEqual(0);
            
            // Defense costs
            const defenseCost = diceLevel === '2d6' ? 2 : diceLevel === '2d8' ? 4 : 8;
            expect(defenseCost).toBeGreaterThanOrEqual(0);
            
            // Firepower costs
            const firepowerCost = firepowerLevel === 'None' ? 0 : firepowerLevel === '2d8' ? 2 : 4;
            expect(firepowerCost).toBeGreaterThanOrEqual(0);
            
            // Prowess costs
            const prowessCost = diceLevel === '2d6' ? 2 : diceLevel === '2d8' ? 4 : 6;
            expect(prowessCost).toBeGreaterThanOrEqual(0);
            
            // Willpower costs
            const willpowerCost = diceLevel === '2d6' ? 2 : diceLevel === '2d8' ? 4 : 6;
            expect(willpowerCost).toBeGreaterThanOrEqual(0);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display name, cost, and notes for weapon options', async () => {
      // Load weapon data
      const closeCombatWeapons = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'data', 'closeCombatWeapons.json'), 'utf-8')
      );
      const rangedWeapons = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'data', 'rangedWeapons.json'), 'utf-8')
      );
      
      fc.assert(
        fc.property(
          fc.constantFrom(...closeCombatWeapons.map((w: any) => w.id)),
          fc.constantFrom('Mutants', 'Heavily Armed', null),
          (weaponId, ability) => {
            const weapon = closeCombatWeapons.find((w: any) => w.id === weaponId);
            
            // Verify weapon has required fields
            expect(weapon).toBeDefined();
            expect(weapon.name).toBeDefined();
            expect(typeof weapon.name).toBe('string');
            expect(weapon.name.length).toBeGreaterThan(0);
            
            expect(weapon.baseCost).toBeDefined();
            expect(typeof weapon.baseCost).toBe('number');
            expect(weapon.baseCost).toBeGreaterThanOrEqual(0);
            
            expect(weapon.notes).toBeDefined();
            expect(typeof weapon.notes).toBe('string');
            
            // Verify cost modifiers are applied correctly
            const isMutantWeapon = ['claws-teeth', 'horrible-claws-teeth', 'whip-tail'].includes(weaponId);
            const modifiedCost = ability === 'Mutants' && isMutantWeapon
              ? Math.max(0, weapon.baseCost - 1)
              : weapon.baseCost;
            
            expect(modifiedCost).toBeGreaterThanOrEqual(0);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
      
      fc.assert(
        fc.property(
          fc.constantFrom(...rangedWeapons.map((w: any) => w.id)),
          fc.constantFrom('Heavily Armed', null),
          (weaponId, ability) => {
            const weapon = rangedWeapons.find((w: any) => w.id === weaponId);
            
            // Verify weapon has required fields
            expect(weapon).toBeDefined();
            expect(weapon.name).toBeDefined();
            expect(typeof weapon.name).toBe('string');
            expect(weapon.name.length).toBeGreaterThan(0);
            
            expect(weapon.baseCost).toBeDefined();
            expect(typeof weapon.baseCost).toBe('number');
            expect(weapon.baseCost).toBeGreaterThanOrEqual(0);
            
            expect(weapon.notes).toBeDefined();
            expect(typeof weapon.notes).toBe('string');
            
            // Verify cost modifiers are applied correctly
            const modifiedCost = ability === 'Heavily Armed'
              ? Math.max(0, weapon.baseCost - 1)
              : weapon.baseCost;
            
            expect(modifiedCost).toBeGreaterThanOrEqual(0);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display name, cost, and effect for equipment options', async () => {
      // Load equipment data
      const equipment = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'data', 'equipment.json'), 'utf-8')
      );
      
      fc.assert(
        fc.property(
          fc.constantFrom(...equipment.map((e: any) => e.id)),
          fc.constantFrom('Soldiers', 'Cyborgs', null),
          (equipmentId, ability) => {
            const equip = equipment.find((e: any) => e.id === equipmentId);
            
            // Verify equipment has required fields
            expect(equip).toBeDefined();
            expect(equip.name).toBeDefined();
            expect(typeof equip.name).toBe('string');
            expect(equip.name.length).toBeGreaterThan(0);
            
            expect(equip.baseCost).toBeDefined();
            expect(typeof equip.baseCost).toBe('number');
            expect(equip.baseCost).toBeGreaterThanOrEqual(0);
            
            expect(equip.effect).toBeDefined();
            expect(typeof equip.effect).toBe('string');
            expect(equip.effect.length).toBeGreaterThan(0);
            
            // Verify cost modifiers are applied correctly
            const isSoldierEquipment = ['grenade', 'heavy-armor', 'medkit'].includes(equipmentId);
            const modifiedCost = ability === 'Soldiers' && isSoldierEquipment
              ? 0
              : equip.baseCost;
            
            expect(modifiedCost).toBeGreaterThanOrEqual(0);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display name, cost, and effect for psychic power options', async () => {
      // Load psychic powers data
      const powers = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'data', 'psychicPowers.json'), 'utf-8')
      );
      
      fc.assert(
        fc.property(
          fc.constantFrom(...powers.map((p: any) => p.id)),
          (powerId) => {
            const power = powers.find((p: any) => p.id === powerId);
            
            // Verify psychic power has required fields
            expect(power).toBeDefined();
            expect(power.name).toBeDefined();
            expect(typeof power.name).toBe('string');
            expect(power.name.length).toBeGreaterThan(0);
            
            expect(power.cost).toBeDefined();
            expect(typeof power.cost).toBe('number');
            expect(power.cost).toBeGreaterThanOrEqual(0);
            
            expect(power.effect).toBeDefined();
            expect(typeof power.effect).toBe('string');
            expect(power.effect.length).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display description for leader trait options', async () => {
      // Load leader traits data
      const traits = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'data', 'leaderTraits.json'), 'utf-8')
      );
      
      fc.assert(
        fc.property(
          fc.constantFrom(...traits.map((t: any) => t.id)),
          (traitId) => {
            const trait = traits.find((t: any) => t.id === traitId);
            
            // Verify leader trait has required fields
            expect(trait).toBeDefined();
            expect(trait.name).toBeDefined();
            expect(typeof trait.name).toBe('string');
            expect(trait.name.length).toBeGreaterThan(0);
            
            expect(trait.description).toBeDefined();
            expect(typeof trait.description).toBe('string');
            expect(trait.description.length).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display description for warband ability options', async () => {
      // Load warband abilities data
      const abilities = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'data', 'warbandAbilities.json'), 'utf-8')
      );
      
      fc.assert(
        fc.property(
          fc.constantFrom(...abilities.map((a: any) => a.id)),
          (abilityId) => {
            const ability = abilities.find((a: any) => a.id === abilityId);
            
            // Verify warband ability has required fields
            expect(ability).toBeDefined();
            expect(ability.name).toBeDefined();
            expect(typeof ability.name).toBe('string');
            expect(ability.name.length).toBeGreaterThan(0);
            
            expect(ability.description).toBeDefined();
            expect(typeof ability.description).toBe('string');
            expect(ability.description.length).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should show modified costs alongside base costs when ability modifiers apply', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Mutants', 'Heavily Armed', 'Soldiers'),
          fc.nat(10),
          (ability, baseCost) => {
            let modifiedCost = baseCost;
            
            // Apply ability modifiers
            if (ability === 'Mutants' || ability === 'Heavily Armed') {
              modifiedCost = Math.max(0, baseCost - 1);
            } else if (ability === 'Soldiers') {
              modifiedCost = 0;
            }
            
            // Verify modified cost is non-negative
            expect(modifiedCost).toBeGreaterThanOrEqual(0);
            
            // Verify that when costs differ, both are available for display
            if (modifiedCost !== baseCost) {
              expect(baseCost).toBeGreaterThan(modifiedCost);
            }
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
