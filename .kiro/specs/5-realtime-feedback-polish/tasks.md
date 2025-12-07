# Implementation Plan

- [ ] 1. Implement cost display components

- [ ] 1.1 Create CostBadge component
  - Display base cost and modified cost
  - Add strikethrough styling for base cost when modified
  - Apply color tokens from design system
  - _Requirements: 1.5_

- [ ]* 1.2 Write unit tests for CostBadge
  - Test base cost displays correctly
  - Test modified cost shows strikethrough
  - _Requirements: 1.5_

- [ ]* 1.3 Write property test for modified cost display
  - **Property 3: Modified costs are visually indicated**
  - **Validates: Requirements 1.5**

- [ ] 2. Implement warband cost display with sticky positioning

- [ ] 2.1 Create WarbandCostDisplay component
  - Display total cost and point limit
  - Implement sticky positioning at top of editor
  - Add warning indicator when within 15 points of limit
  - Add error indicator when exceeding limit
  - Apply sticky styles from design system
  - Use semi-transparent background
  - _Requirements: 1.3, 2.3, 2.4, 2.5, 2.6, 3.2, 3.4, 3.5, 3.6_

- [ ]* 2.2 Write unit tests for WarbandCostDisplay
  - Test sticky positioning applies correctly
  - Test warning indicator appears at threshold
  - Test error indicator appears when over limit
  - _Requirements: 2.3, 2.4, 3.2, 3.4, 3.5, 3.6_

- [ ] 3. Implement weirdo cost display with breakdown

- [ ] 3.1 Create WeirdoCostDisplay component
  - Display individual weirdo cost
  - Add expandable cost breakdown
  - Implement sticky positioning at top of weirdo editor
  - Add warning indicator when within 10 points of limit
  - Add error indicator when exceeding limit
  - Apply sticky styles from design system
  - Animate breakdown expand/collapse
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.5, 2.6, 3.1, 3.3, 3.5, 3.6, 5.1-5.5_

- [ ]* 3.2 Write unit tests for WeirdoCostDisplay
  - Test sticky positioning applies correctly
  - Test warning indicator appears at threshold
  - Test error indicator appears when over limit
  - Test cost breakdown expands/collapses
  - Test breakdown shows all cost components
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 3.1, 3.3, 5.1-5.5_

- [ ]* 3.3 Write property test for sticky display behavior
  - **Property 4: Sticky cost displays remain visible during scroll**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

- [ ] 4. Implement real-time cost calculation

- [ ] 4.1 Add cost calculation integration
  - Integrate CostEngine for all cost calculations
  - Debounce cost updates to 100ms
  - Update weirdo cost when attributes/weapons/equipment/powers change
  - Update warband cost when weirdo costs change
  - Memoize cost calculations for performance
  - _Requirements: 1.1, 1.2, 1.4_

- [ ]* 4.2 Write unit tests for cost calculation
  - Test cost updates when selections change
  - Test debouncing works correctly
  - Test memoization prevents unnecessary recalculations
  - _Requirements: 1.1, 1.2, 1.4_

- [ ]* 4.3 Write property test for cost synchronization
  - **Property 1: Real-time cost synchronization**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [ ] 5. Implement warning and error indicators

- [ ] 5.1 Add warning/error logic to cost displays
  - Calculate if weirdo cost is within 10 points of limit (20 for troopers, 25 for leaders)
  - Calculate if warband cost is within 15 points of limit
  - Apply warning styling (orange/yellow border)
  - Apply error styling (red border)
  - Use color tokens from design system
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ]* 5.2 Write unit tests for warning/error indicators
  - Test weirdo warning appears at correct threshold
  - Test warband warning appears at correct threshold
  - Test error indicators appear when over limit
  - Test correct colors are applied
  - _Requirements: 2.1-2.6_

- [ ]* 5.3 Write property test for warning indicators
  - **Property 2: Cost warning indicators appear correctly**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

- [ ] 6. Implement validation error display

- [ ] 6.1 Create ValidationErrorDisplay component
  - Display validation errors as list or inline
  - Add tooltip on hover for detailed messages
  - Style error indicators with design system colors
  - Position tooltips appropriately
  - _Requirements: 4.3, 4.4, 4.6_

- [ ] 6.2 Add validation error styling to WeirdoCard
  - Apply error CSS class when validation fails
  - Add tooltip with validation messages on hover
  - Clear error styling when validation passes
  - Display all errors in tooltip
  - Show point total in error message when exceeding limits
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ]* 6.3 Write unit tests for validation display
  - Test error styling applies to invalid weirdos
  - Test tooltip shows validation messages
  - Test error styling clears when corrected
  - Test multiple errors displayed in tooltip
  - _Requirements: 4.1-4.7_

- [ ]* 6.4 Write property test for validation error display
  - **Property 5: Validation errors are visually highlighted**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

- [ ] 7. Performance optimization

- [ ] 7.1 Add React.memo to expensive components
  - Memoize WeirdoCard component
  - Memoize AttributeSelector component
  - Memoize cost display components
  - Add useMemo for computed values
  - Add useCallback for event handlers
  - _Requirements: All (performance)_

- [ ]* 7.2 Write performance tests
  - Test cost calculations complete within 100ms
  - Test component re-renders are minimized
  - Test memoization prevents unnecessary updates
  - _Requirements: 1.4_

- [ ] 8. Add animations and transitions

- [ ] 8.1 Implement smooth transitions
  - Add transitions for cost updates
  - Add transitions for warning/error state changes
  - Add animation for cost breakdown expand/collapse
  - Respect prefers-reduced-motion
  - Use transition tokens from design system
  - _Requirements: 5.5_

- [ ]* 8.2 Test animations
  - Test transitions apply correctly
  - Test reduced motion is respected
  - Test animations are smooth
  - _Requirements: 5.5_

- [ ] 9. Accessibility and polish

- [ ] 9.1 Add accessibility features
  - Add ARIA labels for cost displays
  - Add ARIA live regions for cost updates
  - Add ARIA descriptions for validation errors
  - Ensure tooltips are keyboard accessible
  - _Requirements: All_

- [ ] 9.2 Apply final polish
  - Verify all colors use design system tokens
  - Verify all spacing uses design system utilities
  - Verify all animations are smooth
  - Test on different screen sizes
  - _Requirements: All_

- [ ] 10. Final verification

- [ ] 10.1 Ensure all tests pass
  - Run full test suite
  - Fix any failing tests
  - Verify property tests run minimum 50 iterations
  - _Requirements: All_

- [ ] 10.2 Verify feature completeness
  - Confirm all acceptance criteria are met
  - Review implementation against design document
  - Test all user workflows manually
  - Verify performance meets requirements
  - _Requirements: All_

- [ ] 10.3 Clean up temporary build artifacts
  - Remove `*.timestamp-*.mjs` files from workspace root
  - Verify all tests pass after cleanup
  - _Requirements: All_
