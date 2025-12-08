# Implementation Plan

## Completed Tasks

- [x] 1. Set up API client for backend communication
- [x] 1.1 Create apiClient service
  - Implement HTTP client wrapper (axios or fetch)
  - Add request/response interceptors
  - Add error handling for network failures
  - Configure base URL and headers
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 1.2 Define API response types
  - Create TypeScript interfaces for API responses
  - Define success and error response formats
  - Add WarbandSummary type for list responses
  - _Requirements: 7.5, 7.7_

- [x] 2. Set up warband list context and state management
- [x] 2.1 WarbandContext implementation (already exists in WarbandContext.tsx)
  - Context provides warband CRUD operations via API calls
  - Manages warband and weirdo state
  - Handles API response success and error cases
  - _Requirements: 1.1, 2.1, 2.2, 3.4, 4.1-4.6, 7.1-7.7_

- [x] 3. Refactor WarbandContext to use API calls
- [x] 3.1 Replace direct DataRepository calls with API calls
  - Replace DataRepository.getAllWarbands() with GET /api/warbands
  - Replace DataRepository.createWarband() with POST /api/warbands
  - Replace DataRepository.updateWarband() with PUT /api/warbands/:id
  - Replace DataRepository.deleteWarband() with DELETE /api/warbands/:id
  - Remove direct imports of DataRepository
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [x] 3.2 Add API error handling
  - Handle network failures gracefully
  - Display user-friendly error messages
  - Add retry logic for transient failures
  - _Requirements: 7.5_

- [x] 4. Implement warband list view components
- [x] 4.1 WarbandList component implemented
  - Fetches warbands via API on mount
  - Displays loading, empty, and error states
  - Renders WarbandListItem for each warband
  - Includes "Create New Warband" button
  - Manages delete confirmation dialog
  - _Requirements: 1.1, 1.7, 1.8, 2.1, 7.1_

- [x] 4.2 WarbandListItem component implemented
  - Displays all warband information (name, ability, costs, weirdo count)
  - Click handler to select warband
  - Delete button with danger styling
  - Card styling with hover states
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.9, 3.1, 5.1, 5.2, 5.3_

- [x] 5. Implement delete confirmation dialog
- [x] 5.1 DeleteConfirmationDialog component implemented
  - Modal dialog with overlay
  - Displays warband name
  - Confirm and Cancel buttons
  - Focus trap and keyboard navigation
  - Escape key and click outside to cancel
  - _Requirements: 3.2, 3.3, 3.5_

- [x] 6. Implement toast notification system
- [x] 6.1 ToastNotification component implemented
  - Success and error styling
  - Auto-dismiss after 4 seconds
  - Manual dismiss button
  - Positioned at top-right
  - Slide-in animation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 7. Implement warband creation flow
- [x] 7.1 Create new warband functionality implemented in App.tsx
  - Creates warband with defaults via API call
  - Navigates to editor
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 6.5, 7.2_

- [x] 8. Implement warband deletion flow
- [x] 8.1 Delete warband functionality implemented
  - Shows DeleteConfirmationDialog
  - Calls DELETE /api/warbands/:id via API client
  - Updates list after deletion
  - Displays success/error notifications
  - _Requirements: 3.4, 3.6, 3.7, 4.3, 4.4, 7.4_

- [x] 9. Implement navigation between list and editor
- [x] 9.1 Navigation functionality implemented in App.tsx
  - View state management (list/editor)
  - Load warband on selection
  - Back to list button in editor
  - _Requirements: 1.9, 6.1, 6.2, 6.4, 6.5_

- [x] 10. Style components with design system
- [x] 10.1 All component styles implemented
  - WarbandList.css with card styles
  - DeleteConfirmationDialog.css with modal styles
  - ToastNotification.css with notification styles
  - Responsive design included
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 11. Add accessibility features
- [x] 11.1 Accessibility features implemented
  - ARIA labels on all interactive elements
  - ARIA live regions for notifications
  - Focus management in dialogs
  - Keyboard navigation (Tab, Escape)
  - _Requirements: All_

## Remaining Tasks

All tasks for this spec have been completed. The warband list navigation feature is fully implemented with:

- ✅ API client for backend communication
- ✅ Warband list view with loading, empty, and error states
- ✅ Warband creation and deletion flows
- ✅ Delete confirmation dialog with accessibility features
- ✅ Toast notification system
- ✅ Navigation between list and editor views
- ✅ Complete styling with design system
- ✅ Comprehensive unit test coverage

The implementation satisfies all requirements from the requirements document and follows the design specified in the design document.
