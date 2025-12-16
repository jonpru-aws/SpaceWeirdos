import {
  Weirdo,
  Warband,
  ValidationError,
  ValidationWarning,
  ValidationResult,
  ValidationErrorCode,
  WarbandAbility,
  Attributes
} from '../models/types.js';
import { CostEngine } from './CostEngine.js';
import { CostConfig, ValidationConfig } from '../config/types.js';
import { ConfigurationManager } from '../config/ConfigurationManager.js';
// ValidationErrorCode is now imported from types.js

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
 * Validation level enumeration for multi-level validation
 */
export enum ValidationLevel {
  STRUCTURE = 'structure',
  TYPES = 'types',
  GAME_DATA = 'game_data',
  BUSINESS_RULES = 'business_rules'
}

/**
 * Enhanced validation error with categorization
 */
export interface CategorizedValidationError extends ValidationError {
  category: ValidationLevel;
  severity: 'error' | 'warning';
  suggestions?: string[];
}

/**
 * Enhanced validation result with categorized errors
 */
export interface EnhancedValidationResult {
  valid: boolean;
  errors: CategorizedValidationError[];
  warnings: ValidationWarning[];
  errorsByCategory: Record<ValidationLevel, CategorizedValidationError[]>;
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
  private costConfig: CostConfig;
  private validationConfig: ValidationConfig;
  private configManager: ConfigurationManager;

  constructor(costConfig: CostConfig, validationConfig: ValidationConfig) {
    this.costConfig = costConfig;
    this.validationConfig = validationConfig;
    this.costEngine = new CostEngine(costConfig);
    this.configManager = ConfigurationManager.getInstance();
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
   * Creates a categorized validation error with suggestions
   */
  private createCategorizedError(
    field: string,
    message: string,
    code: ValidationErrorCode,
    category: ValidationLevel,
    severity: 'error' | 'warning' = 'error',
    suggestions?: string[]
  ): CategorizedValidationError {
    return {
      field,
      message,
      code,
      category,
      severity,
      suggestions
    };
  }

  /**
   * Performs multi-level validation with comprehensive checks
   * Requirements: 3.3, 3.4, 3.5, 6.2
   */
  validateWarbandComprehensive(warband: Warband): EnhancedValidationResult {
    const errors: CategorizedValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Level 1: Structure validation
    this.validateStructure(warband, errors);

    // Level 2: Type validation
    this.validateTypes(warband, errors);

    // Level 3: Game data validation
    this.validateGameDataReferences(warband, errors, warnings);

    // Level 4: Business rules validation
    this.validateBusinessRules(warband, errors, warnings);

    // Categorize errors by level
    const errorsByCategory = this.categorizeErrors(errors);

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      errorsByCategory
    };
  }

  /**
   * Level 1: Structure validation - checks for required fields and basic structure
   */
  private validateStructure(warband: Warband, errors: CategorizedValidationError[]): void {
    // Validate warband structure
    if (!warband.name || typeof warband.name !== 'string' || warband.name.trim().length === 0) {
      errors.push(this.createCategorizedError(
        'name',
        this.validationConfig.messages.warbandNameRequired,
        'WARBAND_NAME_REQUIRED',
        ValidationLevel.STRUCTURE,
        'error',
        ['Provide a non-empty warband name']
      ));
    }

    if (!warband.weirdos || !Array.isArray(warband.weirdos)) {
      errors.push(this.createCategorizedError(
        'weirdos',
        'Warband must have a weirdos array',
        'WARBAND_NAME_REQUIRED', // Reusing code for now
        ValidationLevel.STRUCTURE,
        'error',
        ['Ensure warband has a valid weirdos array']
      ));
      return; // Can't continue without weirdos array
    }

    // Validate each weirdo structure
    warband.weirdos.forEach((weirdo, index) => {
      this.validateWeirdoStructure(weirdo, index, errors);
    });
  }

  /**
   * Validates individual weirdo structure
   */
  private validateWeirdoStructure(weirdo: Weirdo, index: number, errors: CategorizedValidationError[]): void {
    const fieldPrefix = `weirdos[${index}]`;

    if (!weirdo.name || typeof weirdo.name !== 'string' || weirdo.name.trim().length === 0) {
      errors.push(this.createCategorizedError(
        `${fieldPrefix}.name`,
        this.validationConfig.messages.weirdoNameRequired,
        'WEIRDO_NAME_REQUIRED',
        ValidationLevel.STRUCTURE,
        'error',
        ['Provide a non-empty weirdo name']
      ));
    }

    if (!weirdo.type || (weirdo.type !== 'leader' && weirdo.type !== 'trooper')) {
      errors.push(this.createCategorizedError(
        `${fieldPrefix}.type`,
        'Weirdo type must be "leader" or "trooper"',
        'WEIRDO_NAME_REQUIRED', // Reusing code
        ValidationLevel.STRUCTURE,
        'error',
        ['Set weirdo type to either "leader" or "trooper"']
      ));
    }

    if (!weirdo.attributes) {
      errors.push(this.createCategorizedError(
        `${fieldPrefix}.attributes`,
        this.validationConfig.messages.attributesIncomplete,
        'ATTRIBUTES_INCOMPLETE',
        ValidationLevel.STRUCTURE,
        'error',
        ['Provide complete attributes for the weirdo']
      ));
    }
  }

  /**
   * Level 2: Type validation - checks data types and value ranges
   */
  private validateTypes(warband: Warband, errors: CategorizedValidationError[]): void {
    // Validate point limit type and values
    if (warband.pointLimit !== 75 && warband.pointLimit !== 125) {
      errors.push(this.createCategorizedError(
        'pointLimit',
        this.validationConfig.messages.invalidPointLimit,
        'INVALID_POINT_LIMIT',
        ValidationLevel.TYPES,
        'error',
        ['Set point limit to either 75 or 125']
      ));
    }

    // Validate warband ability type
    if (warband.ability !== null && typeof warband.ability !== 'string') {
      errors.push(this.createCategorizedError(
        'ability',
        'Warband ability must be a string or null',
        'WARBAND_NAME_REQUIRED', // Reusing code
        ValidationLevel.TYPES,
        'error',
        ['Set warband ability to a valid string or null']
      ));
    }

    // Validate each weirdo types
    warband.weirdos.forEach((weirdo, index) => {
      this.validateWeirdoTypes(weirdo, index, errors);
    });
  }

  /**
   * Validates individual weirdo types
   */
  private validateWeirdoTypes(weirdo: Weirdo, index: number, errors: CategorizedValidationError[]): void {
    const fieldPrefix = `weirdos[${index}]`;

    if (weirdo.attributes) {
      const requiredAttributes = ['speed', 'defense', 'firepower', 'prowess', 'willpower'];
      
      for (const attr of requiredAttributes) {
        const value = weirdo.attributes[attr as keyof Attributes];
        
        if (attr === 'speed') {
          // Speed can be 0 but not null/undefined
          if (value === null || value === undefined) {
            errors.push(this.createCategorizedError(
              `${fieldPrefix}.attributes.${attr}`,
              `Attribute ${attr} is required`,
              'ATTRIBUTES_INCOMPLETE',
              ValidationLevel.TYPES,
              'error',
              [`Set ${attr} attribute to a valid value`]
            ));
          }
        } else if (!value) {
          errors.push(this.createCategorizedError(
            `${fieldPrefix}.attributes.${attr}`,
            `Attribute ${attr} is required`,
            'ATTRIBUTES_INCOMPLETE',
            ValidationLevel.TYPES,
            'error',
            [`Set ${attr} attribute to a valid value`]
          ));
        }
      }
    }
  }

  /**
   * Level 3: Game data validation - checks references to game data files
   */
  private validateGameDataReferences(warband: Warband, errors: CategorizedValidationError[], _warnings: ValidationWarning[]): void {
    // This would typically validate against loaded game data
    // For now, we'll add basic validation structure
    
    warband.weirdos.forEach((weirdo, index) => {
      const fieldPrefix = `weirdos[${index}]`;

      // Validate weapon arrays exist
      if (!weirdo.closeCombatWeapons || weirdo.closeCombatWeapons.length === 0) {
        errors.push(this.createCategorizedError(
          `${fieldPrefix}.closeCombatWeapons`,
          this.validationConfig.messages.closeCombatWeaponRequired,
          'CLOSE_COMBAT_WEAPON_REQUIRED',
          ValidationLevel.GAME_DATA,
          'error',
          ['Add at least one close combat weapon']
        ));
      }

      // Validate ranged weapon requirements based on firepower
      if (weirdo.attributes && (weirdo.attributes.firepower === '2d8' || weirdo.attributes.firepower === '2d10')) {
        if (!weirdo.rangedWeapons || weirdo.rangedWeapons.length === 0) {
          errors.push(this.createCategorizedError(
            `${fieldPrefix}.rangedWeapons`,
            this.validationConfig.messages.rangedWeaponRequired,
            'RANGED_WEAPON_REQUIRED',
            ValidationLevel.GAME_DATA,
            'error',
            ['Add a ranged weapon when firepower is 2d8 or 2d10']
          ));
        }
      }

      // Check for firepower requirement when ranged weapon is present
      if (weirdo.rangedWeapons && weirdo.rangedWeapons.length > 0 && 
          weirdo.attributes && weirdo.attributes.firepower === 'None') {
        errors.push(this.createCategorizedError(
          `${fieldPrefix}.attributes.firepower`,
          this.validationConfig.messages.firepowerRequiredForRangedWeapon,
          'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON',
          ValidationLevel.GAME_DATA,
          'error',
          ['Set firepower to 2d8 or 2d10 when using ranged weapons']
        ));
      }
    });
  }

  /**
   * Level 4: Business rules validation - checks game-specific constraints
   */
  private validateBusinessRules(warband: Warband, errors: CategorizedValidationError[], warnings: ValidationWarning[]): void {
    // Use configuration manager for thresholds
    const costConfig = this.configManager.getCostConfig();
    const validationConfig = this.configManager.getValidationConfig();

    // Validate equipment limits
    warband.weirdos.forEach((weirdo, index) => {
      const fieldPrefix = `weirdos[${index}]`;
      const equipmentCount = weirdo.equipment ? weirdo.equipment.length : 0;
      
      const maxEquipment = weirdo.type === 'leader'
        ? (warband.ability === 'Cyborgs' ? costConfig.equipmentLimits.leaderCyborgs : costConfig.equipmentLimits.leaderStandard)
        : (warband.ability === 'Cyborgs' ? costConfig.equipmentLimits.trooperCyborgs : costConfig.equipmentLimits.trooperStandard);

      if (equipmentCount > maxEquipment) {
        errors.push(this.createCategorizedError(
          `${fieldPrefix}.equipment`,
          this.formatValidationMessage('EQUIPMENT_LIMIT_EXCEEDED', { type: weirdo.type, limit: maxEquipment }),
          'EQUIPMENT_LIMIT_EXCEEDED',
          ValidationLevel.BUSINESS_RULES,
          'error',
          [`Remove equipment to stay within ${maxEquipment} item limit for ${weirdo.type}s`]
        ));
      }

      // Validate trooper point limits
      if (weirdo.type === 'trooper') {
        const weirdoCost = this.costEngine.calculateWeirdoCost(weirdo, warband.ability);
        
        // Check for multiple special slot weirdos
        const specialSlotWeirdos = warband.weirdos.filter(w => {
          const cost = this.costEngine.calculateWeirdoCost(w, warband.ability);
          return cost >= costConfig.trooperLimits.specialSlotMin && cost <= costConfig.trooperLimits.specialSlotMax;
        });

        if (specialSlotWeirdos.length > 1) {
          errors.push(this.createCategorizedError(
            'warband.weirdos',
            this.formatValidationMessage('MULTIPLE_25_POINT_WEIRDOS', {
              min: costConfig.trooperLimits.specialSlotMin,
              max: costConfig.trooperLimits.specialSlotMax
            }),
            'MULTIPLE_25_POINT_WEIRDOS',
            ValidationLevel.BUSINESS_RULES,
            'error',
            ['Only one trooper can cost between 21-25 points']
          ));
        }

        // Check individual trooper limits
        if (weirdoCost > costConfig.trooperLimits.maximumLimit) {
          errors.push(this.createCategorizedError(
            `${fieldPrefix}.totalCost`,
            this.formatValidationMessage('TROOPER_POINT_LIMIT_EXCEEDED', { 
              cost: weirdoCost, 
              limit: costConfig.trooperLimits.maximumLimit 
            }),
            'TROOPER_POINT_LIMIT_EXCEEDED',
            ValidationLevel.BUSINESS_RULES,
            'error',
            [`Reduce trooper cost to ${costConfig.trooperLimits.maximumLimit} points or less`]
          ));
        }

        // Generate cost warnings using configuration thresholds
        if (validationConfig.enableContextAwareWarnings) {
          const warningThreshold = Math.floor(validationConfig.costWarningThreshold * costConfig.trooperLimits.maximumLimit);
          if (weirdoCost >= warningThreshold && weirdoCost <= costConfig.trooperLimits.maximumLimit) {
            const pointsFromLimit = costConfig.trooperLimits.maximumLimit - weirdoCost;
            warnings.push({
              field: `${fieldPrefix}.totalCost`,
              message: `Cost is within ${pointsFromLimit} point${pointsFromLimit === 1 ? '' : 's'} of the ${costConfig.trooperLimits.maximumLimit}-point limit`,
              code: 'COST_APPROACHING_LIMIT'
            });
          }
        }
      }

      // Validate leader trait restrictions
      if (weirdo.type === 'trooper' && weirdo.leaderTrait !== null) {
        errors.push(this.createCategorizedError(
          `${fieldPrefix}.leaderTrait`,
          this.validationConfig.messages.leaderTraitInvalid,
          'LEADER_TRAIT_INVALID',
          ValidationLevel.BUSINESS_RULES,
          'error',
          ['Remove leader trait from trooper or change type to leader']
        ));
      }
    });

    // Validate warband total cost
    const totalCost = this.costEngine.calculateWarbandCost(warband);
    if (totalCost > warband.pointLimit) {
      errors.push(this.createCategorizedError(
        'warband.totalCost',
        this.formatValidationMessage('WARBAND_POINT_LIMIT_EXCEEDED', { 
          totalCost, 
          pointLimit: warband.pointLimit 
        }),
        'WARBAND_POINT_LIMIT_EXCEEDED',
        ValidationLevel.BUSINESS_RULES,
        'error',
        [`Reduce warband cost to ${warband.pointLimit} points or less`]
      ));
    }
  }

  /**
   * Categorizes errors by validation level
   */
  private categorizeErrors(errors: CategorizedValidationError[]): Record<ValidationLevel, CategorizedValidationError[]> {
    const categorized: Record<ValidationLevel, CategorizedValidationError[]> = {
      [ValidationLevel.STRUCTURE]: [],
      [ValidationLevel.TYPES]: [],
      [ValidationLevel.GAME_DATA]: [],
      [ValidationLevel.BUSINESS_RULES]: []
    };

    errors.forEach(error => {
      categorized[error.category].push(error);
    });

    return categorized;
  }

  /**
   * Validate non-empty string helper
   */
  private validateNonEmptyString(value: string, field: string, code: ValidationErrorCode): ValidationError | null {
    const message = this.getValidationMessage(code);
    const validator = this.createValidator<string>({
      field,
      message,
      code,
      condition: (val) => Boolean(val && val.trim().length > 0)
    });
    return validator(value);
  }

  /**
   * Get validation message from configuration
   */
  private getValidationMessage(code: ValidationErrorCode): string {
    switch (code) {
      case 'WARBAND_NAME_REQUIRED':
        return this.validationConfig.messages.warbandNameRequired;
      case 'WEIRDO_NAME_REQUIRED':
        return this.validationConfig.messages.weirdoNameRequired;
      case 'INVALID_POINT_LIMIT':
        return this.validationConfig.messages.invalidPointLimit;
      case 'ATTRIBUTES_INCOMPLETE':
        return this.validationConfig.messages.attributesIncomplete;
      case 'CLOSE_COMBAT_WEAPON_REQUIRED':
        return this.validationConfig.messages.closeCombatWeaponRequired;
      case 'RANGED_WEAPON_REQUIRED':
        return this.validationConfig.messages.rangedWeaponRequired;
      case 'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON':
        return this.validationConfig.messages.firepowerRequiredForRangedWeapon;
      case 'EQUIPMENT_LIMIT_EXCEEDED':
        return this.validationConfig.messages.equipmentLimitExceeded;
      case 'TROOPER_POINT_LIMIT_EXCEEDED':
        return this.validationConfig.messages.trooperPointLimitExceeded;
      case 'MULTIPLE_25_POINT_WEIRDOS':
        return this.validationConfig.messages.multiple25PointWeirdos;
      case 'WARBAND_POINT_LIMIT_EXCEEDED':
        return this.validationConfig.messages.warbandPointLimitExceeded;
      case 'LEADER_TRAIT_INVALID':
        return this.validationConfig.messages.leaderTraitInvalid;
      default:
        return 'Validation error';
    }
  }

  /**
   * Format validation message with dynamic parameters
   */
  private formatValidationMessage(
    code: ValidationErrorCode,
    params: Record<string, string | number>
  ): string {
    let message = this.getValidationMessage(code);
    
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
    });
    
    return message;
  }

  /**
   * Validate warband name (non-empty string)
   */
  private validateWarbandName(name: string): ValidationError | null {
    return this.validateNonEmptyString(name, 'name', 'WARBAND_NAME_REQUIRED');
  }

  /**
   * Validate point limit (from configuration)
   */
  private validatePointLimit(pointLimit: number): ValidationError | null {
    const validator = this.createValidator<number>({
      field: 'pointLimit',
      message: this.validationConfig.messages.invalidPointLimit,
      code: 'INVALID_POINT_LIMIT',
      condition: (val) => val === this.costConfig.pointLimits.standard || val === this.costConfig.pointLimits.extended
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
        message: this.validationConfig.messages.attributesIncomplete,
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
          message: this.validationConfig.messages.attributesIncomplete,
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
    const message = this.getValidationMessage(code);
    const validator = this.createValidator<T[] | null | undefined>({
      field,
      message,
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
        message: this.getValidationMessage(code),
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
    const message = params ? this.formatValidationMessage(code, params) : this.getValidationMessage(code);
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
      ? (warbandAbility === 'Cyborgs' ? this.costConfig.equipmentLimits.leaderCyborgs : this.costConfig.equipmentLimits.leaderStandard)
      : (warbandAbility === 'Cyborgs' ? this.costConfig.equipmentLimits.trooperCyborgs : this.costConfig.equipmentLimits.trooperStandard);

    return this.validateLimit(
      equipmentCount,
      maxEquipment,
      `weirdo.${weirdo.id}.equipment`,
      'EQUIPMENT_LIMIT_EXCEEDED',
      { type: weirdo.type, limit: maxEquipment }
    );
  }

  /**
   * Validate trooper point limit (from configuration)
   */
  private validateTrooperPointLimit(weirdo: Weirdo, warband: Warband): ValidationError | null {
    if (weirdo.type !== 'trooper') {
      return null;
    }

    const weirdoCost = this.costEngine.calculateWeirdoCost(weirdo, warband.ability);
    
    // Check if there's already a special slot weirdo in the warband
    const has25PointWeirdo = warband.weirdos.some((w: Weirdo) => {
      if (w.id === weirdo.id) return false; // Don't count the current weirdo
      const cost = this.costEngine.calculateWeirdoCost(w, warband.ability);
      return cost >= this.costConfig.trooperLimits.specialSlotMin && cost <= this.costConfig.trooperLimits.specialSlotMax;
    });

    // If there's already a special slot weirdo, this trooper must be <= standard limit
    if (has25PointWeirdo) {
      const limitError = this.validateLimit(
        weirdoCost,
        this.costConfig.trooperLimits.standardLimit,
        `weirdo.${weirdo.id}.totalCost`,
        'TROOPER_POINT_LIMIT_EXCEEDED',
        { cost: weirdoCost, limit: this.costConfig.trooperLimits.standardLimit }
      );
      if (limitError) return limitError;
    }

    // If this is the potential special slot weirdo, it must be <= maximum limit
    return this.validateLimit(
      weirdoCost,
      this.costConfig.trooperLimits.maximumLimit,
      `weirdo.${weirdo.id}.totalCost`,
      'TROOPER_POINT_LIMIT_EXCEEDED',
      { cost: weirdoCost, limit: this.costConfig.trooperLimits.maximumLimit }
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
    
    // Check if this weirdo is in the special slot range
    const isThis25PointWeirdo = weirdoCost >= this.costConfig.trooperLimits.specialSlotMin && 
                                 weirdoCost <= this.costConfig.trooperLimits.maximumLimit;
    
    // Check if there's a DIFFERENT special slot weirdo in the warband
    const hasOther25PointWeirdo = warband.weirdos.some((w: Weirdo) => {
      if (w.id === weirdo.id) return false; // Don't count the current weirdo
      const cost = this.costEngine.calculateWeirdoCost(w, warband.ability);
      return cost >= this.costConfig.trooperLimits.specialSlotMin && cost <= this.costConfig.trooperLimits.maximumLimit;
    });

    // Determine which limits to check based on warband context
    if (hasOther25PointWeirdo) {
      // Another weirdo is using the special slot, so this weirdo is limited to standard limit
      // Warn if within 3 points of standard limit
      const pointsFromStandard = this.costConfig.trooperLimits.standardLimit - weirdoCost;
      if (pointsFromStandard >= 0 && pointsFromStandard <= warningThreshold) {
        warnings.push({
          field: `weirdo.${weirdo.id}.totalCost`,
          message: `Cost is within ${pointsFromStandard} point${pointsFromStandard === 1 ? '' : 's'} of the ${this.costConfig.trooperLimits.standardLimit}-point limit`,
          code: 'COST_APPROACHING_LIMIT'
        });
      }
    } else if (isThis25PointWeirdo) {
      // This weirdo is using the special slot
      // Warn if within 3 points of maximum limit
      const pointsFromMax = this.costConfig.trooperLimits.maximumLimit - weirdoCost;
      if (pointsFromMax >= 0 && pointsFromMax <= warningThreshold) {
        warnings.push({
          field: `weirdo.${weirdo.id}.totalCost`,
          message: `Cost is within ${pointsFromMax} point${pointsFromMax === 1 ? '' : 's'} of the ${this.costConfig.trooperLimits.maximumLimit}-point limit`,
          code: 'COST_APPROACHING_LIMIT'
        });
      }
    } else {
      // No special slot weirdo exists yet, so this weirdo could use either limit
      // Warn if within 3 points of standard limit
      const pointsFromStandard = this.costConfig.trooperLimits.standardLimit - weirdoCost;
      if (pointsFromStandard >= 0 && pointsFromStandard <= warningThreshold) {
        warnings.push({
          field: `weirdo.${weirdo.id}.totalCost`,
          message: `Cost is within ${pointsFromStandard} point${pointsFromStandard === 1 ? '' : 's'} of the ${this.costConfig.trooperLimits.standardLimit}-point limit`,
          code: 'COST_APPROACHING_LIMIT'
        });
      }
      // Also warn if within 3 points of maximum limit - could become the special slot weirdo
      const pointsFromMax = this.costConfig.trooperLimits.maximumLimit - weirdoCost;
      if (pointsFromMax >= 0 && pointsFromMax <= warningThreshold) {
        warnings.push({
          field: `weirdo.${weirdo.id}.totalCost`,
          message: `Cost is within ${pointsFromMax} point${pointsFromMax === 1 ? '' : 's'} of the ${this.costConfig.trooperLimits.maximumLimit}-point limit (premium weirdo slot)`,
          code: 'COST_APPROACHING_LIMIT'
        });
      }
    }

    return warnings;
  }

  /**
   * Validate special slot weirdo limit (only one allowed)
   */
  private validate25PointWeirdoLimit(warband: Warband): ValidationError | null {
    const weirdosInSpecialSlot = warband.weirdos.filter((w: Weirdo) => {
      const cost = this.costEngine.calculateWeirdoCost(w, warband.ability);
      return cost >= this.costConfig.trooperLimits.specialSlotMin && cost <= this.costConfig.trooperLimits.specialSlotMax;
    });

    if (weirdosInSpecialSlot.length > 1) {
      return {
        field: 'warband.weirdos',
        message: this.formatValidationMessage('MULTIPLE_25_POINT_WEIRDOS', {
          min: this.costConfig.trooperLimits.specialSlotMin,
          max: this.costConfig.trooperLimits.specialSlotMax
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
        message: this.validationConfig.messages.leaderTraitInvalid,
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
