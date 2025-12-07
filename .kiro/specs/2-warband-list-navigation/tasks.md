# Implementation Plan

- [ ] 1. Set up warband list context and state management

- [ ] 1.1 Create WarbandListContext
  - Define WarbandListContextValue interface
  - Implement context provider with state hooks
  - Add loadWarbands, createWarband, deleteWarband, selectWarband methods
  - Add notification management (showNotification, dismissNotification)
  - Integrate with DataRepository for storage operations
  - _Requirements: 1.1, 2.1, 2.2, 3.4, 4.1-4.6_

- [ ]* 1.2 Write unit tests for WarbandListContext
  - Test loadWarbands fetches from DataRepository
  - Test createWarband initializes with defaults
  - Test deleteWarband removes from storage
  - Test notification methods update state correctly
  - _Requirements: 1.1, 2.3-2.5, 3.4, 4.1-4.6_

- [ ] 2. Implement warband list view components

- [ ] 2.1 Create WarbandList component
  - Fetch warbands on component mount
  - Display loading indicator while fetching
  - Display empty state when no warbands exist
  - Render WarbandListItem for each warband
  - Add "Create New Warband" button in header
  - Manage delete confirmation dialog state
  - _Requirements: 1.1, 1.7, 1.8, 2.1_

- [ ]* 2.2 Write unit tests for WarbandList
  - Test loading state displays correctly
  - Test empty state displays when no warbands
  - Test warband items render for each warband
  - Test create new button triggers navigation
  - _Requirements: 1.1, 1.7, 1.8, 2.1_

- [ ] 2.3 Create WarbandListItem component
  - Display warband name prominently
  - Display warband ability with icon/label
  - Display point limit and total cost (e.g., "45/75 points")
  - Display weirdo count (e.g., "3 weirdos")
  - Add click handler to select warband
  - Add delete button with danger styling
  - Apply card styling from design system
  - Add hover state styling
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.9, 3.1, 5.1, 5.2, 5.3_

- [ ]* 2.4 Write unit tests for WarbandListItem
  - Test all warband information displays correctly
  - Test click handler triggers selection
  - Test delete button triggers confirmation
  - Test hover state applies correctly
  - _Requirements: 1.2-1.6, 1.9, 3.1, 5.1-5.3_

- [ ]* 2.5 Write property test for warband list display
  - **Property 1: Warband list displays complete information**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**

- [ ] 3. Implement delete confirmation dialog

- [ ] 3.1 Create DeleteConfirmationDialog component
  - Build modal dialog with overlay
  - Display warband name being deleted
  - Add Confirm button (danger styling)
  - Add Cancel button (secondary styling)
  - Implement focus trap for keyboard navigation
  - Handle Escape key to cancel
  - Handle click outside to cancel
  - Apply modal z-index from design system
  - _Requirements: 3.2, 3.3, 3.5_

- [ ]* 3.2 Write unit tests for DeleteConfirmationDialog
  - Test dialog displays warband name
  - Test confirm button triggers deletion
  - Test cancel button closes dialog
  - Test Escape key closes dialog
  - Test click outside closes dialog
  - _Requirements: 3.2, 3.3, 3.5_

- [ ]* 3.3 Write property test for delete confirmation
  - **Property 3: Delete confirmation prevents accidental deletion**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

- [ ] 4. Implement toast notification system

- [ ] 4.1 Create ToastNotification component
  - Display notification message
  - Apply success (green) or error (red) styling
  - Add dismiss button
  - Implement auto-dismiss after 3-5 seconds
  - Position at top-right of viewport
  - Add slide-in animation
  - Support stacking multiple notifications
  - Apply tooltip z-index from design system
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ]* 4.2 Write unit tests for ToastNotification
  - Test success styling applies correctly
  - Test error styling applies correctly
  - Test auto-dismiss after timeout
  - Test manual dismiss button works
  - Test multiple notifications stack correctly
  - _Requirements: 4.1-4.6_

- [ ]* 4.3 Write property test for notification lifecycle
  - **Property 4: Notifications provide feedback and auto-dismiss**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

- [ ] 5. Implement warband creation flow

- [ ] 5.1 Add create new warband functionality
  - Create new warband with default values (name: "New Warband", pointLimit: 75, ability: null)
  - Navigate to warband editor with new warband
  - Update URL to reflect editor view
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 6.5_

- [ ]* 5.2 Write unit tests for warband creation
  - Test new warband initializes with correct defaults
  - Test navigation to editor occurs
  - Test URL updates correctly
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 6.5_

- [ ]* 5.3 Write property test for warband initialization
  - **Property 2: New warband initializes with defaults**
  - **Validates: Requirements 2.3, 2.4, 2.5**

- [ ] 6. Implement warband deletion flow

- [ ] 6.1 Add delete warband functionality
  - Show DeleteConfirmationDialog when delete button clicked
  - Call DataRepository.deleteWarband() on confirm
  - Update warband list after successful deletion
  - Display success notification on successful delete
  - Display error notification on delete failure
  - _Requirements: 3.4, 3.6, 3.7, 4.3, 4.4_

- [ ]* 6.2 Write unit tests for warband deletion
  - Test confirmation dialog appears on delete click
  - Test warband removed from list after confirmation
  - Test success notification displays
  - Test error notification displays on failure
  - _Requirements: 3.4, 3.6, 3.7, 4.3, 4.4_

- [ ] 7. Implement navigation between list and editor

- [ ] 7.1 Add navigation functionality
  - Implement selectWarband to navigate to editor with warband loaded
  - Add "Back to List" button in editor (handled by parent App component)
  - Update URL when navigating between views
  - Load warband data when navigating to editor
  - Refresh warband list when navigating from editor
  - _Requirements: 1.9, 6.1, 6.2, 6.4, 6.5_

- [ ]* 7.2 Write unit tests for navigation
  - Test navigation to editor loads warband data
  - Test navigation to list refreshes warband list
  - Test URL updates correctly
  - _Requirements: 1.9, 6.1, 6.2, 6.4, 6.5_

- [ ]* 7.3 Write property test for navigation data handling
  - **Property 5: Navigation preserves or loads warband data**
  - **Validates: Requirements 6.2, 6.4**

- [ ] 8. Style components with design system

- [ ] 8.1 Apply design system styles to all components
  - Use card styles for WarbandListItem
  - Use button styles for create, delete, confirm, cancel buttons
  - Use spacing utilities for consistent layout
  - Use color tokens for success/error states
  - Use shadow tokens for elevation
  - Use z-index tokens for modal and notifications
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 8.2 Verify visual consistency
  - Test hover states apply correctly
  - Test spacing is consistent
  - Test colors match design system tokens
  - _Requirements: 5.1-5.6_

- [ ] 9. Add accessibility features

- [ ] 9.1 Implement keyboard navigation
  - Add keyboard support for list navigation (arrow keys)
  - Add keyboard support for dialogs (Tab, Escape)
  - Add focus management for modal dialogs
  - Add ARIA labels for buttons and actions
  - Add ARIA live regions for notifications
  - _Requirements: All_

- [ ]* 9.2 Test accessibility compliance
  - Test keyboard navigation works correctly
  - Test focus indicators are visible
  - Test screen reader announcements work
  - _Requirements: All_

- [ ] 10. Integration and error handling

- [ ] 10.1 Add error handling for all operations
  - Handle DataRepository errors gracefully
  - Display error notifications with helpful messages
  - Add retry logic for transient failures
  - Log errors for debugging
  - _Requirements: 3.7, 4.2, 4.4_

- [ ]* 10.2 Write integration tests
  - Test complete warband creation flow
  - Test complete warband deletion flow
  - Test navigation between list and editor
  - Test error handling for failed operations
  - _Requirements: All_

- [ ] 11. Final verification and cleanup

- [ ] 11.1 Ensure all tests pass
  - Run full test suite
  - Fix any failing tests
  - Verify all property tests run minimum 50 iterations
  - _Requirements: All_

- [ ] 11.2 Clean up temporary build artifacts
  - Remove any temporary files
  - Verify builds correctly
  - _Requirements: All_

- [ ] 11.3 Verify feature completeness
  - Confirm all acceptance criteria are met
  - Review implementation against design document
  - Test all user workflows manually
  - _Requirements: All_
