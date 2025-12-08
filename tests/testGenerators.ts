import fc from 'fast-check';
import type { Warband, Weirdo, Attributes, Equipment, Weapon, PsychicPower, LeaderTrait, WarbandAbility } from '../src/backend/models/types';

/**
 * Test Data Generators for Property-Based Testing
 * 
 * Provides reusable fast-check generators that produce valid test data
 * conforming to business rules and constraints.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

/**
 * Generator for valid warband names
 * Requirement 10.1: Warband names must be non-empty strings (2-50 chars)
 * Note: minLength set to 2 to avoid single-character edge cases in UI rendering
 */
export const validWarbandNameArb = fc.string({ minLength: 2, maxLength: 50 })
  .filter(name => name.trim().length > 1);

/**
 * Generator for valid weirdo names
 * Requirement 10.2: Weirdo names must be non-empty strings (1-30 chars)
 */
export const validWeirdoNameArb = fc.string({ minLength: 1, maxLength: 30 })
  .filter(name => name.trim().length > 0);

/**
 * Generator for valid point limits
 * Requirement 10.1: Point limits must be 75 or 125
 */
export const validPointLimitArb = fc.constantFrom(75, 125);

/**
 * Generator for valid weirdo types
 */
export const validWeirdoTypeArb = fc.constantFrom('leader' as const, 'trooper' as const);

/**
 * Generator for valid warband abilities
 */
export const validWarbandAbilityArb = fc.option(
  fc.constantFrom(
    'Cyborgs' as WarbandAbility,
    'Soldiers' as WarbandAbility,
    'Mutants' as WarbandAbility,
    'Psykers' as WarbandAbility,
    'Zealots' as WarbandAbility,
    'Heavily Armed' as WarbandAbility
  ),
  { nil: null }
);

/**
 * Generator for valid attribute values
 * Requirement 10.3: Attribute values must be within valid ranges
 */
export const validAttributesArb = fc.record({
  speed: fc.integer({ min: 1, max: 6 }),
  defense: fc.constantFrom('2d6', '3d6', '4d6', '5d6'),
  firepower: fc.constantFrom('None', '2d6', '3d6', '4d6', '5d6'),
  prowess: fc.constantFrom('2d6', '3d6', '4d6', '5d6'),
  willpower: fc.constantFrom('2d6', '3d6', '4d6', '5d6')
}) as fc.Arbitrary<Attributes>;

/**
 * Generator for valid equipment items
 */
export const validEquipmentArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  type: fc.constantFrom('Passive', 'Action'),
  baseCost: fc.integer({ min: 0, max: 5 }),
  effect: fc.string({ minLength: 1, maxLength: 100 })
}) as fc.Arbitrary<Equipment>;

/**
 * Generator for valid weapons
 */
export const validWeaponArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  type: fc.constantFrom('close', 'ranged'),
  baseCost: fc.integer({ min: 0, max: 5 }),
  maxActions: fc.integer({ min: 1, max: 3 }),
  notes: fc.string({ maxLength: 100 })
}) as fc.Arbitrary<Weapon>;

/**
 * Generator for valid psychic powers
 */
export const validPsychicPowerArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  type: fc.constantFrom('Attack', 'Effect', 'Defense'),
  cost: fc.integer({ min: 0, max: 5 }),
  effect: fc.string({ minLength: 1, maxLength: 100 })
}) as fc.Arbitrary<PsychicPower>;

/**
 * Generator for valid leader traits
 */
export const validLeaderTraitArb = fc.constantFrom(
  'Bounty Hunter' as LeaderTrait,
  'Healer' as LeaderTrait,
  'Tactician' as LeaderTrait,
  'Inspiring' as LeaderTrait
);

/**
 * Generator for valid weirdos
 * Requirement 10.2, 10.3, 10.4: Weirdos must have valid names, attributes, and equipment limits
 */
export const validWeirdoArb = validWeirdoTypeArb.chain(type => {
  // Requirement 10.4: Equipment respects limits (3 for leaders, 2 for troopers)
  const maxEquipment = type === 'leader' ? 3 : 2;
  
  return fc.record({
    id: fc.uuid(),
    name: validWeirdoNameArb,
    type: fc.constant(type),
    attributes: validAttributesArb,
    closeCombatWeapons: fc.constant([]),
    rangedWeapons: fc.constant([]),
    equipment: fc.array(validEquipmentArb, { maxLength: maxEquipment }),
    psychicPowers: fc.constant([]),
    leaderTrait: fc.constant(null),
    notes: fc.string({ maxLength: 500 }),
    totalCost: fc.integer({ min: 0, max: 100 })
  });
}) as fc.Arbitrary<Weirdo>;

/**
 * Generator for valid weirdo arrays with leader constraint
 * Requirement 10.3: Max 1 leader per warband, max 10 weirdos total
 */
export const validWeirdosArrayArb = fc.array(
  validWeirdoArb,
  { maxLength: 10 }
).chain(weirdos => {
  // Ensure at most 1 leader
  const leaderCount = weirdos.filter(w => w.type === 'leader').length;
  
  if (leaderCount <= 1) {
    return fc.constant(weirdos);
  }
  
  // If more than 1 leader, convert extras to troopers
  // Also fix equipment limits when converting leader to trooper
  let leaderSeen = false;
  const fixedWeirdos = weirdos.map(w => {
    if (w.type === 'leader') {
      if (leaderSeen) {
        // Convert to trooper and ensure equipment limit is respected
        return { 
          ...w, 
          type: 'trooper' as const, 
          leaderTrait: null,
          equipment: w.equipment.slice(0, 2) // Troopers can only have 2 equipment
        };
      }
      leaderSeen = true;
    }
    return w;
  });
  
  return fc.constant(fixedWeirdos);
});

/**
 * Generator for valid warbands
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */
export const validWarbandArb = fc.record({
  id: fc.uuid(),
  name: validWarbandNameArb,
  ability: validWarbandAbilityArb,
  pointLimit: validPointLimitArb,
  totalCost: fc.integer({ min: 0, max: 200 }),
  weirdos: validWeirdosArrayArb,
  createdAt: fc.date(),
  updatedAt: fc.date()
}) as fc.Arbitrary<Warband>;

/**
 * Generator for valid warband summaries (for list views)
 */
export const validWarbandSummaryArb = fc.record({
  id: fc.uuid(),
  name: validWarbandNameArb,
  ability: validWarbandAbilityArb,
  pointLimit: validPointLimitArb,
  totalCost: fc.integer({ min: 0, max: 200 }),
  weirdoCount: fc.integer({ min: 0, max: 10 })
});
