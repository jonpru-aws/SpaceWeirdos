# Requirements Document

## Introduction

This document specifies the warband list view and navigation functionality for the Space Weirdos Warband Builder. It defines how users view, create, load, delete, and navigate between warbands, including confirmation dialogs and notification messages.

This spec focuses on the list view, CRUD operations, and user feedback. It depends on the design system spec (for styling) and the data persistence spec (for storage operations).

## Glossary

- **Warband List**: The UI view displaying all saved warbands with summary information
- **Warband List Item**: A single warband entry in the list showing name, ability, cost, and weirdo count
- **CRUD Operations**: Create, Read, Update, Delete operations for warbands
- **Confirmation Dialog**: A modal dialog requiring user confirmation before destructive actions
- **Toast Notification**: A temporary message displaying success or error feedback
- **Navigation**: Moving between the list view and editor view
- **Empty State**: The UI displayed when no warbands exist
- **Loading State**: The UI displayed while data is being fetched

## Requirements

### Requirement 1

**User Story:** As a player, I want to view a list of all my saved warbands, so that I can choose which one to load or manage.

#### Acceptance Criteria

1. WHEN a user navigates to the warband list THEN the Warband Builder SHALL display all saved warbands
2. WHEN displaying a warband in the list THEN the Warband Builder SHALL show the warband name
3. WHEN displaying a warband in the list THEN the Warband Builder SHALL show the warband ability
4. WHEN displaying a warband in the list THEN the Warband Builder SHALL show the point limit
5. WHEN displaying a warband in the list THEN the Warband Builder SHALL show the total point cost
6. WHEN displaying a warband in the list THEN the Warband Builder SHALL show the number of weirdos in the warband
7. WHEN no warbands exist THEN the Warband Builder SHALL display a message indicating no warbands are available
8. WHEN the warband list is loading THEN the Warband Builder SHALL display a loading indicator
9. WHEN a warband list item is clicked THEN the Warband Builder SHALL navigate to the warband editor with that warband loaded

### Requirement 2

**User Story:** As a player, I want to create a new warband from the list view, so that I can start building a new team.

#### Acceptance Criteria

1. WHEN the warband list is displayed THEN the Warband Builder SHALL provide a button to create a new warband
2. WHEN a user clicks the create new warband button THEN the Warband Builder SHALL navigate to the warband editor with an empty warband
3. WHEN a new warband is created THEN the Warband Builder SHALL initialize the warband name with the default value "New Warband"
4. WHEN a new warband is created THEN the Warband Builder SHALL set the point limit to 75 by default
5. WHEN a new warband is created THEN the Warband Builder SHALL set the warband ability to none by default

### Requirement 3

**User Story:** As a player, I want to delete a saved warband with confirmation, so that I can remove warbands I no longer need without accidental deletion.

#### Acceptance Criteria

1. WHEN a warband list item is displayed THEN the Warband Builder SHALL provide a delete button for that warband
2. WHEN a user clicks the delete button THEN the Warband Builder SHALL display a confirmation dialog
3. WHEN the confirmation dialog is shown THEN the Warband Builder SHALL display the warband name being deleted
4. WHEN a user confirms deletion THEN the Warband Builder SHALL remove the warband from storage
5. WHEN a user cancels deletion THEN the Warband Builder SHALL close the dialog and retain the warband
6. WHEN a warband is successfully deleted THEN the Warband Builder SHALL update the warband list to remove the deleted warband
7. WHEN deletion fails THEN the Warband Builder SHALL display an error message with details

### Requirement 4

**User Story:** As a player, I want to see confirmation messages for save and delete operations, so that I know my actions were successful.

#### Acceptance Criteria

1. WHEN a warband is successfully saved THEN the Warband Builder SHALL display a success notification
2. WHEN a warband save fails THEN the Warband Builder SHALL display an error notification with details
3. WHEN a warband is successfully deleted THEN the Warband Builder SHALL display a success notification
4. WHEN a warband deletion fails THEN the Warband Builder SHALL display an error notification with details
5. WHEN success or error notifications are displayed THEN the Warband Builder SHALL auto-dismiss them after 3-5 seconds
6. WHEN notifications are displayed THEN the Warband Builder SHALL allow manual dismissal

### Requirement 5

**User Story:** As a player, I want the warband list to be visually organized and easy to scan, so that I can quickly find the warband I'm looking for.

#### Acceptance Criteria

1. WHEN warband list items are displayed THEN the Warband Builder SHALL use card-style layout with clear visual separation
2. WHEN warband list items are displayed THEN the Warband Builder SHALL show the most important information prominently (name and cost)
3. WHEN a user hovers over a warband list item THEN the Warband Builder SHALL provide visual feedback (hover state)
4. WHEN warband list items are displayed THEN the Warband Builder SHALL use consistent spacing between items
5. WHEN the warband list contains many warbands THEN the Warband Builder SHALL display them in a scrollable container
6. WHEN warband list items are displayed THEN the Warband Builder SHALL use icons or visual indicators for warband abilities

### Requirement 6

**User Story:** As a player, I want to navigate between the list view and editor view seamlessly, so that I can switch between managing multiple warbands and editing a specific one.

#### Acceptance Criteria

1. WHEN viewing the warband editor THEN the Warband Builder SHALL provide a button to return to the warband list
2. WHEN a user clicks the return to list button THEN the Warband Builder SHALL navigate to the warband list view
3. WHEN navigating to the warband list THEN the Warband Builder SHALL preserve any unsaved changes in the editor (or warn about losing changes)
4. WHEN navigating from list to editor THEN the Warband Builder SHALL load the selected warband data
5. WHEN navigation occurs THEN the Warband Builder SHALL update the browser URL to reflect the current view

## Items Requiring Clarification

### 1. Warband Sorting
**Question:** Should the warband list support sorting by name, date created, or point cost?

**Current Assumption:** Warbands are displayed in creation order (most recent first), sorting is a future enhancement.

### 2. Warband Search/Filter
**Question:** Should the warband list support searching or filtering warbands?

**Current Assumption:** No search/filter initially, can be added as future enhancement when user has many warbands.

### 3. Warband Duplication
**Question:** Should users be able to duplicate an existing warband?

**Current Assumption:** No duplication feature initially, users can manually recreate warbands.

### 4. Unsaved Changes Warning
**Question:** Should the system warn users about unsaved changes when navigating away from the editor?

**Current Assumption:** No unsaved changes warning initially, users must explicitly save.

### 5. Warband Export/Import
**Question:** Should users be able to export warbands as files or import from files?

**Current Assumption:** No export/import initially, data is stored locally only.
