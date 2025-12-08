/**
 * Cost Calculation Constants
 * 
 * This module contains all magic numbers and constant values used in cost calculations
 * and validation throughout the application. Centralizing these values improves
 * maintainability and makes the codebase easier to understand.
 */

/**
 * Discount values for warband ability modifiers
 * Type assertion 'as const' makes this object readonly and narrows types to literal values
 * This is safe and ensures the values cannot be modified at runtime
 */
export const DISCOUNT_VALUES = {
  /** Discount applied by Mutants ability to speed attribute and specific weapons */
  MUTANT_DISCOUNT: 1,
  /** Discount applied by Heavily Armed ability to ranged weapons */
  HEAVILY_ARMED_DISCOUNT: 1,
} as const;

/**
 * Weapon lists affected by warband abilities
 * Type assertion 'as const' makes arrays and object readonly with literal types
 */
export const ABILITY_WEAPON_LISTS = {
  /** Close combat weapons that receive discount with Mutants ability
   * Type assertion 'as const' ensures array is readonly tuple type */
  MUTANT_WEAPONS: ['Claws & Teeth', 'Horrible Claws & Teeth', 'Whip/Tail'] as const,
} as const;

/**
 * Equipment lists affected by warband abilities
 * Type assertion 'as const' makes arrays and object readonly with literal types
 */
export const ABILITY_EQUIPMENT_LISTS = {
  /** Equipment items that are free with Soldiers ability
   * Type assertion 'as const' ensures array is readonly tuple type */
  SOLDIER_FREE_EQUIPMENT: ['Grenade', 'Heavy Armor', 'Medkit'] as const,
} as const;

/**
 * Point limit thresholds and values
 * Type assertion 'as const' makes this object readonly with literal types
 */
export const POINT_LIMITS = {
  /** Standard point limit for smaller warbands */
  STANDARD_LIMIT: 75,
  /** Extended point limit for larger warbands */
  EXTENDED_LIMIT: 125,
  /** Threshold percentage for "approaching limit" warnings (90%) */
  WARNING_THRESHOLD: 0.9,
} as const;

/**
 * Trooper point limit constraints
 * Type assertion 'as const' makes this object readonly with literal types
 */
export const TROOPER_LIMITS = {
  /** Standard maximum cost for troopers when another weirdo is in 21-25 range */
  STANDARD_LIMIT: 20,
  /** Absolute maximum cost for any trooper */
  MAXIMUM_LIMIT: 25,
  /** Minimum cost for special 21-25 point slot */
  SPECIAL_SLOT_MIN: 21,
  /** Maximum cost for special 21-25 point slot */
  SPECIAL_SLOT_MAX: 25,
} as const;

/**
 * Equipment limits based on weirdo type and warband ability
 * Type assertion 'as const' makes this object readonly with literal types
 */
export const EQUIPMENT_LIMITS = {
  /** Equipment limit for leaders without Cyborgs ability */
  LEADER_STANDARD: 2,
  /** Equipment limit for leaders with Cyborgs ability */
  LEADER_CYBORGS: 3,
  /** Equipment limit for troopers without Cyborgs ability */
  TROOPER_STANDARD: 1,
  /** Equipment limit for troopers with Cyborgs ability */
  TROOPER_CYBORGS: 2,
} as const;
