import {
  Weirdo,
  Warband,
  ValidationError,
  ValidationWarning,
  ValidationResult,
  WarbandAbility,
  Attributes
} from '../models/types.js';
import { CostEngine } from './CostEngine.js';
import {
  POINT_LIMITS,
  TROOPER_LIMITS,
  EQUIPMENT_LIMITS
} from '../constants/costs.js';
import {
  VALIDATION_MESSAGES,
  getValidationMessage,
  ValidationErrorCode
} from '../constants/validationMessages.js';

/**
 * Generic validator factory function
 * Creates reusable validators with consistent error handling
 */
type ValidatorFunction<T> = (value: T) => boolean;

interface ValidatorConfig<T> {
  field: string;
  message: string;
  code: ValidationErrorCode;
  condition: ValidatorFunction<T>;
}

/**
 * Validation Service
 * 
 * Provides comprehensive validation for Space Weirdos game rules with context-aware warnings.
 * Validates individual weirdos and complete warbands against all game constraints.
 * 
 * Key responsibilities:
 * - Validate weirdo attributes, weapons, equipment, and costs
 * - Enforce warband composition and point limits
 * - Apply faction-specific rules and modifiers
 * - Generate context-aware warnings based on warband composition
 * - Generate structured error messages and warnings for UI display
 * 
 * Warning System:
 * - Warns when weirdo cost is within 3 points of applicable limits
 * - Adapts warnings based on whether a 25-point weirdo already exists
 * - Provides clear messaging about which limits apply to each weirdo
 * 
 * The service is stateless and can be used across different contexts
 * (UI validation, API endpoints, data import/export).
 */
export class ValidationService {
  private costEngine: CostEngine;

  constructor() {
    this.costEngine = new CostEngine();
  }

  /**
   * Generic validator factory
   * Creates a validator function from a configuration
   */
  private createValidator<T>(config: ValidatorConfig<T>): (value: T) => ValidationError | null {
    return (value: T): ValidationError | null => {
      if (!config.condition(value)) {
        return {
          field: config.field,
          message: config.message,
          code: config.code
        };
      }
      return null;
    };
  }

  /**
   * Validate non-empty string helper
   */
  private validateNonEmptyString(value: string, field: string, code: ValidationErrorCode): ValidationError | null {
    const validator = this.createValidator<string>({
      field,
      message: VALIDATION_MESSAGES[code],
      code,
      condition: (val) => Boolean(val && val.trim().length > 0)
    });
    return validator(value);
  }

  /**
   * Validate warband name (non-empty string)
   */
  private validateWarbandName(name: string): ValidationError | null {
    return this.validateNonEmptyString(name, 'name', 'WARBAND_NAME_REQUIRED');
  }

  /**
   * Validate point limit (75 or 125)
   */
  private validatePointLimit(pointLimit: number): ValidationError | null {
    const validator = this.createValidator<number>({
      field: 'pointLimit',
      message: VALIDATION_MESSAGES.INVALID_POINT_LIMIT,
      code: 'INVALID_POINT_LIMIT',
      condition: (val) => val === POINT_LIMITS.STANDARD_LIMIT || val === POINT_LIMITS.EXTENDED_LIMIT
    });
    return validator(pointLimit);
  }

  /**
   * Validate warband ability (optional - no validation needed)
   */
  private validateWarbandAbility(_ability: WarbandAbility | null | undefined): ValidationError | null {
    // Warband ability is now optional, so no validation needed
    return null;
  }

  /**
   * Validate weirdo name (non-empty string)
   */
  private validateWeirdoName(weirdo: Weirdo): ValidationError | null {
    return this.validateNonEmptyString(
      weirdo.name,
      `weirdo.${weirdo.id}.name`,
      'WEIRDO_NAME_REQUIRED'
    );
  }

  /**
   * Validate attribute completeness (all 5 required)
   * Uses iteration to reduce duplication
   */
  private validateAttributeCompleteness(weirdo: Weirdo): ValidationError | null {
    const { attributes } = weirdo;
    
    if (!attributes) {
      return {
        field: `weirdo.${weirdo.id}.attributes`,
        message: VALIDATION_MESSAGES.ATTRIBUTES_INCOMPLETE,
        code: 'ATTRIBUTES_INCOMPLETE'
      };
    }

    // Define all required attributes
    const requiredAttributes: Array<keyof Attributes> = [
      'speed',
      'defense',
      'firepower',
      'prowess',
      'willpower'
    ];

    // Check each attribute using iteration
    for (const attrName of requiredAttributes) {
      const attrValue = attributes[attrName];
      
      // Special handling for speed which can be 0 (falsy but valid)
      const isInvalid = attrName === 'speed' 
        ? (attrValue === null || attrValue === undefined)
        : !attrValue;
      
      if (isInvalid) {
        return {
          field: `weirdo.${weirdo.id}.attributes.${String(attrName)}`,
          message: VALIDATION_MESSAGES.ATTRIBUTES_INCOMPLETE,
          code: 'ATTRIBUTES_INCOMPLETE'
        };
      }
    }

    return null;
  }

  /**
   * Validate array has at least one item (common pattern)
   */
  private validateArrayNotEmpty<T>(
    array: T[] | null | undefined,
    field: string,
    code: ValidationErrorCode
  ): ValidationError | null {
    const validator = this.createValidator<T[] | null | undefined>({
      field,
      message: VALIDATION_MESSAGES[code],
      code,
      condition: (arr) => arr !== null && arr !== undefined && arr.length > 0
    });
    return validator(array);
  }

  /**
   * Validate close combat weapon requirement
   */
  private validateCloseCombatWeaponRequirement(weirdo: Weirdo): ValidationError | null {
    return this.validateArrayNotEmpty(
      weirdo.closeCombatWeapons,
      `weirdo.${weirdo.id}.closeCombatWeapons`,
      'CLOSE_COMBAT_WEAPON_REQUIRED'
    );
  }

  /**
   * Validate conditional requirement (common pattern)
   * If condition is met, then requirement must be satisfied
   */
  private validateConditionalRequirement(
    condition: boolean,
    requirement: boolean,
    field: string,
    code: ValidationErrorCode
  ): ValidationError | null {
    if (condition && !requirement) {
      return {
        field,
        message: VALIDATION_MESSAGES[code],
        code
      };
    }
    return null;
  }

  /**
   * Validate ranged weapon requirement (based on Firepower)
   * Requirements: 3.2, 3.3, 3.4, 7.4, 7.5
   */
  private validateRangedWeaponRequirement(weirdo: Weirdo): ValidationError | null {
    // Skip if attributes are not set (will be caught by attribute completeness check)
    if (!weirdo.attributes) {
      return null;
    }

    const firepower = weirdo.attributes.firepower;
    const hasRangedWeapons = weirdo.rangedWeapons && weirdo.rangedWeapons.length > 0;
    
    // Ranged weapon required if Firepower is 2d8 or 2d10
    const requiresRangedWeapon = firepower === '2d8' || firepower === '2d10';
    const rangedWeaponError = this.validateConditionalRequirement(
      requiresRangedWeapon,
      hasRangedWeapons,
      `weirdo.${weirdo.id}.rangedWeapons`,
      'RANGED_WEAPON_REQUIRED'
    );
    if (rangedWeaponError) return rangedWeaponError;
    
    // Firepower level 2d8 or 2d10 required if ranged weapon is selected
    const requiresFirepower = hasRangedWeapons && firepower === 'None';
    return this.validateConditionalRequirement(
      requiresFirepower,
      false, // This condition should never be true
      `weirdo.${weirdo.id}.attributes.firepower`,
      'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON'
    );
  }

  /**
   * Validate value does not exceed limit (common pattern)
   */
  private validateLimit(
    value: number,
    limit: number,
    field: string,
    code: ValidationErrorCode,
    params?: Record<string, string | number>
  ): ValidationError | null {
    const message = params ? getValidationMessage(code, params) : VALIDATION_MESSAGES[code];
    const validator = this.createValidator<number>({
      field,
      message,
      code,
      condition: (val) => val <= limit
    });
    return validator(value);
  }

  /**
   * Validate equipment limit (based on type and Cyborgs ability)
   */
  private validateEquipmentLimit(weirdo: Weirdo, warbandAbility: WarbandAbility | null): ValidationError | null {
    const equipmentCount = weirdo.equipment ? weirdo.equipment.length : 0;
    
    const maxEquipment = weirdo.type === 'leader'
      ? (warbandAbility === 'Cyborgs' ? EQUIPMENT_LIMITS.LEADER_CYBORGS : EQUIPMENT_LIMITS.LEADER_STANDARD)
      : (warbandAbility === 'Cyborgs' ? EQUIPMENT_LIMITS.TROOPER_CYBORGS : EQUIPMENT_LIMITS.TROOPER_STANDARD);

    return this.validateLimit(
      equipmentCount,
      maxEquipment,
      `weirdo.${weirdo.id}.equipment`,
      'EQUIPMENT_LIMIT_EXCEEDED',
      { type: weirdo.type, limit: maxEquipment }
    );
  }

  /**
   * Validate trooper 20-point limit
   */
  private validateTrooperPointLimit(weirdo: Weirdo, warband: Warband): ValidationError | null {
    if (weirdo.type !== 'trooper') {
      return null;
    }

    const weirdoCost = this.costEngine.calculateWeirdoCost(weirdo, warband.ability);
    
    // Check if there's already a 21-25 point weirdo in the warband
    const has25PointWeirdo = warband.weirdos.some((w: Weirdo) => {
      if (w.id === weirdo.id) return false; // Don't count the current weirdo
      const cost = this.costEngine.calculateWeirdoCost(w, warband.ability);
      return cost >= TROOPER_LIMITS.SPECIAL_SLOT_MIN && cost <= TROOPER_LIMITS.SPECIAL_SLOT_MAX;
    });

    // If there's already a 21-25 point weirdo, this trooper must be <= 20
    if (has25PointWeirdo) {
      const limitError = this.validateLimit(
        weirdoCost,
        TROOPER_LIMITS.STANDARD_LIMIT,
        `weirdo.${weirdo.id}.totalCost`,
        'TROOPER_POINT_LIMIT_EXCEEDED',
        { cost: weirdoCost, limit: TROOPER_LIMITS.STANDARD_LIMIT }
      );
      if (limitError) return limitError;
    }

    // If this is the potential 21-25 point weirdo, it must be <= 25
    return this.validateLimit(
      weirdoCost,
      TROOPER_LIMITS.MAXIMUM_LIMIT,
      `weirdo.${weirdo.id}.totalCost`,
      'TROOPER_POINT_LIMIT_EXCEEDED',
      { cost: weirdoCost, limit: TROOPER_LIMITS.MAXIMUM_LIMIT }
    );
  }

  /**
   * Generate warnings for weirdo cost approaching limits
   * Requirements: 7.5, 7.6, 7.7, 7.8, 7.9
   * 
   * Warnings are generated when cost is within 3 points of applicable limit:
   * - No 25-point weirdo exists: warn at 18-20 (20-limit) or 23-25 (25-limit)
   * - 25-point weirdo exists (different weirdo): warn at 18-20 (20-limit only)
   * - 25-point weirdo exists (same weirdo): warn at 23-25 (25-limit)
   */
  private generateWeirdoCostWarnings(weirdo: Weirdo, warband: Warband): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    // Skip warning generation if attributes are not set (will be caught by validation errors)
    if (!weirdo.attributes) {
      return warnings;
    }
    
    const weirdoCost = this.costEngine.calculateWeirdoCost(weirdo, warband.ability);
    const warningThreshold = 3;
    
    // Check if this weirdo is in the 21-25 point range (is the 25-point weirdo)
    const isThis25PointWeirdo = weirdoCost >= TROOPER_LIMITS.SPECIAL_SLOT_MIN && 
                                 weirdoCost <= TROOPER_LIMITS.MAXIMUM_LIMIT;
    
    // Check if there's a DIFFERENT 21-25 point weirdo in the warband
    const hasOther25PointWeirdo = warband.weirdos.some((w: Weirdo) => {
      if (w.id === weirdo.id) return false; // Don't count the current weirdo
      const cost = this.costEngine.calculateWeirdoCost(w, warband.ability);
      return cost >= TROOPER_LIMITS.SPECIAL_SLOT_MIN && cost <= TROOPER_LIMITS.MAXIMUM_LIMIT;
    });

    // Determine which limits to check based on warband context
    if (hasOther25PointWeirdo) {
      // Another weirdo is using the 25-point slot, so this weirdo is limited to 20
      // Warn if within 3 points of 20-point limit (18-20)
      const pointsFrom20 = TROOPER_LIMITS.STANDARD_LIMIT - weirdoCost;
      if (pointsFrom20 >= 0 && pointsFrom20 <= warningThreshold) {
        warnings.push({
          field: `weirdo.${weirdo.id}.totalCost`,
          message: `Cost is within ${pointsFrom20} point${pointsFrom20 === 1 ? '' : 's'} of the ${TROOPER_LIMITS.STANDARD_LIMIT}-point limit`,
          code: 'COST_APPROACHING_LIMIT'
        });
      }
    } else if (isThis25PointWeirdo) {
      // This weirdo is using the 25-point slot
      // Warn if within 3 points of 25-point limit (23-25)
      const pointsFrom25 = TROOPER_LIMITS.MAXIMUM_LIMIT - weirdoCost;
      if (pointsFrom25 >= 0 && pointsFrom25 <= warningThreshold) {
        warnings.push({
          field: `weirdo.${weirdo.id}.totalCost`,
          message: `Cost is within ${pointsFrom25} point${pointsFrom25 === 1 ? '' : 's'} of the ${TROOPER_LIMITS.MAXIMUM_LIMIT}-point limit`,
          code: 'COST_APPROACHING_LIMIT'
        });
      }
    } else {
      // No 25-point weirdo exists yet, so this weirdo could use either limit
      // Warn if within 3 points of 20-point limit (18-20)
      const pointsFrom20 = TROOPER_LIMITS.STANDARD_LIMIT - weirdoCost;
      if (pointsFrom20 >= 0 && pointsFrom20 <= warningThreshold) {
        warnings.push({
          field: `weirdo.${weirdo.id}.totalCost`,
          message: `Cost is within ${pointsFrom20} point${pointsFrom20 === 1 ? '' : 's'} of the ${TROOPER_LIMITS.STANDARD_LIMIT}-point limit`,
          code: 'COST_APPROACHING_LIMIT'
        });
      }
      // Also warn if within 3 points of 25-point limit (23-25) - could become the 25-point weirdo
      const pointsFrom25 = TROOPER_LIMITS.MAXIMUM_LIMIT - weirdoCost;
      if (pointsFrom25 >= 0 && pointsFrom25 <= warningThreshold) {
        warnings.push({
          field: `weirdo.${weirdo.id}.totalCost`,
          message: `Cost is within ${pointsFrom25} point${pointsFrom25 === 1 ? '' : 's'} of the ${TROOPER_LIMITS.MAXIMUM_LIMIT}-point limit (premium weirdo slot)`,
          code: 'COST_APPROACHING_LIMIT'
        });
      }
    }

    return warnings;
  }

  /**
   * Validate 25-point weirdo limit (only one allowed)
   */
  private validate25PointWeirdoLimit(warband: Warband): ValidationError | null {
    const weirdosOver20 = warband.weirdos.filter((w: Weirdo) => {
      const cost = this.costEngine.calculateWeirdoCost(w, warband.ability);
      return cost >= TROOPER_LIMITS.SPECIAL_SLOT_MIN && cost <= TROOPER_LIMITS.SPECIAL_SLOT_MAX;
    });

    if (weirdosOver20.length > 1) {
      return {
        field: 'warband.weirdos',
        message: getValidationMessage('MULTIPLE_25_POINT_WEIRDOS', {
          min: TROOPER_LIMITS.SPECIAL_SLOT_MIN,
          max: TROOPER_LIMITS.SPECIAL_SLOT_MAX
        }),
        code: 'MULTIPLE_25_POINT_WEIRDOS'
      };
    }

    return null;
  }

  /**
   * Validate warband point limit
   */
  private validateWarbandPointLimit(warband: Warband): ValidationError | null {
    const totalCost = this.costEngine.calculateWarbandCost(warband);

    return this.validateLimit(
      totalCost,
      warband.pointLimit,
      'warband.totalCost',
      'WARBAND_POINT_LIMIT_EXCEEDED',
      { totalCost, pointLimit: warband.pointLimit }
    );
  }

  /**
   * Validate leader trait (only for leaders)
   */
  private validateLeaderTrait(weirdo: Weirdo): ValidationError | null {
    if (weirdo.type === 'trooper' && weirdo.leaderTrait !== null) {
      return {
        field: `weirdo.${weirdo.id}.leaderTrait`,
        message: VALIDATION_MESSAGES.LEADER_TRAIT_INVALID,
        code: 'LEADER_TRAIT_INVALID'
      };
    }
    return null;
  }

  /**
   * Validates a single weirdo against all game rules and constraints.
   * Checks name, attributes, weapons, equipment limits, point limits, and leader traits.
   * Also generates warnings for costs approaching limits.
   * 
   * @param weirdo - The weirdo to validate
   * @param warband - The warband context (needed for ability modifiers and point limit checks)
   * @returns Validation result with errors and warnings
   */
  validateWeirdo(weirdo: Weirdo, warband: Warband): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const nameError = this.validateWeirdoName(weirdo);
    if (nameError) errors.push(nameError);

    const attributeError = this.validateAttributeCompleteness(weirdo);
    if (attributeError) errors.push(attributeError);

    const closeCombatError = this.validateCloseCombatWeaponRequirement(weirdo);
    if (closeCombatError) errors.push(closeCombatError);

    const rangedWeaponError = this.validateRangedWeaponRequirement(weirdo);
    if (rangedWeaponError) errors.push(rangedWeaponError);

    const equipmentError = this.validateEquipmentLimit(weirdo, warband.ability);
    if (equipmentError) errors.push(equipmentError);

    const trooperLimitError = this.validateTrooperPointLimit(weirdo, warband);
    if (trooperLimitError) errors.push(trooperLimitError);

    const leaderTraitError = this.validateLeaderTrait(weirdo);
    if (leaderTraitError) errors.push(leaderTraitError);

    // Generate warnings for cost approaching limits
    const costWarnings = this.generateWeirdoCostWarnings(weirdo, warband);
    warnings.push(...costWarnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates an entire warband against all game rules and constraints.
   * Checks warband-level properties (name, point limit, ability), all weirdos,
   * and warband-level constraints (25-point limit, total cost).
   * Also collects warnings from individual weirdo validations.
   * 
   * @param warband - The warband to validate
   * @returns Validation result with valid flag, errors, and warnings
   */
  validateWarband(warband: Warband): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate warband-level fields
    const nameError = this.validateWarbandName(warband.name);
    if (nameError) errors.push(nameError);

    const pointLimitError = this.validatePointLimit(warband.pointLimit);
    if (pointLimitError) errors.push(pointLimitError);

    const abilityError = this.validateWarbandAbility(warband.ability);
    if (abilityError) errors.push(abilityError);

    // Validate each weirdo and collect warnings
    for (const weirdo of warband.weirdos) {
      const weirdoResult = this.validateWeirdo(weirdo, warband);
      errors.push(...weirdoResult.errors);
      warnings.push(...weirdoResult.warnings);
    }

    // Validate warband-level constraints
    const limit25Error = this.validate25PointWeirdoLimit(warband);
    if (limit25Error) errors.push(limit25Error);

    const warbandLimitError = this.validateWarbandPointLimit(warband);
    if (warbandLimitError) errors.push(warbandLimitError);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates weapon requirements for a weirdo.
   * Checks that at least one close combat weapon is present and that
   * ranged weapon requirements match firepower level.
   * 
   * @param weirdo - The weirdo to validate weapon requirements for
   * @returns Validation result with errors (no warnings for weapon requirements)
   */
  validateWeaponRequirements(weirdo: Weirdo): ValidationResult {
    const errors: ValidationError[] = [];

    const closeCombatError = this.validateCloseCombatWeaponRequirement(weirdo);
    if (closeCombatError) errors.push(closeCombatError);

    const rangedWeaponError = this.validateRangedWeaponRequirement(weirdo);
    if (rangedWeaponError) errors.push(rangedWeaponError);

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Validates equipment limits for a weirdo based on type and warband ability.
   * Leaders can carry more equipment than troopers, and Cyborgs ability increases limits.
   * 
   * @param weirdo - The weirdo to validate equipment limits for
   * @param warbandAbility - The warband ability that may modify equipment limits
   * @returns Validation error if limit exceeded, null if valid
   */
  validateEquipmentLimits(weirdo: Weirdo, warbandAbility: WarbandAbility | null): ValidationError | null {
    return this.validateEquipmentLimit(weirdo, warbandAbility);
  }

  /**
   * Validates that a weirdo's point cost does not exceed allowed limits.
   * Troopers are limited to 20 points normally, or 25 points if they are the
   * only weirdo in the 21-25 point range (special slot).
   * 
   * @param weirdo - The weirdo to validate point limit for
   * @param warband - The warband context (needed to check for other 21-25 point weirdos)
   * @returns Validation error if limit exceeded, null if valid
   */
  validateWeirdoPointLimit(weirdo: Weirdo, warband: Warband): ValidationError | null {
    return this.validateTrooperPointLimit(weirdo, warband);
  }
}
