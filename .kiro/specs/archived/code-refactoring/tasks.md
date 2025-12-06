# Implementation Plan

## Phase 1: Backend Refactoring

- [x] 1. Extract cost calculation constants
  - Create `src/backend/constants/costs.ts` file
  - Define all magic numbers as named constants
  - Export constants with `as const` for type safety
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 1.1 Create centralized validation message constants





  - Create `src/backend/constants/validationMessages.ts` file
  - Define all validation error messages as named constants
  - Create `ValidationErrorCode` type from constant keys
  - Create helper function for parameterized messages
  - Export with `as const` for type safety
  - _Requirements: 2.5, 2.6, 8.1, 8.5_

- [x] 1.2 Update ValidationService to use centralized messages




  - Import `VALIDATION_MESSAGES` and `getValidationMessage` helper
  - Replace all hardcoded error messages with constant references
  - Update error message formatting to use helper function for dynamic values
  - Ensure all error codes match the centralized definitions
  - _Requirements: 2.5, 2.6, 8.5_

- [x] 1.3 Update types.ts to use ValidationErrorCode from validationMessages




  - Import `ValidationErrorCode` type from validationMessages.ts
  - Update `ValidationError` interface to use the imported type
  - Remove hardcoded `code: string` definition
  - _Requirements: 8.1, 8.2, 8.5_

- [x] 1.4 Write property test for error message consistency
  - **Property 6: Centralized error messages maintain consistency**
  - **Validates: Requirements 2.5, 2.6, 8.5**
  - Configure test to run minimum 50 iterations
  - Run: `npm test -- tests/ValidationMessageConsistency.test.ts --reporter=dot`

- [x] 2. Refactor ValidationService to reduce duplication
  - Create generic validator factory function
  - Refactor attribute validation to use iteration
  - Extract common validation patterns
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2.1 Write property test for validation behavior preservation
  - **Property 1: Refactoring preserves validation behavior**
  - **Validates: Requirements 1.4**
  - Configure test to run minimum 50 iterations
  - Run: `npm test -- tests/ValidationService.test.ts --reporter=dot`

- [x] 3. Implement cost modifier strategy pattern
  - Create `CostModifierStrategy` interface
  - Implement ability-specific strategy classes
  - Refactor CostEngine to use strategies
  - Update cost calculation methods
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.1 Write property test for cost calculation preservation
  - **Property 2: Refactoring preserves cost calculation**
  - **Validates: Requirements 3.4**
  - Configure test to run minimum 50 iterations
  - Run: `npm test -- tests/CostEngineRefactoring.test.ts --reporter=dot`

- [x] 4. Create custom error classes
  - Create `src/backend/errors/AppError.ts`
  - Define `AppError`, `ValidationError`, `NotFoundError` classes
  - Update services to use new error classes
  - Update error handling in routes
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 4.1 Write unit tests for error classes
  - Test error construction
  - Test error properties
  - Test error inheritance
  - Run: `npm test -- tests/AppError.test.ts --reporter=dot`
  - _Requirements: 10.4_

- [x] 5. Checkpoint - Ensure all backend tests pass
  - Run backend-related tests: `npm test -- tests/*Service.test.ts tests/AppError.test.ts tests/CostEngine*.test.ts tests/ValidationMessageConsistency.test.ts --reporter=dot`
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Frontend Infrastructure

- [x] 6. Create GameDataContext
  - Create `src/frontend/contexts/GameDataContext.tsx`
  - Implement data loading logic
  - Add loading and error states
  - Create custom hook `useGameData()`
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6.1 Write unit tests for GameDataContext
  - Test data loading
  - Test error handling
  - Test context provider
  - Run: `npm test -- tests/GameDataContext.test.tsx --reporter=dot`
  - _Requirements: 6.4_

- [x] 7. Create WarbandContext
  - Create `src/frontend/contexts/WarbandContext.tsx`
  - Implement warband state management
  - Add update functions
  - Create custom hook `useWarband()`
  - _Requirements: 11.1, 11.2_

- [x] 7.1 Write property test for context data flow
  - **Property 4: Context introduction preserves data flow**
  - **Validates: Requirements 11.4**
  - Configure test to run minimum 50 iterations
  - Run: `npm test -- tests/WarbandContext.test.tsx --reporter=dot`

- [x] 8. Create reusable SelectWithCost component
  - Create `src/frontend/components/common/SelectWithCost.tsx`
  - Implement cost display logic
  - Add ability modifier support
  - Style component
  - _Requirements: 5.1_

- [x] 8.1 Write unit tests for SelectWithCost
  - Test rendering with various props
  - Test cost display
  - Test onChange handler
  - Run: `npm test -- tests/SelectWithCost.test.tsx --reporter=dot`
  - _Requirements: 5.4_

- [x] 9. Create reusable ItemList component
  - Create `src/frontend/components/common/ItemList.tsx`
  - Implement generic list rendering
  - Add remove functionality
  - Style component
  - _Requirements: 5.2_

- [x] 9.1 Write unit tests for ItemList
  - Test rendering items
  - Test remove functionality
  - Test empty state
  - Run: `npm test -- tests/ItemList.test.tsx --reporter=dot`
  - _Requirements: 5.4_

- [x] 10. Create reusable ValidationErrorDisplay component
  - Create `src/frontend/components/common/ValidationErrorDisplay.tsx`
  - Implement error filtering
  - Add error grouping
  - Style component
  - _Requirements: 5.3_

- [x] 10.1 Write unit tests for ValidationErrorDisplay
  - Test error rendering
  - Test filtering
  - Test empty state
  - Run: `npm test -- tests/ValidationErrorDisplay.test.tsx --reporter=dot`
  - _Requirements: 5.4_

- [x] 11. Checkpoint - Ensure all infrastructure tests pass
  - Run infrastructure tests: `npm test -- tests/GameDataContext.test.tsx tests/WarbandContext.test.tsx tests/SelectWithCost.test.tsx tests/ItemList.test.tsx tests/ValidationErrorDisplay.test.tsx --reporter=dot`
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Component Refactoring

- [x] 12. Split WarbandEditor into sub-components
  - Create `WarbandProperties.tsx` component
  - Create `WarbandCostDisplay.tsx` component
  - Create `WeirdosList.tsx` component
  - Create `WeirdoCard.tsx` component
  - Refactor WarbandEditor to use sub-components
  - _Requirements: 4.1, 4.3, 4.4_

- [x] 12.1 Write property test for warband data rendering
  - **Property 3: Component splitting renders all warband data correctly**
  - **Validates: Requirements 4.3**
  - Configure test to run minimum 50 iterations
  - Run: `npm test -- tests/WarbandEditor.test.tsx --reporter=dot`

- [x] 12.2 Fix 25-point violation banner display
  - Investigate why validation banner is not displaying
  - Ensure `has25PointViolation` state is correctly computed
  - Verify banner rendering logic in WarbandEditor
  - Update test to match actual implementation if needed
  - _Requirements: 4.3_

- [x] 13. Split WeirdoEditor into sub-components





  - Create `WeirdoBasicInfo.tsx` component for name and type
  - Create `WeirdoCostDisplay.tsx` component for cost tracking
  - Create `AttributeSelector.tsx` component for all 5 attributes
  - Create `WeaponSelector.tsx` component for close combat and ranged weapons
  - Create `EquipmentSelector.tsx` component for equipment list
  - Create `PsychicPowerSelector.tsx` component for psychic powers
  - Create `LeaderTraitSelector.tsx` component for leader trait
  - Refactor WeirdoEditor to use sub-components
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 13.1 Write integration tests for WeirdoEditor
  - Test component composition
  - Test data flow between sub-components
  - Test user interactions
  - Run: `npm test -- tests/WeirdoEditor.test.tsx --reporter=dot`
  - _Requirements: 4.3_

- [x] 14. Integrate Context providers into components





  - Update WarbandEditor to use WarbandContext
  - Update WeirdoEditor to use GameDataContext
  - Remove prop drilling for game data
  - Update component prop interfaces
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 14.1 Write integration tests for Context usage
  - Test context consumption
  - Test state updates through context
  - Test component re-renders
  - Run: `npm test -- tests/ContextIntegration.test.tsx --reporter=dot`
  - _Requirements: 11.4_

- [x] 15. Add React performance optimizations









  - Add useMemo for expensive calculations (cost calculations, validation checks)
  - Add useCallback for callback functions passed to child components
  - Optimize list rendering with stable keys
  - Add React.memo where appropriate (reusable components)
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 15.2 Fix equipment limit calculation bug
  - Update WeirdoEditor maxEquipment useMemo to correctly calculate limits
  - Ensure troopers with Cyborgs have equipment limit of 2, others have limit of 1
  - Ensure leaders with Cyborgs have limit of 3, others have limit of 2
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_
  - **Status**: Equipment limits are correctly implemented in WeirdoEditor.tsx

- [x] 15.3 Write property test for equipment limit calculation






  - **Property 10: Equipment limits are calculated correctly**
  - **Validates: Requirements 16.1, 16.2, 16.3, 16.4**
  - Configure test to run minimum 50 iterations
  - Run: `npm test -- tests/WeirdoEditor.test.tsx --reporter=dot`

- [x] 16. Fix cost warning threshold bug





  - Update WeirdoEditor isApproachingLimit calculation to include 20 points
  - Change condition from `>= 18 && <= 19` to `>= 18 && <= 20`
  - Ensure "Approaching limit" warning shows for troopers at 18-20 points
  - Update exceedsLimit logic to only show error when cost > 20
  - _Requirements: 14.1, 14.2, 14.4_

- [x] 16.1 Verify cost warning fix with property test






  - Run existing property test: `npm test -- tests/WeirdoEditor.test.tsx -t "should calculate cost correctly" --reporter=dot`
  - Verify test now passes for 20-point troopers
  - _Requirements: 14.1, 14.2, 14.4_

- [x] 16.2 Fix whitespace handling in weirdo names





  - Investigate property-based test failure with names containing multiple spaces (e.g., "a  a")
  - Update WeirdoBasicInfo or WeirdoEditor to normalize whitespace in names
  - Options: trim/collapse multiple spaces, or update test generator to exclude multi-space names
  - Ensure property test "should handle weapon operations correctly" passes
  - Run: `npm test -- tests/WeirdoEditor.test.tsx -t "should handle weapon operations correctly" --reporter=dot`
  - _Requirements: 9.4 (preserve functionality)_

- [x] 17. Centralize cost recalculation logic





  - Add `recalculateAllCosts` method to WarbandService
  - Update components to use centralized method
  - Remove scattered recalculation logic
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 17.1 Write unit tests for centralized cost recalculation






  - Test recalculation accuracy
  - Test cascade updates
  - Test ability changes
  - Run: `npm test -- tests/WarbandService.test.ts --reporter=dot`
  - _Requirements: 7.4_

- [x] 18. Checkpoint - Ensure all component tests pass
  - Run component tests: `npm test -- tests/WarbandEditor.test.tsx tests/WeirdoEditor.test.tsx tests/ContextIntegration.test.tsx tests/WarbandList.test.tsx --reporter=dot`
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18.1 Fix 25-point violation banner test




  - Investigate why validation mock is not triggering in test
  - Update test to properly mock validation response for 25-point violation
  - Ensure validation is called and banner displays correctly
  - Run: `npm test -- tests/WarbandEditor.test.tsx -t "should display 25-point violation banner" --reporter=dot`
  - _Requirements: 4.3_

- [x] 18.2 Fix warning threshold property-based test





  - Review warning threshold calculation (currently 90% of point limit)
  - Determine if threshold should be adjusted or test expectation corrected
  - Update either threshold logic or test generator to align expectations
  - Run: `npm test -- tests/WarbandEditor.test.tsx -t "should display correct warning/error states" --reporter=dot`
  - _Requirements: 14.1, 14.2, 14.4_

- [x] 18.3 Verify all component tests pass after fixes





  - Run full component test suite: `npm test -- tests/WarbandEditor.test.tsx tests/WeirdoEditor.test.tsx tests/ContextIntegration.test.tsx tests/WarbandList.test.tsx --reporter=dot`
  - Ensure all 100 tests pass
  - _Requirements: 4.3, 9.4_
  - **Status**: 98/100 tests passing, 2 pre-existing failures identified

## Phase 3.5: Bug Fixes

- [x] 18.4 Investigate and fix 25-point violation banner display issue




  - Investigate why validation banner is not displaying when multiple weirdos exceed 20 points
  - Review validation state management in WarbandEditor
  - Check if `has25PointViolation` flag is being set correctly from validation response
  - Verify banner rendering logic and conditions in WarbandEditor component
  - Update implementation to correctly display banner when condition is met
  - Run test: `npm test -- tests/WarbandEditor.test.tsx -t "should display 25-point violation banner" --reporter=dot`
  - _Requirements: 4.3_

- [x] 18.5 Fix whitespace handling in weirdo names for property-based tests



  - Investigate property-based test failure with names containing multiple spaces (e.g., "a  a")
  - Determine root cause: input field not displaying value or test expectation issue
  - Review WeirdoBasicInfo component input handling
  - Options to consider:
    - Normalize whitespace in names (collapse multiple spaces to single space)
    - Update property test generator to exclude multi-space names
    - Add input validation to prevent multiple consecutive spaces
  - Implement chosen solution
  - Run test: `npm test -- tests/WeirdoEditor.test.tsx -t "should render correctly with performance optimizations" --reporter=dot`
  - _Requirements: 9.4_

- [x] 18.6 Verify all component tests pass after bug fixes





  - Run full component test suite: `npm test -- tests/WarbandEditor.test.tsx tests/WeirdoEditor.test.tsx tests/ContextIntegration.test.tsx tests/WarbandList.test.tsx --reporter=dot`
  - Ensure all 100 tests pass with no failures
  - _Requirements: 4.3, 9.4_

## Phase 4: Documentation

**Note:** The following UI features from the design document are already implemented:
- ✅ Validation error display in WeirdoEditor (Requirements 13.1-13.4)
- ✅ Cost warnings in WeirdoCostDisplay (Requirements 14.1-14.4) - needs threshold fix
- ✅ Leader trait description display (Requirements 15.1-15.4)

- [x] 19. Add JSDoc documentation to backend services




  - Document all public functions in ValidationService
  - Document all public functions in CostEngine
  - Document all public functions in WarbandService
  - Document all public functions in DataRepository
  - Include @param, @returns, and @throws tags
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 20. Add JSDoc documentation to frontend components




  - Document component props with JSDoc
  - Document complex algorithms and calculations
  - Document design patterns used (Strategy, Context, etc.)
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 21. Update project documentation





  - Update README with new architecture overview
  - Document new patterns and conventions
  - Add migration guide for refactored code
  - Update CONTRIBUTING.md with refactoring guidelines
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 22. Final checkpoint - Run full test suite





  - Run full test suite: `npm test --reporter=dot`
  - Ensure all tests pass, ask the user if questions arise.
  - Verify no regressions
  - Check that all refactoring goals are met

## Phase 5: Cleanup

- [x] 23. Final cleanup and verification









  - Remove any temporary build artifacts (*.timestamp-*.mjs files)
  - Verify all acceptance criteria are met
  - Review implementation against design document
  - Confirm all refactoring goals achieved

## Notes

- Each task should be completed and tested before moving to the next
- All refactoring must preserve existing functionality
- Run targeted tests after each task using `--reporter=dot` for token efficiency
- Property-based tests must run minimum 50 iterations (per project-standards.md)
- Use targeted test execution during regular tasks (e.g., `npm test -- tests/ValidationService.test.ts --reporter=dot`)
- Only run full test suite during checkpoint tasks
- Optional test tasks (marked with *) can be skipped for faster MVP
- Checkpoint tasks ensure stability before moving to next phase
- Follow efficient-testing.md guidelines: limit to 2 verification attempts per task

