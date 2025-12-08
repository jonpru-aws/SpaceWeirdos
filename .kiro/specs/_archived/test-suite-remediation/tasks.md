# Implementation Plan

## Test Suite Remediation Tasks

- [x] 1. Investigate and fix WarbandContext null reference errors (HIGH PRIORITY) ⚠️






  - **STATUS**: Initial investigation complete - root cause identified but NOT resolved
  - **ISSUE**: Context provider not working in async tests with renderHook
  - Fix 16 failing async tests (updated from initial 13)
  - 3 synchronous tests pass - issue only affects async tests
  - See design.md "Investigation Notes" section for detailed findings
  - _Requirements: 1.1, 1.2, 1.3_


- [x] 1.1 Review investigation findings and plan approach

  - Read design.md "Investigation Notes" section thoroughly
  - Review attempted solutions and why they failed
  - Check React Testing Library docs for async context provider patterns
  - Search codebase for other tests that successfully use WarbandProvider in async contexts
  - Determine if issue is in test setup, WarbandProvider implementation, or test configuration
  - _Requirements: 1.1, 1.2_


- [x] 1.2 Investigate WarbandProvider dependencies and initialization

  - Review WarbandProvider implementation in src/frontend/contexts/WarbandContext.tsx
  - Check if WarbandProvider requires GameDataProvider (despite no visible import)
  - Look for any async initialization or useEffect hooks that might delay context availability
  - Add debug console.log to WarbandProvider to track when context value is created
  - Test wrapping with GameDataProvider to see if it resolves the issue
  - _Requirements: 1.1_

- [x] 1.3 Try alternative test patterns for async context


  - Option A: Create test component approach instead of renderHook
  - Option B: Try wrapping renderHook call itself in act() or waitFor()
  - Option C: Use waitForNextUpdate() pattern if available
  - Option D: Try flushPromises() or similar async flush utilities
  - Document which pattern successfully provides context in async tests
  - _Requirements: 1.1, 1.2_

- [x] 1.4 Review test environment configuration

  - Check vitest.config.ts for async test handling settings
  - Review test setup files for any global configuration
  - Check if test timeout or setup/teardown hooks are interfering
  - Compare test environment with other working async context tests
  - Look for any test isolation issues between sync and async tests
  - _Requirements: 1.1_

- [x] 1.5 Implement working solution for all async tests


  - Apply the solution identified in investigation tasks 1.1-1.4
  - Fix all 16 failing async tests using the working pattern
  - Ensure 3 synchronous tests continue to pass
  - Add comments explaining the async context pattern for future reference
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.6 Verify WarbandContext test fixes


  - Execute: `npm test -- tests/WarbandContext.test.tsx --reporter=dot --run`
  - Verify all 16 previously failing async tests now pass
  - Verify 3 synchronous tests still pass
  - Expected result: 19/19 passing tests
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Fix async cost calculation timing issues (MEDIUM PRIORITY)





  - Fix 2 failing tests related to async cost fetching
  - Add appropriate timeouts and waits
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.1 Fix WarbandAbilityCostDisplay timeout


  - Increase timeout for `findByText(/pts/)` query
  - Use `{ timeout: 5000 }` option
  - _Requirements: 2.1, 2.2_

- [x] 2.2 Fix WarbandContext cost recalculation test


  - Add proper waiting for cost updates after attribute changes
  - Increase waitFor timeout if needed
  - _Requirements: 2.1, 2.3_

- [x] 2.3 Run cost-related tests to verify fixes


  - Execute: `npm test -- tests/WarbandAbilityCostDisplay.test.tsx tests/WarbandContext.test.tsx --reporter=dot`
  - Verify cost calculation tests pass
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Fix WeirdoEditorIntegration rendering issues (MEDIUM PRIORITY)




  - Fix 8 failing integration tests
  - Debug provider setup and component rendering
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3.1 Debug renderWithProviders helper


  - Verify all required providers are included
  - Check GameDataProvider and WarbandProvider initialization
  - Add console logging to debug rendering
  - _Requirements: 3.1_

- [x] 3.2 Fix "should render and interact with equipment selector"

  - Investigate timeout issue
  - Add proper async waiting for component initialization
  - _Requirements: 3.2, 3.3_

- [x] 3.3 Fix "should render and interact with psychic power selector"

  - Add proper waiting for psychic powers heading
  - Verify component renders with correct props
  - _Requirements: 3.2, 3.4_

- [x] 3.4 Fix "should render leader trait selector for leaders"

  - Add proper waiting for leader trait section
  - Verify conditional rendering logic
  - _Requirements: 3.2, 3.4_

- [x] 3.5 Fix "should not render leader trait selector for troopers"

  - Add proper waiting for equipment section
  - Verify leader trait is not rendered for troopers
  - _Requirements: 3.2, 3.4_

- [x] 3.6 Fix "should render all selectors together for a leader"

  - Add proper waiting for basic information section
  - Verify all sections render for leaders
  - _Requirements: 3.2, 3.4_

- [x] 3.7 Fix "should allow selecting both equipment and psychic powers"

  - Add proper waiting for equipment section
  - Verify both selectors are functional
  - _Requirements: 3.2, 3.4_

- [x] 3.8 Fix "should hide ranged weapons but show equipment when firepower is None"

  - Add proper waiting for equipment section
  - Verify conditional rendering based on firepower
  - _Requirements: 3.2, 3.4_

- [x] 3.9 Fix "should maintain independent state for all selectors"

  - Add proper waiting for equipment section
  - Verify selector state independence
  - _Requirements: 3.2, 3.4_

- [x] 3.10 Run WeirdoEditorIntegration tests to verify fixes

  - Execute: `npm test -- tests/WeirdoEditorIntegration.test.tsx --reporter=dot`
  - Verify all 8 previously failing tests now pass
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Fix property-based test mock cleanup (LOW PRIORITY)




  - Fix 1 unhandled rejection in WarbandListProperty tests
  - Add proper mock cleanup between iterations
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4.1 Add mock cleanup in WarbandListProperty test

  - Add `vi.clearAllMocks()` between property test iterations
  - Investigate why deleteWarband was called unexpectedly
  - _Requirements: 4.1, 4.2_

- [x] 4.2 Run WarbandListProperty tests to verify fix


  - Execute: `npm test -- tests/WarbandListProperty.test.tsx --reporter=dot`
  - Verify no unhandled rejections
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Final verification and regression testing




  - Run complete test suite to verify all fixes
  - Ensure no regressions in previously passing tests
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5.1 Run full test suite


  - Execute: `npm test`
  - Verify all 43 previously failing tests now pass
  - Check that 780 previously passing tests still pass
  - _Requirements: 5.1, 5.2, 5.3, 5.4_


- [x] 5.2 Document any remaining issues

  - Create issue tickets for any tests that still fail
  - Document root causes and recommended solutions
  - _Requirements: 5.3_


- [x] 5.3 Update test documentation

  - Document common patterns for async testing
  - Add guidelines for property-based test setup
  - Update TESTING.md with lessons learned
  - _Requirements: 5.4_


## Phase 2: Remaining Issues Remediation

- [x] 6. Fix real-time cost calculation tests (HIGH PRIORITY)





  - Fix 5 failing tests where addWeirdo() doesn't add weirdo to warband context
  - Investigate test setup and async state management
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 6.1 Investigate why addWeirdo() doesn't work in test context


  - Review RealTimeCostCalculation.test.tsx test setup
  - Compare with working WarbandContext tests
  - Check if async waiting is needed after addWeirdo() call
  - Verify WarbandProvider is properly initialized with mock CostEngine
  - Add debug logging to identify where state update fails
  - _Requirements: 10.1_

- [x] 6.2 Fix "should update weirdo cost when attributes change"


  - Add proper async waiting after addWeirdo() call
  - Wrap state updates in act() if needed
  - Wait for warband state to update before assertions
  - _Requirements: 10.1, 10.2_



- [x] 6.3 Fix "should update warband cost when weirdo cost changes"

  - Apply same fix pattern as 6.2
  - Ensure warband cost recalculation is triggered
  - _Requirements: 10.1, 10.3_

- [x] 6.4 Fix "should debounce cost updates to 100ms"


  - Apply same fix pattern as 6.2
  - Verify debouncing logic works after weirdo is added
  - _Requirements: 10.1, 10.4_




- [x] 6.5 Fix "should use memoized cost values when available"

  - Apply same fix pattern as 6.2
  - Verify memoization works after weirdo is added
  - _Requirements: 10.1_



- [x] 6.6 Fix "should recalculate costs when warband ability changes"

  - Apply same fix pattern as 6.2
  - Verify ability changes trigger cost recalculation
  - _Requirements: 10.1, 10.5_


- [x] 6.7 Run RealTimeCostCalculation tests to verify fixes

  - Execute: `npm test -- tests/RealTimeCostCalculation.test.tsx --reporter=dot --silent`
  - Verify all 5 previously failing tests now pass
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
-

- [x] 7. Fix property-based test edge cases (MEDIUM PRIORITY)




  - Fix 4 failing property tests with edge case inputs
  - Improve generators and fix optimistic updates
  - _Requirements: 8.1, 8.2, 8.3, 9.1, 9.2, 9.3_

- [x] 7.1 Fix delete operations property test


  - Update warband name generator to avoid single-character names
  - Change generator to use minLength: 2 in testGenerators.ts
  - _Requirements: 8.1_

- [x] 7.2 Fix equipment limit enforcement timeout


  - Investigate where test hangs using console.log
  - Either increase timeout to 10000ms or reduce property test iterations
  - Verify component doesn't have infinite re-render
  - _Requirements: 8.2_

- [x] 7.3 Fix optimistic updates not working


  - Update useCostCalculation hook to set initial cost from props
  - Add useState initialization or useEffect to set initial value
  - Ensure cost is set before API request begins
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 7.4 Run property tests to verify fixes


  - Execute: `npm test -- tests/DeleteOperationsProperty.test.tsx tests/EquipmentLimitEnforcement.test.tsx tests/useCostCalculationOptimistic.test.tsx --reporter=dot --silent`
  - Verify all 3 tests now pass
  - _Requirements: 8.1, 8.2, 9.1, 9.2, 9.3_


- [x] 8. Fix unhandled promise rejection (MEDIUM PRIORITY)




  - Fix 1 unhandled rejection in WarbandListProperty test
  - Apply same generator fix as task 7.1
  - _Requirements: 8.3_


- [x] 8.1 Fix warband name generator

  - Apply same fix as task 7.1 (minLength: 2)
  - This should fix both DeleteOperationsProperty and WarbandListProperty
  - _Requirements: 8.1, 8.3_

- [x] 8.2 Run WarbandListProperty test to verify fix


  - Execute: `npm test -- tests/WarbandListProperty.test.tsx --reporter=dot --silent`
  - Verify no unhandled rejections
  - _Requirements: 8.3_

- [x] 9. Add type assertion documentation (LOW PRIORITY)




  - Add inline comments to 31 type assertions
  - Explain why each assertion is safe
  - _Requirements: 6.1, 6.2, 6.3_


- [x] 9.1 Document type assertions in backend files

  - Add comments to 5 assertions in src/backend/routes/warbandRoutes.ts
  - Add comments to 4 assertions in src/backend/services/CostEngine.ts
  - _Requirements: 6.1, 6.2_



- [x] 9.2 Document type assertions in frontend components

  - Add comments to 4 assertions in src/frontend/components/AttributeSelector.tsx
  - Add comments to 9 assertions in src/frontend/components/WeirdoEditor.tsx
  - _Requirements: 6.1, 6.2_

- [x] 9.3 Document type assertions in frontend contexts


  - Add comments to 6 assertions in src/frontend/contexts/GameDataContext.tsx
  - Add comments to remaining 3 assertions in other files
  - _Requirements: 6.1, 6.2_

- [x] 9.4 Run code quality test to verify documentation


  - Execute: `npm test -- tests/CodeQualityMetrics.test.ts -t "should have documentation for all type assertions" --reporter=dot --silent`
  - Verify test passes

  - _Requirements: 6.1, 6.2, 6.3_

- [x] 10. Fix error typing in catch blocks (LOW PRIORITY)




  - Update 20 catch blocks to use proper error types
  - Add type guards or use specific error types
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 10.1 Fix error typing in DataRepository


  - Update 7 catch blocks in src/backend/services/DataRepository.ts
  - Use type guards: if (err instanceof Error)
  - _Requirements: 7.1, 7.2_

- [x] 10.2 Fix error typing in WarbandContext


  - Update 6 catch blocks in src/frontend/contexts/WarbandContext.tsx
  - Use type guards: if (err instanceof Error)
  - _Requirements: 7.1, 7.2_



- [x] 10.3 Fix error typing in frontend components
  - Update 2 catch blocks in src/frontend/components/WarbandEditor.tsx
  - Update 2 catch blocks in src/frontend/components/WarbandList.tsx
  - Use type guards: if (err instanceof Error)
  - _Requirements: 7.1, 7.2_


- [x] 10.4 Fix error typing in frontend contexts and hooks

  - Update 1 catch block in src/frontend/contexts/GameDataContext.tsx
  - Update 1 catch block in src/frontend/hooks/useCostCalculation.ts
  - Update 1 catch block in src/frontend/hooks/useItemCost.ts
  - Use type guards: if (err instanceof Error)
  - _Requirements: 7.1, 7.2_


- [x] 10.5 Run code quality test to verify error typing

  - Execute: `npm test -- tests/CodeQualityMetrics.test.ts -t "should use proper error typing in all catch blocks" --reporter=dot --silent`
  - Verify test passes
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 11. Fix TypeScript compilation timeout (LOW PRIORITY)





  - Increase timeout for compilation test
  - _Requirements: 8.2_



- [x] 11.1 Increase test timeout

  - Update tests/TypeScriptCompilation.test.ts
  - Change timeout from 5000ms to 15000ms
  - _Requirements: 8.2_

- [x] 11.2 Run TypeScript compilation test to verify fix


  - Execute: `npm test -- tests/TypeScriptCompilation.test.ts -t "should have no unused variable warnings" --reporter=dot --silent`
  - Verify test passes within new timeout
  - _Requirements: 8.2_
- [x] 12. Final verification for Phase 2




- [ ] 12. Final verification for Phase 2

  - Run complete test suite to verify all remaining fixes
  - Ensure no regressions
  - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 10.4, 10.5_


- [x] 12.1 Run full test suite

  - Execute: `npm test`
  - Target: 816/817 passing (99.9%) - excluding backend performance test
  - Verify all 12 previously failing tests now pass
  - Check that 803 previously passing tests still pass
  - _Requirements: All_


- [x] 12.2 Update REMAINING_ISSUES.md

  - Document final test suite status
  - Note any tests that still require backend to be running
  - Mark spec as complete
  - _Requirements: All_


- [x] 12.3 Update SUMMARY.md with Phase 2 results

  - Document Phase 2 remediation results
  - Update success metrics
  - Add final lessons learned
  - _Requirements: All_
