# Implementation Plan

- [x] 1. Set up API integration for real-time feedback






- [x] 1.1 Add optimized cost calculation API endpoint


  - Implement POST /api/cost/calculate with < 100ms response time
  - Return total cost, breakdown, warnings, and limit indicators
  - Optimize backend for real-time performance
  - _Requirements: 6.1, 6.3, 6.6_

- [x] 1.2 Add validation API endpoints


  - Implement POST /api/validation/warband endpoint
  - Implement POST /api/validation/weirdo endpoint
  - Return structured validation errors with details
  - _Requirements: 6.2, 6.4, 6.7_

- [x] 1.3 Write unit tests for API endpoints


  - Test cost calculation returns within 100ms
  - Test validation returns structured errors
  - Test API handles edge cases correctly
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2. Implement cost display components






- [x] 2.1 Create CostBadge component


  - Display base cost and modified cost
  - Add strikethrough styling for base cost when modified
  - Apply color tokens from design system
  - _Requirements: 1.5_

- [x] 2.2 Write unit tests for CostBadge


  - Test base cost displays correctly
  - Test modified cost shows strikethrough
  - _Requirements: 1.5_

- [x] 2.3 Write property test for modified cost display



  - **Property 3: Modified costs are visually indicated**
  - **Validates: Requirements 1.5**

- [x] 3. Implement warband cost display with sticky positioning





- [x] 3.1 Create WarbandCostDisplay component


  - Display total cost and point limit
  - Implement sticky positioning at top of editor
  - Add warning indicator when within 15 points of limit
  - Add error indicator when exceeding limit
  - Apply sticky styles from design system
  - Use semi-transparent background
  - _Requirements: 1.3, 2.3, 2.4, 2.5, 2.6, 3.2, 3.4, 3.5, 3.6_

- [x] 3.2 Write unit tests for WarbandCostDisplay



  - Test sticky positioning applies correctly
  - Test warning indicator appears at threshold
  - Test error indicator appears when over limit
  - _Requirements: 2.3, 2.4, 3.2, 3.4, 3.5, 3.6_

- [x] 4. Implement weirdo cost display with breakdown






- [x] 4.1 Create WeirdoCostDisplay component


  - Display individual weirdo cost from API
  - Add expandable cost breakdown from API response
  - Implement sticky positioning at top of weirdo editor
  - Add warning indicator when within 10 points of limit
  - Add error indicator when exceeding limit
  - Apply sticky styles from design system
  - Animate breakdown expand/collapse
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.5, 2.6, 3.1, 3.3, 3.5, 3.6, 5.1-5.5, 6.1_

- [x] 4.2 Write unit tests for WeirdoCostDisplay


  - Test sticky positioning applies correctly
  - Test warning indicator appears at threshold
  - Test error indicator appears when over limit
  - Test cost breakdown expands/collapses
  - Test breakdown shows all cost components
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 3.1, 3.3, 5.1-5.5_

- [ ]* 4.3 Write property test for sticky display behavior
  - **Property 4: Sticky cost displays remain visible during scroll**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

- [x] 5. Implement real-time cost calculation





- [x] 5.1 Add cost calculation integration




  - Remove direct CostEngine imports
  - Call POST /api/cost/calculate via API client
  - Debounce API calls to 100ms to reduce network traffic
  - Update weirdo cost when attributes/weapons/equipment/powers change
  - Update warband cost when weirdo costs change
  - Memoize API responses for performance
  - Handle API errors gracefully
  - _Requirements: 1.1, 1.2, 1.4, 6.1, 6.3, 6.5_

- [x] 5.2 Write unit tests for API cost calculation








  - Test cost API called when selections change
  - Test debouncing to 100ms works correctly
  - Test cost updates from API response within 100ms
  - Test memoization prevents unnecessary API calls
  - Test error handling for failed API calls
  - _Requirements: 1.1, 1.2, 1.4, 6.1, 6.3, 6.5_

- [ ]* 5.3 Write property test for cost synchronization
  - **Property 1: Real-time cost synchronization**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 6. Implement warning and error indicators





- [x] 6.1 Add warning/error logic to cost displays


  - Use warning/error indicators from API response
  - Calculate if weirdo cost is within 10 points of limit (20 for troopers, 25 for leaders)
  - Calculate if warband cost is within 15 points of limit
  - Apply warning styling (orange/yellow border)
  - Apply error styling (red border)
  - Use color tokens from design system
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.1_

- [x] 6.2 Write unit tests for warning/error indicators



  - Test weirdo warning appears at correct threshold
  - Test warband warning appears at correct threshold
  - Test error indicators appear when over limit
  - Test correct colors are applied
  - Test indicators use API response data
  - _Requirements: 2.1-2.6, 6.1_

- [ ]* 6.3 Write property test for warning indicators
  - **Property 2: Cost warning indicators appear correctly**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

- [x] 7. Refactor validation to use API






- [x] 7.1 Replace ValidationService with API calls


  - Remove direct ValidationService imports
  - Call POST /api/validation/weirdo for weirdo validation
  - Call POST /api/validation/warband for warband validation
  - Handle API response and display validation errors
  - _Requirements: 6.2, 6.4, 6.5, 6.7_

- [x] 7.2 Write unit tests for validation API integration


  - Test validation API called when needed
  - Test validation errors displayed from API response
  - Test error handling for failed API calls
  - _Requirements: 6.2, 6.4, 6.5_

- [x] 8. Implement validation error display





- [x] 8.1 Create ValidationErrorDisplay component


  - Display validation errors from API as list or inline
  - Add tooltip on hover for detailed messages
  - Style error indicators with design system colors
  - Position tooltips appropriately
  - _Requirements: 4.3, 4.4, 4.6, 6.2, 6.4_

- [x] 8.2 Add validation error styling to WeirdoCard


  - Apply error CSS class when validation fails
  - Add tooltip with validation messages from API on hover
  - Clear error styling when validation passes
  - Display all errors in tooltip
  - Show point total in error message when exceeding limits
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.2, 6.4_

- [x] 8.3 Write unit tests for validation display


  - Test error styling applies to invalid weirdos
  - Test tooltip shows validation messages from API
  - Test error styling clears when corrected
  - Test multiple errors displayed in tooltip
  - _Requirements: 4.1-4.7, 6.2, 6.4_

- [ ]* 8.4 Write property test for validation error display
  - **Property 5: Validation errors are visually highlighted**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

- [x] 9. Performance optimization





- [x] 9.1 Add React.memo to expensive components


  - Memoize WeirdoCard component
  - Memoize AttributeSelector component
  - Memoize cost display components
  - Add useMemo for computed values
  - Add useCallback for event handlers
  - Cache API responses to prevent unnecessary calls
  - _Requirements: All (performance), 6.5_

- [ ]* 9.2 Write performance tests
  - Test cost API calls complete within 100ms
  - Test component re-renders are minimized
  - Test memoization prevents unnecessary updates
  - Test API response caching works correctly
  - _Requirements: 1.4, 6.3_

- [x] 10. Add animations and transitions





- [x] 10.1 Implement smooth transitions


  - Add transitions for cost updates from API
  - Add transitions for warning/error state changes
  - Add animation for cost breakdown expand/collapse
  - Respect prefers-reduced-motion
  - Use transition tokens from design system
  - _Requirements: 5.5_

- [ ]* 10.2 Test animations
  - Test transitions apply correctly
  - Test reduced motion is respected
  - Test animations are smooth
  - _Requirements: 5.5_

- [x] 11. Accessibility and polish







- [x] 11.1 Add accessibility features

  - Add ARIA labels for cost displays
  - Add ARIA live regions for cost updates from API
  - Add ARIA descriptions for validation errors from API
  - Ensure tooltips are keyboard accessible
  - _Requirements: All_

- [x] 11.2 Apply final polish


  - Verify all colors use design system tokens
  - Verify all spacing uses design system utilities
  - Verify all animations are smooth
  - Test on different screen sizes
  - _Requirements: All_

- [x] 12. Final verification






- [x] 12.1 Ensure all tests pass


  - Run full test suite
  - Fix any failing tests
  - Verify property tests run minimum 50 iterations
  - Verify API integration works correctly
  - _Requirements: All_

- [x] 12.2 Verify feature completeness


  - Confirm all acceptance criteria are met
  - Review implementation against design document
  - Test all user workflows manually with API
  - Verify performance meets requirements (< 100ms for cost calculations)
  - Verify API error handling works correctly
  - Test debouncing and caching strategies
  - _Requirements: All, 6.1-6.7_

- [x] 12.3 Clean up temporary build artifacts


  - Remove `*.timestamp-*.mjs` files from workspace root
  - Verify all tests pass after cleanup
  - _Requirements: All_
