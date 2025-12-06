/**
 * Centralized validation error messages
 * Single source of truth for all validation error messages and codes
 */

export const VALIDATION_MESSAGES = {
  WARBAND_NAME_REQUIRED: 'Warband name is required',
  WEIRDO_NAME_REQUIRED: 'Weirdo name is required',
  INVALID_POINT_LIMIT: 'Point limit must be 75 or 125',
  ATTRIBUTES_INCOMPLETE: 'All five attributes must be selected',
  CLOSE_COMBAT_WEAPON_REQUIRED: 'At least one close combat weapon is required',
  RANGED_WEAPON_REQUIRED: 'Ranged weapon required when Firepower is 2d8 or 2d10',
  FIREPOWER_REQUIRED_FOR_RANGED_WEAPON: 'Firepower level 2d8 or 2d10 required to use ranged weapons',
  EQUIPMENT_LIMIT_EXCEEDED: 'Equipment limit exceeded: {type} can have {limit} items',
  TROOPER_POINT_LIMIT_EXCEEDED: 'Trooper cost ({cost}) exceeds {limit}-point limit',
  MULTIPLE_25_POINT_WEIRDOS: 'Only one weirdo may cost {min}-{max} points',
  WARBAND_POINT_LIMIT_EXCEEDED: 'Warband total cost ({totalCost}) exceeds point limit ({pointLimit})',
  LEADER_TRAIT_INVALID: 'Leader trait can only be assigned to leaders',
} as const;

/**
 * Type-safe validation error code
 * Derived from the keys of VALIDATION_MESSAGES
 */
export type ValidationErrorCode = keyof typeof VALIDATION_MESSAGES;

/**
 * Helper function to get formatted error messages with dynamic values
 * 
 * @param code - The validation error code
 * @param params - Optional parameters to interpolate into the message
 * @returns The formatted error message
 * 
 * @example
 * getValidationMessage('EQUIPMENT_LIMIT_EXCEEDED', { type: 'leader', limit: '3' })
 * // Returns: "Equipment limit exceeded: leader can have 3 items"
 */
export function getValidationMessage(
  code: ValidationErrorCode,
  params?: Record<string, string | number>
): string {
  let message = VALIDATION_MESSAGES[code];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value));
    });
  }
  
  return message;
}
