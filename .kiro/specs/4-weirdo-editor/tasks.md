# Implementation Plan

- [ ] 1. Create shared selector components

- [ ] 1.1 Create SelectWithCost component
  - Build dropdown with cost display for each option
  - Add support for modified cost indication (strikethrough base cost)
  - Apply select styles from design system
  - _Requirements: 3.3, 3.4_

- [ ] 1.2 Create ItemList component
  - Build checkbox list with descriptions and costs
  - Add limit enforcement (disable when limit reached)
  - Add modified cost indication
  - Apply checkbox and list styles from design system
  - _Requirements: 4.3, 5.2, 5.3, 5.4, 5.5, 6.2_

- [ ]* 1.3 Write unit tests for shared components
  - Test SelectWithCost renders options with costs
  - Test ItemList enforces limits
  - Test modified costs display correctly
  - _Requirements: 3.3, 3.4, 4.3, 5.2-5.5_

- [ ] 2. Implement weirdo list and management

- [ ] 2.1 Create WeirdosList component
  - Display list of WeirdoCard components
  - Add "Add Leader" button (disabled if leader exists)
  - Add "Add Trooper" button
  - Handle weirdo selection
  - Apply list and button styles from design system
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 2.2 Create WeirdoCard component
  - Display weirdo name, type, and cost
  - Add selected state styling
  - Add error indicator for validation failures
  - Add remove button
  - Handle click to select weirdo
  - Apply card styles from design system
  - _Requirements: 1.5, 2.1_

- [ ]* 2.3 Write unit tests for weirdo list
  - Test WeirdosList disables Add Leader when leader exists
  - Test WeirdoCard shows all information
  - Test remove button deletes weirdo
  - _Requirements: 1.1-1.5, 2.1-2.5_

- [ ]* 2.4 Write property test for add leader button
  - **Property 1: Add leader button disabled when leader exists**
  - **Validates: Requirements 1.3**

- [ ] 3. Implement weirdo editor core

- [ ] 3.1 Create WeirdoEditor component
  - Build layout with sections for attributes, weapons, equipment, powers, trait
  - Implement conditional rendering (hide ranged weapons if Firepower None, hide trait if trooper)
  - Display message when no weirdo selected
  - Apply layout styles from design system
  - _Requirements: 4.4, 7.2, 8.1, 8.2, 8.3, 8.4_

- [ ]* 3.2 Write unit tests for WeirdoEditor
  - Test conditional rendering works correctly
  - Test message displays when no weirdo selected
  - _Requirements: 4.4, 7.2, 8.1-8.4_

- [ ]* 3.3 Write property test for progressive disclosure
  - **Property 4: Progressive disclosure based on warband state**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [ ] 4. Implement attribute selectors

- [ ] 4.1 Create AttributeSelector component
  - Build dropdown for each attribute (Speed, Defense, Firepower, Prowess, Willpower)
  - Display cost for each option
  - Show modified cost if warband ability applies
  - Handle attribute changes
  - Use SelectWithCost component
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 4.2 Write unit tests for AttributeSelector
  - Test dropdown renders all attribute levels
  - Test cost display for each option
  - Test modified cost indication
  - Test attribute updates trigger cost recalculation
  - _Requirements: 3.1-3.5_

- [ ] 5. Implement weapon selectors

- [ ] 5.1 Create WeaponSelector component
  - Build checkbox list for close combat weapons
  - Build checkbox list for ranged weapons
  - Display name, cost, and notes for each weapon
  - Show modified cost if warband ability applies
  - Disable ranged weapons when Firepower is None
  - Handle weapon selection changes
  - Use ItemList component
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ]* 5.2 Write unit tests for WeaponSelector
  - Test weapon list renders with costs and notes
  - Test modified cost indication
  - Test ranged weapons disabled when Firepower None
  - Test weapon updates trigger cost recalculation
  - _Requirements: 4.1-4.6_

- [ ]* 5.3 Write property test for ranged weapon disabling
  - **Property 3: Ranged weapons disabled when Firepower is None**
  - **Validates: Requirements 4.4**

- [ ] 6. Implement equipment selector

- [ ] 6.1 Create EquipmentSelector component
  - Build checkbox list for equipment
  - Display name, cost, and effect for each item
  - Show current count vs limit
  - Disable checkboxes when limit reached
  - Show modified cost if warband ability applies
  - Handle equipment selection changes
  - Use ItemList component
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]* 6.2 Write unit tests for EquipmentSelector
  - Test equipment list renders correctly
  - Test limit enforcement
  - Test count vs limit display
  - Test equipment updates trigger cost recalculation
  - _Requirements: 5.1-5.6_

- [ ]* 6.3 Write property test for equipment limit
  - **Property 2: Equipment selections disabled at limit**
  - **Validates: Requirements 5.4**

- [ ] 7. Implement psychic power and leader trait selectors

- [ ] 7.1 Create PsychicPowerSelector component
  - Build checkbox list for psychic powers
  - Display name, cost, and effect for each power
  - Handle power selection changes
  - Use ItemList component
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 7.2 Create LeaderTraitSelector component
  - Build dropdown for leader traits
  - Add "None" option
  - Display description for each trait
  - Only render for leaders
  - Handle trait selection changes
  - Use SelectWithCost component (without cost display)
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 7.3 Write unit tests for power and trait selectors
  - Test PsychicPowerSelector renders all powers
  - Test LeaderTraitSelector only shown for leaders
  - Test "None" option available
  - _Requirements: 6.1-6.3, 7.1-7.4_

- [ ]* 7.4 Write property test for leader trait visibility
  - **Property 5: Leader trait selector only shown for leaders**
  - **Validates: Requirements 7.2**

- [ ] 8. Implement weirdo add/remove operations

- [ ] 8.1 Add weirdo creation functionality
  - Create new leader or trooper with default values
  - Automatically select new weirdo for editing
  - Add to weirdo list
  - Initialize with default attributes
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6_

- [ ] 8.2 Add weirdo removal functionality
  - Remove weirdo from warband
  - Update warband total cost
  - Clear editor if last weirdo removed
  - Deselect if selected weirdo removed
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 8.3 Write unit tests for add/remove operations
  - Test weirdo creation initializes correctly
  - Test weirdo removal updates cost
  - Test editor clears when last weirdo removed
  - _Requirements: 1.1-1.6, 2.1-2.5_

- [ ] 9. Style and accessibility

- [ ] 9.1 Apply design system styles to all components
  - Use card styles for WeirdoCard
  - Use form styles for all selectors
  - Use button styles for add/remove buttons
  - Use spacing utilities for layout
  - _Requirements: All_

- [ ] 9.2 Add accessibility features
  - Add labels for all form fields
  - Add ARIA labels where needed
  - Ensure keyboard navigation works
  - Add focus management
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
  - _Requirements: All_
