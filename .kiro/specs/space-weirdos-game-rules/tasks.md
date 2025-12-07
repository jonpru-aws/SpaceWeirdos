# Implementation Plan: Space Weirdos Game Rules

- [x] 1. Create core data model types and interfaces
  - Define all TypeScript interfaces in `src/backend/models/types.ts`
  - Include Weirdo, Warband, Attributes, Weapon, Equipment, PsychicPower, LeaderTrait
  - Include validation types (ValidationError, ValidationResult, CostBreakdown)
  - Define type aliases for attribute levels (SpeedLevel, DiceLevel, FirepowerLevel)
  - Define warband ability and point limit types
  - _Requirements: 1.1, 2.1, 3.1, 10.1, 11.1_

- [x] 2. Implement CostModifierStrategy service
  - Create `src/backend/services/CostModifierStrategy.ts`
  - Implement `applyWeaponModifier` method for Heavily Armed and Mutants abilities
  - Implement `applyEquipmentModifier` method for Soldiers ability
  - Implement `applyAttributeModifier` method for Mutants ability (Speed reduction)
  - Ensure all cost reductions clamp at 0 (never negative)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

- [ ]* 2.1 Write property test for warband ability modifiers
  - **Property 6: Warband ability modifier application**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9**
  - Test all four warband abilities (Heavily Armed, Mutants, Soldiers, Cyborgs)
  - Verify cost reductions never go below zero

- [ ]* 2.2 Write property test for cost non-negativity
  - **Property 9: Cost non-negativity**
  - **Validates: Requirements 9.3**
  - Test that all cost calculations return non-negative values

- [x] 3. Implement CostEngine service
  - Create `src/backend/services/CostEngine.ts`
  - Implement attribute cost lookup tables (Speed, Defense, Firepower, Prowess, Willpower)
  - Implement `calculateAttributeCost` method using lookup tables
  - Implement `calculateWeaponCost` method with modifier strategy
  - Implement `calculateEquipmentCost` method with modifier strategy
  - Implement `calculatePsychicPowerCost` method (direct cost passthrough)
  - Implement `calculateLeaderTraitCost` method (direct cost passthrough)
  - Implement `calculateWeirdoCost` method (sum all components)
  - Implement `calculateWarbandCost` method (sum all weirdos)
  - Implement `getWeirdoCostBreakdown` method for detailed cost display
  - _Requirements: 1.1-1.15, 2.5, 3.6, 4.2, 8.1, 9.1, 9.2, 9.3_

- [x]* 3.1 Write property test for attribute cost lookup
  - **Property 1: Attribute cost lookup correctness**
  - **Validates: Requirements 1.1-1.15**
  - Test all attribute types and levels return correct costs

- [x]* 3.2 Write property test for cost accumulation
  - **Property 3: Cost accumulation correctness**
  - **Validates: Requirements 2.5, 3.6, 4.2, 8.1, 9.1, 9.2**
  - Test that weirdo total cost equals sum of all components with modifiers applied

- [x] 4. Implement ValidationService for weirdo validation
  - Create `src/backend/services/ValidationService.ts`
  - Implement `validateWeirdoBasics` method (name, attributes, valid levels)
  - Implement `validateWeirdoWeapons` method (close combat required, ranged based on Firepower)
  - Implement `validateWeirdoEquipment` method (equipment limits based on type and Cyborgs ability)
  - Implement helper method to check equipment limits
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x]* 4.1 Write property test for weapon-firepower consistency
  - **Property 2: Weapon-Firepower consistency**
  - **Validates: Requirements 2.1, 2.2, 2.4**
  - Test close combat weapon requirement
  - Test ranged weapon requirement based on Firepower level

- [x]* 4.2 Write property test for equipment limit enforcement
  - **Property 4: Equipment limit enforcement**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
  - Test equipment limits for all combinations of weirdo type and Cyborgs ability

- [x]* 4.3 Write property test for required weirdo fields
  - **Property 10: Required weirdo fields**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**
  - Test validation of name and all attribute fields

- [x] 5. Implement ValidationService for leader trait validation
  - Add `validateLeaderTrait` method to ValidationService
  - Ensure leaders can have 0 or 1 trait
  - Ensure troopers cannot have any traits
  - _Requirements: 5.1, 5.2_

- [x]* 5.1 Write property test for leader trait type consistency
  - **Property 5: Leader trait type consistency**
  - **Validates: Requirements 5.1, 5.2**
  - Test that leaders can have traits and troopers cannot

- [x] 6. Implement ValidationService for weirdo cost validation
  - Add `validateWeirdoCost` method to ValidationService
  - Implement 25-point weirdo rule (at most one weirdo between 21-25 points)
  - Ensure all other weirdos are 20 points or less
  - Integrate with CostEngine to calculate costs
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x]* 6.1 Write property test for 25-point weirdo uniqueness
  - **Property 7: 25-point weirdo uniqueness**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
  - Test that at most one weirdo can be 21-25 points

- [x] 7. Implement ValidationService for warband validation
  - Add `validateWarbandStructure` method (name, point limit, leader presence)
  - Add `validateWarbandCost` method (total cost within point limit)
  - Add `validateWarband` method that combines all validations
  - Integrate with CostEngine for warband total cost
  - _Requirements: 8.2, 8.3, 11.1, 11.2_

- [x]* 7.1 Write property test for warband point limit enforcement
  - **Property 8: Warband point limit enforcement**
  - **Validates: Requirements 8.2, 8.3**
  - Test that warband total cost must not exceed point limit

- [x]* 7.2 Write property test for warband structure validity
  - **Property 11: Warband structure validity**
  - **Validates: Requirements 11.1, 11.2**
  - Test warband name, point limit, and leader requirements

- [x] 8. Implement complete weirdo validation integration
  - Add `validateWeirdo` method that combines all weirdo validations
  - Integrate basics, weapons, equipment, leader trait, and cost validations
  - Return comprehensive ValidationResult with all errors
  - _Requirements: All weirdo validation requirements_

- [x]* 8.1 Write unit tests for validation error messages
  - Test that error messages are clear and consistent
  - Test that error codes are correct
  - Test that field paths are accurate
  - _Requirements: All validation requirements_

- [x] 9. Create validation message constants
  - Create `src/backend/constants/validationMessages.ts`
  - Define all validation error messages as constants
  - Define all error codes as constants
  - Ensure consistency across all validation methods
  - _Requirements: All validation requirements_

- [x] 10. Create cost constants
  - Create or update `src/backend/constants/costs.ts`
  - Define attribute cost lookup tables as constants
  - Define equipment limit constants
  - Define point limit constants
  - _Requirements: 1.1-1.15, 3.1-3.4, 11.2_

- [x]* 10.1 Write unit tests for cost constants
  - Test that all cost tables are complete
  - Test that all constants are accessible
  - _Requirements: 1.1-1.15_

- [x] 11. Checkpoint - Ensure all tests pass
  - Run full test suite to verify all implementations
  - Ensure all property-based tests pass with minimum 50 iterations
  - Verify all unit tests pass
  - Ask the user if questions arise

- [x] 12. Final cleanup and verification





  - Remove any temporary build artifacts (`*.timestamp-*.mjs` files)
  - Verify all acceptance criteria are met
  - Review implementation against design document
  - Confirm all 11 correctness properties are tested
