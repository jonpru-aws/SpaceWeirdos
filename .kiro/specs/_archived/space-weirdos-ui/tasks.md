# Implementation Plan

- [-] 1. Set up React application structure and context



- [x] 1.1 Create WarbandContext with state management



  - Define WarbandContextValue interface with all operations
  - Implement context provider with useState hooks
  - Add warband CRUD operations (create, update, save, load, delete)
  - Add weirdo CRUD operations (add, remove, update, select)
  - Add computed value methods (costs, validation)
  - _Requirements: 1.1-1.7, 2.1-2.7, 3.1-3.3, 10.5, 10.6, 11.5_

- [x] 1.2 Write unit tests for WarbandContext






  - Test warband creation with default values
  - Test weirdo add/remove operations
  - Test cost calculation integration
  - Test validation integration
  - _Requirements: 1.1-1.7, 3.1-3.3_

- [x] 2. Implement shared UI components






- [x] 2.1 Create SelectWithCost component


  - Build dropdown with cost display for each option
  - Add support for modified cost indication
  - Style with CSS modules
  - _Requirements: 5.2, 5.7, 5.8_

- [x] 2.2 Create ItemList component


  - Build checkbox list with descriptions and costs
  - Add limit enforcement (disable when limit reached)
  - Add modified cost indication
  - Style with CSS modules
  - _Requirements: 5.3, 5.4, 5.5, 12.2, 12.3, 12.4, 12.6_

- [x] 2.3 Create CostBadge component


  - Display base cost and modified cost
  - Add strikethrough styling for modified costs
  - _Requirements: 3.7, 5.7, 5.8_

- [x] 2.4 Create ValidationErrorDisplay component


  - Display validation errors as list or inline
  - Add tooltip on hover for detailed messages
  - Style error indicators
  - _Requirements: 4.3, 4.4, 4.6_

- [x] 2.5 Write unit tests for shared components



  - Test SelectWithCost renders options with costs
  - Test ItemList enforces limits
  - Test CostBadge shows modified costs
  - Test ValidationErrorDisplay shows tooltips
  - _Requirements: 5.2-5.8, 12.2-12.4, 12.6_

- [x] 3. Implement warband list view






- [x] 3.1 Create WarbandList component


  - Fetch all warbands from DataRepository
  - Display loading indicator while fetching
  - Display empty state message when no warbands
  - Render WarbandListItem for each warband
  - Add "Create New Warband" button
  - _Requirements: 7.1, 7.7, 7.8_

- [x] 3.2 Create WarbandListItem component

  - Display warband name, ability, point limit, total cost, weirdo count
  - Add click handler to load warband
  - Add delete button with confirmation
  - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.9_

- [x] 3.3 Create DeleteConfirmationDialog component


  - Build modal dialog with overlay
  - Display warband name being deleted
  - Add Confirm and Cancel buttons
  - Implement focus trap and escape key handling
  - _Requirements: 8.1, 8.2, 8.4_

- [x] 3.4 Write unit tests for warband list components



  - Test WarbandList renders all warbands
  - Test WarbandList shows empty state
  - Test WarbandListItem displays correct information
  - Test DeleteConfirmationDialog shows warband name
  - _Requirements: 7.1-7.9, 8.1, 8.2, 8.4_


- [-] 4. Implement warband editor structure



- [x] 4.1 Create WarbandEditor component


  - Build three-section layout (properties, weirdo list, weirdo editor)
  - Implement conditional rendering based on warband state
  - Add message prompting warband creation when needed
  - _Requirements: 2.1, 2.2, 2.6, 10.1, 10.2, 10.3, 10.4_

- [x] 4.2 Create WarbandProperties component


  - Add warband name input with validation
  - Add point limit radio buttons (75 or 125)
  - Add warband ability dropdown with descriptions
  - Display validation errors inline
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 5.1_

- [x] 4.3 Create WarbandCostDisplay component


  - Display total cost and point limit
  - Implement sticky positioning at top of editor
  - Add warning indicator when approaching limit
  - Add error styling when exceeding limit
  - Style with semi-transparent background
  - _Requirements: 1.4, 3.2, 3.3, 3.5, 6.2, 6.4, 6.5, 6.6_

- [x] 4.4 Write unit tests for warband editor components









  - Test WarbandEditor conditional rendering
  - Test WarbandProperties validation display
  - Test WarbandCostDisplay warning indicators
  - _Requirements: 1.1-1.6, 2.1, 2.2, 2.6, 3.2, 3.3, 3.5, 10.1-10.4_

- [x] 5. Implement weirdo list and management





- [x] 5.1 Create WeirdosList component


  - Display list of WeirdoCard components
  - Add "Add Leader" button (disabled if leader exists)
  - Add "Add Trooper" button
  - Handle weirdo selection
  - _Requirements: 2.3, 2.4, 2.7, 11.1, 11.2, 11.3_

- [x] 5.2 Create WeirdoCard component


  - Display weirdo name, type, and cost
  - Add selected state styling
  - Add error indicator for validation failures
  - Add remove button
  - Handle click to select weirdo
  - _Requirements: 3.3, 4.1, 4.2, 10.5, 11.4_


- [x] 5.3 Write unit tests for weirdo list components



  - Test WeirdosList disables Add Leader when leader exists
  - Test WeirdoCard shows error indicator
  - Test WeirdoCard selection highlighting
  - Test remove button updates warband cost
  - _Requirements: 2.3, 2.4, 3.3, 4.1, 4.2, 10.5, 11.1-11.4_




- [x] 5.4 Write property test for weirdo management






  - **Property 12: Add leader button is disabled when leader exists**
  - **Validates: Requirements 11.3**

- [x] 6. Implement weirdo editor core






- [x] 6.1 Create WeirdoEditor component


  - Build layout with sticky cost display at top
  - Add sections for basic info, attributes, weapons, equipment, powers, trait
  - Implement conditional rendering (hide ranged weapons if Firepower None, hide trait if trooper)
  - Display message when no weirdo selected
  - _Requirements: 10.3, 10.4, 12.7_

- [x] 6.2 Create WeirdoCostDisplay component


  - Display individual weirdo cost
  - Add expandable cost breakdown
  - Implement sticky positioning at top of weirdo editor
  - Add warning indicator when approaching limits
  - Add error styling when exceeding limits
  - _Requirements: 3.1, 3.3, 3.4, 6.1, 6.3, 6.5, 6.6_

- [x] 6.3 Create WeirdoBasicInfo component


  - Add weirdo name input
  - Display weirdo type (Leader/Trooper)
  - _Requirements: 10.3_

- [x] 6.4 Write unit tests for weirdo editor core



  - Test WeirdoEditor conditional rendering
  - Test WeirdoCostDisplay sticky positioning
  - Test WeirdoCostDisplay warning indicators
  - _Requirements: 3.1, 3.3, 3.4, 6.1, 6.3, 10.3, 10.4, 12.7_

- [x] 7. Implement attribute selectors






- [x] 7.1 Create AttributeSelector component


  - Build dropdown for each attribute (Speed, Defense, Firepower, Prowess, Willpower)
  - Display cost for each option
  - Show modified cost if warband ability applies
  - Handle attribute changes
  - _Requirements: 5.2, 12.1_

- [x] 7.2 Write unit tests for AttributeSelector



  - Test dropdown renders all attribute levels
  - Test cost display for each option
  - Test modified cost indication
  - _Requirements: 5.2, 12.1_


- [x] 7.3 Write property test for real-time cost updates



  - **Property 3: Real-time cost synchronization**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.6**


- [-] 8. Implement weapon selectors



- [x] 8.1 Create WeaponSelector component


  - Build checkbox list for close combat weapons
  - Build checkbox list for ranged weapons
  - Display name, cost, and notes for each weapon
  - Show modified cost if warband ability applies
  - Disable ranged weapons when Firepower is None
  - Handle weapon selection changes
  - _Requirements: 5.3, 5.7, 5.8, 12.2, 12.7_


- [x] 8.2 Write unit tests for WeaponSelector






  - Test weapon list renders with costs and notes
  - Test modified cost indication
  - Test ranged weapons disabled when Firepower None
  - _Requirements: 5.3, 5.7, 5.8, 12.2, 12.7_


- [x] 8.3 Write property test for ranged weapon disabling






  - **Property 14: Ranged weapon selections are disabled when Firepower is None**
  - **Validates: Requirements 12.7**

- [x] 9. Implement equipment and power selectors





- [x] 9.1 Create EquipmentSelector component


  - Build checkbox list for equipment
  - Display name, cost, and effect for each item
  - Show current count vs limit
  - Disable checkboxes when limit reached
  - Show modified cost if warband ability applies
  - Handle equipment selection changes
  - _Requirements: 5.4, 5.7, 5.8, 12.3, 12.6_

- [x] 9.2 Create PsychicPowerSelector component


  - Build checkbox list for psychic powers
  - Display name, cost, and effect for each power
  - Handle power selection changes
  - _Requirements: 5.5, 12.4_

- [x] 9.3 Create LeaderTraitSelector component


  - Build dropdown for leader traits
  - Add "None" option
  - Display description for each trait
  - Only render for leaders
  - Handle trait selection changes
  - _Requirements: 5.6, 12.5_

- [x] 9.4 Write unit tests for equipment and power selectors



  - Test EquipmentSelector enforces limits
  - Test EquipmentSelector shows count vs limit
  - Test PsychicPowerSelector renders all powers
  - Test LeaderTraitSelector only shown for leaders
  - _Requirements: 5.4, 5.5, 5.6, 12.3, 12.4, 12.5, 12.6_

- [x] 9.5 Write property test for equipment limit enforcement



  - **Property 13: Equipment selections are disabled at limit**
  - **Validates: Requirements 12.6**

- [x] 10. Implement validation feedback





- [x] 10.1 Add validation error styling to WeirdoCard


  - Apply error CSS class when validation fails
  - Add tooltip with validation messages on hover
  - Clear error styling when validation passes
  - Display all errors in tooltip
  - Show point total in error message when exceeding limits
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 10.2 Write unit tests for validation feedback




  - Test error styling applied to invalid weirdos
  - Test tooltip shows validation messages
  - Test error styling clears when corrected
  - Test multiple errors displayed in tooltip
  - _Requirements: 4.1-4.7_

- [x] 10.3 Write property test for validation error display





  - **Property 6: Validation errors are visually highlighted**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

- [x] 11. Implement save/delete operations and notifications





- [x] 11.1 Add save warband functionality


  - Validate warband before saving
  - Call DataRepository.saveWarband()
  - Display success notification on successful save
  - Display error notification on save failure
  - _Requirements: 9.1, 9.2_


- [x] 11.2 Add delete warband functionality


  - Show DeleteConfirmationDialog
  - Call DataRepository.deleteWarband() on confirm
  - Update warband list after deletion
  - Display success notification on successful delete
  - Display error notification on delete failure
  - _Requirements: 8.3, 8.5, 8.6, 9.3, 9.4_

- [x] 11.3 Create ToastNotification component


  - Display success (green) and error (red) messages
  - Auto-dismiss after 3-5 seconds
  - Add manual dismiss button
  - Position at top-right of viewport
  - _Requirements: 9.5, 9.6_


- [x] 11.4 Write unit tests for save/delete operations


  - Test save validates before persisting
  - Test save shows success notification
  - Test delete shows confirmation dialog
  - Test delete updates list after confirmation
  - _Requirements: 8.3, 8.5, 8.6, 9.1, 9.2, 9.3, 9.4_

- [ ]* 11.5 Write property test for notification lifecycle
  - **Property 11: Notifications provide feedback and auto-dismiss**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**


- [ ] 12. Implement CSS styling and sticky positioning

- [ ] 12.1 Create global styles and theme
  - Define CSS custom properties for colors, spacing, typography
  - Create global layout styles
  - Add base styles for forms and buttons
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 12.2 Implement sticky cost display styles
  - Add sticky positioning CSS for WarbandCostDisplay
  - Add sticky positioning CSS for WeirdoCostDisplay
  - Add semi-transparent backgrounds
  - Ensure displays don't obscure controls
  - Add warning and error state styling
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 12.3 Style component-specific CSS modules
  - Create CSS modules for WarbandList, WarbandEditor, WeirdosList, WeirdoCard, WeirdoEditor
  - Add selected state styling for WeirdoCard
  - Add error state styling for validation
  - Add hover effects and transitions
  - _Requirements: 4.1, 4.2, 10.5_

- [ ]* 12.4 Write unit tests for sticky positioning
  - Test sticky displays remain visible during scroll
  - Test displays don't obscure controls
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 12.5 Write property test for sticky display behavior
  - **Property 8: Sticky cost displays remain visible during scroll**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

- [ ] 13. Implement progressive disclosure and conditional rendering

- [ ] 13.1 Add conditional rendering logic to WarbandEditor
  - Hide weirdo management when no warband exists
  - Show message prompting warband creation
  - Reveal weirdo options when warband created or loaded
  - Hide weirdo options when warband closed/deselected
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ]* 13.2 Write unit tests for progressive disclosure
  - Test weirdo options hidden initially
  - Test weirdo options shown after warband creation
  - Test weirdo options shown after warband load
  - Test message displayed when options hidden
  - _Requirements: 2.1-2.7_

- [ ]* 13.3 Write property test for progressive disclosure
  - **Property 2: Progressive disclosure based on warband state**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

- [ ] 14. Implement cost warning indicators

- [ ] 14.1 Add warning logic to WeirdoCostDisplay
  - Calculate if weirdo cost is within 10 points of limit
  - Display warning indicator when approaching limit
  - Display error indicator when exceeding limit
  - _Requirements: 3.4_

- [ ] 14.2 Add warning logic to WarbandCostDisplay
  - Calculate if warband cost is within 15 points of limit
  - Display warning indicator when approaching limit
  - Display error indicator when exceeding limit
  - _Requirements: 3.5_

- [ ]* 14.3 Write unit tests for cost warning indicators
  - Test weirdo warning appears within 10 points of limit
  - Test warband warning appears within 15 points of limit
  - Test error indicators appear when exceeding limits
  - _Requirements: 3.4, 3.5_

- [ ]* 14.4 Write property test for cost warning indicators
  - **Property 4: Cost warning indicators appear correctly**
  - **Validates: Requirements 3.4, 3.5**

- [ ] 15. Integration and polish

- [ ] 15.1 Integrate all components into App
  - Set up routing (if needed) between list and editor views
  - Wire up WarbandContext provider
  - Connect DataRepository to context
  - Connect CostEngine and ValidationService to context
  - _Requirements: All_

- [ ] 15.2 Add loading states and error boundaries
  - Add loading indicators for async operations
  - Implement error boundary for component errors
  - Add retry logic for failed operations
  - _Requirements: 7.8_

- [ ] 15.3 Implement accessibility features
  - Add ARIA labels to all inputs
  - Add ARIA live regions for notifications
  - Add ARIA descriptions for validation errors
  - Ensure keyboard navigation works
  - Add focus management for dialogs
  - _Requirements: All_

- [ ]* 15.4 Write integration tests for complete workflows
  - Test warband creation → add weirdo → edit → save flow
  - Test warband load → edit → save flow
  - Test validation error → fix → save flow
  - Test delete with confirmation flow
  - _Requirements: All_

- [ ] 16. Final checkpoint and cleanup

- [ ] 16.1 Ensure all tests pass
  - Run full test suite
  - Fix any failing tests
  - Verify all property tests run minimum 50 iterations
  - _Requirements: All_

- [ ] 16.2 Clean up temporary build artifacts
  - Remove `*.timestamp-*.mjs` files from workspace root
  - Verify all tests pass after cleanup
  - _Requirements: All_

- [ ] 16.3 Verify feature completeness
  - Confirm all acceptance criteria are met
  - Review implementation against design document
  - Test all user workflows manually
  - _Requirements: All_
