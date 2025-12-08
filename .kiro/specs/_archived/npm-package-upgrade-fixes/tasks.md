# Implementation Plan

- [x] 1. Fix TypeScript compilation errors






- [x] 1.1 Run TypeScript compiler and identify all type errors

  - Execute `tsc --noEmit` to get full list of errors
  - Document all type errors by category
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 1.2 Fix type errors in source files


  - Add proper type annotations where missing
  - Fix incorrect type assertions
  - Ensure all imports have correct types
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 1.3 Remove or document type assertions


  - Add documentation comments for necessary type assertions
  - Remove unnecessary type assertions
  - _Requirements: 1.3, 2.3_

- [x] 1.4 Write unit test for TypeScript compilation


  - Test that `tsc --noEmit` exits with code 0
  - Test that build process completes successfully
  - **Property 1: TypeScript compilation succeeds**
  - **Validates: Requirements 1.1, 1.2, 1.5**

- [x] 2. Fix error handling patterns





- [x] 2.1 Update catch blocks to use unknown type


  - Find all catch blocks with typed error parameters
  - Change error type to unknown
  - _Requirements: 2.1_

- [x] 2.2 Add type guards to error handling


  - Add `instanceof Error` checks before accessing error properties
  - Use safe error message extraction
  - _Requirements: 2.2, 2.5_

- [x] 2.3 Fix API response type handling


  - Ensure explicit types for all API responses
  - Remove implicit any types
  - _Requirements: 2.4_

- [x] 2.4 Write property tests for error handling patterns


  - **Property 3: Catch blocks use unknown type**
  - **Validates: Requirements 2.1**
  - **Property 4: Error handling uses type guards**
  - **Validates: Requirements 2.2, 2.5**
  - **Property 5: API responses use explicit types**
  - **Validates: Requirements 2.4**
-

- [x] 3. Fix WarbandContext state management


- [x] 3.1 Fix addWeirdo method implementation


  - Ensure leader type is set correctly
  - Ensure trooper type is set correctly
  - Ensure new weirdo is auto-selected
  - Verify leader limit enforcement
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3.2 Fix removeWeirdo method implementation


  - Ensure weirdo is removed from array
  - Ensure selection is cleared when removing selected weirdo
  - Ensure validation errors are cleared
  - _Requirements: 3.5, 3.6_

- [x] 3.3 Fix cost calculation integration


  - Ensure warband total cost equals sum of weirdo costs
  - Ensure attribute updates trigger cost recalculation
  - Verify debouncing works correctly
  - _Requirements: 3.7, 3.8, 7.1, 7.4_

- [x] 3.4 Write property tests for WarbandContext operations


  - **Property 6: Adding leader creates leader weirdo**
  - **Validates: Requirements 3.1**
  - **Property 7: Adding trooper creates trooper weirdo**
  - **Validates: Requirements 3.2**
  - **Property 8: Added weirdo is auto-selected**
  - **Validates: Requirements 3.3**

- [x] 3.5 Write property test for leader limit enforcement


  - **Property 9: Second leader addition throws error**
  - **Validates: Requirements 3.4**

- [x] 3.6 Write property tests for weirdo removal


  - **Property 10: Removing weirdo removes from array**
  - **Validates: Requirements 3.5**
  - **Property 11: Removing selected weirdo clears selection**
  - **Validates: Requirements 3.6**

- [x] 3.7 Write property tests for cost calculations


  - **Property 12: Warband cost equals sum of weirdo costs**
  - **Validates: Requirements 3.7, 7.2**
  - **Property 13: Attribute updates trigger cost recalculation**
  - **Validates: Requirements 3.8**

- [x] 4. Checkpoint - Verify WarbandContext tests pass




  - Ensure all tests pass, ask the user if questions arise

- [x] 5. Fix WeirdoEditor component rendering




- [x] 5.1 Fix component props and context usage


  - Ensure component receives weirdo from context correctly
  - Fix conditional rendering logic
  - Verify all sections render when weirdo is selected
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 5.2 Fix ranged weapons conditional rendering


  - Ensure ranged weapons section shows only when firepower != 'None'
  - Verify disabled state message shows when firepower is 'None'
  - _Requirements: 4.4_

- [x] 5.3 Fix leader trait conditional rendering


  - Ensure leader trait section shows only for leaders
  - Verify section is hidden for troopers
  - _Requirements: 4.7_

- [x] 5.4 Write property tests for WeirdoEditor sections


  - **Property 14: Selected weirdo shows all editor sections**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.5, 4.6**
  - **Property 15: Ranged weapons section visibility depends on firepower**
  - **Validates: Requirements 4.4**
  - **Property 16: Leader shows leader trait section**
  - **Validates: Requirements 4.7**

- [x] 5.5 Write unit test for empty state


  - Test that empty state message shows when no weirdo selected
  - **Validates: Requirements 4.8**

- [x] 6. Fix WeirdoCostDisplay component




- [x] 6.1 Fix cost breakdown API integration


  - Ensure API call is made when breakdown is expanded
  - Fix API mocking in tests
  - Handle loading and error states correctly
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 6.2 Fix breakdown toggle functionality


  - Ensure toggle expands breakdown
  - Ensure toggle collapses breakdown
  - Verify loading indicator shows while fetching
  - _Requirements: 5.1, 5.7, 5.8_

- [x] 6.3 Write property tests for cost breakdown


  - **Property 17: Cost breakdown toggle expands breakdown**
  - **Validates: Requirements 5.1**
  - **Property 18: Expanded breakdown shows all cost components**
  - **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6**
  - **Property 19: Cost breakdown toggle collapses breakdown**
  - **Validates: Requirements 5.7**

- [x] 6.4 Write unit test for loading state


  - Test that loading indicator shows when breakdown is null
  - **Validates: Requirements 5.8**

- [x] 7. Fix WeirdosList component





- [x] 7.1 Fix weirdo list rendering


  - Ensure all weirdos are rendered in list
  - Fix weirdo card props and rendering
  - _Requirements: 6.1_

- [x] 7.2 Fix Add Leader button state


  - Ensure button is disabled when warband has leader
  - Ensure button is enabled when warband has no leader
  - Fix button click handler
  - _Requirements: 6.2, 6.3, 6.4_

- [x] 7.3 Fix Add Trooper button functionality


  - Ensure button creates trooper with default properties
  - Fix button click handler
  - _Requirements: 6.5_

- [x] 7.4 Write property tests for WeirdosList


  - **Property 20: WeirdosList displays all weirdos**
  - **Validates: Requirements 6.1**
  - **Property 21: Add Leader button state depends on leader existence**
  - **Validates: Requirements 6.2, 6.3**
  - **Property 22: Add Leader creates leader weirdo**
  - **Validates: Requirements 6.4**
  - **Property 23: Add Trooper creates trooper weirdo**
  - **Validates: Requirements 6.5**
-

- [x] 8. Checkpoint - Verify component tests pass



  - Ensure all tests pass, ask the user if questions arise
-

- [x] 9. Fix real-time cost calculation



- [x] 9.1 Fix cost update debouncing


  - Ensure cost updates complete within 100ms
  - Verify debouncing prevents excessive calculations
  - _Requirements: 7.1, 7.4_

- [x] 9.2 Fix warband ability cost recalculation


  - Ensure ability changes trigger cost updates
  - Verify all weirdo costs are recalculated
  - _Requirements: 7.3_

- [x] 9.3 Fix cost memoization


  - Ensure unchanged values use cached costs
  - Verify no unnecessary recalculations
  - _Requirements: 7.5_

- [x] 9.4 Write property tests for cost calculations


  - **Property 24: Cost updates complete within 100ms**
  - **Validates: Requirements 7.1**
  - **Property 25: Ability changes trigger cost recalculation**
  - **Validates: Requirements 7.3**
  - **Property 26: Rapid updates are debounced**
  - **Validates: Requirements 7.4**
  - **Property 27: Unchanged values use memoization**
  - **Validates: Requirements 7.5**

- [x] 10. Fix save and validation operations



- [x] 10.1 Fix save validation flow


  - Ensure validation is called before save
  - Ensure invalid warbands prevent save
  - Ensure validation errors are displayed
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 10.2 Fix save callbacks


  - Ensure success callback is called on successful save
  - Ensure error callback is called on failed save
  - Verify update endpoint is used for existing warbands
  - _Requirements: 8.4, 8.5, 8.6_

- [x] 10.3 Write property tests for save operations



  - **Property 28: Save validates before saving**
  - **Validates: Requirements 8.1**
  - **Property 29: Invalid warband prevents save**
  - **Validates: Requirements 8.2**
  - **Property 30: Validation errors are displayed**
  - **Validates: Requirements 8.3**
  - **Property 31: Successful save calls success callback**
  - **Validates: Requirements 8.4**
  - **Property 32: Failed save calls error callback**
  - **Validates: Requirements 8.5**
  - **Property 33: Existing warband uses update endpoint**
  - **Validates: Requirements 8.6**
- [x] 11. Fix delete operations



- [ ] 11. Fix delete operations

- [x] 11.1 Fix delete confirmation flow


  - Ensure confirmation dialog shows on delete click
  - Ensure API is called only on confirmation
  - Ensure API is not called on cancellation
  - _Requirements: 9.1, 9.2, 9.5_

- [x] 11.2 Fix delete success handling


  - Ensure warband is removed from list on success
  - Ensure success notification is displayed
  - _Requirements: 9.3, 9.4_

- [x] 11.3 Write property tests for delete operations



  - **Property 34: Delete shows confirmation dialog**
  - **Validates: Requirements 9.1**
  - **Property 35: Confirmed delete calls API**
  - **Validates: Requirements 9.2**
  - **Property 36: Successful delete removes from list**
  - **Validates: Requirements 9.3**
  - **Property 37: Successful delete shows notification**
  - **Validates: Requirements 9.4**
  - **Property 38: Cancelled delete prevents API call**
  - **Validates: Requirements 9.5**
-

- [x] 12. Fix equipment limit enforcement



- [x] 12.1 Fix equipment selector disabled states


  - Ensure unselected options are disabled at limit
  - Ensure options are enabled when under limit
  - Ensure selected equipment remains clickable at limit
  - Ensure disabled states update when limit changes
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 12.2 Write property tests for equipment limits


  - **Property 39: Equipment limit disables unselected options**
  - **Validates: Requirements 11.1**
  - **Property 40: Under limit enables equipment options**
  - **Validates: Requirements 11.2**
  - **Property 41: At limit allows deselecting equipment**
  - **Validates: Requirements 11.3**
  - **Property 42: Limit changes update disabled states**
  - **Validates: Requirements 11.4**

- [x] 13. Fix warband list cost display




- [x] 13.1 Fix total cost display in warband list


  - Ensure total cost is displayed for each warband
  - Ensure cost updates when warband changes
  - Handle empty warband (0 cost) correctly
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 13.2 Write property tests for warband list cost


  - **Property 43: Warband list displays total cost**
  - **Validates: Requirements 12.1**
  - **Property 44: Cost changes update display**
  - **Validates: Requirements 12.2**

- [x] 14. Fix property-based test generators





- [x] 14.1 Update warband data generators


  - Ensure warband names are non-empty strings (1-50 chars)
  - Ensure point limits are valid (75 or 125)
  - Ensure max 1 leader per warband
  - Ensure max 10 weirdos per warband
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 14.2 Update weirdo data generators


  - Ensure weirdo names are non-empty strings (1-30 chars)
  - Ensure attribute values are within valid ranges
  - Ensure equipment respects limits (3 for leaders, 2 for troopers)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_
-

- [x] 15. Final checkpoint - Verify all tests pass





  - Ensure all tests pass, ask the user if questions arise
-

- [x] 16. Final cleanup and verification





- [x] 16.1 Clean up temporary build artifacts

  - Remove `*.timestamp-*.mjs` files from workspace root
  - Verify all tests pass
  - _Requirements: All_

- [x] 16.2 Verify feature completeness


  - Confirm all acceptance criteria are met
  - Review implementation against design document
  - Run full test suite to ensure no regressions
  - _Requirements: All_
