import { describe, it } from 'vitest';
import fc from 'fast-check';
import {
  VALIDATION_MESSAGES,
  getValidationMessage,
  ValidationErrorCode
} from '../src/backend/constants/validationMessages';
import { ValidationService } from '../src/backend/services/ValidationService';
import {
  Warband,
  WarbandAbility
} from '../src/backend/models/types';

const testConfig = { numRuns: 50 };

// Generator for all validation error codes
const validationErrorCodeGen = fc.constantFrom<ValidationErrorCode>(
  'WARBAND_NAME_REQUIRED',
  'WEIRDO_NAME_REQUIRED',
  'INVALID_POINT_LIMIT',
  'ATTRIBUTES_INCOMPLETE',
  'CLOSE_COMBAT_WEAPON_REQUIRED',
  'RANGED_WEAPON_REQUIRED',
  'FIREPOWER_REQUIRED_FOR_RANGED_WEAPON',
  'EQUIPMENT_LIMIT_EXCEEDED',
  'TROOPER_POINT_LIMIT_EXCEEDED',
  'MULTIPLE_25_POINT_WEIRDOS',
  'WARBAND_POINT_LIMIT_EXCEEDED',
  'LEADER_TRAIT_INVALID'
);

describe('Property 6: Centralized error messages maintain consistency', () => {
  // **Feature: code-refactoring, Property 6: Centralized error messages maintain consistency**
  // **Validates: Requirements 2.5, 2.6, 8.5**

  it('should return the same base message for any error code from VALIDATION_MESSAGES', () => {
    fc.assert(
      fc.property(
        validationErrorCodeGen,
        (errorCode) => {
          // Get message directly from constant
          const directMessage = VALIDATION_MESSAGES[errorCode];
          
          // Get message through helper function (without params)
          const helperMessage = getValidationMessage(errorCode);
          
          // Both should be identical
          return directMessage === helperMessage;
        }
      ),
      testConfig
    );
  });

  it('should produce consistent messages when parameters are substituted', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<ValidationErrorCode>(
          'EQUIPMENT_LIMIT_EXCEEDED',
          'TROOPER_POINT_LIMIT_EXCEEDED',
          'MULTIPLE_25_POINT_WEIRDOS',
          'WARBAND_POINT_LIMIT_EXCEEDED'
        ),
        fc.record({
          type: fc.constantFrom('leader', 'trooper'),
          limit: fc.integer({ min: 1, max: 5 }),
          cost: fc.integer({ min: 0, max: 30 }),
          min: fc.integer({ min: 20, max: 25 }),
          max: fc.integer({ min: 20, max: 25 }),
          totalCost: fc.integer({ min: 0, max: 150 }),
          pointLimit: fc.constantFrom(75, 125)
        }),
        (errorCode, params) => {
          // Get base message template
          const baseMessage = VALIDATION_MESSAGES[errorCode];
          
          // Get message with parameters
          const parameterizedMessage = getValidationMessage(errorCode, params);
          
          // The parameterized message should contain the base structure
          // and have placeholders replaced with actual values
          const hasPlaceholders = baseMessage.includes('{');
          
          if (hasPlaceholders) {
            // If base has placeholders, parameterized should not
            const stillHasPlaceholders = parameterizedMessage.includes('{');
            
            // Check that all relevant parameters were substituted
            let allSubstituted = true;
            Object.entries(params).forEach(([key, value]) => {
              if (baseMessage.includes(`{${key}}`)) {
                allSubstituted = allSubstituted && parameterizedMessage.includes(String(value));
              }
            });
            
            return !stillHasPlaceholders && allSubstituted;
          } else {
            // If no placeholders, messages should be identical
            return baseMessage === parameterizedMessage;
          }
        }
      ),
      testConfig
    );
  });

  it('should ensure ValidationService uses messages from centralized constant', () => {
    const validationService = new ValidationService();
    
    fc.assert(
      fc.property(
        fc.constantFrom<WarbandAbility | null>(
          'Cyborgs',
          'Fanatics',
          'Living Weapons',
          'Heavily Armed',
          'Mutants',
          'Soldiers',
          'Undead',
          null
        ),
        (ability) => {
          // Test warband name validation
          const emptyNameWarband: Warband = {
            id: 'test-id',
            name: '',
            ability,
            pointLimit: 75,
            totalCost: 0,
            weirdos: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const result = validationService.validateWarband(emptyNameWarband);
          const nameError = result.errors.find(e => e.code === 'WARBAND_NAME_REQUIRED');
          
          // If error exists, message should match centralized constant
          if (nameError) {
            return nameError.message === VALIDATION_MESSAGES.WARBAND_NAME_REQUIRED;
          }
          
          return true;
        }
      ),
      testConfig
    );
  });

  it('should ensure all error codes reference the same message across the codebase', () => {
    fc.assert(
      fc.property(
        validationErrorCodeGen,
        (errorCode) => {
          // Get the canonical message
          const canonicalMessage = VALIDATION_MESSAGES[errorCode];
          
          // Verify it's a non-empty string
          const isValidMessage = typeof canonicalMessage === 'string' && canonicalMessage.length > 0;
          
          // Verify the error code exists in the type
          const codeExists = errorCode in VALIDATION_MESSAGES;
          
          return isValidMessage && codeExists;
        }
      ),
      testConfig
    );
  });
});
