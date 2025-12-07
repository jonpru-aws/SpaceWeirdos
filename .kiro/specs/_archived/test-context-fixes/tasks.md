# Implementation Plan

## Phase 1: Test Infrastructure

- [x] 1. Create test helper utilities




  - Create `tests/testHelpers.ts` file
  - Implement `renderWithProviders` helper function
  - Implement `createMockGameData` helper function
  - Implement `createMockWarband` helper function
  - Implement `createMockWeirdo` helper function
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 1.1 Write unit tests for test helpers





  - Test renderWithProviders with various options
  - Test mock data creators produce valid data
  - Run: `npm test -- tests/testHelpers.test.ts --reporter=dot`
  - _Requirements: 5.4_

- [x] 2. Update WarbandEditor tests to use context providers




  - Import renderWithProviders helper
  - Replace all `render(<WarbandEditor />)` with `renderWithProviders(<WarbandEditor />)`
  - Provide mock game data where needed
  - _Requirements: 1.1, 1.3_

- [x] 2.1 Verify WarbandEditor tests pass





  - Run: `npm test -- tests/WarbandEditor.test.tsx --reporter=dot`
  - Fix any remaining context-related failures
  - _Requirements: 1.1_

- [x] 3. Update WeirdoEditor tests to use context providers





  - Import renderWithProviders helper
  - Replace all `render(<WeirdoEditor />)` with `renderWithProviders(<WeirdoEditor />)`
  - Provide mock game data where needed
  - _Requirements: 1.2, 1.3_

- [x] 3.1 Verify WeirdoEditor tests pass


  - Run: `npm test -- tests/WeirdoEditor.test.tsx --reporter=dot`
  - Fix any remaining context-related failures
  - _Requirements: 1.2_

- [x] 4. Update property-based tests to use context providers





  - Update WarbandEditor property tests
  - Update WeirdoEditor property tests
  - Ensure fast-check generators work with providers
  - _Requirements: 1.3_

- [x] 4.1 Verify property-based tests pass


  - Run: `npm test -- tests/WarbandEditor.test.tsx tests/WeirdoEditor.test.tsx -t "Property" --reporter=dot`
  - Fix any remaining failures
  - _Requirements: 1.3_

- [x] 5. Checkpoint - Ensure all context-related test failures are resolved





  - Run: `npm test -- tests/WarbandEditor.test.tsx tests/WeirdoEditor.test.tsx tests/ContextIntegration.test.tsx --reporter=dot`
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: UI Feature Implementation

- [x] 6. Add validation error display to WeirdoEditor





  - Add validation error display section after cost display
  - Display validation errors when weirdo has validation issues
  - Show "At least one close combat weapon required" when applicable
  - Style validation errors with appropriate CSS classes
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 6.1 Verify validation error display tests pass

  - Run: `npm test -- tests/WeirdoEditor.test.tsx -t "validation" --reporter=dot --silent`
  - Fix any display-related failures
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 7. Implement cost warning display in WeirdoEditor





  - Add logic to detect when cost is 18-19 points (approaching limit)
  - Add logic to detect when cost exceeds 20 points
  - Display "Approaching limit" warning for 18-19 points
  - Display "Exceeds 20 point limit" error for > 20 points
  - Apply appropriate CSS classes for visual styling
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 7.1 Verify cost warning tests pass


  - Run: `npm test -- tests/WeirdoEditor.test.tsx -t "cost" --reporter=dot --silent`
  - Fix any warning display failures
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 8. Implement leader trait description display





  - Get leader trait data from GameDataContext
  - Display trait description when a trait is selected
  - Show "Bounty hunter ability" for Bounty Hunter trait
  - Hide description when no trait is selected
  - Style trait description appropriately
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8.1 Verify trait description tests pass


  - Run: `npm test -- tests/WeirdoEditor.test.tsx -t "trait" --reporter=dot --silent`
  - Fix any description display failures
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 9. Fix test selector specificity issues





  - Update test that queries for /pts/ to use more specific selector
  - Add data-testid="weirdo-cost" to cost display element
  - Update test to use screen.getByTestId('weirdo-cost')
  - Fix equipment max count test to use specific selector
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 9.1 Verify selector fix tests pass


  - Run: `npm test -- tests/WeirdoEditor.test.tsx -t "Integration: Component Composition" --reporter=dot --silent`
  - Fix any remaining selector issues
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 10. Implement warband-level cost warnings in WarbandEditor





  - Add logic to detect when warband total cost >= 90% of point limit
  - Add logic to detect when warband total cost exceeds point limit
  - Display "Approaching point limit" warning when at 90-100% of limit
  - Display "Exceeds point limit!" error when over limit
  - Apply appropriate CSS classes for visual styling
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 10.1 Verify warband cost warning tests pass

  - Run: `npm test -- tests/WarbandEditor.test.tsx -t "Cost calculations" --reporter=dot --silent`
  - Fix any warning display failures
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 11. Implement warband validation error banner in WarbandEditor





  - Add error banner component to display warband-level validation errors
  - Filter validation errors for warband-level errors (field="weirdos")
  - Display banner with CSS class "error-banner" when errors exist
  - Show validation error messages in the banner
  - Hide banner when no warband-level errors exist
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 11.1 Verify validation error banner tests pass

  - Run: `npm test -- tests/WarbandEditor.test.tsx -t "25-point violation banner" --reporter=dot --silent`
  - Fix any banner display failures
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 12. Checkpoint - Ensure all UI feature tests pass







  - Run: `npm test -- tests/WeirdoEditor.test.tsx tests/WarbandEditor.test.tsx --reporter=dot --silent`
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Final Verification

- [x] 13. Run full test suite





  - Run: `npm test --reporter=dot --silent`
  - Verify all previously failing tests now pass
  - Document any remaining issues
  - _Requirements: All_

- [x] 14. Update test documentation




  - Document test helper usage patterns
  - Add examples of proper test setup
  - Update contribution guidelines
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

## Notes

- Each task should be completed and tested before moving to the next
- Test helpers should be reusable across all test files
- UI features may already be partially implemented - verify before adding
- Run targeted tests after each task using `--reporter=dot --silent` for token efficiency
- Optional test tasks (marked with *) can be skipped for faster MVP
- Checkpoint tasks ensure stability before moving to next phase
- Follow efficient-testing.md guidelines: limit to 2 verification attempts per task

## Summary of Failing Tests

Based on test run, these 7 tests are currently failing:

1. **"should display validation errors"** - WeirdoEditor doesn't display validation error messages
2. **"should show error when exceeding point limit"** - Missing "Exceeds 20 point limit" error display
3. **"Integration: Component Composition > should render all sub-components together"** - Test uses /pts/ selector which matches multiple elements
4. **"Integration: User Interactions > should handle leader trait selection and display"** - Missing "Bounty hunter ability" trait description
5. **"Integration: User Interactions > should show cost warnings when approaching limits"** - Missing cost warning/error display
6. **Property test: should render correctly with performance optimizations** - Equipment max count display issue
7. **Property test: should calculate cost correctly with useMemo optimizations** - Missing "Exceeds 20 point limit" error display

All failures are related to missing UI features or test selector issues, not logic bugs.
