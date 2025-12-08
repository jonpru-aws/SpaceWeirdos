# Implementation Plan

- [ ] 1. Set up API integration for weirdo editor

- [ ] 1.1 Add API endpoints for game data
  - Implement GET /api/game-data/attributes endpoint
  - Implement GET /api/game-data/weapons/close endpoint
  - Implement GET /api/game-data/weapons/ranged endpoint
  - Implement GET /api/game-data/equipment endpoint
  - Implement GET /api/game-data/psychic-powers endpoint
  - Implement GET /api/game-data/leader-traits endpoint
  - _Requirements: 9.1_

- [ ] 1.2 Add API endpoint for cost calculation
  - Implement POST /api/cost/calculate endpoint
  - Accept weirdo configuration (type, attributes, weapons, equipment, powers, warband ability)
  - Return total cost and breakdown
  - Optimize for < 100ms response time
  - _Requirements: 9.2_

- [ ] 1.3 Add API endpoint for weirdo validation
  - Implement POST /api/validation/weirdo endpoint
  - Accept weirdo configuration
  - Return structured validation errors
  - _Requirements: 9.4_

- [ ] 2. Create GameDataContext for API integration

- [ ] 2.1 Create GameDataContext
  - Fetch all game data via API on app initialization
  - Cache game data in context
  - Provide loading and error states
  - Expose game data to components
  - _Requirements: 9.1, 9.5, 9.6_

- [ ] 2.2 Write unit tests for GameDataContext
  - Test game data fetches on initialization
  - Test loading states
  - Test error handling for failed API calls
  - Test data caching
  - _Requirements: 9.1, 9.5_

- [x] 3. Create shared selector components

- [x] 3.1 Create SelectWithCost component
  - Build dropdown with cost display for each option
  - Add support for modified cost indication (strikethrough base cost)
  - Apply select styles from design system
  - _Requirements: 3.3, 3.4_

- [x] 3.2 Create ItemList component
  - Build checkbox list with descriptions and costs
  - Add limit enforcement (disable when limit reached)
  - Add modified cost indication
  - Apply checkbox and list styles from design system
  - _Requirements: 4.3, 5.2, 5.3, 5.4, 5.5, 6.2_

- [x] 3.3 Write unit tests for shared components
  - Test SelectWithCost renders options with costs
  - Test ItemList enforces limits
  - Test modified costs display correctly
  - _Requirements: 3.3, 3.4, 4.3, 5.2-5.5_

- [x] 4. Implement weirdo list and management

- [x] 4.1 Create WeirdosList component
  - Display list of WeirdoCard components
  - Add "Add Leader" button (disabled if leader exists)
  - Add "Add Trooper" button
  - Handle weirdo selection
  - Apply list and button styles from design system
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 4.2 Create WeirdoCard component
  - Display weirdo name, type, and cost
  - Add selected state styling
  - Add error indicator for validation failures
  - Add remove button
  - Handle click to select weirdo
  - Apply card styles from design system
  - _Requirements: 1.5, 2.1_

- [x] 4.3 Write unit tests for weirdo list
  - Test WeirdosList disables Add Leader when leader exists
  - Test WeirdoCard shows all information
  - Test remove button deletes weirdo
  - _Requirements: 1.1-1.5, 2.1-2.5_

- [x]* 4.4 Write property test for add leader button
  - **Property 1: Add leader button disabled when leader exists**
  - **Validates: Requirements 1.3**

- [x] 5. Implement weirdo editor core

- [x] 5.1 Create WeirdoEditor component
  - Build layout with sections for attributes, weapons, equipment, powers, trait
  - Implement conditional rendering (hide ranged weapons if Firepower None, hide trait if trooper)
  - Display message when no weirdo selected
  - Apply layout styles from design system
  - _Requirements: 4.4, 7.2, 8.1, 8.2, 8.3, 8.4_

- [x] 5.2 Write unit tests for WeirdoEditor
  - Test conditional rendering works correctly
  - Test message displays when no weirdo selected
  - _Requirements: 4.4, 7.2, 8.1-8.4_

- [ ]* 5.3 Write property test for progressive disclosure
  - **Property 4: Progressive disclosure based on warband state**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [ ] 6. Refactor to use API for cost calculations

- [ ] 6.1 Replace CostEngine with API calls
  - Remove direct CostEngine imports
  - Call POST /api/cost/calculate when weirdo properties change
  - Debounce API calls to reduce network traffic
  - Handle API response and update costs
  - Display cost breakdown from API response
  - _Requirements: 9.2, 9.5, 9.6_

- [ ] 6.2 Write unit tests for cost calculation API integration
  - Test cost API called when properties change
  - Test debouncing works correctly
  - Test cost updates from API response
  - Test error handling for failed API calls
  - _Requirements: 9.2, 9.5_

- [x] 7. Implement attribute selectors

- [x] 7.1 Create AttributeSelector component
  - Build dropdown for each attribute (Speed, Defense, Firepower, Prowess, Willpower)
  - Display cost for each option
  - Show modified cost if warband ability applies
  - Handle attribute changes
  - Use SelectWithCost component
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7.2 Write unit tests for AttributeSelector
  - Test dropdown renders all attribute levels
  - Test cost display for each option
  - Test modified cost indication
  - Test attribute updates trigger cost recalculation via API
  - _Requirements: 3.1-3.5, 9.2_

- [x] 8. Implement weapon selectors

- [x] 8.1 Create WeaponSelector component
  - Build checkbox list for close combat weapons
  - Build checkbox list for ranged weapons
  - Display name, cost, and notes for each weapon
  - Show modified cost if warband ability applies
  - Disable ranged weapons when Firepower is None
  - Handle weapon selection changes
  - Use ItemList component
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 8.2 Write unit tests for WeaponSelector
  - Test weapon list renders with costs and notes
  - Test modified cost indication
  - Test ranged weapons disabled when Firepower None
  - Test weapon updates trigger cost recalculation via API
  - _Requirements: 4.1-4.6, 9.2_

- [x]* 8.3 Write property test for ranged weapon disabling
  - **Property 3: Ranged weapons disabled when Firepower is None**
  - **Validates: Requirements 4.4**

- [x] 9. Implement equipment selector

- [x] 9.1 Create EquipmentSelector component
  - Build checkbox list for equipment
  - Display name, cost, and effect for each item
  - Show current count vs limit
  - Disable checkboxes when limit reached
  - Show modified cost if warband ability applies
  - Handle equipment selection changes
  - Use ItemList component
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 9.2 Write unit tests for EquipmentSelector
  - Test equipment list renders correctly
  - Test limit enforcement
  - Test count vs limit display
  - Test equipment updates trigger cost recalculation via API
  - _Requirements: 5.1-5.6, 9.2_

- [x]* 9.3 Write property test for equipment limit
  - **Property 2: Equipment selections disabled at limit**
  - **Validates: Requirements 5.4**

- [x] 10. Implement psychic power and leader trait selectors

- [x] 10.1 Create PsychicPowerSelector component
  - Build checkbox list for psychic powers
  - Display name, cost, and effect for each power
  - Handle power selection changes
  - Use ItemList component
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 10.2 Create LeaderTraitSelector component
  - Build dropdown for leader traits
  - Add "None" option
  - Display description for each trait
  - Only render for leaders
  - Handle trait selection changes
  - Use SelectWithCost component (without cost display)
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 10.3 Write unit tests for power and trait selectors
  - Test PsychicPowerSelector renders all powers
  - Test LeaderTraitSelector only shown for leaders
  - Test "None" option available
  - _Requirements: 6.1-6.3, 7.1-7.4_

- [ ]* 10.4 Write property test for leader trait visibility
  - **Property 5: Leader trait selector only shown for leaders**
  - **Validates: Requirements 7.2**

- [x] 11. Implement weirdo add/remove operations

- [x] 11.1 Add weirdo creation functionality
  - Create new leader or trooper with default values
  - Automatically select new weirdo for editing
  - Add to weirdo list
  - Initialize with default attributes
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6_

- [x] 11.2 Add weirdo removal functionality
  - Remove weirdo from warband
  - Update warband total cost via API
  - Clear editor if last weirdo removed
  - Deselect if selected weirdo removed
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.2_

- [x] 11.3 Write unit tests for add/remove operations
  - Test weirdo creation initializes correctly
  - Test weirdo removal updates cost via API
  - Test editor clears when last weirdo removed
  - _Requirements: 1.1-1.6, 2.1-2.5, 9.2_

- [x] 12. Integrate equipment, psychic powers, and leader trait selectors into WeirdoEditor






- [x] 12.1 Integrate EquipmentSelector into WeirdoEditor


  - Replace placeholder text with EquipmentSelector component
  - Wire up equipment state and onChange handler
  - Pass weirdo type for limit calculation
  - Pass warband ability for cost modifiers
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 12.2 Integrate PsychicPowerSelector into WeirdoEditor

  - Replace placeholder text with PsychicPowerSelector component
  - Wire up psychic powers state and onChange handler
  - Pass available powers from GameDataContext
  - _Requirements: 6.1, 6.2, 6.3, 9.1_

- [x] 12.3 Integrate LeaderTraitSelector into WeirdoEditor

  - Replace placeholder text with LeaderTraitSelector component
  - Wire up leader trait state and onChange handler
  - Pass available traits from GameDataContext
  - Ensure conditional rendering for leaders only
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.1_

- [x] 12.4 Write integration tests for complete WeirdoEditor





  - Test equipment selector integration
  - Test psychic power selector integration
  - Test leader trait selector integration
  - Test all selectors work together correctly with API
  - _Requirements: 5.1-5.6, 6.1-6.3, 7.1-7.4, 9.1, 9.2_

- [-] 13. Style and accessibility




- [x] 13.1 Apply design system styles to all components


  - Use card styles for WeirdoCard
  - Use form styles for all selectors
  - Use button styles for add/remove buttons
  - Use spacing utilities for layout
  - _Requirements: All_

- [x] 13.2 Add accessibility features








  - Add labels for all form fields
  - Add ARIA labels where needed
  - Ensure keyboard navigation works
  - Add focus management
  - _Requirements: All_

- [x] 14. Final verification






- [x] 14.1 Ensure all tests pass


  - Run full test suite
  - Fix any failing tests
  - Verify property tests run minimum 50 iterations
  - Verify API integration works correctly
  - _Requirements: All_

- [x] 14.2 Verify feature completeness


  - Confirm all acceptance criteria are met
  - Review implementation against design document
  - Test all user workflows manually with API
  - Verify cost calculations via API are performant
  - Verify game data caching works correctly
  - _Requirements: All, 9.1-9.7_
