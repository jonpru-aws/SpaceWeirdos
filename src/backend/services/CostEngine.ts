import {
  Weirdo,
  Warband,
  Weapon,
  Equipment,
  PsychicPower,
  WarbandAbility,
  AttributeType,
  AttributeLevel,
  SpeedLevel,
  DiceLevel,
  FirepowerLevel
} from '../models/types';
import { createCostModifierStrategy } from './CostModifierStrategy';

/**
 * Cost Engine Service
 * Calculates point costs for weirdos and warbands with warband ability modifiers
 */
export class CostEngine {
  /**
   * Attribute cost lookup table
   */
  private static readonly ATTRIBUTE_COSTS = {
    speed: {
      1: 0,
      2: 1,
      3: 3
    },
    defense: {
      '2d6': 2,
      '2d8': 4,
      '2d10': 8
    },
    firepower: {
      'None': 0,
      '2d8': 2,
      '2d10': 4
    },
    prowess: {
      '2d6': 2,
      '2d8': 4,
      '2d10': 6
    },
    willpower: {
      '2d6': 2,
      '2d8': 4,
      '2d10': 6
    }
  };

  /**
   * Calculates the point cost of a single attribute with warband ability modifiers applied.
   * Uses a lookup table for base costs and applies ability-specific discounts via strategy pattern.
   * 
   * @param attribute - The attribute type (speed, defense, firepower, prowess, willpower)
   * @param level - The attribute level (varies by attribute type)
   * @param warbandAbility - The warband ability that may modify costs (null if none)
   * @returns The calculated point cost for the attribute
   */
  getAttributeCost(
    attribute: AttributeType,
    level: AttributeLevel,
    warbandAbility: WarbandAbility | null
  ): number {
    let baseCost = 0;

    // Look up base cost from table
    if (attribute === 'speed') {
      baseCost = CostEngine.ATTRIBUTE_COSTS.speed[level as SpeedLevel];
    } else if (attribute === 'defense') {
      baseCost = CostEngine.ATTRIBUTE_COSTS.defense[level as DiceLevel];
    } else if (attribute === 'firepower') {
      baseCost = CostEngine.ATTRIBUTE_COSTS.firepower[level as FirepowerLevel];
    } else if (attribute === 'prowess') {
      baseCost = CostEngine.ATTRIBUTE_COSTS.prowess[level as DiceLevel];
    } else if (attribute === 'willpower') {
      baseCost = CostEngine.ATTRIBUTE_COSTS.willpower[level as DiceLevel];
    }

    // Apply warband ability modifiers using strategy pattern
    const strategy = createCostModifierStrategy(warbandAbility);
    return strategy.applyAttributeDiscount(attribute, level, baseCost);
  }

  /**
   * Calculates the point cost of a weapon with warband ability modifiers applied.
   * Uses strategy pattern to apply ability-specific discounts (e.g., Mutants, Heavily Armed).
   * 
   * @param weapon - The weapon to calculate cost for
   * @param warbandAbility - The warband ability that may modify costs (null if none)
   * @returns The calculated point cost for the weapon (minimum 0)
   */
  getWeaponCost(weapon: Weapon, warbandAbility: WarbandAbility | null): number {
    // Apply warband ability modifiers using strategy pattern
    const strategy = createCostModifierStrategy(warbandAbility);
    return strategy.applyWeaponDiscount(weapon);
  }

  /**
   * Calculates the point cost of equipment with warband ability modifiers applied.
   * Uses strategy pattern to apply ability-specific discounts (e.g., Soldiers get free equipment).
   * 
   * @param equipment - The equipment to calculate cost for
   * @param warbandAbility - The warband ability that may modify costs (null if none)
   * @returns The calculated point cost for the equipment (minimum 0)
   */
  getEquipmentCost(equipment: Equipment, warbandAbility: WarbandAbility | null): number {
    // Apply warband ability modifiers using strategy pattern
    const strategy = createCostModifierStrategy(warbandAbility);
    return strategy.applyEquipmentDiscount(equipment);
  }

  /**
   * Calculates the point cost of a psychic power.
   * Psychic powers have fixed costs with no warband ability modifiers.
   * 
   * @param power - The psychic power to calculate cost for
   * @returns The point cost of the psychic power
   */
  getPsychicPowerCost(power: PsychicPower): number {
    return power.cost;
  }

  /**
   * Calculates the total point cost of a weirdo by summing all component costs.
   * Includes attributes, weapons (close combat and ranged), equipment, and psychic powers.
   * All costs are calculated with warband ability modifiers applied.
   * 
   * @param weirdo - The weirdo to calculate total cost for
   * @param warbandAbility - The warband ability that may modify costs (null if none)
   * @returns The total point cost of the weirdo
   */
  calculateWeirdoCost(weirdo: Weirdo, warbandAbility: WarbandAbility | null): number {
    let totalCost = 0;

    // Calculate attribute costs
    totalCost += this.getAttributeCost('speed', weirdo.attributes.speed, warbandAbility);
    totalCost += this.getAttributeCost('defense', weirdo.attributes.defense, warbandAbility);
    totalCost += this.getAttributeCost('firepower', weirdo.attributes.firepower, warbandAbility);
    totalCost += this.getAttributeCost('prowess', weirdo.attributes.prowess, warbandAbility);
    totalCost += this.getAttributeCost('willpower', weirdo.attributes.willpower, warbandAbility);

    // Calculate weapon costs
    for (const weapon of weirdo.closeCombatWeapons) {
      totalCost += this.getWeaponCost(weapon, warbandAbility);
    }
    for (const weapon of weirdo.rangedWeapons) {
      totalCost += this.getWeaponCost(weapon, warbandAbility);
    }

    // Calculate equipment costs
    for (const equip of weirdo.equipment) {
      totalCost += this.getEquipmentCost(equip, warbandAbility);
    }

    // Calculate psychic power costs
    for (const power of weirdo.psychicPowers) {
      totalCost += this.getPsychicPowerCost(power);
    }

    return totalCost;
  }

  /**
   * Calculates the total point cost of a warband by summing all weirdo costs.
   * Uses the warband's ability to calculate each weirdo's cost with appropriate modifiers.
   * 
   * @param warband - The warband to calculate total cost for
   * @returns The total point cost of the warband
   */
  calculateWarbandCost(warband: Warband): number {
    let totalCost = 0;

    for (const weirdo of warband.weirdos) {
      totalCost += this.calculateWeirdoCost(weirdo, warband.ability);
    }

    return totalCost;
  }
}
