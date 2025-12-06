import {
  Weapon,
  Equipment,
  AttributeType,
  AttributeLevel,
  WarbandAbility
} from '../models/types';
import {
  DISCOUNT_VALUES,
  ABILITY_WEAPON_LISTS,
  ABILITY_EQUIPMENT_LISTS
} from '../constants/costs';

/**
 * Strategy interface for applying warband ability-based cost modifiers
 */
export interface CostModifierStrategy {
  /**
   * Apply discount to weapon cost based on warband ability
   */
  applyWeaponDiscount(weapon: Weapon): number;

  /**
   * Apply discount to equipment cost based on warband ability
   */
  applyEquipmentDiscount(equipment: Equipment): number;

  /**
   * Apply discount to attribute cost based on warband ability
   */
  applyAttributeDiscount(attribute: AttributeType, level: AttributeLevel, baseCost: number): number;
}

/**
 * Default strategy with no modifiers
 */
export class DefaultCostStrategy implements CostModifierStrategy {
  applyWeaponDiscount(weapon: Weapon): number {
    return weapon.baseCost;
  }

  applyEquipmentDiscount(equipment: Equipment): number {
    return equipment.baseCost;
  }

  applyAttributeDiscount(attribute: AttributeType, level: AttributeLevel, baseCost: number): number {
    return baseCost;
  }
}

/**
 * Mutants warband ability cost strategy
 * - Speed attribute costs reduced by 1
 * - Specific close combat weapons (Claws & Teeth, Horrible Claws & Teeth, Whip/Tail) cost reduced by 1
 */
export class MutantsCostStrategy implements CostModifierStrategy {
  applyWeaponDiscount(weapon: Weapon): number {
    let cost = weapon.baseCost;

    if (weapon.type === 'close' && ABILITY_WEAPON_LISTS.MUTANT_WEAPONS.includes(weapon.name as any)) {
      cost -= DISCOUNT_VALUES.MUTANT_DISCOUNT;
    }

    return Math.max(0, cost);
  }

  applyEquipmentDiscount(equipment: Equipment): number {
    return equipment.baseCost;
  }

  applyAttributeDiscount(attribute: AttributeType, level: AttributeLevel, baseCost: number): number {
    if (attribute === 'speed') {
      return Math.max(0, baseCost - DISCOUNT_VALUES.MUTANT_DISCOUNT);
    }
    return baseCost;
  }
}

/**
 * Heavily Armed warband ability cost strategy
 * - Ranged weapon costs reduced by 1
 */
export class HeavilyArmedCostStrategy implements CostModifierStrategy {
  applyWeaponDiscount(weapon: Weapon): number {
    let cost = weapon.baseCost;

    if (weapon.type === 'ranged') {
      cost -= DISCOUNT_VALUES.HEAVILY_ARMED_DISCOUNT;
    }

    return Math.max(0, cost);
  }

  applyEquipmentDiscount(equipment: Equipment): number {
    return equipment.baseCost;
  }

  applyAttributeDiscount(attribute: AttributeType, level: AttributeLevel, baseCost: number): number {
    return baseCost;
  }
}

/**
 * Soldiers warband ability cost strategy
 * - Specific equipment (Grenade, Heavy Armor, Medkit) costs set to 0
 */
export class SoldiersCostStrategy implements CostModifierStrategy {
  applyWeaponDiscount(weapon: Weapon): number {
    return weapon.baseCost;
  }

  applyEquipmentDiscount(equipment: Equipment): number {
    if (ABILITY_EQUIPMENT_LISTS.SOLDIER_FREE_EQUIPMENT.includes(equipment.name as any)) {
      return 0;
    }
    return equipment.baseCost;
  }

  applyAttributeDiscount(attribute: AttributeType, level: AttributeLevel, baseCost: number): number {
    return baseCost;
  }
}

/**
 * Factory function to create the appropriate cost modifier strategy
 */
export function createCostModifierStrategy(ability: WarbandAbility | null): CostModifierStrategy {
  switch (ability) {
    case 'Mutants':
      return new MutantsCostStrategy();
    case 'Heavily Armed':
      return new HeavilyArmedCostStrategy();
    case 'Soldiers':
      return new SoldiersCostStrategy();
    default:
      return new DefaultCostStrategy();
  }
}
