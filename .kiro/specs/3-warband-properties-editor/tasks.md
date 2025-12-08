# Implementation Plan

- [x] 1. Set up API integration for warband properties







- [x] 1.1 Add API endpoints for warband abilities

  - Implement GET /api/game-data/warband-abilities endpoint
  - Return all available warband abilities with descriptions
  - _Requirements: 6.3_

- [x] 1.2 Add API endpoints for validation


  - Implement POST /api/validation/warband endpoint
  - Accept warband properties (name, pointLimit, ability)
  - Return structured validation errors
  - _Requirements: 6.1, 6.2_

- [x] 1.3 Add API endpoint for saving warbands


  - Implement PUT /api/warbands/:id endpoint
  - Accept complete warband data
  - Validate before saving
  - Return success/error response
  - _Requirements: 6.2, 6.6_

- [x] 2. Create warband editor shell structure

- [x] 2.1 Create WarbandEditor component
  - Build two-section layout (properties at top, weirdo list below)
  - Implement conditional rendering (show message if no warband selected)
  - Apply layout styles from design system
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2.2 Write unit tests for WarbandEditor shell





  - Test two-section layout renders correctly
  - Test message displays when no warband selected
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Implement warband properties form

- [x] 3.1 Create WarbandProperties component
  - Add warband name text input with label
  - Add point limit radio buttons (75 and 125)
  - Add warband ability dropdown
  - Apply form styles from design system
  - Use consistent spacing between fields
  - _Requirements: 1.1, 2.1, 3.1, 4.4, 4.5, 5.1_

- [x] 3.2 Write unit tests for WarbandProperties





  - Test all form fields render correctly
  - Test form updates warband on change
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [x] 4. Refactor to use API for warband abilities





- [x] 4.1 Fetch warband abilities via API


  - Replace direct DataRepository import with API call
  - Call GET /api/game-data/warband-abilities on component mount
  - Handle loading and error states
  - Cache abilities data
  - _Requirements: 3.2, 6.3, 6.4, 6.5_

- [x] 4.2 Write unit tests for API integration


  - Test abilities fetch on mount
  - Test loading state displays
  - Test error handling for failed API calls
  - _Requirements: 6.3, 6.4_

- [x] 5. Implement warband name input with validation

- [x] 5.1 Add warband name input functionality
  - Update warband name on input change
  - Display validation error if empty
  - Apply focus indicator styling
  - Clear error when valid name entered
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 5.2 Write unit tests for name validation



  - Test empty name shows validation error
  - Test valid name clears error
  - Test focus indicator applies
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [ ]* 5.3 Write property test for name validation
  - **Property 1: Warband name validation prevents empty names**
  - **Validates: Requirements 1.3**

- [x] 6. Implement point limit selection

- [x] 6.1 Add point limit radio buttons
  - Update warband point limit on selection
  - Visually indicate selected option
  - Trigger cost recalculation on change
  - Apply radio button styles from design system
  - _Requirements: 2.2, 2.3, 2.4_




- [x] 6.2 Write unit tests for point limit selection





  - Test point limit updates on selection
  - Test selected option is visually indicated
  - Test cost recalculation is triggered
  - _Requirements: 2.2, 2.3, 2.4_

- [ ]* 6.3 Write property test for point limit updates
  - **Property 2: Point limit selection updates immediately**
  - **Validates: Requirements 2.2, 2.4**

- [x] 7. Implement warband ability selector

- [x] 7.1 Warband ability selector with descriptions
  - Build dropdown with all available abilities
  - Display ability descriptions inline
  - Include "None" option to deselect
  - Update warband ability on selection


  - Trigger cost recalculation on change
  - Apply select styles from design system
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 7.2 Write unit tests for ability selector





  - Test all abilities display with descriptions
  - Test "None" option is available
  - Test ability updates on selection
  - Test cost recalculation is triggered
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ]* 7.3 Write property test for ability cost recalculation
  - **Property 3: Warband ability selection triggers cost recalculation**
  - **Validates: Requirements 3.4, 3.5**

- [x] 8. Refactor save functionality to use API







- [x] 8.1 Replace direct service calls with API calls

  - Replace ValidationService.validateWarband() with POST /api/validation/warband
  - Replace DataRepository.saveWarband() with PUT /api/warbands/:id
  - Remove direct imports of ValidationService and DataRepository
  - Handle API response success and error cases
  - _Requirements: 6.1, 6.2, 6.4, 6.5, 6.6_

- [x] 8.2 Update save functionality with API validation


  - Call validation API before save
  - Display API validation errors inline
  - Call save API if validation passes
  - Display success/error notifications based on API response
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2_

- [x] 9. Implement save functionality with validation

- [x] 9.1 Save warband functionality
  - Validate warband before saving



  - Call DataRepository.saveWarband() if valid
  - Display validation errors if invalid
  - Display success notification on successful save
  - Display error notification on save failure
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 9.2 Write unit tests for save functionality with API






  - Test validation API called before save
  - Test save prevented if validation fails
  - Test save API called if validation passes
  - Test success notification displays
  - Test error notification displays on API failure
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.4_

- [ ]* 9.3 Write property test for save validation
  - **Property 4: Save validates before persisting**
  - **Validates: Requirements 5.2, 5.3, 5.4**

- [x] 10. Style and accessibility

- [x] 10.1 Apply design system styles
  - Use card styles for properties section
  - Use form styles for inputs and selects
  - Use button styles for save button
  - Use spacing utilities for layout
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 10.2 Add accessibility features
  - Add labels for all form fields
  - Add ARIA labels where needed
  - Ensure keyboard navigation works
  - Add focus management
  - _Requirements: All_

- [x] 11. Final verification





- [x] 11.1 Ensure all tests pass



  - Run full test suite
  - Fix any failing tests
  - Verify API integration works correctly
  - _Requirements: All_

- [x] 11.2 Verify feature completeness


  - Confirm all acceptance criteria are met
  - Review implementation against design document
  - Test all user workflows manually with API
  - Verify API error handling works correctly
  - _Requirements: All, 6.1-6.6_
